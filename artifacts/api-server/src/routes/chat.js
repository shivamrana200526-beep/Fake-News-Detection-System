import { Router } from "express";
import OpenAI from "openai";
import { scrapeUrl } from "../lib/scraper.js";
import { queryAI } from "../lib/ai-service.js";

const router = Router();

const ollama = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1",
  apiKey: "ollama",
});
const MODEL = process.env.OLLAMA_MODEL || "llama3.2:1b";

function detectClaim(text) {
  if (text.length < 8) return false;
  return (
    /\b(is it true|fact.?check|real or fake|true or false|verify|debunk|is this (real|true|fake|accurate|correct)|is .+ (true|real|fake|accurate|happening)|did .+ (say|do|happen|announce)|does .+ (cause|lead to|result in)|are .+ (real|true|accurate)|was .+ (real|faked|staged)|can .+ (really|actually)|i heard that|people say that|someone told me|i saw (that|a)|news say|article says|report says|claim|allegedly|rumor|apparently|supposedly)\b/i.test(text) ||
    /^(is|are|was|were|did|does|do|can|has|have|will|would)\s+\w/i.test(text.trim())
  );
}

function isUrl(text) {
  return /^https?:\/\/\S+/i.test(text.trim());
}

function isLongContent(text) {
  return text.length > 300 || text.split(/[.!?]+/).filter((s) => s.trim().length > 20).length >= 4;
}

function isRecipeOrOffTopic(text) {
  const lower = text.toLowerCase().trim();

  // If user is explicitly fact-checking a food/health myth, let it through
  const isFactCheckIntent = /\b(is it (true|real|fake|safe)|fact.?check|myth|hoax|rumor|does .* cause|is .* toxic|is .* poisonous|debunk|verify|alleged|claim)\b/i.test(lower);
  if (isFactCheckIntent) {
    return false;
  }

  // Detect recipe / cooking instructions / culinary requests
  const recipePatterns = [
    /\b(recipe|recipes)\b/i,
    /\bhow (to|do (i|you)|can (i|we)) (cook|bake|make|prepare|fry|roast|boil|brew|grill)\b/i,
    /\b(ingredients for|cooking instructions|cooking steps|baking instructions|step[- ]by[- ]step recipe)\b/i,
    /\b(how to make (a|an|the|some)?\s*[a-z\s]+(cake|curry|chicken|pasta|pizza|burger|salad|soup|bread|biryani|paneer|dal|roti|tea|coffee|smoothie|sauce|cookie|pie|sandwich|muffin|pancake|brownie|dessert|dish))\b/i
  ];

  return recipePatterns.some((pattern) => pattern.test(lower));
}

async function extractClaims(text) {
  try {
    const response = await ollama.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "Extract the top 3-5 most specific, verifiable factual claims from the given text.\nEach claim should be a single sentence that can be fact-checked independently.\nReturn ONLY a JSON array of strings: ['claim1', 'claim2']. Focus on verifiable facts." },
        { role: "user", content: `Extract verifiable claims from:\n\n"${text.substring(0, 2000)}"` }
      ],
      response_format: { type: "json_object" }
    });
    
    const raw = response.choices[0]?.message?.content?.trim() || "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const claims = match ? JSON.parse(match[0]) : [];
    if (!Array.isArray(claims)) {
      const asObj = JSON.parse(raw);
      if (asObj.claims && Array.isArray(asObj.claims)) return asObj.claims.slice(0, 5);
      return [];
    }
    return claims.slice(0, 5).filter((c) => typeof c === "string" && c.length > 10);
  } catch {
    return [];
  }
}

async function runOllamaAnalysis(claim) {
  const response = await ollama.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: `You are an expert fact-checker. Analyze the claim and return ONLY valid JSON:
{
  "verdict": "Real" | "Fake" | "Misleading" | "Unverifiable",
  "confidence": <0-100>,
  "summary": "<2-3 sentence explanation>",
  "factPoints": [{ "point": "<specific fact>", "status": "verified" | "false" | "disputed" | "unknown" }],
  "contextNote": "<important background context>",
  "logicalIssue": "<logical fallacy or reasoning problem, if any>",
  "redFlags": ["<red flag if any>"],
  "manipulationTactic": "<dominant manipulation tactic used, or null>"
}` },
      { role: "user", content: `Claim: "${claim.substring(0, 1200)}"` }
    ],
    response_format: { type: "json_object" }
  });
  
  const raw = response.choices[0]?.message?.content?.trim() || "{}";
  const match = raw.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : null;
}

async function analyzeOneClaim(claim) {
  const aiResult = await runOllamaAnalysis(claim);
  const verdict = aiResult?.verdict || "Unverifiable";
  const confidence = aiResult?.confidence || 50;
  return { claim, aiResult, consensus: verdict, confidence };
}

function buildPrompt(aiResult, isClaim, claimBreakdowns, scrapedContext) {
  const base = `You are SatyaCheck AI — an expert in forensic fact-checking and misinformation research. "Satya" means Truth in Sanskrit.

Your mission: Investigate claims, debunk viral myths, verify news headlines, and explain the factual evidence clearly to the user.

## Core behavior:
- Always focus on forensic evidence, scientific consensus, and source verification.
- When analyzing a claim, lead with a clear verdict:
  ✅ **VERDICT: REAL**
  ❌ **VERDICT: FAKE**
  ⚠️ **VERDICT: MISLEADING**
  🔍 **VERDICT: UNVERIFIABLE**
- Break down reasoning with specific factual bullet points.
- Explain WHY the claim is true or false using scientific facts and credible authorities.
- If the user asks for a recipe or general off-topic instruction, remind them that your role is forensic claim investigation and offer to fact-check any rumors instead.
- Use clear, engaging language accessible to everyone.`;

  const sections = [base];

  if (scrapedContext) {
    sections.push("\n## ARTICLE CONTENT FETCHED:");
    sections.push(scrapedContext.substring(0, 3000));
  }

  if (isClaim || claimBreakdowns?.length) {
    sections.push("\n## LOCAL AI ANALYSIS RESULTS:");
  }

  if (claimBreakdowns && claimBreakdowns.length > 1) {
    sections.push("\n### MULTI-CLAIM DECOMPOSITION:");
    claimBreakdowns.forEach((cb, i) => {
      sections.push(`**Claim ${i + 1}:** "${cb.claim}"`);
      if (cb.aiResult) {
        sections.push(`  Verdict: ${cb.aiResult.verdict} (${cb.aiResult.confidence}% confidence) — ${cb.aiResult.summary}`);
      }
      sections.push("");
    });
    sections.push("Synthesize all claims into a clear verdict on the content as a whole. Address each claim by number.");
  } else if (aiResult) {
    sections.push(`\n### Analysis: ${aiResult.verdict} (${aiResult.confidence}% confidence)`);
    sections.push(`Summary: ${aiResult.summary}`);
    if (aiResult.factPoints?.length) {
      sections.push("Key facts:");
      aiResult.factPoints.forEach((fp) => sections.push(`  - [${fp.status?.toUpperCase()}] ${fp.point}`));
    }
  }

  sections.push("\nSynthesize all perspectives into one clear, conversational response.");

  return sections.join("\n");
}

router.post("/chat", async (req, res) => {
  const { messages: rawMessages } = req.body;

  if (!rawMessages || !Array.isArray(rawMessages) || rawMessages.length === 0) {
    return res.status(400).json({ message: "messages array is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const chatMessages = rawMessages
      .filter((m) => m.role === "user" || m.role === "model" || m.role === "assistant")
      .map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));

    const lastUserMsg = chatMessages[chatMessages.length - 1]?.content || "";

    // ── Smart Domain Guardrail: Reject recipes & non-verification queries ──
    if (isRecipeOrOffTopic(lastUserMsg)) {
      const declineMsg = `🚫 **Scope Notice: Forensic Fact-Checking Only**\n\nI cannot provide recipes, cooking instructions, or culinary guides.\n\n**SatyaCheck is a specialized Forensic Fact-Checking and Misinformation Defense System.** My sole role is to investigate and verify:\n- 📰 **News Claims** — Investigating breaking headlines, political statements, and viral articles.\n- 📱 **Social Media Rumors** — Verifying forwarded WhatsApp/Telegram messages and online rumors.\n- 🔍 **Media Manipulation** — Identifying deepfakes, doctored media, and selective misquoting.\n- 🛡️ **Source Credibility** — Rating news publishers and domains for factual reliability.\n\n💡 **Food-related rumors I CAN investigate:**\nIf you came across a viral food claim, safety scare, or health myth (for example: *"Is plastic rice being sold in markets?"* or *"Does eating raw garlic immediately cure infections?"*), paste that claim here and I will thoroughly fact-check it with evidence!`;

      const chunks = declineMsg.split(/(\s+)/);
      for (const chunk of chunks) {
        if (chunk) {
          res.write(`data: ${JSON.stringify({ type: "content", content: chunk })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      return res.end();
    }

    let aiResult = null;
    let claimBreakdowns = [];
    let scrapedContext;
    const isClaim = detectClaim(lastUserMsg) || isLongContent(lastUserMsg) || isUrl(lastUserMsg);

    if (isClaim && lastUserMsg.length > 8) {
      res.write(`data: ${JSON.stringify({ type: "analyzing", message: "SatyaCheck is investigating locally..." })}\n\n`);

      if (isUrl(lastUserMsg)) {
        const url = lastUserMsg.trim().split(/\s/)[0];
        const scraped = await scrapeUrl(url).catch(() => null);
        if (scraped?.scrapedOk) {
          const parts = [];
          if (scraped.title) parts.push(`Title: ${scraped.title}`);
          if (scraped.author) parts.push(`Author: ${scraped.author}`);
          if (scraped.text) parts.push(`Body: ${scraped.text.substring(0, 3000)}`);
          scrapedContext = parts.join("\n");

          res.write(`data: ${JSON.stringify({
            type: "scraped",
            article: { title: scraped.title, author: scraped.author, domain: scraped.domain, wordCount: scraped.wordCount },
          })}\n\n`);
        }
      }

      const textToAnalyze = scrapedContext ? `${scrapedContext.substring(0, 2000)}` : lastUserMsg;

      if (isLongContent(textToAnalyze) || scrapedContext) {
        res.write(`data: ${JSON.stringify({ type: "analyzing", message: "Extracting key claims..." })}\n\n`);
        const claims = await extractClaims(textToAnalyze);

        if (claims.length >= 2) {
          res.write(`data: ${JSON.stringify({ type: "analyzing", message: `Verifying ${claims.length} claims locally...` })}\n\n`);
          for (const c of claims.slice(0, 4)) {
            const result = await analyzeOneClaim(c).catch(() => null);
            if (result) claimBreakdowns.push(result);
          }
          if (claimBreakdowns.length > 0) aiResult = claimBreakdowns[0].aiResult;
        } else {
          aiResult = await runOllamaAnalysis(textToAnalyze.substring(0, 1200));
        }
      } else {
        aiResult = await runOllamaAnalysis(lastUserMsg);
      }

      const avgConfidence = claimBreakdowns.length > 0
        ? Math.round(claimBreakdowns.reduce((sum, cb) => sum + cb.confidence, 0) / claimBreakdowns.length)
        : aiResult?.confidence || 0;

      const consensusVerdict = claimBreakdowns.length > 0 ? claimBreakdowns[0].consensus : aiResult?.verdict || "Unverifiable";

      res.write(`data: ${JSON.stringify({
        type: "verdict",
        verdict: {
          consensus: consensusVerdict,
          avgConfidence,
          claim: lastUserMsg.substring(0, 200),
          claimCount: claimBreakdowns.length > 1 ? claimBreakdowns.length : 1,
          claimBreakdowns: claimBreakdowns.length > 1 ? claimBreakdowns.map((cb) => ({ claim: cb.claim.substring(0, 150), consensus: cb.consensus, confidence: cb.confidence })) : undefined,
          gemini: aiResult ? {
                verdict: aiResult.verdict,
                confidence: aiResult.confidence,
                summary: aiResult.summary,
                factPoints: aiResult.factPoints?.slice(0, 4) || [],
                contextNote: aiResult.contextNote || "",
                logicalIssue: aiResult.logicalIssue || null,
              } : null,
        },
      })}\n\n`);
    }

    const systemText = buildPrompt(aiResult, isClaim, claimBreakdowns.length > 1 ? claimBreakdowns : undefined, scrapedContext);
    
    const requestMessages = [
      { role: "system", content: systemText },
      ...chatMessages
    ];

    try {
      const stream = await ollama.chat.completions.create({
        model: MODEL,
        messages: requestMessages,
        stream: true,
      });

      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          res.write(`data: ${JSON.stringify({ type: "content", content: text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      return res.end();
    } catch (ollamaStreamErr) {
      // Fallback to Free Zero-Key Cloud AI for streaming
      const fallbackText = await queryAI({
        messages: requestMessages,
      });

      if (fallbackText) {
        const parts = fallbackText.split(/(\s+)/);
        for (const part of parts) {
          if (part) {
            res.write(`data: ${JSON.stringify({ type: "content", content: part })}\n\n`);
          }
        }
        res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
        return res.end();
      }

      throw ollamaStreamErr;
    }
  } catch (err) {
    req.log?.error({ err }, "Chat failed");
    res.write(`data: ${JSON.stringify({ type: "error", error: "AI service temporarily unavailable. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;

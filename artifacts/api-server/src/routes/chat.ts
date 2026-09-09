import { Router, type IRouter } from "express";
import { anthropic } from "../lib/anthropic";
import { db, conversations, messages } from "@workspace/db";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { scrapeUrl } from "../lib/scraper.js";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  ...(process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
    ? { baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL }
    : {}),
});

const geminiAI = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY || process.env.GEMINI_API_KEY,
  ...(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
    ? { httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL } }
    : {}),
});

// ── Claim detection ──────────────────────────────────────────────────────────

function detectClaim(text: string): boolean {
  if (text.length < 8) return false;
  return (
    /\b(is it true|fact.?check|real or fake|true or false|verify|debunk|is this (real|true|fake|accurate|correct)|is .+ (true|real|fake|accurate|happening)|did .+ (say|do|happen|announce)|does .+ (cause|lead to|result in)|are .+ (real|true|accurate)|was .+ (real|faked|staged)|can .+ (really|actually)|i heard that|people say that|someone told me|i saw (that|a)|news say|article says|report says|claim|allegedly|rumor|apparently|supposedly)\b/i.test(text) ||
    /^(is|are|was|were|did|does|do|can|has|have|will|would)\s+\w/i.test(text.trim())
  );
}

function isUrl(text: string): boolean {
  return /^https?:\/\/\S+/i.test(text.trim());
}

function isLongContent(text: string): boolean {
  return text.length > 300 || text.split(/[.!?]+/).filter((s) => s.trim().length > 20).length >= 4;
}

// ── Claim extraction from long text ─────────────────────────────────────────

async function extractClaims(text: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content: `Extract the top 3-5 most specific, verifiable factual claims from the given text. 
Each claim should be a single sentence that can be fact-checked independently.
Return ONLY a JSON array of strings: ["claim1", "claim2", "claim3"]
Focus on claims about facts, statistics, events, quotes, or scientific assertions — not opinions.`,
        },
        { role: "user", content: `Extract verifiable claims from:\n\n"${text.substring(0, 2000)}"` },
      ],
      max_completion_tokens: 400,
    });
    const raw = completion.choices[0]?.message?.content?.trim() || "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const claims = match ? JSON.parse(match[0]) : [];
    return Array.isArray(claims) ? claims.slice(0, 5).filter((c) => typeof c === "string" && c.length > 10) : [];
  } catch {
    return [];
  }
}

// ── Single claim analysis ────────────────────────────────────────────────────

async function analyzeOneClaim(claim: string): Promise<{
  claim: string;
  gpt: any;
  gemini: any;
  consensus: string;
  confidence: number;
}> {
  const [gptRes, geminiRes] = await Promise.allSettled([
    runGPTAnalysis(claim),
    runGeminiAnalysis(claim),
  ]);

  const gpt = gptRes.status === "fulfilled" ? gptRes.value : null;
  const gemini = geminiRes.status === "fulfilled" ? geminiRes.value : null;

  const verdicts = [gpt?.verdict, gemini?.verdict].filter(Boolean);
  const confidences = [gpt?.confidence, gemini?.confidence].filter((c) => typeof c === "number");
  const avgConf = confidences.length
    ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
    : 50;
  const counts: Record<string, number> = {};
  verdicts.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  const consensus = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unverifiable";

  return { claim, gpt, gemini, consensus, confidence: avgConf };
}

// ── GPT analysis ─────────────────────────────────────────────────────────────

async function runGPTAnalysis(claim: string): Promise<any> {
  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages: [
      {
        role: "system",
        content: `You are an expert fact-checker. Analyze the following claim and return ONLY valid JSON:
{
  "verdict": "Real" | "Fake" | "Misleading" | "Unverifiable",
  "confidence": <0-100>,
  "summary": "<2-3 sentence explanation>",
  "factPoints": [{ "point": "<specific fact>", "status": "verified" | "false" | "disputed" | "unknown" }],
  "redFlags": ["<red flag if any>"],
  "manipulationTactic": "<dominant manipulation tactic used, or null>",
  "howToVerify": "<one practical self-verification tip>"
}
Include 3-5 factPoints. Be precise.`,
      },
      { role: "user", content: `Analyze: "${claim.substring(0, 1200)}"` },
    ],
    max_completion_tokens: 700,
  });
  const raw = completion.choices[0]?.message?.content?.trim() || "{}";
  const match = raw.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : null;
}

// ── Gemini analysis ──────────────────────────────────────────────────────────

async function runGeminiAnalysis(claim: string): Promise<any> {
  const response = await geminiAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
      role: "user",
      parts: [{
        text: `You are an independent fact-checker. Analyze this claim and return ONLY valid JSON:
{
  "verdict": "Real" | "Fake" | "Misleading" | "Unverifiable",
  "confidence": <0-100>,
  "summary": "<2-3 sentence explanation>",
  "factPoints": [{ "point": "<specific fact>", "status": "verified" | "false" | "disputed" | "unknown" }],
  "contextNote": "<important background context>",
  "logicalIssue": "<logical fallacy or reasoning problem, if any>"
}
Include 3-5 factPoints. Claim: "${claim.substring(0, 1200)}"`,
      }],
    }],
  });
  const raw = (response.text ?? "").trim();
  const match = raw.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : null;
}

// ── Claude system prompt builder ─────────────────────────────────────────────

function buildClaudePrompt(
  gpt: any | null,
  gemini: any | null,
  isClaim: boolean,
  claimBreakdowns?: Array<{ claim: string; consensus: string; confidence: number; gpt: any; gemini: any }>,
  scrapedContext?: string
): string {
  const base = `You are SatyaCheck AI — a razor-sharp, friendly expert in fact-checking and misinformation research. "Satya" means Truth in Sanskrit.

Your mission: Help users understand whether news, claims, and viral content is real, fake, or misleading.

## Core behavior:
- Be clear, direct, and conversational — like a trusted, knowledgeable friend
- When analyzing a claim, ALWAYS lead with a clear verdict line:
  ✅ **VERDICT: REAL** — [brief reason]
  ❌ **VERDICT: FAKE** — [brief reason]
  ⚠️ **VERDICT: MISLEADING** — [brief reason]
  🔍 **VERDICT: UNVERIFIABLE** — [brief reason]
- Break down reasoning with specific bullet points
- Call out specific manipulation tactics or logical fallacies by name when detected
- End with a concise "How to verify yourself" tip
- Use plain language accessible to all ages
- If NOT a factual claim, be helpful and educational about media literacy and critical thinking`;

  const sections: string[] = [base];

  if (scrapedContext) {
    sections.push("\n## ARTICLE CONTENT FETCHED (analyze this, not just the URL):");
    sections.push(scrapedContext.substring(0, 3000));
  }

  if (isClaim || claimBreakdowns?.length) {
    sections.push("\n## TRIPLE-AI ANALYSIS RESULTS:");
  }

  if (claimBreakdowns && claimBreakdowns.length > 1) {
    sections.push("\n### MULTI-CLAIM DECOMPOSITION:");
    sections.push("The user's content contains multiple verifiable claims. Here is each analyzed independently:\n");
    claimBreakdowns.forEach((cb, i) => {
      sections.push(`**Claim ${i + 1}:** "${cb.claim}"`);
      sections.push(`  Consensus: ${cb.consensus} (${cb.confidence}% confidence)`);
      if (cb.gpt) sections.push(`  GPT-5 says: ${cb.gpt.verdict} — ${cb.gpt.summary}`);
      if (cb.gemini) sections.push(`  Gemini says: ${cb.gemini.verdict} — ${cb.gemini.summary}`);
      if (cb.gpt?.redFlags?.length) sections.push(`  Red flags: ${cb.gpt.redFlags.join(", ")}`);
      if (cb.gemini?.logicalIssue) sections.push(`  Logical issue: ${cb.gemini.logicalIssue}`);
      sections.push("");
    });
    sections.push("Synthesize all claims into a clear verdict on the content as a whole. Address each claim by number.");
  } else if (gpt || gemini) {
    if (gpt) {
      sections.push(`\n### GPT-5 Analysis: ${gpt.verdict} (${gpt.confidence}% confidence)`);
      sections.push(`Summary: ${gpt.summary}`);
      if (gpt.factPoints?.length) {
        sections.push("Key facts:");
        gpt.factPoints.forEach((fp: any) => sections.push(`  - [${fp.status?.toUpperCase()}] ${fp.point}`));
      }
      if (gpt.redFlags?.length) sections.push(`Red flags: ${gpt.redFlags.join(", ")}`);
      if (gpt.manipulationTactic) sections.push(`Manipulation tactic: ${gpt.manipulationTactic}`);
    }
    if (gemini) {
      sections.push(`\n### Gemini Analysis: ${gemini.verdict} (${gemini.confidence}% confidence)`);
      sections.push(`Summary: ${gemini.summary}`);
      if (gemini.factPoints?.length) {
        sections.push("Key facts:");
        gemini.factPoints.forEach((fp: any) => sections.push(`  - [${fp.status?.toUpperCase()}] ${fp.point}`));
      }
      if (gemini.contextNote) sections.push(`Context: ${gemini.contextNote}`);
      if (gemini.logicalIssue) sections.push(`Logical issue: ${gemini.logicalIssue}`);
    }

    const verdicts = [gpt?.verdict, gemini?.verdict].filter(Boolean);
    const counts: Record<string, number> = {};
    verdicts.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    if (top) sections.push(`\n### Consensus: ${top[0]} (${top[1]}/${verdicts.length} AIs agree)`);
  }

  sections.push("\nSynthesize all perspectives into one clear, well-reasoned, conversational response. Don't mechanically list AI outputs — guide the user to the truth with specific evidence and clear reasoning.");

  return sections.join("\n");
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.post("/chat", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "messages array is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const chatMessages = messages
      .filter((m: any) => m.role === "user" || m.role === "assistant")
      .map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content as string }));

    const lastUserMsg = chatMessages.findLast((m: any) => m.role === "user")?.content || "";

    let gptResult: any = null;
    let geminiResult: any = null;
    let claimBreakdowns: Array<{ claim: string; consensus: string; confidence: number; gpt: any; gemini: any }> = [];
    let scrapedContext: string | undefined;
    const isClaim = detectClaim(lastUserMsg) || isLongContent(lastUserMsg) || isUrl(lastUserMsg);

    if (isClaim && lastUserMsg.length > 8) {
      res.write(`data: ${JSON.stringify({ type: "analyzing", message: "SatyaCheck is investigating..." })}\n\n`);

      // ── URL scraping ─────────────────────────────────────────────────────────
      if (isUrl(lastUserMsg)) {
        const url = lastUserMsg.trim().split(/\s/)[0];
        const scraped = await scrapeUrl(url).catch(() => null);
        if (scraped?.scrapedOk) {
          const parts: string[] = [];
          if (scraped.title) parts.push(`Title: ${scraped.title}`);
          if (scraped.author) parts.push(`Author: ${scraped.author}`);
          if (scraped.text) parts.push(`Body: ${scraped.text.substring(0, 3000)}`);
          scrapedContext = parts.join("\n");

          res.write(`data: ${JSON.stringify({
            type: "scraped",
            article: {
              title: scraped.title,
              author: scraped.author,
              domain: scraped.domain,
              wordCount: scraped.wordCount,
            },
          })}\n\n`);
        }
      }

      // ── Multi-claim decomposition for long content ────────────────────────────
      const textToAnalyze = scrapedContext
        ? `${scrapedContext.substring(0, 2000)}`
        : lastUserMsg;

      if (isLongContent(textToAnalyze) || scrapedContext) {
        res.write(`data: ${JSON.stringify({ type: "analyzing", message: "Extracting key claims..." })}\n\n`);
        const claims = await extractClaims(textToAnalyze);

        if (claims.length >= 2) {
          res.write(`data: ${JSON.stringify({ type: "analyzing", message: `Verifying ${claims.length} claims independently...` })}\n\n`);
          // Verify all claims in parallel (up to 4 to avoid rate limits)
          const results = await Promise.allSettled(claims.slice(0, 4).map((c) => analyzeOneClaim(c)));
          claimBreakdowns = results
            .filter((r) => r.status === "fulfilled")
            .map((r: any) => r.value);

          // Use the first claim's result as the primary for the verdict card
          if (claimBreakdowns.length > 0) {
            gptResult = claimBreakdowns[0].gpt;
            geminiResult = claimBreakdowns[0].gemini;
          }
        } else {
          // Single short claim — run both AIs in parallel
          const [gptS, geminiS] = await Promise.allSettled([
            runGPTAnalysis(textToAnalyze.substring(0, 1200)),
            runGeminiAnalysis(textToAnalyze.substring(0, 1200)),
          ]);
          if (gptS.status === "fulfilled") gptResult = gptS.value;
          if (geminiS.status === "fulfilled") geminiResult = geminiS.value;
        }
      } else {
        const [gptS, geminiS] = await Promise.allSettled([
          runGPTAnalysis(lastUserMsg),
          runGeminiAnalysis(lastUserMsg),
        ]);
        if (gptS.status === "fulfilled") gptResult = gptS.value;
        if (geminiS.status === "fulfilled") geminiResult = geminiS.value;
      }

      // ── Build verdict card ───────────────────────────────────────────────────
      const verdicts = [
        ...claimBreakdowns.map((c) => c.consensus),
        gptResult?.verdict,
        geminiResult?.verdict,
      ].filter(Boolean);

      const confidences = [
        ...claimBreakdowns.map((c) => c.confidence),
        gptResult?.confidence,
        geminiResult?.confidence,
      ].filter((c): c is number => typeof c === "number");

      const avgConfidence = confidences.length
        ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
        : 0;

      const counts: Record<string, number> = {};
      verdicts.forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
      const consensusVerdict = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unverifiable";

      res.write(`data: ${JSON.stringify({
        type: "verdict",
        verdict: {
          consensus: consensusVerdict,
          avgConfidence,
          claim: lastUserMsg.substring(0, 200),
          claimCount: claimBreakdowns.length > 1 ? claimBreakdowns.length : 1,
          claimBreakdowns: claimBreakdowns.length > 1
            ? claimBreakdowns.map((cb) => ({
                claim: cb.claim.substring(0, 150),
                consensus: cb.consensus,
                confidence: cb.confidence,
              }))
            : undefined,
          gpt: gptResult
            ? {
                verdict: gptResult.verdict,
                confidence: gptResult.confidence,
                summary: gptResult.summary,
                factPoints: gptResult.factPoints?.slice(0, 4) || [],
                redFlags: gptResult.redFlags || [],
                manipulationTactic: gptResult.manipulationTactic || null,
              }
            : null,
          gemini: geminiResult
            ? {
                verdict: geminiResult.verdict,
                confidence: geminiResult.confidence,
                summary: geminiResult.summary,
                factPoints: geminiResult.factPoints?.slice(0, 4) || [],
                contextNote: geminiResult.contextNote || "",
                logicalIssue: geminiResult.logicalIssue || null,
              }
            : null,
        },
      })}\n\n`);
    }

    // ── Stream Claude's synthesis ─────────────────────────────────────────────
    const system = buildClaudePrompt(
      gptResult,
      geminiResult,
      isClaim,
      claimBreakdowns.length > 1 ? claimBreakdowns : undefined,
      scrapedContext
    );

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      system,
      messages: chatMessages,
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        res.write(`data: ${JSON.stringify({ type: "content", content: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
    res.end();
  } catch (err: any) {
    req.log?.error({ err }, "Chat failed");
    res.write(`data: ${JSON.stringify({ type: "error", error: "AI analysis failed. Please try again." })}\n\n`);
    res.end();
  }
});

export default router;

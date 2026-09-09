import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";
import { db, conversations, messages } from "@workspace/db";
import { scrapeUrl } from "../lib/scraper.js";

const router: IRouter = Router();

const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
});

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

async function extractClaims(text: string): Promise<string[]> {
  try {
    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `Extract the top 3-5 most specific, verifiable factual claims from the given text.\nEach claim should be a single sentence that can be fact-checked independently.\nReturn ONLY a JSON array of strings: ["claim1", "claim2", "claim3"]\nFocus on claims about facts, statistics, events, quotes, or scientific assertions — not opinions.\n\nExtract verifiable claims from:\n\n"${text.substring(0, 2000)}"`
        }]
      }]
    });
    const raw = (response.text ?? "").trim() || "[]";
    const match = raw.match(/\[[\s\S]*\]/);
    const claims = match ? JSON.parse(match[0]) : [];
    return Array.isArray(claims) ? claims.slice(0, 5).filter((c) => typeof c === "string" && c.length > 10) : [];
  } catch {
    return [];
  }
}

async function analyzeOneClaim(claim: string): Promise<{
  claim: string;
  gemini: any;
  consensus: string;
  confidence: number;
}> {
  const gemini = await runGeminiAnalysis(claim);
  const verdict = gemini?.verdict || "Unverifiable";
  const confidence = gemini?.confidence || 50;

  return { claim, gemini, consensus: verdict, confidence };
}

async function runGeminiAnalysis(claim: string): Promise<any> {
  const response = await geminiAI.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{
      role: "user",
      parts: [{
        text: `You are an expert fact-checker. Analyze the following claim and return ONLY valid JSON:
{
  "verdict": "Real" | "Fake" | "Misleading" | "Unverifiable",
  "confidence": <0-100>,
  "summary": "<2-3 sentence explanation>",
  "factPoints": [{ "point": "<specific fact>", "status": "verified" | "false" | "disputed" | "unknown" }],
  "contextNote": "<important background context>",
  "logicalIssue": "<logical fallacy or reasoning problem, if any>",
  "redFlags": ["<red flag if any>"],
  "manipulationTactic": "<dominant manipulation tactic used, or null>"
}
Include 3-5 factPoints. Claim: "${claim.substring(0, 1200)}"`
      }],
    }],
  });
  const raw = (response.text ?? "").trim();
  const match = raw.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : null;
}

function buildPrompt(
  gemini: any | null,
  isClaim: boolean,
  claimBreakdowns?: Array<{ claim: string; consensus: string; confidence: number; gemini: any }>,
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
    sections.push("\n## AI ANALYSIS RESULTS:");
  }

  if (claimBreakdowns && claimBreakdowns.length > 1) {
    sections.push("\n### MULTI-CLAIM DECOMPOSITION:");
    sections.push("The user's content contains multiple verifiable claims. Here is each analyzed independently:\n");
    claimBreakdowns.forEach((cb, i) => {
      sections.push(`**Claim ${i + 1}:** "${cb.claim}"`);
      if (cb.gemini) {
        sections.push(`  Verdict: ${cb.gemini.verdict} (${cb.gemini.confidence}% confidence) — ${cb.gemini.summary}`);
        if (cb.gemini.redFlags?.length) sections.push(`  Red flags: ${cb.gemini.redFlags.join(", ")}`);
        if (cb.gemini.logicalIssue) sections.push(`  Logical issue: ${cb.gemini.logicalIssue}`);
      }
      sections.push("");
    });
    sections.push("Synthesize all claims into a clear verdict on the content as a whole. Address each claim by number.");
  } else if (gemini) {
    sections.push(`\n### Analysis: ${gemini.verdict} (${gemini.confidence}% confidence)`);
    sections.push(`Summary: ${gemini.summary}`);
    if (gemini.factPoints?.length) {
      sections.push("Key facts:");
      gemini.factPoints.forEach((fp: any) => sections.push(`  - [${fp.status?.toUpperCase()}] ${fp.point}`));
    }
    if (gemini.contextNote) sections.push(`Context: ${gemini.contextNote}`);
    if (gemini.logicalIssue) sections.push(`Logical issue: ${gemini.logicalIssue}`);
    if (gemini.redFlags?.length) sections.push(`Red flags: ${gemini.redFlags.join(", ")}`);
    if (gemini.manipulationTactic) sections.push(`Manipulation tactic: ${gemini.manipulationTactic}`);
  }

  sections.push("\nSynthesize all perspectives into one clear, well-reasoned, conversational response. Don't mechanically list AI outputs — guide the user to the truth with specific evidence and clear reasoning.");

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
      .filter((m: any) => m.role === "user" || m.role === "model" || m.role === "assistant")
      .map((m: any) => ({ role: m.role === "user" ? "user" : "model", text: m.content as string }));

    const lastUserMsg = chatMessages[chatMessages.length - 1]?.text || "";

    let geminiResult: any = null;
    let claimBreakdowns: Array<{ claim: string; consensus: string; confidence: number; gemini: any }> = [];
    let scrapedContext: string | undefined;
    const isClaim = detectClaim(lastUserMsg) || isLongContent(lastUserMsg) || isUrl(lastUserMsg);

    if (isClaim && lastUserMsg.length > 8) {
      res.write(`data: ${JSON.stringify({ type: "analyzing", message: "SatyaCheck is investigating..." })}\n\n`);

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

      const textToAnalyze = scrapedContext
        ? `${scrapedContext.substring(0, 2000)}`
        : lastUserMsg;

      if (isLongContent(textToAnalyze) || scrapedContext) {
        res.write(`data: ${JSON.stringify({ type: "analyzing", message: "Extracting key claims..." })}\n\n`);
        const claims = await extractClaims(textToAnalyze);

        if (claims.length >= 2) {
          res.write(`data: ${JSON.stringify({ type: "analyzing", message: `Verifying ${claims.length} claims independently...` })}\n\n`);
          const results = await Promise.allSettled(claims.slice(0, 4).map((c) => analyzeOneClaim(c)));
          claimBreakdowns = results
            .filter((r) => r.status === "fulfilled")
            .map((r: any) => r.value);

          if (claimBreakdowns.length > 0) {
            geminiResult = claimBreakdowns[0].gemini;
          }
        } else {
          geminiResult = await runGeminiAnalysis(textToAnalyze.substring(0, 1200));
        }
      } else {
        geminiResult = await runGeminiAnalysis(lastUserMsg);
      }

      const avgConfidence = claimBreakdowns.length > 0
        ? Math.round(claimBreakdowns.reduce((sum, cb) => sum + cb.confidence, 0) / claimBreakdowns.length)
        : geminiResult?.confidence || 0;

      const consensusVerdict = claimBreakdowns.length > 0
        ? claimBreakdowns[0].consensus
        : geminiResult?.verdict || "Unverifiable";

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

    const systemText = buildPrompt(
      geminiResult,
      isClaim,
      claimBreakdowns.length > 1 ? claimBreakdowns : undefined,
      scrapedContext
    );

    const history = chatMessages.slice(0, -1).map((m: any) => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));
    
    const contents = [
      ...history,
      { role: "user", parts: [{ text: `${systemText}\n\nUser message: ${lastUserMsg}` }] }
    ];

    const responseStream = await geminiAI.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ type: "content", content: chunk.text })}\n\n`);
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

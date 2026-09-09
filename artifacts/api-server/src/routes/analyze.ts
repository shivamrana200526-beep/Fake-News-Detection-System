import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { db } from "@workspace/db";
import { analyses, analysisResults } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
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

// ── Prompt builders ──────────────────────────────────────────────────────────

const TEXT_SYSTEM = `You are a senior forensic fact-checker with expertise in misinformation research, media literacy, and cognitive bias detection. Analyze news content across 10 dimensions and return ONLY valid JSON.

{
  "prediction": "Real" | "Fake" | "Misleading",
  "confidence": <0-100>,
  "explanation": "<3-4 sentence comprehensive verdict>",
  "keywords": ["<entity or theme>"],
  "detectedSource": { "name": "<publication name or Unknown>", "url": "<url or #>" },
  "additionalSources": [{ "name": "<name>", "url": "<url>" }],
  "factBreakdown": [
    { "category": "<dimension>", "detail": "<specific observation>", "status": "real" | "fake" | "misleading" | "unverified" }
  ],
  "manipulationScore": <0-100>,
  "emotionalTactics": ["<specific tactic used>"],
  "logicalFallacies": ["<specific fallacy detected>"],
  "headlineMatchesContent": true | false | null,
  "authorCredibility": "<assessment of author/source credibility>",
  "missingContext": "<important context the content leaves out>"
}

Manipulation score guide: 0=none, 20=mild, 40=moderate, 60=significant, 80=heavy, 100=extreme
Emotional tactics: fear appeal, false urgency, outrage bait, appeal to authority, us-vs-them, cherry picking, appeal to nature, emotional anecdote, demonization, false balance
Logical fallacies: ad hominem, straw man, false dichotomy, slippery slope, appeal to ignorance, hasty generalization, post hoc, circular reasoning, red herring, bandwagon

Include 4-6 factBreakdown items covering the most critical claims.`;

const IMAGE_SYSTEM = `You are an expert AI image forensics analyst. Detect manipulation, AI generation, deepfakes, and out-of-context use. Return ONLY valid JSON.

{
  "prediction": "Real" | "Fake" | "Misleading",
  "confidence": <0-100>,
  "explanation": "<3-4 sentence forensic verdict>",
  "keywords": ["<visual element or context>"],
  "detectedSource": { "name": "Unknown", "url": "#" },
  "additionalSources": [],
  "factBreakdown": [
    { "category": "<forensic dimension>", "detail": "<specific observation>", "status": "real" | "fake" | "misleading" | "unverified" }
  ],
  "manipulationScore": <0-100>,
  "emotionalTactics": ["<visual manipulation tactic if any>"],
  "logicalFallacies": [],
  "headlineMatchesContent": null,
  "authorCredibility": "Image source: <assessment>",
  "missingContext": "<what context is missing from this image>"
}

Forensic dimensions to check: lighting consistency, shadow direction, edge artifacts, facial anatomy (if people), background coherence, metadata cues, AI generation patterns, known template reuse, out-of-context repurposing.`;

// ── GPT Analysis ─────────────────────────────────────────────────────────────

async function runGPTAnalysis(
  content: string,
  type: string,
  imageBase64?: string,
  articleContext?: string
): Promise<any> {
  let messages: OpenAI.ChatCompletionMessageParam[];

  if (type === "image" && imageBase64) {
    const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    messages = [
      { role: "system", content: IMAGE_SYSTEM },
      {
        role: "user",
        content: [
          { type: "text", text: "Perform a full forensic analysis of this image:" },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } },
        ],
      },
    ];
  } else {
    const body = articleContext
      ? `Article scraped from: ${content}\n\n${articleContext}`
      : `${type.toUpperCase()}: "${content.substring(0, 3000)}"`;
    messages = [
      { role: "system", content: TEXT_SYSTEM },
      { role: "user", content: `Analyze this content:\n\n${body}` },
    ];
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-5.2",
    messages,
    max_completion_tokens: 1200,
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "{}";
  const match = raw.match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : {};
}

// ── Gemini Analysis ──────────────────────────────────────────────────────────

async function runGeminiAnalysis(
  content: string,
  type: string,
  gptPrediction: string,
  imageBase64?: string,
  articleContext?: string
): Promise<any> {
  const isImage = type === "image" && imageBase64;

  const systemNote = isImage
    ? `GPT-5 forensic verdict: "${gptPrediction}". Independently analyze this image.`
    : `GPT-5 prediction: "${gptPrediction}". Independently verify — do NOT just confirm GPT.`;

  const textPrompt = isImage
    ? `${IMAGE_SYSTEM}\n\n${systemNote}`
    : `${TEXT_SYSTEM}\n\n${systemNote}\n\nContent to analyze:\n${
        articleContext
          ? `Article from ${content}:\n${articleContext}`
          : `${type.toUpperCase()}: "${content.substring(0, 3000)}"`
      }`;

  try {
    let response;

    if (isImage && imageBase64) {
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = (mimeMatch ? mimeMatch[1] : "image/jpeg") as string;
      const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      response = await geminiAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{
          role: "user",
          parts: [
            { text: textPrompt },
            { inlineData: { data: base64Data, mimeType } },
          ],
        }],
      });
    } else {
      response = await geminiAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: textPrompt }] }],
      });
    }

    const text = (response.text ?? "").trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
  } catch {
    return null;
  }
}

// ── Consensus builder ────────────────────────────────────────────────────────

function buildConsensus(gpt: any, gemini: any) {
  const gptV = (gpt?.prediction || "").toLowerCase();
  const gemV = (gemini?.verdict || gemini?.prediction || "").toLowerCase();
  const gptC = Number(gpt?.confidence || 50);
  const gemC = Number(gemini?.confidence || 50);

  // Weighted average confidence (GPT weight 0.55, Gemini 0.45)
  const blendedConf = Math.round(gptC * 0.55 + gemC * 0.45);

  // If both agree, boost confidence slightly
  let finalPrediction = gpt?.prediction || "Misleading";
  if (gptV === gemV) {
    finalPrediction = gpt.prediction;
  } else {
    // Disagreement: pick the more confident AI
    finalPrediction = gptC >= gemC ? gpt.prediction : (gemini?.verdict || gemini?.prediction || gpt.prediction);
  }

  // Merge manipulation scores
  const gptMS = Number(gpt?.manipulationScore ?? 0);
  const gemMS = Number(gemini?.manipulationScore ?? 0);
  const manipulationScore = Math.round((gptMS + gemMS) / 2) || gptMS || gemMS;

  // Merge tactics + fallacies (deduplicate)
  const emotionalTactics = Array.from(new Set([
    ...(Array.isArray(gpt?.emotionalTactics) ? gpt.emotionalTactics : []),
    ...(Array.isArray(gemini?.emotionalTactics) ? gemini.emotionalTactics : []),
  ]));
  const logicalFallacies = Array.from(new Set([
    ...(Array.isArray(gpt?.logicalFallacies) ? gpt.logicalFallacies : []),
    ...(Array.isArray(gemini?.logicalFallacies) ? gemini.logicalFallacies : []),
  ]));

  return {
    finalPrediction,
    blendedConf,
    manipulationScore,
    emotionalTactics,
    logicalFallacies,
  };
}

// ── Route ─────────────────────────────────────────────────────────────────────

router.post("/analyze", async (req, res) => {
  try {
    const { content, type } = req.body;
    if (!content || !type) {
      return res.status(400).json({ message: "content and type are required" });
    }

    const isImage = type === "image";
    const imageBase64 = isImage ? content : undefined;

    // ── URL: scrape article content first ─────────────────────────────────────
    let articleContext: string | undefined;
    let scrapedMeta: any = null;

    if (type === "url") {
      try {
        const scraped = await scrapeUrl(content);
        if (scraped.scrapedOk) {
          scrapedMeta = scraped;
          const parts: string[] = [];
          if (scraped.title) parts.push(`Title: ${scraped.title}`);
          if (scraped.author) parts.push(`Author: ${scraped.author}`);
          if (scraped.publishDate) parts.push(`Published: ${scraped.publishDate}`);
          if (scraped.description) parts.push(`Description: ${scraped.description}`);
          parts.push(`\nArticle body (${scraped.wordCount} words):\n${scraped.text.substring(0, 4000)}`);
          articleContext = parts.join("\n");
        }
      } catch {
        // Scraping failed silently — fall back to URL-only analysis
      }
    }

    // ── Run GPT + Gemini in parallel ───────────────────────────────────────────
    const [gptResult, geminiResult] = await Promise.allSettled([
      runGPTAnalysis(content, type, imageBase64, articleContext),
      // Gemini needs GPT's prediction for independent cross-check — run GPT first in a micro-wait
      (async () => {
        // Small delay so GPT finishes first (usually), but still runs in parallel
        await new Promise((r) => setTimeout(r, 800));
        const gptSnapshot = await runGPTAnalysis(content, type, imageBase64, articleContext).catch(() => ({}));
        return runGeminiAnalysis(content, type, gptSnapshot?.prediction || "Unknown", imageBase64, articleContext);
      })(),
    ]);

    const gpt = gptResult.status === "fulfilled" ? gptResult.value : {};
    const gemini = geminiResult.status === "fulfilled" ? geminiResult.value : null;

    const { finalPrediction, blendedConf, manipulationScore, emotionalTactics, logicalFallacies } =
      buildConsensus(gpt, gemini);

    const prediction = finalPrediction;
    const confidence = Math.min(100, Math.max(0, blendedConf));
    const explanation = gpt?.explanation || "Analysis complete.";
    const keywords = Array.isArray(gpt?.keywords) ? gpt.keywords : [];
    const detectedSource = gpt?.detectedSource || (scrapedMeta ? { name: scrapedMeta.domain, url: content } : { name: "Unknown", url: "#" });
    const additionalSources = Array.isArray(gpt?.additionalSources) ? gpt.additionalSources : [];
    const factBreakdown = Array.isArray(gpt?.factBreakdown) ? gpt.factBreakdown : null;

    // Build gemini verification in legacy format for backward compat
    const geminiVerification = gemini
      ? {
          verdict: gemini.verdict || gemini.prediction || prediction,
          confidence: Number(gemini.confidence || confidence),
          reasoning: gemini.explanation || "",
          factPoints: Array.isArray(gemini.factBreakdown)
            ? gemini.factBreakdown.map((fp: any) => ({ point: fp.detail, status: fp.status === "real" ? "verified" : fp.status === "fake" ? "false" : fp.status || "unknown" }))
            : [],
        }
      : null;

    // ── Persist ────────────────────────────────────────────────────────────────
    const [newAnalysis] = await db.insert(analyses).values({
      content: isImage ? "[Image Upload]" : content,
      sourceType: type,
      prediction,
      confidence,
      explanation,
      keywords,
      detectedSource,
      additionalSources,
      mediaType: type,
      geminiVerification,
      factBreakdown,
    }).returning();

    await db.insert(analysisResults).values({
      analysisId: newAnalysis.id,
      verifiedArticles: [],
    });

    return res.json({
      ...newAnalysis,
      verifiedArticles: [],
      // Enhanced intelligence fields
      manipulationScore,
      emotionalTactics,
      logicalFallacies,
      headlineMatchesContent: gpt?.headlineMatchesContent ?? null,
      authorCredibility: gpt?.authorCredibility || null,
      missingContext: gpt?.missingContext || null,
      scrapedArticle: scrapedMeta
        ? {
            title: scrapedMeta.title,
            author: scrapedMeta.author,
            publishDate: scrapedMeta.publishDate,
            wordCount: scrapedMeta.wordCount,
            domain: scrapedMeta.domain,
          }
        : null,
    });
  } catch (err: any) {
    req.log.error({ err }, "Analysis failed");
    return res.status(500).json({ message: "Analysis failed. Please try again." });
  }
});

// ── Stats + History ───────────────────────────────────────────────────────────

router.get("/stats", async (req, res) => {
  try {
    const total = await db.select({ count: sql<number>`count(*)` }).from(analyses);
    const real = await db.select({ count: sql<number>`count(*)` }).from(analyses).where(eq(analyses.prediction, "Real"));
    const fake = await db.select({ count: sql<number>`count(*)` }).from(analyses).where(eq(analyses.prediction, "Fake"));
    const misleading = await db.select({ count: sql<number>`count(*)` }).from(analyses).where(eq(analyses.prediction, "Misleading"));

    const trending = await db.execute(sql`
      SELECT unnest(keywords) as topic, count(*) as count
      FROM analyses
      GROUP BY topic
      ORDER BY count DESC
      LIMIT 5
    `);

    return res.json({
      total: Number(total[0]?.count || 0),
      realCount: Number(real[0]?.count || 0),
      fakeCount: Number(fake[0]?.count || 0),
      misleadingCount: Number(misleading[0]?.count || 0),
      trendingTopics: trending.rows.map((row: any) => ({
        topic: row.topic,
        count: Number(row.count),
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch stats");
    return res.status(500).json({ message: "Failed to fetch stats." });
  }
});

router.get("/history", async (req, res) => {
  try {
    const history = await db
      .select()
      .from(analyses)
      .orderBy(desc(analyses.createdAt))
      .limit(20);
    return res.json(history);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch history");
    return res.status(500).json({ message: "Failed to fetch history." });
  }
});

export default router;

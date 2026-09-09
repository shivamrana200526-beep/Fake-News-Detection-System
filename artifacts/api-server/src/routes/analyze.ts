import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";
import { db } from "@workspace/db";
import { analyses, analysisResults } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { scrapeUrl } from "../lib/scraper.js";

const router: IRouter = Router();

const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `You are a senior forensic fact-checker with expertise in misinformation research, media literacy, and cognitive bias detection. Analyze news content across 10 dimensions and return ONLY valid JSON.

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

async function runGeminiAnalysis(
  content: string,
  type: string,
  imageBase64?: string,
  articleContext?: string
): Promise<any> {
  const isImage = type === "image" && imageBase64;
  const textPrompt = `${SYSTEM_PROMPT}\n\nContent to analyze:\n${
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
  } catch (err) {
    console.error("Gemini analysis error:", err);
    return null;
  }
}

router.post("/analyze", async (req, res) => {
  try {
    const { content, type } = req.body;
    if (!content || !type) {
      return res.status(400).json({ message: "content and type are required" });
    }

    const isImage = type === "image";
    const imageBase64 = isImage ? content : undefined;

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

    const result = await runGeminiAnalysis(content, type, imageBase64, articleContext);

    const prediction = result?.prediction || "Unknown";
    const confidence = Number(result?.confidence || 50);
    const explanation = result?.explanation || "Analysis complete.";
    const keywords = Array.isArray(result?.keywords) ? result.keywords : [];
    const detectedSource = result?.detectedSource || (scrapedMeta ? { name: scrapedMeta.domain, url: content } : { name: "Unknown", url: "#" });
    const additionalSources = Array.isArray(result?.additionalSources) ? result.additionalSources : [];
    const factBreakdown = Array.isArray(result?.factBreakdown) ? result.factBreakdown : null;

    const geminiVerification = result
      ? {
          verdict: result.prediction,
          confidence: Number(result.confidence || 50),
          reasoning: result.explanation || "",
          factPoints: Array.isArray(result.factBreakdown)
            ? result.factBreakdown.map((fp: any) => ({ point: fp.detail, status: fp.status === "real" ? "verified" : fp.status === "fake" ? "false" : fp.status || "unknown" }))
            : [],
        }
      : null;

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
      manipulationScore: result?.manipulationScore || 0,
      emotionalTactics: result?.emotionalTactics || [],
      logicalFallacies: result?.logicalFallacies || [],
      headlineMatchesContent: result?.headlineMatchesContent ?? null,
      authorCredibility: result?.authorCredibility || null,
      missingContext: result?.missingContext || null,
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

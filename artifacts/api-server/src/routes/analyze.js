import { Router } from "express";
import OpenAI from "openai";
import fs from "node:fs";
import path from "node:path";
import { db } from "@workspace/db";
import { analyses, analysisResults } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { scrapeUrl } from "../lib/scraper.js";
import { queryAI, runHeuristicFactCheck } from "../lib/ai-service.js";

const router = Router();

const STORAGE_FILE = path.resolve(process.cwd(), "analyses-storage.json");

function loadLocalAnalyses() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      return JSON.parse(fs.readFileSync(STORAGE_FILE, "utf-8"));
    }
  } catch {}
  return [];
}

function saveLocalAnalysis(entry) {
  try {
    const list = loadLocalAnalyses();
    list.unshift(entry);
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(list.slice(0, 100), null, 2), "utf-8");
  } catch {}
}

const ollama = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1",
  apiKey: "ollama",
});
const MODEL = process.env.OLLAMA_MODEL || "llama3.2:1b";

const SYSTEM_PROMPT = `You are a forensic fact-checker. Analyze news/claims and return ONLY a valid JSON object:
{
  "prediction": "Real" | "Fake" | "Misleading",
  "confidence": <0-100>,
  "explanation": "<concise 1-2 sentence core verdict>",
  "keywords": ["<top 2-3 keywords>"],
  "detectedSource": { "name": "<publication or Unknown>", "url": "<url or #>" },
  "additionalSources": [{ "name": "<source>", "url": "<url>" }],
  "factBreakdown": [
    { "category": "<claim|source|context>", "detail": "<1 sentence key fact>", "status": "real" | "fake" | "misleading" | "unverified" }
  ],
  "manipulationScore": <0-100>,
  "emotionalTactics": ["<tactic if any>"],
  "logicalFallacies": ["<fallacy if any>"],
  "headlineMatchesContent": true | false | null,
  "authorCredibility": "<credible|questionable|unverified>",
  "missingContext": "<brief omitted context if any, or null>"
}
Keep factBreakdown to 2-3 items max. Be concise, punchy, and fast.`;

async function runOllamaAnalysis(content, type, imageBase64, articleContext) {
  const isImage = type === "image" && imageBase64;
  const userPrompt = `Content to analyze:
${
  articleContext
    ? `Article from ${content}:
${articleContext}`
    : `${type.toUpperCase()}: "${content.substring(0, 3000)}"`
}`;

  try {
    let messages = [];

    if (isImage && imageBase64) {
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
      const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analyze this image and extract any claims or manipulation:" },
          { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Data}` } }
        ]
      });
    } else {
      messages.push({ role: "user", content: userPrompt });
    }

    const aiResult = await queryAI({
      messages,
      systemPrompt: SYSTEM_PROMPT,
      jsonMode: true,
    });

    if (aiResult && aiResult.prediction) {
      return aiResult;
    }
  } catch (err) {
    console.error("AI analysis error:", err);
  }

  // Fallback to built-in rule-based forensic analyzer (offline / zero external calls)
  return runHeuristicFactCheck(content);
}

router.post("/analyze", async (req, res) => {
  try {
    const { content, type } = req.body;
    if (!content || !type) {
      return res.status(400).json({ message: "content and type are required" });
    }

    const isImage = type === "image";
    const imageBase64 = isImage ? content : undefined;

    let articleContext;
    let scrapedMeta = null;

    if (type === "url") {
      try {
        const scraped = await scrapeUrl(content);
        if (scraped.scrapedOk) {
          scrapedMeta = scraped;
          const parts = [];
          if (scraped.title) parts.push(`Title: ${scraped.title}`);
          if (scraped.author) parts.push(`Author: ${scraped.author}`);
          if (scraped.publishDate) parts.push(`Published: ${scraped.publishDate}`);
          if (scraped.description) parts.push(`Description: ${scraped.description}`);
          parts.push(`\nArticle body (${scraped.wordCount} words):\n${scraped.text.substring(0, 4000)}`);
          articleContext = parts.join("\n");
        }
      } catch {}
    }

    const result = await runOllamaAnalysis(content, type, imageBase64, articleContext);

    const prediction = result?.prediction || "Unknown";
    const confidence = Number(result?.confidence || 50);
    const explanation = result?.explanation || "Analysis complete. Make sure Ollama is running and has the required model.";
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
            ? result.factBreakdown.map((fp) => ({ point: fp.detail, status: fp.status === "real" ? "verified" : fp.status === "fake" ? "false" : fp.status || "unknown" }))
            : [],
        }
      : null;

    let newAnalysis = null;
    try {
      if (db) {
        const [inserted] = await db.insert(analyses).values({
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
        newAnalysis = inserted;

        await db.insert(analysisResults).values({
          analysisId: newAnalysis.id,
          verifiedArticles: [],
        });
      } else {
        throw new Error("DB not configured");
      }
    } catch (dbErr) {
      newAnalysis = {
        id: Date.now(),
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
        createdAt: new Date().toISOString(),
      };
      saveLocalAnalysis(newAnalysis);
    }

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
  } catch (err) {
    req.log.error({ err }, "Analysis failed");
    return res.status(500).json({ message: "Analysis failed. Please ensure Ollama is running locally." });
  }
});

router.get("/stats", async (req, res) => {
  try {
    if (!db) throw new Error("DB not configured");
    const total = await db.select({ count: sql`count(*)` }).from(analyses);
    const real = await db.select({ count: sql`count(*)` }).from(analyses).where(eq(analyses.prediction, "Real"));
    const fake = await db.select({ count: sql`count(*)` }).from(analyses).where(eq(analyses.prediction, "Fake"));
    const misleading = await db.select({ count: sql`count(*)` }).from(analyses).where(eq(analyses.prediction, "Misleading"));

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
      trendingTopics: trending.rows.map((row) => ({
        topic: row.topic,
        count: Number(row.count),
      })),
    });
  } catch (err) {
    const list = loadLocalAnalyses();
    const total = list.length;
    const realCount = list.filter((a) => a.prediction?.toLowerCase() === "real").length;
    const fakeCount = list.filter((a) => a.prediction?.toLowerCase() === "fake").length;
    const misleadingCount = list.filter((a) => a.prediction?.toLowerCase() === "misleading").length;

    const topicCounts = {};
    for (const item of list) {
      if (Array.isArray(item.keywords)) {
        for (const k of item.keywords) {
          topicCounts[k] = (topicCounts[k] || 0) + 1;
        }
      }
    }
    const trendingTopics = Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    return res.json({
      total,
      realCount,
      fakeCount,
      misleadingCount,
      trendingTopics,
    });
  }
});

router.get("/history", async (req, res) => {
  try {
    if (!db) throw new Error("DB not configured");
    const history = await db
      .select()
      .from(analyses)
      .orderBy(desc(analyses.createdAt))
      .limit(20);
    return res.json(history);
  } catch (err) {
    return res.json(loadLocalAnalyses().slice(0, 20));
  }
});

export default router;

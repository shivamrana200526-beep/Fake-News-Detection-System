import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Cache trending data for 10 minutes to avoid hammering the API
let cache: { data: any; generatedAt: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

/**
 * GET /api/trending
 * Returns AI-curated list of current common misinformation stories
 */
router.get("/trending", async (req, res) => {
  try {
    if (cache && Date.now() - cache.generatedAt < CACHE_TTL) {
      return res.json(cache.data);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content: "You are a misinformation researcher. Generate a list of currently circulating fake news and misinformation stories. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Generate 8 realistic, varied misinformation stories that are commonly circulating or have circulated recently across social media and messaging apps. These should span different topics (health, politics, science, celebrity, etc).

Return ONLY valid JSON:
{
  "stories": [
    {
      "id": 1,
      "headline": "<the fake/misleading headline as it appears when shared>",
      "verdict": "Fake" | "Misleading" | "Satire",
      "category": "Health" | "Politics" | "Science" | "Celebrity" | "Finance" | "Technology" | "Viral",
      "whySpreading": "<1 sentence: why this resonates emotionally with people>",
      "truth": "<1-2 sentences: what's actually true>",
      "redFlags": ["<red flag to spot it>"],
      "platforms": ["WhatsApp", "Facebook", "Twitter/X", "Telegram", "TikTok"],
      "severity": "Low" | "Medium" | "High"
    }
  ]
}

Include 2-3 redFlags per story. Make platforms realistic (1-3 per story). Vary severity levels.`,
        },
      ],
      max_completion_tokens: 2000,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON from GPT");

    const parsed = JSON.parse(match[0]);
    const result = { ...parsed, generatedAt: new Date().toISOString() };

    cache = { data: result, generatedAt: Date.now() };
    res.json(result);
  } catch (err: any) {
    req.log?.error({ err }, "Trending fetch failed");
    res.status(500).json({ message: "Failed to load trending stories. Please try again." });
  }
});

export default router;

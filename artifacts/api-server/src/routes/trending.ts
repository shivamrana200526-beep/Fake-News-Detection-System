import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
});

let cache: { data: any; generatedAt: number } | null = null;

router.get("/trending", async (req, res) => {
  try {
    if (cache && Date.now() - cache.generatedAt < 1000 * 60 * 60) {
      return res.json(cache.data);
    }

    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `Identify 5 currently circulating fake news stories or conspiracy theories. Return ONLY valid JSON:
{
  "stories": [
    {
      "id": 1,
      "title": "<The fake claim>",
      "category": "Politics" | "Science" | "Tech" | "Health" | "World",
      "severity": "Low" | "Medium" | "High",
      "description": "<2 sentence context>",
      "platforms": ["WhatsApp", "Twitter", "TikTok", "Facebook"],
      "redFlags": ["<red flag 1>"]
    }
  ]
}

Include 2-3 redFlags per story. Make platforms realistic (1-3 per story). Vary severity levels.`
        }]
      }]
    });

    const raw = (response.text ?? "").trim() || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON");

    const result = { ...JSON.parse(match[0]), generatedAt: new Date().toISOString() };
    cache = { data: result, generatedAt: Date.now() };
    return res.json(result);
  } catch (err: any) {
    req.log.error({ err }, "Trending fetch failed");
    return res.status(500).json({ message: "Failed to load trending stories." });
  }
});

export default router;

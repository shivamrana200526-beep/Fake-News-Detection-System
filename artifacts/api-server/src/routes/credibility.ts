import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
});

router.post("/credibility", async (req, res) => {
  try {
    const { source } = req.body;
    if (!source || typeof source !== "string") {
      return res.status(400).json({ message: "source is required" });
    }

    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `You are a media bias and credibility expert. Analyze this news source: "${source.substring(0, 200)}".
Return ONLY valid JSON:
{
  "name": "<official name>",
  "credibilityScore": <0-100>,
  "bias": "Far Left" | "Left" | "Center-Left" | "Center" | "Center-Right" | "Right" | "Far Right" | "Unknown",
  "type": "Mainstream" | "Independent" | "State Media" | "Satire" | "Hyperpartisan" | "Fake News",
  "summary": "<2 sentence overview>",
  "recentControversies": ["<controversy 1>", "<controversy 2>"],
  "transparency": "High" | "Medium" | "Low"
}`
        }]
      }]
    });

    const raw = (response.text ?? "").trim() || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON");
    
    return res.json(JSON.parse(match[0]));
  } catch (err: any) {
    req.log.error({ err }, "Credibility check failed");
    return res.status(500).json({ message: "Failed to check source credibility." });
  }
});

export default router;

import { Router, type IRouter } from "express";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
});

let cache: { data: any; generatedAt: number } | null = null;

router.get("/quiz", async (req, res) => {
  try {
    if (cache && Date.now() - cache.generatedAt < 1000 * 60 * 60 * 24) {
      return res.json(cache.data);
    }

    const response = await geminiAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{
        role: "user",
        parts: [{
          text: `Generate a 10-question misinformation detection quiz. Return ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "text": "<The news headline or claim>",
      "verdict": "Real" | "Fake" | "Misleading",
      "difficulty": "Easy" | "Medium" | "Hard",
      "explanation": "<2-3 sentence educational explanation of why it's real/fake>",
      "category": "Politics" | "Science" | "Tech" | "Health" | "World"
    }
  ]
}

Rules:
- Mix verdicts: ~3 Real, ~4 Fake, ~3 Misleading
- Easy = 10 pts, Medium = 20 pts, Hard = 30 pts
- Headlines should be realistic and believable
- Explanations must be factually accurate and educational`
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
    req.log.error({ err }, "Quiz generation failed");
    return res.status(500).json({ message: "Failed to generate quiz." });
  }
});

export default router;

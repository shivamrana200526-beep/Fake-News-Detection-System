import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Cache quiz for 24h (daily quiz concept)
let quizCache: { data: any; generatedAt: number } | null = null;
const CACHE_TTL = 24 * 60 * 60 * 1000;

/**
 * GET /api/quiz
 * Returns today's daily misinformation quiz (10 questions, cached 24h)
 */
router.get("/quiz", async (req, res) => {
  try {
    if (quizCache && Date.now() - quizCache.generatedAt < CACHE_TTL) {
      return res.json(quizCache.data);
    }

    const today = new Date().toDateString();

    const completion = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        {
          role: "system",
          content: "You are a media literacy educator creating a daily quiz to help people identify misinformation. Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: `Create a daily misinformation quiz with 10 headlines. Mix of Real, Fake, and Misleading. Vary difficulty (easy/medium/hard). Cover different topics.

Today's date: ${today}

Return ONLY valid JSON:
{
  "quizDate": "${today}",
  "questions": [
    {
      "id": 1,
      "headline": "<news headline as it would appear when shared — realistic, not obviously fake>",
      "verdict": "Real" | "Fake" | "Misleading",
      "difficulty": "Easy" | "Medium" | "Hard",
      "category": "Health" | "Politics" | "Science" | "Celebrity" | "Finance" | "Technology" | "History",
      "explanation": "<2-3 sentences explaining the correct answer and why>",
      "clue": "<one subtle hint to help without giving it away>",
      "points": 10 | 20 | 30
    }
  ]
}

Rules:
- Mix verdicts: ~3 Real, ~4 Fake, ~3 Misleading
- Easy = 10 pts, Medium = 20 pts, Hard = 30 pts
- Headlines should be realistic and believable — not obviously fake
- Explanations must be factually accurate and educational`,
        },
      ],
      max_completion_tokens: 3000,
    });

    const raw = completion.choices[0]?.message?.content?.trim() || "{}";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Invalid JSON from GPT");

    const parsed = JSON.parse(match[0]);
    const result = { ...parsed, generatedAt: new Date().toISOString(), totalPoints: parsed.questions?.reduce((s: number, q: any) => s + (q.points || 10), 0) || 100 };

    quizCache = { data: result, generatedAt: Date.now() };
    res.json(result);
  } catch (err: any) {
    req.log?.error({ err }, "Quiz generation failed");
    res.status(500).json({ message: "Failed to generate today's quiz. Please try again." });
  }
});

export default router;

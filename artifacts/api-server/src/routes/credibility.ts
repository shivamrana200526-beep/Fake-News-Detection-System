import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

const router: IRouter = Router();

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

const geminiAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.AI_INTEGRATIONS_GEMINI_API_KEY || "",
  ...(process.env.AI_INTEGRATIONS_GEMINI_BASE_URL
    ? { httpOptions: { apiVersion: "", baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL } }
    : {}),
});

function extractDomain(input: string): string {
  try {
    const cleaned = input.trim().replace(/^(https?:\/\/)?(www\.)?/, "");
    return cleaned.split("/")[0].toLowerCase();
  } catch {
    return input.trim().toLowerCase();
  }
}

/**
 * POST /api/credibility
 * Analyzes news source credibility using GPT + Gemini
 */
router.post("/credibility", async (req, res) => {
  const { source } = req.body;
  if (!source || typeof source !== "string") {
    return res.status(400).json({ message: "source is required" });
  }

  const domain = extractDomain(source);

  const prompt = `You are a media credibility expert. Analyze this news source: "${domain}"
  
Return ONLY valid JSON with this exact structure:
{
  "domain": "${domain}",
  "name": "<full publication name>",
  "trustScore": <integer 0-100>,
  "bias": "<one of: Far Left | Left | Center-Left | Center | Center-Right | Right | Far Right | Unknown>",
  "type": "<one of: Mainstream Media | Public Broadcaster | Independent News | Tabloid | Satire | Propaganda | Blog | Academic | Government | Unknown>",
  "summary": "<2-3 sentence factual description of this source, its history and reputation>",
  "redFlags": ["<specific concern if any>"],
  "positives": ["<genuine strength if any>"],
  "factCheckRating": "<one of: Highly Reliable | Generally Reliable | Mixed | Generally Unreliable | Highly Unreliable | Satire | Unknown>",
  "recommendation": "<one practical sentence telling the user how to use this source wisely>"
}

Rules:
- trustScore: 80-100 = highly reliable, 60-79 = generally reliable, 40-59 = mixed, 20-39 = unreliable, 0-19 = propaganda/fake
- Be accurate and factual. If you don't know the source, say so in type "Unknown" with low confidence
- Include 1-3 redFlags and 1-3 positives (can be empty arrays if truly unknown)`;

  try {
    const [gptRes, geminiRes] = await Promise.allSettled([
      openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: "You are a media credibility analyst. Respond only with valid JSON." },
          { role: "user", content: prompt },
        ],
        max_completion_tokens: 500,
      }),
      geminiAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      }),
    ]);

    let result: any = null;

    if (gptRes.status === "fulfilled") {
      const raw = gptRes.value.choices[0]?.message?.content?.trim() || "{}";
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
    }

    if (!result && geminiRes.status === "fulfilled") {
      const raw = (geminiRes.value.text ?? "").trim();
      const match = raw.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
    }

    // If GPT succeeded, blend in Gemini's trust score for averaging
    if (result && gptRes.status === "fulfilled" && geminiRes.status === "fulfilled") {
      const geminiRaw = (geminiRes.value.text ?? "").trim();
      const geminiMatch = geminiRaw.match(/\{[\s\S]*\}/);
      if (geminiMatch) {
        const geminiData = JSON.parse(geminiMatch[0]);
        if (typeof geminiData.trustScore === "number") {
          result.trustScore = Math.round((result.trustScore + geminiData.trustScore) / 2);
        }
      }
    }

    if (!result) {
      return res.status(500).json({ message: "Could not analyze this source. Try a well-known news domain." });
    }

    res.json({ ...result, analyzedAt: new Date().toISOString() });
  } catch (err: any) {
    req.log?.error({ err }, "Credibility check failed");
    res.status(500).json({ message: "Analysis failed. Please try again." });
  }
});

export default router;

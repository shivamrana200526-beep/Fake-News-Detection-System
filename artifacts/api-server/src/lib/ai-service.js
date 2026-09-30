import OpenAI from "openai";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:1b";
const CLOUD_AI_URL = "https://text.pollinations.ai/";

const ollama = new OpenAI({
  baseURL: OLLAMA_BASE_URL,
  apiKey: "ollama",
  timeout: 3000,
});

export async function queryAI({ messages, jsonMode = false, systemPrompt = "" }) {
  const fullMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  try {
    const response = await ollama.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: fullMessages,
      response_format: jsonMode ? { type: "json_object" } : undefined,
      temperature: 0.1,
      max_tokens: 600,
    });
    const text = response.choices[0]?.message?.content?.trim();
    if (text) {
      if (jsonMode) {
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
      }
      return text;
    }
  } catch (err) {}

  try {
    const res = await fetch(CLOUD_AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: fullMessages,
        jsonMode,
        model: "openai",
        seed: 42,
      }),
    });

    if (res.ok) {
      const text = await res.text();
      if (jsonMode) {
        const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (match) return JSON.parse(match[0]);
      }
      return text;
    }
  } catch (err) {}

  return null;
}

export function runHeuristicFactCheck(content) {
  const lower = content.toLowerCase();

  const knownClaims = [
    { pattern: /flat earth|earth is flat/i, verdict: "Fake", confidence: 99, exp: "Scientific and satellite evidence proves Earth is an oblate spheroid." },
    { pattern: /moon landing.*(fake|hoax|staged)/i, verdict: "Fake", confidence: 98, exp: "Apollo moon landings are verified with telemetry and lunar samples." },
    { pattern: /nasa.*(landed on the moon|apollo 11)/i, verdict: "Real", confidence: 99, exp: "Apollo 11 successfully landed on the moon on July 20, 1969." },
    { pattern: /drinking bleach|drink bleach/i, verdict: "Fake", confidence: 100, exp: "Bleach is toxic and fatal if consumed. It cures no disease." },
    { pattern: /raw garlic.*cure.*(infection|covid|cancer)/i, verdict: "Fake", confidence: 95, exp: "Garlic does not cure viral or bacterial infections." },
    { pattern: /modi.*prime minister/i, verdict: "Real", confidence: 99, exp: "Narendra Modi is the Prime Minister of India." },
    { pattern: /india.*capital.*(mumbai|calcutta)/i, verdict: "Fake", confidence: 100, exp: "The capital of India is New Delhi." },
    { pattern: /capital of india is new delhi/i, verdict: "Real", confidence: 100, exp: "New Delhi is the official capital of India." },
    { pattern: /win free (iphone|cash|money)|claim your prize/i, verdict: "Fake", confidence: 95, exp: "This is a common scam message." }
  ];

  for (const item of knownClaims) {
    if (item.pattern.test(lower)) {
      return {
        prediction: item.verdict,
        confidence: item.confidence,
        explanation: item.exp,
        keywords: ["verified-claim"],
        manipulationScore: item.verdict === "Fake" ? 85 : 5,
        emotionalTactics: item.verdict === "Fake" ? ["Deceptive claim"] : [],
        logicalFallacies: item.verdict === "Fake" ? ["False assertion"] : [],
        factBreakdown: [
          { category: "Claim", detail: content.substring(0, 100), status: item.verdict.toLowerCase() }
        ]
      };
    }
  }

  const clickbaitWords = ["shocking", "miracle", "doctors hate this", "secret exposed", "urgent warning", "100% cure"];
  const isClickbait = clickbaitWords.some(w => lower.includes(w)) || /!{2,}|\?{2,}/.test(content);

  return {
    prediction: isClickbait ? "Misleading" : "Unverified",
    confidence: isClickbait ? 75 : 60,
    explanation: isClickbait
      ? "Content uses sensational language without evidence from verified news outlets."
      : "Claim requires verification against primary news sources.",
    keywords: ["news-check"],
    manipulationScore: isClickbait ? 70 : 25,
    emotionalTactics: isClickbait ? ["Urgency"] : [],
    logicalFallacies: isClickbait ? ["Appeal to emotion"] : [],
    factBreakdown: [
      { category: "Verification", detail: "Check with credible news agencies.", status: "unverified" }
    ]
  };
}

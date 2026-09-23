import OpenAI from "openai";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434/v1";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:1b";
const FREE_AI_URL = "https://text.pollinations.ai/";

const ollama = new OpenAI({
  baseURL: OLLAMA_BASE_URL,
  apiKey: "ollama",
  timeout: 4000, // Quick timeout if Ollama is not running
});

// Helper: Try Ollama first, fallback to Free Zero-Key AI, fallback to Heuristic
export async function queryAI({ messages, jsonMode = false, systemPrompt = "" }) {
  const fullMessages = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...messages]
    : messages;

  // 1. Try Local Ollama (fastest if running on device)
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
  } catch (ollamaErr) {
    // Ollama not reachable — seamlessly proceed to Free Cloud AI
  }

  // 2. Try Free Cloud AI (Zero API Key, runs anywhere worldwide on Vercel/Cloud)
  try {
    const res = await fetch(FREE_AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: fullMessages,
        jsonMode: jsonMode,
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
  } catch (freeAiErr) {
    // Both unavailable — fallback to heuristic
  }

  return null;
}

// Built-in rule-based forensic analyzer (offline fallback if zero internet)
export function runHeuristicFactCheck(content) {
  const lower = content.toLowerCase();
  
  // Known fact database (instant accurate matching for common claims)
  const knownClaims = [
    { pattern: /flat earth|earth is flat/i, verdict: "Fake", confidence: 99, exp: "Overwhelming scientific, satellite, and astronomical evidence proves Earth is an oblate spheroid." },
    { pattern: /moon landing.*(fake|hoax|staged)/i, verdict: "Fake", confidence: 98, exp: "Apollo moon landings are verified by independent tracking, retroreflectors, and physical moon rock samples." },
    { pattern: /nasa.*(landed on the moon|apollo 11)/i, verdict: "Real", confidence: 99, exp: "Apollo 11 landed astronauts on the Moon on July 20, 1969." },
    { pattern: /drinking bleach|drink bleach/i, verdict: "Fake", confidence: 100, exp: "Bleach is a toxic chemical. Ingesting it is life-threatening and does not cure any disease." },
    { pattern: /raw garlic.*cure.*(infection|covid|cancer)/i, verdict: "Fake", confidence: 95, exp: "While garlic has mild antimicrobial properties, it does not cure serious infections or diseases." },
    { pattern: /modi.*prime minister/i, verdict: "Real", confidence: 99, exp: "Narendra Modi is the current Prime Minister of India." },
    { pattern: /india.*capital.*(mumbai|calcutta)/i, verdict: "Fake", confidence: 100, exp: "The capital of India is New Delhi, not Mumbai or Kolkata." },
    { pattern: /capital of india is new delhi/i, verdict: "Real", confidence: 100, exp: "New Delhi has been the official capital of India since 1911." },
    { pattern: /win free (iphone|cash|money)|claim your prize/i, verdict: "Fake", confidence: 95, exp: "Standard phishing and deceptive social engineering tactic." }
  ];

  for (const item of knownClaims) {
    if (item.pattern.test(lower)) {
      return {
        prediction: item.verdict,
        confidence: item.confidence,
        explanation: item.exp,
        keywords: ["verified-fact", "historical-record"],
        manipulationScore: item.verdict === "Fake" ? 85 : 5,
        emotionalTactics: item.verdict === "Fake" ? ["Deceptive assertion"] : [],
        logicalFallacies: item.verdict === "Fake" ? ["False claim"] : [],
        factBreakdown: [
          { category: "Claim", detail: content.substring(0, 100), status: item.verdict.toLowerCase() }
        ]
      };
    }
  }

  // Linguistic pattern heuristic
  const sensationalWords = ["shocking", "miracle", "doctors hate this", "secret government", "exposed", "urgent warning", "they don't want you to know", "100% cure"];
  const matches = sensationalWords.filter(w => lower.includes(w));
  const isSensational = matches.length > 0 || (content.match(/!{2,}|\?{2,}/) !== null);

  return {
    prediction: isSensational ? "Misleading" : "Unverified",
    confidence: isSensational ? 75 : 60,
    explanation: isSensational 
      ? "Content exhibits hallmark signs of sensationalism and clickbait framing without verified official documentation." 
      : "Claim requires verification against primary news sources and institutional records.",
    keywords: ["analysis-pending", "fact-check"],
    manipulationScore: isSensational ? 70 : 30,
    emotionalTactics: isSensational ? ["Urgency", "Sensational framing"] : [],
    logicalFallacies: isSensational ? ["Appeal to emotion"] : [],
    factBreakdown: [
      { category: "Verification", detail: "Cross-reference with credible press agencies recommended.", status: "unverified" }
    ]
  };
}

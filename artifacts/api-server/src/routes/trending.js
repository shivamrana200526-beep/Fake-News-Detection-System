import { Router } from "express";
import { queryAI } from "../lib/ai-service.js";

const router = Router();

let cache = null;

const DEFAULT_TRENDING = {
  stories: [
    {
      id: 1,
      title: "Viral forward claims upcoming solar flare will permanently disable all mobile phones.",
      category: "Tech",
      severity: "High",
      description: "A recurring social media chain message claiming NASA warned of an immediate total telecommunications blackout.",
      platforms: ["WhatsApp", "Facebook", "Telegram"],
      redFlags: ["No link to official NASA bulletin", "Uses urgent language urging immediate forwarding", "Technical impossibility of selectively disabling handsets"]
    },
    {
      id: 2,
      title: "Scam giveaways offering free smartphones or shopping vouchers via shortened link clicks.",
      category: "Tech",
      severity: "Medium",
      description: "Phishing links disguised as festive corporate promotions prompting users to share contacts or bank OTPs.",
      platforms: ["WhatsApp", "Instagram"],
      redFlags: ["Unofficial domain name", "Requests personal credentials or payment details", "Time-pressure countdown timer"]
    },
    {
      id: 3,
      title: "Audio deepfakes imitating public leaders declaring state emergencies or bank runs.",
      category: "Politics",
      severity: "High",
      description: "Synthesized synthetic voice clips impersonating government ministers circulated to incite localized panic.",
      platforms: ["Twitter", "WhatsApp"],
      redFlags: ["Monotone unnatural voice pacing", "Lack of corroboration from verified news broadcasts", "Circulated solely through private channels"]
    },
    {
      id: 4,
      title: "Superfood concoctions claiming to cure chronic medical conditions in 48 hours.",
      category: "Health",
      severity: "Medium",
      description: "Commercial ads masquerading as investigative medical discoveries promising miraculous cures without prescription.",
      platforms: ["YouTube", "Facebook"],
      redFlags: ["Disregards clinical peer review", "Claims medical establishments are suppressing the secret", "Requires purchasing expensive proprietary supplements"]
    },
    {
      id: 5,
      title: "Manipulated satellite images claiming new islands appeared overnight.",
      category: "Science",
      severity: "Low",
      description: "Heavily filtered ocean photos showing coral reefs mislabeled as newly emerged landmasses.",
      platforms: ["TikTok", "Reddit"],
      redFlags: ["Absence of geological survey data", "Sensational headline formatting", "Image reverse search reveals historical footage"]
    }
  ],
  generatedAt: new Date().toISOString()
};

router.get("/trending", async (req, res) => {
  try {
    if (cache && Date.now() - cache.generatedAt < 1000 * 60 * 60) {
      return res.json(cache.data);
    }

    const aiResult = await queryAI({
      messages: [{
        role: "user",
        content: `Identify 5 currently circulating fake news stories or conspiracy theories. Return ONLY valid JSON:
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
      }],
      jsonMode: true,
    });

    if (aiResult && Array.isArray(aiResult.stories) && aiResult.stories.length > 0) {
      const result = { ...aiResult, generatedAt: new Date().toISOString() };
      cache = { data: result, generatedAt: Date.now() };
      return res.json(result);
    }
  } catch (err) {
    console.warn("Dynamic trending generation fallback:", err?.message);
  }

  return res.json(DEFAULT_TRENDING);
});

export default router;

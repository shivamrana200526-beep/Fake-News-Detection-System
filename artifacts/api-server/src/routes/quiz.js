import { Router } from "express";
import { queryAI } from "../lib/ai-service.js";

const router = Router();

let cache = null;

const DEFAULT_QUIZ = {
  questions: [
    {
      id: 1,
      text: "NASA confirmed the Earth is flat during a recent press conference.",
      verdict: "Fake",
      difficulty: "Easy",
      explanation: "NASA and global scientific organizations confirm the Earth is an oblate spheroid with decades of satellite imagery.",
      category: "Science"
    },
    {
      id: 2,
      text: "The World Health Organization declared physical inactivity as a leading global risk factor for mortality.",
      verdict: "Real",
      difficulty: "Medium",
      explanation: "WHO officially recognizes lack of physical exercise as one of the leading preventable causes of death worldwide.",
      category: "Health"
    },
    {
      id: 3,
      text: "Drinking warm lemon water cures cancer by neutralizing bodily acidity.",
      verdict: "Fake",
      difficulty: "Medium",
      explanation: "The body strictly regulates blood pH through the kidneys and lungs. Dietary intake cannot alter systemic pH or cure cancer.",
      category: "Health"
    },
    {
      id: 4,
      text: "James Webb Space Telescope detected atmospheric components on distant exoplanets.",
      verdict: "Real",
      difficulty: "Easy",
      explanation: "JWST has successfully identified carbon dioxide, water vapor, and methane in various exoplanetary atmospheres.",
      category: "Tech"
    },
    {
      id: 5,
      text: "5G cellular networks are responsible for transmitting viral respiratory illnesses.",
      verdict: "Fake",
      difficulty: "Easy",
      explanation: "Viruses are biological pathogens transmitted via droplets or physical contact. Radio waves cannot create or transmit biological viruses.",
      category: "Tech"
    },
    {
      id: 6,
      text: "A viral screenshot claims a major tech company is shutting down all free email accounts next week.",
      verdict: "Misleading",
      difficulty: "Hard",
      explanation: "Policy updates only remove inactive accounts that have been dormant for several years, not active user accounts.",
      category: "Tech"
    },
    {
      id: 7,
      text: "India successfully landed the Chandrayaan-3 lander near the south pole of the Moon.",
      verdict: "Real",
      difficulty: "Easy",
      explanation: "ISRO's Chandrayaan-3 achieved a historic soft landing on the lunar south pole region on August 23, 2023.",
      category: "Science"
    },
    {
      id: 8,
      text: "Microwaving food removes 100% of its vitamins and leaves it radioactively contaminated.",
      verdict: "Fake",
      difficulty: "Medium",
      explanation: "Microwaves use non-ionizing radiation to heat water molecules. Food does not become radioactive.",
      category: "Science"
    },
    {
      id: 9,
      text: "A government bill completely bans all social media use for citizens starting next month.",
      verdict: "Misleading",
      difficulty: "Hard",
      explanation: "The legislation proposed privacy regulations and age-verification checks for minors, not an outright ban for citizens.",
      category: "Politics"
    },
    {
      id: 10,
      text: "Chewing gum stays in your human digestive tract for seven years before passing.",
      verdict: "Fake",
      difficulty: "Easy",
      explanation: "While the gum base is insoluble, the digestive system passes it normally through peristalsis within a few days.",
      category: "Health"
    }
  ],
  generatedAt: new Date().toISOString()
};

router.get("/quiz", async (req, res) => {
  try {
    if (cache && Date.now() - cache.generatedAt < 1000 * 60 * 60 * 24) {
      return res.json(cache.data);
    }

    const aiResult = await queryAI({
      messages: [{
        role: "user",
        content: `Generate a 10-question misinformation detection quiz. Return ONLY valid JSON:
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
      }],
      jsonMode: true,
    });

    if (aiResult && Array.isArray(aiResult.questions) && aiResult.questions.length > 0) {
      const result = { ...aiResult, generatedAt: new Date().toISOString() };
      cache = { data: result, generatedAt: Date.now() };
      return res.json(result);
    }
  } catch (err) {
    console.warn("Dynamic quiz generation fallback:", err?.message);
  }

  // Graceful fallback to verified built-in quiz
  return res.json(DEFAULT_QUIZ);
});

export default router;

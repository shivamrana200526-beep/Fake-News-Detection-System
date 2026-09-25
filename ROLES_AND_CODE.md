# ðŸ›¡ï¸ SatyaCheck â€” Role-Based Code & Architecture Breakdown

Four engineering roles power **SatyaCheck** end-to-end. Every code snippet below is taken directly from the actual production codebase in **100% JavaScript (ES Modules & React JSX)** â€” with zero TypeScript.

---

## ðŸ‘¥ Engineering Team & Role Assignments

| Role | Lead Engineer | Domain | Core Tech Stack | Key Files Owned |
|------|--------------|--------|-----------------|-----------------|
| ðŸŽ¨ **Role 1** | **Tanush** | **Frontend Architecture & UI/UX** | React 19 Â· Vite Â· Tailwind CSS v4 Â· wouter Â· React Query Â· shadcn/ui Â· Recharts | `frontend-js/src/App.jsx`, `pages/Detect.jsx`, `pages/Chat.jsx`, `pages/Dashboard.jsx`, `pages/History.jsx`, `hooks/use-analysis.js`, `hooks/use-theme.js`, `hooks/use-voice-input.js` |
| âš™ï¸ **Role 2** | **Shivam** | **Backend Development & Server Gateway** | Node.js (ESM) Â· Express 5 Â· Pino Â· CORS Â· Cheerio Â· Server-Sent Events Â· Vercel Serverless | `artifacts/api-server/src/app.js`, `src/index.js`, `routes/index.js`, `routes/analyze.js`, `routes/chat.js`, `routes/auth.js`, `routes/health.js`, `lib/scraper.js`, `api/index.js` |
| ðŸ—„ï¸ **Role 3** | **Pranav** | **Database Architecture & Persistence** | PostgreSQL Â· Drizzle ORM Â· Zod Â· Dual-Mode JSON Storage Engine | `lib/db/src/schema/analyses.js`, `schema/conversations.js`, `schema/messages.js`, `schema/index.js`, `lib/db/src/index.js`, `lib/db/drizzle.config.js`, `analyses-storage.json` |
| ðŸ¤– **Role 4** | **Simar** | **AI & API Integration (Forensic Intelligence)** | Multi-Tier AI (Ollama + Zero-Key Cloud + Offline Heuristics) Â· NLP Â· Intent Guardrails | `artifacts/api-server/src/lib/ai-service.js`, `routes/chat.js` (AI & guardrails), `routes/analyze.js` (prompts), `routes/quiz.js`, `routes/trending.js`, `routes/credibility.js` |

---

## 1. ðŸŽ¨ Role 1: Frontend Development â€” Tanush

* **Lead Engineer:** Tanush
* **Stack:** React 19 Â· Vite 7 Â· Tailwind CSS v4 Â· JavaScript (JSX) Â· wouter Â· TanStack React Query Â· Radix UI Â· Recharts Â· Framer Motion
* **Base Directory:** `frontend-js/src/`

### Responsibilities
- Renders all responsive web pages and forensic visualization cards.
- Handles 4 input verification modes: Raw Text, Article URL, Viral Headline, and Screenshot Image.
- Integrates browser Web Speech API for hands-free voice dictation.
- Manages client-side routing, instant route switching (<100ms), and theme toggling (dark/light).
- Offline-first local storage for fact-check history with one-click CSV export.

---

### ðŸ“„ `frontend-js/src/App.jsx` â€” Application Shell & Router
**Author:** Tanush

```jsx
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

import Home       from "./pages/Home";
import Detect     from "./pages/Detect";
import Chat       from "./pages/Chat";
import Dashboard  from "./pages/Dashboard";
import History    from "./pages/History";
import Forward    from "./pages/Forward";
import Credibility from "./pages/Credibility";
import Trending   from "./pages/Trending";
import Quiz       from "./pages/Quiz";
import Education  from "./pages/Education";
import About      from "./pages/About";
import Login      from "./pages/Login";
import NotFound   from "./pages/not-found";

function Router() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/"            component={Home} />
          <Route path="/detect"      component={Detect} />
          <Route path="/chat"        component={Chat} />
          <Route path="/dashboard"   component={Dashboard} />
          <Route path="/history"     component={History} />
          <Route path="/forward"     component={Forward} />
          <Route path="/credibility" component={Credibility} />
          <Route path="/trending"    component={Trending} />
          <Route path="/quiz"        component={Quiz} />
          <Route path="/education"   component={Education} />
          <Route path="/about"       component={About} />
          <Route path="/login"       component={Login} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}
```

---

### ðŸ“„ `frontend-js/src/hooks/use-analysis.js` â€” React Query API Integration
**Author:** Tanush

```js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Mutation: POST /api/analyze
export function useAnalyzeContent(options) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ data }) => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Analysis failed" }));
        throw new Error(err.message || "Analysis failed");
      }
      return res.json();
    },
    ...options?.mutation,
    onSuccess: (data, variables, context) => {
      // Invalidate cached stats and history on every new analysis run
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      options?.mutation?.onSuccess?.(data, variables, context);
    },
  });
}

// Query: GET /api/stats
export function useStats(options) {
  return useQuery({
    queryKey: ["/api/stats"],
    queryFn: async () => {
      const res = await fetch("/api/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    ...options?.query,
  });
}
```

---

### ðŸ“„ `frontend-js/src/pages/History.jsx` â€” Browser-Local History & CSV Export
**Author:** Tanush

```jsx
import { useState, useEffect } from "react";

const STORAGE_KEY = "satyacheck_history";

export function saveToHistory(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    // Keep latest 100 entries locally without tracking users
    const updated = [newEntry, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export default function History() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setEntries(data);
  }, []);

  const exportCSV = () => {
    const rows = [
      ["Date", "Type", "Content", "Verdict", "Confidence"],
      ...entries.map((e) => [
        new Date(e.timestamp).toLocaleString(),
        e.type,
        `"${(e.content || "").replace(/"/g, '""').substring(0, 200)}"`,
        e.verdict,
        e.confidence?.toString() || "",
      ]),
    ];
    const csvContent = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `satyacheck-history-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // ... renders search filters and history table
}
```

---

### ðŸ“„ `frontend-js/src/hooks/use-voice-input.js` â€” Hands-Free Web Speech Recognition
**Author:** Tanush

```js
import { useState, useCallback } from "react";

export function useVoiceInput({ onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onError?.("Voice input is not supported by your browser");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      setIsListening(false);
      onError?.(e.error);
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult?.(transcript);
    };

    recognition.start();
  }, [onResult, onError]);

  return { isListening, startListening };
}
```

---

## 2. âš™ï¸ Role 2: Backend Development â€” Shivam

* **Lead Engineer:** Shivam
* **Stack:** Node.js (ESM) Â· Express 5 Â· Pino HTTP Â· Cheerio (Scraping) Â· CORS Â· Server-Sent Events (SSE) Â· Vercel Serverless
* **Base Directory:** `artifacts/api-server/src/` & `api/`

### Responsibilities
- Serves RESTful API endpoints consumed by the React frontend.
- Implements 50MB payload parsers for high-resolution screenshot uploads.
- Extracts clean news text and metadata from submitted URLs using Cheerio.
- Manages Server-Sent Events (SSE) streaming connections for the AI chat.
- Provides token-based authentication and user session management.
- Adapts the Express server for serverless deployment on Vercel via `api/index.js`.

---

### ðŸ“„ `artifacts/api-server/src/app.js` â€” Express Server Architecture
**Author:** Shivam

```js
import express from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

const app = express();

// Structured JSON logging
app.use(pinoHttp({ logger }));

// CORS â€” allows cross-origin requests from frontend dev and production origins
app.use(cors());

// Parse JSON bodies up to 50MB (handles base64 image uploads)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Route dispatch â€” mount all endpoints under /api
app.use("/api", router);

export default app;
```

---

### ðŸ“„ `artifacts/api-server/src/routes/index.js` â€” Master Route Registry
**Author:** Shivam

```js
import { Router } from "express";
import analyzeRouter    from "./analyze.js";
import chatRouter       from "./chat.js";
import credibilityRouter from "./credibility.js";
import trendingRouter   from "./trending.js";
import quizRouter       from "./quiz.js";
import healthRouter     from "./health.js";
import authRouter       from "./auth.js";

const router = Router();

router.use(analyzeRouter);     // POST /api/analyze, GET /api/stats, GET /api/history
router.use(chatRouter);        // POST /api/chat  (SSE streaming)
router.use(credibilityRouter); // POST /api/credibility
router.use(trendingRouter);    // GET  /api/trending
router.use(quizRouter);        // GET  /api/quiz
router.use(healthRouter);      // GET  /api/healthz
router.use(authRouter);        // POST /api/auth/*

export default router;
```

---

### ðŸ“„ `artifacts/api-server/src/lib/scraper.js` â€” Web Article Extraction
**Author:** Shivam

```js
import * as cheerio from "cheerio";

export async function scrapeUrl(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, advertisements, and navigation junk
    $("script, style, nav, header, footer, noscript, iframe, svg").remove();

    const title = $('meta[property="og:title"]').attr("content") || $("h1").first().text().trim();
    const author = $('meta[name="author"]').attr("content") || $('[rel="author"]').text().trim() || "Unknown";
    const publishDate = $('meta[property="article:published_time"]').attr("content") || "Unknown";

    // Extract body paragraphs
    const paragraphs = [];
    $("article p, .article-body p, main p, p").each((_, el) => {
      const text = $(el).text().trim();
      if (text.length > 30) paragraphs.push(text);
    });

    const fullText = paragraphs.join("\n\n");
    return {
      scrapedOk: true,
      title,
      author,
      publishDate,
      wordCount: fullText.split(/\s+/).length,
      text: fullText,
    };
  } catch (err) {
    return { scrapedOk: false, error: err.message };
  }
}
```

---

### ðŸ“„ `api/index.js` â€” Vercel Serverless Gateway
**Author:** Shivam

```js
import app from "../artifacts/api-server/src/app.js";

// Exports Express app directly for Vercel's serverless function runtime
export default app;
```

---

## 3. ðŸ—„ï¸ Role 3: Database Architecture â€” Pranav

* **Lead Engineer:** Pranav
* **Stack:** PostgreSQL Â· Drizzle ORM Â· Zod Validation Â· Dual-Mode File Storage Fallback
* **Base Directory:** `lib/db/src/` & root storage files

### Responsibilities
- Defines all database tables in pure JavaScript with Drizzle ORM.
- Enforces strict data validation with Zod schemas to protect against malformed data.
- Built a dual-mode persistence architecture: connects to PostgreSQL via Drizzle when available, and automatically falls back to local JSON storage (`analyses-storage.json`, `users-storage.json`) when PostgreSQL is offline.
- Designed analytical queries for platform statistics, verdict ratios, and trending topics.

---

### ðŸ“„ `lib/db/src/schema/analyses.js` â€” Analysis Tables & Schema
**Author:** Pranav

```js
import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Primary table â€” one row per fact-check request
export const analyses = pgTable("analyses", {
  id:                 serial("id").primaryKey(),
  content:            text("content").notNull(),              // submitted text / URL / "[Image Upload]"
  sourceType:         text("source_type").notNull(),          // "text" | "url" | "headline" | "image"
  prediction:         text("prediction").notNull(),           // "Real" | "Fake" | "Misleading"
  confidence:         integer("confidence").notNull(),        // 0â€“100 integer score
  explanation:        text("explanation").notNull(),          // 3-4 sentence comprehensive verdict
  keywords:           text("keywords").array(),               // extracted topic tags
  detectedSource:     jsonb("detected_source"),              // { name, url }
  additionalSources:   jsonb("additional_sources"),           // [{ name, url }]
  mediaType:          text("media_type").default("text"),
  factBreakdown:      jsonb("fact_breakdown"),               // 10-dimensional forensic analysis
  createdAt:          timestamp("created_at").defaultNow(),
});

// Secondary table â€” linked verified external references
export const analysisResults = pgTable("analysis_results", {
  id:                 serial("id").primaryKey(),
  analysisId:         integer("analysis_id").notNull(),
  verifiedArticles:   jsonb("verified_articles").default([]),
});

// Zod schema for validated inserts (auto-strips autoincrement ID and timestamp)
export const insertAnalysisSchema = createInsertSchema(analyses).omit({
  id: true,
  createdAt: true,
});
```

---

### ðŸ“„ `lib/db/src/schema/conversations.js` & `messages.js` â€” Chat Tables
**Author:** Pranav

```js
// lib/db/src/schema/conversations.js
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id:        serial("id").primaryKey(),
  title:     text("title").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// lib/db/src/schema/messages.js
import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";

export const messages = pgTable("messages", {
  id:             serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull(),
  role:           text("role").notNull(),    // "user" | "assistant"
  content:        text("content").notNull(),
  createdAt:      timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```

---

### ðŸ“„ Analytical SQL Queries Suite
**Author:** Pranav

```js
import { analyses } from "./schema/analyses.js";
import { eq, desc, sql } from "drizzle-orm";

// Aggregated counts by verdict for dashboard charts
export async function getStats(db) {
  const [total]      = await db.select({ count: sql`count(*)` }).from(analyses);
  const [real]       = await db.select({ count: sql`count(*)` }).from(analyses).where(eq(analyses.prediction, "Real"));
  const [fake]       = await db.select({ count: sql`count(*)` }).from(analyses).where(eq(analyses.prediction, "Fake"));
  const [misleading] = await db.select({ count: sql`count(*)` }).from(analyses).where(eq(analyses.prediction, "Misleading"));

  return {
    total: Number(total?.count || 0),
    realCount: Number(real?.count || 0),
    fakeCount: Number(fake?.count || 0),
    misleadingCount: Number(misleading?.count || 0),
  };
}

// Fetch 20 most recent analyses (newest first)
export async function getRecentAnalyses(db) {
  return await db.select().from(analyses).orderBy(desc(analyses.createdAt)).limit(20);
}
```

---

## 4. ðŸ¤– Role 4: AI & API Integration â€” Simar

* **Lead Engineer:** Simar
* **Stack:** Multi-Tier AI Cascade Â· Local Ollama (LLaMA 3.2 / LLaVA) Â· Zero-API-Key Cloud Endpoint Â· Heuristic Forensic Engine Â· Intent Guardrails Â· NLP Claim Parser
* **Base Directory:** `artifacts/api-server/src/lib/ai-service.js` & `routes/`

### Responsibilities
- Architected the **Multi-Tier Resilient AI Engine**: Tier 1 (local Ollama) $\rightarrow$ Tier 2 (free cloud endpoint with zero API keys) $\rightarrow$ Tier 3 (offline heuristic engine with verified claims database).
- Engineered the **Intent Guardrail (`isRecipeOrOffTopic`)** to politely redirect cooking recipes, coding tasks, or unrelated queries back to news fact-checking.
- Authored the **10-dimensional forensic analysis prompt** evaluating prediction, confidence, manipulation index, emotional appeals, and logical fallacies.
- Implemented **automated claim extraction (`extractClaims`)** to parse multi-sentence paragraphs into discrete factual claims.
- Developed dynamic generators with verified offline fallbacks for the Misinformation Quiz (`quiz.js`), Trending Claims (`trending.js`), and Domain Credibility (`credibility.js`).

---

### ðŸ“„ `artifacts/api-server/src/lib/ai-service.js` â€” Multi-Tier AI Engine
**Author:** Simar

```js
// Author: Simar (AI Lead)
// File: artifacts/api-server/src/lib/ai-service.js

export async function queryAI(messages, options = {}) {
  const jsonMode = options.jsonMode ?? true;
  const timeoutMs = options.timeoutMs || 4000;

  // TIER 1: Try Local Ollama (LLaMA 3.2 / LLaVA) with fast 4s timeout
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch("http://127.0.0.1:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama3.2",
        messages,
        response_format: jsonMode ? { type: "json_object" } : undefined,
        temperature: 0.2,
      }),
    });
    clearTimeout(timer);

    if (res.ok) {
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content?.trim();
      if (content) return content;
    }
  } catch (e) {
    // Ollama offline or timed out; seamlessly cascade to Tier 2
  }

  // TIER 2: Free Public Cloud Endpoint (Zero API Keys required)
  try {
    const res = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages,
        model: "openai",
        jsonMode,
      }),
    });

    if (res.ok) {
      const text = await res.text();
      if (text && text.trim().length > 0) return text.trim();
    }
  } catch (e) {
    // Cloud network failure; proceed to Tier 3
  }

  // TIER 3: Built-in Offline Heuristic Engine
  return null;
}
```

---

### ðŸ“„ `artifacts/api-server/src/routes/chat.js` â€” Intelligent Intent Guardrail
**Author:** Simar

```js
// Author: Simar (AI Lead)
// File: artifacts/api-server/src/routes/chat.js

export function isRecipeOrOffTopic(msg) {
  const text = (msg || "").toLowerCase();

  // Pattern detection for recipes & culinary inquiries
  const recipePatterns = [
    /\b(recipe|ingredients?|how to (make|cook|bake|prepare|brew))\b/,
    /\b(butter chicken|biryani|pasta|cake|cookies?|curry|salad|soup|paneer)\b/,
    /\b(tablespoons?|teaspoons?|cups? of|grams? of|chopped|marinate|simmer)\b/,
  ];

  const hasRecipeWord = recipePatterns.some((pattern) => pattern.test(text));

  // Allow legitimate health & food rumors through (e.g. "Does garlic cure COVID?")
  const isFactCheckClaim =
    /\b(is it true|myth|hoax|cure|harmful|poison|cause|prevent|study says|rumor|claim)\b/.test(text);

  if (hasRecipeWord && !isFactCheckClaim) {
    return true; // Intercept general cooking recipe requests
  }

  return false;
}
```

---

### ðŸ“„ `artifacts/api-server/src/routes/analyze.js` â€” 10-Dimensional Forensic Prompt
**Author:** Simar

```js
// Author: Simar (AI Lead)
// File: artifacts/api-server/src/routes/analyze.js

export const FORENSIC_SYSTEM_PROMPT = `You are a senior forensic fact-checker with expertise in
misinformation research, media literacy, and cognitive bias detection.
Analyze news content across 10 dimensions and return ONLY valid JSON:

{
  "prediction":            "Real" | "Fake" | "Misleading",
  "confidence":            <0-100 integer score>,
  "explanation":           "<3-4 sentence comprehensive verdict citing key facts>",
  "keywords":              ["<relevant entity or topic tags>"],
  "detectedSource":        { "name": "<publication>", "url": "<url>" },
  "additionalSources":     [{ "name": "<source name>", "url": "<url>" }],
  "factBreakdown": [
    { "category": "<dimension>", "detail": "<observation>",
      "status": "real" | "fake" | "misleading" | "unverified" }
  ],
  "manipulationScore":     <0-100>,
  "emotionalTactics":      ["fear appeal", "outrage bait", "false urgency"],
  "logicalFallacies":      ["ad hominem", "straw man", "false dichotomy"],
  "headlineMatchesContent": true | false | null,
  "authorCredibility":     "<assessment of author or outlet>",
  "missingContext":        "<critical facts or nuance omitted>"
}`;
```

---

### ðŸ“„ Automated Multi-Claim NLP Extraction
**Author:** Simar

```js
// Author: Simar (AI Lead)
// Parses long paragraphs into discrete verifiable claims
export async function extractClaims(text) {
  const prompt = [
    {
      role: "system",
      content: `Extract the top 3-5 most specific, verifiable factual claims from this text.
Return ONLY a valid JSON array of strings: ["claim1", "claim2", ...]. Do not include opinions.`,
    },
    { role: "user", content: `Extract verifiable claims from:\n\n"${text.substring(0, 2000)}"` },
  ];

  const raw = await queryAI(prompt, { jsonMode: true });
  try {
    const claims = JSON.parse(raw.match(/\[[\s\S]*\]/)?.[0] || "[]");
    return claims.slice(0, 5).filter((c) => typeof c === "string" && c.length > 10);
  } catch {
    return [];
  }
}
```

---

## ðŸ”— Architecture & Request Lifecycle

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 ROLE 1: FRONTEND (Tanush)                   â”‚
â”‚  React 19 SPA â€¢ Vite â€¢ Tailwind v4 â€¢ wouter                 â”‚
â”‚  useAnalyzeContent() â†’ fetch("POST /api/analyze", data)     â”‚
â”‚  useVoiceInput()     â†’ Web Speech API transcription         â”‚
â”‚  localStorage        â†’ saveToHistory() for offline privacy  â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                        â”‚ HTTP / SSE
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                 ROLE 2: BACKEND (Shivam)                    â”‚
â”‚  Node.js (ESM) â€¢ Express 5 â€¢ Pino Logging â€¢ Vercel Gateway  â”‚
â”‚  POST /api/analyze  â†’ scrapeUrl() + AI orchestration        â”‚
â”‚  POST /api/chat     â†’ SSE streaming token delivery          â”‚
â”‚  POST /api/auth     â†’ crypto token session security         â”‚
â””â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
       â”‚ Drizzle ORM / JSON Storage             â”‚ Async Inference
â”Œâ”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚    ROLE 3: DATABASE (Pranav)    â”‚     â”‚   ROLE 4: AI/API (Simar)   â”‚
â”‚  PostgreSQL + Drizzle ORM       â”‚     â”‚  Tier 1: Ollama (LLaMA/LLaVAâ”‚
â”‚  Table: analyses                â”‚     â”‚  Tier 2: Pollinations AI    â”‚
â”‚  Table: conversations, messages â”‚     â”‚  Tier 3: Heuristic Engine   â”‚
â”‚  Fallback: analyses-storage.jsonâ”‚     â”‚  Guardrail: Recipe Filter   â”‚
â”‚  Validation: drizzle-zod        â”‚     â”‚  Schema: 10-Dim Forensic    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```


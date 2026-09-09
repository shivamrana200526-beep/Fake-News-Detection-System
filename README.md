# SatyaCheck — Fake News Detection System

SatyaCheck is a web app that helps users identify whether a news article, claim, or social media post is real, fake, or misleading. It uses a multi-model AI approach where GPT and Gemini independently analyze a claim, then Claude synthesizes their findings into a final streamed response.

"Satya" means **Truth** in Sanskrit.

---

## Problem Statement

Misinformation spreads faster than corrections, especially on WhatsApp, Telegram, and social media. Most fact-checking tools require you to already know what to search for. SatyaCheck lets you paste any text, URL, or image and get an immediate, reasoned verdict.

---

## Key Features

- **Multi-model analysis**: GPT and Gemini check a claim independently; Claude synthesizes both into a final verdict
- **Source credibility checker**: Rate any news source or domain by trustworthiness
- **Real-time chat**: Ask follow-up questions about any claim
- **Daily quiz**: 10-question misinformation quiz, regenerated every 24 hours
- **Trending fake news**: GPT-generated list of currently circulating misinformation stories
- **Forward checker**: Analyze WhatsApp-style forwarded messages
- **Image analysis**: Upload screenshots of social posts for analysis
- **Analysis history**: Past analyses stored in PostgreSQL via Drizzle ORM

---

## How the Detection Works

```
User Input (text / URL / image)
        │
        ▼
┌─────────────────┐    ┌─────────────────┐
│  GPT (OpenAI)   │    │ Gemini (Google) │
│  Primary check  │    │ Verification    │
└────────┬────────┘    └────────┬────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌──────────────────┐
         │ Claude (Anthropic)│
         │ Synthesis + stream│
         └──────────────────┘
```

- GPT extracts claims, runs initial fact assessment
- Gemini independently verifies each claim with its own web knowledge
- Claude receives both results and synthesizes a final verdict, streamed token-by-token to the UI

---

## AI Models Used

| Role | Model | Purpose |
|------|-------|---------|
| Primary | GPT-5.2 (OpenAI) | Claim extraction, initial analysis, quiz, trending |
| Secondary | Gemini 2.5 Flash (Google) | Independent verification, image analysis |
| Synthesizer | Claude Sonnet 4.6 (Anthropic) | Final verdict generation, streaming chat |

---

## Tech Stack

**Frontend**
- React 19, TypeScript, Vite 7
- Tailwind CSS v4, shadcn/ui components
- TanStack Query for data fetching
- Wouter for routing

**Backend**
- Node.js, Express 5, TypeScript
- OpenAI SDK, Google GenAI SDK, Anthropic SDK
- Drizzle ORM with PostgreSQL
- Pino for structured logging
- esbuild for production bundling

**Infra**
- Deployed on Render (web service + PostgreSQL)
- pnpm workspaces monorepo

---

## Project Structure

```
satyacheck/
├── artifacts/
│   ├── api-server/          # Express backend
│   │   ├── src/
│   │   │   ├── routes/      # analyze, chat, credibility, quiz, trending
│   │   │   └── lib/         # anthropic client, logger, scraper
│   │   └── build.mjs        # esbuild bundler config
│   └── fake-news-defense/   # React frontend
│       └── src/
│           ├── pages/       # Detect, Chat, Credibility, Quiz, Trending, …
│           └── components/  # UI components (shadcn-based)
├── lib/
│   ├── db/                  # Drizzle schema + migrations
│   ├── api-zod/             # Shared Zod schemas (generated)
│   └── api-client-react/    # Auto-generated React Query hooks
├── scripts/                 # PDF generation scripts
├── render.yaml              # Render deployment config
├── .env.example             # Required environment variables
└── pnpm-workspace.yaml      # Monorepo config
```

---

## Setup

### Prerequisites
- Node.js 20+
- pnpm 12+ (`npm install -g pnpm`)
- PostgreSQL database (local or hosted — Neon/Supabase work well on the free tier)

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/satyacheck.git
cd satyacheck

# Install dependencies
pnpm install

# Copy and fill in environment variables
cp .env.example .env
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | API server port (default: 3000) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `GEMINI_API_KEY` | Yes | Google AI Studio API key |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key |

---

## Running Locally

```bash
# Terminal 1 — Start the backend
cd artifacts/api-server
pnpm dev

# Terminal 2 — Start the frontend
cd artifacts/fake-news-defense
pnpm dev
```

The frontend dev server proxies API calls to `http://localhost:3000` by default.

To build for production:

```bash
pnpm run build
```

The backend serves the frontend static files in production from `artifacts/fake-news-defense/dist/public`.

---

## Example Usage

1. Go to the **Detect** page
2. Paste a claim: *"Drinking bleach cures COVID-19"*
3. Click **Check** — GPT and Gemini run in parallel
4. Claude streams a verdict with reasoning and red flags
5. Use **Chat** to ask follow-up questions

---

## Limitations

- Analysis quality depends on AI model knowledge cutoffs — very recent events may not be verified accurately
- The app does not crawl the live web by default (URL scraping is basic)
- Image analysis is limited to text/screenshots; complex charts may not be interpreted correctly
- Free-tier AI API rate limits apply

---

## Future Improvements

- Add a browser extension for inline fact-checking
- Support regional languages (Hindi, Tamil, Bengali) for WhatsApp misinformation
- Integrate live web search (Serper/Brave Search API) for real-time verification
- Add user accounts and saved analysis history
- Mobile app (React Native)

---

## Credits

Built by Shivam Rana as a college final-year project.

AI tools (GitHub Copilot, Claude) were used for scaffolding boilerplate, generating UI components, and debugging. The project architecture, multi-model integration design, prompt engineering, and implementation decisions were developed and organized by the project author.

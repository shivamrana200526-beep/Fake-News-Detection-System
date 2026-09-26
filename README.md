# 🛡️ SatyaCheck — AI-Powered Fake News Detection System

<div align="center">

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**"Satya" means Truth in Sanskrit.**

SatyaCheck is a full-stack web application that detects whether a news article, claim, or social media post is **Real**, **Fake**, or **Misleading** — powered by a local Ollama AI model with automatic fallback to a free cloud AI (no API key required) and a built-in heuristic engine.

</div>

---

## 👥 Team & Roles

This project is built by a team of 4 engineers, each owning a specific domain.

| Role | Lead Engineer | Key Files Owned |
|------|--------------|-----------------|
| 🎨 **Role 1 — Frontend** | **Tanush** | `frontend-js/src/App.jsx` · all `pages/` · `components/layout/` · `hooks/` · `contexts/AuthContext.jsx` |
| ⚙️ **Role 2 — Backend** | **Shivam** | `artifacts/api-server/src/app.js` · `index.js` · `routes/auth.js` · `routes/health.js` · `lib/scraper.js` · `lib/logger.js` · `api/index.js` |
| 🗄️ **Role 3 — Database** | **Pranav** | `lib/db/src/schema/analyses.js` · `conversations.js` · `messages.js` · `lib/db/src/index.js` |
| 🤖 **Role 4 — AI & API** | **Simar** | `lib/ai-service.js` · `routes/analyze.js` · `routes/chat.js` · `routes/quiz.js` · `routes/trending.js` · `routes/credibility.js` |

### 📂 How to find your files

**On GitHub** → browse the repository folder structure below.

**After cloning** → open the folder matching your role from the project structure section.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **AI Fact-Check** | Paste any text, URL, headline, or image — get a verdict with confidence score |
| 💬 **AI Chat** | SSE-streaming forensic chat assistant for follow-up questions |
| 📊 **Source Credibility** | Rate any news domain for media bias and reliability |
| 📰 **Trending Misinformation** | Feed of currently circulating fake stories |
| 🧠 **Media Literacy Quiz** | 10-question daily quiz to sharpen fact-checking skills |
| 🔐 **Authentication** | Email/password register & login + Google Sign-In |
| 📈 **Analysis History** | Persistent history of all past fact-checks |
| 🤖 **3-Tier AI** | Local Ollama → free pollinations.ai → built-in heuristics (no API key ever needed) |

---

## 🛠️ Tech Stack

### Backend (`artifacts/api-server/`)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | 20+ | Runtime — ES Modules (`"type": "module"`) |
| **Express** | 5 | Web framework & REST API |
| **Pino** | 9 | Structured JSON logging with secret redaction |
| **node:crypto** | built-in | Password hashing (scrypt), token generation |
| **node:fs** | built-in | File-based JSON storage fallback |
| **openai** SDK | 7 | OpenAI-compatible client for Ollama local AI |

### Frontend (`frontend-js/`)
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.1.0 | UI framework |
| **Vite** | 7 | Dev server & build tool |
| **Tailwind CSS** | v4 | Utility-first styling |
| **wouter** | 3 | Lightweight client-side router |
| **@tanstack/react-query** | 5 | Server state & caching |
| **framer-motion** | 12 | Page transition animations |

### Database (`lib/db/`)
| Technology | Purpose |
|-----------|---------|
| **PostgreSQL** | Relational database (optional — app falls back to JSON files if not configured) |
| **Drizzle ORM** | Type-safe query builder and schema manager |
| **drizzle-zod** | Auto-generates Zod insert validators from schema |

### AI Layer
| Tier | Provider | Notes |
|------|----------|-------|
| Tier 1 | **Ollama** (local) | `llama3.2:1b` — runs on your machine, 4s timeout |
| Tier 2 | **pollinations.ai** (free cloud) | Zero API key required, works on Vercel |
| Tier 3 | **Built-in heuristics** | 9 verified fact patterns, pure JS, offline |

---

## 📁 Project Structure

```
Fake-News-Defense/
├── artifacts/
│   └── api-server/              # Express REST API (Shivam)
│       ├── package.json
│       └── src/
│           ├── index.js         # Server entry point, PORT validation
│           ├── app.js           # Express app, CORS, pino-http, static serving
│           ├── lib/
│           │   ├── ai-service.js  # 3-tier AI engine (Simar)
│           │   ├── scraper.js     # URL HTML scraper (Shivam)
│           │   └── logger.js      # Pino structured logger (Shivam)
│           └── routes/
│               ├── index.js       # Route registry (Shivam)
│               ├── auth.js        # /api/auth/* — register, login, google (Shivam)
│               ├── users.js       # /api/users — session-protected admin log (Shivam)
│               ├── health.js      # /api/healthz (Shivam)
│               ├── analyze.js     # /api/analyze — AI fact-check (Simar)
│               ├── chat.js        # /api/chat — SSE streaming chat (Simar)
│               ├── credibility.js # /api/credibility (Simar)
│               ├── trending.js    # /api/trending (Simar)
│               └── quiz.js        # /api/quiz (Simar)
├── api/
│   └── index.js                 # Vercel serverless adapter
├── frontend-js/                 # React 19 + Vite frontend (Tanush)
│   ├── src/
│   │   ├── App.jsx              # Router, ProtectedRoute, AnimatePresence
│   │   ├── main.jsx             # React DOM entry point
│   │   ├── pages/               # Home, Detect, Chat, Dashboard, History,
│   │   │                        # Credibility, Trending, Quiz, Forward,
│   │   │                        # Education, About, Login, not-found
│   │   ├── components/
│   │   │   ├── layout/          # Navbar, Footer, PageWrapper
│   │   │   └── ui/              # 40+ shadcn/Radix UI components
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx  # Auth state, Firebase + backend session
│   │   ├── hooks/               # use-analysis, use-auth, use-voice-input,
│   │   │                        # use-theme, use-toast, use-mobile
│   │   └── lib/
│   │       ├── utils.js         # Tailwind class merge utility
│   │       └── firebase.js      # Firebase SDK init (Google auth)
│   ├── vite.config.js
│   └── vercel.json              # SPA rewrite rules
├── lib/
│   └── db/                      # Drizzle ORM database layer (Pranav)
│       └── src/
│           ├── schema/
│           │   ├── analyses.js  # analyses + analysisResults tables
│           │   ├── conversations.js
│           │   ├── messages.js
│           │   └── index.js
│           └── index.js         # pg Pool + Drizzle client, null-safe
├── vercel.json                  # Root Vercel build config
├── .env.example                 # Environment variable template
├── .gitignore
└── README.md
```

---

## 🚀 How to Run the Project

### Prerequisites

| Requirement | Version | Install Link | Required? |
|-------------|---------|--------------|-----------|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org/) | **Yes** |
| **pnpm** or **npm** | 8+ | Built into Node / `npm install -g pnpm` | **Yes** |
| **Ollama** | Latest | [ollama.com/download](https://ollama.com/download) | *Optional* (app automatically falls back to free cloud AI + offline heuristics if absent) |

---

### Option A: ⚡ One-Command Automatic Run (Windows)

We provide an automated launcher script that checks Node.js, starts Ollama (if available), generates `.env`, installs all dependencies, and boots both frontend and backend concurrently:

```powershell
powershell -ExecutionPolicy Bypass -File setup-and-run.ps1
```

Once launched, open **[http://localhost:5173](http://localhost:5173)** in your browser!

---

### Option B: 🛠️ Step-by-Step Manual Run (Any OS — Windows / macOS / Linux)

Follow these simple steps:

#### Step 1: Clone the Repository
```bash
git clone https://github.com/shivamrana200526-beep/Fake-News-Detection-System.git
cd Fake-News-Detection-System
```

#### Step 2: Configure Environment
Copy `.env.example` to `.env` (the pre-filled defaults work immediately out-of-the-box):
```bash
# On Windows PowerShell:
Copy-Item .env.example .env

# On Linux/macOS or Git Bash:
cp .env.example .env
```

#### Step 3: Install Dependencies
Install dependencies for both root workspace and the React frontend:
```bash
# 1. Install root workspace packages (Backend, ORM, logging)
pnpm install
# (Or if you don't have pnpm: npm install)

# 2. Install frontend packages
cd frontend-js
npm install
cd ..
```

#### Step 4: Download AI Model *(Optional)*
If you want 100% private local AI processing via Ollama:
```bash
ollama pull llama3.2:1b
```
*(If you skip this step, SatyaCheck automatically routes requests to its free zero-config cloud AI, then to built-in rule heuristics.)*

#### Step 5: Start the Servers

You will need **two terminal tabs** open in the project root:

* **Terminal 1: Start Backend API Server**
  ```bash
  npm run dev:backend
  ```
  *(Or directly: `node --env-file=.env artifacts/api-server/src/index.js`)*
  > Backend will be active on **http://localhost:3000** (Health check: `http://localhost:3000/api/healthz`)

* **Terminal 2: Start Frontend Application**
  ```bash
  npm run dev:frontend
  ```
  *(Or directly: `cd frontend-js && npm run dev`)*
  > Frontend will be running on **http://localhost:5173**

#### Step 6: Open the Application
Navigate to **[http://localhost:5173](http://localhost:5173)** in any browser. Log in or create an account, and start fact-checking!

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Register with email & password | No |
| `POST` | `/api/auth/login` | Sign in with email & password | No |
| `POST` | `/api/auth/google` | Sign in / register via Google | No |
| `GET` | `/api/auth/me` | Get current session user | Yes (Bearer token) |
| `POST` | `/api/auth/forgot-password` | Request password reset | No |

### Core Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/healthz` | Server health check |
| `POST` | `/api/analyze` | Run AI fact-check (`{content, type}`) |
| `GET` | `/api/history` | Past analysis results |
| `GET` | `/api/stats` | Analysis statistics (total / real / fake / misleading) |
| `POST` | `/api/chat` | Streaming AI chat — Server-Sent Events |
| `POST` | `/api/credibility` | Source credibility rating (`{source}`) |
| `GET` | `/api/trending` | Trending misinformation stories |
| `GET` | `/api/quiz` | Daily media literacy quiz |

### Example: Fact-Check a Claim

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "Drinking bleach cures COVID-19", "type": "text"}'
```

**Response:**
```json
{
  "prediction": "Fake",
  "confidence": 100,
  "explanation": "Bleach is a toxic chemical. Ingesting it is life-threatening and does not cure any disease.",
  "keywords": ["verified-fact", "historical-record"],
  "manipulationScore": 85
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root (copy from `.env.example`).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Backend server port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `OLLAMA_BASE_URL` | No | `http://127.0.0.1:11434/v1` | Ollama API base URL |
| `OLLAMA_MODEL` | No | `llama3.2:1b` | Local AI model name |
| `DATABASE_URL` | No | — | PostgreSQL connection string. If omitted, app uses `analyses-storage.json` automatically |

---

## 🔒 Security

- Passwords hashed with **`crypto.scryptSync`** + unique random salt — never stored in plaintext
- Session tokens generated with **`crypto.randomBytes(32)`** — cryptographically secure
- **`crypto.timingSafeEqual`** used for password comparison — prevents timing attacks
- `passwordHash` and `token` fields are **stripped from all API responses** via `sanitizeUser()`
- `GET /api/users` requires a valid Bearer session token — not publicly accessible
- `.env`, `users-storage.json`, `analyses-storage.json` are excluded from Git via `.gitignore`
- Forgot-password always returns success — prevents email enumeration

---

## 🐛 Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `Error: .env file not found` | Missing `.env` | Run `cp .env.example .env` |
| `Cannot find module '@workspace/db'` | pnpm deps not installed | Run `pnpm install` from root |
| `ECONNREFUSED 11434` | Ollama not running | Run `ollama serve` — or ignore, app falls back automatically |
| `Port 3000 already in use` | Port conflict | Set `PORT=3001` in `.env` |
| `pnpm: command not found` | pnpm not installed | `npm install -g pnpm` |
| Frontend CORS errors | Backend not running | Start backend first on port 3000 |

---

## 🌐 Deployment

### Vercel (Recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → select this repo
3. Vercel auto-detects `vercel.json` at the root — no manual build config needed
4. Add environment variables in the Vercel dashboard if you want a PostgreSQL database

The `vercel.json` at the root handles:
- Building the frontend (`frontend-js/`)
- Routing all `/api/*` requests to `api/index.js` serverless function
- Redirecting all other routes to `index.html` (SPA routing)

> **Note:** On Vercel, Ollama cannot run locally. The app automatically uses the free `pollinations.ai` cloud AI fallback — no configuration needed.

### Self-Hosted (Render / Railway / VPS)

```bash
NODE_ENV=production
PORT=3000
OLLAMA_BASE_URL=<your-ollama-server-url>
DATABASE_URL=<your-postgresql-connection-string>
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE).

---

## 👨‍💻 Authors

| Name | Role | GitHub |
|------|------|--------|
| **Shivam** | Backend Development | [@shivamrana200526-beep](https://github.com/shivamrana200526-beep) |
| **Tanush** | Frontend Development | — |
| **Pranav** | Database Architecture | — |
| **Simar** | AI & API Integration | — |

> Built as a college project. SatyaCheck uses no external paid APIs — all AI runs locally via Ollama or the free pollinations.ai fallback.

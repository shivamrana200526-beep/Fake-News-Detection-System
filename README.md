# 🛡️ SatyaCheck — AI-Powered Fake News Detection System

<div align="center">

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/shivamrana200526-beep/Fake-News-Detection-System)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**"Satya" means Truth in Sanskrit.**

SatyaCheck is a full-stack web application that uses locally-running AI to detect whether a news article, claim, or social media post is **Real**, **Fake**, or **Misleading** — with no external API costs, no data sent to third parties, and no internet dependency for analysis.

</div>

---

## 📋 Table of Contents

- [Team & Roles](#-team--roles)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 👥 Team & Roles

This project is built by a team of 4 engineers, each owning a specific domain.
**Each person's full technical documentation (code samples + file ownership) is in their PDF below.**

| Role | Lead Engineer | PDF File | Key Files Owned |
|------|--------------|----------|-----------------|
| 🎨 **Role 1 — Frontend** | **Tanush** | [`Role_1_Tanush_Frontend_Development.pdf`](SatyaCheck_Roles_PDFs/Role_1_Tanush_Frontend_Development.pdf) | `frontend-js/src/App.jsx` · `pages/Detect.jsx` · `pages/Chat.jsx` · `pages/Dashboard.jsx` · `pages/History.jsx` · `pages/Credibility.jsx` · `pages/Trending.jsx` · `pages/Quiz.jsx` · `pages/Forward.jsx` · `pages/Login.jsx` · `hooks/use-analysis.js` · `hooks/use-theme.js` · `hooks/use-voice-input.js` · `components/layout/Navbar.jsx` · `vite.config.js` · `frontend-js/vercel.json` |
| ⚙️ **Role 2 — Backend** | **Shivam** | [`Role_2_Shivam_Backend_Development.pdf`](SatyaCheck_Roles_PDFs/Role_2_Shivam_Backend_Development.pdf) | `artifacts/api-server/src/app.js` · `src/index.js` · `routes/index.js` · `routes/analyze.js` · `routes/chat.js` · `routes/auth.js` · `routes/health.js` · `lib/scraper.js` · `lib/logger.js` · `api/index.js` · `setup-and-run.ps1` · `vercel.json` |
| 🗄️ **Role 3 — Database** | **Pranav** | [`Role_3_Pranav_Database_Architecture.pdf`](SatyaCheck_Roles_PDFs/Role_3_Pranav_Database_Architecture.pdf) | `lib/db/src/schema/analyses.js` · `schema/conversations.js` · `schema/messages.js` · `schema/index.js` · `lib/db/src/index.js` · `lib/db/drizzle.config.js` |
| 🤖 **Role 4 — AI & API** | **Simar** | [`Role_4_Simar_AI_and_API_Integration.pdf`](SatyaCheck_Roles_PDFs/Role_4_Simar_AI_and_API_Integration.pdf) | `artifacts/api-server/src/lib/ai-service.js` · `routes/chat.js` (AI logic) · `routes/analyze.js` (prompts) · `routes/quiz.js` · `routes/trending.js` · `routes/credibility.js` |

### 📂 How to find your file

**On GitHub** → Click [`SatyaCheck_Roles_PDFs/`](SatyaCheck_Roles_PDFs/) folder → click your PDF.

**After cloning** → look inside `SatyaCheck_Roles_PDFs/` folder:

```
SatyaCheck_Roles_PDFs/
├── Role_1_Tanush_Frontend_Development.pdf       ← Tanush open this
├── Role_2_Shivam_Backend_Development.pdf        ← Shivam open this
├── Role_3_Pranav_Database_Architecture.pdf      ← Pranav open this
└── Role_4_Simar_AI_and_API_Integration.pdf      ← Simar open this
```

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔍 **AI Fact-Check** | Paste any text, URL, or claim — get a verdict with confidence score |
| 💬 **AI Chat** | Ask follow-up questions about any fact-checked claim |
| 📊 **Source Credibility** | Rate any news domain or source for trustworthiness |
| 📰 **Trending Misinformation** | Live feed of currently circulating fake stories |
| 🧠 **Media Literacy Quiz** | 10-question daily quiz to sharpen your fact-checking skills |
| 🔐 **Authentication** | Email/password register & login + Google Sign-In |
| 📈 **Analysis History** | Persistent history of all past fact-checks |
| 🔒 **100% Local AI** | Powered by Ollama — no API keys, no data leaves your machine |

---

## 🛠️ Tech Stack

### Backend (`artifacts/api-server/`)
| Technology | Purpose |
|-----------|---------|
| **Node.js 20+** | Runtime — ES Modules (ESM) |
| **Express 5** | Web framework & REST API |
| **Ollama** | Local AI model runner |
| **crypto** (built-in) | Password hashing (scrypt), token generation |
| **fs / path** (built-in) | File-based storage fallback |
| **Pino** | Structured JSON logging |
| **CORS** | Cross-origin request handling |

### Frontend (`frontend-js/`)
| Technology | Purpose |
|-----------|---------|
| **React 18** | UI framework |
| **Vite** | Dev server & build tool |
| **Tailwind CSS v4** | Utility-first styling |
| **shadcn/ui** | Pre-built accessible components |

### AI Model
| Model | Runner | Notes |
|-------|--------|-------|
| `llama3.2:1b` | Ollama | Runs 100% locally, ~700MB download |

---

## 📁 Project Structure

```
Fake-News-Defense/
├── artifacts/
│   └── api-server/              # Express REST API backend (Shivam)
│       └── src/
│           ├── index.js         # Server entry point
│           ├── app.js           # Express app, middleware, CORS
│           ├── lib/
│           │   ├── ai-service.js  # Multi-tier AI engine (Simran)
│           │   ├── scraper.js     # URL article extractor (Shivam)
│           │   └── logger.js      # Structured Pino logging (Shivam)
│           └── routes/
│               ├── index.js       # Route aggregator (Shivam)
│               ├── auth.js        # /api/auth/* — register, login (Shivam)
│               ├── analyze.js     # /api/analyze — AI fact-check (Shivam + Simran)
│               ├── chat.js        # /api/chat — SSE streaming (Shivam + Simran)
│               ├── credibility.js # /api/credibility (Simran)
│               ├── trending.js    # /api/trending (Simran)
│               ├── quiz.js        # /api/quiz (Simran)
│               ├── health.js      # /api/healthz (Shivam)
│               └── users.js       # /api/users/* (Shivam)
├── api/
│   └── index.js                 # Vercel serverless gateway (Shivam)
├── frontend-js/                 # React + Vite frontend (Tanush)
│   ├── src/
│   │   ├── App.jsx              # Router shell
│   │   ├── pages/               # Home, Detect, Chat, Dashboard, History...
│   │   ├── components/          # Navbar, Footer, UI primitives
│   │   ├── contexts/            # AuthContext
│   │   └── hooks/               # use-analysis, use-theme, use-voice-input
│   └── vercel.json              # SPA rewrite rules
├── lib/
│   └── db/                      # Drizzle ORM schema (Pranav)
│       └── src/
│           ├── schema/
│           │   ├── analyses.js  # Forensic analysis table
│           │   ├── conversations.js
│           │   ├── messages.js
│           │   └── index.js
│           └── index.js         # Database client factory
├── SatyaCheck_Roles_PDFs/       # Team role documentation
│   ├── Role_1_Tanush_Frontend_Development.pdf
│   ├── Role_2_Shivam_Backend_Development.pdf
│   ├── Role_3_Pranav_Database_Architecture.pdf
│   └── Role_4_Simar_AI_and_API_Integration.pdf
├── vercel.json                  # Root Vercel build config
├── .env.example                 # Environment variable template
├── .gitignore                   # Excludes .env, node_modules, user data
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed before running the project:

| Requirement | Version | Install |
|-------------|---------|---------|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 8+ | `npm install -g pnpm` |
| **Ollama** | Latest | [ollama.com/download](https://ollama.com/download) |

### 1. Clone the Repository

```bash
git clone https://github.com/shivamrana200526-beep/Fake-News-Detection-System.git
cd Fake-News-Detection-System
```

### 2. Set Up Environment Variables

```bash
# Copy the example env file
cp .env.example .env
```

The default values in `.env` work out of the box — no changes needed for local development.

> ⚠️ **Never commit `.env` to Git.** It is already listed in `.gitignore`.

### 3. Install Dependencies

```bash
# Install all workspace dependencies from the root
pnpm install

# Install frontend dependencies separately
cd frontend-js && npm install && cd ..
```

### 4. Download the AI Model (First Time Only)

```bash
# Pull the AI model (~700MB, one-time download)
ollama pull llama3.2:1b
```

### 5. Start the Application

**Terminal 1 — AI Model:**
```bash
ollama serve
```

**Terminal 2 — Backend API:**
```bash
# From the project root
node --env-file=".env" artifacts/api-server/src/index.js
```

**Terminal 3 — Frontend:**
```bash
cd frontend-js
npm run dev
```

### 6. Open the App

| Service | URL |
|---------|-----|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:3000](http://localhost:3000) |
| Health Check | [http://localhost:3000/api/healthz](http://localhost:3000/api/healthz) |

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/register` | Create a new account | No |
| `POST` | `/api/auth/login` | Sign in with email & password | No |
| `POST` | `/api/auth/google` | Sign in with Google | No |
| `GET` | `/api/auth/me` | Get current user session | Yes (Bearer token) |
| `POST` | `/api/auth/forgot-password` | Request password reset | No |

### Core Features

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/healthz` | Server health check |
| `POST` | `/api/analyze` | Run AI fact-check on a claim or URL |
| `GET` | `/api/history` | Get past analysis results |
| `GET` | `/api/stats` | Analysis statistics |
| `POST` | `/api/chat` | Streaming AI chat (Server-Sent Events) |
| `GET` | `/api/credibility?domain=<url>` | Source credibility rating |
| `GET` | `/api/trending` | Trending misinformation stories |
| `GET` | `/api/quiz` | Daily media literacy quiz |

### Example: Fact-Check a Claim

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"content": "Drinking bleach cures COVID-19", "sourceType": "text"}'
```

**Response:**
```json
{
  "prediction": "Fake",
  "confidence": 99,
  "explanation": "This claim is medically dangerous and completely false.",
  "keywords": ["bleach", "COVID-19"],
  "manipulationScore": 95
}
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root. See [`.env.example`](.env.example) for a full template.

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Backend server port |
| `NODE_ENV` | No | `development` | `development` or `production` |
| `OLLAMA_BASE_URL` | No | `http://127.0.0.1:11434/v1` | Ollama API endpoint |
| `OLLAMA_MODEL` | No | `llama3.2:1b` | AI model to use |
| `DATABASE_URL` | No | — | PostgreSQL connection string. If not set, the app uses local JSON file storage automatically |

---

## 🐛 Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `Error: .env file not found` | Missing `.env` | Run `cp .env.example .env` |
| `Cannot find module '@workspace/db'` | Dependencies not installed | Run `pnpm install` from root |
| `ECONNREFUSED 11434` | Ollama not running | Run `ollama serve` in a terminal |
| `Port 3000 already in use` | Another process on port 3000 | Change `PORT=3001` in `.env` |
| `pnpm: command not found` | pnpm not installed | Run `npm install -g pnpm` |
| Frontend API errors (CORS) | Backend not running | Start backend first on port 3000 |

---

## 🌐 Deployment

### Environment Setup for Production

When deploying (Render, Railway, Vercel, etc.), set these environment variables in your platform's dashboard:

```
NODE_ENV=production
PORT=3000
OLLAMA_BASE_URL=<your-ollama-endpoint>
OLLAMA_MODEL=llama3.2:1b
DATABASE_URL=<your-postgresql-connection-string>
```

> **Note:** Ollama must be hosted separately or use a compatible API endpoint for cloud deployment.

### Build for Production

```bash
# Build the frontend
cd frontend-js && npm run build

# The Express backend will serve the built frontend from /dist in production
```

---

## 🔒 Security

- Passwords are hashed using **`crypto.scryptSync`** with a unique salt per user — never stored in plain text
- Session tokens are generated with **`crypto.randomBytes(32)`** — cryptographically secure
- **`crypto.timingSafeEqual`** is used for password comparison to prevent timing attacks
- `.env` files are excluded from version control via `.gitignore`
- User data files (`users-storage.json`, `analyses-storage.json`) are excluded from Git

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Shivam Rana**
GitHub: [@shivamrana200526-beep](https://github.com/shivamrana200526-beep)

> Built as a college final-year project. AI tools were used for scaffolding. Project architecture, AI integration, prompt engineering, and implementation decisions were developed by the author.

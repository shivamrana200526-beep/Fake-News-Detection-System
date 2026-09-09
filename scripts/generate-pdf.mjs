import puppeteer from "puppeteer-core";
import fs from "fs";

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Times+New+Roman&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Georgia', 'Times New Roman', serif; color: #1a1a1a; font-size: 12px; line-height: 1.7; background: white; }

  /* Cover Page */
  .cover { width: 100%; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 40px; border: 12px double #1a3a5c; margin: 20px; page-break-after: always; }
  .cover .univ { font-size: 13px; font-weight: bold; letter-spacing: 2px; text-transform: uppercase; color: #1a3a5c; margin-bottom: 6px; }
  .cover .dept { font-size: 11px; color: #444; margin-bottom: 30px; }
  .cover .logo-placeholder { width: 90px; height: 90px; border: 3px solid #1a3a5c; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; font-size: 28px; color: #1a3a5c; font-weight: bold; }
  .cover h1 { font-size: 22px; font-weight: bold; color: #1a3a5c; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; border-top: 2px solid #1a3a5c; border-bottom: 2px solid #1a3a5c; padding: 10px 0; }
  .cover h2 { font-size: 15px; color: #333; margin: 16px 0 30px; font-style: italic; }
  .cover .subtitle { font-size: 12px; color: #555; margin-bottom: 40px; }
  .cover .team-box { background: #f5f8fc; border: 1px solid #1a3a5c; border-radius: 4px; padding: 16px 30px; margin: 20px 0; display: inline-block; min-width: 340px; }
  .cover .team-box h3 { color: #1a3a5c; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; border-bottom: 1px solid #1a3a5c; padding-bottom: 5px; }
  .cover .team-box p { font-size: 12px; color: #222; margin: 4px 0; }
  .cover .footer-info { margin-top: 30px; font-size: 11px; color: #666; }
  .cover .footer-info span { margin: 0 10px; }

  /* Content */
  .page { padding: 50px 55px; page-break-inside: avoid; }
  .toc { page-break-after: always; }
  h1.section-title { font-size: 16px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #1a3a5c; border-bottom: 2px solid #1a3a5c; padding-bottom: 5px; margin: 28px 0 14px; }
  h2.sub-title { font-size: 13px; font-weight: bold; color: #1a3a5c; margin: 20px 0 8px; padding-left: 12px; border-left: 4px solid #c0392b; }
  h3.concept { font-size: 12px; font-weight: bold; color: #333; margin: 12px 0 5px; }
  p { margin-bottom: 8px; text-align: justify; }
  ul, ol { margin: 6px 0 10px 20px; }
  li { margin: 3px 0; }

  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 11px; }
  thead tr { background: #1a3a5c; color: white; }
  th { padding: 8px 10px; text-align: left; font-weight: bold; }
  td { border: 1px solid #ccc; padding: 7px 10px; vertical-align: top; }
  tr:nth-child(even) td { background: #f5f8fc; }

  pre, code { font-family: 'Courier New', monospace; font-size: 10.5px; background: #f0f0f0; border: 1px solid #ddd; border-left: 3px solid #1a3a5c; padding: 10px 14px; display: block; white-space: pre-wrap; border-radius: 3px; margin: 8px 0; color: #1a1a1a; }

  .highlight-box { background: #eef4fb; border: 1px solid #1a3a5c; border-radius: 4px; padding: 10px 14px; margin: 10px 0; }
  .note-box { background: #fffbea; border-left: 4px solid #f39c12; padding: 8px 14px; margin: 10px 0; font-style: italic; font-size: 11px; }
  .page-num { text-align: center; font-size: 10px; color: #888; margin-top: 30px; }
  .section-block { page-break-inside: avoid; margin-bottom: 24px; }
  .toc-item { display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dotted #ccc; font-size: 12px; }
  .toc-item span:first-child { color: #1a3a5c; }

  .abstract { font-style: italic; background: #f9f9f9; border: 1px solid #ddd; padding: 14px 18px; margin: 12px 0 20px; border-radius: 3px; text-align: justify; }
  .chapter-header { background: #1a3a5c; color: white; padding: 8px 16px; border-radius: 3px; margin: 20px 0 14px; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; }
</style>
</head>
<body>

<!-- COVER PAGE -->
<div class="cover">
  <div class="univ">Department of Computer Science & Engineering</div>
  <div class="dept">Bachelor of Technology | Final Year Project Report</div>

  <div class="logo-placeholder">SC</div>

  <h1>SatyaCheck</h1>
  <h2>An AI-Powered Fake News Detection and Verification System</h2>
  <p class="subtitle">Using Multi-Model Artificial Intelligence (OpenAI · Google Gemini · Anthropic Claude)<br/>with Real-Time Fact Verification and Media Literacy Education</p>

  <div class="team-box">
    <h3>Submitted By</h3>
    <p><strong>Student 1</strong> — Backend Developer &nbsp;|&nbsp; Roll No. ___</p>
    <p><strong>Student 2</strong> — Frontend Developer &nbsp;|&nbsp; Roll No. ___</p>
    <p><strong>Student 3</strong> — AI/ML Engineer &nbsp;|&nbsp; Roll No. ___</p>
    <p><strong>Student 4</strong> — Database & DevOps &nbsp;|&nbsp; Roll No. ___</p>
  </div>

  <div class="team-box" style="margin-top:10px;">
    <h3>Submitted To</h3>
    <p><strong>Prof. / Dr. ___________________________</strong></p>
    <p>Department of Computer Science & Engineering</p>
  </div>

  <div class="footer-info">
    <span>Academic Year: 2025–2026</span>
    <span>|</span>
    <span>Date: July 28, 2026</span>
    <span>|</span>
    <span>Semester: VIII</span>
  </div>
</div>

<!-- TABLE OF CONTENTS -->
<div class="page toc">
  <h1 class="section-title">Table of Contents</h1>
  <br/>
  <div class="toc-item"><span>1. Abstract</span><span>3</span></div>
  <div class="toc-item"><span>2. Project Overview & Novelty Factor</span><span>3</span></div>
  <div class="toc-item"><span>3. Technology Stack</span><span>4</span></div>
  <div class="toc-item"><span>4. System Architecture</span><span>4</span></div>
  <div class="toc-item"><span>5. Backend Engineering Concepts Learned</span><span>5</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.1 REST API Design</span><span>5</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.2 OpenAPI Contract-First Development</span><span>5</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.3 Input Validation using Zod</span><span>6</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.4 Database Design (PostgreSQL + Drizzle ORM)</span><span>6</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.5 Multi-Model AI Integration</span><span>7</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.6 Middleware Architecture</span><span>7</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.7 Structured Logging</span><span>8</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.8 Environment Variables & Secret Management</span><span>8</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.9 Deployment & Infrastructure as Code</span><span>9</span></div>
  <div class="toc-item"><span>&nbsp;&nbsp;&nbsp;5.10 Monorepo Architecture (pnpm Workspaces)</span><span>9</span></div>
  <div class="toc-item"><span>6. Phased Development Approach</span><span>10</span></div>
  <div class="toc-item"><span>7. Team Work Division</span><span>10</span></div>
  <div class="toc-item"><span>8. Complete Request-Response Flow</span><span>11</span></div>
  <div class="toc-item"><span>9. Conclusion</span><span>11</span></div>
</div>

<!-- MAIN CONTENT -->
<div class="page">

  <!-- ABSTRACT -->
  <h1 class="section-title">1. Abstract</h1>
  <div class="abstract">
    This report presents SatyaCheck, an AI-powered fake news detection and verification web application developed as a final year project. The system leverages three state-of-the-art large language models — OpenAI GPT, Google Gemini, and Anthropic Claude — to provide multi-model consensus-based fact verification. The application accepts news content in the form of text, URLs, headlines, and images, analyzes the credibility of the content, and provides detailed explanations for its verdicts. This report documents the complete backend engineering process including API design, database architecture, AI integration, middleware implementation, and cloud deployment. The project aligns with United Nations Sustainable Development Goal 16: Peace, Justice and Strong Institutions, specifically targeting the global challenge of misinformation.
  </div>

  <!-- PROJECT OVERVIEW -->
  <h1 class="section-title">2. Project Overview & Novelty Factor</h1>
  <div class="section-block">
    <p>SatyaCheck is a full-stack web application that enables users to verify the authenticity of news content using artificial intelligence. Unlike traditional single-model fact-checkers, our system employs three independent AI models to arrive at a consensus verdict, significantly improving reliability and reducing false positives/negatives.</p>

    <h2 class="sub-title">Key Features</h2>
    <ul>
      <li><strong>/detect</strong> — Submit text, URL, headline, or image for AI-powered analysis</li>
      <li><strong>/dashboard</strong> — View statistics and recent analysis history</li>
      <li><strong>/chat</strong> — Conversational AI chatbot for follow-up questions</li>
      <li><strong>/credibility</strong> — Check credibility score of news sources</li>
      <li><strong>/quiz</strong> — Interactive media literacy quiz</li>
      <li><strong>/trending</strong> — Trending misinformation topics</li>
      <li><strong>/education</strong> — Media literacy resources and learning material</li>
    </ul>

    <h2 class="sub-title">Novelty Factors</h2>
    <ul>
      <li><strong>Multi-Model AI Consensus:</strong> Three AI models independently analyze and cross-verify content, reducing single-model bias</li>
      <li><strong>Multi-Modal Input:</strong> Accepts text, URL, headline, and image — not just plain text</li>
      <li><strong>Explainable AI:</strong> Per-claim fact breakdowns with individual confidence scores, not just a True/False verdict</li>
      <li><strong>Interactive Follow-Up Chat:</strong> Users can ask follow-up questions after analysis</li>
      <li><strong>Education Layer:</strong> Built-in media literacy module aligned with SDG goals</li>
    </ul>
  </div>

  <!-- TECH STACK -->
  <h1 class="section-title">3. Technology Stack</h1>
  <table>
    <thead><tr><th>Layer</th><th>Technology</th><th>Purpose</th></tr></thead>
    <tbody>
      <tr><td>Frontend</td><td>React 18 + Vite (TypeScript)</td><td>User Interface</td></tr>
      <tr><td>Backend</td><td>Express 5 (Node.js, TypeScript)</td><td>REST API Server</td></tr>
      <tr><td>Database</td><td>PostgreSQL + Drizzle ORM</td><td>Persistent Data Storage</td></tr>
      <tr><td>Primary AI</td><td>OpenAI GPT-5.2</td><td>Content Analysis & Reasoning</td></tr>
      <tr><td>Verification AI</td><td>Google Gemini 2.5 Flash</td><td>Independent Fact Checking</td></tr>
      <tr><td>Chat AI</td><td>Anthropic Claude</td><td>Conversational Explanation</td></tr>
      <tr><td>API Contract</td><td>OpenAPI 3.0 + Orval Codegen</td><td>Type-Safe API Generation</td></tr>
      <tr><td>Validation</td><td>Zod</td><td>Runtime Schema Validation</td></tr>
      <tr><td>Logging</td><td>Pino</td><td>Structured Production Logging</td></tr>
      <tr><td>Monorepo</td><td>pnpm Workspaces</td><td>Multi-Package Management</td></tr>
      <tr><td>Deployment</td><td>Render.com + render.yaml</td><td>Cloud Hosting & CI/CD</td></tr>
    </tbody>
  </table>

  <!-- ARCHITECTURE -->
  <h1 class="section-title">4. System Architecture</h1>
  <div class="section-block">
    <pre>┌─────────────────────────────────────────────────────────────┐
│                    MONOREPO (pnpm Workspaces)                │
├────────────────────────┬────────────────────────────────────┤
│        lib/            │           artifacts/               │
│  ┌─────────────────┐   │   ┌──────────────────────────┐    │
│  │  api-spec/      │   │   │  fake-news-defense/       │    │
│  │  (OpenAPI YAML) │──────▶│  (React + Vite Frontend)  │    │
│  └────────┬────────┘   │   └──────────────────────────┘    │
│           │ Orval       │                                    │
│  ┌────────▼────────┐   │   ┌──────────────────────────┐    │
│  │  api-client-    │──────▶│  api-server/              │    │
│  │  react/         │   │   │  (Express Backend)        │    │
│  │  (React Hooks)  │   │   └──────────────────────────┘    │
│  └─────────────────┘   │                                    │
│  ┌─────────────────┐   │                                    │
│  │  db/ (Drizzle)  │──────▶ PostgreSQL Database             │
│  └─────────────────┘   │                                    │
│  ┌─────────────────┐   │                                    │
│  │  integrations/  │──────▶ OpenAI / Gemini / Anthropic     │
│  └─────────────────┘   │                                    │
└────────────────────────┴────────────────────────────────────┘</pre>
  </div>

  <!-- BACKEND CONCEPTS -->
  <h1 class="section-title">5. Backend Engineering Concepts Learned</h1>

  <div class="section-block">
    <div class="chapter-header">5.1 REST API Design</div>
    <p>Representational State Transfer (REST) is the architectural style used for designing our API. Each endpoint corresponds to a specific resource and uses HTTP methods to define the operation being performed.</p>
    <pre>GET    /api/stats       → Retrieve analysis statistics
POST   /api/analyze     → Submit content for analysis
GET    /api/history     → Retrieve past analysis records
POST   /api/chat        → Send a chat message to AI
GET    /api/trending    → Fetch trending misinformation topics
POST   /api/credibility → Check source credibility</pre>
    <table>
      <thead><tr><th>HTTP Method</th><th>Operation</th><th>Use Case in Project</th></tr></thead>
      <tbody>
        <tr><td>GET</td><td>Read / Retrieve</td><td>Fetching history, stats, trending topics</td></tr>
        <tr><td>POST</td><td>Create / Submit</td><td>Submitting content for analysis, chat messages</td></tr>
        <tr><td>PUT</td><td>Update</td><td>Updating user preferences or records</td></tr>
        <tr><td>DELETE</td><td>Remove</td><td>Deleting stored analysis records</td></tr>
      </tbody>
    </table>
    <p>Each endpoint follows standard HTTP status codes: 200 (Success), 400 (Bad Request), 404 (Not Found), and 500 (Internal Server Error).</p>
  </div>

  <div class="section-block">
    <div class="chapter-header">5.2 OpenAPI Contract-First Development</div>
    <p>We adopted a Contract-First development approach, where the API contract is defined before any code is written. The contract is specified in <code>lib/api-spec/openapi.yaml</code> using the OpenAPI 3.0 standard.</p>
    <pre># Example from openapi.yaml
/api/analyze:
  post:
    summary: Analyze content for misinformation
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              content:
                type: string
              type:
                type: string
                enum: [text, url, headline, image]
    responses:
      '200':
        description: Analysis result
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AnalysisResponse'</pre>
    <p>The <strong>Orval</strong> code generation tool reads this YAML and automatically generates: (1) TypeScript React Query hooks for the frontend, and (2) Zod validation schemas for the backend. This eliminates the need to manually write and maintain duplicate type definitions across frontend and backend.</p>
    <div class="highlight-box">
      <strong>Key Benefit:</strong> Any change to the OpenAPI spec is propagated to both frontend and backend by re-running <code>pnpm --filter @workspace/api-spec run codegen</code>, ensuring the two layers are always in sync.
    </div>
  </div>

  <div class="section-block">
    <div class="chapter-header">5.3 Input Validation using Zod</div>
    <p>User-submitted data must never be trusted without validation. We used <strong>Zod</strong>, a TypeScript-first schema validation library, to validate all incoming request bodies before processing.</p>
    <pre>// Generated Zod schema from OpenAPI spec
const analyzeRequestSchema = z.object({
  content: z.string().min(1, "Content is required"),
  type: z.enum(["text", "url", "headline", "image"]),
});

// Usage in route handler
const parsed = analyzeRequestSchema.safeParse(req.body);
if (!parsed.success) {
  return res.status(400).json({ error: parsed.error.format() });
}</pre>
    <p>If a user submits an empty string or an unsupported content type (e.g., "video"), the server immediately returns a 400 error with a clear, descriptive message — without ever reaching the AI processing layer.</p>
  </div>

  <div class="section-block">
    <div class="chapter-header">5.4 Database Design (PostgreSQL + Drizzle ORM)</div>
    <p>We used <strong>PostgreSQL</strong> as our relational database and <strong>Drizzle ORM</strong> for type-safe database interactions. Drizzle allows writing database queries in TypeScript, which are then compiled to SQL.</p>
    <pre>// Schema definition in lib/db/src/schema/analyses.ts
export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  contentType: varchar("content_type", { length: 20 }).notNull(),
  verdict: varchar("verdict", { length: 20 }).notNull(),
  confidence: integer("confidence").notNull(),
  explanation: text("explanation"),
  createdAt: timestamp("created_at").defaultNow(),
});</pre>
    <table>
      <thead><tr><th>Table</th><th>Purpose</th><th>Key Columns</th></tr></thead>
      <tbody>
        <tr><td>analyses</td><td>Stores each analysis request and result</td><td>id, content, verdict, confidence, createdAt</td></tr>
        <tr><td>conversations</td><td>Stores chat session metadata</td><td>id, analysisId, createdAt</td></tr>
        <tr><td>messages</td><td>Stores individual chat messages</td><td>id, conversationId, role, content</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section-block">
    <div class="chapter-header">5.5 Multi-Model AI Integration</div>
    <p>The core innovation of SatyaCheck is its multi-model analysis pipeline. Three AI models process the same content independently and their results are combined to produce a high-confidence verdict.</p>
    <pre>// Simplified flow in artifacts/api-server/src/routes/analyze.ts

// Step 1: Primary analysis using OpenAI
const openaiResult = await openai.chat.completions.create({
  model: "gpt-5.2",
  messages: [{ role: "user", content: analysisPrompt }],
});

// Step 2: Cross-verification using Gemini
const geminiResult = await gemini.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [{ role: "user", parts: [{ text: verifyPrompt }] }],
});

// Step 3: Combine results for consensus verdict
const finalVerdict = combineResults(openaiResult, geminiResult);</pre>
    <table>
      <thead><tr><th>AI Model</th><th>Provider</th><th>Role in System</th></tr></thead>
      <tbody>
        <tr><td>GPT-5.2</td><td>OpenAI</td><td>Primary analysis, reasoning, confidence scoring</td></tr>
        <tr><td>Gemini 2.5 Flash</td><td>Google</td><td>Independent fact verification, claim-by-claim check</td></tr>
        <tr><td>Claude</td><td>Anthropic</td><td>Conversational explanation in the chat interface</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section-block">
    <div class="chapter-header">5.6 Middleware Architecture</div>
    <p>Middleware functions are a central pattern in Express.js. Each incoming request passes through a chain of middleware before reaching the route handler. This keeps concerns separated and the code modular.</p>
    <pre>// Middleware chain in artifacts/api-server/src/app.ts
app.use(cors());                    // 1. Cross-Origin Resource Sharing
app.use(pinoHttp({ logger }));      // 2. HTTP request logging
app.use(express.json({ limit: "50mb" }));  // 3. JSON body parsing
app.use("/api", router);            // 4. Route handling</pre>
    <ul>
      <li><strong>CORS:</strong> Controls which domains are allowed to make requests to our API, preventing unauthorized cross-origin access</li>
      <li><strong>Pino HTTP:</strong> Automatically logs every incoming request with method, URL, status code, and response time</li>
      <li><strong>Body Parser:</strong> Parses the JSON request body and makes it available as a JavaScript object on <code>req.body</code></li>
    </ul>
  </div>

  <div class="section-block">
    <div class="chapter-header">5.7 Structured Logging with Pino</div>
    <p>Production applications require structured, queryable logs rather than simple <code>console.log</code> statements. We used <strong>Pino</strong>, a high-performance JSON logger for Node.js.</p>
    <pre>// Correct way — structured log in a route handler
req.log.info({
  event: "analysis_complete",
  verdict: result.verdict,
  confidence: result.confidence,
  durationMs: Date.now() - startTime,
});

// Wrong way — avoid in production
console.log("Analysis done"); // No structure, no queryability</pre>
    <p>Structured logs allow operations teams to filter, search, and monitor application behavior in production — for example, finding all requests where confidence was below 60%, or identifying slow AI responses.</p>
  </div>

  <div class="section-block">
    <div class="chapter-header">5.8 Environment Variables & Secret Management</div>
    <p>Sensitive credentials such as API keys and database connection strings must never be hardcoded in source code. We used environment variables, which are injected at runtime and excluded from version control.</p>
    <pre># .env file — never committed to GitHub
AI_INTEGRATIONS_OPENAI_API_KEY=sk-...
AI_INTEGRATIONS_GEMINI_API_KEY=AIza...
AI_INTEGRATIONS_ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql://user:pass@host/db
SESSION_SECRET=random-secure-string</pre>
    <pre>// Accessed safely in code
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});</pre>
    <div class="note-box">Security Note: Never expose API keys in source code. All secrets in this project are managed through environment variables (see .env.example).</div>
  </div>

  <div class="section-block">
    <div class="chapter-header">5.9 Deployment & Infrastructure as Code</div>
    <p>We configured the application for cloud deployment on Render.com using a <code>render.yaml</code> file — a declarative configuration that describes the entire infrastructure.</p>
    <pre># render.yaml — Infrastructure as Code
services:
  - type: web
    name: satyacheck-api
    runtime: node
    buildCommand: pnpm install && pnpm --filter @workspace/api-server run build
    startCommand: node artifacts/api-server/dist/index.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        fromDatabase:
          name: satyacheck-db
          property: connectionString

databases:
  - name: satyacheck-db
    plan: free</pre>
    <p>This approach, known as <strong>Infrastructure as Code (IaC)</strong>, ensures that the deployment environment is reproducible, version-controlled, and does not require manual configuration through a web dashboard.</p>
  </div>

  <div class="section-block">
    <div class="chapter-header">5.10 Monorepo Architecture with pnpm Workspaces</div>
    <p>Instead of maintaining separate repositories for the frontend and backend, we used a <strong>monorepo</strong> — a single repository containing multiple packages. This is the approach used by companies like Google, Meta, and Microsoft.</p>
    <pre>workspace/
├── lib/                    # Shared packages (used by both frontend & backend)
│   ├── api-spec/           # Single source of truth — OpenAPI specification
│   ├── api-client-react/   # Auto-generated React Query hooks
│   ├── api-zod/            # Auto-generated Zod validation schemas
│   ├── db/                 # Drizzle ORM schema and DB connection
│   └── integrations-*/    # AI client wrappers
│
└── artifacts/              # Deployable applications
    ├── fake-news-defense/  # React + Vite frontend
    └── api-server/         # Express.js backend</pre>
    <p>Key advantages: (1) Shared types prevent drift between frontend and backend, (2) A single <code>pnpm install</code> installs all dependencies, (3) Changes to shared libraries are immediately reflected in all consuming packages.</p>
  </div>

  <!-- PHASED APPROACH -->
  <h1 class="section-title">6. Phased Development Approach</h1>
  <p>Our development followed a structured, phase-based approach where each phase unblocked the next, and independent tasks were executed in parallel to maximize efficiency.</p>
  <table>
    <thead><tr><th>Phase</th><th>Activity</th><th>Why This Phase Came First</th></tr></thead>
    <tbody>
      <tr><td>Phase 1</td><td>OpenAPI Specification</td><td>Blueprint for entire system — gates all subsequent development</td></tr>
      <tr><td>Phase 2</td><td>Code Generation (Orval)</td><td>Produces typed hooks and schemas used by both frontend and backend</td></tr>
      <tr><td>Phase 3</td><td>Frontend Build (React)</td><td>Can now use generated hooks; runs in parallel with backend</td></tr>
      <tr><td>Phase 4</td><td>Backend Routes (Express)</td><td>Runs in parallel with frontend; frontend does not block backend</td></tr>
      <tr><td>Phase 5</td><td>AI Integration</td><td>Routes exist first; AI logic slots cleanly into handlers</td></tr>
      <tr><td>Phase 6</td><td>Database Schema & Migration</td><td>Routes call DB; schema finalized after route contracts are clear</td></tr>
      <tr><td>Phase 7</td><td>Testing</td><td>All components integrated and verifiable end-to-end</td></tr>
      <tr><td>Phase 8</td><td>Deployment</td><td>Stable, tested codebase deployed to production</td></tr>
    </tbody>
  </table>

  <!-- TEAM DIVISION -->
  <h1 class="section-title">7. Team Work Division</h1>
  <table>
    <thead><tr><th>Phase</th><th>Student 1 (Backend)</th><th>Student 2 (Frontend)</th><th>Student 3 (AI/ML)</th><th>Student 4 (DB + DevOps)</th></tr></thead>
    <tbody>
      <tr><td>Planning</td><td>Define API endpoints</td><td>Design page flow & UI wireframes</td><td>Research AI models</td><td>Plan database schema</td></tr>
      <tr><td>OpenAPI Spec</td><td>✅ Write all endpoint definitions</td><td>Review response shapes</td><td>Define AI response format</td><td>Suggest DB-aligned fields</td></tr>
      <tr><td>Code Generation</td><td>Run codegen command</td><td>Verify generated hooks</td><td>Verify Zod schemas</td><td>—</td></tr>
      <tr><td>Frontend</td><td>Wire API hooks in App.tsx</td><td>✅ Build all pages & components</td><td>Design AI result UI</td><td>—</td></tr>
      <tr><td>Backend Routes</td><td>✅ Implement all /api routes</td><td>Test routes from frontend</td><td>Add AI calls in routes</td><td>Add DB calls to routes</td></tr>
      <tr><td>AI Integration</td><td>Maintain route structure</td><td>Build loading/error states</td><td>✅ Integrate OpenAI + Gemini + Claude</td><td>Save AI results to DB</td></tr>
      <tr><td>Database</td><td>Use DB in route handlers</td><td>Build history & dashboard</td><td>Format AI output for DB</td><td>✅ Write Drizzle schema & run migrations</td></tr>
      <tr><td>Testing</td><td>Test API via Postman</td><td>Manual UI testing</td><td>Verify AI accuracy</td><td>Check DB queries & indexes</td></tr>
      <tr><td>Deployment</td><td>Configure render.yaml</td><td>Optimize Vite build</td><td>Set production AI keys</td><td>✅ Set up PostgreSQL on Render</td></tr>
      <tr><td>Documentation</td><td>Write API documentation</td><td>Capture screenshots</td><td>Document AI pipeline</td><td>✅ Write README & architecture diagram</td></tr>
    </tbody>
  </table>

  <!-- REQUEST FLOW -->
  <h1 class="section-title">8. Complete Request-Response Flow</h1>
  <pre>┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE REQUEST FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│  1. User submits content via React frontend (POST /api/analyze) │
│                          ↓                                      │
│  2. Express Middleware Chain:                                    │
│     CORS Check → Body Parse → Pino Log → Rate Limit             │
│                          ↓                                      │
│  3. Zod Validation:                                             │
│     Valid? ──NO──▶ Return 400 Bad Request                       │
│       ↓ YES                                                     │
│  4. AI Processing (parallel):                                    │
│     OpenAI GPT-5.2  ──────────────▶ Primary Analysis Result    │
│     Google Gemini 2.5 Flash ──────▶ Verification Result        │
│                          ↓                                      │
│  5. Result Combination:                                         │
│     Merge verdicts → Calculate consensus confidence score       │
│                          ↓                                      │
│  6. Database Save (Drizzle → PostgreSQL):                       │
│     Store analysis record with verdict, confidence, explanation │
│                          ↓                                      │
│  7. JSON Response → React Frontend → Display to User ✅         │
└─────────────────────────────────────────────────────────────────┘</pre>

  <!-- CONCLUSION -->
  <h1 class="section-title">9. Conclusion</h1>
  <p>This project gave our team hands-on experience with professional, production-grade backend engineering practices. We learned not just how to write code, but how to architect a complete system — from API design and database modeling to AI integration and cloud deployment.</p>
  <p>The key takeaways from this project are:</p>
  <ul>
    <li>A <strong>Contract-First approach</strong> (OpenAPI) dramatically reduces integration bugs between frontend and backend</li>
    <li><strong>Code generation</strong> from a single source of truth eliminates duplication and keeps types consistent</li>
    <li><strong>Input validation</strong> (Zod) is not optional — it is a fundamental security and data quality requirement</li>
    <li><strong>Multi-model AI consensus</strong> produces more reliable results than relying on a single model</li>
    <li><strong>Monorepo architecture</strong> with shared libraries enables a large codebase to remain maintainable and consistent</li>
    <li><strong>Infrastructure as Code</strong> makes deployments reproducible and eliminates manual configuration errors</li>
  </ul>
  <p>SatyaCheck demonstrates that modern web applications are not built tool by tool, but are architected as systems — where each component has a clear responsibility and interfaces cleanly with every other component. This is the essence of professional software engineering.</p>

  <br/><br/>
  <table style="border: none;">
    <tr>
      <td style="border: none; width: 50%; padding: 10px 0;"><strong>Student 1 (Backend Dev)</strong><br/>Signature: _______________</td>
      <td style="border: none; width: 50%; padding: 10px 0;"><strong>Student 2 (Frontend Dev)</strong><br/>Signature: _______________</td>
    </tr>
    <tr>
      <td style="border: none; width: 50%; padding: 10px 0;"><strong>Student 3 (AI/ML Engineer)</strong><br/>Signature: _______________</td>
      <td style="border: none; width: 50%; padding: 10px 0;"><strong>Student 4 (DB + DevOps)</strong><br/>Signature: _______________</td>
    </tr>
  </table>

  <div class="page-num">— End of Report — SatyaCheck | Department of Computer Science & Engineering | 2025–2026 —</div>
</div>

</body>
</html>`;

fs.writeFileSync("/tmp/satyacheck-report.html", html);

const browser = await puppeteer.launch({
  executablePath: "/nix/store/0n9rl5l9syy808xi9bk4f6dhnfrvhkww-playwright-browsers-chromium/chromium-1080/chrome-linux/chrome",
  args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
await page.setContent(html, { waitUntil: "networkidle0" });
await page.pdf({
  path: "SatyaCheck-Project-Report.pdf",
  format: "A4",
  printBackground: true,
  margin: { top: "15px", bottom: "15px", left: "10px", right: "10px" },
});

await browser.close();
console.log("PDF generated!");

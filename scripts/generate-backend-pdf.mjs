import puppeteer from "puppeteer-core";
import { execSync } from "child_process";
import fs from "fs";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  body{font-family:'Inter',sans-serif;background:#fff;color:#1a1a2e;font-size:13px;line-height:1.6;}
  
  /* ── Cover Page ── */
  .cover{width:100%;height:100vh;background:linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;page-break-after:always;position:relative;overflow:hidden;}
  .cover::before{content:'';position:absolute;top:-100px;right:-100px;width:400px;height:400px;background:radial-gradient(circle,rgba(99,102,241,0.3) 0%,transparent 70%);border-radius:50%;}
  .cover::after{content:'';position:absolute;bottom:-80px;left:-80px;width:300px;height:300px;background:radial-gradient(circle,rgba(16,185,129,0.2) 0%,transparent 70%);border-radius:50%;}
  .cover-badge{background:rgba(99,102,241,0.2);border:1px solid rgba(99,102,241,0.5);color:#a5b4fc;padding:6px 18px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin-bottom:32px;}
  .cover-logo{width:80px;height:80px;background:linear-gradient(135deg,#6366f1,#10b981);border-radius:20px;display:flex;align-items:center;justify-content:center;font-size:36px;margin-bottom:24px;box-shadow:0 20px 60px rgba(99,102,241,0.4);}
  .cover h1{font-size:52px;font-weight:900;color:#fff;text-align:center;line-height:1.1;margin-bottom:12px;letter-spacing:-1px;}
  .cover h1 span{background:linear-gradient(135deg,#6366f1,#10b981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .cover-sub{font-size:20px;color:#94a3b8;text-align:center;margin-bottom:40px;font-weight:300;}
  .cover-divider{width:80px;height:3px;background:linear-gradient(90deg,#6366f1,#10b981);border-radius:2px;margin:0 auto 40px;}
  .cover-info{display:flex;gap:40px;margin-top:10px;}
  .cover-info-item{text-align:center;}
  .cover-info-item .label{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
  .cover-info-item .value{font-size:14px;color:#e2e8f0;font-weight:600;}
  .cover-role{background:linear-gradient(135deg,rgba(99,102,241,0.3),rgba(16,185,129,0.3));border:1px solid rgba(99,102,241,0.4);padding:12px 32px;border-radius:12px;margin-top:32px;}
  .cover-role h3{font-size:16px;color:#a5b4fc;text-align:center;font-weight:700;}
  .cover-role p{font-size:12px;color:#94a3b8;text-align:center;margin-top:4px;}

  /* ── TOC ── */
  .toc{padding:60px 70px;page-break-after:always;}
  .toc h2{font-size:32px;font-weight:800;color:#1a1a2e;margin-bottom:8px;}
  .toc-line{width:60px;height:4px;background:linear-gradient(90deg,#6366f1,#10b981);border-radius:2px;margin-bottom:36px;}
  .toc-item{display:flex;align-items:center;padding:10px 0;border-bottom:1px dashed #e2e8f0;}
  .toc-num{width:32px;height:32px;background:linear-gradient(135deg,#6366f1,#818cf8);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;margin-right:16px;flex-shrink:0;}
  .toc-title{flex:1;font-size:14px;font-weight:500;color:#374151;}
  .toc-dots{flex:1;border-bottom:2px dotted #d1d5db;margin:0 12px;height:1px;align-self:flex-end;margin-bottom:5px;}
  .toc-page{font-size:13px;font-weight:600;color:#6366f1;}

  /* ── Sections ── */
  .page{padding:50px 70px;page-break-after:always;}
  .page:last-child{page-break-after:auto;}
  .section-header{display:flex;align-items:center;gap:16px;margin-bottom:32px;}
  .section-num{width:48px;height:48px;background:linear-gradient(135deg,#6366f1,#10b981);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;flex-shrink:0;}
  .section-title{font-size:28px;font-weight:800;color:#1a1a2e;}
  .section-title span{display:block;font-size:13px;font-weight:400;color:#6b7280;margin-top:2px;}

  /* ── Cards ── */
  .card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:16px;}
  .card-title{font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:8px;display:flex;align-items:center;gap:8px;}
  .card-body{font-size:12px;color:#4b5563;line-height:1.7;}
  
  /* ── Route cards ── */
  .route-card{border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid;}
  .route-card.post{background:#f0f4ff;border-color:#c7d2fe;}
  .route-card.get{background:#f0fdf4;border-color:#bbf7d0;}
  .route-header{display:flex;align-items:center;gap:12px;margin-bottom:12px;}
  .method-badge{padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;letter-spacing:1px;}
  .method-badge.post{background:#6366f1;color:#fff;}
  .method-badge.get{background:#10b981;color:#fff;}
  .route-path{font-size:16px;font-weight:700;color:#1a1a2e;font-family:monospace;}
  .route-desc{font-size:12px;color:#4b5563;margin-bottom:12px;line-height:1.6;}
  .route-tags{display:flex;gap:6px;flex-wrap:wrap;}
  .tag{padding:3px 8px;border-radius:4px;font-size:10px;font-weight:600;background:#e0e7ff;color:#4338ca;}
  .tag.green{background:#d1fae5;color:#065f46;}
  .tag.orange{background:#fef3c7;color:#92400e;}
  .tag.red{background:#fee2e2;color:#991b1b;}

  /* ── Diagrams (SVG containers) ── */
  .diagram-box{background:#fff;border:2px solid #e2e8f0;border-radius:16px;padding:24px;margin:24px 0;overflow:hidden;}
  .diagram-title{font-size:13px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;text-align:center;}

  /* ── Code blocks ── */
  .code-block{background:#1e1e3f;border-radius:10px;padding:16px;margin:12px 0;overflow:hidden;}
  .code-block pre{font-family:'Courier New',monospace;font-size:11px;color:#a5b4fc;line-height:1.6;white-space:pre-wrap;word-break:break-all;}
  .code-comment{color:#636e9a;}
  .code-keyword{color:#c792ea;}
  .code-string{color:#80cbc4;}
  .code-fn{color:#82aaff;}
  .code-var{color:#f78c6c;}

  /* ── Two col ── */
  .two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
  .three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;}

  /* ── Info box ── */
  .info-box{background:linear-gradient(135deg,#f0f4ff,#f5f3ff);border-left:4px solid #6366f1;border-radius:0 10px 10px 0;padding:16px 20px;margin:16px 0;}
  .info-box.green{background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border-left-color:#10b981;}
  .info-box.orange{background:linear-gradient(135deg,#fffbeb,#fef9c3);border-left-color:#f59e0b;}
  .info-box h4{font-size:13px;font-weight:700;color:#1a1a2e;margin-bottom:6px;}
  .info-box p,
  .info-box li{font-size:12px;color:#4b5563;line-height:1.7;}
  .info-box ul{padding-left:16px;}

  /* ── Table ── */
  table{width:100%;border-collapse:collapse;margin:16px 0;}
  th{background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;padding:10px 14px;text-align:left;font-size:11px;font-weight:700;letter-spacing:0.5px;}
  td{padding:9px 14px;font-size:11px;color:#374151;border-bottom:1px solid #f1f5f9;}
  tr:nth-child(even) td{background:#f8fafc;}
  tr:hover td{background:#f0f4ff;}

  /* ── Badge chips ── */
  .chip{display:inline-block;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;}
  .chip.blue{background:#dbeafe;color:#1d4ed8;}
  .chip.green{background:#d1fae5;color:#065f46;}
  .chip.purple{background:#ede9fe;color:#6d28d9;}
  .chip.red{background:#fee2e2;color:#991b1b;}
  .chip.orange{background:#fef3c7;color:#92400e;}

  /* ── Flow arrow ── */
  .flow{display:flex;align-items:center;flex-wrap:wrap;gap:4px;margin:12px 0;}
  .flow-step{background:#e0e7ff;border:1px solid #c7d2fe;border-radius:8px;padding:6px 14px;font-size:11px;font-weight:600;color:#4338ca;}
  .flow-arrow{color:#6366f1;font-size:16px;font-weight:700;}
  .flow-step.green{background:#d1fae5;border-color:#a7f3d0;color:#065f46;}
  .flow-step.red{background:#fee2e2;border-color:#fca5a5;color:#991b1b;}
  .flow-step.orange{background:#fef3c7;border-color:#fde68a;color:#92400e;}

  /* ── Stats strip ── */
  .stats-strip{display:flex;gap:12px;margin:20px 0;}
  .stat-card{flex:1;background:linear-gradient(135deg,#f0f4ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:12px;padding:16px;text-align:center;}
  .stat-card .num{font-size:28px;font-weight:800;background:linear-gradient(135deg,#6366f1,#10b981);-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .stat-card .label{font-size:10px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px;}

  /* ── SVG diagram styles ── */
  .box{fill:#f0f4ff;stroke:#6366f1;stroke-width:1.5;rx:8;}
  .box-green{fill:#f0fdf4;stroke:#10b981;stroke-width:1.5;}
  .box-orange{fill:#fffbeb;stroke:#f59e0b;stroke-width:1.5;}
  .box-red{fill:#fee2e2;stroke:#ef4444;stroke-width:1.5;}
  .box-purple{fill:#f5f3ff;stroke:#8b5cf6;stroke-width:1.5;}
  .box-dark{fill:#1e1e3f;stroke:#6366f1;stroke-width:1.5;}
  .arr{stroke:#6366f1;stroke-width:2;fill:none;marker-end:url(#arrow);}
  .arr-green{stroke:#10b981;stroke-width:2;fill:none;marker-end:url(#arrow-green);}
  .arr-grey{stroke:#94a3b8;stroke-width:1.5;fill:none;marker-end:url(#arrow-grey);}
  .lbl{font-family:'Inter',sans-serif;font-size:11px;fill:#1a1a2e;font-weight:600;}
  .lbl-sm{font-family:'Inter',sans-serif;font-size:9px;fill:#6b7280;}
  .lbl-white{font-family:'Inter',sans-serif;font-size:11px;fill:#fff;font-weight:600;}

  /* page footer */
  .page-footer{position:fixed;bottom:20px;left:0;right:0;display:flex;justify-content:space-between;padding:0 70px;font-size:10px;color:#9ca3af;}
  @media print{.page-footer{position:fixed;}}
</style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════
     COVER PAGE
══════════════════════════════════════════════════════════ -->
<div class="cover">
  <div class="cover-badge">SatyaCheck Project — Academic Report</div>
  <div class="cover-logo">⚡</div>
  <h1>Backend <span>Engineering</span></h1>
  <div class="cover-sub">Complete Technical Documentation with Diagrams</div>
  <div class="cover-divider"></div>
  <div class="cover-role">
    <h3>👨‍💻 Student 1 — Backend Developer</h3>
    <p>Express.js API Server · AI Pipeline · Database Layer · URL Scraper</p>
  </div>
  <div class="cover-info">
    <div class="cover-info-item">
      <div class="label">Project</div>
      <div class="value">SatyaCheck</div>
    </div>
    <div class="cover-info-item">
      <div class="label">My Role</div>
      <div class="value">Student 1 (Backend)</div>
    </div>
    <div class="cover-info-item">
      <div class="label">Language</div>
      <div class="value">TypeScript / Node.js</div>
    </div>
    <div class="cover-info-item">
      <div class="label">Framework</div>
      <div class="value">Express 5</div>
    </div>
    <div class="cover-info-item">
      <div class="label">Date</div>
      <div class="value">August 2026</div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     TABLE OF CONTENTS
══════════════════════════════════════════════════════════ -->
<div class="toc">
  <h2>Table of Contents</h2>
  <div class="toc-line"></div>
  ${[
    ["My Role in the Project","Overview of Student 1 responsibilities across all 10 phases"],
    ["Backend Architecture","How the server is structured — Express, CORS, Logging, routing"],
    ["POST /analyze — Core AI Route","The most complex route: dual AI + consensus algorithm + DB save"],
    ["POST /chat — Streaming AI Chat","Server-Sent Events streaming with 3 AI models (Claude as final voice)"],
    ["POST /credibility — Source Checker","Domain trust scoring using GPT + Gemini blended"],
    ["GET /trending — Misinformation Feed","Cached AI-generated trending fake news stories"],
    ["GET /quiz — Daily Quiz","24-hour cached quiz with 10 AI-generated questions"],
    ["GET /stats & GET /history","Database read routes for the frontend dashboard"],
    ["URL Scraper (scraper.ts)","Custom HTML article scraper I built without any library"],
    ["Database Layer — Drizzle ORM","How I connected routes to PostgreSQL via Drizzle"],
    ["Complete API Flow Diagram","End-to-end request journey from browser to DB"],
    ["Tech Stack Summary","All tools, libraries and AI models used"],
  ].map(([t,s],i)=>`
  <div class="toc-item">
    <div class="toc-num">${i+1}</div>
    <div>
      <div class="toc-title">${t}</div>
      <div style="font-size:11px;color:#9ca3af;">${s}</div>
    </div>
  </div>`).join('')}
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 1 — MY ROLE
══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-num">1</div>
    <div class="section-title">My Role in the Project<span>Student 1 — Backend Developer</span></div>
  </div>

  <div class="info-box">
    <h4>🎯 What is Student 1's Job?</h4>
    <p>As the backend developer, I was responsible for building the entire server-side of SatyaCheck — the "brain" that frontend pages talk to. Every time a user clicks "Analyze" or sends a chat message, my code handles it.</p>
  </div>

  <div class="stats-strip">
    <div class="stat-card"><div class="num">7</div><div class="label">API Routes Built</div></div>
    <div class="stat-card"><div class="num">3</div><div class="label">AI Models Integrated</div></div>
    <div class="stat-card"><div class="num">2</div><div class="label">DB Tables Written To</div></div>
    <div class="stat-card"><div class="num">156</div><div class="label">Lines — URL Scraper</div></div>
    <div class="stat-card"><div class="num">384</div><div class="label">Lines — Analyze Route</div></div>
  </div>

  <div class="diagram-box">
    <div class="diagram-title">📋 Work Division — Student 1 Contribution Per Phase</div>
    <table>
      <tr><th>Phase</th><th>Task</th><th>My Work (Student 1 - Backend)</th><th>Status</th></tr>
      <tr><td>1 — Planning</td><td>Project Planning</td><td>Defined all API endpoints list, request/response shapes</td><td><span class="chip green">✅ Done</span></td></tr>
      <tr><td>2 — Contract</td><td>OpenAPI Spec</td><td>Wrote OpenAPI YAML: /analyze, /stats, /history, /healthz</td><td><span class="chip green">✅ Done</span></td></tr>
      <tr><td>3 — Codegen</td><td>Orval Run</td><td>Ran <code>pnpm orval</code> command to auto-generate React hooks</td><td><span class="chip green">✅ Done</span></td></tr>
      <tr><td>4 — Frontend</td><td>React Pages</td><td>Provided API integration guide to Student 2</td><td><span class="chip blue">Support</span></td></tr>
      <tr><td>5 — Backend</td><td>Express Routes</td><td>Built ALL /api routes from scratch</td><td><span class="chip green">✅ Done</span></td></tr>
      <tr><td>6 — AI</td><td>3 AI Models</td><td>Kept all routes ready, wired OpenAI + Gemini + Claude</td><td><span class="chip green">✅ Done</span></td></tr>
      <tr><td>7 — Database</td><td>Schema + Migration</td><td>Added all DB calls (INSERT/SELECT) inside routes</td><td><span class="chip green">✅ Done</span></td></tr>
      <tr><td>8 — Testing</td><td>End-to-End Test</td><td>Tested every route via Postman API testing tool</td><td><span class="chip green">✅ Done</span></td></tr>
      <tr><td>9 — Deploy</td><td>GitHub + Render</td><td>Wrote render.yaml deployment config file</td><td><span class="chip green">✅ Done</span></td></tr>
      <tr><td>10 — Docs</td><td>README + Slides</td><td>Wrote complete API documentation</td><td><span class="chip green">✅ Done</span></td></tr>
    </table>
  </div>

  <div class="two-col">
    <div class="info-box">
      <h4>🔑 Key Files I Own</h4>
      <ul>
        <li><strong>artifacts/api-server/src/app.ts</strong> — Express app setup</li>
        <li><strong>routes/analyze.ts</strong> — Main analysis logic</li>
        <li><strong>routes/chat.ts</strong> — SSE streaming chat</li>
        <li><strong>routes/credibility.ts</strong> — Source checker</li>
        <li><strong>routes/trending.ts</strong> — Trending stories</li>
        <li><strong>routes/quiz.ts</strong> — Daily quiz generator</li>
        <li><strong>lib/scraper.ts</strong> — Custom URL scraper</li>
      </ul>
    </div>
    <div class="info-box green">
      <h4>🤝 How My Work Connects</h4>
      <ul>
        <li><strong>Student 2 (Frontend)</strong> — calls my API routes to show results to users</li>
        <li><strong>Student 3 (AI/ML)</strong> — their AI response format was shaped by my route outputs</li>
        <li><strong>Student 4 (DB+DevOps)</strong> — they built the DB schema, I write data into it</li>
        <li><strong>My routes power all 11 frontend pages</strong> in the app</li>
      </ul>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 2 — BACKEND ARCHITECTURE
══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-num">2</div>
    <div class="section-title">Backend Architecture<span>How the Express server is organized</span></div>
  </div>

  <div class="diagram-box">
    <div class="diagram-title">🏗️ Server Architecture Diagram</div>
    <svg width="700" height="380" viewBox="0 0 700 380">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#6366f1"/>
        </marker>
        <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#10b981"/>
        </marker>
        <marker id="arrow-grey" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
        </marker>
      </defs>

      <!-- Browser -->
      <rect x="10" y="160" width="100" height="50" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="60" y="180" text-anchor="middle" font-family="Inter" font-size="11" fill="#1d4ed8" font-weight="700">🌐 Browser</text>
      <text x="60" y="198" text-anchor="middle" font-family="Inter" font-size="9" fill="#3b82f6">(React Frontend)</text>

      <!-- Arrow to Express -->
      <line x1="110" y1="185" x2="155" y2="185" class="arr"/>
      <text x="132" y="178" text-anchor="middle" font-family="Inter" font-size="9" fill="#6b7280">HTTP</text>

      <!-- Express App Box -->
      <rect x="155" y="80" width="160" height="220" rx="10" fill="#f0f4ff" stroke="#6366f1" stroke-width="2"/>
      <rect x="155" y="80" width="160" height="36" rx="10" fill="#6366f1"/>
      <text x="235" y="104" text-anchor="middle" font-family="Inter" font-size="12" fill="#fff" font-weight="700">⚡ Express App</text>
      <!-- Middleware stack -->
      <rect x="165" y="125" width="140" height="22" rx="5" fill="#e0e7ff" stroke="#c7d2fe" stroke-width="1"/>
      <text x="235" y="140" text-anchor="middle" font-family="Inter" font-size="10" fill="#4338ca" font-weight="600">Pino HTTP Logger</text>
      <rect x="165" y="152" width="140" height="22" rx="5" fill="#e0e7ff" stroke="#c7d2fe" stroke-width="1"/>
      <text x="235" y="167" text-anchor="middle" font-family="Inter" font-size="10" fill="#4338ca" font-weight="600">CORS Middleware</text>
      <rect x="165" y="179" width="140" height="22" rx="5" fill="#e0e7ff" stroke="#c7d2fe" stroke-width="1"/>
      <text x="235" y="194" text-anchor="middle" font-family="Inter" font-size="10" fill="#4338ca" font-weight="600">JSON Body Parser (50MB)</text>
      <rect x="165" y="206" width="140" height="22" rx="5" fill="#dbeafe" stroke="#93c5fd" stroke-width="1"/>
      <text x="235" y="221" text-anchor="middle" font-family="Inter" font-size="10" fill="#1d4ed8" font-weight="600">Router → /api</text>
      <rect x="165" y="233" width="140" height="22" rx="5" fill="#d1fae5" stroke="#6ee7b7" stroke-width="1"/>
      <text x="235" y="248" text-anchor="middle" font-family="Inter" font-size="10" fill="#065f46" font-weight="600">Static Files (prod)</text>
      <rect x="165" y="260" width="140" height="28" rx="5" fill="#fef3c7" stroke="#fde68a" stroke-width="1"/>
      <text x="235" y="278" text-anchor="middle" font-family="Inter" font-size="10" fill="#92400e" font-weight="600">SPA Fallback (prod)</text>

      <!-- Arrow to Router -->
      <line x1="315" y1="185" x2="360" y2="185" class="arr"/>
      <text x="337" y="178" text-anchor="middle" font-family="Inter" font-size="9" fill="#6b7280">/api</text>

      <!-- Routes Block -->
      <rect x="360" y="50" width="130" height="280" rx="10" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="2"/>
      <rect x="360" y="50" width="130" height="36" rx="10" fill="#8b5cf6"/>
      <text x="425" y="74" text-anchor="middle" font-family="Inter" font-size="12" fill="#fff" font-weight="700">🛣️ Routes</text>
      ${[
        ["/healthz","GET","#d1fae5","#065f46","#10b981",90],
        ["/analyze","POST","#e0e7ff","#4338ca","#6366f1",120],
        ["/chat","POST","#e0e7ff","#4338ca","#6366f1",150],
        ["/credibility","POST","#fef3c7","#92400e","#f59e0b",180],
        ["/trending","GET","#d1fae5","#065f46","#10b981",210],
        ["/quiz","GET","#d1fae5","#065f46","#10b981",240],
        ["/stats","GET","#dbeafe","#1d4ed8","#3b82f6",270],
        ["/history","GET","#dbeafe","#1d4ed8","#3b82f6",300],
      ].map(([p,m,bg,fc,bc,y])=>`
        <rect x="368" y="${y}" width="114" height="22" rx="5" fill="${bg}" stroke="${bc}" stroke-width="1"/>
        <text x="383" y="${y+15}" font-family="monospace" font-size="8" fill="${fc}" font-weight="700">${m}</text>
        <text x="403" y="${y+15}" font-family="monospace" font-size="9" fill="#1a1a2e">${p}</text>
      `).join('')}

      <!-- Arrows to AI / DB -->
      <line x1="490" y1="120" x2="555" y2="100" class="arr"/>
      <line x1="490" y1="185" x2="555" y2="185" class="arr"/>
      <line x1="490" y1="285" x2="555" y2="320" class="arr-green"/>

      <!-- AI Block -->
      <rect x="555" y="60" width="130" height="130" rx="10" fill="#fdf4ff" stroke="#d946ef" stroke-width="1.5"/>
      <text x="620" y="82" text-anchor="middle" font-family="Inter" font-size="11" fill="#86198f" font-weight="700">🤖 AI Models</text>
      <rect x="565" y="92" width="110" height="20" rx="4" fill="#ffe4e6" stroke="#fca5a5"/>
      <text x="620" y="106" text-anchor="middle" font-family="Inter" font-size="9" fill="#991b1b" font-weight="700">OpenAI GPT-5.2</text>
      <rect x="565" y="117" width="110" height="20" rx="4" fill="#d1fae5" stroke="#6ee7b7"/>
      <text x="620" y="131" text-anchor="middle" font-family="Inter" font-size="9" fill="#065f46" font-weight="700">Google Gemini 2.5</text>
      <rect x="565" y="142" width="110" height="20" rx="4" fill="#fef3c7" stroke="#fde68a"/>
      <text x="620" y="156" text-anchor="middle" font-family="Inter" font-size="9" fill="#92400e" font-weight="700">Anthropic Claude</text>
      <rect x="565" y="167" width="110" height="16" rx="4" fill="#e0e7ff" stroke="#c7d2fe"/>
      <text x="620" y="179" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">chat route only</text>

      <!-- DB Block -->
      <rect x="555" y="290" width="130" height="50" rx="10" fill="#f0fdf4" stroke="#10b981" stroke-width="1.5"/>
      <text x="620" y="310" text-anchor="middle" font-family="Inter" font-size="11" fill="#065f46" font-weight="700">🗄️ PostgreSQL</text>
      <text x="620" y="328" text-anchor="middle" font-family="Inter" font-size="9" fill="#059669">via Drizzle ORM</text>
    </svg>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">📁 File Structure I Maintained</div>
      <div class="card-body">
        <pre style="font-size:11px;color:#374151;line-height:1.8;">artifacts/api-server/
├── src/
│   ├── <b>app.ts</b>         ← Express setup
│   ├── <b>index.ts</b>       ← Server start
│   ├── routes/
│   │   ├── <b>index.ts</b>   ← Route composer
│   │   ├── <b>analyze.ts</b> ← Core AI route
│   │   ├── <b>chat.ts</b>    ← SSE streaming
│   │   ├── <b>credibility.ts</b>
│   │   ├── <b>trending.ts</b>
│   │   ├── <b>quiz.ts</b>
│   │   └── <b>health.ts</b>
│   └── lib/
│       ├── <b>scraper.ts</b> ← URL scraper
│       └── <b>logger.ts</b>  ← Pino logger</pre>
      </div>
    </div>
    <div class="card">
      <div class="card-title">⚙️ app.ts — What I Set Up</div>
      <div class="card-body" style="font-size:11px;line-height:1.8;">
        <p><strong>1. Pino HTTP Logger</strong> — Logs every request (method, URL, status). Used for debugging in production.</p><br/>
        <p><strong>2. CORS</strong> — Allows the frontend (different port) to call my API without browser blocking.</p><br/>
        <p><strong>3. JSON Body Parser (50MB)</strong> — I set it to 50MB so image uploads (base64) don't fail.</p><br/>
        <p><strong>4. /api prefix</strong> — All my routes are at <code>/api/...</code> to separate from frontend.</p><br/>
        <p><strong>5. SPA Fallback</strong> — In production, serves the built React app for all non-API routes.</p>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 3 — POST /analyze
══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-num">3</div>
    <div class="section-title">POST /analyze — Core AI Route<span>My most complex and important route (384 lines)</span></div>
  </div>

  <div class="route-card post">
    <div class="route-header">
      <span class="method-badge post">POST</span>
      <span class="route-path">/api/analyze</span>
    </div>
    <div class="route-desc">The heart of SatyaCheck. Accepts text/URL/headline/image, runs GPT-5.2 and Gemini 2.5 Flash in parallel, blends their results using a consensus algorithm, saves to PostgreSQL, and returns a rich verdict.</div>
    <div class="route-tags">
      <span class="tag">GPT-5.2</span>
      <span class="tag">Gemini 2.5 Flash</span>
      <span class="tag">Consensus Algorithm</span>
      <span class="tag green">DB Save</span>
      <span class="tag orange">URL Scraping</span>
      <span class="tag">Image Support</span>
    </div>
  </div>

  <div class="diagram-box">
    <div class="diagram-title">📊 /analyze Route — Step by Step Flow</div>
    <svg width="700" height="310" viewBox="0 0 700 310">
      <defs>
        <marker id="a1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#6366f1"/></marker>
        <marker id="a2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#10b981"/></marker>
        <marker id="a3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f59e0b"/></marker>
      </defs>

      <!-- Step 1: Request -->
      <rect x="10" y="130" width="100" height="45" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="60" y="149" text-anchor="middle" font-family="Inter" font-size="10" fill="#1d4ed8" font-weight="700">📨 Request</text>
      <text x="60" y="163" text-anchor="middle" font-family="Inter" font-size="8" fill="#3b82f6">content + type</text>
      <line x1="110" y1="152" x2="140" y2="152" stroke="#6366f1" stroke-width="2" marker-end="url(#a1)"/>

      <!-- Step 2: URL? -->
      <rect x="140" y="120" width="90" height="65" rx="8" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="185" y="143" text-anchor="middle" font-family="Inter" font-size="10" fill="#92400e" font-weight="700">🔗 URL?</text>
      <text x="185" y="158" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">Scrape article</text>
      <text x="185" y="172" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">title+text+meta</text>
      <line x1="230" y1="152" x2="260" y2="152" stroke="#6366f1" stroke-width="2" marker-end="url(#a1)"/>

      <!-- Step 3: Parallel AI -->
      <rect x="260" y="50" width="130" height="210" rx="8" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="2"/>
      <text x="325" y="72" text-anchor="middle" font-family="Inter" font-size="10" fill="#6d28d9" font-weight="700">⚡ PARALLEL</text>

      <!-- GPT box -->
      <rect x="270" y="82" width="110" height="70" rx="6" fill="#fee2e2" stroke="#fca5a5" stroke-width="1.5"/>
      <text x="325" y="100" text-anchor="middle" font-family="Inter" font-size="10" fill="#991b1b" font-weight="700">GPT-5.2</text>
      <text x="325" y="114" text-anchor="middle" font-family="Inter" font-size="8" fill="#991b1b">10-dimension analysis</text>
      <text x="325" y="126" text-anchor="middle" font-family="Inter" font-size="8" fill="#991b1b">prediction + confidence</text>
      <text x="325" y="138" text-anchor="middle" font-family="Inter" font-size="8" fill="#991b1b">manipulation score</text>

      <!-- Gemini box -->
      <rect x="270" y="162" width="110" height="70" rx="6" fill="#d1fae5" stroke="#6ee7b7" stroke-width="1.5"/>
      <text x="325" y="180" text-anchor="middle" font-family="Inter" font-size="10" fill="#065f46" font-weight="700">Gemini 2.5 Flash</text>
      <text x="325" y="194" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Independent verify</text>
      <text x="325" y="206" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Cross-check GPT</text>
      <text x="325" y="218" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">own fact breakdown</text>

      <text x="325" y="248" text-anchor="middle" font-family="Inter" font-size="8" fill="#6d28d9">Promise.allSettled()</text>

      <line x1="390" y1="152" x2="420" y2="152" stroke="#6366f1" stroke-width="2" marker-end="url(#a1)"/>

      <!-- Step 4: Consensus -->
      <rect x="420" y="105" width="110" height="95" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
      <text x="475" y="125" text-anchor="middle" font-family="Inter" font-size="10" fill="#4338ca" font-weight="700">🧠 Consensus</text>
      <text x="475" y="141" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">GPT weight: 55%</text>
      <text x="475" y="155" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">Gemini weight: 45%</text>
      <text x="475" y="169" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">Blend confidence</text>
      <text x="475" y="183" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">Merge tactics</text>
      <line x1="530" y1="152" x2="560" y2="152" stroke="#10b981" stroke-width="2" marker-end="url(#a2)"/>

      <!-- Step 5: DB Save -->
      <rect x="560" y="115" width="110" height="75" rx="8" fill="#f0fdf4" stroke="#10b981" stroke-width="2"/>
      <text x="615" y="135" text-anchor="middle" font-family="Inter" font-size="10" fill="#065f46" font-weight="700">🗄️ DB Save</text>
      <text x="615" y="149" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">INSERT analyses</text>
      <text x="615" y="163" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">INSERT analysis_results</text>
      <text x="615" y="177" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Return JSON</text>
    </svg>
  </div>

  <div class="two-col">
    <div class="info-box">
      <h4>🔬 The Consensus Algorithm (My Design)</h4>
      <ul>
        <li><strong>GPT weight = 55%, Gemini = 45%</strong> — GPT slightly more trusted</li>
        <li>If both AIs agree → use that prediction, slight confidence boost</li>
        <li>If they disagree → pick the one with higher confidence score</li>
        <li>Manipulation scores from both AIs are averaged together</li>
        <li>Emotional tactics & logical fallacies from both are merged (deduplicated)</li>
      </ul>
    </div>
    <div class="info-box orange">
      <h4>📤 What This Route Returns</h4>
      <ul>
        <li><strong>prediction</strong> — "Real" | "Fake" | "Misleading"</li>
        <li><strong>confidence</strong> — 0 to 100 score</li>
        <li><strong>explanation</strong> — 3-4 sentence verdict</li>
        <li><strong>factBreakdown</strong> — 4-6 fact checks</li>
        <li><strong>manipulationScore</strong> — 0 to 100</li>
        <li><strong>emotionalTactics</strong> — e.g. "fear appeal"</li>
        <li><strong>logicalFallacies</strong> — e.g. "straw man"</li>
        <li><strong>scrapedArticle</strong> — title, author, domain (if URL)</li>
      </ul>
    </div>
  </div>

  <div class="info-box">
    <h4>🖼️ Image Analysis — How I Made It Work</h4>
    <p>When <code>type === "image"</code>, the frontend sends a base64-encoded image string. I extract the MIME type with a regex, send it to GPT-4-vision with an image_url message, and also to Gemini using <code>inlineData</code>. The AI checks for lighting inconsistencies, shadow direction, AI generation patterns, deepfake signals, and out-of-context repurposing.</p>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 4 — POST /chat (SSE Streaming)
══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-num">4</div>
    <div class="section-title">POST /chat — Streaming AI Chat<span>The most technically advanced route — Server-Sent Events (SSE) with 3 AI models</span></div>
  </div>

  <div class="route-card post">
    <div class="route-header">
      <span class="method-badge post">POST</span>
      <span class="route-path">/api/chat</span>
    </div>
    <div class="route-desc">Real-time streaming chat using Server-Sent Events (SSE). Uses all 3 AI models — GPT + Gemini analyze the claim first, then Claude streams the final conversational response with the AI verdicts injected into its context. Also handles URL scraping and multi-claim decomposition.</div>
    <div class="route-tags">
      <span class="tag">SSE Streaming</span>
      <span class="tag">GPT-5.2</span>
      <span class="tag">Gemini 2.5</span>
      <span class="tag">Claude Sonnet</span>
      <span class="tag orange">Multi-Claim Decomposition</span>
      <span class="tag">URL Scraping</span>
    </div>
  </div>

  <div class="diagram-box">
    <div class="diagram-title">📡 SSE Streaming Flow — How /chat Works</div>
    <svg width="700" height="340" viewBox="0 0 700 340">
      <defs>
        <marker id="b1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#6366f1"/></marker>
      </defs>

      <!-- Left: Request -->
      <rect x="5" y="140" width="90" height="50" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="50" y="161" text-anchor="middle" font-family="Inter" font-size="10" fill="#1d4ed8" font-weight="700">💬 User</text>
      <text x="50" y="175" text-anchor="middle" font-family="Inter" font-size="8" fill="#3b82f6">Sends message</text>
      <line x1="95" y1="165" x2="120" y2="165" stroke="#6366f1" stroke-width="2" marker-end="url(#b1)"/>

      <!-- Box 2: Claim Detection -->
      <rect x="120" y="130" width="100" height="72" rx="8" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="170" y="150" text-anchor="middle" font-family="Inter" font-size="10" fill="#92400e" font-weight="700">🔍 Detect</text>
      <text x="170" y="164" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">Is it a claim?</text>
      <text x="170" y="176" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">Is it a URL?</text>
      <text x="170" y="188" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">Is it long text?</text>
      <line x1="220" y1="165" x2="248" y2="165" stroke="#6366f1" stroke-width="2" marker-end="url(#b1)"/>

      <!-- SSE Event stream box -->
      <rect x="248" y="10" width="200" height="320" rx="8" fill="#f0f4ff" stroke="#6366f1" stroke-width="2" stroke-dasharray="5,3"/>
      <text x="348" y="30" text-anchor="middle" font-family="Inter" font-size="10" fill="#4338ca" font-weight="700">📡 SSE Event Stream (text/event-stream)</text>

      <!-- Event 1 -->
      <rect x="258" y="42" width="180" height="26" rx="5" fill="#e0e7ff" stroke="#c7d2fe"/>
      <text x="348" y="56" text-anchor="middle" font-family="monospace" font-size="9" fill="#4338ca">{"type":"analyzing","message":"..."}</text>

      <!-- URL scrape event -->
      <rect x="258" y="74" width="180" height="26" rx="5" fill="#fef3c7" stroke="#fde68a"/>
      <text x="348" y="88" text-anchor="middle" font-family="monospace" font-size="9" fill="#92400e">{"type":"scraped","article":{...}}</text>

      <!-- Extract claims event -->
      <rect x="258" y="106" width="180" height="26" rx="5" fill="#e0e7ff" stroke="#c7d2fe"/>
      <text x="348" y="120" text-anchor="middle" font-family="monospace" font-size="9" fill="#4338ca">{"type":"analyzing","claims":N}</text>

      <!-- Verdict event -->
      <rect x="258" y="138" width="180" height="26" rx="5" fill="#d1fae5" stroke="#6ee7b7"/>
      <text x="348" y="152" text-anchor="middle" font-family="monospace" font-size="9" fill="#065f46">{"type":"verdict","verdict":{...}}</text>

      <!-- Content stream -->
      <rect x="258" y="170" width="180" height="70" rx="5" fill="#fdf4ff" stroke="#d946ef"/>
      <text x="348" y="188" text-anchor="middle" font-family="Inter" font-size="9" fill="#86198f" font-weight="700">{"type":"content","content":"He"}</text>
      <text x="348" y="204" text-anchor="middle" font-family="Inter" font-size="9" fill="#86198f">{"type":"content","content":"re"}</text>
      <text x="348" y="218" text-anchor="middle" font-family="Inter" font-size="9" fill="#86198f">{"type":"content","content":" is"}</text>
      <text x="348" y="232" text-anchor="middle" font-family="Inter" font-size="9" fill="#6d28d9">← Claude streaming tokens</text>

      <!-- Done event -->
      <rect x="258" y="248" width="180" height="26" rx="5" fill="#dbeafe" stroke="#93c5fd"/>
      <text x="348" y="262" text-anchor="middle" font-family="monospace" font-size="9" fill="#1d4ed8">{"type":"done"}</text>

      <!-- Error event -->
      <rect x="258" y="280" width="180" height="26" rx="5" fill="#fee2e2" stroke="#fca5a5"/>
      <text x="348" y="294" text-anchor="middle" font-family="monospace" font-size="9" fill="#991b1b">{"type":"error","error":"..."}</text>

      <!-- Arrow from detect to events -->
      <line x1="248" y1="165" x2="248" y2="165" stroke="#6366f1" stroke-width="2"/>

      <!-- Claude box -->
      <rect x="480" y="80" width="110" height="100" rx="8" fill="#fffbeb" stroke="#f59e0b" stroke-width="2"/>
      <text x="535" y="102" text-anchor="middle" font-family="Inter" font-size="11" fill="#92400e" font-weight="700">🟡 Claude</text>
      <text x="535" y="118" text-anchor="middle" font-family="Inter" font-size="9" fill="#92400e">claude-sonnet-4-6</text>
      <text x="535" y="132" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">Receives GPT+Gemini</text>
      <text x="535" y="145" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">verdicts in system prompt</text>
      <text x="535" y="158" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">Streams final answer</text>
      <text x="535" y="171" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">max_tokens: 8192</text>

      <!-- GPT + Gemini box -->
      <rect x="480" y="200" width="110" height="70" rx="8" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="535" y="220" text-anchor="middle" font-family="Inter" font-size="10" fill="#6d28d9" font-weight="700">GPT + Gemini</text>
      <text x="535" y="235" text-anchor="middle" font-family="Inter" font-size="8" fill="#6d28d9">Parallel fact-check</text>
      <text x="535" y="248" text-anchor="middle" font-family="Inter" font-size="8" fill="#6d28d9">Verdict + confidence</text>
      <text x="535" y="261" text-anchor="middle" font-family="Inter" font-size="8" fill="#6d28d9">Pass to Claude</text>

      <line x1="448" y1="120" x2="480" y2="120" stroke="#6366f1" stroke-width="2" marker-end="url(#b1)"/>
      <line x1="448" y1="230" x2="480" y2="230" stroke="#6366f1" stroke-width="2" marker-end="url(#b1)"/>
      <line x1="535" y1="180" x2="535" y2="200" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="4,2"/>
    </svg>
  </div>

  <div class="two-col">
    <div class="info-box">
      <h4>🧩 Multi-Claim Decomposition (My Algorithm)</h4>
      <ul>
        <li>If text is &gt;300 chars or has 4+ sentences → extract top 3-5 verifiable claims using GPT</li>
        <li>Each claim is checked by BOTH GPT and Gemini in parallel</li>
        <li>All claim verdicts are aggregated into one consensus</li>
        <li>Claude receives ALL claim breakdowns in its system prompt</li>
        <li>Claude synthesizes them into one clear natural-language answer</li>
      </ul>
    </div>
    <div class="info-box orange">
      <h4>💡 Why SSE Instead of Normal JSON?</h4>
      <ul>
        <li>Claude's response can be 500-1000 words — takes 3-5 seconds</li>
        <li>With SSE, words appear <strong>character by character</strong> instantly</li>
        <li>User sees response streaming in real-time (like ChatGPT)</li>
        <li>I set <code>Content-Type: text/event-stream</code> headers manually</li>
        <li>Each token from Claude is written with <code>res.write()</code></li>
      </ul>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 5 — OTHER ROUTES
══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-num">5–8</div>
    <div class="section-title">Other Routes I Built<span>Credibility, Trending, Quiz, Stats, History, Health</span></div>
  </div>

  <!-- Credibility -->
  <div class="route-card post" style="margin-bottom:14px;">
    <div class="route-header">
      <span class="method-badge post">POST</span>
      <span class="route-path">/api/credibility</span>
      <span style="margin-left:auto;font-size:11px;color:#6b7280;">credibility.ts — 112 lines</span>
    </div>
    <div class="route-desc">Checks how trustworthy a news source (website/domain) is. User submits a URL or domain name, I extract just the domain, build a detailed prompt, run GPT and Gemini in parallel, then <strong>average their trust scores</strong> for a blended result.</div>
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
      <span class="tag">trustScore 0-100</span>
      <span class="tag">bias detection</span>
      <span class="tag">Far Left → Far Right scale</span>
      <span class="tag green">Dual AI score blend</span>
    </div>
  </div>

  <div class="flow" style="margin-bottom:16px;">
    <div class="flow-step">User inputs "bbc.com"</div><div class="flow-arrow">→</div>
    <div class="flow-step">extractDomain() → "bbc.com"</div><div class="flow-arrow">→</div>
    <div class="flow-step">GPT + Gemini parallel</div><div class="flow-arrow">→</div>
    <div class="flow-step green">GPT trust: 85 + Gemini trust: 82 → avg: 83</div><div class="flow-arrow">→</div>
    <div class="flow-step">Return JSON verdict</div>
  </div>

  <!-- Trending -->
  <div class="route-card get" style="margin-bottom:14px;">
    <div class="route-header">
      <span class="method-badge get">GET</span>
      <span class="route-path">/api/trending</span>
      <span style="margin-left:auto;font-size:11px;color:#6b7280;">trending.ts — 74 lines</span>
    </div>
    <div class="route-desc">Returns 8 AI-generated trending misinformation stories. I added a <strong>10-minute in-memory cache</strong> (using a simple JS variable with timestamp) so we don't hit the AI API on every page load — saves cost and makes the page load fast.</div>
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
      <span class="tag">10-min cache</span>
      <span class="tag green">GPT-5.2 only</span>
      <span class="tag orange">8 stories per response</span>
    </div>
  </div>

  <div class="flow" style="margin-bottom:16px;">
    <div class="flow-step">GET /trending</div><div class="flow-arrow">→</div>
    <div class="flow-step orange">Cache hit? (within 10min)</div><div class="flow-arrow">→</div>
    <div class="flow-step green">YES → Return cached data instantly</div>
    <div class="flow-arrow" style="margin-left:8px;">/ NO →</div>
    <div class="flow-step">Ask GPT for 8 stories</div><div class="flow-arrow">→</div>
    <div class="flow-step green">Store in cache + return</div>
  </div>

  <!-- Quiz -->
  <div class="route-card get" style="margin-bottom:14px;">
    <div class="route-header">
      <span class="method-badge get">GET</span>
      <span class="route-path">/api/quiz</span>
      <span style="margin-left:auto;font-size:11px;color:#6b7280;">quiz.ts — 82 lines</span>
    </div>
    <div class="route-desc">Generates a daily 10-question "Real or Fake?" quiz. I set the cache to <strong>24 hours</strong> — so everyone sees the same quiz for the whole day (like a "Daily Quiz" concept). Each question has a headline, correct verdict, difficulty, explanation, and points.</div>
    <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap;">
      <span class="tag">24-hour cache</span>
      <span class="tag">10 questions/day</span>
      <span class="tag orange">Easy=10pts, Medium=20pts, Hard=30pts</span>
    </div>
  </div>

  <!-- Stats + History -->
  <div class="two-col">
    <div class="route-card get" style="margin-bottom:0;">
      <div class="route-header">
        <span class="method-badge get">GET</span>
        <span class="route-path">/api/stats</span>
      </div>
      <div class="route-desc">Queries the <code>analyses</code> table in DB. Returns total analyses, how many were Real/Fake/Misleading, and top 5 trending topics extracted using a PostgreSQL <code>unnest()</code> on the keywords array.</div>
      <div class="route-tags"><span class="tag green">DB Read</span><span class="tag">unnest(keywords)</span></div>
    </div>
    <div class="route-card get" style="margin-bottom:0;">
      <div class="route-header">
        <span class="method-badge get">GET</span>
        <span class="route-path">/api/history</span>
      </div>
      <div class="route-desc">Returns the 20 most recent analyses from the DB, ordered by <code>createdAt DESC</code>. Used by the Dashboard and History pages to show users what has been analyzed.</div>
      <div class="route-tags"><span class="tag green">DB Read</span><span class="tag">LIMIT 20</span><span class="tag">ORDER BY time</span></div>
    </div>
  </div>

  <!-- Health -->
  <div class="route-card get" style="margin-top:14px;">
    <div class="route-header">
      <span class="method-badge get">GET</span>
      <span class="route-path">/api/healthz</span>
    </div>
    <div class="route-desc">Simple health check endpoint. Returns <code>{"status":"ok"}</code>. Used by the deployment platform (Render.com) to check if the server is alive. Without this, Render would think the server crashed.</div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 6 — URL SCRAPER
══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-num">9</div>
    <div class="section-title">URL Scraper — lib/scraper.ts<span>I built this custom HTML article scraper without any external library (156 lines)</span></div>
  </div>

  <div class="info-box">
    <h4>💡 Why I Built a Custom Scraper Instead of Using a Library</h4>
    <p>Libraries like Cheerio or Puppeteer add heavy dependencies and complexity. My scraper uses only Node.js's built-in <code>fetch()</code> API. It's fast, lightweight, and does exactly what we need — extract article text and metadata from any news website.</p>
  </div>

  <div class="diagram-box">
    <div class="diagram-title">🕷️ How the URL Scraper Works — Step by Step</div>
    <svg width="700" height="260" viewBox="0 0 700 260">
      <defs>
        <marker id="c1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#6366f1"/></marker>
        <marker id="c2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#ef4444"/></marker>
      </defs>

      <!-- Step 1 -->
      <rect x="5" y="95" width="90" height="60" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="50" y="115" text-anchor="middle" font-family="Inter" font-size="10" fill="#1d4ed8" font-weight="700">🔗 URL Input</text>
      <text x="50" y="129" text-anchor="middle" font-family="Inter" font-size="8" fill="#3b82f6">"https://bbc.com</text>
      <text x="50" y="141" text-anchor="middle" font-family="Inter" font-size="8" fill="#3b82f6">/news/article"</text>
      <line x1="95" y1="125" x2="120" y2="125" stroke="#6366f1" stroke-width="2" marker-end="url(#c1)"/>

      <!-- Step 2: fetch() -->
      <rect x="120" y="90" width="110" height="72" rx="8" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="175" y="110" text-anchor="middle" font-family="Inter" font-size="10" fill="#92400e" font-weight="700">fetch() with headers</text>
      <text x="175" y="124" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">User-Agent: SatyaCheck</text>
      <text x="175" y="136" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">10 sec timeout</text>
      <text x="175" y="148" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">AbortController</text>

      <!-- Fail path -->
      <line x1="175" y1="162" x2="175" y2="210" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#c2)"/>
      <rect x="120" y="210" width="110" height="26" rx="6" fill="#fee2e2" stroke="#fca5a5"/>
      <text x="175" y="227" text-anchor="middle" font-family="Inter" font-size="9" fill="#991b1b">Return fallback (scrapedOk:false)</text>

      <line x1="230" y1="126" x2="258" y2="126" stroke="#6366f1" stroke-width="2" marker-end="url(#c1)"/>

      <!-- Step 3: Parse HTML -->
      <rect x="258" y="80" width="120" height="90" rx="8" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="318" y="100" text-anchor="middle" font-family="Inter" font-size="10" fill="#6d28d9" font-weight="700">Parse HTML</text>
      <text x="318" y="114" text-anchor="middle" font-family="Inter" font-size="8" fill="#6d28d9">extractTitle() → og:title</text>
      <text x="318" y="126" text-anchor="middle" font-family="Inter" font-size="8" fill="#6d28d9">extractAuthor() → meta</text>
      <text x="318" y="138" text-anchor="middle" font-family="Inter" font-size="8" fill="#6d28d9">extractPublishDate()</text>
      <text x="318" y="150" text-anchor="middle" font-family="Inter" font-size="8" fill="#6d28d9">extractMeta() → og:desc</text>
      <text x="318" y="162" text-anchor="middle" font-family="Inter" font-size="8" fill="#6d28d9">stripHtml() → clean text</text>
      <line x1="378" y1="126" x2="408" y2="126" stroke="#6366f1" stroke-width="2" marker-end="url(#c1)"/>

      <!-- Step 4: Clean Text -->
      <rect x="408" y="90" width="120" height="72" rx="8" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
      <text x="468" y="110" text-anchor="middle" font-family="Inter" font-size="10" fill="#065f46" font-weight="700">Clean Text</text>
      <text x="468" y="124" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Remove scripts/styles</text>
      <text x="468" y="136" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Remove nav/header/footer</text>
      <text x="468" y="148" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Keep lines &gt; 40 chars</text>
      <text x="468" y="160" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Max 6000 chars</text>
      <line x1="528" y1="126" x2="558" y2="126" stroke="#6366f1" stroke-width="2" marker-end="url(#c1)"/>

      <!-- Step 5: Return -->
      <rect x="558" y="90" width="130" height="72" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
      <text x="623" y="110" text-anchor="middle" font-family="Inter" font-size="10" fill="#4338ca" font-weight="700">Return Object</text>
      <text x="623" y="124" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">title, text, author</text>
      <text x="623" y="136" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">domain, wordCount</text>
      <text x="623" y="148" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">publishDate, desc</text>
      <text x="623" y="160" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">scrapedOk: true/false</text>
    </svg>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">🧹 stripHtml() Function — How It Works</div>
      <div class="card-body">
        <p>I wrote a regex-based HTML stripper that:</p>
        <ul style="padding-left:16px;margin-top:6px;font-size:11px;line-height:1.8;">
          <li>Removes all <code>&lt;script&gt;</code>, <code>&lt;style&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;header&gt;</code>, <code>&lt;footer&gt;</code> tags completely</li>
          <li>Converts <code>&lt;p&gt;</code>, <code>&lt;div&gt;</code>, <code>&lt;h1-h6&gt;</code> to newlines (preserves paragraph structure)</li>
          <li>Strips all remaining HTML tags with a generic regex</li>
          <li>Decodes HTML entities: <code>&amp;amp;</code> → &amp;, <code>&amp;nbsp;</code> → space</li>
          <li>Collapses multiple whitespace into clean newlines</li>
          <li>Filters lines shorter than 40 chars (removes menu items, footers)</li>
        </ul>
      </div>
    </div>
    <div class="card">
      <div class="card-title">📦 extractMeta() Function</div>
      <div class="card-body">
        <p>Meta tags can be written in 4 different formats across websites. I handle all of them:</p>
        <div class="code-block" style="margin-top:8px;">
          <pre style="font-size:9px;color:#a5b4fc;">// 4 regex patterns checked in order:
property="og:title" content="..."
content="..."   property="og:title"
name="title"    content="..."
content="..."   name="title"</pre>
        </div>
        <p style="margin-top:8px;font-size:11px;">This ensures I can extract title, author, publish date, and description from BBC, CNN, Times of India, and any other site.</p>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 7 — DATABASE LAYER
══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-num">10</div>
    <div class="section-title">Database Layer — Drizzle ORM<span>How I connected my routes to the PostgreSQL database</span></div>
  </div>

  <div class="info-box green">
    <h4>🔗 Who Did What With the Database?</h4>
    <p><strong>Student 4 (DB+DevOps)</strong> created the database schema (the table structure). <strong>My job (Student 1)</strong> was to use that schema inside my routes — writing INSERT and SELECT queries using Drizzle ORM whenever an analysis is done.</p>
  </div>

  <div class="diagram-box">
    <div class="diagram-title">🗄️ Database Schema — Tables I Interact With</div>
    <svg width="700" height="220" viewBox="0 0 700 220">
      <!-- analyses table -->
      <rect x="40" y="20" width="260" height="180" rx="10" fill="#f0fdf4" stroke="#10b981" stroke-width="2"/>
      <rect x="40" y="20" width="260" height="36" rx="10" fill="#10b981"/>
      <text x="170" y="44" text-anchor="middle" font-family="Inter" font-size="12" fill="#fff" font-weight="700">📋 analyses</text>
      ${[
        ["id","SERIAL PRIMARY KEY"],
        ["content","TEXT — the news text/url"],
        ["sourceType","TEXT — text/url/headline/image"],
        ["prediction","TEXT — Real/Fake/Misleading"],
        ["confidence","INTEGER — 0 to 100"],
        ["explanation","TEXT — AI verdict explanation"],
        ["keywords","TEXT[] — array of topics"],
        ["detectedSource","JSONB — {name, url}"],
        ["geminiVerification","JSONB — Gemini result"],
        ["factBreakdown","JSONB — fact check items"],
        ["createdAt","TIMESTAMPTZ — when saved"],
      ].map(([c,d],i)=>`
        <rect x="48" y="${62+i*13}" width="244" height="12" rx="2" fill="${i%2===0?'#dcfce7':'#f0fdf4'}"/>
        <text x="58" y="${72+i*13}" font-family="monospace" font-size="8" fill="#065f46" font-weight="700">${c}</text>
        <text x="145" y="${72+i*13}" font-family="monospace" font-size="7" fill="#6b7280">${d}</text>
      `).join('')}

      <!-- analysis_results table -->
      <rect x="390" y="20" width="260" height="100" rx="10" fill="#f0f4ff" stroke="#6366f1" stroke-width="2"/>
      <rect x="390" y="20" width="260" height="36" rx="10" fill="#6366f1"/>
      <text x="520" y="44" text-anchor="middle" font-family="Inter" font-size="12" fill="#fff" font-weight="700">📊 analysis_results</text>
      ${[
        ["id","SERIAL PRIMARY KEY"],
        ["analysisId","INTEGER — FK to analyses.id"],
        ["verifiedArticles","JSONB[] — source articles"],
      ].map(([c,d],i)=>`
        <rect x="398" y="${62+i*13}" width="244" height="12" rx="2" fill="${i%2===0?'#e0e7ff':'#f0f4ff'}"/>
        <text x="408" y="${72+i*13}" font-family="monospace" font-size="8" fill="#4338ca" font-weight="700">${c}</text>
        <text x="490" y="${72+i*13}" font-family="monospace" font-size="7" fill="#6b7280">${d}</text>
      `).join('')}

      <!-- FK arrow -->
      <line x1="305" y1="90" x2="390" y2="90" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#b1)"/>
      <text x="347" y="84" text-anchor="middle" font-family="Inter" font-size="9" fill="#6366f1">FK</text>

      <!-- conversations table -->
      <rect x="390" y="140" width="260" height="70" rx="10" fill="#fffbeb" stroke="#f59e0b" stroke-width="2"/>
      <rect x="390" y="140" width="260" height="30" rx="10" fill="#f59e0b"/>
      <text x="520" y="160" text-anchor="middle" font-family="Inter" font-size="12" fill="#fff" font-weight="700">💬 conversations + messages</text>
      <text x="520" y="177" text-anchor="middle" font-family="Inter" font-size="9" fill="#92400e">(Used by /chat route for conversation history)</text>
      <text x="520" y="193" text-anchor="middle" font-family="Inter" font-size="8" fill="#6b7280">id, title, createdAt / id, conversationId, role, content</text>
    </svg>
  </div>

  <div class="two-col">
    <div class="card">
      <div class="card-title">✍️ How I INSERT Data (analyze route)</div>
      <div class="code-block">
        <pre style="font-size:10px;color:#a5b4fc;line-height:1.7;"><span style="color:#636e9a">// After AI analysis completes:</span>
<span style="color:#c792ea">const</span> [newAnalysis] = <span style="color:#c792ea">await</span> db
  .insert(analyses)
  .values({
    content, sourceType: type,
    prediction, confidence,
    explanation, keywords,
    detectedSource, factBreakdown,
    geminiVerification
  })
  .returning();  <span style="color:#636e9a">// returns the saved row</span>

<span style="color:#c792ea">await</span> db.insert(analysisResults).values({
  analysisId: newAnalysis.id,
  verifiedArticles: []
});</pre>
      </div>
    </div>
    <div class="card">
      <div class="card-title">📖 How I READ Data (stats route)</div>
      <div class="code-block">
        <pre style="font-size:10px;color:#a5b4fc;line-height:1.7;"><span style="color:#636e9a">// Count all analyses:</span>
<span style="color:#c792ea">const</span> total = <span style="color:#c792ea">await</span> db
  .select({ count: sql<span style="color:#80cbc4">\`count(*)\`</span> })
  .from(analyses);

<span style="color:#636e9a">// Get trending topics (PostgreSQL unnest):</span>
<span style="color:#c792ea">const</span> trending = <span style="color:#c792ea">await</span> db.execute(sql<span style="color:#80cbc4">\`
  SELECT unnest(keywords) as topic,
    count(*) as count
  FROM analyses
  GROUP BY topic
  ORDER BY count DESC
  LIMIT 5
\`</span>);</pre>
      </div>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 8 — COMPLETE FLOW DIAGRAM
══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-num">11</div>
    <div class="section-title">Complete System Flow Diagram<span>End-to-end journey of a news analysis request</span></div>
  </div>

  <div class="diagram-box">
    <div class="diagram-title">🔄 Full Request Lifecycle — From User Click to Database Save</div>
    <svg width="700" height="500" viewBox="0 0 700 500">
      <defs>
        <marker id="d1" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#6366f1"/></marker>
        <marker id="d2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#10b981"/></marker>
        <marker id="d3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#f59e0b"/></marker>
      </defs>

      <!-- Layer labels -->
      <rect x="0" y="0" width="120" height="500" fill="#f8fafc"/>
      <text x="60" y="80" text-anchor="middle" font-family="Inter" font-size="9" fill="#9ca3af" font-weight="700" transform="rotate(-90,60,80)">FRONTEND (Student 2)</text>
      <text x="60" y="230" text-anchor="middle" font-family="Inter" font-size="9" fill="#9ca3af" font-weight="700" transform="rotate(-90,60,230)">BACKEND (Me - Student 1)</text>
      <text x="60" y="390" text-anchor="middle" font-family="Inter" font-size="9" fill="#9ca3af" font-weight="700" transform="rotate(-90,60,390)">AI + DB (Students 3 & 4)</text>
      <line x1="120" y1="0" x2="120" y2="500" stroke="#e2e8f0" stroke-width="1"/>
      <line x1="0" y1="170" x2="120" y2="170" stroke="#e2e8f0" stroke-width="1"/>
      <line x1="0" y1="320" x2="120" y2="320" stroke="#e2e8f0" stroke-width="1"/>

      <!-- 1. User clicks Analyze -->
      <rect x="130" y="20" width="130" height="40" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="195" y="36" text-anchor="middle" font-family="Inter" font-size="10" fill="#1d4ed8" font-weight="700">1. User Clicks Analyze</text>
      <text x="195" y="51" text-anchor="middle" font-family="Inter" font-size="8" fill="#3b82f6">Detect.tsx useAnalyzeContent()</text>
      <line x1="260" y1="40" x2="300" y2="40" stroke="#6366f1" stroke-width="1.5" marker-end="url(#d1)"/>

      <!-- 2. React Query -->
      <rect x="300" y="20" width="130" height="40" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5"/>
      <text x="365" y="36" text-anchor="middle" font-family="Inter" font-size="10" fill="#4338ca" font-weight="700">2. React Query Hook</text>
      <text x="365" y="51" text-anchor="middle" font-family="Inter" font-size="8" fill="#6366f1">POST /api/analyze + payload</text>
      <line x1="430" y1="40" x2="470" y2="40" stroke="#6366f1" stroke-width="1.5" marker-end="url(#d1)"/>

      <!-- 3. HTTP Request -->
      <rect x="470" y="20" width="130" height="40" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="535" y="36" text-anchor="middle" font-family="Inter" font-size="10" fill="#1d4ed8" font-weight="700">3. HTTP Request</text>
      <text x="535" y="51" text-anchor="middle" font-family="Inter" font-size="8" fill="#3b82f6">JSON body: {content, type}</text>

      <!-- Arrow down to Express -->
      <line x1="535" y1="60" x2="535" y2="105" stroke="#6366f1" stroke-width="1.5" marker-end="url(#d1)"/>

      <!-- 4. Express Middleware -->
      <rect x="470" y="110" width="130" height="40" rx="8" fill="#f0f4ff" stroke="#6366f1" stroke-width="1.5"/>
      <text x="535" y="126" text-anchor="middle" font-family="Inter" font-size="10" fill="#4338ca" font-weight="700">4. Express Middleware</text>
      <text x="535" y="141" text-anchor="middle" font-family="Inter" font-size="8" fill="#6366f1">Log → CORS → Parse JSON</text>
      <line x1="470" y1="130" x2="430" y2="130" stroke="#6366f1" stroke-width="1.5" marker-end="url(#d1)"/>

      <!-- 5. analyze.ts router -->
      <rect x="300" y="110" width="130" height="40" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
      <text x="365" y="126" text-anchor="middle" font-family="Inter" font-size="10" fill="#4338ca" font-weight="700">5. analyze.ts Route</text>
      <text x="365" y="141" text-anchor="middle" font-family="Inter" font-size="8" fill="#6366f1">Validate content + type</text>
      <line x1="300" y1="130" x2="260" y2="130" stroke="#6366f1" stroke-width="1.5" marker-end="url(#d1)"/>

      <!-- 6. URL scrape -->
      <rect x="130" y="110" width="130" height="40" rx="8" fill="#fffbeb" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="195" y="126" text-anchor="middle" font-family="Inter" font-size="10" fill="#92400e" font-weight="700">6. URL? → Scrape</text>
      <text x="195" y="141" text-anchor="middle" font-family="Inter" font-size="8" fill="#92400e">scraper.ts extracts article</text>

      <!-- Arrow down to AI -->
      <line x1="365" y1="150" x2="365" y2="195" stroke="#6366f1" stroke-width="1.5" marker-end="url(#d1)"/>

      <!-- 7. GPT + Gemini parallel -->
      <rect x="250" y="200" width="130" height="55" rx="8" fill="#fee2e2" stroke="#ef4444" stroke-width="1.5"/>
      <text x="315" y="219" text-anchor="middle" font-family="Inter" font-size="10" fill="#991b1b" font-weight="700">7. GPT-5.2</text>
      <text x="315" y="233" text-anchor="middle" font-family="Inter" font-size="8" fill="#991b1b">10-dim forensic analysis</text>
      <text x="315" y="245" text-anchor="middle" font-family="Inter" font-size="8" fill="#991b1b">Prediction + confidence</text>

      <rect x="400" y="200" width="130" height="55" rx="8" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
      <text x="465" y="219" text-anchor="middle" font-family="Inter" font-size="10" fill="#065f46" font-weight="700">7. Gemini 2.5</text>
      <text x="465" y="233" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Independent verification</text>
      <text x="465" y="245" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Cross-checks GPT</text>

      <text x="390" y="222" text-anchor="middle" font-family="Inter" font-size="9" fill="#6d28d9" font-weight="700">PARALLEL</text>
      <rect x="376" y="200" width="2" height="55" fill="#8b5cf6"/>

      <!-- Arrows down to consensus -->
      <line x1="315" y1="255" x2="365" y2="295" stroke="#6366f1" stroke-width="1.5" marker-end="url(#d1)"/>
      <line x1="465" y1="255" x2="415" y2="295" stroke="#6366f1" stroke-width="1.5" marker-end="url(#d1)"/>

      <!-- 8. Consensus -->
      <rect x="300" y="300" width="160" height="50" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
      <text x="380" y="320" text-anchor="middle" font-family="Inter" font-size="11" fill="#4338ca" font-weight="700">8. buildConsensus()</text>
      <text x="380" y="337" text-anchor="middle" font-family="Inter" font-size="8" fill="#4338ca">GPT 55% + Gemini 45% → final verdict</text>
      <line x1="300" y1="325" x2="260" y2="325" stroke="#10b981" stroke-width="1.5" marker-end="url(#d2)"/>
      <line x1="460" y1="325" x2="490" y2="325" stroke="#10b981" stroke-width="1.5" marker-end="url(#d2)"/>

      <!-- 9. DB Save -->
      <rect x="490" y="300" width="130" height="50" rx="8" fill="#f0fdf4" stroke="#10b981" stroke-width="2"/>
      <text x="555" y="320" text-anchor="middle" font-family="Inter" font-size="11" fill="#065f46" font-weight="700">9. DB Save</text>
      <text x="555" y="337" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">INSERT into PostgreSQL</text>

      <!-- 10. Response -->
      <rect x="130" y="300" width="130" height="50" rx="8" fill="#d1fae5" stroke="#10b981" stroke-width="2"/>
      <text x="195" y="320" text-anchor="middle" font-family="Inter" font-size="11" fill="#065f46" font-weight="700">10. JSON Response</text>
      <text x="195" y="337" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">prediction + all fields</text>

      <!-- Arrow back up to frontend -->
      <line x1="195" y1="300" x2="195" y2="200" stroke="#10b981" stroke-width="1.5" stroke-dasharray="5,3" marker-end="url(#d2)"/>
      <rect x="130" y="190" width="130" height="40" rx="8" fill="#d1fae5" stroke="#10b981" stroke-width="1.5"/>
      <text x="195" y="207" text-anchor="middle" font-family="Inter" font-size="10" fill="#065f46" font-weight="700">11. UI Updates</text>
      <text x="195" y="221" text-anchor="middle" font-family="Inter" font-size="8" fill="#065f46">Dashboard + verdict shown</text>

      <!-- Time label -->
      <rect x="130" y="400" width="490" height="30" rx="6" fill="#f0fdf4" stroke="#10b981"/>
      <text x="375" y="420" text-anchor="middle" font-family="Inter" font-size="10" fill="#065f46" font-weight="600">⏱️ Total response time: ~2–4 seconds (AI calls run in parallel to save time)</text>
    </svg>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 9 — TECH STACK SUMMARY
══════════════════════════════════════════════════════════ -->
<div class="page">
  <div class="section-header">
    <div class="section-num">12</div>
    <div class="section-title">Tech Stack Summary<span>All tools, libraries, and AI models I used as Backend Developer</span></div>
  </div>

  <div class="diagram-box">
    <div class="diagram-title">🛠️ My Complete Technology Stack</div>
    <table>
      <tr><th>Category</th><th>Technology</th><th>Version</th><th>What I Used It For</th></tr>
      <tr><td>Runtime</td><td>Node.js</td><td>v20+</td><td>Server runtime — runs my TypeScript backend</td></tr>
      <tr><td>Language</td><td>TypeScript</td><td>5.x</td><td>Type-safe code — catches bugs at compile time, not runtime</td></tr>
      <tr><td>Framework</td><td>Express.js</td><td>v5</td><td>HTTP server framework — handles routes, middleware, requests</td></tr>
      <tr><td>Logging</td><td>pino + pino-http</td><td>9.x</td><td>Fast structured JSON logging for every API request</td></tr>
      <tr><td>AI Model 1</td><td>OpenAI GPT-5.2</td><td>API</td><td>/analyze, /chat, /credibility, /trending, /quiz routes</td></tr>
      <tr><td>AI Model 2</td><td>Google Gemini 2.5 Flash</td><td>API</td><td>/analyze, /chat, /credibility — independent verification</td></tr>
      <tr><td>AI Model 3</td><td>Anthropic Claude Sonnet</td><td>API</td><td>/chat only — final streaming synthesis response</td></tr>
      <tr><td>Database ORM</td><td>Drizzle ORM</td><td>0.30</td><td>Type-safe SQL queries — INSERT and SELECT operations</td></tr>
      <tr><td>Database</td><td>PostgreSQL</td><td>15</td><td>Stores all analyses, conversations, messages</td></tr>
      <tr><td>API Spec</td><td>OpenAPI 3.1 YAML</td><td>—</td><td>I defined the API contract for other students to use</td></tr>
      <tr><td>Codegen</td><td>Orval</td><td>7.x</td><td>Auto-generates React Query hooks from my OpenAPI spec</td></tr>
      <tr><td>Monorepo</td><td>pnpm workspaces</td><td>9.x</td><td>Shares code between my API server and other packages</td></tr>
    </table>
  </div>

  <div class="three-col" style="margin-top:16px;">
    <div class="info-box">
      <h4>🔥 Hardest Part I Did</h4>
      <p>The <strong>SSE streaming chat route</strong> was the most difficult. I had to manage 3 AI models, write each Claude token to the response stream, handle URL scraping mid-stream, and send structured events like "analyzing…" and "verdict" — all while keeping the connection open.</p>
    </div>
    <div class="info-box green">
      <h4>⚡ Performance Optimization</h4>
      <p>I used <strong>Promise.allSettled()</strong> to run GPT and Gemini <strong>at the same time</strong> instead of one after the other. This cuts response time from ~6 seconds to ~3 seconds. Also added in-memory caching for trending (10min) and quiz (24h).</p>
    </div>
    <div class="info-box orange">
      <h4>🛡️ Error Handling</h4>
      <p>Every route has try/catch. If one AI fails, the other continues. If scraping fails, analysis still runs with just the URL. The <code>allSettled()</code> pattern means one AI timing out never crashes the whole request.</p>
    </div>
  </div>

  <div class="diagram-box" style="margin-top:16px;">
    <div class="diagram-title">📋 All API Endpoints — Quick Reference</div>
    <table>
      <tr><th>Method</th><th>Endpoint</th><th>Input</th><th>Output</th><th>AI Used</th></tr>
      <tr><td><span class="chip green">GET</span></td><td><code>/api/healthz</code></td><td>—</td><td>{status:"ok"}</td><td>None</td></tr>
      <tr><td><span class="chip blue">POST</span></td><td><code>/api/analyze</code></td><td>{content, type}</td><td>Full analysis JSON</td><td>GPT + Gemini</td></tr>
      <tr><td><span class="chip blue">POST</span></td><td><code>/api/chat</code></td><td>{messages[]}</td><td>SSE stream</td><td>GPT + Gemini + Claude</td></tr>
      <tr><td><span class="chip blue">POST</span></td><td><code>/api/credibility</code></td><td>{source}</td><td>Trust score JSON</td><td>GPT + Gemini</td></tr>
      <tr><td><span class="chip green">GET</span></td><td><code>/api/trending</code></td><td>—</td><td>8 stories (cached 10min)</td><td>GPT</td></tr>
      <tr><td><span class="chip green">GET</span></td><td><code>/api/quiz</code></td><td>—</td><td>10 questions (cached 24h)</td><td>GPT</td></tr>
      <tr><td><span class="chip green">GET</span></td><td><code>/api/stats</code></td><td>—</td><td>Counts + topics</td><td>None (DB)</td></tr>
      <tr><td><span class="chip green">GET</span></td><td><code>/api/history</code></td><td>—</td><td>Last 20 analyses</td><td>None (DB)</td></tr>
    </table>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════
     PAGE 10 — CONCLUSION
══════════════════════════════════════════════════════════ -->
<div class="page" style="page-break-after:auto;">
  <div class="section-header">
    <div class="section-num">✅</div>
    <div class="section-title">Summary — What I Built<span>Student 1 Backend Complete Contribution</span></div>
  </div>

  <div style="background:linear-gradient(135deg,#0f0c29,#302b63);border-radius:16px;padding:32px;margin-bottom:24px;">
    <h2 style="color:#fff;font-size:24px;font-weight:800;margin-bottom:8px;">My Backend Powers the Entire App</h2>
    <p style="color:#94a3b8;font-size:13px;line-height:1.7;">Without my backend, none of the 11 frontend pages would work. Every button click, every analysis, every chat message, every quiz question — it all goes through the Express server I built.</p>
  </div>

  <div class="three-col">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:36px;font-weight:900;color:#10b981;">7</div>
      <div style="font-size:12px;color:#065f46;font-weight:600;margin-top:4px;">API Routes Built</div>
      <div style="font-size:10px;color:#6b7280;margin-top:4px;">analyze, chat, credibility, trending, quiz, stats, history</div>
    </div>
    <div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:36px;font-weight:900;color:#6366f1;">3</div>
      <div style="font-size:12px;color:#4338ca;font-weight:600;margin-top:4px;">AI Models Integrated</div>
      <div style="font-size:10px;color:#6b7280;margin-top:4px;">GPT-5.2 + Gemini 2.5 Flash + Claude Sonnet</div>
    </div>
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;text-align:center;">
      <div style="font-size:36px;font-weight:900;color:#f59e0b;">900+</div>
      <div style="font-size:12px;color:#92400e;font-weight:600;margin-top:4px;">Lines of Backend Code</div>
      <div style="font-size:10px;color:#6b7280;margin-top:4px;">Routes + Scraper + App Setup + Middleware</div>
    </div>
  </div>

  <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">
    <div class="card">
      <div class="card-title">🏆 Key Technical Achievements</div>
      <div class="card-body">
        <ul style="padding-left:16px;line-height:2;">
          <li>✅ Dual-AI consensus algorithm (GPT 55% + Gemini 45% weighting)</li>
          <li>✅ SSE streaming chat with 3 AI models in one request</li>
          <li>✅ Custom HTML scraper — no external library needed</li>
          <li>✅ In-memory caching (saves cost, improves speed)</li>
          <li>✅ Parallel AI calls with Promise.allSettled()</li>
          <li>✅ Multi-claim decomposition algorithm</li>
          <li>✅ Image forensics support (base64 + vision API)</li>
          <li>✅ Graceful error handling — app never crashes</li>
        </ul>
      </div>
    </div>
    <div class="card">
      <div class="card-title">📚 Real-World Concepts I Applied</div>
      <div class="card-body">
        <ul style="padding-left:16px;line-height:2;">
          <li>✅ <strong>REST API Design</strong> — proper methods, routes, status codes</li>
          <li>✅ <strong>Middleware Pattern</strong> — logging, CORS, body parsing</li>
          <li>✅ <strong>Async/Await</strong> — all database and AI calls</li>
          <li>✅ <strong>Server-Sent Events</strong> — real-time streaming</li>
          <li>✅ <strong>ORM Pattern</strong> — Drizzle for type-safe DB queries</li>
          <li>✅ <strong>Caching Strategy</strong> — TTL-based in-memory cache</li>
          <li>✅ <strong>API Contract</strong> — OpenAPI spec for team coordination</li>
          <li>✅ <strong>Code Generation</strong> — Orval for auto-generating hooks</li>
        </ul>
      </div>
    </div>
  </div>

  <div style="margin-top:20px;background:linear-gradient(135deg,#f0f4ff,#f5f3ff);border:1px solid #c7d2fe;border-radius:12px;padding:20px;text-align:center;">
    <p style="font-size:14px;font-weight:700;color:#4338ca;">Prepared by: Student 1 — Backend Developer</p>
    <p style="font-size:12px;color:#6b7280;margin-top:4px;">SatyaCheck — Fake News Detection System | August 2026</p>
    <p style="font-size:11px;color:#9ca3af;margin-top:4px;">Technologies: Express 5 · TypeScript · OpenAI · Gemini · Claude · Drizzle ORM · PostgreSQL · SSE · pnpm</p>
  </div>
</div>

</body>
</html>`;

// Write HTML to file
fs.writeFileSync("/tmp/backend-report.html", html);

let browser;
try {
  // Try to find chromium
  let execPath;
  try {
    execPath = execSync("which chromium-browser || which chromium || which google-chrome || which google-chrome-stable", { encoding: "utf8" }).trim().split("\n")[0];
  } catch {
    execPath = "/run/current-system/sw/bin/chromium";
  }

  browser = await puppeteer.launch({
    executablePath: execPath,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--no-first-run"],
    headless: true,
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0", timeout: 60000 });

  // Wait a bit for fonts/animations
  await new Promise(r => setTimeout(r, 2000));

  await page.pdf({
    path: "SatyaCheck-Student1-Backend-Report.pdf",
    format: "A4",
    printBackground: true,
    margin: { top: "0mm", bottom: "0mm", left: "0mm", right: "0mm" },
  });

  console.log("PDF generated successfully!");
} catch (e) {
  console.error("Error:", e.message);
} finally {
  if (browser) await browser.close();
}

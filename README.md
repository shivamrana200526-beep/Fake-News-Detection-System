# SatyaCheck — Frontend (React + JavaScript)

This is the standalone **React + JavaScript** frontend for the **SatyaCheck** Fake News Detection platform. All TypeScript code has been cleanly converted to modern JavaScript (`.jsx` / `.js`) with full Vite and Tailwind CSS support.

---

## 📁 Project Structure

```text
frontend-js/
├── index.html            # Main HTML entry point
├── package.json          # Dependencies and scripts (React 19 + Vite)
├── vite.config.js        # Vite configuration with API proxy and Tailwind plugin
├── jsconfig.json         # Path alias configuration for VS Code (@/* -> src/*)
├── components.json       # shadcn/ui configuration
├── public/               # Static assets (favicons, images, opengraph)
│   ├── favicon.svg
│   └── images/
└── src/
    ├── main.jsx          # React DOM root entry
    ├── App.jsx           # Main application routing and providers
    ├── index.css         # Tailwind CSS styling and theme definitions
    ├── pages/            # Page components
    │   ├── Home.jsx         # Landing page with stats counter
    │   ├── Detect.jsx       # Multi-modal detection (Text, URL, Headline, Image)
    │   ├── Forward.jsx      # WhatsApp/Telegram forwarded message analyzer
    │   ├── Chat.jsx         # Conversational fact-checking assistant
    │   ├── Dashboard.jsx    # Analytics charts and detection history
    │   ├── Credibility.jsx  # News source credibility & bias checker
    │   ├── Quiz.jsx         # Interactive fake news quiz game
    │   ├── Trending.jsx     # Currently circulating misinformation alerts
    │   ├── History.jsx      # Local analysis history & export
    │   ├── Education.jsx    # Media literacy & fact-checking guide
    │   └── not-found.jsx    # 404 error page
    ├── components/
    │   ├── layout/          # Navbar, Footer, PageWrapper
    │   └── ui/              # shadcn/ui buttons, cards, dialogs, etc.
    ├── hooks/
    │   ├── use-analysis.js  # React Query hooks for /api/analyze, /api/stats, /api/history
    │   ├── use-theme.js     # Dark/Light mode theme hook
    │   ├── use-toast.js     # Toast notification hook
    │   └── use-voice-input.js # Speech recognition hook for voice input
    └── lib/
        └── utils.js         # Tailwind cn() class merge helper
```

---

## 🚀 How to Run in VS Code (Step-by-Step)

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File** > **Open Folder...** (or press `Ctrl + K, Ctrl + O`).
3. Navigate to and select this folder:
   ```text
   Fake-News-Defense\frontend-js
   ```
4. Click **Select Folder**.

---

### Step 2: Open the Integrated Terminal
- Press **`` Ctrl + ` ``** (Ctrl + backtick) or go to **Terminal** > **New Terminal** in the top menu bar.

---

### Step 3: Install Dependencies
In the terminal, run:
```bash
npm install
```
*(Note: If you use `pnpm`, you can also run `pnpm install`)*.

---

### Step 4: Start the Development Server
Run the following command:
```bash
npm run dev
```

You will see output similar to:
```text
  VITE v7.3.0  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### Step 5: Open in Browser
- Hold `Ctrl` and click the `http://localhost:5173/` link in your terminal, or open your web browser and navigate to:
  👉 **http://localhost:5173**

---

## ⚙️ Connecting to Backend API

By default, `vite.config.js` proxies all `/api/*` calls directly to your backend server at `http://127.0.0.1:3000`:

```javascript
server: {
  port: 5173,
  proxy: {
    "/api": {
      target: "http://127.0.0.1:3000",
      changeOrigin: true,
    },
  },
}
```

No `.env` file or environment variables are needed. If your backend runs on a different port, update the `target` URL directly in `vite.config.js`.

---

## 📦 Building for Production

To create an optimized production build:
```bash
npm run build
```
The compiled files will be output to the `dist/` directory. You can preview the production build locally with:
```bash
npm run preview
```

# SatyaCheck - Full Stack Setup & Run Script
# Works dynamically on ANY machine/laptop!
# Usage: powershell -ExecutionPolicy Bypass -File setup-and-run.ps1

$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  SatyaCheck Full Stack Setup & Run   " -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# ─── STEP 1: Verify Node.js ──────────────────────────────────────────────────
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Yellow
$nodeCheck = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeCheck) {
    Write-Host "  ERROR: Node.js is not installed! Please install Node.js 20+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js found: $(node -v)" -ForegroundColor Green

# ─── STEP 2: Checking Ollama ─────────────────────────────────────────────────
Write-Host "[2/5] Checking Ollama..." -ForegroundColor Yellow
$ollamaPath = Get-Command ollama -ErrorAction SilentlyContinue
if (-not $ollamaPath) {
    Write-Host "  Ollama not found. Please install Ollama from: https://ollama.com/download" -ForegroundColor Yellow
} else {
    Write-Host "  Starting Ollama service if not already running..." -ForegroundColor Gray
    $ollamaRunning = try { (Invoke-WebRequest -Uri "http://127.0.0.1:11434" -UseBasicParsing -TimeoutSec 2).StatusCode -eq 200 } catch { $false }
    if (-not $ollamaRunning) {
        Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
        Start-Sleep -Seconds 3
        Write-Host "  Ollama server started." -ForegroundColor Green
    } else {
        Write-Host "  Ollama already running." -ForegroundColor Green
    }
}

# ─── STEP 3: Setup .env file ─────────────────────────────────────────────────
Write-Host "[3/5] Checking environment configuration (.env)..." -ForegroundColor Yellow
$envPath = Join-Path $ROOT ".env"
$envExamplePath = Join-Path $ROOT ".env.example"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item -Path $envExamplePath -Destination $envPath
        Write-Host "  Created .env from .env.example." -ForegroundColor Green
    } else {
        @"
PORT=3000
NODE_ENV=development
OLLAMA_BASE_URL=http://127.0.0.1:11434/v1
OLLAMA_MODEL=llama3.2:1b
"@ | Out-File -FilePath $envPath -Encoding utf8
        Write-Host "  Created fresh .env file." -ForegroundColor Green
    }
} else {
    Write-Host "  .env file exists." -ForegroundColor Green
}

# ─── STEP 4: Install Dependencies ────────────────────────────────────────────
Write-Host "[4/5] Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path (Join-Path $ROOT "node_modules"))) {
    Write-Host "  Installing project dependencies (this may take a minute)..." -ForegroundColor Gray
    $pnpmCheck = Get-Command pnpm -ErrorAction SilentlyContinue
    if ($pnpmCheck) {
        & pnpm install
    } else {
        & npm install
    }
}
Write-Host "  Dependencies verified." -ForegroundColor Green
$frontendDir = Join-Path $ROOT "frontend-js"
if (Test-Path $frontendDir) {
    if (-not (Test-Path (Join-Path $frontendDir "node_modules"))) {
        Write-Host "  Installing frontend dependencies (npm install in frontend-js)..." -ForegroundColor Gray
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm install" -WorkingDirectory $frontendDir -Wait
        Write-Host "  Frontend dependencies installed." -ForegroundColor Green
    }
}

# ─── STEP 5: Start Backend & Frontend ────────────────────────────────────────
Write-Host "[5/5] Launching SatyaCheck..." -ForegroundColor Yellow

# Start backend in a separate background window
$backendScript = Join-Path $ROOT "artifacts\api-server\src\index.js"
Start-Process -FilePath "node" -ArgumentList "--env-file=`"$envPath`" `"$backendScript`"" -WorkingDirectory $ROOT

# Start frontend
$frontendDir = Join-Path $ROOT "frontend-js"
if (Test-Path $frontendDir) {
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd `"$frontendDir`" && npm run dev" -WorkingDirectory $frontendDir
}

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=======================================" -ForegroundColor Green
Write-Host "  ALL SYSTEMS RUNNING!                 " -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Open http://localhost:5173 in your browser!" -ForegroundColor White
Write-Host ""

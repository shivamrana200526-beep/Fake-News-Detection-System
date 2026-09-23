# Contributing to SatyaCheck

Thank you for your interest in contributing to **SatyaCheck**! We welcome contributions from developers, fact-checkers, journalists, and open-source enthusiasts.

---

## 📋 Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Branch Naming Convention](#branch-naming-convention)
5. [Pull Request Process](#pull-request-process)
6. [Testing Standards](#testing-standards)

---

## Code of Conduct
This project adheres to the [Contributor Covenant](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to project maintainers.

---

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/<your-username>/Fake-News-Detection-System.git
   cd Fake-News-Detection-System
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the local development server**:
   ```bash
   npm run dev
   ```
5. **Run test suite**:
   ```bash
   npm test
   ```

---

## Development Workflow

* Keep code modular, readable, and written in **pure JavaScript** (React 19).
* Follow Tailwind CSS conventions for styling.
* Never commit secrets, API keys, or private `.env` files.
* Test all new UI components and logic before submitting a Pull Request.

---

## Branch Naming Convention

* `feat/<feature-name>`: For new features or forensic diagnostic metrics.
* `fix/<bug-name>`: For bug fixes or UI improvements.
* `docs/<topic>`: For documentation additions or updates.
* `test/<suite>`: For new automated tests.

---

## Pull Request Process

1. Ensure all tests pass:
   ```bash
   npm test
   ```
2. Ensure the production build succeeds:
   ```bash
   npm run build
   ```
3. Push to your branch and open a Pull Request against the `main` branch.
4. Describe the problem solved and link any related issues.

Thank you for helping combat misinformation and promote truth in digital media!

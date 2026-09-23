import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage implementation
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new LocalStorageMock();

const STORAGE_KEY = "satyacheck_history_test";

function saveToHistory(entry) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const updated = [newEntry, ...existing].slice(0, 100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

function generateCSV(entries) {
  const rows = [
    ["Date", "Type", "Content", "Verdict", "Confidence"],
    ...entries.map((e) => [
      e.timestamp,
      e.type,
      (e.content || "").replace(/,/g, ";"),
      e.verdict,
      e.confidence ? String(e.confidence) : "",
    ]),
  ];
  return rows.map((r) => r.join(",")).join("\n");
}

describe("History Storage & CSV Export", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves a new analysis entry to history", () => {
    const entry = {
      content: "Viral forward claim",
      type: "text",
      verdict: "Fake",
      confidence: 95,
      explanation: "Debunked by official records",
    };
    const updated = saveToHistory(entry);
    expect(updated).toHaveLength(1);
    expect(updated[0].content).toBe("Viral forward claim");
    expect(updated[0].verdict).toBe("Fake");
    expect(updated[0].id).toBeDefined();
    expect(updated[0].timestamp).toBeDefined();
  });

  it("caps history at maximum 100 entries", () => {
    for (let i = 0; i < 105; i++) {
      saveToHistory({ content: `Claim ${i}`, type: "text", verdict: "Real", confidence: 80 });
    }
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    expect(stored).toHaveLength(100);
  });

  it("formats CSV correctly with valid headers and escaped columns", () => {
    const entries = [
      { timestamp: "2026-09-14T10:00:00Z", type: "text", content: "Claim A, with comma", verdict: "Real", confidence: 90 },
      { timestamp: "2026-09-14T11:00:00Z", type: "url", content: "https://example.com", verdict: "Fake", confidence: 99 },
    ];
    const csv = generateCSV(entries);
    const lines = csv.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe("Date,Type,Content,Verdict,Confidence");
    expect(lines[1]).toContain("Claim A; with comma");
    expect(lines[1]).toContain("Real");
    expect(lines[2]).toContain("https://example.com");
  });
});

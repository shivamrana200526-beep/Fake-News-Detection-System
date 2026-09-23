import { describe, it, expect } from "vitest";

function getVerdictClassification(prediction) {
  const p = (prediction || "").toLowerCase();
  if (p === "real") return "VERIFIED REAL";
  if (p === "fake") return "IDENTIFIED FAKE";
  return "MISLEADING CONTEXT";
}

function getManipulationSeverity(score) {
  if (score >= 60) return "high";
  if (score >= 35) return "moderate";
  return "low";
}

function calculatePieData(prediction, confidence) {
  const p = (prediction || "").toLowerCase();
  const c = Math.min(100, Math.max(0, confidence || 50));
  if (p === "real") {
    return [{ name: "Real", value: c }, { name: "Other", value: 100 - c }];
  } else if (p === "fake") {
    return [{ name: "Real", value: 100 - c }, { name: "Fake", value: c }];
  } else {
    return [
      { name: "Real", value: Math.max(0, 50 - c / 4) },
      { name: "Fake", value: Math.max(0, 50 - c / 4) },
      { name: "Misleading", value: c },
    ];
  }
}

describe("Verdict Classification & Scoring", () => {
  it("classifies Real prediction accurately", () => {
    expect(getVerdictClassification("Real")).toBe("VERIFIED REAL");
    expect(getVerdictClassification("real")).toBe("VERIFIED REAL");
  });

  it("classifies Fake prediction accurately", () => {
    expect(getVerdictClassification("Fake")).toBe("IDENTIFIED FAKE");
    expect(getVerdictClassification("fake")).toBe("IDENTIFIED FAKE");
  });

  it("defaults to Misleading Context for other or unknown verdicts", () => {
    expect(getVerdictClassification("Misleading")).toBe("MISLEADING CONTEXT");
    expect(getVerdictClassification("unknown")).toBe("MISLEADING CONTEXT");
    expect(getVerdictClassification("")).toBe("MISLEADING CONTEXT");
  });

  it("evaluates manipulation severity thresholds accurately", () => {
    expect(getManipulationSeverity(85)).toBe("high");
    expect(getManipulationSeverity(60)).toBe("high");
    expect(getManipulationSeverity(50)).toBe("moderate");
    expect(getManipulationSeverity(35)).toBe("moderate");
    expect(getManipulationSeverity(20)).toBe("low");
    expect(getManipulationSeverity(0)).toBe("low");
  });

  it("generates balanced chart data for Real news", () => {
    const data = calculatePieData("Real", 85);
    expect(data[0].value).toBe(85);
    expect(data[1].value).toBe(15);
    expect(data[0].value + data[1].value).toBe(100);
  });

  it("generates balanced chart data for Fake news", () => {
    const data = calculatePieData("Fake", 90);
    expect(data[0].value).toBe(10);
    expect(data[1].value).toBe(90);
    expect(data[0].value + data[1].value).toBe(100);
  });
});

import { describe, it, expect } from "vitest";
import { cn } from "../lib/utils.js";

describe("cn utility function", () => {
  it("merges standard class names correctly", () => {
    const result = cn("btn", "btn-primary");
    expect(result).toBe("btn btn-primary");
  });

  it("handles conditional classes properly", () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn("base", isActive && "active", isDisabled && "disabled");
    expect(result).toBe("base active");
  });

  it("resolves Tailwind CSS conflicts with twMerge", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("ignores null, undefined, and false values", () => {
    const result = cn("valid", null, undefined, false, "also-valid");
    expect(result).toBe("valid also-valid");
  });
});

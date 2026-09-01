import { describe, expect, it } from "vitest";
import { analyzeMonthlyRevenue } from "./revenue-analysis";

const history = [100, 110, 90, 105, 95, 100].map((omzet, index) => ({ masaPajak: `2026-0${index + 1}`, omzet }));

describe("analyzeMonthlyRevenue", () => {
  it("classifies revenue inside the tolerance band as normal", () => {
    expect(analyzeMonthlyRevenue(history, 102).status).toBe("NORMAL");
  });

  it("classifies revenue outside the upper and lower bounds", () => {
    expect(analyzeMonthlyRevenue(history, 200).status).toBe("ABOVE");
    expect(analyzeMonthlyRevenue(history, 10).status).toBe("BELOW");
  });

  it("does not infer a trend from fewer than three historical periods", () => {
    const result = analyzeMonthlyRevenue(history.slice(0, 2), 120);
    expect(result.status).toBe("INSUFFICIENT");
    expect(result.upper).toBeNull();
  });
});

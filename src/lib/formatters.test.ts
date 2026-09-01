import { describe, expect, it } from "vitest";
import { formatDate, formatTaxPeriod, rupiah } from "./formatters";

describe("formatters", () => {
  it("memformat rupiah tanpa pecahan", () => expect(rupiah.format(1250000)).toMatch(/1\.250\.000/));
  it("memformat masa pajak Indonesia", () => expect(formatTaxPeriod("2026-08")).toBe("Agustus 2026"));
  it("aman terhadap tanggal kosong atau invalid", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate("invalid")).toBe("—");
  });
});

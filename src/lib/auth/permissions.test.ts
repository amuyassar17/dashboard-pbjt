import { describe, expect, it } from "vitest";
import { canManageStaff, getAllowedActions } from "./permissions";

const roles = ["PBJT_VERIFIER", "PBJT_KABID", "PBJT_SUPER_ADMIN", "PBJT_AUDITOR"] as const;

describe("getAllowedActions", () => {
  it("memberi Verifier aksi pada antrean admin", () => {
    expect(getAllowedActions("PBJT_VERIFIER", "MENUNGGU_VERIFIKASI", "WAITING_ADMIN")).toEqual(["verifier-approve", "verifier-revision"]);
  });

  it("memberi Kabid approval dan retry sesuai tahap", () => {
    expect(getAllowedActions("PBJT_KABID", "MENUNGGU_VERIFIKASI", "WAITING_KABID")).toEqual(["kabid-approve", "kabid-revision"]);
    expect(getAllowedActions("PBJT_KABID", "MENUNGGU_PEMBAYARAN", "SYNC_FAILED")).toEqual(["simpakdu-retry"]);
  });

  it("menjaga Auditor read-only pada seluruh tahap", () => {
    for (const stage of ["WAITING_ADMIN", "WAITING_KABID", "SYNC_FAILED"]) {
      expect(getAllowedActions("PBJT_AUDITOR", "MENUNGGU_VERIFIKASI", stage)).toEqual([]);
    }
  });

  it("hanya Super Admin dapat mengelola staff", () => {
    expect(roles.filter(canManageStaff)).toEqual(["PBJT_SUPER_ADMIN"]);
  });
});

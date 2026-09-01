import { describe, expect, it } from "vitest";
import { apiEnvelopeSchema, dashboardSptpdSchema, paginationSchema, workflowCommandSchema } from "./contracts";
import { z } from "zod";

const sptpd = {
  id: "1", userId: "u1", noSptpd: "", kdPajak: "02", jenisOp: "Restoran", noOp: "op1", namaOp: "Warung Test", alamatOp: "Makassar", npwpd: "P200", masaPajak: "2026-08", tarifPersen: 10, dasarPengenaan: 100000, pajakTerutang: 10000, denda: 0, totalTagihan: 10000, discount: 0, status: "MENUNGGU_VERIFIKASI", isAgreed: true, createdAt: "2026-08-01T00:00:00Z", updatedAt: "2026-08-01T00:00:00Z", workflowStage: "WAITING_ADMIN", simpakduSyncStatus: "NOT_STARTED",
};

describe("API contracts", () => {
  it("memvalidasi list pada data dan pagination pada meta", () => {
    const envelope = apiEnvelopeSchema(z.array(dashboardSptpdSchema)).parse({ status: true, data: [sptpd], meta: { total: 1, page: 1, limit: 20 } });
    expect(envelope.data).toHaveLength(1);
    expect(paginationSchema.parse(envelope.meta)).toEqual({ total: 1, page: 1, limit: 20 });
  });

  it("menolak field SPTPD wajib yang hilang", () => {
    expect(dashboardSptpdSchema.safeParse({ ...sptpd, npwpd: undefined }).success).toBe(false);
  });

  it("mengubah note workflow kosong menjadi string", () => {
    expect(workflowCommandSchema.parse({})).toEqual({ note: "" });
  });
});

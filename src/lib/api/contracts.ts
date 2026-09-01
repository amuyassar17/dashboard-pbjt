import { z } from "zod";

export const staffRoles = [
  "PBJT_VERIFIER",
  "PBJT_KABID",
  "PBJT_SUPER_ADMIN",
  "PBJT_AUDITOR",
] as const;
export const staffRoleSchema = z.enum(staffRoles);
export type StaffRole = z.infer<typeof staffRoleSchema>;

export const publicStatuses = [
  "DRAFT",
  "REVISI",
  "MENUNGGU_VERIFIKASI",
  "MENUNGGU_PEMBAYARAN",
  "LUNAS",
] as const;
export const publicStatusSchema = z.enum(publicStatuses);
export type PublicStatus = z.infer<typeof publicStatusSchema>;

export const workflowStages = [
  "NONE",
  "WAITING_ADMIN",
  "WAITING_KABID",
  "PROCESSING_SIMPAKDU",
  "SYNC_FAILED",
  "COMPLETED",
] as const;
export const workflowStageSchema = z.enum(workflowStages);
export type WorkflowStage = z.infer<typeof workflowStageSchema>;

const nullableDate = z.string().nullable().optional();

export const staffSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: staffRoleSchema,
  isActive: z.boolean(),
  lastLoginAt: nullableDate,
  createdBy: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Staff = z.infer<typeof staffSchema>;

export const authResultSchema = z.object({
  staff: staffSchema,
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
});

export const omzetSchema = z.object({
  id: z.string(),
  sptpdId: z.string(),
  tanggal: z.string(),
  pendapatan: z.number(),
  isLibur: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type OmzetHarian = z.infer<typeof omzetSchema>;

export const omzetBulananSchema = z.object({
  masaPajak: z.string(),
  omzet: z.number(),
});
export type OmzetBulanan = z.infer<typeof omzetBulananSchema>;

const sptpdBase = z.object({
  id: z.string(),
  userId: z.string(),
  noSptpd: z.string(),
  kdPajak: z.string(),
  jenisOp: z.string(),
  noOp: z.string(),
  namaOp: z.string(),
  alamatOp: z.string(),
  npwpd: z.string(),
  masaPajak: z.string(),
  tarifPersen: z.number(),
  dasarPengenaan: z.number(),
  pajakTerutang: z.number(),
  denda: z.number(),
  totalTagihan: z.number(),
  discount: z.number(),
  status: z.string(),
  revisionNote: z.string().optional(),
  isAgreed: z.boolean(),
  noVa: z.string().nullable().optional(),
  vaExpiredAt: nullableDate,
  submittedAt: nullableDate,
  verifiedAt: nullableDate,
  paidAt: nullableDate,
  settlementRef: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const dashboardSptpdSchema = sptpdBase.extend({
  workflowStage: z.string(),
  simpakduSyncStatus: z.string(),
  simpakduSyncError: z.string().optional(),
});
export type DashboardSPTPD = z.infer<typeof dashboardSptpdSchema>;

export const dashboardSptpdDetailSchema = dashboardSptpdSchema.extend({
  omzetHarian: z.array(omzetSchema),
  omzetBulanan: z.array(omzetBulananSchema).default([]),
});
export type DashboardSPTPDDetail = z.infer<typeof dashboardSptpdDetailSchema>;

export const historySchema = z.object({
  id: z.string(),
  sptpdId: z.string(),
  action: z.string(),
  fromStatus: z.string().optional(),
  toStatus: z.string().optional(),
  fromStage: z.string().optional(),
  toStage: z.string().optional(),
  actorType: z.string(),
  actorId: z.string().nullable().optional(),
  actorRole: z.string().optional(),
  note: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
});
export type SPTPDHistory = z.infer<typeof historySchema>;

export const simpakduHistorySchema = z.object({
  kdNilaiPajak: z.string(),
  noSptpd: z.string(),
  kdOp: z.string(),
  npwpd: z.string(),
  kdPajak: z.string(),
  jenisOp: z.string(),
  namaOp: z.string(),
  masaPajak: z.string(),
  dasarPengenaan: z.number(),
  pajakTerutang: z.number(),
  paymentId: z.string().optional(),
  paymentStatus: z.enum(["PAID", "UNPAID"]),
  paymentMethod: z.string(),
  amountPaid: z.number(),
  paidAt: z.string().optional(),
  paymentReference: z.string().optional(),
  submissionSource: z.enum(["LONTARA", "PAKINTA", "LEGACY_UNKNOWN"]),
  sourceEvidence: z.string(),
  updatedAt: z.string(),
});
export type SimpakduHistory = z.infer<typeof simpakduHistorySchema>;

export const simpakduHistoryDetailSchema = simpakduHistorySchema.extend({
  alamatOp: z.string(), tarifPersen: z.number(), denda: z.number(), keterangan: z.string().optional(),
  dailyRevenue: z.array(z.object({ tanggal: z.string(), omzet: z.number(), catatan: z.string() })),
  monthlyTrend: z.array(z.object({ masaPajak: z.string(), omzet: z.number(), pajakTerutang: z.number(), jumlahBayar: z.number(), paymentStatus: z.string() })),
});
export type SimpakduHistoryDetail = z.infer<typeof simpakduHistoryDetailSchema>;

export const summarySchema = z.object({
  waitingAdmin: z.number(),
  waitingKabid: z.number(),
  processingSimpakdu: z.number(),
  syncFailed: z.number(),
  waitingPayment: z.number(),
  paid: z.number(),
});
export type DashboardSummary = z.infer<typeof summarySchema>;

export const paginationSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});
export type PaginationMeta = z.infer<typeof paginationSchema>;

export const apiEnvelopeSchema = <T extends z.ZodType>(data: T) =>
  z.object({
    status: z.boolean(),
    code: z.string().optional(),
    message: z.string().optional(),
    data: data.optional(),
    meta: z.unknown().optional(),
    errors: z.unknown().optional(),
  });

export type ApiEnvelope<T> = {
  status: boolean;
  code?: string;
  message?: string;
  data?: T;
  meta?: unknown;
  errors?: unknown;
};

export const signInSchema = z.object({
  email: z.string().email("Email tidak valid").trim(),
  password: z.string().min(1, "Password wajib diisi"),
});
export const workflowCommandSchema = z.object({ note: z.string().max(2000).default("") });
export const createStaffSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email().trim(),
  password: z.string().min(8),
  role: staffRoleSchema,
});
export const updateStaffSchema = z.object({
  name: z.string().trim().min(1),
  role: staffRoleSchema,
  isActive: z.boolean(),
});
export const resetPasswordSchema = z.object({ password: z.string().min(8) });
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

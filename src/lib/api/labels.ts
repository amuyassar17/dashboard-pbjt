import type { PublicStatus, StaffRole, WorkflowStage } from "./contracts";

export const roleLabels: Record<StaffRole, string> = {
  PBJT_VERIFIER: "Verifier",
  PBJT_KABID: "Kepala Bidang",
  PBJT_SUPER_ADMIN: "Super Admin",
  PBJT_AUDITOR: "Auditor",
};

export const statusLabels: Record<PublicStatus, string> = {
  DRAFT: "Draft",
  REVISI: "Perlu revisi",
  MENUNGGU_VERIFIKASI: "Menunggu verifikasi",
  MENUNGGU_PEMBAYARAN: "Menunggu pembayaran",
  LUNAS: "Lunas",
};

export const stageLabels: Record<WorkflowStage, string> = {
  NONE: "Belum diproses",
  WAITING_ADMIN: "Antrean Verifier",
  WAITING_KABID: "Antrean Kabid",
  PROCESSING_SIMPAKDU: "Proses SIMPAKDU",
  SYNC_FAILED: "Sinkronisasi gagal",
  COMPLETED: "Selesai",
};

export function enumLabel(value: string, labels: Record<string, string>) {
  return labels[value] ?? value.replaceAll("_", " ");
}

const actionLabels: Record<string, string> = {
  USER_SUBMITTED: "Laporan dikirim wajib pajak",
  VERIFIER_APPROVED: "Disetujui Verifier",
  VERIFIER_REVISION_REQUESTED: "Revisi diminta Verifier",
  KABID_APPROVED: "Disetujui Kepala Bidang",
  KABID_REVISION_REQUESTED: "Revisi diminta Kepala Bidang",
  SIMPAKDU_HEADER_CREATED: "SPTPD resmi dibuat",
  SIMPAKDU_DETAIL_SYNCED: "Detail omzet tersinkron",
  SIMPAKDU_DETAIL_FAILED: "Sinkronisasi omzet gagal",
  SIMPAKDU_VA_FAILED: "Pembuatan VA gagal",
  SIMPAKDU_READY_TO_PAY: "VA siap dibayar",
  SIMPAKDU_SYNC_FAILED: "Sinkronisasi SIMPAKDU gagal",
  SIMPAKDU_RETRY_STARTED: "Sinkronisasi SIMPAKDU diulang",
  PAYMENT_CONFIRMED: "Pembayaran dikonfirmasi",
};

export function actionLabel(action: string) {
  return actionLabels[action] ?? action.replaceAll("_", " ");
}

import type { StaffRole } from "@/lib/api/contracts";

export type WorkflowAction =
  | "verifier-approve"
  | "verifier-revision"
  | "kabid-approve"
  | "kabid-revision"
  | "simpakdu-retry";

export function getAllowedActions(role: StaffRole, status: string, stage: string): WorkflowAction[] {
  if (role === "PBJT_AUDITOR") return [];
  const actions: WorkflowAction[] = [];
  const verifier = role === "PBJT_VERIFIER" || role === "PBJT_SUPER_ADMIN";
  const kabid = role === "PBJT_KABID" || role === "PBJT_SUPER_ADMIN";

  if (verifier && status === "MENUNGGU_VERIFIKASI" && stage === "WAITING_ADMIN") {
    actions.push("verifier-approve", "verifier-revision");
  }
  if (kabid && status === "MENUNGGU_VERIFIKASI" && stage === "WAITING_KABID") {
    actions.push("kabid-approve", "kabid-revision");
  }
  if (kabid && stage === "SYNC_FAILED") actions.push("simpakdu-retry");
  return actions;
}

export function canManageStaff(role: StaffRole) {
  return role === "PBJT_SUPER_ADMIN";
}

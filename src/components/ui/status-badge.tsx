import { enumLabel, stageLabels, statusLabels } from "@/lib/api/labels";

export function StatusBadge({ value, kind = "status" }: { value: string; kind?: "status" | "stage" }) {
  const labels = kind === "status" ? statusLabels : stageLabels;
  return <span className={`status-badge status-${value.toLowerCase()}`}><span className="status-dot" aria-hidden />{enumLabel(value, labels)}</span>;
}

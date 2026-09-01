"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, RotateCw, X } from "lucide-react";
import { useState } from "react";
import type { WorkflowAction } from "@/lib/auth/permissions";
import { ApiError, apiFetch } from "@/lib/api/browser";
import { queryKeys } from "@/lib/api/query-keys";
import { Button } from "@/components/ui/button";

const config: Record<WorkflowAction, { label: string; title: string; description: string; path: string; revision?: boolean; icon: typeof CheckCircle2 }> = {
  "verifier-approve": { label: "Setujui sebagai Verifier", title: "Setujui laporan", description: "Laporan akan diteruskan ke antrean Kepala Bidang.", path: "verifier/approve", icon: CheckCircle2 },
  "verifier-revision": { label: "Minta revisi", title: "Kembalikan untuk revisi", description: "Wajib pajak akan melihat catatan dan dapat memperbarui laporan.", path: "verifier/revision", revision: true, icon: AlertTriangle },
  "kabid-approve": { label: "Setujui sebagai Kabid", title: "Setujui dan proses SIMPAKDU", description: "Tindakan ini langsung memulai pembuatan SPTPD resmi, detail omzet, dan VA.", path: "kabid/approve", icon: CheckCircle2 },
  "kabid-revision": { label: "Minta revisi", title: "Kembalikan untuk revisi", description: "Wajib pajak akan melihat catatan dan harus mengirim ulang laporan.", path: "kabid/revision", revision: true, icon: AlertTriangle },
  "simpakdu-retry": { label: "Ulangi sinkronisasi", title: "Ulangi proses SIMPAKDU", description: "Proses dilanjutkan dari tahap terakhir yang sudah tersimpan.", path: "simpakdu/retry", icon: RotateCw },
};

export function WorkflowDialog({ action, sptpdId, identity }: { action: WorkflowAction; sptpdId: string; identity: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();
  const item = config[action];
  const Icon = item.icon;
  const mutation = useMutation({
    mutationFn: () => apiFetch(`/api/pbjt/sptpd/${sptpdId}/${item.path}`, { method: "POST", body: JSON.stringify({ note }) }),
    onSuccess: async () => { setOpen(false); setNote(""); await invalidate(); },
    onError: async (error) => {
      setMessage(error instanceof ApiError && error.status === 409 ? "Tahapan SPTPD sudah berubah. Data telah dimuat ulang." : error instanceof ApiError && error.status === 502 ? "Proses SIMPAKDU gagal. Periksa status sinkronisasi terbaru." : error instanceof Error ? error.message : "Tindakan gagal");
      if (error instanceof ApiError && [403, 409, 502].includes(error.status)) await invalidate();
    },
  });
  async function invalidate() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.sptpdDetail(sptpdId) }),
      queryClient.invalidateQueries({ queryKey: queryKeys.sptpdHistory(sptpdId) }),
      queryClient.invalidateQueries({ queryKey: ["sptpd", "list"] }),
      queryClient.invalidateQueries({ queryKey: queryKeys.summary }),
      queryClient.invalidateQueries({ queryKey: queryKeys.session }),
    ]);
  }
  const invalid = item.revision && note.trim().length === 0;
  return <Dialog.Root open={open} onOpenChange={(value) => { setOpen(value); setMessage(""); }}><Dialog.Trigger asChild><Button variant={item.revision ? "secondary" : action === "simpakdu-retry" ? "danger" : "primary"}><Icon size={17} />{item.label}</Button></Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label="Tutup"><X /></Dialog.Close><span className={`dialog-icon ${item.revision || action === "simpakdu-retry" ? "warning" : "success"}`}><Icon /></span><Dialog.Title>{item.title}</Dialog.Title><Dialog.Description>{item.description}</Dialog.Description><div className="dialog-identity"><small>SPTPD / Usaha</small><strong>{identity}</strong></div><label className="field"><span>Catatan {item.revision ? "(wajib)" : "(opsional)"}</span><textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder={item.revision ? "Jelaskan bagian yang harus diperbaiki…" : "Tambahkan catatan bila diperlukan…"} maxLength={2000} /></label>{message && <div className="form-alert" role="alert">{message}</div>}<div className="dialog-actions"><Dialog.Close asChild><Button variant="ghost">Batal</Button></Dialog.Close><Button variant={item.revision ? "danger" : "primary"} disabled={invalid || mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Memproses…" : "Konfirmasi"}</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>;
}

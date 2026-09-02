"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ArrowUpRight, CalendarRange, X } from "lucide-react";
import type { OmzetHarian } from "@/lib/api/contracts";
import { formatDate, rupiah } from "@/lib/formatters";

export function DailyRevenueDialog({ rows }: { rows: OmzetHarian[] }) {
  const data = [...rows].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
  const total = data.reduce((sum, row) => sum + row.pendapatan, 0);
  const active = data.filter((row) => row.pendapatan > 0).length;
  const holidays = data.filter((row) => row.isLibur).length;

  return <Dialog.Root>
    <Dialog.Trigger className="daily-detail-trigger">
      Lihat pendapatan harian <ArrowUpRight aria-hidden />
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay" />
      <Dialog.Content className="dialog-content daily-revenue-dialog">
        <Dialog.Close className="dialog-close" aria-label="Tutup"><X /></Dialog.Close>
        <span className="dialog-icon daily"><CalendarRange /></span>
        <Dialog.Title>Pendapatan harian</Dialog.Title>
        <Dialog.Description>Rincian omzet yang menjadi dasar laporan periode ini.</Dialog.Description>
        <div className="daily-dialog-summary">
          <div><span>Total omzet</span><strong>{rupiah.format(total)}</strong></div>
          <div><span>Hari beromzet</span><strong>{active}</strong></div>
          <div><span>Hari libur</span><strong>{holidays}</strong></div>
        </div>
        <div className="daily-dialog-table">
          <table>
            <thead><tr><th>Tanggal</th><th>Status</th><th className="numeric-cell">Pendapatan</th></tr></thead>
            <tbody>{data.map((row) => <tr key={row.id} className={row.pendapatan === 0 ? "is-empty" : ""}><td>{formatDate(row.tanggal)}</td><td>{row.isLibur ? <span className="day-state holiday">Libur</span> : row.pendapatan > 0 ? <span className="day-state reported">Terisi</span> : <span className="day-state empty">Nihil</span>}</td><td className="numeric-cell">{rupiah.format(row.pendapatan)}</td></tr>)}</tbody>
          </table>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}

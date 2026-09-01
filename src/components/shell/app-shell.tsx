"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart3, FileClock, FileText, LogOut, Menu, PanelLeftClose, PanelLeftOpen, UserCog, Users, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { roleLabels } from "@/lib/api/labels";
import { canManageStaff } from "@/lib/auth/permissions";
import { useStaff } from "@/providers/auth-provider";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Ringkasan", icon: BarChart3 },
  { href: "/sptpd", label: "SPTPD", icon: FileText },
  { href: "/history", label: "Riwayat", icon: FileClock },
  { href: "/profile", label: "Profil", icon: UserCog },
];

export function AppShell({ children }: { children: ReactNode }) {
  const staff = useStaff();
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const nav = canManageStaff(staff.role) ? [...links.slice(0, 3), { href: "/staff", label: "Petugas", icon: Users }, links[3]] : links;

  async function logout() {
    try {
      await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
    } finally {
      queryClient.clear();
      router.replace("/login");
      router.refresh();
    }
  }

  const navigation = (onNavigate?: () => void) => (
    <>
      <BrandMark />
      <nav aria-label="Navigasi utama">
        <p className="nav-section-label">Ruang kerja</p>
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return <Link key={href} href={href} onClick={onNavigate} className={active ? "nav-link active" : "nav-link"} aria-current={active ? "page" : undefined}><Icon aria-hidden /><span>{label}</span></Link>;
        })}
      </nav>
      <div className="sidebar-account"><span className="avatar" aria-hidden>{staff.name.slice(0, 2).toUpperCase()}</span><div><strong>{staff.name}</strong><small>{roleLabels[staff.role]}</small></div></div>
    </>
  );

  return <div className={sidebarHidden ? "app-shell sidebar-collapsed" : "app-shell"}>
    <a className="skip-link" href="#main-content">Lewati ke konten utama</a>
    <aside className="sidebar sidebar-desktop" id="desktop-navigation">{navigation()}</aside>
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="sidebar-backdrop" />
        <Dialog.Content className="sidebar sidebar-mobile" id="mobile-navigation" aria-describedby={undefined}>
          <Dialog.Title className="sr-only">Navigasi PBJT</Dialog.Title>
          <Dialog.Close className="nav-close" aria-label="Tutup navigasi"><X /></Dialog.Close>
          {navigation(() => setOpen(false))}
        </Dialog.Content>
      </Dialog.Portal>
      <div className="app-main">
        <header className="topbar">
          <div className="topbar-leading">
            <Dialog.Trigger asChild><button className="menu-button" aria-label="Buka navigasi" aria-controls="mobile-navigation"><Menu /></button></Dialog.Trigger>
            <button className="sidebar-toggle" onClick={() => setSidebarHidden((hidden) => !hidden)} aria-label={sidebarHidden ? "Tampilkan sidebar" : "Sembunyikan sidebar"} aria-controls="desktop-navigation" aria-expanded={!sidebarHidden}>{sidebarHidden ? <PanelLeftOpen /> : <PanelLeftClose />}</button>
            <div className="topbar-title"><span>Bapenda Kota Makassar</span><small>Operasional PBJT</small></div>
          </div>
          <Button variant="ghost" onClick={logout}><LogOut size={18} /> Keluar</Button>
        </header>
        <main className="content" id="main-content" tabIndex={-1}>{children}</main>
      </div>
    </Dialog.Root>
  </div>;
}

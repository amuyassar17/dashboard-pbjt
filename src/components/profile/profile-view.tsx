"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Mail, Shield, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { changePasswordSchema } from "@/lib/api/contracts";
import { roleLabels } from "@/lib/api/labels";
import { apiFetch } from "@/lib/api/browser";
import { formatDate } from "@/lib/formatters";
import { useStaff } from "@/providers/auth-provider";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";

const formSchema = changePasswordSchema.extend({ confirmation: z.string() }).refine((v) => v.newPassword === v.confirmation, { path: ["confirmation"], message: "Konfirmasi password tidak sama" });
type Values = z.infer<typeof formSchema>;

export function ProfileView() {
  const staff = useStaff();
  const router = useRouter();
  const client = useQueryClient();
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(formSchema) });
  async function submit(values: Values) {
    setServerError("");
    try {
      await apiFetch("/api/pbjt/profile/password", { method: "PUT", body: JSON.stringify({ currentPassword: values.currentPassword, newPassword: values.newPassword }) });
      client.clear(); router.replace("/login?password=changed"); router.refresh();
    } catch (error) { setServerError(error instanceof Error ? error.message : "Password gagal diperbarui"); }
  }
  return <>
    <PageHeader eyebrow="Akun petugas" title="Profil saya" description="Identitas akses dan keamanan akun operasional PBJT." />
    <div className="profile-grid">
      <section className="profile-identity" aria-labelledby="profile-name">
        <header className="profile-identity-head">
          <BrandMark standalone />
          <div><span>Identitas petugas</span><small>Bapenda Kota Makassar</small></div>
        </header>
        <div className="profile-person">
          <span className="profile-avatar" aria-hidden>{staff.name.slice(0, 2).toUpperCase()}</span>
          <div><h2 id="profile-name">{staff.name}</h2><p>{roleLabels[staff.role]}</p></div>
          <span className={`profile-status ${staff.isActive ? "active" : "inactive"}`}>{staff.isActive ? "Akun aktif" : "Akun nonaktif"}</span>
        </div>
        <dl className="profile-facts">
          <div><dt><Mail aria-hidden /> Email akun</dt><dd>{staff.email}</dd></div>
          <div><dt><Shield aria-hidden /> Hak akses</dt><dd>{roleLabels[staff.role]}</dd></div>
          <div><dt><UserRound aria-hidden /> Login terakhir</dt><dd>{formatDate(staff.lastLoginAt, true)}</dd></div>
        </dl>
      </section>

      <section className="profile-security" aria-labelledby="password-title">
        <header className="profile-security-head">
          <span className="profile-security-icon"><KeyRound aria-hidden /></span>
          <div><p>Keamanan akun</p><h2 id="password-title">Ubah password</h2><span>Gunakan password yang tidak dipakai pada layanan lain.</span></div>
        </header>
        <div className="profile-security-note"><Shield aria-hidden /><p>Setelah password diperbarui, seluruh sesi aktif akan diakhiri dan Anda perlu masuk kembali.</p></div>
        <form className="profile-form" onSubmit={handleSubmit(submit)}>
          <label className="field profile-current-password"><span>Password saat ini</span><input type="password" autoComplete="current-password" {...register("currentPassword")} />{errors.currentPassword && <small className="field-error" role="alert">{errors.currentPassword.message}</small>}</label>
          <label className="field"><span>Password baru</span><input type="password" autoComplete="new-password" {...register("newPassword")} />{errors.newPassword && <small className="field-error" role="alert">Minimal 8 karakter</small>}</label>
          <label className="field"><span>Konfirmasi password baru</span><input type="password" autoComplete="new-password" {...register("confirmation")} />{errors.confirmation && <small className="field-error" role="alert">{errors.confirmation.message}</small>}</label>
          {serverError && <div className="form-alert profile-form-wide" role="alert">{serverError}</div>}
          <div className="profile-form-actions"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Menyimpan…" : "Perbarui password"}</Button></div>
        </form>
      </section>
    </div>
  </>;
}

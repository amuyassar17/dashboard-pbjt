"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { signInSchema } from "@/lib/api/contracts";
import { BrandMark } from "@/components/ui/brand-mark";
import { Button } from "@/components/ui/button";

type FormValues = z.infer<typeof signInSchema>;

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(signInSchema) });

  async function submit(values: FormValues) {
    setServerError("");
    const response = await fetch("/api/auth/sign-in", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) { setServerError(result.message ?? "Login gagal. Periksa email dan password."); return; }
    const next = search.get("next");
    const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
    router.replace(safeNext);
    router.refresh();
  }

  return <div className="login-form-wrap">
    <div className="mobile-login-brand"><BrandMark variant="institutional" /></div>
    <div className="login-form-heading"><p className="eyebrow">Akses petugas</p><h2>Masuk ke PBJT</h2><p className="form-intro">Gunakan akun yang dikelola Super Admin Bapenda.</p></div>
    <form onSubmit={handleSubmit(submit)} className="form-stack" noValidate>
      <label className="field"><span>Email petugas</span><div className="input-wrap"><Mail aria-hidden /><input type="email" autoComplete="username" placeholder="nama@makassarkota.go.id" aria-invalid={Boolean(errors.email)} {...register("email")} /></div>{errors.email && <small className="field-error" role="alert">{errors.email.message}</small>}</label>
      <label className="field"><span>Password</span><div className="input-wrap"><LockKeyhole aria-hidden /><input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan password" aria-invalid={Boolean(errors.password)} {...register("password")} /><button type="button" className="input-action" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}>{showPassword ? <EyeOff /> : <Eye />}</button></div>{errors.password && <small className="field-error" role="alert">{errors.password.message}</small>}</label>
      {serverError && <div className="form-alert" role="alert">{serverError}</div>}
      <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Memverifikasi…" : "Masuk ke dashboard"}</Button>
    </form>
    <p className="login-help">Akun bermasalah? Hubungi Super Admin PBJT Bapenda.</p>
  </div>;
}

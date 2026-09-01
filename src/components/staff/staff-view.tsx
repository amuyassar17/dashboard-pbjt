"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, Plus, ShieldCheck, UserCheck, UserX, X } from "lucide-react";
import { useState } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { ApiError, apiFetch } from "@/lib/api/browser";
import { createStaffSchema, resetPasswordSchema, staffRoles, staffSchema, type Staff, type StaffRole, updateStaffSchema } from "@/lib/api/contracts";
import { roleLabels } from "@/lib/api/labels";
import { queryKeys } from "@/lib/api/query-keys";
import { formatDate } from "@/lib/formatters";
import { useStaff } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/states";
import { PageHeader } from "@/components/ui/page-header";

export function StaffView() {
  const current = useStaff();
  const staff = useQuery({ queryKey: queryKeys.staff, queryFn: async () => z.array(staffSchema).parse((await apiFetch<unknown>("/api/pbjt/staff")).data), enabled: current.role === "PBJT_SUPER_ADMIN" });
  if (current.role !== "PBJT_SUPER_ADMIN") return <ErrorState message="Halaman ini hanya dapat diakses Super Admin." />;
  return <><PageHeader eyebrow="Administrasi PBJT" title="Petugas" description="Kelola akses Verifier, Kepala Bidang, Auditor, dan Super Admin." actions={<CreateStaffDialog />} />{staff.isPending ? <LoadingState label="Memuat daftar petugas…" /> : staff.isError ? <ErrorState retry={() => staff.refetch()} /> : !staff.data?.length ? <EmptyState title="Belum ada petugas" /> : <section className="data-panel"><div className="table-wrap"><table><thead><tr><th>Petugas</th><th>Peran</th><th>Status</th><th>Login terakhir</th><th>Dibuat</th><th><span className="sr-only">Aksi</span></th></tr></thead><tbody>{staff.data.map((item) => <tr key={item.id}><td><strong>{item.name}</strong><small>{item.email}</small></td><td>{roleLabels[item.role]}</td><td><span className={`staff-status ${item.isActive ? "active" : "inactive"}`}>{item.isActive ? <UserCheck /> : <UserX />}{item.isActive ? "Aktif" : "Nonaktif"}</span></td><td>{formatDate(item.lastLoginAt, true)}</td><td>{formatDate(item.createdAt)}</td><td><div className="table-actions"><EditStaffDialog item={item} self={item.id === current.id} /><ResetPasswordDialog item={item} /></div></td></tr>)}</tbody></table></div><div className="mobile-list">{staff.data.map((item) => <article className="mobile-card" key={item.id}><div className="mobile-card-head"><div><strong>{item.name}</strong><small>{item.email}</small></div><span className={`staff-status ${item.isActive ? "active" : "inactive"}`}>{item.isActive ? "Aktif" : "Nonaktif"}</span></div><dl><div><dt>Peran</dt><dd>{roleLabels[item.role]}</dd></div><div><dt>Login terakhir</dt><dd>{formatDate(item.lastLoginAt, true)}</dd></div></dl><div className="table-actions"><EditStaffDialog item={item} self={item.id === current.id} /><ResetPasswordDialog item={item} /></div></article>)}</div></section>}</>;
}

function CreateStaffDialog() {
  type Values = z.infer<typeof createStaffSchema>;
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<Values>({ resolver: zodResolver(createStaffSchema), defaultValues: { role: "PBJT_VERIFIER" } });
  const mutation = useMutation({ mutationFn: (values: Values) => apiFetch("/api/pbjt/staff", { method: "POST", body: JSON.stringify(values) }), onSuccess: async () => { reset(); setOpen(false); await client.invalidateQueries({ queryKey: queryKeys.staff }); }, onError: (error) => setError("root", { message: errorMessage(error) }) });
  return <StaffDialog open={open} onOpenChange={setOpen} trigger={<Button><Plus /> Tambah petugas</Button>} title="Tambah petugas" description="Akun langsung aktif setelah dibuat."><form className="form-stack" onSubmit={handleSubmit((v) => mutation.mutate(v))}><label className="field"><span>Nama</span><input {...register("name")} />{errors.name && <small className="field-error">Nama wajib diisi</small>}</label><label className="field"><span>Email</span><input type="email" autoComplete="off" {...register("email")} />{errors.email && <small className="field-error">Email tidak valid</small>}</label><RoleField register={register("role")} error={Boolean(errors.role)} /><label className="field"><span>Password awal</span><input type="password" autoComplete="new-password" {...register("password")} />{errors.password && <small className="field-error">Minimal 8 karakter</small>}</label>{errors.root && <div className="form-alert">{errors.root.message}</div>}<DialogActions pending={mutation.isPending} /></form></StaffDialog>;
}

function EditStaffDialog({ item, self }: { item: Staff; self: boolean }) {
  type Values = z.infer<typeof updateStaffSchema>;
  const [open, setOpen] = useState(false);
  const client = useQueryClient();
  const { register, handleSubmit, setError, formState: { errors } } = useForm<Values>({ resolver: zodResolver(updateStaffSchema), values: { name: item.name, role: item.role, isActive: item.isActive } });
  const mutation = useMutation({ mutationFn: (values: Values) => apiFetch(`/api/pbjt/staff/${item.id}`, { method: "PATCH", body: JSON.stringify(values) }), onSuccess: async () => { setOpen(false); await Promise.all([client.invalidateQueries({ queryKey: queryKeys.staff }), client.invalidateQueries({ queryKey: queryKeys.session })]); }, onError: (error) => setError("root", { message: errorMessage(error) }) });
  return <StaffDialog open={open} onOpenChange={setOpen} trigger={<Button variant="secondary"><Pencil /> Edit</Button>} title="Edit petugas" description="Perubahan peran atau penonaktifan mencabut sesi petugas."><form className="form-stack" onSubmit={handleSubmit((v) => mutation.mutate(v))}><label className="field"><span>Nama</span><input {...register("name")} />{errors.name && <small className="field-error">Nama wajib diisi</small>}</label><RoleField register={register("role")} error={Boolean(errors.role)} /><label className="toggle-field"><input type="checkbox" {...register("isActive")} disabled={self} /><span><strong>Akun aktif</strong><small>{self ? "Akun sendiri tidak dapat dinonaktifkan." : "Petugas dapat masuk dan menggunakan dashboard."}</small></span></label>{errors.root && <div className="form-alert">{errors.root.message}</div>}<DialogActions pending={mutation.isPending} /></form></StaffDialog>;
}

function ResetPasswordDialog({ item }: { item: Staff }) {
  type Values = z.infer<typeof resetPasswordSchema>;
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<Values>({ resolver: zodResolver(resetPasswordSchema) });
  const mutation = useMutation({ mutationFn: (values: Values) => apiFetch(`/api/pbjt/staff/${item.id}/reset-password`, { method: "POST", body: JSON.stringify(values) }), onSuccess: () => { reset(); setOpen(false); }, onError: (error) => setError("root", { message: errorMessage(error) }) });
  return <StaffDialog open={open} onOpenChange={setOpen} trigger={<Button variant="ghost"><KeyRound /> Reset password</Button>} title="Reset password" description={`Seluruh sesi ${item.name} akan dicabut setelah password diubah.`}><form className="form-stack" onSubmit={handleSubmit((v) => mutation.mutate(v))}><label className="field"><span>Password baru</span><input type="password" autoComplete="new-password" {...register("password")} />{errors.password && <small className="field-error">Minimal 8 karakter</small>}</label>{errors.root && <div className="form-alert">{errors.root.message}</div>}<DialogActions pending={mutation.isPending} /></form></StaffDialog>;
}

function RoleField({ register, error }: { register: UseFormRegisterReturn<"role">; error: boolean }) {
  return <label className="field"><span>Peran</span><select {...register}>{staffRoles.map((role) => <option value={role} key={role}>{roleLabels[role as StaffRole]}</option>)}</select>{error && <small className="field-error">Peran tidak valid</small>}</label>;
}

function StaffDialog({ open, onOpenChange, trigger, title, description, children }: { open: boolean; onOpenChange: (open: boolean) => void; trigger: React.ReactNode; title: string; description: string; children: React.ReactNode }) { return <Dialog.Root open={open} onOpenChange={onOpenChange}><Dialog.Trigger asChild>{trigger}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay" /><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label="Tutup"><X /></Dialog.Close><span className="dialog-icon success"><ShieldCheck /></span><Dialog.Title>{title}</Dialog.Title><Dialog.Description>{description}</Dialog.Description>{children}</Dialog.Content></Dialog.Portal></Dialog.Root>; }
function DialogActions({ pending }: { pending: boolean }) { return <div className="dialog-actions"><Dialog.Close asChild><Button variant="ghost">Batal</Button></Dialog.Close><Button type="submit" disabled={pending}>{pending ? "Menyimpan…" : "Simpan"}</Button></div>; }
function errorMessage(error: unknown) { if (error instanceof ApiError && error.status === 409) return "Data berkonflik. Email mungkin sudah dipakai atau Super Admin terakhir tidak dapat diubah."; return error instanceof Error ? error.message : "Perubahan gagal disimpan"; }

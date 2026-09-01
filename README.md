# Dashboard PBJT Bapenda

Frontend operasional PBJT untuk Verifier, Kepala Bidang, Auditor, dan Super Admin. Dibangun dengan Next.js App Router. Browser hanya mengakses BFF same-origin `/api/*`; tidak ada akses langsung ke PostgreSQL atau SIMPAKDU.

## Kebutuhan

- Node.js 20.9+
- npm
- Backend Lontara PBJT lokal/staging dengan `PBJT_ENABLED=true`
- SIMPAKDU staging/mock untuk pengujian workflow tulis

Jangan arahkan pengujian mutasi ke SIMPAKDU production.

## Konfigurasi

```bash
cp .env.example .env.local
```

```env
PBJT_API_BASE_URL=http://localhost:8080/v1/pajak-restoran/dashboard
PBJT_API_TIMEOUT_MS=15000
```

`PBJT_API_BASE_URL` bersifat server-only. Jangan memakai prefix `NEXT_PUBLIC_` atau menyimpan kredensial/token di environment frontend.

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

## Verifikasi

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## Route aplikasi

- `/login` — autentikasi petugas PBJT
- `/dashboard` — ringkasan antrean
- `/sptpd` — filter, list, dan detail SPTPD
- `/staff` — manajemen petugas; Super Admin saja
- `/profile` — profil dan perubahan password

## Model keamanan

- Access/refresh JWT disimpan dalam cookie `HttpOnly`, `SameSite=Lax`; `Secure` pada production.
- BFF melakukan refresh satu kali setelah upstream `401`.
- Mutation BFF memakai method/path allowlist, validasi origin, JSON, ukuran body, dan schema Zod.
- Browser tidak menerima token dari response login/session.
- Backend tetap sumber otorisasi role dan workflow final.

Implementasi cookie JWT dan refresh lock process-local hanya untuk tahap lokal/single-instance. Sebelum deployment multi-replica: gunakan opaque browser session, Redis/shared token store, distributed refresh lock, dan rotasi sesi terkoordinasi.

## Workflow

- Restoran: Verifier approve/revisi, Kepala Bidang approve/revisi. Approval Kepala Bidang memulai finalisasi SIMPAKDU.
- Hotel: submit mobile berjalan langsung ke finalisasi backend; dashboard hanya memonitor tahap aktual.
- Retry tersedia untuk Kepala Bidang/Super Admin saat `SYNC_FAILED`.
- Auditor read-only.

Tidak ada optimistic stage update. UI memuat ulang detail, history, list, dan summary setelah workflow berhasil atau response `409`/`502`.

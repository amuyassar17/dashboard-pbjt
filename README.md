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
PBJT_API_BASE_URL=http://localhost:8080/v1/pbjt/dashboard
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

## Docker

Image production menggunakan output standalone Next.js dan berjalan sebagai user non-root:

```bash
docker build -t pbjt-dashboard .
docker run --rm -p 3000:3000 \
  -e PBJT_API_BASE_URL=http://host.docker.internal:8080/v1/pbjt/dashboard \
  pbjt-dashboard
```

Health check tersedia pada `GET /api/health`.

## CI/CD Haura

Push ke branch `main` menjalankan quality gate, membangun image immutable ke GHCR, lalu melakukan deployment melalui Cloudflare Access SSH. Konfigurasi Compose dan script deployment berada di `deploy/haura`.

GitHub Environment `haura` memerlukan secrets berikut:

- `HAURA_SSH_HOST` — `ssh.intellinkpy.id`
- `HAURA_SSH_USER` — user SSH server
- `HAURA_SSH_PRIVATE_KEY` — private key khusus deployment
- `HAURA_DEPLOY_DIR` — contoh `/home/haura/pbjt-dashboard`
- `HAURA_GHCR_USER` dan `HAURA_GHCR_TOKEN` — akses pull package GHCR
- `CF_ACCESS_CLIENT_ID` dan `CF_ACCESS_CLIENT_SECRET` — service token Cloudflare Access

Variables opsional: `PBJT_API_BASE_URL` (default backend Lontara saat ini), `PBJT_DASHBOARD_PORT` (default `8091`), dan `PBJT_API_TIMEOUT_MS` (default `15000`). Port hanya dibuka pada loopback server agar publikasi domain tetap melalui reverse proxy/tunnel.

# Lapak Loak — Kerangka Awal

Personal online flea market. Web app (PWA) — jalan di browser HP (Android/iOS) maupun laptop, tanpa perlu install dari App Store/Play Store.

## Stack
- **Frontend:** React + Vite
- **Database & storage:** Supabase (Postgres + file storage)
- **PWA:** manifest.json + service worker sederhana (lihat `public/`)

## Cara mulai (di VS Code / terminal)

1. Buat project baru di [supabase.com](https://supabase.com) (gratis).
2. Buka **SQL Editor** di dashboard Supabase, jalankan isi file `supabase/schema.sql`.
3. Salin `.env.example` jadi `.env`, isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` dari **Settings > API** di dashboard Supabase.
4. Install dependency:
   ```
   npm install
   ```
5. Jalankan lokal:
   ```
   npm run dev
   ```
6. Buka `http://localhost:5173` di browser.

## Deploy gratis
- Push kode ini ke GitHub.
- Hubungkan repo ke [Vercel](https://vercel.com) atau [Netlify](https://netlify.com) (gratis) — tambahkan environment variable `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di pengaturan project di sana juga.
- Setiap push ke GitHub otomatis re-deploy.

## Struktur folder
```
src/
  pages/buyer/    -> Home, ItemDetail, Negotiation, Checkout, Payment, OrderTracking
  pages/admin/    -> Login, Dashboard, Items, Negotiations, Orders, Settings
  components/     -> AdminLayout (sidebar di laptop, bottom nav di HP)
  lib/            -> koneksi Supabase
  styles/         -> global.css (semua warna & token desain di sini)
supabase/
  schema.sql      -> skema database lengkap + trigger auto-hapus media
```

## Yang masih perlu dikerjakan (ditandai `TODO` di kode)
- Upload foto/video barang ke Supabase Storage dari halaman Admin > Barang.
- Notifikasi real-time (pakai Supabase Realtime) untuk ruang tawar & dashboard admin.
- Cron job (Supabase Edge Function terjadwal) yang benar-benar menghapus file di Storage saat `media_purge_at` terlewati.
- `RequireAdmin` masih pakai penanda sederhana di localStorage — ganti ke pengecekan sesi asli lewat `supabase.auth.getSession()`.
- Halaman "Rekomendasi" publik di sisi pembeli (Cerita Pembeli sudah ada di `/pesanan/:orderCode/cerita`).
- Validasi input & pesan error yang lebih ramah.

## Kustomisasi untuk klien lain
Cukup ganti isi tabel `settings` (nama toko, tagline, warna aksen, rekening, ongkir) — tidak perlu ubah kode. Warna aksen inti ada di `src/styles/global.css` (`--terracotta`, dst) kalau mau ganti palet dasarnya juga.

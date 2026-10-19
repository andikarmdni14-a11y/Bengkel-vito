# Audit `entry-server.tsx` dan `scripts/prerender.mjs`

Konteks: prerender menjalankan **kode aplikasi + dependensinya di Node, di dalam proses build hosting** (Vercel/Netlify/CI).
Risikonya bukan di browser pengunjung, melainkan di lingkungan build.

## Sudah diperbaiki pada refactor ini

| Temuan | Perbaikan |
|---|---|
| Render dapat menggantung bila chunk halaman tak kunjung selesai (build macet sampai timeout platform) | Batas waktu 15 dtk per route di `entry-server.tsx`; abort + galat jelas |
| Galat di dalam batas Suspense bisa diam-diam menjadi "render ulang di klien" (HTML cacat lolos build) | `onError` dicatat dan **menggagalkan build** |
| Penulisan file bergantung pada string route tanpa pemeriksaan | `outFile()` menolak path yang keluar dari `dist/` |
| `renderToString` + `React.lazy` menghasilkan HTML tanpa isi halaman | Diganti `renderToPipeableStream` + `onAllReady`; cek `<h1>` di `prerender.mjs` tetap sebagai jaring pengaman |

## Rekomendasi (belum diterapkan; urut prioritas)

1. **Batasi env yang terlihat oleh kode prerender.** `import(ssrEntry)` berjalan dalam proses yang sama dengan `process.env`
   penuh: token deploy, kunci pihak ketiga, dst. dapat dibaca oleh kode aplikasi maupun paket npm mana pun. Opsi: (a) jangan
   simpan rahasia non-`VITE_*` di scope *Build* hosting (hanya scope Runtime), atau (b) jalankan `prerender.mjs` ulang sebagai
   proses anak dengan env allowlist (`PATH`, `NODE_ENV`, `VITE_*`). Jangan pernah menaruh kunci `service_role` di env build.
2. **Larang jaringan saat render.** Render tidak seharusnya memanggil apa pun. Pertahanan murah: di awal `prerender.mjs`,
   `globalThis.fetch = () => { throw new Error("fetch dilarang saat prerender"); }` sebelum `import()` entry-server. Ini mencegah
   build yang tidak deterministik dan kebocoran data lewat permintaan keluar. (Saat ini aman: query berstatus *pending* di server.)
3. **Rantai pasok.** Kode paket npm dieksekusi saat build. Pakai `npm ci` (bukan `npm install`) di hosting, commit
   `package-lock.json`, pertimbangkan `--ignore-scripts`, dan aktifkan Dependabot/`npm audit` di CI. `react-helmet-async` di-bundel
   (`ssr.noExternal`), jadi perbarui secara berkala.
4. **Header keamanan di `vercel.json`.** Saat ini hanya ada header cache. Tambahkan `Content-Security-Policy`
   (`connect-src` ke URL Supabase, `font-src`/`style-src` Google Fonts, `frame-src` Google Maps, `img-src` host gambar produk),
   `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, dan
   `frame-ancestors 'none'`. Karena memakai `onAllReady`, HTML prerender tidak memuat skrip inline React, jadi CSP tanpa
   `'unsafe-inline'` untuk skrip dimungkinkan (uji dulu).
5. **Jangan menyajikan artefak build.** `dist-ssr/` tidak boleh ikut ter-deploy (sudah di `.gitignore`; pastikan output
   directory hosting = `dist`). Biarkan `build.sourcemap` mati (bawaan) agar kode sumber tidak terbuka.
6. **Sisipan HTML.** Saat ini aman: `ROUTES` konstan, `head` dari Helmet sudah ter-escape, dan penyisipan memakai fungsi
   pengganti (bukan string) sehingga `$` tidak ditafsirkan. Syarat menjaganya: jangan pernah memasukkan konten dari DB/pengguna ke
   `buildPage()` atau ke `ROUTES` tanpa escaping.
7. **Store keranjang adalah singleton modul.** Aman untuk prerender saat build (tidak pernah diubah di server). Bila suatu hari
   SSR berjalan per-request, buat store per request agar keranjang satu pengunjung tidak bocor ke yang lain.
8. **Gagal keras di CI.** `fail()` sudah `process.exit(1)`; pastikan perintah build hosting tidak ditelan oleh `|| true`, dan
   jalankan `npm run typecheck && npm test` sebelum `npm run build`.

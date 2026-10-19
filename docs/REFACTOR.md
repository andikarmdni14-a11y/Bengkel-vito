# Panduan Refactor FitoMotor

Refactor dikerjakan dalam **7 fase = 7 commit git** (`git log --oneline`). Tiap fase berdiri sendiri dan bisa
di-review, diuji, atau di-revert tanpa fase lain. Urutannya sengaja dari yang paling aman ke yang paling banyak menyentuh file.

## Mulai dari sini (wajib, sekali)

```bash
npm install                      # memasang dependensi baru dan memperbarui package-lock.json (commit file ini)
npm run typecheck && npm test    # kompilasi TypeScript + semua tes
npm run build                    # tsc + build klien + build SSR + prerender (cek ia berakhir tanpa galat)
npx playwright install chromium  # sekali, untuk npm run test:e2e
```

> Refactor ini ditulis tanpa akses `npm install` (jaringan dimatikan), jadi `tsc`, Vitest, Playwright, build Vite, dan SQL
> **belum pernah dijalankan utuh**. Yang sudah diperiksa mesin: sintaks + resolusi semua impor di 77 file `src`, dan logika
> murni (reducer, storage, store, utilitas, validasi env, state query) lewat harness terpisah. Jalankan perintah di atas
> sebelum merge, dan kirim galatnya bila ada.

## Build produksi vs tes

`npm run build` memakai `tsconfig.build.json` yang mengecualikan `*.test.ts(x)`, `src/test`, `e2e`, `docs`, dan
`playwright.config.ts` (59 file dikompilasi, vs 76 di `tsconfig.json`). `npm run typecheck` tetap memeriksa tes: jalankan
keduanya di CI. Bundel Vite memang tidak pernah memuat tes/docs (tidak diimpor dan di luar `public/`); Tailwind juga tidak
memindai berkas tes. Audit prerender: lihat `docs/PRERENDER_AUDIT.md`.

## Temuan penting sebelum mengubah apa pun

| Asumsi di brief | Kenyataan di kode | Konsekuensi |
|---|---|---|
| "RLS belum ada" | `schema.sql` sudah mengaktifkan RLS dengan aturan yang benar | Fase 6 = **penguatan**, bukan membangun dari nol |
| Photo "belum lazy" | `Photo.tsx` sudah `loading="lazy"` + `decoding="async"` | Fase 7 memperbaiki bug nyata + menambah `srcSet`/`<picture>` |
| Pakai `React.lazy` di `App.tsx` | Proyek punya prerender SSR (`renderToString`), yang **tidak menunggu** komponen lazy | `lazy()` langsung merusak SEO dan menggagalkan `prerender.mjs`; dipakai pola injeksi (Fase 4) |

## Fase

| # | Commit | Isi | Verifikasi |
|---|---|---|---|
| 1 | testing | Vitest + RTL + jsdom, Playwright, alias `@/`, tes `src/utils/*` | `npm test` |
| 2 | TanStack Query | `lib/queryClient.ts`, `queries/*`, hapus `useAsyncResource` | halaman Beranda/Katalog/Layanan memuat data; matikan jaringan -> pesan galat + "Coba lagi" |
| 3 | Zustand | `features/cart/*`, hapus `CartContext` | tambah ke keranjang, refresh halaman (keranjang tetap), buka keranjang (harga/stok sinkron) |
| 4 | Code splitting | `React.lazy` langsung di `App.tsx`; prerender via `renderToPipeableStream`; Suspense di layout | `npm run build` lalu `npm run preview`: tab Network menampilkan satu chunk per halaman; "Lihat sumber" `/katalog` berisi `<h1>` |
| 5 | Struktur folder | `components/ui`, `components/layout`, `features/*` (dipindah otomatis, impor ditulis ulang) | `npm run typecheck` |
| 6 | Supabase | `supabaseConfig.ts`, SQL `rls_hardening`/`verify_rls`/`optional_rate_limit` | jalankan `verify_rls.sql` (lihat bawah) |
| 7 | Photo | `failedSrc`, `srcSet`/`sizes`/`sources`, `width`/`height` | `npm test` |

Revert satu fase: `git revert <hash>`. Fase 5 hanya memindahkan file, jadi aman di-revert paling akhir.

## Fase 1-2: data fetching

- **Cache**: produk `staleTime` 60 dtk (setara TTL lama), layanan 10 mnt, `gcTime` 5 mnt. Atur di `queries/*.ts`.
- **Retry**: 2x dengan backoff 1-2-4 dtk (maks 8 dtk); tidak diulang untuk `SupabaseConfigError`. Mutation **tidak** di-retry
  (insert booking bukan idempotent).
- **Toast galat**: hanya bila ada komponen yang menunggu data itu dan belum ada data lama. Sinkronisasi latar tetap senyap.
- API halaman tidak berubah: `useProducts()` / `useServices()` masih mengembalikan `{ products|services, loading, error, refetch }`,
  jadi `Katalog`, `Layanan`, `Beranda` hanya berganti path impor.
- Prefetch bila perlu: `queryClient.prefetchQuery(productsQueryOptions)` (mis. saat hover tautan Katalog).

## Fase 3: keranjang (kenapa Zustand, bukan Redux Toolkit)

Keranjang = satu slice kecil, dua pemakai lintas-halaman (Navbar, drawer), tanpa middleware kompleks. RTK menambah boilerplate
tanpa manfaat di skala ini. Bila nanti ada banyak slice yang saling bergantung, antarmuka selector yang sama memudahkan pindah.

- Semua logika keranjang ada di satu file, `cartStore.ts` (reducer terpisah sudah dihapus; 14 kasus ujinya dipindah ke
  `cartStore.test.ts`). Perilaku tidak berubah: qty 0 tidak menghapus item, `syncProducts` mengeluarkan barang hilang dan
  mengembalikan jumlahnya, format localStorage `fitomotor:cart:v2` sama (keranjang pengunjung lama tetap terbaca).
- Re-render berkurang: `Navbar` hanya render ulang saat **jumlah** berubah; `ProductCard` hanya saat qty **produknya sendiri** berubah.
- Store selalu mulai kosong dan diisi dari localStorage setelah mount (aturan hydration prerender tetap terjaga).
- Aturan Zustand v5: selector tidak boleh mengembalikan objek/array baru tiap panggilan; pakai `useShallow` (contoh di `CartDrawer`).
- Store bersifat singleton modul. Aman untuk prerender saat build (tidak pernah diubah di server). Bila suatu hari SSR berjalan
  per-request di server, buat store per request.

## Fase 4: code splitting yang aman untuk SEO

`App.tsx` memakai `React.lazy(() => import("@/pages/..."))` langsung (satu dynamic import = satu chunk Vite; proyek tidak punya
barrel file yang bisa menghalanginya). `<Suspense fallback={<PageSkeleton />}>` ada di `PublicLayout`, sehingga Navbar/Footer
tetap tampil. `ScrollToTarget` berada di dalam Suspense agar tautan `/kontak#booking` tetap menggulir setelah halaman lazy dimuat.

**Prerender:** `renderToString` tidak menunggu komponen lazy (hanya menulis fallback), jadi `entry-server.tsx` memakai
`renderToPipeableStream` + `onAllReady`. `render(url)` kini async (`await` di `scripts/prerender.mjs`), memiliki batas waktu
15 dtk, dan galat di dalam batas Suspense menggagalkan build (tidak diam-diam menjadi render ulang di klien).
Di browser, markup prerender memuat batas Suspense yang sudah terisi; bila chunk belum terunduh saat hydration, React menahan
HTML server dan menghidupkannya setelah chunk tiba. Menambah halaman: tambahkan `lazy()` + `<Route>` di `App.tsx` dan path-nya
ke `ROUTES` di `scripts/prerender.mjs`.

## Fase 6: keamanan Supabase

Urutan di SQL Editor: `schema.sql` -> `seed.sql` -> `rls_hardening.sql` -> `verify_rls.sql`.

- `rls_hardening.sql`: fungsi `is_admin()` (membaca `app_metadata.role` JWT, **bukan** `user_metadata` yang bisa diubah pengguna),
  policy tulis admin untuk `products`/`services`/`bookings`, batas tanggal booking memakai WIB. Aplikasi belum punya login admin;
  untuk sekarang admin tetap lewat Dashboard (melewati RLS). Cara menjadikan akun admin ada di komentar akhir file.
- `verify_rls.sql`: menguji sebagai `anon` bahwa katalog bisa dibaca, booking valid bisa dibuat, dan booking non-pending / lampau /
  baca / ubah / hapus / tulis katalog **ditolak**. Melempar galat bila ada yang bocor; berakhir dengan baris "LULUS".
- `optional_rate_limit.sql`: trigger maks 5 booking per nomor per 24 jam. Hanya lapisan dasar (nomor bisa diganti-ganti);
  untuk spam sungguhan tambahkan CAPTCHA + Edge Function.
- `src/lib/supabase.ts`: kunci hanya dari env, menolak `service_role` / `sb_secret_`, URL wajib https (kecuali localhost),
  `vite build` dibatalkan bila kunci rahasia ada di env. Anon key memang publik; yang melindungi data adalah RLS.
- Bila kunci `service_role` pernah ter-deploy: **rotasi** di Dashboard.

## Fase 7: gambar

`Photo` menyimpan URL yang gagal (bukan boolean), sehingga data produk yang diperbarui dicoba lagi. Props baru: `width`, `height`,
`srcSet`, `sizes`, `sources` (render `<picture>` AVIF/WebP + fallback). Gambar produk dari Supabase Storage dapat diubah ukurannya
lewat image transformation, tetapi itu fitur berbayar (Pro): **jangan** aktifkan otomatis tanpa memastikan paketnya.

## Belum dikerjakan (di luar permintaan, disarankan berikutnya)

ESLint (kriteria sukses PRD menyebut peringatan ESLint, tetapi proyek belum punya konfigurasi), sinkronisasi keranjang antar-tab
(event `storage`), tipe `Database` dari `supabase gen types`, CAPTCHA pada booking, Lighthouse CI, prefetch chunk saat hover tautan.

# FitoMotor

Website bengkel motor + toko suku cadang ringan.
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + React Router, dengan **Supabase** (PostgreSQL) sebagai sumber data,
`react-hook-form` + `zod` untuk form, `react-hot-toast` untuk notifikasi, `react-helmet-async` untuk SEO per halaman,
**TanStack Query** untuk data fetching, **Zustand** untuk keranjang, dan **Vitest** + Playwright untuk pengujian.

Pelanggan melihat katalog (harga & stok dari database), mengisi keranjang lalu checkout lewat WhatsApp, atau booking servis
(tersimpan di tabel `bookings`, lalu dilanjutkan ke WhatsApp). Dibuat mobile-first.

## Cara menjalankan

Pastikan Node.js 18 atau lebih baru sudah terpasang.

### 1. Siapkan Supabase

1. Buat project di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, jalankan isi `supabase/schema.sql`, lalu `supabase/seed.sql` (data dummy; ganti dengan data asli).
   Seed aman dijalankan berulang. Jika sebelumnya sudah terlanjur menjalankan versi lama dan data tampil dobel,
   jalankan `supabase/fix_duplicates.sql` sekali untuk membersihkannya.
3. Buka **Project Settings -> API**, salin **Project URL** dan **anon public key**.

### 2. Jalankan aplikasi

```bash
npm install
cp .env.example .env     # isi VITE_WA_NUMBER, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm run dev
```

Setelah mengubah `.env`, hentikan dan jalankan ulang `npm run dev`.
Jangan pernah memakai `service_role` key di `.env` frontend, hanya `anon` key.

## Skrip

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run typecheck` | Cek tipe TypeScript (`tsc --noEmit`) |
| `npm run build` | Cek tipe, build klien, build server (SSR), lalu prerender ke `dist/` |
| `npm run build:client` · `build:server` · `prerender` | Tahap-tahap build di atas, bisa dijalankan satu per satu |
| `npm run preview` | Mencoba hasil build secara lokal |
| `npm test` · `npm run test:watch` · `npm run test:coverage` | Unit & komponen test (Vitest + React Testing Library) |
| `npm run test:e2e` | E2E alur booking (Playwright; jalankan `npx playwright install chromium` sekali) |

Saat deploy, isi ketiga variabel `VITE_*` di pengaturan environment hosting **sebelum build**: nilainya
ditanam saat build, termasuk pada HTML hasil prerender.

## Prerender (SEO)

`npm run build` menghasilkan HTML statis untuk route publik (`/`, `/layanan`, `/katalog`, `/kontak`) lengkap dengan
`<title>` dan meta dari `<Seo />`, sehingga perayap tidak perlu menjalankan JavaScript. Prosesnya:

1. `vite build` membuat bundel klien + template `dist/index.html`.
2. `vite build --ssr src/entry-server.tsx` membuat bundel server di `dist-ssr/` (tidak dipublikasikan).
3. `scripts/prerender.mjs` merender tiap route dengan `StaticRouter` + `HelmetProvider`, lalu menulis
   `dist/<route>/index.html` dan `dist/404.html` (halaman NotFound, `noindex`).

Di browser, `src/main.tsx` melakukan hydrate bila markup di `#root` memang untuk URL yang dibuka
(atribut `data-prerender-path`); jika tidak (mis. alamat tak dikenal), aplikasi dirender dari nol.

- **Menambah route prerender:** tambahkan path-nya ke `ROUTES` di `scripts/prerender.mjs`.
- **Aturan hydration:** render pertama di klien harus sama dengan HTML server. Jangan membaca `localStorage`,
  `window`, atau tanggal/waktu langsung saat render; baca di `useEffect` (contoh: `useCartPersistence`, `BookingForm`).
- **Halaman lazy vs prerender:** `App.tsx` memuat halaman lewat `React.lazy`, dan `entry-server.tsx` memakai
  `renderToPipeableStream` + `onAllReady` supaya prerender menunggu chunk halaman. Jangan kembali ke `renderToString`:
  ia hanya menulis fallback Suspense, sehingga HTML prerender kehilangan isi halaman.
- **Data Supabase** (layanan/produk) tetap dimuat di klien, jadi HTML prerender berisi kerangka (skeleton)
  untuk bagian itu; judul, meta, `<h1>`, dan teks statis sudah ada di HTML.
- **Hosting:** tidak perlu lagi rewrite `/* -> /index.html` untuk keempat route. Hosting yang mendukung `404.html`
  (Netlify, Cloudflare Pages, GitHub Pages) akan menyajikannya dengan status 404 untuk alamat tak dikenal.
  Bila hosting Anda sudah memakai rewrite SPA, tetap aman: klien akan merender ulang bila markup tidak cocok.

## Halaman

| Alamat | Isi |
|---|---|
| `/` | Hero, pengantar layanan, ajakan booking/belanja |
| `/layanan` | Detail jasa bengkel (dari tabel `services`) |
| `/katalog` | Daftar produk (dari tabel `products`): cari, filter kategori, tombol "Tambah" |
| `/kontak` | Info bengkel, peta, dan form booking servis (`/kontak#booking`) |

Setiap halaman mengatur `<title>` dan meta description sendiri lewat komponen `Seo` (`react-helmet-async`).

## Struktur folder

```
src/
├── main.tsx · App.tsx           # main.tsx: providers (Helmet, QueryClient, Router) + hydrate/render; App.tsx: route + React.lazy
├── entry-server.tsx             # render(url) untuk prerender (dipakai scripts/prerender.mjs)
├── types/index.ts               # Product, Service, Booking, CartItem, ...
├── lib/
│   ├── supabase.ts · supabaseConfig.ts   # klien Supabase + validasi env (menolak kunci rahasia)
│   ├── api.ts · dbErrors.ts              # semua query/insert Supabase (try/catch + pesan galat ramah)
│   └── queryClient.ts                    # pabrik QueryClient: staleTime, retry+backoff, toast galat
├── queries/                     # TanStack Query terpusat: keys.ts, products.ts, services.ts, bookings.ts, useQueryStatus.ts
├── pages/                       # Beranda, Layanan, Katalog, Kontak, NotFound (masing-masing satu chunk)
├── components/
│   ├── ui/                      # komponen presentasi reusable tanpa logika bisnis: Photo, Skeletons, Seo, CustomSelect, ...
│   └── layout/                  # PublicLayout, Navbar, MobileMenu, Footer, WhatsAppFloat
├── features/                    # komponen + logika per fitur
│   ├── cart/                    # cartStore (Zustand, satu-satunya logika keranjang), cartStorage, useCartEffects, CartDrawer
│   ├── catalog/                 # ProductCard
│   ├── services/                # ServiceCard, serviceIcons
│   ├── booking/                 # BookingForm, BookingServis, KalkulatorBiaya, schema (zod)
│   └── contact/                 # ContactInfo
├── hooks/useInView.ts
├── data/                        # site.ts, navLinks.ts (konfigurasi statis saja)
├── utils/                       # format, whatsapp (URL wa.me), date, errors, motion, path
└── test/setup.ts                # setup Vitest (jest-dom, stub jsdom)
e2e/                             # Playwright (Supabase di-mock di level jaringan)
supabase/
├── schema.sql                   # tabel + RLS dasar
├── seed.sql                     # data awal (dummy), aman dijalankan ulang
├── rls_hardening.sql            # role admin + perbaikan batas tanggal WIB
├── verify_rls.sql               # uji otomatis aturan RLS sebagai anon
├── optional_rate_limit.sql      # (opsional) batas booking per nomor telepon
└── fix_duplicates.sql           # pembersih data dobel (sekali jalan)
```

Aturan sederhana: komponen di `components/ui` **tidak** boleh mengimpor dari `features/` maupun `queries/`;
`features/*` boleh memakai `components/ui`, `queries/`, `utils/`. Impor lintas folder memakai alias `@/` (= `src/`).

## Yang perlu Anda ganti

- `.env` -> `VITE_WA_NUMBER`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `public/logo-mark.png`, `favicon-32.png`, `icon-192.png`, `apple-touch-icon.png` : ikon logo (hexagon "FM"). Ganti file-nya bila logo berubah.
- `src/data/site.ts` : alamat, jam buka, tautan Google Maps, `mapEmbedUrl`, dan `heroImage`
- `src/features/booking/KalkulatorBiaya.tsx` : konstanta `TARIF` berisi rentang harga CONTOH; ganti dengan tarif asli bengkel
- Foto produk (`products.image_url`): kartu katalog dirancang untuk **PNG transparan** rasio sekitar 1:1 dengan produk memenuhi ~80% kanvas. Foto ber-latar putih (JPG) tetap menyatu, tetapi PNG transparan hasilnya terbaik.
- Tabel `products` & `services` di Supabase: produk, harga, **stok**, foto asli, tarif layanan (seed hanyalah data dummy)
- Mengelola data: lewat **Table Editor** Supabase. Booking masuk ke tabel `bookings` (status awal `pending`).

## Keamanan data (RLS)

- `products` & `services`: publik hanya boleh **membaca**.
- `bookings`: publik hanya boleh **menambah** (status harus `pending`, tanggal tidak boleh lampau). Publik **tidak bisa membaca**
  tabel ini, sehingga nomor telepon pelanggan tidak terbuka. Admin melihat & mengubah status lewat Dashboard Supabase.
- Urutan SQL: `schema.sql` -> `seed.sql` -> `rls_hardening.sql` -> `verify_rls.sql` (harus berakhir dengan baris "LULUS").
  `rls_hardening.sql` menambah policy admin (role `admin` di `app_metadata` JWT) dan batas tanggal booking menurut WIB.
- Klien menolak kunci `service_role`/`sb_secret_` di `VITE_SUPABASE_ANON_KEY` (console error, dan `npm run build` dibatalkan).

## Catatan

- Ketersediaan stok final tetap dikonfirmasi admin lewat WhatsApp.
- Keranjang tersimpan di localStorage (kunci `fitomotor:cart:v2`) dan tidak dikosongkan otomatis setelah checkout.
  Harga/stok di keranjang disegarkan dari Supabase setiap keranjang dibuka (dan saat barang ditambah ulang);
  barang yang sudah dihapus dari katalog otomatis dikeluarkan dengan pemberitahuan.
- Jika jumlah barang di keranjang diturunkan ke 0, barang tidak dihapus: tampil "Stok habis", tidak dihitung di total,
  dan tidak ikut pesan WhatsApp. Barang hanya terhapus lewat tombol tempat sampah.
- URL `wa.me` punya batas panjang praktis (sekitar 2.000 karakter), jadi keranjang dengan puluhan jenis barang sebaiknya dipecah.
- Data katalog di-cache TanStack Query (`staleTime` 60 dtk untuk produk, 10 mnt untuk layanan; retry 2x dengan backoff).
  Mutation booking tidak di-retry otomatis agar tidak membuat booking ganda. Atur di `lib/queryClient.ts` dan `queries/*.ts`.
- Animasi scroll: komponen `<Reveal>` (`src/components/ui/Reveal.tsx`) memudar-masukkan konten saat pertama kali terlihat,
  tanpa pustaka tambahan (satu `IntersectionObserver` bersama di `hooks/useInView.ts`, gaya di `index.css`).
  Varian: `up` (default), `left`, `right`, `scale`, `fade`; `delay` untuk efek berurutan (`utils/motion.ts` -> `stagger`).
  Otomatis nonaktif bila pengguna mengaktifkan "reduce motion" di sistemnya. Untuk elemen di dalam grid gunakan `className="h-full"`.
- SEO: meta tag diatur dari sisi klien. Crawler yang tidak menjalankan JavaScript hanya melihat meta bawaan di `index.html`;
  untuk indeksasi maksimal pertimbangkan prerendering di kemudian hari.

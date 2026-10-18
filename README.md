# FitoMotor

Website bengkel motor + toko suku cadang ringan.
**Stack:** React 18 + Vite + TypeScript + Tailwind CSS + React Router, dengan **Supabase** (PostgreSQL) sebagai sumber data,
`react-hook-form` + `zod` untuk form, `react-hot-toast` untuk notifikasi, dan `react-helmet-async` untuk SEO per halaman.

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
  `window`, atau tanggal/waktu langsung saat render; baca di `useEffect` (contoh: `CartProvider`, `BookingForm`).
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
├── main.tsx · App.tsx           # provider (Helmet, Router, Cart) + Toaster + route; main.tsx hydrate/render
├── entry-server.tsx             # render(url) untuk prerender (dipakai scripts/prerender.mjs)
├── types/index.ts               # Product, Service, Booking, CartItem, ...
├── lib/
│   ├── supabase.ts              # klien Supabase (dari import.meta.env)
│   └── api.ts                   # semua query/insert Supabase (try/catch + pesan galat ramah)
├── hooks/                       # useProducts, useServices, useAsyncResource (loading/error/cache)
├── schemas/booking.ts           # skema zod form booking
├── layouts/PublicLayout.tsx     # Navbar + halaman + Footer + CartDrawer
├── pages/                       # Beranda, Layanan, Katalog, Kontak, NotFound
├── components/                  # Navbar, CartDrawer, ProductCard, BookingForm, BookingServis, KalkulatorBiaya, WhatsAppFloat, Seo, ...
├── context/                     # CartContext.tsx (provider) + cartReducer.ts (reducer murni)
├── data/                        # site.ts, navLinks.ts (konfigurasi statis saja)
└── utils/                       # format, whatsapp (URL wa.me), date, errors
supabase/
├── schema.sql                   # tabel + Row Level Security
├── seed.sql                     # data awal (dummy), aman dijalankan ulang
└── fix_duplicates.sql           # pembersih data dobel (sekali jalan)
```

## Yang perlu Anda ganti

- `.env` -> `VITE_WA_NUMBER`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `public/logo-mark.png`, `favicon-32.png`, `icon-192.png`, `apple-touch-icon.png` : ikon logo (hexagon "FM"). Ganti file-nya bila logo berubah.
- `src/data/site.ts` : alamat, jam buka, tautan Google Maps, `mapEmbedUrl`, dan `heroImage`
- `src/components/KalkulatorBiaya.tsx` : konstanta `TARIF` berisi rentang harga CONTOH; ganti dengan tarif asli bengkel
- Foto produk (`products.image_url`): kartu katalog dirancang untuk **PNG transparan** rasio sekitar 1:1 dengan produk memenuhi ~80% kanvas. Foto ber-latar putih (JPG) tetap menyatu, tetapi PNG transparan hasilnya terbaik.
- Tabel `products` & `services` di Supabase: produk, harga, **stok**, foto asli, tarif layanan (seed hanyalah data dummy)
- Mengelola data: lewat **Table Editor** Supabase. Booking masuk ke tabel `bookings` (status awal `pending`).

## Keamanan data (RLS)

- `products` & `services`: publik hanya boleh **membaca**.
- `bookings`: publik hanya boleh **menambah** (status harus `pending`, tanggal tidak boleh lampau). Publik **tidak bisa membaca**
  tabel ini, sehingga nomor telepon pelanggan tidak terbuka. Admin melihat & mengubah status lewat Dashboard Supabase.

## Catatan

- Ketersediaan stok final tetap dikonfirmasi admin lewat WhatsApp.
- Keranjang tersimpan di localStorage (kunci `fitomotor:cart:v2`) dan tidak dikosongkan otomatis setelah checkout.
  Harga/stok di keranjang disegarkan dari Supabase setiap keranjang dibuka (dan saat barang ditambah ulang);
  barang yang sudah dihapus dari katalog otomatis dikeluarkan dengan pemberitahuan.
- Jika jumlah barang di keranjang diturunkan ke 0, barang tidak dihapus: tampil "Stok habis", tidak dihitung di total,
  dan tidak ikut pesan WhatsApp. Barang hanya terhapus lewat tombol tempat sampah.
- URL `wa.me` punya batas panjang praktis (sekitar 2.000 karakter), jadi keranjang dengan puluhan jenis barang sebaiknya dipecah.
- Data katalog/layanan di-cache di memori selama 60 detik per sesi tab.
- Animasi scroll: komponen `<Reveal>` (`src/components/Reveal.tsx`) memudar-masukkan konten saat pertama kali terlihat,
  tanpa pustaka tambahan (satu `IntersectionObserver` bersama di `hooks/useInView.ts`, gaya di `index.css`).
  Varian: `up` (default), `left`, `right`, `scale`, `fade`; `delay` untuk efek berurutan (`utils/motion.ts` -> `stagger`).
  Otomatis nonaktif bila pengguna mengaktifkan "reduce motion" di sistemnya. Untuk elemen di dalam grid gunakan `className="h-full"`.
- SEO: meta tag diatur dari sisi klien. Crawler yang tidak menjalankan JavaScript hanya melihat meta bawaan di `index.html`;
  untuk indeksasi maksimal pertimbangkan prerendering di kemudian hari.

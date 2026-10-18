import type { ComponentType, LazyExoticComponent } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CartEffects from "@/features/cart/CartEffects";
import PublicLayout from "@/components/layout/PublicLayout";

type PageComponent = ComponentType | LazyExoticComponent<ComponentType>;

/**
 * Halaman-halaman aplikasi, DISUNTIKKAN dari luar:
 * - Browser (main.tsx)         -> pages/lazy.ts   : React.lazy, tiap halaman jadi chunk JS terpisah.
 * - Prerender (entry-server)   -> pages/eager.ts  : import biasa.
 *
 * Kenapa tidak lazy di mana-mana? renderToString (dipakai prerender SEO) tidak menunggu komponen lazy: ia hanya
 * menulis fallback Suspense ke HTML. Hasilnya halaman prerender kehilangan <h1> dan seluruh isi (SEO rusak, dan
 * scripts/prerender.mjs akan gagal). Dengan injeksi ini, HTML hasil prerender tetap lengkap, sementara pengunjung
 * hanya mengunduh JS halaman yang mereka buka.
 */
export interface AppPages {
  Beranda: PageComponent;
  Layanan: PageComponent;
  Katalog: PageComponent;
  Kontak: PageComponent;
  NotFound: PageComponent;
}

export default function App({ pages }: { pages: AppPages }) {
  const { Beranda, Layanan, Katalog, Kontak, NotFound } = pages;
  return (
    <>
      {/* Umpan balik visual (sukses / gagal / keranjang) menggantikan alert() bawaan browser */}
      <Toaster position="top-center" toastOptions={{ duration: 3500, style: { fontSize: "14px" } }} />
      <CartEffects />
      {/* <Suspense> untuk halaman lazy ada di PublicLayout (membungkus <Outlet />), supaya Navbar & Footer tetap tampil. */}
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Beranda />} />
          <Route path="layanan" element={<Layanan />} />
          <Route path="katalog" element={<Katalog />} />
          <Route path="kontak" element={<Kontak />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

import { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CartEffects from "@/features/cart/CartEffects";
import PublicLayout from "@/components/layout/PublicLayout";

// Tiap halaman menjadi chunk JS terpisah (code splitting bawaan Vite/Rollup: satu dynamic import = satu chunk).
// <Suspense> untuk halaman-halaman ini ada di PublicLayout (membungkus <Outlet />), supaya Navbar & Footer tetap tampil.
// Prerender SEO: entry-server.tsx memakai renderToPipeableStream + onAllReady, yang MENUNGGU chunk ini selesai dimuat
// sebelum HTML ditulis. Jangan ganti ke renderToString: ia hanya menulis fallback Suspense dan isi halaman hilang.
const Beranda = lazy(() => import("@/pages/Beranda"));
const Layanan = lazy(() => import("@/pages/Layanan"));
const Katalog = lazy(() => import("@/pages/Katalog"));
const Kontak = lazy(() => import("@/pages/Kontak"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export default function App() {
  return (
    <>
      {/* Umpan balik visual (sukses / gagal / keranjang) menggantikan alert() bawaan browser */}
      <Toaster position="top-center" toastOptions={{ duration: 3500, style: { fontSize: "14px" } }} />
      <CartEffects />
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

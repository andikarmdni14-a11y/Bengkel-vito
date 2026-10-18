import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CartDrawer from "@/features/cart/CartDrawer";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { PageSkeleton } from "@/components/ui/Skeletons";
import WhatsAppFloat from "./WhatsAppFloat";

/**
 * Pindah halaman: ke atas. Tautan dengan #hash (mis. /kontak#booking): gulir ke elemennya.
 *
 * Komponen ini sengaja dirender DI DALAM <Suspense> yang sama dengan <Outlet />. Halaman bersifat lazy, jadi
 * saat alamat berubah isinya belum ter-mount; efek di komponen yang berada di dalam batas Suspense baru
 * berjalan setelah halaman selesai dimuat, sehingga elemen #booking sudah ada. (Bila efek ini berada di
 * PublicLayout, ia berjalan lebih dulu dan tautan #hash tidak akan menggulir.)
 */
function ScrollToTarget() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return null;
}

export default function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-red-600 selection:text-white">
      <Navbar />
      <main className="flex-1 overflow-x-clip">
        {/* Halaman lazy: Navbar/Footer tetap tampil, bagian tengah menampilkan skeleton selama chunk diunduh. */}
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
          <ScrollToTarget />
        </Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
}

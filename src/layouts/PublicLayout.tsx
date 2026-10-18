import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import CartDrawer from "../components/CartDrawer";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import WhatsAppFloat from "../components/WhatsAppFloat";

export default function PublicLayout() {
  const { pathname, hash } = useLocation();

  // Pindah halaman: ke atas. Tautan dengan #hash (mis. /kontak#booking): gulir ke elemennya.
  useEffect(() => {
    const target = hash ? document.getElementById(hash.slice(1)) : null;
    if (target) target.scrollIntoView();
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash]);

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 font-sans text-slate-900 antialiased selection:bg-red-600 selection:text-white">
      <Navbar />
      <main className="flex-1 overflow-x-clip">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, X } from "lucide-react";
import { selectTotalQty, useCartStore } from "../features/cart/cartStore";
import { NAV_LINKS } from "../data/navLinks";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  // Selector: Navbar hanya render ulang saat JUMLAH barang berubah (bukan saat drawer dibuka/ditutup).
  const totalQty = useCartStore(selectTotalQty);
  const openCart = useCartStore((s) => s.openCart);
  const { pathname } = useLocation();

  // Tutup menu mobile setiap kali halaman berpindah (termasuk tombol Back)
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Logo />

        {/* Desktop: menu horizontal */}
        <nav aria-label="Navigasi utama" className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-sm font-medium transition ${isActive ? "text-red-600" : "text-slate-500 hover:text-slate-900"}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={openCart}
            aria-label={`Buka keranjang, ${totalQty} barang`}
            className="relative grid h-11 w-11 place-items-center rounded-full text-slate-900 transition hover:bg-slate-100"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalQty > 0 && (
              <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                {totalQty}
              </span>
            )}
          </button>

          <Link
            to="/kontak#booking"
            className="ml-4 hidden rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 md:inline-flex"
          >
            Booking Servis
          </Link>

          {/* Mobile: hamburger */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="grid h-11 w-11 place-items-center rounded-full text-slate-900 transition hover:bg-slate-100 md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

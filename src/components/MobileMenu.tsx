import { Link, NavLink } from "react-router-dom";
import { NAV_LINKS } from "../data/navLinks";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileMenu({ open, onClose }: MobileMenuProps) {
  if (!open) return null;

  return (
    <nav id="mobile-menu" aria-label="Menu seluler" className="border-t border-slate-200/70 bg-white/90 backdrop-blur-xl md:hidden">
      <ul className="mx-auto max-w-6xl space-y-1 px-5 pb-5 pt-3 sm:px-8">
        {NAV_LINKS.map(({ to, label, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex h-12 items-center rounded-lg px-3 text-base font-medium ${
                  isActive ? "bg-red-50 text-red-600" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {label}
            </NavLink>
          </li>
        ))}
        <li className="pt-2">
          <Link
            to="/kontak#booking"
            onClick={onClose}
            className="flex h-12 items-center justify-center rounded-full bg-red-600 text-sm font-semibold text-white"
          >
            Booking Servis
          </Link>
        </li>
      </ul>
    </nav>
  );
}

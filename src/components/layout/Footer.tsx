import { Link } from "react-router-dom";
import { NAV_LINKS } from "@/data/navLinks";
import { SITE } from "@/data/site";
import ContactInfo from "@/features/contact/ContactInfo";
import Logo from "@/components/ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200/70 bg-white">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-20">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-base leading-relaxed text-slate-500">{SITE.tagline}</p>
          <div className="mt-8">
            <ContactInfo />
          </div>
        </div>

        <nav aria-label="Tautan cepat">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Menu</h2>
          <ul className="mt-4 space-y-1">
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className="inline-flex h-11 items-center text-base font-medium text-slate-600 transition hover:text-red-600">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="border-t border-slate-200/70 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} {SITE.name}. Hak cipta dilindungi.
      </div>
    </footer>
  );
}

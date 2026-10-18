import { SITE } from "../data/site";
import { waLink } from "../utils/whatsapp";
import WhatsAppIcon from "./WhatsAppIcon";

/**
 * Tombol WhatsApp melayang (fixed, kanan bawah). Putih dengan aksen merah.
 * Hover/fokus: naik tipis, terisi merah, dan label "Chat WhatsApp" meluncur keluar.
 * Di layar sentuh yang tidak punya hover, tampil sebagai lingkaran ikon saja.
 *
 * z-40: di bawah Navbar (z-50) dan CartDrawer (z-60), jadi tidak menutupi keranjang yang terbuka.
 * Posisi memakai safe-area agar tidak tertutup home indicator di iPhone.
 */
export default function WhatsAppFloat() {
  return (
    <a
      href={waLink(`Halo ${SITE.name}, saya ingin bertanya tentang servis motor.`)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat WhatsApp ${SITE.name}`}
      className="group fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-[max(1.25rem,env(safe-area-inset-right))] z-40 inline-flex h-14 items-center rounded-full border border-slate-200 bg-white px-4 text-red-600 shadow-lg shadow-slate-900/10 transition duration-300 ease-out hover:-translate-y-0.5 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-xl hover:shadow-red-600/25 focus-visible:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 print:hidden"
    >
      <WhatsAppIcon className="h-6 w-6 shrink-0" />
      <span
        aria-hidden="true"
        className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 ease-out group-hover:ml-2.5 group-hover:max-w-[8rem] group-hover:opacity-100 group-focus-visible:ml-2.5 group-focus-visible:max-w-[8rem] group-focus-visible:opacity-100 motion-reduce:transition-none"
      >
        Chat WhatsApp
      </span>
    </a>
  );
}

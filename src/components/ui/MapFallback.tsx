import { SITE } from "@/data/site";
import { MapPin } from "lucide-react";

/** Tampilan peta ilustrasi saat SITE.mapEmbedUrl belum diisi. Hanya berisi info untuk pengunjung. */
export default function MapFallback() {
  return (
    <div className="relative h-72 w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
      <svg
        aria-hidden="true"
        viewBox="0 0 600 288"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        <rect width="600" height="288" fill="#f1f5f9" />
        {/* taman & sungai */}
        <rect x="36" y="28" width="176" height="96" rx="18" fill="#dcfce7" />
        <rect x="372" y="176" width="190" height="84" rx="18" fill="#dcfce7" />
        <path d="M0 214C90 190 150 250 250 236S420 150 600 168V132C430 112 330 196 250 196S90 150 0 176Z" fill="#e0f2fe" />
        {/* jalan: garis tepi lalu isi putih */}
        <g fill="none" strokeLinecap="round">
          <g stroke="#e2e8f0" strokeWidth="24">
            <path d="M-10 142C140 128 240 168 330 150S520 120 610 132" />
            <path d="M300 -10V300" />
            <path d="M-10 280L610 40" />
            <path d="M470 -10V300" />
          </g>
          <g stroke="#ffffff" strokeWidth="17">
            <path d="M-10 142C140 128 240 168 330 150S520 120 610 132" />
            <path d="M300 -10V300" />
            <path d="M-10 280L610 40" />
            <path d="M470 -10V300" />
          </g>
          <g stroke="#e2e8f0" strokeWidth="7">
            <path d="M120 -10V110M120 170V300" />
            <path d="M-10 60H280M320 82H610" />
            <path d="M380 150V300" />
          </g>
        </g>
      </svg>

      <span
        aria-hidden="true"
        className="absolute left-1/2 top-[44%] grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-red-600 text-white shadow-lg ring-4 ring-white"
      >
        <MapPin className="h-6 w-6" />
      </span>

      <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-white/95 px-4 py-3 shadow-md">
        <p className="text-sm font-extrabold text-slate-900">{SITE.name}</p>
        <p className="mt-0.5 text-sm leading-snug text-slate-600">{SITE.address.join(" ")}</p>
      </div>
    </div>
  );
}

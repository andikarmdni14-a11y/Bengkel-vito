import { Link } from "react-router-dom";

/**
 * Logo horizontal FitoMotor: ikon heksagon (public/logo-mark.png, transparan) + wordmark.
 * Wordmark ditulis sebagai teks asli (tajam di semua layar & terbaca screen reader); huruf "M" merah mengikuti artwork logo.
 */
export default function Logo() {
  return (
    <Link to="/" className="inline-flex items-center gap-3">
      <img src="/logo-mark.png" alt="" width={233} height={266} decoding="async" className="h-10 w-auto" />
      <span className="flex flex-col leading-none">
        <span className="text-2xl font-extrabold tracking-tight text-slate-900">
          Fito<span className="text-red-600">M</span>otor
        </span>
        <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600">Bengkel Motor</span>
      </span>
    </Link>
  );
}

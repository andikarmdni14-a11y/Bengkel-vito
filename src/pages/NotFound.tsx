import { Link } from "react-router-dom";
import Seo from "@/components/ui/Seo";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-24 text-center sm:px-8">
      <Seo title="Halaman Tidak Ditemukan | FitoMotor" description="Halaman yang Anda cari tidak ditemukan di situs FitoMotor." noIndex />
      <p className="text-sm font-semibold text-red-600">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Halaman tidak ditemukan</h1>
      <p className="mt-4 text-slate-500">Alamat yang Anda buka tidak ada atau sudah dipindahkan.</p>
      <Link
        to="/"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-red-600 px-7 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
      >
        Kembali ke Beranda
      </Link>
    </section>
  );
}

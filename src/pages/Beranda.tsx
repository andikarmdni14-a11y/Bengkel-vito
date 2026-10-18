import { Link } from "react-router-dom";
import { Star, Wrench } from "lucide-react";
import BookingServis from "@/features/booking/BookingServis";
import ErrorState from "@/components/ui/ErrorState";
import KalkulatorBiaya from "@/features/booking/KalkulatorBiaya";
import Photo from "@/components/ui/Photo";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import Seo from "@/components/ui/Seo";
import ServiceCard from "@/features/services/ServiceCard";
import { ServiceCardSkeleton } from "@/components/ui/Skeletons";
import { SITE } from "../data/site";
import { useServices } from "../queries/services";
import { stagger } from "../utils/motion";

export default function Beranda() {
  const { services, loading, error, refetch } = useServices();

  return (
    <>
      <Seo
        title="FitoMotor | Servis Motor, Tambal Ban & Suku Cadang Terpercaya"
        description="Bengkel motor FitoMotor melayani servis rutin, tambal ban, dan penjualan suku cadang motor. Booking jadwal servis online tanpa antre, pesan sparepart lewat WhatsApp."
      />

      {/* Hero: bertumpuk vertikal di mobile, dua kolom di desktop */}
      <section>
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-16 sm:px-8 md:grid-cols-2 md:gap-16 md:py-24">
          <div className="space-y-8">
            <Reveal>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Solusi Perawatan &amp; Suku Cadang Motor Terpercaya.
              </h1>
            </Reveal>
            <Reveal delay={100}>
              <p className="max-w-md text-lg leading-relaxed text-slate-600">
                Dari servis rutin hingga modifikasi, FitoMotor siap mengembalikan performa optimal motor Anda tanpa antre lama.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/kontak#booking"
                  className="inline-flex items-center justify-center rounded-full bg-red-600 px-7 py-4 text-sm font-semibold text-white shadow-md transition hover:bg-red-700"
                >
                  Booking Servis Sekarang
                </Link>
                <Link
                  to="/katalog"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white/60 px-7 py-4 text-sm font-semibold text-slate-900 transition hover:border-slate-900 hover:bg-white"
                >
                  Lihat Katalog Produk
                </Link>
              </div>

              {/* Social proof: bintang dekoratif (aria-hidden), maknanya dibawa oleh teks di sebelahnya */}
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-500" strokeWidth={1.5} />
                  ))}
                </div>
                <p className="text-sm text-slate-500">Dipercaya oleh 1.000+ pengendara</p>
              </div>
            </Reveal>
          </div>

          <Reveal variant="scale" delay={150}>
            {/* Lapisan luar = animasi melayang. Lapisan dalam = hover. Dipisah agar dua transform tidak saling menimpa. */}
            <div className="motion-safe:animate-float">
              <div className="group isolate aspect-square w-full overflow-hidden rounded-xl bg-slate-800 shadow-lg shadow-slate-900/10 transition-shadow duration-500 hover:shadow-2xl hover:shadow-slate-900/25">
                <Photo
                  src={SITE.heroImage}
                  alt="Mekanik FitoMotor sedang mengerjakan motor"
                  icon={Wrench}
                  dark
                  priority
                  className="rounded-xl transition-transform duration-700 ease-out motion-safe:group-hover:scale-105"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pengantar layanan */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-24">
        <Reveal>
          <SectionHead
            title="Layanan Kami"
            desc="Tiga layanan inti yang paling sering dibutuhkan pengendara, dikerjakan rapi dan transparan."
          />
        </Reveal>
        {error ? (
          <ErrorState title="Layanan gagal dimuat" message={error} onRetry={refetch} />
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-3" aria-busy={loading}>
            {loading ? (
              <>
                <span role="status" className="sr-only">
                  Memuat layanan...
                </span>
                {Array.from({ length: 3 }, (_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </>
            ) : (
              services.map((s, i) => (
                <Reveal key={s.id} delay={stagger(i)} className="h-full">
                  <ServiceCard service={s} />
                </Reveal>
              ))
            )}
          </div>
        )}
        <Link
          to="/layanan"
          className="mt-10 inline-flex h-11 items-center text-sm font-semibold text-red-600 underline-offset-4 hover:underline"
        >
          Lihat detail layanan →
        </Link>
      </section>

      {/* Booking & kalkulator estimasi biaya */}
      <section id="booking-estimasi" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-20 sm:px-8 md:pb-24">
        <Reveal>
          <SectionHead
            title="Booking & Estimasi Biaya"
            desc="Pilih jadwal servis yang cocok, atau perkirakan dulu biayanya sebelum datang."
          />
        </Reveal>
        <div className="mt-14 grid items-start gap-6 lg:grid-cols-[3fr_2fr]">
          <Reveal>
            <BookingServis />
          </Reveal>
          <Reveal delay={120}>
            <KalkulatorBiaya />
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8 md:pb-24">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-12 text-white sm:px-12 md:px-16 md:py-16">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
            <div className="relative max-w-xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Butuh suku cadang atau jadwal servis?</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Pilih barang di katalog lalu pesan lewat WhatsApp, atau booking jadwal servis agar langsung dikerjakan tanpa antre.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/katalog"
                  className="inline-flex items-center justify-center rounded-full bg-red-600 px-7 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
                >
                  Belanja Suku Cadang
                </Link>
                <Link
                  to="/kontak#booking"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-7 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Booking Servis
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

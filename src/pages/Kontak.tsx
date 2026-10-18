import { Navigation } from "lucide-react";
import BookingForm from "@/features/booking/BookingForm";
import ContactInfo from "@/features/contact/ContactInfo";
import MapFallback from "@/components/ui/MapFallback";
import Reveal from "@/components/ui/Reveal";
import SectionHead from "@/components/ui/SectionHead";
import Seo from "@/components/ui/Seo";
import { SITE } from "../data/site";

export default function Kontak() {
  return (
    <>
      <Seo
        title="Kontak & Booking Servis Motor | FitoMotor"
        description="Alamat, jam buka, dan nomor WhatsApp FitoMotor. Booking jadwal servis motor online agar langsung dikerjakan tanpa antre."
      />
      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-16">
        <Reveal>
          <SectionHead as="h1" title="Hubungi Kami" desc="Datang langsung ke bengkel, atau chat lewat WhatsApp untuk bertanya." />
        </Reveal>

        <div className="mt-12 grid gap-12 md:grid-cols-2">
          <Reveal variant="left">
            <ContactInfo />
          </Reveal>

          <Reveal variant="right" delay={120}>
            <div>
              {SITE.mapEmbedUrl ? (
                <iframe
                  src={SITE.mapEmbedUrl}
                  title="Peta lokasi FitoMotor"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-72 w-full rounded-3xl border border-slate-200"
                />
              ) : (
                <MapFallback />
              )}
              <a
                href={SITE.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                <Navigation className="h-4 w-4" /> Arahkan via Google Maps
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="booking" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-20 sm:px-8 md:pb-24">
        {/* Tanpa overflow-hidden di kartu: daftar CustomSelect di dekat bagian bawah tidak boleh terpotong */}
        <Reveal>
          <div className="relative rounded-3xl bg-slate-900 px-6 py-12 text-white shadow-xl sm:px-12 md:px-16 md:py-16">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-red-600/30 blur-3xl" />
            </div>
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Booking Servis</h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                Pilih jadwal yang cocok, datang sesuai jam, langsung dikerjakan tanpa antre.
              </p>
              <BookingForm />
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}

import { Link } from "react-router-dom";
import ErrorState from "@/components/ui/ErrorState";
import SectionHead from "@/components/ui/SectionHead";
import Reveal from "@/components/ui/Reveal";
import Seo from "@/components/ui/Seo";
import ServiceCard from "@/features/services/ServiceCard";
import { ServiceCardSkeleton } from "@/components/ui/Skeletons";
import { useServices } from "../queries/services";
import { stagger } from "../utils/motion";

export default function Layanan() {
  const { services, loading, error, refetch } = useServices();

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 md:py-16">
      <Seo
        title="Layanan Servis Motor, Tambal Ban & Ganti Suku Cadang | FitoMotor"
        description="Layanan FitoMotor: servis rutin & tune-up, tambal ban tubeless dan non-tubeless, serta penggantian suku cadang dengan garansi pemasangan."
      />
      <Reveal>
        <SectionHead
          as="h1"
          title="Layanan Kami"
          desc="Tiga layanan inti yang paling sering dibutuhkan pengendara, dikerjakan rapi dan transparan."
        />
      </Reveal>

      {error ? (
        <ErrorState title="Layanan gagal dimuat" message={error} onRetry={refetch} />
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-3" aria-busy={loading}>
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
                <ServiceCard service={s} showDetails />
              </Reveal>
            ))
          )}
        </div>
      )}

      <Reveal>
        <div className="mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
          <p className="text-lg font-extrabold tracking-tight text-slate-900">Siap servis? Pilih jadwal yang cocok untuk Anda.</p>
          <Link
            to="/kontak#booking"
            className="inline-flex shrink-0 items-center justify-center rounded-full bg-red-600 px-7 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            Booking Servis
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

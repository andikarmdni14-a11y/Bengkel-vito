import { CheckCircle2 } from "lucide-react";
import type { Service } from "../types";
import { getServiceIcon } from "./serviceIcons";

interface ServiceCardProps {
  service: Service;
  /** Tampilkan daftar rincian (halaman Layanan). Di Beranda dimatikan. */
  showDetails?: boolean;
}

export default function ServiceCard({ service, showDetails = false }: ServiceCardProps) {
  const Icon = getServiceIcon(service.icon);

  return (
    <article className="group h-full rounded-3xl border border-slate-200/80 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-900/10">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
        <Icon className="h-8 w-8" strokeWidth={1.75} />
      </span>
      <h3 className="mt-8 text-xl font-extrabold tracking-tight text-slate-900">{service.name}</h3>
      <p className="mt-3 text-base leading-relaxed text-slate-500">{service.description}</p>

      {showDetails && service.details.length > 0 && (
        <ul className="mt-6 space-y-3 border-t border-slate-100 pt-6">
          {service.details.map((d) => (
            <li key={d} className="flex items-start gap-3 text-sm text-slate-600">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              {d}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

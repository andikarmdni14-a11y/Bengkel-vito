import { Clock, MapPin, Phone } from "lucide-react";
import { SITE } from "../data/site";
import { formatPhone } from "../utils/format";
import { waLink } from "../utils/whatsapp";

export default function ContactInfo() {
  return (
    <ul className="space-y-5 text-base">
      <li className="flex gap-4">
        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <span className="text-slate-600">
          {SITE.address.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </span>
      </li>
      <li className="flex gap-4">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <span className="text-slate-600">
          {SITE.hours[0]}
          <br />
          <span className="text-slate-400">{SITE.hours[1]}</span>
        </span>
      </li>
      <li className="flex gap-4">
        <Phone className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
        <a
          href={waLink("Halo FitoMotor, saya ingin bertanya.")}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-slate-900 underline decoration-slate-300 underline-offset-4 transition hover:decoration-red-600"
        >
          {formatPhone(SITE.waNumber)} (WhatsApp)
        </a>
      </li>
    </ul>
  );
}

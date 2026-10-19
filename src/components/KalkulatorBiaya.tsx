import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatRupiah } from "../utils/format";

/* ---------- DATA TARIF ----------
   PENTING: angka pada TARIF di bawah hanya CONTOH (dummy). Ganti dengan tarif asli bengkel.
   Untuk menambah pilihan: tambah item di KENDARAAN / SERVIS, lalu isi rentang harganya di TARIF. */
const KENDARAAN = [
  { value: "matic", label: "Motor Matic" },
  { value: "bebek", label: "Motor Bebek" },
  { value: "sport", label: "Motor Sport" },
] as const;

const SERVIS = [
  { value: "rutin", label: "Servis Rutin" },
  { value: "oli", label: "Ganti Oli" },
  { value: "ban", label: "Tambal Ban" },
  { value: "rem", label: "Ganti Kampas Rem" },
] as const;

type KendaraanId = (typeof KENDARAAN)[number]["value"];
type ServisId = (typeof SERVIS)[number]["value"];
type Rentang = readonly [min: number, max: number];

const TARIF: Record<ServisId, Record<KendaraanId, Rentang>> = {
  rutin: { matic: [50000, 120000], bebek: [45000, 100000], sport: [80000, 180000] },
  oli: { matic: [55000, 100000], bebek: [50000, 90000], sport: [90000, 170000] },
  ban: { matic: [15000, 25000], bebek: [15000, 20000], sport: [20000, 35000] },
  rem: { matic: [60000, 130000], bebek: [50000, 110000], sport: [90000, 200000] },
};

interface SelectFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

// <select> bawaan browser: aksesibel, ramah sentuh, dan daftar pilihannya otomatis mengikuti perangkat.
function SelectField({ id, label, value, placeholder, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl border border-slate-300 bg-white py-3.5 pl-4 pr-11 text-base outline-none transition hover:border-slate-400 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 sm:text-sm [&>option]:text-slate-900 ${
            value ? "text-slate-900" : "text-slate-500"
          }`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
        />
      </div>
    </div>
  );
}

export default function KalkulatorBiaya() {
  const uid = useId();
  const [kendaraan, setKendaraan] = useState<KendaraanId | "">("");
  const [servis, setServis] = useState<ServisId | "">("");

  const rentang = kendaraan && servis ? TARIF[servis][kendaraan] : null;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Kalkulator Estimasi Biaya</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">Perkirakan biaya servis sebelum datang ke bengkel.</p>

      <div className="mt-6 space-y-4">
        <SelectField
          id={`${uid}-kendaraan`}
          label="Jenis Kendaraan"
          placeholder="Pilih jenis kendaraan"
          value={kendaraan}
          options={KENDARAAN}
          onChange={(v) => setKendaraan(v as KendaraanId)}
        />
        <SelectField
          id={`${uid}-servis`}
          label="Jenis Servis"
          placeholder="Pilih jenis servis"
          value={servis}
          options={SERVIS}
          onChange={(v) => setServis(v as ServisId)}
        />
      </div>

      {/* role="status": pembaca layar ikut membacakan hasil saat pilihan berubah */}
      <div role="status" className="mt-6 rounded-2xl bg-slate-50 px-5 py-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Estimasi biaya</p>
        {rentang ? (
          <>
            <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              <span className="whitespace-nowrap">{formatRupiah(rentang[0])}</span> –{" "}
              <span className="whitespace-nowrap">{formatRupiah(rentang[1])}</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">Perkiraan awal. Biaya akhir mengikuti hasil pengecekan mekanik.</p>
          </>
        ) : (
          <p className="mt-2 text-base text-slate-500">Pilih jenis kendaraan dan servis.</p>
        )}
      </div>
    </div>
  );
}

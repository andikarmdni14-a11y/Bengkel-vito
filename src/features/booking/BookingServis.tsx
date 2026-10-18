import { useEffect, useId, useMemo, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";
import { SITE } from "@/data/site";
import { waLink } from "@/utils/whatsapp";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";

/* ---------- Pengaturan slot ----------
   Samakan dengan jam buka di src/data/site.ts (Senin - Sabtu, 08:00 - 17:00). Slot per jam, terakhir 16:00. */
const JAM_SLOT = Array.from({ length: 9 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);
const HARI_TUTUP = [0]; // 0 = Minggu
const JUMLAH_HARI = 7;
const NAMA_HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const NAMA_BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

export interface BookingServisValues {
  nama: string;
  telepon: string;
  motor: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm */
  time: string;
}

interface BookingServisProps {
  /** Slot yang sudah terisi per tanggal, mis. { "2026-10-20": ["09:00", "10:00"] }. Slot ini tampil nonaktif. */
  bookedSlots?: Record<string, string[]>;
  /** Jika diisi, dipanggil menggantikan pengiriman lewat WhatsApp (mis. untuk simpan ke database sendiri). */
  onSubmit?: (values: BookingServisValues) => void | Promise<void>;
}

type FieldKey = "nama" | "telepon" | "motor" | "date" | "time";
type Errors = Partial<Record<FieldKey, string>>;
const FIELD_ORDER: FieldKey[] = ["nama", "telepon", "motor", "date", "time"];

/* ---------- Helper tanggal (zona waktu perangkat) ---------- */
const pad = (n: number) => String(n).padStart(2, "0");
const toISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toMinutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const isPast = (iso: string, time: string, now: Date) =>
  iso === toISO(now) && toMinutes(time) <= now.getHours() * 60 + now.getMinutes();

interface DayOption {
  iso: string;
  weekday: string;
  day: number;
  month: string;
  /** Contoh: "Sen, 19 Okt 2026" */
  label: string;
}

// Hari buka berikutnya. Hari ini dilewati bila semua slotnya sudah lewat.
function buildDays(now: Date): DayOption[] {
  const todayIso = toISO(now);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const days: DayOption[] = [];
  while (days.length < JUMLAH_HARI) {
    const iso = toISO(cursor);
    const buka = !HARI_TUTUP.includes(cursor.getDay());
    const adaSlot = JAM_SLOT.some((t) => !isPast(iso, t, now));
    if (buka && adaSlot) {
      const hari = NAMA_HARI[cursor.getDay()];
      const bulan = NAMA_BULAN[cursor.getMonth()];
      days.push({
        iso,
        weekday: iso === todayIso ? "Hari ini" : hari,
        day: cursor.getDate(),
        month: bulan,
        label: `${hari}, ${cursor.getDate()} ${bulan} ${cursor.getFullYear()}`,
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

/* ---------- Validasi ---------- */
function validate(f: { nama: string; telepon: string; motor: string }, date: string, time: string): Errors {
  const e: Errors = {};
  const nama = f.nama.trim();
  if (!nama) e.nama = "Nama wajib diisi.";
  else if (nama.length > 80) e.nama = "Nama maksimal 80 karakter.";

  const telepon = f.telepon.trim();
  const digits = telepon.replace(/\D/g, "");
  if (!telepon) e.telepon = "Nomor HP wajib diisi.";
  else if (!/^\+?[0-9\s-]+$/.test(telepon)) e.telepon = "Nomor HP hanya boleh berisi angka.";
  else if (digits.length < 10) e.telepon = "Nomor HP minimal 10 digit.";
  else if (digits.length > 15) e.telepon = "Nomor HP maksimal 15 digit.";

  const motor = f.motor.trim();
  if (!motor) e.motor = "Jenis motor wajib diisi.";
  else if (motor.length > 80) e.motor = "Jenis motor maksimal 80 karakter.";

  if (!date) e.date = "Pilih tanggal kunjungan.";
  if (!time) e.time = "Pilih jam kunjungan.";
  return e;
}

const buildMessage = (v: BookingServisValues, tanggal: string) =>
  `Halo ${SITE.name}, saya ingin booking servis.\n\n` +
  `Nama: ${v.nama}\nNo. HP: ${v.telepon}\nJenis motor: ${v.motor}\nTanggal: ${tanggal}\nJam: ${v.time} WIB`;

/* ---------- Potongan UI ---------- */
const inputCls = (invalid: boolean) =>
  `w-full rounded-xl border bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-500 outline-none transition focus:ring-2 focus:ring-red-600/20 sm:text-sm ${
    invalid ? "border-red-600" : "border-slate-300 hover:border-slate-400 focus:border-red-600"
  }`;

// Cincin fokus untuk kontrol radio yang disembunyikan (sr-only): muncul pada elemen visual di sebelahnya.
const FOCUS_RING =
  "peer-focus-visible:ring-2 peer-focus-visible:ring-red-600 peer-focus-visible:ring-offset-2";

const Card = ({ children }: { children: ReactNode }) => (
  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">{children}</div>
);

const ErrorText = ({ id, children }: { id: string; children?: string }) =>
  children ? (
    <p id={id} role="alert" className="mt-2 text-sm text-red-600">
      {children}
    </p>
  ) : null;

export default function BookingServis({ bookedSlots, onSubmit }: BookingServisProps) {
  const uid = useId();
  const id = (name: FieldKey) => `${uid}-${name}`;

  // Tanggal dihitung setelah mount. Jika dihitung saat render, HTML hasil prerender membawa tanggal SAAT BUILD.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);
  const days = useMemo(() => (now ? buildDays(now) : []), [now]);

  const [form, setForm] = useState({ nama: "", telepon: "", motor: "" });
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ url: string | null } | null>(null);

  const unavailable = (iso: string, t: string) =>
    (now !== null && isPast(iso, t, now)) || (bookedSlots?.[iso]?.includes(t) ?? false);

  const clearError = (key: FieldKey) => setErrors((prev) => ({ ...prev, [key]: undefined }));

  const setField = (key: "nama" | "telepon" | "motor") => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    clearError(key);
  };

  const pickDate = (iso: string) => {
    setDate(iso);
    if (time && unavailable(iso, time)) setTime(""); // jam yang dipilih tidak tersedia di tanggal baru
    clearError("date");
  };

  const pickTime = (t: string) => {
    setTime(t);
    clearError("time");
  };

  const reset = () => {
    setForm({ nama: "", telepon: "", motor: "" });
    setDate("");
    setTime("");
    setErrors({});
    setFormError("");
    setNow(new Date());
    setDone(null);
  };

  const handleSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const errs = validate(form, date, time);
    setErrors(errs);
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) {
      document.getElementById(id(first))?.focus();
      return;
    }

    const values: BookingServisValues = {
      nama: form.nama.trim(),
      telepon: form.telepon.trim(),
      motor: form.motor.trim(),
      date,
      time,
    };

    if (onSubmit) {
      setSending(true);
      setFormError("");
      try {
        await onSubmit(values);
        setDone({ url: null });
      } catch {
        setFormError("Gagal mengirim booking. Silakan coba lagi.");
      } finally {
        setSending(false);
      }
      return;
    }

    const tanggal = days.find((d) => d.iso === date)?.label ?? date;
    const url = waLink(buildMessage(values, tanggal));
    window.open(url, "_blank", "noopener");
    setDone({ url }); // tautan di layar sukses jadi cadangan bila pop-up diblokir
  };

  if (done) {
    return (
      <Card>
        <div className="py-6 text-center">
          <CheckCircle2 aria-hidden="true" className="mx-auto h-12 w-12 text-red-600" />
          <p className="mt-4 text-lg font-extrabold text-slate-900">Permintaan booking terkirim</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {done.url
              ? "Lanjutkan percakapan di WhatsApp agar admin dapat mengonfirmasi jadwal Anda."
              : "Admin kami akan segera mengonfirmasi jadwal Anda."}
          </p>
          {done.url && (
            <a
              href={done.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <WhatsAppIcon className="h-5 w-5" /> Buka WhatsApp
            </a>
          )}
          <div>
            <button
              type="button"
              onClick={reset}
              className="mt-4 inline-flex h-11 items-center text-sm font-semibold text-red-600 underline-offset-4 hover:underline"
            >
              Buat booking baru
            </button>
          </div>
        </div>
      </Card>
    );
  }

  const selectedDay = days.find((d) => d.iso === date);

  return (
    <Card>
      <h3 className="text-xl font-extrabold tracking-tight text-slate-900">Booking Servis</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">
        Pilih jadwal, datang sesuai jam, langsung dikerjakan tanpa antre.
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-5">
        <div>
          <label htmlFor={id("nama")} className="mb-2 block text-sm font-medium text-slate-700">
            Nama Lengkap
          </label>
          <input
            id={id("nama")}
            type="text"
            autoComplete="name"
            placeholder="Contoh: Budi Santoso"
            value={form.nama}
            onChange={setField("nama")}
            aria-invalid={errors.nama ? true : undefined}
            aria-describedby={errors.nama ? `${id("nama")}-error` : undefined}
            className={inputCls(!!errors.nama)}
          />
          <ErrorText id={`${id("nama")}-error`}>{errors.nama}</ErrorText>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor={id("telepon")} className="mb-2 block text-sm font-medium text-slate-700">
              Nomor HP / WhatsApp
            </label>
            <input
              id={id("telepon")}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Contoh: 081234567890"
              value={form.telepon}
              onChange={setField("telepon")}
              aria-invalid={errors.telepon ? true : undefined}
              aria-describedby={errors.telepon ? `${id("telepon")}-error` : undefined}
              className={inputCls(!!errors.telepon)}
            />
            <ErrorText id={`${id("telepon")}-error`}>{errors.telepon}</ErrorText>
          </div>
          <div>
            <label htmlFor={id("motor")} className="mb-2 block text-sm font-medium text-slate-700">
              Jenis Motor
            </label>
            <input
              id={id("motor")}
              type="text"
              placeholder="Contoh: Honda Vario 150"
              value={form.motor}
              onChange={setField("motor")}
              aria-invalid={errors.motor ? true : undefined}
              aria-describedby={errors.motor ? `${id("motor")}-error` : undefined}
              className={inputCls(!!errors.motor)}
            />
            <ErrorText id={`${id("motor")}-error`}>{errors.motor}</ErrorText>
          </div>
        </div>

        {/* Tanggal: kartu yang bisa digeser di mobile. Tiap kartu adalah radio (navigasi panah bawaan browser). */}
        <fieldset id={id("date")} tabIndex={-1} className="min-w-0 outline-none">
          <legend className="mb-2 text-sm font-medium text-slate-700">Pilih Tanggal</legend>
          {days.length === 0 ? (
            <div aria-hidden="true" className="-mx-1 flex gap-2 p-1">
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="h-[4.5rem] min-w-[4.5rem] animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="-mx-1 flex snap-x gap-2 overflow-x-auto p-1 pb-2">
              {days.map((d) => (
                <label key={d.iso} className="snap-start">
                  <input
                    type="radio"
                    name={`${uid}-date`}
                    value={d.iso}
                    checked={date === d.iso}
                    onChange={() => pickDate(d.iso)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex h-[4.5rem] min-w-[4.5rem] cursor-pointer select-none flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-700 transition hover:border-red-600 peer-checked:border-red-600 peer-checked:bg-red-600 peer-checked:text-white ${FOCUS_RING}`}
                  >
                    <span className="text-xs font-medium">{d.weekday}</span>
                    <span className="text-xl font-extrabold leading-tight">{d.day}</span>
                    <span className="text-xs font-medium">{d.month}</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <ErrorText id={`${id("date")}-error`}>{errors.date}</ErrorText>
        </fieldset>

        {/* Jam: nonaktif sampai tanggal dipilih, juga untuk slot yang sudah lewat / terisi */}
        <fieldset id={id("time")} tabIndex={-1} className="min-w-0 outline-none">
          <legend className="mb-2 text-sm font-medium text-slate-700">Pilih Jam</legend>
          <div className="grid grid-cols-3 gap-2 p-1">
            {JAM_SLOT.map((t) => {
              const off = !date || unavailable(date, t);
              return (
                <label key={t}>
                  <input
                    type="radio"
                    name={`${uid}-time`}
                    value={t}
                    checked={time === t}
                    disabled={off}
                    onChange={() => pickTime(t)}
                    className="peer sr-only"
                  />
                  <span
                    className={`flex h-11 select-none items-center justify-center rounded-xl border text-sm font-semibold tabular-nums transition ${FOCUS_RING} ${
                      off
                        ? `cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300 ${date ? "line-through" : ""}`
                        : "cursor-pointer border-slate-200 bg-white text-slate-700 hover:border-red-600 peer-checked:border-red-600 peer-checked:bg-red-600 peer-checked:text-white"
                    }`}
                  >
                    {t}
                  </span>
                </label>
              );
            })}
          </div>
          {!date && <p className="mt-1 text-sm text-slate-500">Pilih tanggal dulu untuk melihat jam yang tersedia.</p>}
          <ErrorText id={`${id("time")}-error`}>{errors.time}</ErrorText>
        </fieldset>

        {/* Ringkasan jadwal terpilih */}
        <p role="status" className="min-h-5 text-sm text-slate-600">
          {selectedDay && time && (
            <>
              Jadwal dipilih:{" "}
              <strong className="font-semibold text-slate-900">
                {selectedDay.label} · {time} WIB
              </strong>
            </>
          )}
        </p>

        {formError && (
          <p role="alert" className="text-sm text-red-600">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {sending ? (
            "Mengirim..."
          ) : onSubmit ? (
            "Konfirmasi Booking"
          ) : (
            <>
              <WhatsAppIcon className="h-5 w-5" /> Booking via WhatsApp
            </>
          )}
        </button>
      </form>
    </Card>
  );
}

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Controller, useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { CheckCircle2 } from "lucide-react";
import { useCreateBooking } from "../queries/bookings";
import { useServices } from "../queries/services";
import { bookingSchema, type BookingFormValues } from "../schemas/booking";
import { todayISO } from "../utils/date";
import { getErrorMessage } from "../utils/errors";
import { buildBookingMessage, waLink } from "../utils/whatsapp";
import CustomSelect, { type SelectOption } from "./CustomSelect";
import WhatsAppIcon from "./WhatsAppIcon";

const JAM = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

// id kontrol per field: dipakai <label htmlFor>, aria-describedby, dan fokus ke field galat pertama
const FIELD_IDS: Record<keyof BookingFormValues, string> = {
  user_name: "bk-nama",
  phone: "bk-telepon",
  motor: "bk-motor",
  date: "bk-tanggal",
  time: "bk-jam",
  service_id: "bk-layanan",
};
// Urutan tampil di layar (untuk menentukan field galat pertama)
const FIELD_ORDER: Array<keyof BookingFormValues> = ["user_name", "phone", "motor", "date", "time", "service_id"];

// Warna sama dengan CustomSelect (warna border ditambahkan terpisah agar bisa berubah saat galat).
// Teks ketikan putih (~17:1 di atas #151a2a), placeholder slate-400 (~6:1) agar tetap terbedakan dari isian.
// text-base di mobile (16px) agar iOS tidak zoom saat input difokus.
const INPUT_BASE =
  "w-full rounded-xl border bg-[#151a2a] px-4 py-3.5 text-base text-white placeholder:text-slate-400 outline-none transition [color-scheme:dark] focus:border-red-500 focus:ring-1 focus:ring-red-500 sm:text-sm";
const inputCls = (invalid: boolean): string => `${INPUT_BASE} ${invalid ? "border-red-500" : "border-slate-700"}`;

interface FieldProps {
  id: string;
  label: string;
  /** Hanya untuk <input>. CustomSelect menampilkan pesan galatnya sendiri. */
  error?: string;
  children: ReactNode;
}

// <label htmlFor> mengarah ke id kontrol; CustomSelect berada di luar <label> agar klik pada
// daftar pilihan tidak ikut memicu aktivasi label.
const Field = ({ id, label, error, children }: FieldProps) => (
  <div>
    <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-300">
      {label}
    </label>
    {children}
    {error && (
      <p id={`${id}-error`} role="alert" className="mt-2 text-sm text-red-400">
        {error}
      </p>
    )}
  </div>
);

const DEFAULT_VALUES: BookingFormValues = {
  user_name: "",
  phone: "",
  motor: "",
  date: "",
  time: "",
  service_id: "",
};

export default function BookingForm() {
  const { services, loading: servicesLoading, error: servicesError, refetch: refetchServices } = useServices();
  const { mutateAsync: submitBooking } = useCreateBooking();
  const [waUrl, setWaUrl] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: DEFAULT_VALUES,
    shouldFocusError: false, // fokus ditangani onInvalid agar juga menjangkau CustomSelect
  });

  const serviceOptions = useMemo<SelectOption[]>(
    () => services.map((s) => ({ value: s.id, label: s.name })),
    [services]
  );
  // Tanggal hari ini dihitung setelah mount. Jika dihitung saat render, HTML hasil prerender akan
  // membawa tanggal SAAT BUILD, dan React tidak memperbaiki mismatch atribut saat hydration.
  const [today, setToday] = useState<string | undefined>(undefined);
  useEffect(() => {
    setToday(todayISO());
  }, []);

  const onInvalid = (errs: FieldErrors<BookingFormValues>) => {
    const first = FIELD_ORDER.find((key) => errs[key]);
    if (first) document.getElementById(FIELD_IDS[first])?.focus();
  };

  const onSubmit = async (values: BookingFormValues) => {
    try {
      await submitBooking(values);
    } catch (err) {
      toast.error(getErrorMessage(err, "Gagal mengirim booking. Silakan coba lagi."));
      return;
    }

    const serviceName = services.find((s) => s.id === values.service_id)?.name ?? "-";
    const url = waLink(
      buildBookingMessage({
        name: values.user_name,
        phone: values.phone,
        motor: values.motor,
        date: values.date,
        time: values.time,
        service: serviceName,
      })
    );

    setWaUrl(url);
    reset(DEFAULT_VALUES);
    toast.success("Booking berhasil dikirim!");
    // Dibuka setelah proses async, jadi sebagian browser (mis. Safari iOS) bisa memblokirnya:
    // karena itu layar sukses di bawah juga menyediakan tombol WhatsApp sebagai jalur cadangan.
    window.open(url, "_blank", "noopener");
  };

  if (waUrl) {
    return (
      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
        <p className="mt-4 text-lg font-extrabold">Permintaan booking terkirim</p>
        <p className="mt-2 text-sm text-slate-400">
          Lanjutkan percakapan di WhatsApp, admin kami akan mengonfirmasi jadwal Anda.
        </p>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-6 text-sm font-semibold text-white transition hover:bg-green-700"
        >
          <WhatsAppIcon className="h-5 w-5" /> Buka WhatsApp
        </a>
        <div>
          <button
            type="button"
            onClick={() => setWaUrl(null)}
            className="mt-4 text-sm font-semibold text-red-500 underline-offset-4 hover:underline"
          >
            Buat booking baru
          </button>
        </div>
      </div>
    );
  }

  const serviceError = errors.service_id?.message;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} noValidate className="mt-10 space-y-4">
      <Field id={FIELD_IDS.user_name} label="Nama Lengkap" error={errors.user_name?.message}>
        <input
          id={FIELD_IDS.user_name}
          type="text"
          autoComplete="name"
          placeholder="Contoh: Budi Santoso"
          aria-invalid={errors.user_name ? true : undefined}
          aria-describedby={errors.user_name ? `${FIELD_IDS.user_name}-error` : undefined}
          className={inputCls(!!errors.user_name)}
          {...register("user_name")}
        />
      </Field>

      <Field id={FIELD_IDS.phone} label="Nomor Telepon / WhatsApp" error={errors.phone?.message}>
        <input
          id={FIELD_IDS.phone}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="Contoh: 081234567890"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? `${FIELD_IDS.phone}-error` : undefined}
          className={inputCls(!!errors.phone)}
          {...register("phone")}
        />
      </Field>

      <Field id={FIELD_IDS.motor} label="Tipe Motor" error={errors.motor?.message}>
        <input
          id={FIELD_IDS.motor}
          type="text"
          placeholder="Contoh: Honda Vario 150 (2021)"
          aria-invalid={errors.motor ? true : undefined}
          aria-describedby={errors.motor ? `${FIELD_IDS.motor}-error` : undefined}
          className={inputCls(!!errors.motor)}
          {...register("motor")}
        />
      </Field>

      {/* Desktop: Tanggal dan Pilih Jam bersebelahan. Mobile: bertumpuk. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field id={FIELD_IDS.date} label="Tanggal" error={errors.date?.message}>
          <input
            id={FIELD_IDS.date}
            type="date"
            min={today}
            aria-invalid={errors.date ? true : undefined}
            aria-describedby={errors.date ? `${FIELD_IDS.date}-error` : undefined}
            className={inputCls(!!errors.date)}
            {...register("date")}
          />
        </Field>
        <Field id={FIELD_IDS.time} label="Pilih Jam">
          <Controller
            control={control}
            name="time"
            render={({ field }) => (
              <CustomSelect
                id={FIELD_IDS.time}
                value={field.value}
                onChange={field.onChange}
                options={JAM}
                placeholder="Pilih jam"
                error={errors.time?.message}
              />
            )}
          />
        </Field>
      </div>

      <Field id={FIELD_IDS.service_id} label="Jenis Layanan">
        <Controller
          control={control}
          name="service_id"
          render={({ field }) => (
            <CustomSelect
              id={FIELD_IDS.service_id}
              value={field.value}
              onChange={field.onChange}
              options={serviceOptions}
              placeholder={
                servicesLoading ? "Memuat layanan..." : servicesError ? "Layanan tidak tersedia" : "Pilih layanan"
              }
              error={serviceError}
            />
          )}
        />
        {servicesError && (
          <p role="alert" className="mt-2 text-sm text-red-400">
            {servicesError}{" "}
            <button
              type="button"
              onClick={refetchServices}
              className="font-semibold underline underline-offset-4 hover:text-red-300"
            >
              Coba lagi
            </button>
          </p>
        )}
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-red-600 px-6 py-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Mengirim..." : "Konfirmasi Jadwal"}
      </button>
    </form>
  );
}

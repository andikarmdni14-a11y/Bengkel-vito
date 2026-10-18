import { describe, expect, it } from "vitest";
import { todayISO } from "@/utils/date";
import { bookingSchema } from "./schema";

const valid = () => ({
  user_name: "Budi Santoso",
  phone: "081234567890",
  motor: "Honda Vario 150",
  date: todayISO(),
  time: "09:00",
  service_id: "11111111-1111-4111-8111-111111111111",
});

const messages = (input: unknown): string[] => {
  const result = bookingSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.message);
};

describe("bookingSchema", () => {
  it("menerima data valid (tanggal hari ini masih boleh)", () => {
    expect(bookingSchema.safeParse(valid()).success).toBe(true);
  });

  it("memangkas spasi di awal/akhir nama", () => {
    const result = bookingSchema.safeParse({ ...valid(), user_name: "  Budi  " });
    expect(result.success && result.data.user_name).toBe("Budi");
  });

  it("nama kosong atau hanya spasi ditolak", () => {
    expect(messages({ ...valid(), user_name: "   " })).toContain("Nama wajib diisi.");
  });

  it("nomor telepon: hanya angka (boleh +, spasi, strip)", () => {
    expect(bookingSchema.safeParse({ ...valid(), phone: "+62 812-3456-7890" }).success).toBe(true);
    expect(messages({ ...valid(), phone: "0812abc7890" })).toContain("Nomor telepon hanya boleh berisi angka.");
  });

  it("nomor telepon: minimal 10 dan maksimal 15 digit", () => {
    expect(messages({ ...valid(), phone: "0812" })).toContain("Nomor telepon minimal 10 digit.");
    expect(messages({ ...valid(), phone: "0".repeat(16) })).toContain("Nomor telepon maksimal 15 digit.");
  });

  it("tanggal sebelum hari ini ditolak", () => {
    expect(messages({ ...valid(), date: "2000-01-01" })).toContain("Tanggal tidak boleh sebelum hari ini.");
  });

  it("tanggal, jam, dan layanan wajib dipilih", () => {
    const msgs = messages({ ...valid(), date: "", time: "", service_id: "" });
    expect(msgs).toContain("Pilih tanggal kunjungan.");
    expect(msgs).toContain("Pilih jam kunjungan.");
    expect(msgs).toContain("Pilih jenis layanan.");
  });
});

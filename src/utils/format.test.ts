import { describe, expect, it } from "vitest";
import { formatPhone, formatRupiah } from "./format";

// toLocaleString("id-ID") memakai spasi tak-pecah (NBSP) di beberapa versi ICU; samakan agar tes stabil.
const normalize = (s: string) => s.replace(/\u00a0/g, " ");

describe("formatRupiah", () => {
  it("memakai awalan Rp dan pemisah ribuan titik", () => {
    expect(normalize(formatRupiah(285000))).toBe("Rp285.000");
    expect(normalize(formatRupiah(1250000))).toBe("Rp1.250.000");
  });

  it("menangani nol dan angka kecil tanpa pemisah", () => {
    expect(normalize(formatRupiah(0))).toBe("Rp0");
    expect(normalize(formatRupiah(950))).toBe("Rp950");
  });

  it("menerima string numerik (nilai dari form / database)", () => {
    expect(normalize(formatRupiah("78000"))).toBe("Rp78.000");
  });
});

describe("formatPhone", () => {
  it("memformat nomor internasional Indonesia", () => {
    expect(formatPhone("6281234567890")).toBe("+62 812-3456-7890");
  });

  it("tetap memberi awalan + pada nomor yang terlalu pendek untuk dipecah", () => {
    expect(formatPhone("628123")).toBe("+628123");
  });
});

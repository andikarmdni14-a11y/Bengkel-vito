import { describe, expect, it } from "vitest";
import type { CartItem } from "../types";
import { buildBookingMessage, buildOrderMessage, buildWhatsAppUrl, waLink } from "./whatsapp";

const item = (over: Partial<CartItem> = {}): CartItem => ({
  id: "p1",
  name: "Oli Mesin 10W-40 1 Liter",
  price: 78000,
  stock: 30,
  image_url: null,
  qty: 2,
  ...over,
});

describe("waLink", () => {
  it("menyusun URL wa.me dengan teks ter-encode", () => {
    expect(waLink("Halo & selamat pagi", "6281234567890")).toBe(
      "https://wa.me/6281234567890?text=Halo%20%26%20selamat%20pagi"
    );
  });

  it("meng-encode baris baru sebagai %0A", () => {
    expect(waLink("a\nb", "62811")).toContain("a%0Ab");
  });
});

describe("buildOrderMessage", () => {
  it("memuat rincian item dan total", () => {
    const msg = buildOrderMessage([item()], 156000);
    expect(msg).toContain("1. Oli Mesin 10W-40 1 Liter — 2x");
    expect(msg).toMatch(/Total: Rp156\.000/);
  });

  it("tidak menyertakan item qty 0 (stok habis) dan menomori ulang sisanya", () => {
    const msg = buildOrderMessage([item({ id: "a", name: "Busi Iridium", qty: 0 }), item({ id: "b", name: "Kampas Rem" })], 156000);
    expect(msg).not.toContain("Busi Iridium");
    expect(msg).toContain("1. Kampas Rem");
  });
});

describe("buildWhatsAppUrl", () => {
  it("menghasilkan tautan wa.me berisi pesan pesanan", () => {
    const url = buildWhatsAppUrl([item()], 156000);
    expect(url.startsWith("https://wa.me/")).toBe(true);
    expect(decodeURIComponent(url)).toContain("Halo FitoMotor, saya ingin memesan:");
  });
});

describe("buildBookingMessage", () => {
  it("memuat semua field booking", () => {
    const msg = buildBookingMessage({
      name: "Budi",
      phone: "081234567890",
      motor: "Honda Beat 2020",
      date: "2026-10-20",
      time: "09:00",
      service: "Servis & Perawatan",
    });
    for (const part of ["Budi", "081234567890", "Honda Beat 2020", "2026-10-20", "09:00", "Servis & Perawatan"]) {
      expect(msg).toContain(part);
    }
  });
});

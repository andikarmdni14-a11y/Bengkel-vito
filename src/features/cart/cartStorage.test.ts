import { describe, expect, it } from "vitest";
import type { CartItem } from "@/types";
import { CART_STORAGE_KEY, isCartItem, loadCart, saveCart } from "./cartStorage";

const valid: CartItem = { id: "p1", name: "Oli", price: 78000, stock: 10, image_url: null, qty: 2 };

/** Storage palsu berbasis Map, supaya tes tidak bergantung pada localStorage global. */
const fakeStorage = (initial?: string) => {
  const map = new Map<string, string>();
  if (initial !== undefined) map.set(CART_STORAGE_KEY, initial);
  return { map, getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v) };
};

describe("isCartItem", () => {
  it("menerima item valid (image_url string atau null)", () => {
    expect(isCartItem(valid)).toBe(true);
    expect(isCartItem({ ...valid, image_url: "https://x/y.png" })).toBe(true);
  });

  it("menolak bentuk yang salah", () => {
    expect(isCartItem(null)).toBe(false);
    expect(isCartItem("p1")).toBe(false);
    expect(isCartItem({ ...valid, price: "78000" })).toBe(false);
    expect(isCartItem({ ...valid, image_url: undefined })).toBe(false);
  });
});

describe("loadCart", () => {
  it("mengembalikan [] bila belum ada data tersimpan", () => {
    expect(loadCart(fakeStorage())).toEqual([]);
  });

  it("membaca array CartItem polos (format lama tetap terbaca setelah migrasi ke Zustand)", () => {
    expect(loadCart(fakeStorage(JSON.stringify([valid])))).toEqual([valid]);
  });

  it("membuang elemen tidak valid, mempertahankan yang valid", () => {
    expect(loadCart(fakeStorage(JSON.stringify([valid, { id: 1 }, null])))).toEqual([valid]);
  });

  it("JSON rusak atau bukan array -> [] tanpa melempar galat", () => {
    expect(loadCart(fakeStorage("{rusak"))).toEqual([]);
    expect(loadCart(fakeStorage(JSON.stringify({ items: [valid] })))).toEqual([]);
  });

  it("galat saat membaca storage (mis. akses diblokir) -> []", () => {
    const blocked = {
      getItem: () => {
        throw new Error("SecurityError");
      },
    };
    expect(loadCart(blocked)).toEqual([]);
  });
});

describe("saveCart", () => {
  it("menyimpan sebagai array JSON pada kunci v2", () => {
    const s = fakeStorage();
    saveCart([valid], s);
    expect(JSON.parse(s.map.get(CART_STORAGE_KEY) ?? "null")).toEqual([valid]);
  });

  it("round-trip dengan loadCart", () => {
    const s = fakeStorage();
    saveCart([valid], s);
    expect(loadCart(s)).toEqual([valid]);
  });

  it("storage penuh / mode privat: diabaikan, tidak melempar galat", () => {
    const full = {
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
    };
    expect(() => saveCart([valid], full)).not.toThrow();
  });
});

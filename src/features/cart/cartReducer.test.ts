import { describe, expect, it } from "vitest";
import type { CartItem, CartableProduct } from "@/types";
import { cartReducer } from "./cartReducer";

const product = (over: Partial<CartableProduct> = {}): CartableProduct => ({
  id: "p1",
  name: "Oli Mesin",
  price: 78000,
  stock: 10,
  image_url: null,
  ...over,
});
const item = (over: Partial<CartItem> = {}): CartItem => ({ ...product(), qty: 1, ...over });

describe("cartReducer · ADD", () => {
  it("menambah produk baru dengan qty yang diminta", () => {
    expect(cartReducer([], { type: "ADD", product: product(), qty: 3 })).toEqual([item({ qty: 3 })]);
  });

  it("membatasi qty awal sesuai stok", () => {
    const [added] = cartReducer([], { type: "ADD", product: product({ stock: 2 }), qty: 5 });
    expect(added?.qty).toBe(2);
  });

  it("mengabaikan produk dengan stok habis (referensi array tidak berubah)", () => {
    const items = [item()];
    expect(cartReducer(items, { type: "ADD", product: product({ id: "p2", stock: 0 }), qty: 1 })).toBe(items);
  });

  it("menjumlahkan qty bila produk sudah ada, dibatasi stok terbaru", () => {
    const next = cartReducer([item({ qty: 4 })], { type: "ADD", product: product({ stock: 5 }), qty: 3 });
    expect(next).toHaveLength(1);
    expect(next[0]?.qty).toBe(5);
  });

  it("menyegarkan harga/stok/nama item lama dengan data produk terbaru", () => {
    const next = cartReducer([item({ price: 70000, stock: 3 })], {
      type: "ADD",
      product: product({ price: 80000, stock: 9, name: "Oli Mesin 1L" }),
      qty: 1,
    });
    expect(next[0]).toMatchObject({ price: 80000, stock: 9, name: "Oli Mesin 1L", qty: 2 });
  });
});

describe("cartReducer · SET_QTY", () => {
  it("mengubah qty", () => {
    expect(cartReducer([item()], { type: "SET_QTY", id: "p1", qty: 4 })[0]?.qty).toBe(4);
  });

  it("membatasi qty antara 0 dan stok", () => {
    expect(cartReducer([item({ stock: 3 })], { type: "SET_QTY", id: "p1", qty: 99 })[0]?.qty).toBe(3);
    expect(cartReducer([item()], { type: "SET_QTY", id: "p1", qty: -5 })[0]?.qty).toBe(0);
  });

  it("qty 0 TIDAK menghapus item (ditandai Stok habis di UI)", () => {
    const next = cartReducer([item()], { type: "SET_QTY", id: "p1", qty: 0 });
    expect(next).toHaveLength(1);
    expect(next[0]?.qty).toBe(0);
  });
});

describe("cartReducer · REMOVE / CLEAR / LOAD", () => {
  it("REMOVE menghapus satu item", () => {
    const next = cartReducer([item({ id: "a" }), item({ id: "b" })], { type: "REMOVE", id: "a" });
    expect(next.map((i) => i.id)).toEqual(["b"]);
  });

  it("CLEAR mengosongkan keranjang", () => {
    expect(cartReducer([item()], { type: "CLEAR" })).toEqual([]);
  });

  it("LOAD mengganti isi dengan data tersimpan", () => {
    const saved = [item({ id: "x", qty: 2 })];
    expect(cartReducer([], { type: "LOAD", items: saved })).toBe(saved);
  });
});

describe("cartReducer · SYNC", () => {
  it("mengeluarkan barang yang sudah tidak ada di katalog", () => {
    const next = cartReducer([item({ id: "a" }), item({ id: "b" })], { type: "SYNC", products: [product({ id: "b" })] });
    expect(next.map((i) => i.id)).toEqual(["b"]);
  });

  it("membatasi qty ke stok terbaru dan memperbarui harga", () => {
    const next = cartReducer([item({ qty: 8 })], { type: "SYNC", products: [product({ stock: 3, price: 90000 })] });
    expect(next[0]).toMatchObject({ qty: 3, stock: 3, price: 90000 });
  });

  it("mengembalikan REFERENSI YANG SAMA bila tidak ada perubahan (tanpa render ulang)", () => {
    const items = [item()];
    expect(cartReducer(items, { type: "SYNC", products: [product()] })).toBe(items);
  });
});

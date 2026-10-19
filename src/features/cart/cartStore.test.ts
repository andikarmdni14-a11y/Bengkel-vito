import { beforeEach, describe, expect, it } from "vitest";
import type { CartableProduct } from "@/types";
import { selectQtyOf, selectTotalPrice, selectTotalQty, useCartStore } from "./cartStore";

const product = (over: Partial<CartableProduct> = {}): CartableProduct => ({
  id: "p1",
  name: "Oli Mesin",
  price: 78000,
  stock: 10,
  image_url: null,
  ...over,
});
const store = () => useCartStore.getState();
const ids = () => store().items.map((i) => i.id);

beforeEach(() => {
  // Store adalah singleton modul: kembalikan ke state awal antar tes (true = ganti, bukan gabung).
  useCartStore.setState(useCartStore.getInitialState(), true);
});

describe("state awal & drawer", () => {
  it("mulai kosong dan tertutup (sama dengan HTML hasil prerender)", () => {
    expect(store().items).toEqual([]);
    expect(store().isOpen).toBe(false);
  });

  it("openCart / closeCart mengubah isOpen tanpa menyentuh items", () => {
    store().addItem(product());
    const before = store().items;
    store().openCart();
    expect(store().isOpen).toBe(true);
    store().closeCart();
    expect(store().isOpen).toBe(false);
    expect(store().items).toBe(before);
  });
});

describe("addItem", () => {
  it("menambah produk baru, qty bawaan 1", () => {
    store().addItem(product());
    expect(store().items).toEqual([{ ...product(), qty: 1 }]);
  });

  it("memakai qty yang diminta, dibatasi stok", () => {
    store().addItem(product({ stock: 2 }), 5);
    expect(store().items[0]?.qty).toBe(2);
  });

  it("mengabaikan produk stok habis (tidak ada perubahan, subscriber tidak dinotifikasi)", () => {
    let notified = 0;
    const off = useCartStore.subscribe(() => void (notified += 1));
    store().addItem(product({ stock: 0 }));
    off();
    expect(store().items).toEqual([]);
    expect(notified).toBe(0);
  });

  it("produk yang sama: qty dijumlahkan, dibatasi stok terbaru", () => {
    store().addItem(product({ stock: 5 }), 4);
    store().addItem(product({ stock: 5 }), 3);
    expect(store().items).toHaveLength(1);
    expect(store().items[0]?.qty).toBe(5);
  });

  it("produk yang sama: harga/stok/nama disegarkan dengan data terbaru", () => {
    store().addItem(product({ price: 70000, stock: 3 }));
    store().addItem(product({ price: 80000, stock: 9, name: "Oli Mesin 1L" }));
    expect(store().items[0]).toEqual({ ...product({ price: 80000, stock: 9, name: "Oli Mesin 1L" }), qty: 2 });
  });
});

describe("setQty / removeItem / clearCart / hydrate", () => {
  it("setQty mengubah qty dan membatasinya antara 0 dan stok", () => {
    store().addItem(product({ stock: 3 }));
    store().setQty("p1", 2);
    expect(store().items[0]?.qty).toBe(2);
    store().setQty("p1", 99);
    expect(store().items[0]?.qty).toBe(3);
    store().setQty("p1", -5);
    expect(store().items[0]?.qty).toBe(0);
  });

  it("setQty 0 TIDAK menghapus item (ditandai Stok habis di UI)", () => {
    store().addItem(product({ id: "a" }));
    store().addItem(product({ id: "b" }));
    store().setQty("a", 0);
    expect(store().items.map((i) => [i.id, i.qty])).toEqual([
      ["a", 0],
      ["b", 1],
    ]);
  });

  it("removeItem menghapus satu item; clearCart mengosongkan", () => {
    store().addItem(product({ id: "a" }));
    store().addItem(product({ id: "b" }));
    store().removeItem("a");
    expect(ids()).toEqual(["b"]);
    store().clearCart();
    expect(store().items).toEqual([]);
  });

  it("hydrate mengisi keranjang dari data tersimpan", () => {
    store().hydrate([{ ...product(), qty: 3 }]);
    expect(store().items[0]?.qty).toBe(3);
  });
});

describe("syncProducts", () => {
  it("mengeluarkan barang yang sudah tidak ada di katalog dan mengembalikan jumlahnya", () => {
    store().addItem(product({ id: "a" }));
    store().addItem(product({ id: "b" }));
    store().addItem(product({ id: "c" }));
    expect(store().syncProducts([product({ id: "b" })])).toBe(2);
    expect(ids()).toEqual(["b"]);
  });

  it("membatasi qty ke stok terbaru dan memperbarui harga", () => {
    store().addItem(product(), 8);
    expect(store().syncProducts([product({ stock: 3, price: 90000 })])).toBe(0);
    expect(store().items[0]).toEqual({ ...product({ stock: 3, price: 90000 }), qty: 3 });
  });

  it("tanpa perubahan: referensi items TETAP dan subscriber tidak dinotifikasi (tanpa render ulang)", () => {
    store().addItem(product());
    const before = store().items;
    let notified = 0;
    const off = useCartStore.subscribe(() => void (notified += 1));
    expect(store().syncProducts([product()])).toBe(0);
    off();
    expect(store().items).toBe(before);
    expect(notified).toBe(0);
  });
});

describe("selector", () => {
  it("selectTotalQty & selectTotalPrice menjumlahkan semua item", () => {
    store().addItem(product({ id: "a", price: 10000 }), 2);
    store().addItem(product({ id: "b", price: 5000 }), 3);
    expect(selectTotalQty(store())).toBe(5);
    expect(selectTotalPrice(store())).toBe(35000);
  });

  it("selectQtyOf mengembalikan qty satu produk, 0 bila belum ada", () => {
    store().addItem(product({ id: "a" }), 4);
    expect(selectQtyOf("a")(store())).toBe(4);
    expect(selectQtyOf("zzz")(store())).toBe(0);
  });
});

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

beforeEach(() => {
  // Store adalah singleton modul: kembalikan ke state awal antar tes (true = ganti, bukan gabung).
  useCartStore.setState(useCartStore.getInitialState(), true);
});

describe("useCartStore", () => {
  it("mulai kosong dan tertutup (sama dengan HTML hasil prerender)", () => {
    const { items, isOpen } = useCartStore.getState();
    expect(items).toEqual([]);
    expect(isOpen).toBe(false);
  });

  it("addItem menambah produk, qty bawaan 1", () => {
    useCartStore.getState().addItem(product());
    expect(useCartStore.getState().items).toEqual([{ ...product(), qty: 1 }]);
  });

  it("addItem produk yang sama menambah qty, dibatasi stok", () => {
    const { addItem } = useCartStore.getState();
    addItem(product({ stock: 2 }));
    addItem(product({ stock: 2 }), 5);
    expect(useCartStore.getState().items[0]?.qty).toBe(2);
  });

  it("setQty 0 mempertahankan item; removeItem menghapusnya; clearCart mengosongkan", () => {
    const s = useCartStore.getState();
    s.addItem(product({ id: "a" }));
    s.addItem(product({ id: "b" }));
    s.setQty("a", 0);
    expect(useCartStore.getState().items.map((i) => [i.id, i.qty])).toEqual([
      ["a", 0],
      ["b", 1],
    ]);
    s.removeItem("a");
    expect(useCartStore.getState().items.map((i) => i.id)).toEqual(["b"]);
    s.clearCart();
    expect(useCartStore.getState().items).toEqual([]);
  });

  it("openCart / closeCart mengubah isOpen tanpa menyentuh items", () => {
    useCartStore.getState().addItem(product());
    const before = useCartStore.getState().items;
    useCartStore.getState().openCart();
    expect(useCartStore.getState().isOpen).toBe(true);
    useCartStore.getState().closeCart();
    expect(useCartStore.getState().isOpen).toBe(false);
    expect(useCartStore.getState().items).toBe(before);
  });

  it("hydrate mengisi keranjang dari data tersimpan", () => {
    useCartStore.getState().hydrate([{ ...product(), qty: 3 }]);
    expect(useCartStore.getState().items[0]?.qty).toBe(3);
  });

  it("syncProducts tanpa perubahan TIDAK mengganti referensi items (subscriber tidak dinotifikasi)", () => {
    useCartStore.getState().addItem(product());
    let notified = 0;
    const unsubscribe = useCartStore.subscribe(() => {
      notified += 1;
    });
    useCartStore.getState().syncProducts([product()]);
    unsubscribe();
    expect(notified).toBe(0);
  });

  it("syncProducts mengeluarkan barang yang sudah tidak ada dan memperbarui harga", () => {
    const s = useCartStore.getState();
    s.addItem(product({ id: "a" }));
    s.addItem(product({ id: "b" }));
    s.syncProducts([product({ id: "b", price: 99000 })]);
    expect(useCartStore.getState().items).toEqual([{ ...product({ id: "b", price: 99000 }), qty: 1 }]);
  });
});

describe("selector", () => {
  it("selectTotalQty & selectTotalPrice menjumlahkan semua item", () => {
    const s = useCartStore.getState();
    s.addItem(product({ id: "a", price: 10000 }), 2);
    s.addItem(product({ id: "b", price: 5000 }), 3);
    expect(selectTotalQty(useCartStore.getState())).toBe(5);
    expect(selectTotalPrice(useCartStore.getState())).toBe(35000);
  });

  it("selectQtyOf mengembalikan qty satu produk, 0 bila belum ada", () => {
    useCartStore.getState().addItem(product({ id: "a" }), 4);
    expect(selectQtyOf("a")(useCartStore.getState())).toBe(4);
    expect(selectQtyOf("zzz")(useCartStore.getState())).toBe(0);
  });
});

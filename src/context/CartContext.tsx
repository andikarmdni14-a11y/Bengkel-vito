import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import { loadFresh } from "../hooks/useAsyncResource";
import { fetchProducts } from "../lib/api";
import type { CartableProduct, CartItem } from "../types";
import { cartReducer } from "./cartReducer";

// v2: id produk kini berasal dari database (uuid), jadi keranjang lama (id "p1", ...) tidak dipakai lagi.
const STORAGE_KEY = "fitomotor:cart:v2";

export interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  totalQty: number;
  totalPrice: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: CartableProduct, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const isCartItem = (x: unknown): x is CartItem => {
  if (typeof x !== "object" || x === null) return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.name === "string" &&
    typeof o.price === "number" &&
    typeof o.stock === "number" &&
    typeof o.qty === "number" &&
    (typeof o.image_url === "string" || o.image_url === null)
  );
};

const loadCart = (): CartItem[] => {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    return Array.isArray(saved) ? saved.filter(isCartItem) : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  // Mulai kosong (sama dengan HTML hasil prerender), lalu isi dari localStorage setelah mount.
  // Membaca localStorage di initializer akan membuat render pertama klien berbeda dari HTML server
  // (badge jumlah barang) -> hydration mismatch bagi pengunjung yang keranjangnya sudah terisi.
  const [items, dispatch] = useReducer(cartReducer, []);
  const [restored, setRestored] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    dispatch({ type: "LOAD", items: loadCart() });
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return; // jangan menimpa keranjang tersimpan dengan [] sebelum sempat dibaca
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* penyimpanan penuh / mode privat: abaikan */
    }
  }, [items, restored]);

  // Harga & stok di keranjang adalah salinan saat barang ditambahkan. Karena katalog kini dinamis,
  // segarkan setiap kali keranjang dibuka (memakai cache 60 dtk, jadi hemat request).
  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (!isOpen || itemsRef.current.length === 0) return;
    let active = true;
    loadFresh("products", fetchProducts)
      .then((products) => {
        if (!active) return;
        const removed = itemsRef.current.filter((i) => !products.some((p) => p.id === i.id)).length;
        dispatch({ type: "SYNC", products });
        if (removed > 0) {
          toast(`${removed} barang sudah tidak tersedia dan dikeluarkan dari keranjang`, { id: "cart-sync" });
        }
      })
      .catch((err: unknown) => {
        // Gagal sinkron bukan kendala bagi pembeli: stok final tetap dikonfirmasi admin via WhatsApp.
        console.warn("[cart] sinkronisasi harga/stok dilewati:", err);
      });
    return () => {
      active = false;
    };
  }, [isOpen]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const addItem = useCallback(
    (product: CartableProduct, qty = 1) => dispatch({ type: "ADD", product, qty }),
    []
  );
  const setQty = useCallback((id: string, qty: number) => dispatch({ type: "SET_QTY", id, qty }), []);
  const removeItem = useCallback((id: string) => dispatch({ type: "REMOVE", id }), []);
  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isOpen,
      totalQty: items.reduce((sum, i) => sum + i.qty, 0),
      totalPrice: items.reduce((sum, i) => sum + i.qty * i.price, 0),
      openCart,
      closeCart,
      addItem,
      setQty,
      removeItem,
      clearCart,
    }),
    [items, isOpen, openCart, closeCart, addItem, setQty, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart harus dipakai di dalam <CartProvider>");
  return ctx;
}

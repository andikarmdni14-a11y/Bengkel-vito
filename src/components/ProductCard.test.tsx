import { beforeEach, describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useCartStore } from "@/features/cart/cartStore";
import type { Product } from "@/types";
import ProductCard from "./ProductCard";

const product = (over: Partial<Product> = {}): Product => ({
  id: "p1",
  name: "Oli Mesin 10W-40 1 Liter",
  category: "Suku Cadang",
  price: 78000,
  description: "",
  image_url: null,
  stock: 3,
  ...over,
});

beforeEach(() => {
  useCartStore.setState(useCartStore.getInitialState(), true);
});

describe("<ProductCard />", () => {
  it("menampilkan nama, kategori, dan harga", () => {
    render(<ProductCard product={product()} />);
    expect(screen.getByRole("heading", { name: "Oli Mesin 10W-40 1 Liter" })).toBeInTheDocument();
    expect(screen.getByText("Suku Cadang")).toBeInTheDocument();
    expect(screen.getByText(/78\.000/)).toBeInTheDocument();
  });

  it("menekan tombol tambah memasukkan produk ke keranjang dan membuka drawer", async () => {
    const user = userEvent.setup();
    render(<ProductCard product={product()} />);

    await user.click(screen.getByRole("button", { name: /Tambah Oli Mesin 10W-40 1 Liter ke keranjang/ }));

    const { items, isOpen } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "p1", qty: 1 });
    expect(isOpen).toBe(true);
  });

  it("tombol dinonaktifkan saat stok habis", () => {
    render(<ProductCard product={product({ stock: 0 })} />);
    expect(screen.getByRole("button", { name: /stok habis/i })).toBeDisabled();
  });

  it("tombol dinonaktifkan bila jumlah di keranjang sudah mencapai stok", async () => {
    useCartStore.getState().addItem({ id: "p1", name: "x", price: 78000, stock: 3, image_url: null }, 3);
    render(<ProductCard product={product({ stock: 3 })} />);
    expect(screen.getByRole("button", { name: /sudah mencapai stok/ })).toBeDisabled();
  });
});

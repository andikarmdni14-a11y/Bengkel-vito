import { describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { createQueryClient } from "./lib/queryClient";

// Halaman asli berat (data, SEO). Ganti dengan stub berjudul unik; React.lazy di App.tsx tetap mengimpornya secara dinamis.
vi.mock("@/pages/Beranda", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("h1", null, "Halaman Beranda") };
});
vi.mock("@/pages/Layanan", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("h1", null, "Halaman Layanan") };
});
vi.mock("@/pages/Katalog", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("h1", null, "Halaman Katalog") };
});
vi.mock("@/pages/Kontak", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("h1", null, "Halaman Kontak") };
});
vi.mock("@/pages/NotFound", async () => {
  const { createElement } = await import("react");
  return { default: () => createElement("h1", null, "Halaman NotFound") };
});

const renderAt = (path: string) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe("<App /> routing (halaman lazy)", () => {
  // HARUS tes pertama di berkas ini: objek React.lazy ada di level modul App.tsx dan menyimpan hasilnya,
  // jadi hanya render pertama yang melewati fase "memuat".
  it("saat chunk halaman belum selesai dimuat: skeleton tampil dan Navbar tetap ada", async () => {
    renderAt("/katalog");
    expect(screen.getByText("Memuat halaman...")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navigasi utama" })).toBeInTheDocument();
    expect(await screen.findByRole("heading", { level: 1, name: "Halaman Katalog" })).toBeInTheDocument();
    expect(screen.queryByText("Memuat halaman...")).not.toBeInTheDocument();
  });

  it.each([
    ["/", "Halaman Beranda"],
    ["/layanan", "Halaman Layanan"],
    ["/katalog", "Halaman Katalog"],
    ["/kontak", "Halaman Kontak"],
    ["/tidak-ada", "Halaman NotFound"],
  ])("%s -> %s", async (path, heading) => {
    renderAt(path);
    expect(await screen.findByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });
});

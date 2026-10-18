import { lazy, type ComponentType } from "react";
import { describe, expect, it } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App, { type AppPages } from "./App";
import { createQueryClient } from "./lib/queryClient";

const stub =
  (label: string): ComponentType =>
  () => <h1>{label}</h1>;

const pages: AppPages = {
  Beranda: stub("Halaman Beranda"),
  Layanan: stub("Halaman Layanan"),
  Katalog: stub("Halaman Katalog"),
  Kontak: stub("Halaman Kontak"),
  NotFound: stub("Halaman NotFound"),
};

const renderAt = (path: string, override: Partial<AppPages> = {}) =>
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter initialEntries={[path]}>
        <App pages={{ ...pages, ...override }} />
      </MemoryRouter>
    </QueryClientProvider>
  );

describe("<App /> routing", () => {
  it.each([
    ["/", "Halaman Beranda"],
    ["/layanan", "Halaman Layanan"],
    ["/katalog", "Halaman Katalog"],
    ["/kontak", "Halaman Kontak"],
    ["/tidak-ada", "Halaman NotFound"],
  ])("%s -> %s", (path, heading) => {
    renderAt(path);
    expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument();
  });

  it("halaman lazy yang belum selesai dimuat menampilkan skeleton, Navbar tetap ada", () => {
    const Pending = lazy(() => new Promise<{ default: ComponentType }>(() => undefined)); // tidak pernah resolve
    renderAt("/katalog", { Katalog: Pending });

    expect(screen.getByText("Memuat halaman...")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navigasi utama" })).toBeInTheDocument();
  });

  it("halaman lazy tampil setelah chunk selesai dimuat", async () => {
    const Loaded = lazy(() => Promise.resolve({ default: stub("Halaman Katalog Lazy") }));
    renderAt("/katalog", { Katalog: Loaded });

    expect(await screen.findByRole("heading", { level: 1, name: "Halaman Katalog Lazy" })).toBeInTheDocument();
  });
});


import { lazy } from "react";
import type { AppPages } from "../App";
import { normalizePath } from "../utils/path";

/**
 * Halaman untuk BROWSER: tiap halaman menjadi chunk terpisah yang diunduh saat dibutuhkan.
 * (Versi server: pages/eager.ts. Alasannya dijelaskan di src/App.tsx.)
 */
const loadBeranda = () => import("./Beranda");
const loadLayanan = () => import("./Layanan");
const loadKatalog = () => import("./Katalog");
const loadKontak = () => import("./Kontak");
const loadNotFound = () => import("./NotFound");

export const lazyPages: AppPages = {
  Beranda: lazy(loadBeranda),
  Layanan: lazy(loadLayanan),
  Katalog: lazy(loadKatalog),
  Kontak: lazy(loadKontak),
  NotFound: lazy(loadNotFound),
};

const ROUTE_LOADERS = new Map<string, () => Promise<unknown>>([
  ["/", loadBeranda],
  ["/layanan", loadLayanan],
  ["/katalog", loadKatalog],
  ["/kontak", loadKontak],
]);

/**
 * Unduh chunk halaman untuk sebuah alamat. Dipakai sebelum hydrate (main.tsx) supaya markup prerender langsung
 * dihidupkan tanpa menunggu chunk-nya; bisa juga dipakai untuk prefetch saat hover tautan.
 * Alamat yang tidak dikenal -> chunk NotFound, sama seperti route "*".
 */
export function preloadRoute(pathname: string): Promise<unknown> {
  return (ROUTE_LOADERS.get(normalizePath(pathname)) ?? loadNotFound)();
}

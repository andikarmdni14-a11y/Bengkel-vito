import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import { createQueryClient } from "./lib/queryClient";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Elemen #root tidak ditemukan di index.html");

// Satu QueryClient untuk seluruh sesi browser (di server dibuat per render, lihat entry-server.tsx).
const queryClient = createQueryClient();

// Devtools hanya di mode dev dan dimuat lazy: tidak masuk bundel produksi, dan tidak ikut markup hydration.
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() => import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtools })))
  : null;

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CartProvider>
            <App />
          </CartProvider>
        </BrowserRouter>
        {ReactQueryDevtools && (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        )}
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>
);

// Halaman hasil prerender (scripts/prerender.mjs) membawa markup di dalam #root plus atribut
// data-prerender-path berisi alamat yang dirender. Hydrate HANYA bila markup itu memang untuk URL
// yang sedang dibuka. Selain itu (mis. alamat tak dikenal yang dilayani index.html oleh fallback SPA)
// render dari nol supaya tidak terjadi hydration mismatch.
const normalize = (path: string) => (path.length > 1 ? path.replace(/\/+$/, "") : path);
const prerenderedPath = rootElement.dataset.prerenderPath;

if (rootElement.hasChildNodes() && prerenderedPath === normalize(window.location.pathname)) {
  ReactDOM.hydrateRoot(rootElement, app);
} else {
  ReactDOM.createRoot(rootElement).render(app);
}

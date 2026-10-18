import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CartProvider } from "./context/CartContext";
import "./index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Elemen #root tidak ditemukan di index.html");

const app = (
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
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

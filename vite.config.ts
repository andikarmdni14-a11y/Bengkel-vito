/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Alias "@/..." -> "src/...". Harus sejalan dengan "paths" di tsconfig.json.
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: { port: 5173, open: true },
  ssr: {
    // react-helmet-async hanya dikirim sebagai CommonJS untuk Node, sehingga `import { Helmet }` gagal
    // saat prerender. Dengan noExternal, Vite ikut membundelnya (memakai build ESM-nya).
    noExternal: ["react-helmet-async"],
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // e2e/ dijalankan Playwright, bukan Vitest.
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    css: false,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**", "src/main.tsx", "src/entry-server.tsx", "src/vite-env.d.ts"],
    },
  },
});

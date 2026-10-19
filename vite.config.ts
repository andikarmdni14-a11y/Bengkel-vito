/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { checkSupabaseConfig } from "./src/lib/supabaseConfig";

/** Gagalkan `vite build` bila kunci rahasia Supabase terlanjur masuk env (variabel VITE_* ditanam ke bundel publik). */
function assertNoSecretKeyInBundle(mode: string): void {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const check = checkSupabaseConfig(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  if (!check.ok && check.reason === "secret_key") {
    throw new Error(`\n[keamanan] Build dibatalkan. ${check.message}\n`);
  }
}

export default defineConfig(({ command, mode }) => {
  if (command === "build") assertNoSecretKeyInBundle(mode);

  return {
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
  };
});

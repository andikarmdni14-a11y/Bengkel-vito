import { defineConfig, devices } from "@playwright/test";

const PORT = 5174;

/**
 * E2E (opsional). Jalankan: `npx playwright install chromium` sekali, lalu `npm run test:e2e`.
 * Supabase di-mock di level jaringan (lihat e2e/booking.spec.ts), jadi tes tidak menyentuh database asli
 * dan tidak butuh .env.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // Aplikasi mobile-first: alur booking juga diuji di viewport HP.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx vite --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    env: {
      BROWSER: "none", // jangan buka tab browser (server.open di vite.config.ts)
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_ANON_KEY: "e2e-anon-key",
    },
  },
});

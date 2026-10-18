import { expect, test, type Page, type Route } from "@playwright/test";

const SERVICE_ID = "11111111-1111-4111-8111-111111111111";

// Bentuk baris tabel `services` seperti yang dikembalikan PostgREST.
const SERVICES = [
  {
    id: SERVICE_ID,
    name: "Servis & Perawatan",
    price: 50000,
    duration: 60,
    description: "Servis rutin dan tune-up.",
    icon: "wrench",
    details: ["Servis rutin & tune-up"],
    sort_order: 1,
  },
];

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "*",
  "access-control-allow-methods": "*",
};

/** Balas preflight CORS (supabase-js mengirim header apikey/authorization), lalu jalankan handler. */
const withCors =
  (handler: (route: Route) => Promise<void>) =>
  async (route: Route): Promise<void> => {
    if (route.request().method() === "OPTIONS") {
      await route.fulfill({ status: 204, headers: CORS });
      return;
    }
    await handler(route);
  };

const isoDaysFromNow = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-CA");
};

async function mockServices(page: Page, status = 200) {
  await page.route(
    "**/rest/v1/services*",
    withCors((route) =>
      route.fulfill({
        status,
        headers: CORS,
        contentType: "application/json",
        body: JSON.stringify(status === 200 ? SERVICES : { message: "boom" }),
      })
    )
  );
}

test.beforeEach(async ({ page }) => {
  // Setelah sukses, aplikasi memanggil window.open(WhatsApp): cegah tab baru selama tes.
  await page.addInitScript(() => {
    window.open = () => null;
  });
});

test("booking berhasil: isi form, kirim ke Supabase, tampil layar sukses", async ({ page }) => {
  await mockServices(page);

  let payload: Record<string, unknown> | null = null;
  await page.route(
    "**/rest/v1/bookings*",
    withCors(async (route) => {
      payload = route.request().postDataJSON() as Record<string, unknown>;
      await route.fulfill({ status: 201, headers: CORS, body: "" });
    })
  );

  await page.goto("/kontak#booking");

  await page.getByLabel("Nama Lengkap").fill("Budi Santoso");
  await page.getByLabel("Nomor Telepon / WhatsApp").fill("081234567890");
  await page.getByLabel("Tipe Motor").fill("Honda Vario 150");
  await page.getByLabel("Tanggal", { exact: true }).fill(isoDaysFromNow(3));

  // CustomSelect = combobox kustom (bukan <select>): buka, lalu pilih opsi.
  await page.locator("#bk-jam").click();
  await page.getByRole("option", { name: "09:00" }).click();
  await page.locator("#bk-layanan").click();
  await page.getByRole("option", { name: "Servis & Perawatan" }).click();

  await page.getByRole("button", { name: "Konfirmasi Jadwal" }).click();

  await expect(page.getByText("Permintaan booking terkirim")).toBeVisible();
  expect(payload).toMatchObject({
    user_name: "Budi Santoso",
    phone: "081234567890",
    motor: "Honda Vario 150",
    time: "09:00",
    service_id: SERVICE_ID,
  });
});

test("validasi: form kosong menampilkan galat dan memindahkan fokus ke field pertama", async ({ page }) => {
  await mockServices(page);
  let bookingRequests = 0;
  await page.route(
    "**/rest/v1/bookings*",
    withCors(async (route) => {
      bookingRequests += 1;
      await route.fulfill({ status: 201, headers: CORS, body: "" });
    })
  );

  await page.goto("/kontak#booking");
  await page.getByRole("button", { name: "Konfirmasi Jadwal" }).click();

  await expect(page.getByText("Nama wajib diisi.")).toBeVisible();
  await expect(page.getByLabel("Nama Lengkap")).toBeFocused();
  expect(bookingRequests).toBe(0); // tidak ada request ke database bila form tidak valid
});

test("galat server saat menyimpan: pengguna diberi tahu dan form tetap ada", async ({ page }) => {
  await mockServices(page);
  await page.route(
    "**/rest/v1/bookings*",
    withCors((route) =>
      route.fulfill({ status: 500, headers: CORS, contentType: "application/json", body: JSON.stringify({ message: "boom" }) })
    )
  );

  await page.goto("/kontak#booking");
  await page.getByLabel("Nama Lengkap").fill("Budi Santoso");
  await page.getByLabel("Nomor Telepon / WhatsApp").fill("081234567890");
  await page.getByLabel("Tipe Motor").fill("Honda Vario 150");
  await page.getByLabel("Tanggal", { exact: true }).fill(isoDaysFromNow(3));
  await page.locator("#bk-jam").click();
  await page.getByRole("option", { name: "09:00" }).click();
  await page.locator("#bk-layanan").click();
  await page.getByRole("option", { name: "Servis & Perawatan" }).click();
  await page.getByRole("button", { name: "Konfirmasi Jadwal" }).click();

  await expect(page.getByText(/Gagal menyimpan booking/)).toBeVisible();
  await expect(page.getByRole("button", { name: "Konfirmasi Jadwal" })).toBeVisible();
});

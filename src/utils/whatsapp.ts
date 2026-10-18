import { SITE } from "../data/site";
import type { BookingMessageInput, CartItem } from "../types";
import { formatRupiah } from "./format";

export const waLink = (text: string, number: string = SITE.waNumber): string =>
  `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

/** Ubah isi keranjang menjadi teks pesanan yang rapi. */
export function buildOrderMessage(items: readonly CartItem[], totalPrice: number): string {
  const lines = items
    .filter((i) => i.qty > 0) // item "Stok habis" (qty 0) tidak ikut dipesan
    .map(
      (i, idx) =>
        `${idx + 1}. ${i.name} — ${i.qty}x ${formatRupiah(i.price)} = ${formatRupiah(i.qty * i.price)}`
    );

  return [
    "Halo FitoMotor, saya ingin memesan:",
    "",
    ...lines,
    "",
    `Total: ${formatRupiah(totalPrice)}`,
    "",
    "Mohon konfirmasi ketersediaan dan cara pembayarannya. Terima kasih.",
  ].join("\n");
}

/** URL wa.me siap pakai untuk tombol "Beli via WhatsApp". */
export const buildWhatsAppUrl = (items: readonly CartItem[], totalPrice: number): string =>
  waLink(buildOrderMessage(items, totalPrice));

export const buildBookingMessage = (f: BookingMessageInput): string =>
  `Halo FitoMotor, saya ingin booking servis.\n\n` +
  `Nama: ${f.name}\nNo. telepon: ${f.phone}\nTipe motor: ${f.motor}\nTanggal: ${f.date}\n` +
  `Jam: ${f.time}\nLayanan: ${f.service}`;

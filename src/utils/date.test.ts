import { afterEach, describe, expect, it, vi } from "vitest";
import { todayISO } from "./date";

describe("todayISO", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("mengembalikan format YYYY-MM-DD", () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("memakai tanggal LOKAL perangkat, bukan UTC (23:30 lokal tetap hari yang sama)", () => {
    vi.useFakeTimers();
    // Konstruktor Date(y, m, d, h, mi) = waktu lokal, jadi hasilnya sama di zona waktu mana pun.
    vi.setSystemTime(new Date(2026, 9, 18, 23, 30));
    expect(todayISO()).toBe("2026-10-18");
  });

  it("memberi nol di depan untuk bulan dan hari satu digit", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 5, 8, 0));
    expect(todayISO()).toBe("2026-01-05");
  });
});

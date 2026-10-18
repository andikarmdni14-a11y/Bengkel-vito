import { describe, expect, it } from "vitest";
import { deriveQueryState } from "./useQueryStatus";

const base = { data: undefined, isPending: false, isFetching: false, isError: false, error: null };
const MSG = "cadangan";

describe("deriveQueryState", () => {
  it("fetch pertama (belum ada data): loading, tanpa galat", () => {
    expect(deriveQueryState({ ...base, isPending: true, isFetching: true }, MSG)).toEqual({ loading: true, error: null });
  });

  it("offline / query paused tanpa data: tetap loading (skeleton), bukan daftar kosong", () => {
    expect(deriveQueryState({ ...base, isPending: true, isFetching: false }, MSG)).toEqual({ loading: true, error: null });
  });

  it("gagal final tanpa data: tampilkan pesan galat, tidak loading", () => {
    const state = deriveQueryState({ ...base, isError: true, error: new Error("Gagal memuat katalog") }, MSG);
    expect(state).toEqual({ loading: false, error: "Gagal memuat katalog" });
  });

  it("memakai pesan cadangan bila galat bukan Error", () => {
    expect(deriveQueryState({ ...base, isError: true, error: "boom" }, MSG).error).toBe(MSG);
  });

  it("'Coba lagi' sedang berjalan setelah gagal: kembali ke loading dan galat hilang", () => {
    const state = deriveQueryState({ ...base, isError: true, isFetching: true, error: new Error("x") }, MSG);
    expect(state).toEqual({ loading: true, error: null });
  });

  it("ada data lalu refetch latar gagal: data tetap tampil, tanpa galat dan tanpa skeleton", () => {
    const state = deriveQueryState({ ...base, data: [1], isError: true, error: new Error("x") }, MSG);
    expect(state).toEqual({ loading: false, error: null });
  });

  it("ada data dan refetch latar berjalan: tidak mengganti isi layar dengan skeleton", () => {
    expect(deriveQueryState({ ...base, data: [1], isFetching: true }, MSG)).toEqual({ loading: false, error: null });
  });
});

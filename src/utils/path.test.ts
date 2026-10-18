import { describe, expect, it } from "vitest";
import { normalizePath } from "./path";

describe("normalizePath", () => {
  it("membuang garis miring di akhir", () => {
    expect(normalizePath("/katalog/")).toBe("/katalog");
    expect(normalizePath("/kontak///")).toBe("/kontak");
  });

  it("membiarkan root dan alamat tanpa garis miring akhir", () => {
    expect(normalizePath("/")).toBe("/");
    expect(normalizePath("/layanan")).toBe("/layanan");
  });
});

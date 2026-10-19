import { describe, expect, it } from "vitest";
import { isUserFacingDbError } from "./dbErrors";

describe("isUserFacingDbError", () => {
  it("true untuk galat raise exception (P0001) berpesan", () => {
    expect(isUserFacingDbError({ code: "P0001", message: "Terlalu banyak booking." })).toBe(true);
  });

  it("false untuk kode lain (mis. pelanggaran RLS 42501) atau tanpa pesan", () => {
    expect(isUserFacingDbError({ code: "42501", message: "new row violates row-level security policy" })).toBe(false);
    expect(isUserFacingDbError({ code: "P0001", message: "" })).toBe(false);
  });

  it("false untuk nilai bukan objek", () => {
    expect(isUserFacingDbError(null)).toBe(false);
    expect(isUserFacingDbError("P0001")).toBe(false);
  });
});

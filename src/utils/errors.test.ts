import { describe, expect, it } from "vitest";
import { getErrorMessage } from "./errors";

describe("getErrorMessage", () => {
  it("memakai pesan dari Error", () => {
    expect(getErrorMessage(new Error("Koneksi putus"), "cadangan")).toBe("Koneksi putus");
  });

  it("memakai fallback bila Error tidak punya pesan", () => {
    expect(getErrorMessage(new Error(""), "cadangan")).toBe("cadangan");
  });

  it("memakai fallback untuk nilai non-Error (string, null, objek biasa)", () => {
    expect(getErrorMessage("boom", "cadangan")).toBe("cadangan");
    expect(getErrorMessage(null, "cadangan")).toBe("cadangan");
    expect(getErrorMessage({ message: "x" }, "cadangan")).toBe("cadangan");
  });
});

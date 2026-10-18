import { describe, expect, it } from "vitest";
import { stagger } from "./motion";

describe("stagger", () => {
  it("mengalikan indeks dengan langkah (default 90 ms)", () => {
    expect(stagger(0)).toBe(0);
    expect(stagger(2)).toBe(180);
  });

  it("dibatasi cap agar item di bawah tidak menunggu lama", () => {
    expect(stagger(5)).toBe(450);
    expect(stagger(50)).toBe(450);
  });

  it("menghormati langkah dan cap khusus", () => {
    expect(stagger(10, 60, 3)).toBe(180);
  });
});

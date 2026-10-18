import { describe, expect, it } from "vitest";
import { MAX_RETRIES, retryDelay, shouldRetry } from "./queryClient";
import { SupabaseConfigError } from "./supabase";

describe("shouldRetry", () => {
  it("mengulang galat biasa sampai batas MAX_RETRIES", () => {
    const err = new Error("jaringan putus");
    expect(shouldRetry(0, err)).toBe(true);
    expect(shouldRetry(MAX_RETRIES - 1, err)).toBe(true);
    expect(shouldRetry(MAX_RETRIES, err)).toBe(false);
  });

  it("tidak pernah mengulang SupabaseConfigError (env belum diisi, hasilnya pasti sama)", () => {
    expect(shouldRetry(0, new SupabaseConfigError())).toBe(false);
  });
});

describe("retryDelay", () => {
  it("backoff eksponensial 1 dtk, 2 dtk, 4 dtk", () => {
    expect([0, 1, 2].map(retryDelay)).toEqual([1000, 2000, 4000]);
  });

  it("dibatasi maksimal 8 dtk", () => {
    expect(retryDelay(3)).toBe(8000);
    expect(retryDelay(10)).toBe(8000);
  });
});

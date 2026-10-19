import { describe, expect, it } from "vitest";
import { checkSupabaseConfig, isSecretKey, readJwtRole } from "./supabaseConfig";

const b64url = (obj: unknown): string =>
  btoa(JSON.stringify(obj)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const jwt = (payload: unknown): string => `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url(payload)}.signature`;

const URL_OK = "https://abcdefgh.supabase.co";
const ANON = jwt({ role: "anon", iss: "supabase" });
const SERVICE = jwt({ role: "service_role", iss: "supabase" });

describe("readJwtRole", () => {
  it("membaca klaim role dari payload JWT (base64url)", () => {
    expect(readJwtRole(ANON)).toBe("anon");
    expect(readJwtRole(SERVICE)).toBe("service_role");
  });

  it("mengembalikan null untuk string yang bukan JWT / payload rusak", () => {
    expect(readJwtRole("sb_publishable_abc")).toBeNull();
    expect(readJwtRole("a.b.c")).toBeNull();
    expect(readJwtRole("")).toBeNull();
  });
});

describe("isSecretKey", () => {
  it("mendeteksi JWT service_role dan kunci format baru sb_secret_", () => {
    expect(isSecretKey(SERVICE)).toBe(true);
    expect(isSecretKey("sb_secret_abcdef")).toBe(true);
  });

  it("kunci anon / publishable dianggap aman", () => {
    expect(isSecretKey(ANON)).toBe(false);
    expect(isSecretKey("sb_publishable_abcdef")).toBe(false);
  });
});

describe("checkSupabaseConfig", () => {
  it("menerima URL https + kunci anon, dan merapikan spasi", () => {
    expect(checkSupabaseConfig(`  ${URL_OK} `, ` ${ANON} `)).toEqual({ ok: true, url: URL_OK, key: ANON });
  });

  it("env kosong -> reason 'missing' (bukan kesalahan keras)", () => {
    expect(checkSupabaseConfig(undefined, undefined)).toMatchObject({ ok: false, reason: "missing" });
    expect(checkSupabaseConfig(URL_OK, "")).toMatchObject({ ok: false, reason: "missing" });
  });

  it("MENOLAK kunci service_role maupun sb_secret_", () => {
    expect(checkSupabaseConfig(URL_OK, SERVICE)).toMatchObject({ ok: false, reason: "secret_key" });
    expect(checkSupabaseConfig(URL_OK, "sb_secret_xyz")).toMatchObject({ ok: false, reason: "secret_key" });
  });

  it("menolak URL non-https, kecuali http untuk localhost (Supabase lokal / e2e)", () => {
    expect(checkSupabaseConfig("http://abcdefgh.supabase.co", ANON)).toMatchObject({ ok: false, reason: "invalid_url" });
    expect(checkSupabaseConfig("bukan-url", ANON)).toMatchObject({ ok: false, reason: "invalid_url" });
    expect(checkSupabaseConfig("http://localhost:54321", ANON).ok).toBe(true);
  });
});

import "../__setup";
import { describe, expect, test } from "bun:test";
import { hashPassword, verifyPassword, generateToken } from "@/auth/password";

describe("password hashing (scrypt)", () => {
  test("hash then verify round-trips", async () => {
    const hash = await hashPassword("Passw0rd!");
    expect(hash.startsWith("scrypt$")).toBe(true);
    expect(hash).not.toContain("Passw0rd!");
    expect(await verifyPassword("Passw0rd!", hash)).toBe(true);
  });

  test("wrong password fails", async () => {
    const hash = await hashPassword("Passw0rd!");
    expect(await verifyPassword("password", hash)).toBe(false);
    expect(await verifyPassword("Passw0rd! ", hash)).toBe(false);
    expect(await verifyPassword("", hash)).toBe(false);
  });

  test("hashes are salted — same password, different hashes", async () => {
    const a = await hashPassword("same-password");
    const b = await hashPassword("same-password");
    expect(a).not.toBe(b);
    expect(await verifyPassword("same-password", a)).toBe(true);
    expect(await verifyPassword("same-password", b)).toBe(true);
  });

  test("malformed stored hashes fail closed", async () => {
    expect(await verifyPassword("x", "not-a-hash")).toBe(false);
    expect(await verifyPassword("x", "bcrypt$1$2$3$4$5")).toBe(false);
    expect(await verifyPassword("x", "scrypt$1$2$3$zz$yy")).toBe(false);
  });

  test("generateToken produces url-safe unique tokens", () => {
    const tokens = new Set(Array.from({ length: 100 }, () => generateToken()));
    expect(tokens.size).toBe(100);
    for (const t of tokens) expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

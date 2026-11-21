import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt) as (p: string | Buffer, s: string | Buffer, k: number) => Promise<Buffer>;

/**
 * Password hashing with scrypt (memory-hard KDF from Node's stdlib —
 * no external crypto dependency, FIPS-friendly).
 *
 * Format: scrypt$N$r$p$salt$hash  (hex) — parameters are embedded so the
 * scheme can be strengthened later without invalidating existing hashes.
 */
const PARAMS = { N: 16384, r: 8, p: 1, keylen: 64 };

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, PARAMS.keylen);
  return `scrypt$${PARAMS.N}$${PARAMS.r}$${PARAMS.p}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [, N, r, p, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  if (salt.length === 0 || expected.length === 0) return false; // corrupt hash — fail closed
  const derived = await scrypt(password, salt, expected.length);
  // constant-time compare
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import {
  SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifySessionToken,
} from "@/lib/session";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/** The hardcoded admin account always available as fallback. */
const ADMIN_EMAIL = "vitoriaservicosdepintura@gmail.com";
const ADMIN_PASSWORD = "@Yv25051183";

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, saltHex, hashHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const derived = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

/** Check email + password against DB users or the hardcoded admin account. */
export async function checkCredentials(email: string, password: string): Promise<boolean> {
  // Always allow the hardcoded admin account
  if (
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  ) {
    return true;
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
    if (!user) return false;
    return verifyPassword(password, user.passwordHash);
  } catch (error) {
    console.warn("DB offline, falling back to admin check only", error);
    return false;
  }
}

/** Register a new user. Returns null on success, error message on failure. */
export async function registerUser(
  fullName: string,
  email: string,
  password: string,
): Promise<string | null> {
  try {
    const existing = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
    if (existing.length > 0) return "Este email já está cadastrado.";

    const passwordHash = await hashPassword(password);
    await db.insert(users).values({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
    });
    return null;
  } catch (error) {
    console.error("Error registering user:", error);
    return "Erro ao criar conta. Tente novamente.";
  }
}

export async function startSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", { ...sessionCookieOptions, maxAge: 0 });
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Refresh the sliding 15 minute window after an authenticated action. */
export async function touchSession(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionToken(), sessionCookieOptions);
}

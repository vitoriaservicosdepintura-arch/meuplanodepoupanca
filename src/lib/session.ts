/**
 * Edge + Node compatible session token helpers (Web Crypto only).
 * The token carries nothing but an issue/expiry timestamp and is HMAC signed,
 * so no credential ever reaches the client.
 */

export const SESSION_COOKIE = "mpp_session";
export const SESSION_TIMEOUT_MINUTES = 15;

function secretKeyMaterial(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET ??
    process.env.DATABASE_URL ??
    "meu-plano-de-poupanca-dev-secret";
  return new TextEncoder().encode(secret);
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    secretKeyMaterial() as unknown as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload) as unknown as ArrayBuffer,
  );
  return toBase64Url(new Uint8Array(signature));
}

export async function createSessionToken(
  minutes = SESSION_TIMEOUT_MINUTES,
): Promise<string> {
  const payload = JSON.stringify({
    v: 1,
    exp: Date.now() + minutes * 60_000,
  });
  const encoded = toBase64Url(new TextEncoder().encode(payload));
  const signature = await hmac(encoded);
  return `${encoded}.${signature}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;
  try {
    const expected = await hmac(encoded);
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i += 1) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    if (diff !== 0) return false;
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(encoded))) as {
      exp?: number;
    };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TIMEOUT_MINUTES * 60,
};

// Family Rewards accounts: server-only configuration, database pool, session
// cookie and mailer. Nothing here is imported by a client component.
//
// Production needs (owner-supplied, never committed):
//   FR_ACCOUNTS_ENABLED=1            show /student-academy/referrals/account
//   FR_DATABASE_URL                  Supabase session pooler URL for role fr_app
//   FR_PUBLIC_ORIGIN                 https://jurassicenglish.com (sign-in links)
//   RESEND_API_KEY, FR_FROM_EMAIL    email sender for sign-in links
// Preview and local builds are on when FR_DATABASE_URL is set; without a mail
// key outside production, sign-in links are printed to the server log.

import { createHash, randomBytes } from "node:crypto";
import { Pool } from "pg";
import { cookies } from "next/headers";
import { poolConfig } from "./dbConfig";

export const ACCOUNT_PATH = "/student-academy/referrals/account";
export const SESSION_COOKIE = "fr_session";

const isProduction = () => process.env.VERCEL_ENV === "production";

export function accountsEnabled(): boolean {
  if (!process.env.FR_DATABASE_URL) return false;
  return isProduction() ? process.env.FR_ACCOUNTS_ENABLED === "1" : true;
}

let pool: Pool | null = null;
export function db(): Pool {
  if (!process.env.FR_DATABASE_URL) throw new Error("FR_DATABASE_URL is not set");
  if (!pool) {
    // TLS is verified against the Supabase root CA; any sslmode in the URL is ignored.
    pool = new Pool({ ...poolConfig(process.env.FR_DATABASE_URL), max: 3, idleTimeoutMillis: 10_000 });
    // A dropped idle connection (database restart, pooler failover) must not
    // crash the function; the pool replaces it on the next query.
    pool.on("error", (error) => console.error("[family-rewards] idle database connection lost:", error.message));
  }
  return pool;
}

export const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");
export const randomToken = () => randomBytes(32).toString("base64url");
export const requestKey = () => randomBytes(18).toString("base64url");

/** Hash of the session cookie, or null. The raw token never reaches the database. */
export async function sessionHash(): Promise<string | null> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  return raw && /^[A-Za-z0-9_-]{40,64}$/.test(raw) ? sha256(raw) : null;
}

export const sessionCookie = (value: string, maxAgeSeconds: number) =>
  `${SESSION_COOKIE}=${value}; Path=${ACCOUNT_PATH}; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${isProduction() || process.env.VERCEL ? "; Secure" : ""}`;

export function publicOrigin(): string {
  const configured = (process.env.FR_PUBLIC_ORIGIN || "").trim().replace(/\/+$/, "");
  if (configured) return configured;
  return isProduction() ? "https://jurassicenglish.com" : "http://localhost:3000";
}

/** Same-origin check for state-changing POSTs (works behind the jurassicenglish.com rewrite). */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const ok = !!origin && (origin === publicOrigin() || origin === new URL(request.url).origin);
  if (!ok) console.warn(`[family-rewards] refused cross-origin POST: origin=${origin ?? "none"} url=${new URL(request.url).origin}`);
  return ok;
}

/** 303 to a relative location, so redirects stay on whichever host the visitor used. */
export const seeOther = (location: string, extra: Record<string, string> = {}) =>
  new Response(null, { status: 303, headers: { Location: location, "Cache-Control": "private, no-store", ...extra } });

export async function sendSignInEmail(to: string, link: string): Promise<void> {
  const key = process.env.RESEND_API_KEY, from = process.env.FR_FROM_EMAIL;
  if (!key || !from) {
    if (isProduction()) throw new Error("Email sending is not configured");
    console.info(`[family-rewards] sign-in link for ${to.replace(/(^.).*(@.*$)/, "$1***$2")}: ${link}`);
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      subject: "Your Family Rewards sign-in link",
      text: `Use this link within 30 minutes to open your Jurassic English Family Rewards account:\n\n${link}\n\nIf you did not ask for it, you can ignore this email.`,
    }),
  });
  if (!response.ok) throw new Error(`Email provider returned ${response.status}`);
}

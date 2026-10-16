import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { EMPTY_LEDGER, type LedgerState } from "./ledger";

// Sandbox persistence for the preview: the buyer's ledger lives in one
// HMAC-signed, httpOnly cookie, so the preview needs no database and no new
// service. The browser can read nothing and change nothing: any edit breaks
// the signature and the server treats the visitor as having no purchases.
//
// The live store replaces this with rows in the existing Supabase project and
// a server-side ledger function (JE_MARKETPLACE_ARCHITECTURE.md §4). Cookies
// are not a purchase record.

const COOKIE = "jers_sandbox";
const MAX_ORDERS = 8;

function secret(): string | null {
  const s = process.env.RESOURCES_PREVIEW_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV === "development") return "local-dev-only-secret-not-for-deployments";
  return null;
}

export function storeConfigured(): boolean {
  return secret() !== null;
}

function sign(payload: string, key: string): string {
  return createHmac("sha256", key).update(payload).digest("base64url");
}

export async function readLedger(): Promise<LedgerState> {
  const key = secret();
  if (!key) return EMPTY_LEDGER;
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return EMPTY_LEDGER;
  const [body, mac] = raw.split(".");
  if (!body || !mac) return EMPTY_LEDGER;
  const expected = Buffer.from(sign(body, key));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return EMPTY_LEDGER;
  try {
    const parsed = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as LedgerState;
    if (!Array.isArray(parsed.orders) || !Array.isArray(parsed.entitlements) || !Array.isArray(parsed.processedTxns)) {
      return EMPTY_LEDGER;
    }
    return parsed;
  } catch {
    return EMPTY_LEDGER;
  }
}

export async function writeLedger(state: LedgerState): Promise<void> {
  const key = secret();
  if (!key) throw new Error("store_not_configured");
  const trimmed: LedgerState = {
    orders: state.orders.slice(-MAX_ORDERS),
    entitlements: state.entitlements,
    processedTxns: state.processedTxns.slice(-32),
  };
  const body = Buffer.from(JSON.stringify(trimmed)).toString("base64url");
  (await cookies()).set(COOKIE, `${body}.${sign(body, key)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: "/student-academy/resources",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearLedger(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/student-academy/resources" });
}

export function newOrderRef(): string {
  return `JERS${randomBytes(3).toString("hex").toUpperCase()}`;
}

// A short, non-reversible tag for logs and file watermarks. Never the email.
export function refTag(ref: string): string {
  const key = secret() ?? "x";
  return createHmac("sha256", key).update(`tag:${ref}`).digest("hex").slice(0, 10);
}

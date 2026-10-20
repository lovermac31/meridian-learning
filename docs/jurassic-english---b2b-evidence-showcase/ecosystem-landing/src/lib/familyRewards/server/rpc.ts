// Family Rewards database calls (server-only).
//
// The only path from the application to the ledger. Every call executes one
// SECURITY DEFINER function in schema family_rewards as role fr_app, which has
// no table privileges; the function resolves the caller from the session hash
// and enforces all money rules inside one transaction. This module validates
// input shape before the round trip, maps database rule failures to FrError,
// and never builds SQL from user input (function names come from a fixed list).
//
// Import-free at runtime (types only) so the real-database proof suite in
// scripts/family-rewards-db.test.mjs exercises exactly this code under Node.

import type { QueryResult } from "pg";

export type Queryable = { query: (text: string, values?: unknown[]) => Promise<QueryResult> };

export class FrError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

const MAX_VND = 100_000_000;

/** Whole VND between 1 and 100,000,000; rejects strings, fractions, NaN, Infinity and negatives. */
export function parseVnd(input: unknown, { allowNegative = false } = {}): number {
  const n = typeof input === "string" && /^-?\d{1,9}$/.test(input.trim()) ? Number(input.trim()) : input;
  if (typeof n !== "number" || !Number.isSafeInteger(n) || n === 0 || Math.abs(n) > MAX_VND || (!allowNegative && n < 0)) {
    throw new FrError("invalid", "Amount must be a whole number of VND between 1 and 100,000,000.");
  }
  return n;
}

/** Lesson count 0..100, integers only. */
export function parseCount(input: unknown): number {
  const n = typeof input === "string" && /^\d{1,3}$/.test(input.trim()) ? Number(input.trim()) : input;
  if (typeof n !== "number" || !Number.isInteger(n) || n < 0 || n > 100) throw new FrError("invalid", "Lesson counts must be whole numbers from 0 to 100.");
  return n;
}

/** ISO 8601 instant with an explicit offset (Z or ±hh:mm). Rejects bare dates and offset-less times. */
export function parseInstant(input: unknown, { optional = false } = {}): string | null {
  if (optional && (input === null || input === undefined || input === "")) return null;
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$/.test(input.trim())) {
    throw new FrError("invalid", "Times must include a date, time and time zone, for example 2026-11-02T09:00+07:00.");
  }
  const t = Date.parse(input.trim());
  if (Number.isNaN(t)) throw new FrError("invalid", "That time is not a real date.");
  return new Date(t).toISOString();
}

export function parseKey(input: unknown): string {
  if (typeof input !== "string" || !/^[A-Za-z0-9_-]{8,100}$/.test(input)) throw new FrError("invalid", "Missing or malformed request key.");
  return input;
}

const FUNCTIONS = new Set([
  "fr_request_login", "fr_redeem_login", "fr_sign_out", "fr_customer_account",
  "fr_owner_set_budget", "fr_owner_set_flags", "fr_owner_approve_member", "fr_owner_record_referral",
  "fr_owner_update_evidence", "fr_owner_approve_qualification", "fr_owner_void_referral",
  "fr_owner_register_invoice", "fr_owner_hold_redemption", "fr_owner_confirm_redemption",
  "fr_owner_release_redemption", "fr_owner_reverse_redemption", "fr_owner_adjust", "fr_owner_opening_balance", "fr_owner_overview",
]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function call<T = any>(db: Queryable, fn: string, args: unknown[]): Promise<T> {
  if (!FUNCTIONS.has(fn)) throw new Error(`Unknown Family Rewards function ${fn}`);
  const placeholders = args.map((_, i) => `$${i + 1}`).join(", ");
  try {
    const result = await db.query(`select family_rewards.${fn}(${placeholders}) as r`, args);
    return result.rows[0].r as T;
  } catch (error) {
    const e = error as { code?: string; hint?: string; message?: string };
    if (e.code === "P0001") throw new FrError(e.hint || "rejected", e.message || "Rejected.");
    throw error;
  }
}

// ---------------------------------------------------------------- typed operations
export const requestLogin = (db: Queryable, email: string, tokenHash: string) => call(db, "fr_request_login", [email, tokenHash, 30]);
export const redeemLogin = (db: Queryable, tokenHash: string, sessionHash: string) =>
  call<{ email: string; is_owner: boolean; is_member: boolean }>(db, "fr_redeem_login", [tokenHash, sessionHash, 14]);
export const signOut = (db: Queryable, session: string) => call(db, "fr_sign_out", [session]);
export const customerAccount = (db: Queryable, session: string) => call<CustomerAccount>(db, "fr_customer_account", [session]);
export const ownerOverview = (db: Queryable, session: string) => call<OwnerOverview>(db, "fr_owner_overview", [session]);

export type OwnerOp =
  | { op: "set_budget"; funded: number; reason: string }
  | { op: "set_flags"; enrolment: boolean; dashboard: boolean; writes: boolean; reason: string }
  | { op: "approve_member"; fullName: string; email: string; phone: string; termsVersion: string; termsAcceptedAt: string; reason: string }
  | { op: "record_referral"; code: string; fullName: string; email: string; phone: string; packageRef: string; declaredAt: string; reason: string }
  | { op: "update_evidence"; referral: string; firstPaymentAt: string | null; lessonsPaid: number; lessonsCompleted: number; issueOpen: boolean; refunded: boolean; evidenceRef: string; reason: string }
  | { op: "approve_qualification"; referral: string; reason: string }
  | { op: "void_referral"; referral: string; reason: string }
  | { op: "register_invoice"; packageId: string; member: string; lessons: number; eligible: boolean; invoiceId: string; payable: number; reason: string }
  | { op: "hold_redemption"; member: string; invoiceId: string; amount: number; reason: string }
  | { op: "confirm_redemption"; redemption: string; externalRef: string; reason: string }
  | { op: "release_redemption"; redemption: string; reason: string }
  | { op: "reverse_redemption"; redemption: string; reason: string }
  | { op: "adjust"; member: string; amount: number | null; reversesEntry: string | null; reason: string }
  | { op: "opening_balance"; member: string; amount: number; sourceRef: string; reason: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ownerOp(db: Queryable, session: string, key: string, o: OwnerOp): Promise<any> {
  const k = parseKey(key);
  switch (o.op) {
    case "set_budget": return call(db, "fr_owner_set_budget", [session, k, o.funded, o.reason]);
    case "set_flags": return call(db, "fr_owner_set_flags", [session, k, o.enrolment, o.dashboard, o.writes, o.reason]);
    case "approve_member": return call(db, "fr_owner_approve_member", [session, k, o.fullName, o.email, o.phone, o.termsVersion, parseInstant(o.termsAcceptedAt), o.reason]);
    case "record_referral": return call(db, "fr_owner_record_referral", [session, k, o.code, o.fullName, o.email, o.phone, o.packageRef, parseInstant(o.declaredAt), o.reason]);
    case "update_evidence": return call(db, "fr_owner_update_evidence", [session, k, o.referral, parseInstant(o.firstPaymentAt, { optional: true }),
      parseCount(o.lessonsPaid), parseCount(o.lessonsCompleted), o.issueOpen, o.refunded, o.evidenceRef, o.reason]);
    case "approve_qualification": return call(db, "fr_owner_approve_qualification", [session, k, o.referral, o.reason]);
    case "void_referral": return call(db, "fr_owner_void_referral", [session, k, o.referral, o.reason]);
    case "register_invoice": return call(db, "fr_owner_register_invoice", [session, k, o.packageId, o.member, parseCount(o.lessons), o.eligible, o.invoiceId, parseVnd(o.payable), o.reason]);
    case "hold_redemption": return call(db, "fr_owner_hold_redemption", [session, k, o.member, o.invoiceId, parseVnd(o.amount), o.reason]);
    case "confirm_redemption": return call(db, "fr_owner_confirm_redemption", [session, k, o.redemption, o.externalRef, o.reason]);
    case "release_redemption": return call(db, "fr_owner_release_redemption", [session, k, o.redemption, o.reason]);
    case "reverse_redemption": return call(db, "fr_owner_reverse_redemption", [session, k, o.redemption, o.reason]);
    case "adjust": return call(db, "fr_owner_adjust", [session, k, o.member, o.reversesEntry ? null : parseVnd(o.amount, { allowNegative: true }), o.reversesEntry, o.reason]);
    case "opening_balance": return call(db, "fr_owner_opening_balance", [session, k, o.member, parseVnd(o.amount), o.sourceRef, o.reason]);
  }
}

export type CustomerAccount =
  | { member: false; is_owner: boolean }
  | {
      member: true;
      is_owner: boolean;
      referral_code: string;
      terms_version: string;
      totals: { earned: number; used: number; adjustments: number; posted: number; held: number; available: number; pending: number };
      referrals: { family: string; since: string; status: string; reward: number }[];
      history: { date: string; type: string; amount: number; family: string | null; invoice: string | null }[];
      holds: { invoice: string; amount: number; since: string }[];
    };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type OwnerOverview = Record<string, any>;

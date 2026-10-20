// Family Rewards ledger: proof suite against a REAL, isolated Postgres.
//
//   FR_TEST_ADMIN_URL=postgres://postgres@127.0.0.1:54329/postgres npm run test:family-rewards-db
//
// Each test creates its own database, applies the production migration
// (supabase/migrations/20261021000001_family_rewards_ledger.sql), connects as
// the restricted application role fr_app and calls the ledger through
// src/lib/familyRewards/server/rpc.ts, the same module the app uses.
// All adults, households, bookings and invoices are synthetic.
// Never point FR_TEST_ADMIN_URL at production: every test drops and creates databases.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";
import * as fr from "../src/lib/familyRewards/server/rpc.ts";

const ADMIN_URL = process.env.FR_TEST_ADMIN_URL;
if (!ADMIN_URL) throw new Error("Set FR_TEST_ADMIN_URL to an isolated local Postgres (never production).");
const admin = new URL(ADMIN_URL);
if (!["127.0.0.1", "localhost"].includes(admin.hostname)) throw new Error("Refusing: FR_TEST_ADMIN_URL must be a local database.");

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "../../../..");
const MIGRATION = readFileSync(path.join(REPO, "supabase/migrations/20261021000001_family_rewards_ledger.sql"), "utf8");
const DOWN = readFileSync(path.join(REPO, "supabase/migrations/20261021000001_family_rewards_ledger_down.sql"), "utf8");
const COMMIT = (() => { try { return execSync("git rev-parse HEAD", { cwd: REPO }).toString().trim(); } catch { return "unknown"; } })();
const DIRTY = (() => { try { return execSync("git status --porcelain", { cwd: REPO }).toString().trim() !== ""; } catch { return true; } })();

const sha = (s) => createHash("sha256").update(s).digest("hex");
const rnd = () => randomBytes(24).toString("hex");
let dbSeq = 0;
const opened = [];

const OWNER = "owner@jurassic.test";
const D = "2026-10-05T09:00:00+07:00";   // code declared
const P = "2026-10-06T09:00:00+07:00";   // first payment

async function adminClient(db = admin.pathname.slice(1)) {
  const u = new URL(ADMIN_URL); u.pathname = `/${db}`;
  const c = new pg.Client({ connectionString: u.toString() });
  await c.connect();
  return c;
}

/** Fresh database with the migration applied; returns pools for fr_app and an anonymous role. */
async function freshDb() {
  const name = `fr_proof_${process.pid}_${++dbSeq}`;
  const a = await adminClient();
  await a.query(`drop database if exists ${name} with (force)`);
  await a.query(`create database ${name}`);
  await a.end();
  const s = await adminClient(name);
  await s.query(MIGRATION);
  await s.query(`alter role fr_app login password 'fr_app_local_only'`);
  await s.query(`do $$ begin if not exists (select 1 from pg_roles where rolname='fr_test_anon') then create role fr_test_anon login password 'anon_local_only'; end if; end $$`);
  await s.query(`insert into family_rewards.owners (email) values ($1)`, [OWNER]);
  const url = (user, pass) => { const u = new URL(ADMIN_URL); u.username = user; u.password = pass; u.pathname = `/${name}`; return u.toString(); };
  const app = new pg.Pool({ connectionString: url("fr_app", "fr_app_local_only"), max: 40 });
  const anon = new pg.Pool({ connectionString: url("fr_test_anon", "anon_local_only"), max: 2 });
  opened.push(app, anon, s);
  return { name, su: s, app, anon, appUrl: url("fr_app", "fr_app_local_only") };
}

async function signIn(db, email) {
  const token = rnd(), session = rnd();
  await fr.requestLogin(db, email, sha(token));
  await fr.redeemLogin(db, sha(token), sha(session));
  return sha(session);
}

const key = () => `k_${rnd().slice(0, 20)}`;
const op = (db, s, o, k = key()) => fr.ownerOp(db, s, k, o);

/** Owner session, open enrolment, synthetic budget, member A signed in. */
async function setup({ budget = 5_000_000 } = {}) {
  const env = await freshDb();
  const owner = await signIn(env.app, OWNER);
  await op(env.app, owner, { op: "set_flags", enrolment: true, dashboard: true, writes: true, reason: "open pilot (test)" });
  await op(env.app, owner, { op: "set_budget", funded: budget, reason: "synthetic test allocation" });
  const a = await op(env.app, owner, { op: "approve_member", fullName: "Synthetic Parent A", email: "parent.a@example.org", phone: "",
    termsVersion: "FR-2026-10-pilot-v1", termsAcceptedAt: "2026-10-04T10:00:00+07:00", reason: "verified former customer (test)" });
  const aSession = await signIn(env.app, "parent.a@example.org");
  return { ...env, owner, a, aSession };
}

async function referral(env, n, { code = env.a.referral_code, credit = true, name = `Synthetic Referred Adult ${n}` } = {}) {
  const r = await op(env.app, env.owner, { op: "record_referral", code, fullName: name, email: `new.family${n}@example.net`, phone: "",
    packageRef: `PKG-NEW-${n}`, declaredAt: D, reason: "code given at enquiry (test)" });
  if (!credit) return r;
  await op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 8,
    issueOpen: false, refunded: false, evidenceRef: `BANK-${n}; ATT-${n}`, reason: "bank statement + attendance sheet (test)" });
  await op(env.app, env.owner, { op: "qualify", referral: r.referral_id, reason: "8 paid, 8 completed (test)" });
  await op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "qualified reward (test)" });
  return r;
}

const account = (env, s = env.aSession) => fr.customerAccount(env.app, s);
const rejects = async (p, code) => {
  await assert.rejects(p, (e) => { assert.equal(e.code, code, `expected ${code}, got ${e.code}: ${e.message}`); return true; });
};
async function invoice(env, pkg, inv, payable = 5_600_000, member = env.a.member_id) {
  await op(env.app, env.owner, { op: "register_invoice", packageId: pkg, member, lessons: 8, eligible: true, invoiceId: inv, payable, reason: "later 8-lesson package (test)" });
}
async function redeem(env, inv, amount, member = env.a.member_id) {
  const h = await op(env.app, env.owner, { op: "hold_redemption", member, invoiceId: inv, amount, reason: "apply credit (test)" });
  await op(env.app, env.owner, { op: "confirm_redemption", redemption: h.redemption_id, externalRef: `${inv}-DISCOUNT`, reason: "discount shown on invoice (test)" });
  return h;
}

before(() => {
  console.log(`# Family Rewards DB proofs · commit ${COMMIT}${DIRTY ? " (+ uncommitted changes)" : ""} · ${ADMIN_URL.replace(/:[^:@/]*@/, ":***@")}`);
});
after(async () => { for (const p of opened) await p.end().catch(() => {}); });

// ======================================================= A. reward arithmetic
test("A1 one qualifying referral earns 200,000", async () => {
  const env = await setup();
  await referral(env, 1);
  const t = (await account(env)).totals;
  assert.equal(t.earned, 200_000); assert.equal(t.available, 200_000);
});

test("A2-A4 two, four and five qualifying referrals earn 400,000 / 800,000 / 1,000,000 (no cap on earning)", async () => {
  const env = await setup();
  await referral(env, 1); await referral(env, 2);
  assert.equal((await account(env)).totals.earned, 400_000);
  await referral(env, 3); await referral(env, 4);
  assert.equal((await account(env)).totals.earned, 800_000);
  await referral(env, 5);
  const t = (await account(env)).totals;
  assert.equal(t.earned, 1_000_000); assert.equal(t.available, 1_000_000);
});

test("A5 pending and non-qualifying referrals do not increase available balance", async () => {
  const env = await setup();
  await referral(env, 1);
  await referral(env, 2, { credit: false });                                  // attributed only
  const r3 = await referral(env, 3, { credit: false });
  await op(env.app, env.owner, { op: "update_evidence", referral: r3.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 5,
    issueOpen: false, refunded: false, evidenceRef: "partial", reason: "5 of 8 completed (test)" });
  await rejects(op(env.app, env.owner, { op: "qualify", referral: r3.referral_id, reason: "try early (test)" }), "not_qualified");
  const t = (await account(env)).totals;
  assert.equal(t.available, 200_000); assert.equal(t.pending, 400_000);
});

// ======================================================= B. carry-forward
test("B1 1,000,000 earned: redeem 400,000 -> 600,000; next package 400,000 -> 200,000 carried forward", async () => {
  const env = await setup();
  for (let i = 1; i <= 5; i++) await referral(env, i);
  await invoice(env, "PKG-A-L1", "INV-A-1");
  await redeem(env, "INV-A-1", 400_000);
  assert.equal((await account(env)).totals.available, 600_000);
  await invoice(env, "PKG-A-L2", "INV-A-2");
  await rejects(op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-2", amount: 600_000, reason: "over cap (test)" }), "over_cap");
  await redeem(env, "INV-A-2", 400_000);
  const t = (await account(env)).totals;
  assert.equal(t.available, 200_000); assert.equal(t.earned, 1_000_000); assert.equal(t.used, 800_000);
});

// ======================================================= C. concurrency and retries
test("C1 20 simultaneous reward postings for one referral produce exactly one reward", async () => {
  const env = await setup();
  const r = await referral(env, 1, { credit: false });
  await op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 8, issueOpen: false, refunded: false, evidenceRef: "x", reason: "evidence (test)" });
  await op(env.app, env.owner, { op: "qualify", referral: r.referral_id, reason: "ok (test)" });
  const results = await Promise.allSettled(Array.from({ length: 20 }, () => op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "race (test)" })));
  assert.equal(results.filter((x) => x.status === "fulfilled").length, 1);
  const { rows } = await env.su.query(`select count(*)::int n from family_rewards.ledger_entries where referral_id = $1`, [r.referral_id]);
  assert.equal(rows[0].n, 1);
  assert.equal((await account(env)).totals.available, 200_000);
});

test("C2 two simultaneous redemptions cannot overspend", async () => {
  const env = await setup();
  await referral(env, 1); await referral(env, 2);                             // 400,000 available
  await invoice(env, "PKG-A-L1", "INV-A-1"); await invoice(env, "PKG-A-L2", "INV-A-2");
  const res = await Promise.allSettled([
    op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-1", amount: 400_000, reason: "race 1 (test)" }),
    op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-2", amount: 400_000, reason: "race 2 (test)" }),
  ]);
  assert.equal(res.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(res.find((x) => x.status === "rejected").reason.code, "insufficient");
  assert.equal((await account(env)).totals.available, 0);
});

test("C3 split invoices on one package cannot evade the 400,000 package cap (concurrent)", async () => {
  const env = await setup();
  for (let i = 1; i <= 4; i++) await referral(env, i);                         // 800,000 available
  await invoice(env, "PKG-A-L1", "INV-A-1a", 2_800_000); await invoice(env, "PKG-A-L1", "INV-A-1b", 2_800_000);
  const res = await Promise.allSettled([
    op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-1a", amount: 300_000, reason: "split 1 (test)" }),
    op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-1b", amount: 300_000, reason: "split 2 (test)" }),
  ]);
  assert.equal(res.filter((x) => x.status === "fulfilled").length, 1);
  assert.equal(res.find((x) => x.status === "rejected").reason.code, "over_cap");
  await op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-1b", amount: 100_000, reason: "top up to cap (test)" }).catch(() => {});
  const { rows } = await env.su.query(`select committed_vnd::int c from family_rewards.packages where id='PKG-A-L1'`);
  assert.ok(rows[0].c <= 400_000, `package committed ${rows[0].c}`);
});

test("C4 competing reservations cannot exceed the funded allocation", async () => {
  const env = await setup({ budget: 600_000 });
  const res = await Promise.allSettled(Array.from({ length: 6 }, (_, i) =>
    referral(env, i + 1, { credit: false })));
  assert.equal(res.filter((x) => x.status === "fulfilled").length, 3);
  assert.ok(res.filter((x) => x.status === "rejected").every((x) => x.reason.code === "budget_exhausted"));
  const { rows } = await env.su.query(`select reserved_vnd::int r, issued_vnd::int i, funded_vnd::int f from family_rewards.budget`);
  assert.deepEqual(rows[0], { r: 600_000, i: 0, f: 600_000 });
});

test("C5 a repeated request returns the original result without a second effect; key reuse with another payload fails", async () => {
  const env = await setup();
  const r = await referral(env, 1, { credit: false });
  await op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 8, issueOpen: false, refunded: false, evidenceRef: "x", reason: "evidence (test)" });
  await op(env.app, env.owner, { op: "qualify", referral: r.referral_id, reason: "ok (test)" });
  const k = key();
  const [x, y] = await Promise.all([
    op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "same request (test)" }, k),
    op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "same request (test)" }, k),
  ]);
  assert.deepEqual(x, y);
  const z = await op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "same request (test)" }, k);
  assert.deepEqual(z, x);
  await rejects(op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "different payload (test)" }, k), "idempotency_conflict");
  assert.equal((await account(env)).totals.earned, 200_000);
});

// ======================================================= D. ownership and privacy
test("D1 member B cannot see member A; customers cannot call owner operations; full identity is owner-only", async () => {
  const env = await setup();
  await referral(env, 1, { name: "Zelda Synthetic-Referred" });
  const b = await op(env.app, env.owner, { op: "approve_member", fullName: "Synthetic Parent B", email: "parent.b@example.org", phone: "",
    termsVersion: "FR-2026-10-pilot-v1", termsAcceptedAt: "2026-10-04T10:00:00+07:00", reason: "verified (test)" });
  const bSession = await signIn(env.app, "parent.b@example.org");
  const aView = JSON.stringify(await account(env));
  const bView = await account(env, bSession);
  assert.equal(bView.referral_code, b.referral_code);
  assert.equal(bView.totals.available, 0); assert.equal(bView.referrals.length, 0);
  assert.ok(!JSON.stringify(bView).includes(env.a.referral_code));
  // Customer projection never carries the referred adult's identity.
  assert.ok(!aView.includes("Zelda") && !aView.includes("new.family1@example.net"), aView);
  assert.match(aView, /Family [A-Z2-9]{3}/);
  // Owner projection does.
  assert.ok(JSON.stringify(await fr.ownerOverview(env.app, env.owner)).includes("Zelda Synthetic-Referred"));
  // Customer sessions cannot use owner functions or read the overview.
  await rejects(fr.ownerOverview(env.app, env.aSession), "forbidden");
  await rejects(op(env.app, env.aSession, { op: "adjust", member: env.a.member_id, amount: 1_000_000, reversesEntry: null, reason: "self credit" }), "forbidden");
  await rejects(op(env.app, bSession, { op: "hold_redemption", member: env.a.member_id, invoiceId: "X-1", amount: 1, reason: "steal" }), "forbidden");
  // Guessed or forged sessions get nothing.
  await rejects(fr.customerAccount(env.app, sha("guess")), "unauthenticated");
});

test("D2 database boundary: the app role and anonymous roles cannot read tables; anonymous cannot execute functions", async () => {
  const env = await setup();
  await referral(env, 1);
  for (const t of ["ledger_entries", "private_contacts", "members", "sessions", "budget"]) {
    await assert.rejects(env.app.query(`select * from family_rewards.${t}`), /permission denied/);
    await assert.rejects(env.anon.query(`select * from family_rewards.${t}`), /permission denied/);
  }
  await assert.rejects(env.anon.query(`select family_rewards.fr_customer_account($1)`, [env.aSession]), /permission denied/);
  await assert.rejects(env.app.query(`insert into family_rewards.ledger_entries (member_id, amount_vnd, entry_type, actor, reason) values ($1, 999, 'adjustment', 'x', 'x')`, [env.a.member_id]), /permission denied/);
});

test("D3 an unverified submitted email cannot see a membership until that address signs in", async () => {
  const env = await setup();
  await op(env.app, env.owner, { op: "approve_member", fullName: "Synthetic Parent C", email: "parent.c@example.org", phone: "",
    termsVersion: "FR-2026-10-pilot-v1", termsAcceptedAt: "2026-10-04T10:00:00+07:00", reason: "verified (test)" });
  const other = await signIn(env.app, "someone.else@example.org");
  assert.deepEqual(await account(env, other), { member: false, is_owner: false });
  const c = await signIn(env.app, "PARENT.C@example.org");                        // case-insensitive, verified by link
  assert.equal((await account(env, c)).member, true);
});

// ======================================================= E. failure and recovery
test("E1 a rolled-back transaction leaves no half-issued credit", async () => {
  const env = await setup();
  const r = await referral(env, 1, { credit: false });
  await op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 8, issueOpen: false, refunded: false, evidenceRef: "x", reason: "evidence (test)" });
  await op(env.app, env.owner, { op: "qualify", referral: r.referral_id, reason: "ok (test)" });
  const c = await env.app.connect();
  await c.query("begin");
  await fr.ownerOp(c, env.owner, key(), { op: "post_reward", referral: r.referral_id, reason: "then crash (test)" });
  await c.query("rollback"); c.release();
  const { rows } = await env.su.query(`select (select count(*)::int from family_rewards.ledger_entries) n,
     (select status from family_rewards.referrals where id=$1) s, (select issued_vnd::int from family_rewards.budget) i`, [r.referral_id]);
  assert.deepEqual(rows[0], { n: 0, s: "qualified", i: 0 });
});

test("E2 failure after commit but before the response is safe to retry", async () => {
  const env = await setup();
  const r = await referral(env, 1, { credit: false });
  await op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 8, issueOpen: false, refunded: false, evidenceRef: "x", reason: "evidence (test)" });
  await op(env.app, env.owner, { op: "qualify", referral: r.referral_id, reason: "ok (test)" });
  const k = key();
  const first = await op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "lost response (test)" }, k);  // response "lost"
  const retry = await op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "lost response (test)" }, k);
  assert.equal(retry.entry_id, first.entry_id);
  assert.equal((await account(env)).totals.earned, 200_000);
});

test("E3 a failed invoice application releases the hold without losing credit", async () => {
  const env = await setup();
  await referral(env, 1); await referral(env, 2);
  await invoice(env, "PKG-A-L1", "INV-A-1");
  const h = await op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-1", amount: 400_000, reason: "apply (test)" });
  assert.equal((await account(env)).totals.available, 0);
  await op(env.app, env.owner, { op: "release_redemption", redemption: h.redemption_id, reason: "invoice system rejected the discount (test)" });
  const t = (await account(env)).totals;
  assert.equal(t.available, 400_000); assert.equal(t.used, 0);
  const again = await op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-1", amount: 400_000, reason: "retry apply (test)" });
  assert.ok(again.redemption_id);
});

test("E4 a documented reversal of a cancelled credited invoice restores the amount exactly once", async () => {
  const env = await setup();
  await referral(env, 1); await referral(env, 2);
  await invoice(env, "PKG-A-L1", "INV-A-1");
  const h = await redeem(env, "INV-A-1", 400_000);
  assert.equal((await account(env)).totals.available, 0);
  const [x, y] = await Promise.allSettled([
    op(env.app, env.owner, { op: "reverse_redemption", redemption: h.redemption_id, reason: "invoice cancelled (test)" }),
    op(env.app, env.owner, { op: "reverse_redemption", redemption: h.redemption_id, reason: "invoice cancelled twice (test)" }),
  ]);
  assert.equal([x, y].filter((r) => r.status === "fulfilled").length, 1);
  const t = (await account(env)).totals;
  assert.equal(t.available, 400_000); assert.equal(t.used, 0);
  // The ledger keeps both postings; nothing was rewritten.
  const { rows } = await env.su.query(`select entry_type, amount_vnd::int a from family_rewards.ledger_entries where redemption_id=$1 order by seq`, [h.redemption_id]);
  assert.deepEqual(rows, [{ entry_type: "redemption", a: -400_000 }, { entry_type: "redemption_reversal", a: 400_000 }]);
});

test("E5 restart and reconnect preserve accounts, balances and history", async () => {
  const env = await setup();
  await referral(env, 1); await referral(env, 2);
  const before = await account(env);
  await env.app.end();
  if (process.env.FR_TEST_PGCTL && process.env.FR_TEST_PGDATA) {
    execSync(`"${process.env.FR_TEST_PGCTL}" -D "${process.env.FR_TEST_PGDATA}" restart -m fast -w`, { stdio: "ignore", env: { ...process.env, LC_ALL: "en_US.UTF-8" } });
  }
  const app2 = new pg.Pool({ connectionString: env.appUrl, max: 2 }); opened.push(app2);
  const afterView = await fr.customerAccount(app2, env.aSession);
  assert.deepEqual(afterView, before);
  if (process.env.FR_TEST_PGCTL) console.log("# E5: postgres server restarted with pg_ctl");
});

// ======================================================= F. evidence and validation
test("F1 invalid dates, time zones, amounts and tampered counts fail", async () => {
  for (const bad of ["2026-10-06", "2026-10-06T09:00", "2026-13-40T09:00Z", "06/10/2026 09:00", ""]) {
    assert.throws(() => fr.parseInstant(bad), /time zone|real date/);
  }
  for (const bad of [1.5, -5, 0, NaN, Infinity, "1e5", "200000.0", 1e12, null, "abc"]) {
    assert.throws(() => fr.parseVnd(bad), /whole number/);
  }
  for (const bad of [-1, 101, 2.5, "8a"]) assert.throws(() => fr.parseCount(bad), /whole numbers/);
  const env = await setup();
  await rejects(fr.call(env.app, "fr_owner_set_budget", [env.owner, key(), -1, "negative (test)"]), "invalid");
  await invoice(env, "PKG-A-L1", "INV-A-1");
  await rejects(fr.call(env.app, "fr_owner_hold_redemption", [env.owner, key(), env.a.member_id, "INV-A-1", 0, "zero (test)"]), "invalid");
  await assert.rejects(fr.call(env.app, "fr_owner_hold_redemption", [env.owner, key(), env.a.member_id, "INV-A-1", "1.5", "fraction (test)"]), /bigint/);
  const r = await referral(env, 1, { credit: false });
  await rejects(fr.call(env.app, "fr_owner_update_evidence", [env.owner, key(), r.referral_id, P, 8, 9, false, false, "tampered", "completed > paid (test)"]), "invalid");
  await rejects(fr.call(env.app, "fr_owner_update_evidence", [env.owner, key(), r.referral_id, P, 101, 8, false, false, "tampered", "101 (test)"]), "invalid");
  await rejects(fr.call(env.app, "fr_owner_record_referral", [env.owner, key(), env.a.referral_code, "Future", "f@example.net", "", "PKG-F", "2030-01-01T00:00:00Z", "future (test)"]), "invalid");
});

test("F2 a late or changed payment timestamp cannot bypass attribution", async () => {
  const env = await setup();
  const r = await referral(env, 1, { credit: false });
  await rejects(op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: "2026-10-04T09:00:00+07:00", lessonsPaid: 8, lessonsCompleted: 8,
    issueOpen: false, refunded: false, evidenceRef: "x", reason: "paid before code (test)" }), "late_code");
  await op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 8, issueOpen: false, refunded: false, evidenceRef: "x", reason: "evidence (test)" });
  await rejects(op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: "2026-10-07T09:00:00+07:00", lessonsPaid: 8, lessonsCompleted: 8,
    issueOpen: false, refunded: false, evidenceRef: "x", reason: "move payment (test)" }), "immutable");
  // The database constraint holds even outside the functions.
  await assert.rejects(env.su.query(`update family_rewards.referrals set first_payment_at = code_declared_at - interval '1 day' where id=$1`, [r.referral_id]), /payment_after_declaration/);
});

test("F3 changing the global reward does not change snapshotted awards", async () => {
  const env = await setup();
  const r1 = await referral(env, 1, { credit: false });
  await env.su.query(`update family_rewards.settings set reward_per_household = 300000`);
  await op(env.app, env.owner, { op: "update_evidence", referral: r1.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 8, issueOpen: false, refunded: false, evidenceRef: "x", reason: "evidence (test)" });
  await op(env.app, env.owner, { op: "qualify", referral: r1.referral_id, reason: "ok (test)" });
  await op(env.app, env.owner, { op: "post_reward", referral: r1.referral_id, reason: "old terms (test)" });
  await referral(env, 2);
  const h = (await account(env)).history.map((e) => e.amount);
  assert.deepEqual(h, [200_000, 300_000]);
});

test("F4 a stale qualification cannot post credit after a conflicting refund or payment issue", async () => {
  const env = await setup();
  const r = await referral(env, 1, { credit: false });
  await op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 8, issueOpen: false, refunded: false, evidenceRef: "x", reason: "evidence (test)" });
  await op(env.app, env.owner, { op: "qualify", referral: r.referral_id, reason: "ok (test)" });
  // A dispute lands on the row while the approval is still marked qualified (e.g. a concurrent writer).
  await env.su.query(`update family_rewards.referrals set payment_issue_open = true where id=$1`, [r.referral_id]);
  await rejects(op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "stale (test)" }), "not_qualified");
  // Recording a refund through the normal path resets the approval.
  await op(env.app, env.owner, { op: "update_evidence", referral: r.referral_id, firstPaymentAt: P, lessonsPaid: 8, lessonsCompleted: 8, issueOpen: false, refunded: true, evidenceRef: "refund", reason: "refund (test)" });
  await rejects(op(env.app, env.owner, { op: "post_reward", referral: r.referral_id, reason: "stale (test)" }), "state");
  assert.equal((await account(env)).totals.earned, 0);
});

test("F5 forged or foreign invoice references cannot spend credit", async () => {
  const env = await setup();
  await referral(env, 1);
  const b = await op(env.app, env.owner, { op: "approve_member", fullName: "Synthetic Parent B", email: "parent.b@example.org", phone: "",
    termsVersion: "FR-2026-10-pilot-v1", termsAcceptedAt: "2026-10-04T10:00:00+07:00", reason: "verified (test)" });
  await invoice(env, "PKG-B-L1", "INV-B-1", 5_600_000, b.member_id);
  await rejects(op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-B-1", amount: 100_000, reason: "foreign (test)" }), "forbidden");
  await rejects(op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-FORGED-9", amount: 100_000, reason: "forged (test)" }), "not_found");
  await op(env.app, env.owner, { op: "register_invoice", packageId: "PKG-A-4L", member: env.a.member_id, lessons: 4, eligible: true, invoiceId: "INV-A-4L", payable: 2_800_000, reason: "4-lesson pack (test)" });
  await rejects(op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-4L", amount: 100_000, reason: "ineligible (test)" }), "not_eligible");
  await invoice(env, "PKG-A-SMALL", "INV-A-SMALL", 150_000);
  await rejects(op(env.app, env.owner, { op: "hold_redemption", member: env.a.member_id, invoiceId: "INV-A-SMALL", amount: 200_000, reason: "over payable (test)" }), "over_invoice");
  assert.equal((await account(env)).totals.available, 200_000);
});

test("F6 balances reconcile to posted transactions and the budget", async () => {
  const env = await setup();
  for (let i = 1; i <= 3; i++) await referral(env, i);
  await referral(env, 4, { credit: false });
  await invoice(env, "PKG-A-L1", "INV-A-1");
  await redeem(env, "INV-A-1", 300_000);
  await op(env.app, env.owner, { op: "adjust", member: env.a.member_id, amount: -50_000, reversesEntry: null, reason: "documented correction (test)" });
  const o = await fr.ownerOverview(env.app, env.owner);
  const rec = o.reconciliation;
  const t = (await account(env)).totals;
  assert.equal(Number(rec.ledger_total), t.posted);
  assert.equal(t.posted, t.earned - t.used + t.adjustments);
  assert.equal(Number(rec.rewards_posted), Number(rec.budget_issued));
  assert.equal(Number(rec.reserved_open), Number(rec.budget_reserved));
  assert.deepEqual([t.earned, t.used, t.adjustments, t.available, t.pending], [600_000, 300_000, -50_000, 250_000, 200_000]);
});

// ======================================================= G. release continuity
test("G1 stopping new referrals keeps accounts readable and earned balances usable", async () => {
  const env = await setup();
  await referral(env, 1); await referral(env, 2);
  await op(env.app, env.owner, { op: "set_flags", enrolment: false, dashboard: true, writes: true, reason: "pilot closed to new referrals (test)" });
  await rejects(referral(env, 3, { credit: false }), "paused");
  assert.equal((await account(env)).totals.available, 400_000);
  await invoice(env, "PKG-A-L1", "INV-A-1");
  await redeem(env, "INV-A-1", 400_000);
  assert.equal((await account(env)).totals.available, 0);
});

test("G2 rollback cannot orphan or silently remove entitlements", async () => {
  const env = await setup();
  await referral(env, 1);
  await assert.rejects(env.su.query(`update family_rewards.ledger_entries set amount_vnd = 1`), /append-only/);
  await assert.rejects(env.su.query(`delete from family_rewards.ledger_entries`), /append-only/);
  await assert.rejects(env.su.query(`truncate family_rewards.ledger_entries cascade`), /append-only/);
  await assert.rejects(env.su.query(DOWN), /refusing to drop/);
  assert.equal((await account(env)).totals.available, 200_000);
});

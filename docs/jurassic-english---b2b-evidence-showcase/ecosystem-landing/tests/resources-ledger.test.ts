// Run: node --experimental-strip-types --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_LEDGER,
  applyEvent,
  createOrder,
  extractRef,
  hasActiveEntitlement,
  reconciliationQueue,
} from "../src/lib/resources/ledger.ts";

const T0 = 1_800_000_000_000;
const HOLD = 30 * 60 * 1000;

function withOrder(amount = 39000) {
  return createOrder(EMPTY_LEDGER, { ref: "JERS0A1B2C", slug: "l2-activity-pack", amountVnd: amount, at: T0, holdMs: HOLD });
}

test("exact transfer grants exactly one entitlement", () => {
  const r = applyEvent(withOrder(), { kind: "transfer", txnId: "t1", ref: "JERS0A1B2C", amountVnd: 39000, at: T0 + 1 });
  assert.equal(r.outcome, "granted");
  assert.equal(r.state.entitlements.length, 1);
  assert.equal(r.state.orders[0].status, "paid");
  assert.ok(hasActiveEntitlement(r.state, "l2-activity-pack"));
});

test("duplicate webhook delivery changes nothing", () => {
  const first = applyEvent(withOrder(), { kind: "transfer", txnId: "t1", ref: "JERS0A1B2C", amountVnd: 39000, at: T0 + 1 });
  const second = applyEvent(first.state, { kind: "transfer", txnId: "t1", ref: "JERS0A1B2C", amountVnd: 39000, at: T0 + 2 });
  assert.equal(second.outcome, "duplicate");
  assert.deepEqual(second.state, first.state);
});

test("second different transfer for a paid order goes to review, no second grant", () => {
  const first = applyEvent(withOrder(), { kind: "transfer", txnId: "t1", ref: "JERS0A1B2C", amountVnd: 39000, at: T0 + 1 });
  const second = applyEvent(first.state, { kind: "transfer", txnId: "t2", ref: "JERS0A1B2C", amountVnd: 39000, at: T0 + 2 });
  assert.equal(second.outcome, "already_paid_review");
  assert.equal(second.state.entitlements.length, 1);
  assert.equal(reconciliationQueue(second.state).length, 1);
});

test("underpayment never grants access", () => {
  const r = applyEvent(withOrder(), { kind: "transfer", txnId: "t1", ref: "JERS0A1B2C", amountVnd: 9000, at: T0 + 1 });
  assert.equal(r.outcome, "underpaid");
  assert.equal(r.state.entitlements.length, 0);
  assert.equal(r.state.orders[0].needsReview, "underpaid");
});

test("overpayment grants and flags for review", () => {
  const r = applyEvent(withOrder(), { kind: "transfer", txnId: "t1", ref: "JERS0A1B2C", amountVnd: 50000, at: T0 + 1 });
  assert.equal(r.outcome, "granted_overpaid_review");
  assert.equal(r.state.entitlements.length, 1);
});

test("unknown reference is recorded so its retry is a duplicate", () => {
  const r = applyEvent(withOrder(), { kind: "transfer", txnId: "tx", ref: "JERSFFFFFF", amountVnd: 39000, at: T0 });
  assert.equal(r.outcome, "unknown_ref");
  assert.equal(applyEvent(r.state, { kind: "transfer", txnId: "tx", ref: "JERSFFFFFF", amountVnd: 39000, at: T0 }).outcome, "duplicate");
});

test("failed payment closes the order and a later transfer is held for review", () => {
  const f = applyEvent(withOrder(), { kind: "failed", ref: "JERS0A1B2C", at: T0 + 1 });
  assert.equal(f.outcome, "failed");
  const late = applyEvent(f.state, { kind: "transfer", txnId: "t9", ref: "JERS0A1B2C", amountVnd: 39000, at: T0 + 2 });
  assert.equal(late.outcome, "order_closed");
  assert.equal(late.state.entitlements.length, 0);
});

test("late transfer after the hold expired is still honoured", () => {
  const e = applyEvent(withOrder(), { kind: "expire", ref: "JERS0A1B2C", at: T0 + HOLD + 1 });
  assert.equal(e.outcome, "expired");
  const late = applyEvent(e.state, { kind: "transfer", txnId: "t3", ref: "JERS0A1B2C", amountVnd: 39000, at: T0 + HOLD + 5 });
  assert.equal(late.outcome, "granted");
});

test("hold cannot expire early", () => {
  assert.equal(applyEvent(withOrder(), { kind: "expire", ref: "JERS0A1B2C", at: T0 + 10 }).outcome, "not_expirable");
});

test("refund revokes access; unpaid orders are not refundable", () => {
  assert.equal(applyEvent(withOrder(), { kind: "refund", ref: "JERS0A1B2C", at: T0 }).outcome, "not_refundable");
  const paid = applyEvent(withOrder(), { kind: "transfer", txnId: "t1", ref: "JERS0A1B2C", amountVnd: 39000, at: T0 + 1 });
  const ref = applyEvent(paid.state, { kind: "refund", ref: "JERS0A1B2C", at: T0 + 2 });
  assert.equal(ref.outcome, "refunded");
  assert.equal(hasActiveEntitlement(ref.state, "l2-activity-pack"), false);
});

test("bank memo extraction tolerates mangling", () => {
  assert.equal(extractRef("ck jers 0a1b2c thanh toan"), "JERS0A1B2C");
  assert.equal(extractRef("JE-RS0A1B2C"), "JERS0A1B2C");
  assert.equal(extractRef("no reference"), null);
});

test("createOrder rejects malformed input", () => {
  assert.throws(() => createOrder(EMPTY_LEDGER, { ref: "../etc", slug: "x", amountVnd: 1, at: 0, holdMs: 1 }));
  assert.throws(() => createOrder(EMPTY_LEDGER, { ref: "JERS000000", slug: "x", amountVnd: -5, at: 0, holdMs: 1 }));
});

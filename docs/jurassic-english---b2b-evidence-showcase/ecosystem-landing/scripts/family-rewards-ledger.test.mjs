// Synthetic rehearsal of the Family Rewards ledger rules.
// Run: npm run test:family-rewards
// All households, codes, bookings and invoices are synthetic. No real
// students, money or messages are involved.

import { test } from "node:test";
import assert from "node:assert/strict";
import { RULES, TERMS_VERSION, TERMS, STEPS, REWARD, TWO_FAMILY_REWARD, MAX_REDEMPTION, FORM_RESPONDER_URL, isVerifiedFormUrl } from "../src/lib/familyRewards/terms.ts";
import { createLedger, approveMember, recordReferral, updateBooking, qualify, issueCredit, redeem, balanceOf, LedgerError } from "../src/lib/familyRewards/ledger.ts";

const BUDGET = 2_000_000; // proposed pilot reserve (not approved); synthetic here
const T0 = "2026-11-01T09:00:00Z";
const PAID = "2026-11-02T09:00:00Z";

const base = () => approveMember(approveMember(createLedger(TERMS_VERSION, BUDGET), "QX7K2M", "HH-REF-A"), "ZP4N8T", "HH-REF-B");

function completeBooking(ledger, ref, household, code = "QX7K2M") {
  let l = recordReferral(ledger, RULES, { bookingRef: ref, newHouseholdId: household, code, declaredAt: T0, paidAt: PAID });
  l = updateBooking(l, ref, { lessonsPaid: 8, lessonsCompleted: 8 });
  l = qualify(l, RULES, ref);
  return issueCredit(l, RULES, ref);
}

test("terms copy agrees with the rule constants", () => {
  assert.equal(REWARD, "200,000₫");
  assert.equal(TWO_FAMILY_REWARD, "400,000₫");
  assert.equal(MAX_REDEMPTION, "400,000₫");
  const all = [...TERMS, ...STEPS.map((s) => s.body)].join(" ");
  assert.match(all, /8 individual lessons/);
  assert.match(all, /400,000₫/);
  assert.match(all, /cannot be exchanged for cash/);
  assert.match(all, /does not expire during the pilot/);
  assert.match(all, /never depend on referrals/);
});

test("form URL is null or a verified responder URL, never an edit link", () => {
  assert.ok(FORM_RESPONDER_URL === null || isVerifiedFormUrl(FORM_RESPONDER_URL));
  assert.equal(isVerifiedFormUrl("https://docs.google.com/forms/d/1abcDEF/edit"), false);
  assert.equal(isVerifiedFormUrl("https://forms.gle/abc"), false);
});

test("one referral earns 200,000₫ usable credit on its own", () => {
  const l = completeBooking(base(), "BK-001", "HH-NEW-1");
  assert.equal(balanceOf(l, "QX7K2M"), 200_000);
  const r = redeem(l, RULES, "QX7K2M", "INV-101", 200_000);
  assert.equal(balanceOf(r, "QX7K2M"), 0);
});

test("two referrals earn 400,000₫; one redemption uses the per-package maximum", () => {
  let l = completeBooking(base(), "BK-001", "HH-NEW-1");
  l = completeBooking(l, "BK-002", "HH-NEW-2");
  assert.equal(balanceOf(l, "QX7K2M"), 400_000);
  l = redeem(l, RULES, "QX7K2M", "INV-101", 400_000);
  assert.equal(balanceOf(l, "QX7K2M"), 0);
});

test("three referrals: 400,000₫ cap per package, 200,000₫ carries forward", () => {
  let l = completeBooking(base(), "BK-001", "HH-NEW-1");
  l = completeBooking(l, "BK-002", "HH-NEW-2");
  l = completeBooking(l, "BK-003", "HH-NEW-3");
  assert.throws(() => redeem(l, RULES, "QX7K2M", "INV-101", 600_000), LedgerError);
  l = redeem(l, RULES, "QX7K2M", "INV-101", 400_000);
  assert.equal(balanceOf(l, "QX7K2M"), 200_000);
});

test("duplicate claim: a second referrer cannot claim the same new household", () => {
  const l = recordReferral(base(), RULES, { bookingRef: "BK-001", newHouseholdId: "HH-NEW-1", code: "QX7K2M", declaredAt: T0, paidAt: PAID });
  assert.throws(
    () => recordReferral(l, RULES, { bookingRef: "BK-001b", newHouseholdId: "HH-NEW-1", code: "ZP4N8T", declaredAt: T0, paidAt: PAID }),
    /already referred with code QX7K2M/,
  );
  assert.throws(
    () => recordReferral(l, RULES, { bookingRef: "BK-009", newHouseholdId: "HH-NEW-1", code: "QX7K2M", declaredAt: T0, paidAt: PAID }),
    LedgerError,
  );
});

test("duplicate reward: a credited booking cannot be credited again", () => {
  const l = completeBooking(base(), "BK-001", "HH-NEW-1");
  assert.throws(() => issueCredit(l, RULES, "BK-001"), LedgerError);
  assert.throws(() => qualify(l, RULES, "BK-001"), LedgerError);
});

test("self-referral and late codes are refused", () => {
  assert.throws(
    () => recordReferral(base(), RULES, { bookingRef: "BK-001", newHouseholdId: "HH-REF-A", code: "QX7K2M", declaredAt: T0, paidAt: PAID }),
    /self-referral/,
  );
  assert.throws(
    () => recordReferral(base(), RULES, { bookingRef: "BK-001", newHouseholdId: "HH-NEW-1", code: "QX7K2M", declaredAt: PAID, paidAt: T0 }),
    /before the first package payment/,
  );
});

test("refund before qualification: no reward, reserve released", () => {
  let l = recordReferral(base(), RULES, { bookingRef: "BK-001", newHouseholdId: "HH-NEW-1", code: "QX7K2M", declaredAt: T0, paidAt: PAID });
  assert.equal(l.reservedVnd, 200_000);
  l = updateBooking(l, "BK-001", { lessonsPaid: 8, lessonsCompleted: 5, refunded: true });
  assert.equal(l.referrals["BK-001"].status, "void");
  assert.equal(l.reservedVnd, 0);
  assert.throws(() => qualify(l, RULES, "BK-001"), LedgerError);
  assert.equal(balanceOf(l, "QX7K2M"), 0);
});

test("open dispute or incomplete lessons block qualification", () => {
  let l = recordReferral(base(), RULES, { bookingRef: "BK-001", newHouseholdId: "HH-NEW-1", code: "QX7K2M", declaredAt: T0, paidAt: PAID });
  l = updateBooking(l, "BK-001", { lessonsPaid: 8, lessonsCompleted: 7 });
  assert.throws(() => qualify(l, RULES, "BK-001"), /7 of 8 lessons completed/);
  l = updateBooking(l, "BK-001", { lessonsCompleted: 8, disputeOpen: true });
  assert.throws(() => qualify(l, RULES, "BK-001"), /dispute/);
  l = updateBooking(l, "BK-001", { disputeOpen: false });
  assert.equal(qualify(l, RULES, "BK-001").referrals["BK-001"].status, "qualified");
});

test("double redemption: one invoice is credited once; balance cannot go negative", () => {
  let l = completeBooking(base(), "BK-001", "HH-NEW-1");
  l = completeBooking(l, "BK-002", "HH-NEW-2");
  l = redeem(l, RULES, "QX7K2M", "INV-101", 200_000);
  assert.throws(() => redeem(l, RULES, "QX7K2M", "INV-101", 200_000), /already has credit applied/);
  l = redeem(l, RULES, "QX7K2M", "INV-102", 200_000);
  assert.throws(() => redeem(l, RULES, "QX7K2M", "INV-103", 200_000), /exceeds balance/);
});

test("exhausted budget: new bookings refused, confirmed rewards still honoured", () => {
  let l = base();
  for (let i = 1; i <= 10; i++) {
    l = recordReferral(l, RULES, { bookingRef: `BK-${i}`, newHouseholdId: `HH-NEW-${i}`, code: i % 2 ? "QX7K2M" : "ZP4N8T", declaredAt: T0, paidAt: PAID });
  }
  assert.equal(l.reservedVnd, BUDGET);
  assert.throws(
    () => recordReferral(l, RULES, { bookingRef: "BK-11", newHouseholdId: "HH-NEW-11", code: "QX7K2M", declaredAt: T0, paidAt: PAID }),
    /reserve exhausted/,
  );
  l = updateBooking(l, "BK-1", { lessonsPaid: 8, lessonsCompleted: 8 });
  l = issueCredit(qualify(l, RULES, "BK-1"), RULES, "BK-1");
  assert.equal(balanceOf(l, "QX7K2M"), 200_000);
});

test("codes are opaque and one per household", () => {
  assert.throws(() => approveMember(createLedger(TERMS_VERSION, BUDGET), "jane@example.com", "HH-X"), /opaque/);
  assert.throws(() => approveMember(base(), "AB12CD34", "HH-REF-A"), /already a member/);
});

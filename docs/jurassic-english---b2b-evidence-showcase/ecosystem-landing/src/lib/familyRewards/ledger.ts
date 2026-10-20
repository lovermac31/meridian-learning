// Family Rewards private ledger rules.
//
// The pilot ledger is kept by hand in the owner's private Google Sheet; this
// module is the executable statement of the rules the owner applies there,
// exercised by scripts/family-rewards-ledger.test.mjs. It is never imported
// by a page, so it never ships to the browser, and no page can grant credit.
//
// Approval, qualification, credit issue and redemption are separate actions.
// Every action returns a new state or throws a LedgerError; nothing mutates.
// Free of imports so Node can run it directly (rules are passed in).

export type Rules = {
  rewardPerHouseholdVnd: number;
  qualifyingLessons: number;
  maxRedemptionPerPackageVnd: number;
};

export type Member = {
  code: string;
  householdId: string;
  status: "approved";
  issuedVnd: number;
  redeemedVnd: number;
};

export type Referral = {
  bookingRef: string;
  newHouseholdId: string;
  code: string;
  declaredAt: string;
  paidAt: string | null;
  termsVersion: string;
  lessonsPaid: number;
  lessonsCompleted: number;
  refunded: boolean;
  disputeOpen: boolean;
  /** Reserve held against the pilot budget once eligibility is confirmed. */
  reservedVnd: number;
  status: "eligible" | "qualified" | "credited" | "void";
};

export type Ledger = {
  termsVersion: string;
  budgetVnd: number;
  reservedVnd: number;
  members: Record<string, Member>;
  referrals: Record<string, Referral>;
  redeemedInvoices: string[];
  audit: string[];
};

export class LedgerError extends Error {}

const fail = (message: string): never => {
  throw new LedgerError(message);
};

export function createLedger(termsVersion: string, budgetVnd: number): Ledger {
  return { termsVersion, budgetVnd, reservedVnd: 0, members: {}, referrals: {}, redeemedInvoices: [], audit: [] };
}

/** Owner approves a registration and issues an opaque code. */
export function approveMember(ledger: Ledger, code: string, householdId: string): Ledger {
  if (!/^[A-Z0-9]{6,}$/.test(code)) fail("code must be opaque: upper-case letters and digits only");
  if (ledger.members[code]) fail(`code ${code} already issued`);
  if (Object.values(ledger.members).some((m) => m.householdId === householdId)) fail(`household ${householdId} is already a member`);
  const member: Member = { code, householdId, status: "approved", issuedVnd: 0, redeemedVnd: 0 };
  return { ...ledger, members: { ...ledger.members, [code]: member }, audit: [...ledger.audit, `approve ${code}`] };
}

/**
 * Record a new household's code before its first package payment and
 * reserve the reward. Refuses late codes, self-referral, a household that
 * already has a referral (one reward per household; the earliest valid code
 * stands) and bookings once the funded reserve is exhausted.
 */
export function recordReferral(
  ledger: Ledger,
  rules: Rules,
  r: { bookingRef: string; newHouseholdId: string; code: string; declaredAt: string; paidAt: string | null },
): Ledger {
  const member = ledger.members[r.code] ?? fail(`unknown code ${r.code}`);
  if (member.householdId === r.newHouseholdId) fail("self-referral or same-household referral");
  if (r.paidAt !== null && r.paidAt <= r.declaredAt) fail("code must be recorded before the first package payment");
  const existing = Object.values(ledger.referrals).find((x) => x.newHouseholdId === r.newHouseholdId && x.status !== "void");
  if (existing) fail(`household ${r.newHouseholdId} already referred with code ${existing.code}`);
  if (ledger.referrals[r.bookingRef]) fail(`booking ${r.bookingRef} already recorded`);
  if (ledger.reservedVnd + rules.rewardPerHouseholdVnd > ledger.budgetVnd) fail("pilot reserve exhausted: no new qualifying bookings");
  const referral: Referral = {
    ...r,
    termsVersion: ledger.termsVersion,
    lessonsPaid: 0,
    lessonsCompleted: 0,
    refunded: false,
    disputeOpen: false,
    reservedVnd: rules.rewardPerHouseholdVnd,
    status: "eligible",
  };
  return {
    ...ledger,
    reservedVnd: ledger.reservedVnd + rules.rewardPerHouseholdVnd,
    referrals: { ...ledger.referrals, [r.bookingRef]: referral },
    audit: [...ledger.audit, `record ${r.bookingRef} code ${r.code}`],
  };
}

/** Owner reconciles payment, attendance and refunds for a booking. */
export function updateBooking(
  ledger: Ledger,
  bookingRef: string,
  patch: Partial<Pick<Referral, "paidAt" | "lessonsPaid" | "lessonsCompleted" | "refunded" | "disputeOpen">>,
): Ledger {
  const referral = ledger.referrals[bookingRef] ?? fail(`unknown booking ${bookingRef}`);
  if (referral.status === "credited" || referral.status === "void") fail(`booking ${bookingRef} is closed (${referral.status})`);
  const next: Referral = { ...referral, ...patch };
  let reservedVnd = ledger.reservedVnd;
  if (next.refunded) {
    // Refund or cancellation before qualification: no reward; release the reserve.
    next.status = "void";
    reservedVnd -= referral.reservedVnd;
    next.reservedVnd = 0;
  }
  return {
    ...ledger,
    reservedVnd,
    referrals: { ...ledger.referrals, [bookingRef]: next },
    audit: [...ledger.audit, `update ${bookingRef} ${JSON.stringify(patch)}`],
  };
}

/** Separate action: confirm qualification once all conditions hold. */
export function qualify(ledger: Ledger, rules: Rules, bookingRef: string): Ledger {
  const r = ledger.referrals[bookingRef] ?? fail(`unknown booking ${bookingRef}`);
  if (r.status !== "eligible") fail(`booking ${bookingRef} is ${r.status}, not eligible`);
  if (r.paidAt === null) fail("first package not paid");
  if (r.lessonsPaid < rules.qualifyingLessons) fail(`only ${r.lessonsPaid} of ${rules.qualifyingLessons} lessons paid`);
  if (r.lessonsCompleted < rules.qualifyingLessons) fail(`only ${r.lessonsCompleted} of ${rules.qualifyingLessons} lessons completed`);
  if (r.disputeOpen) fail("unresolved payment or refund dispute");
  return {
    ...ledger,
    referrals: { ...ledger.referrals, [bookingRef]: { ...r, status: "qualified" } },
    audit: [...ledger.audit, `qualify ${bookingRef}`],
  };
}

/** Separate action: issue the reserved credit to the referrer. */
export function issueCredit(ledger: Ledger, rules: Rules, bookingRef: string): Ledger {
  const r = ledger.referrals[bookingRef] ?? fail(`unknown booking ${bookingRef}`);
  if (r.status !== "qualified") fail(`booking ${bookingRef} is ${r.status}; qualify it first`);
  const member = ledger.members[r.code];
  return {
    ...ledger,
    members: { ...ledger.members, [r.code]: { ...member, issuedVnd: member.issuedVnd + rules.rewardPerHouseholdVnd } },
    referrals: { ...ledger.referrals, [bookingRef]: { ...r, status: "credited" } },
    audit: [...ledger.audit, `credit ${r.code} +${rules.rewardPerHouseholdVnd} for ${bookingRef}`],
  };
}

export const balanceOf = (ledger: Ledger, code: string) => {
  const m = ledger.members[code] ?? fail(`unknown code ${code}`);
  return m.issuedVnd - m.redeemedVnd;
};

/**
 * Separate action: apply credit once to a later eight-lesson package
 * invoice. Capped per package; the rest carries forward. An invoice can be
 * credited only once.
 */
export function redeem(ledger: Ledger, rules: Rules, code: string, invoiceRef: string, requestedVnd: number): Ledger {
  if (ledger.redeemedInvoices.includes(invoiceRef)) fail(`invoice ${invoiceRef} already has credit applied`);
  if (requestedVnd <= 0) fail("redemption must be positive");
  if (requestedVnd > rules.maxRedemptionPerPackageVnd) fail(`at most ${rules.maxRedemptionPerPackageVnd} per package`);
  if (requestedVnd > balanceOf(ledger, code)) fail("redemption exceeds balance");
  const member = ledger.members[code];
  return {
    ...ledger,
    members: { ...ledger.members, [code]: { ...member, redeemedVnd: member.redeemedVnd + requestedVnd } },
    redeemedInvoices: [...ledger.redeemedInvoices, invoiceRef],
    audit: [...ledger.audit, `redeem ${code} -${requestedVnd} on ${invoiceRef}`],
  };
}

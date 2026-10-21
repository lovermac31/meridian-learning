// Family Rewards: the single versioned source of programme terms.
//
// The referrals page, the academy card, the footer link, the Google Form
// description and the private ledger rules (ledger.ts) all read from here,
// so the amounts and conditions cannot drift apart. Change a rule only by
// bumping TERMS_VERSION; changes apply to new referrals only, and confirmed
// rewards and earned balances are kept (see TERMS below).
//
// Keep this file free of imports and non-erasable TypeScript (no enums), so
// scripts/family-rewards-ledger.test.mjs can load it directly under Node.
//
// Funding evidence, teacher compensation and the pilot reserve are private
// and deliberately NOT recorded here.

export const TERMS_VERSION = "FR-2026-10-pilot-v1";
export const TERMS_DATE = "2026-10-20";

export const RULES = {
  /** Tuition credit earned per qualifying new household, in VND. */
  rewardPerHouseholdVnd: 200_000,
  /** Paid individual lessons the new household must buy and complete. */
  qualifyingLessons: 8,
  /** Most credit that can be applied to one subsequent eight-lesson package, in VND. */
  maxRedemptionPerPackageVnd: 400_000,
  /** Lessons in the package that credit is applied to. */
  redemptionPackageLessons: 8,
  /** Rewards per new household, ever. */
  rewardsPerHousehold: 1,
} as const;

export const formatVnd = (amount: number) => `${amount.toLocaleString("en-US")}₫`;

export const REWARD = formatVnd(RULES.rewardPerHouseholdVnd);
export const TWO_FAMILY_REWARD = formatVnd(RULES.rewardPerHouseholdVnd * 2);
export const MAX_REDEMPTION = formatVnd(RULES.maxRedemptionPerPackageVnd);

export const ROUTE = "/student-academy/referrals";

// Contact fallback: the verified academy contact already published on
// /student-academy and in the academy footer.
export const CONTACT_EMAIL = "info@jurassicenglish.com";
export const EMAIL_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Family Rewards: join the programme")}`;
export const ZALO_HREF = "https://zalo.me/84396085076";
export const ZALO_LABEL = "+84 396 085 076";

/**
 * Google Form responder URL (…/viewform). Only a URL that was opened signed
 * out and submitted with synthetic data may go here; never an /edit link.
 * While null, the page's primary button falls back to the email request,
 * which is a working path, not a placeholder. Verified 2026-10-21: opened
 * signed out, one synthetic non-Gmail submission received in the private
 * response sheet (owner-only), results summary off.
 */
export const FORM_RESPONDER_URL: string | null =
  "https://docs.google.com/forms/d/e/1FAIpQLSe_YKZ_4e4LozemiuVa5Rn0qjeaFzmTIGJMvoQGP-FLOWgpXQ/viewform";

export const FORM_URL_PATTERN = /^https:\/\/docs\.google\.com\/forms\/d\/e\/[A-Za-z0-9_-]{20,}\/viewform$/;

export function isVerifiedFormUrl(url: string | null): url is string {
  return url !== null && FORM_URL_PATTERN.test(url);
}

/** Text the form shows after submission. It confirms receipt only. */
export const CONFIRMATION_TEXT =
  "Thank you. We have received your request. We will confirm your membership and send your referral code. Submitting this form does not create credit or enrol anyone in lessons.";

export const STEPS = [
  {
    title: "Join and receive your code",
    body: "Register below. We check that you are a current or former Student Academy family or adult learner, then send you a personal referral code.",
  },
  {
    title: "Share your code",
    body: "Give the code to a family you know. They contact us themselves. We never contact anyone on your behalf.",
  },
  {
    title: `Credit after ${RULES.qualifyingLessons} lessons`,
    body: `The new family gives us your code before their first package payment. When they have paid for and completed ${RULES.qualifyingLessons} individual lessons, we add ${REWARD} to your balance.`,
  },
] as const;

export const TERMS = [
  `Open to current and former Student Academy parents or guardians, and adult learners. You must join and receive a code before you refer anyone.`,
  `A new household qualifies when it gives your code before its first package payment, then pays for and completes ${RULES.qualifyingLessons} individual lessons, with no unresolved payment or refund dispute at that time.`,
  `It must be a genuinely new paying household. An earlier enquiry does not disqualify it; an existing paid booking does.`,
  `Each new household earns one reward, once. Self-referrals and referrals within your own household do not count. If more than one code is given, the earliest valid code given before payment counts.`,
  `A refund or cancellation before the ${RULES.qualifyingLessons} lessons are completed means no reward for that household.`,
  `Credit is tuition credit only. It cannot be exchanged for cash.`,
  `Use up to ${MAX_REDEMPTION} of credit on each later ${RULES.redemptionPackageLessons}-lesson individual package. Any remaining balance carries forward and does not expire during the pilot.`,
  `Before payment we confirm whether the chosen package takes part and whether the credit can be combined with any other offer.`,
  `Nothing renews automatically. No reward depends on a review or public endorsement.`,
  `Your existing tuition and agreements are not affected, and never depend on referrals.`,
  `Joining confirms your request only. It does not create credit or enrol anyone in lessons.`,
  `We may change the programme for new referrals. Confirmed rewards and earned balances are kept.`,
] as const;

export const PRIVACY = [
  "We ask only for your name, your own email, an optional Zalo or phone number, and whether you are a current or former customer.",
  "We do not ask for children's details or for your friends' contact details. Joining does not sign you up for marketing.",
  "Responses are private to the programme owner. We keep your details only as long as we need them to run the programme and honour your balance.",
] as const;

/**
 * Vietnamese copy from the 20 October 2026 blueprint. MACHINE DRAFT, NOT
 * REVIEWED by a native speaker, and the academy app has no Vietnamese
 * locale, so nothing below is rendered. Amounts and conditions must stay
 * identical to the English above.
 */
export const VI_DRAFT = {
  reviewStatus: "machine-draft-unreviewed",
  title: "Ưu đãi giới thiệu bạn học",
  card: "Giới thiệu một gia đình mới và nhận 200.000₫ để trừ vào học phí khi học viên được giới thiệu hoàn thành gói 8 buổi học đủ điều kiện. Hai gia đình đủ điều kiện: 400.000₫.",
  buttons: ["Xem cách tham gia", "Đăng ký tham gia"],
  smallPrint:
    "Áp dụng điều kiện tham gia và giới hạn sử dụng ưu đãi. Chỉ dùng để khấu trừ học phí, không quy đổi thành tiền mặt.",
} as const;

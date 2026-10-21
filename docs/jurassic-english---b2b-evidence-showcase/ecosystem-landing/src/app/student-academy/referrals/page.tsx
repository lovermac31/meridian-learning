import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { familyRewardsMode } from "@/lib/familyRewards/flag";
import { accountsEnabled, ACCOUNT_PATH } from "@/lib/familyRewards/server/env";
import {
  CONTACT_EMAIL,
  EMAIL_HREF,
  FORM_RESPONDER_URL,
  MAX_REDEMPTION,
  PRIVACY,
  REWARD,
  ROUTE,
  RULES,
  STEPS,
  TERMS,
  TERMS_DATE,
  TERMS_VERSION,
  TWO_FAMILY_REWARD,
  ZALO_HREF,
  ZALO_LABEL,
  isVerifiedFormUrl,
} from "@/lib/familyRewards/terms";

// Family Rewards (pilot). Quiet placement: reached from a compact card on
// /student-academy and the academy footer; no header item, popup or
// homepage placement. Every amount and condition comes from terms.ts.
// Gated by familyRewardsMode(): production 404s until funding is approved.

const DESCRIPTION = `Student Academy families earn ${REWARD} tuition credit for each new family they introduce who completes ${RULES.qualifyingLessons} paid individual lessons. Two qualifying families earn ${TWO_FAMILY_REWARD}. Terms, steps and how to join.`;

// generateMetadata, not a static export: static metadata is still sent in
// the RSC payload of the gated 404, which would publish the amounts.
export function generateMetadata(): Metadata {
  if (familyRewardsMode() === "off") return {};
  return METADATA;
}

const METADATA: Metadata = {
  title: "Family Rewards | Jurassic English™ Student Academy",
  description: DESCRIPTION,
  alternates: { canonical: ROUTE },
  openGraph: {
    title: "Family Rewards | Jurassic English™ Student Academy",
    description: DESCRIPTION,
    type: "website",
    siteName: "Jurassic English™",
    url: ROUTE,
  },
};

const PRIMARY =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-2.5 text-center text-sm font-extrabold text-white transition hover:bg-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";
const TEXT_LINK =
  "font-bold text-[#1E4D3B] underline underline-offset-4 hover:text-[#B45309] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2 rounded-sm";
const EYEBROW = "text-xs font-bold uppercase tracking-[0.14em] text-[#B45309]";
const H2 = "text-xl font-extrabold leading-tight text-[#1E4D3B] sm:text-2xl";
const BACK = `inline-flex min-h-11 items-center gap-2 text-sm ${TEXT_LINK}`;

export default function FamilyRewardsPage() {
  const mode = familyRewardsMode();
  if (mode === "off") notFound();

  const formUrl = isVerifiedFormUrl(FORM_RESPONDER_URL) ? FORM_RESPONDER_URL : null;

  return (
    <div className="bg-[#FAF7F2] text-[#1C2526]">
      {mode === "preview" ? (
        <p role="note" className="bg-[#1E4D3B] px-4 py-2 text-center text-sm font-bold text-white">
          Preview only: this programme is not yet open.
        </p>
      ) : null}

      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <a href="/student-academy" className={BACK}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Student Academy
        </a>

        <header className="mt-4">
          <p className={EYEBROW}>Student Academy · Pilot programme</p>
          <h1 className="mt-3 text-[2rem] font-extrabold leading-[1.1] text-[#1E4D3B] sm:text-[2.4rem]">Family Rewards</h1>
          <p className="mt-4 text-base leading-relaxed text-[#4A5568] sm:text-lg">
            Introduce a new family to the Student Academy. When they complete their first {RULES.qualifyingLessons} paid
            individual lessons, you receive {REWARD} of tuition credit.
          </p>
        </header>

        <section aria-labelledby="amounts-heading" className="mt-8">
          <h2 id="amounts-heading" className="sr-only">Reward amounts</h2>
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[1.25rem] border border-[#E6DEC8] bg-white p-5">
              <dt className="text-sm font-bold text-[#4A5568]">One qualifying family</dt>
              <dd className="mt-1 text-2xl font-extrabold text-[#1E4D3B]">{REWARD}</dd>
            </div>
            <div className="rounded-[1.25rem] border border-[#E6DEC8] bg-white p-5">
              <dt className="text-sm font-bold text-[#4A5568]">Two qualifying families</dt>
              <dd className="mt-1 text-2xl font-extrabold text-[#1E4D3B]">{TWO_FAMILY_REWARD}</dd>
            </div>
          </dl>
          <p className="mt-3 text-sm text-[#4A5568]">
            Tuition credit, not cash. Each new household counts once. Your first referral earns usable credit on its own.
          </p>
        </section>

        <section aria-labelledby="steps-heading" className="mt-10">
          <h2 id="steps-heading" className={H2}>How it works</h2>
          <ol className="mt-5 space-y-5">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span aria-hidden="true" className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#1E4D3B] text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-extrabold text-[#1E4D3B]">{step.title}</h3>
                  <p className="mt-1 text-[#4A5568]">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section id="join" aria-labelledby="join-heading" className="mt-10 scroll-mt-24 rounded-[1.25rem] border border-[#E6DEC8] bg-white p-5 sm:p-6">
          <h2 id="join-heading" className={H2}>Join the programme</h2>
          <p className="mt-2 text-[#4A5568]">
            For current and former Student Academy parents or guardians, and adult learners.
          </p>
          <div className="mt-5">
            {formUrl ? (
              <a href={formUrl} target="_blank" rel="noopener noreferrer" className={PRIMARY}>
                Join the programme <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                <span className="sr-only">(opens Google Forms in a new tab)</span>
              </a>
            ) : (
              <a href={EMAIL_HREF} className={PRIMARY}>
                <Mail aria-hidden="true" className="h-4 w-4" /> Join by email
              </a>
            )}
          </div>
          <p className="mt-3 text-sm text-[#4A5568]">
            {formUrl
              ? "The form opens on Google Forms in a new tab. Any email address works; you do not need a Google account."
              : `Send us your name and say whether you are a current or former customer. We reply from ${CONTACT_EMAIL}.`}{" "}
            Joining confirms your request only. It does not create credit or enrol anyone in lessons.
          </p>
          {accountsEnabled() ? (
            <p className="mt-4 text-sm text-[#4A5568]">
              Already a member?{" "}
              <a href={ACCOUNT_PATH} className={TEXT_LINK}>
                Sign in to see your code and credit
              </a>
              .
            </p>
          ) : null}
          <p className="mt-4 text-sm text-[#4A5568]">
            Questions, or prefer to join another way?{" "}
            <a href={EMAIL_HREF} className={TEXT_LINK}>
              <Mail aria-hidden="true" className="mr-1 inline h-4 w-4" />
              Email {CONTACT_EMAIL}
            </a>{" "}
            or{" "}
            <a href={ZALO_HREF} target="_blank" rel="noopener noreferrer" className={TEXT_LINK}>
              <MessageCircle aria-hidden="true" className="mr-1 inline h-4 w-4" />
              message us on Zalo ({ZALO_LABEL})
            </a>
            .
          </p>
        </section>

        <section aria-labelledby="credit-heading" className="mt-10">
          <h2 id="credit-heading" className={H2}>Using your credit</h2>
          <p className="mt-3 leading-relaxed text-[#4A5568]">
            Use up to {MAX_REDEMPTION} of credit on each later {RULES.redemptionPackageLessons}-lesson individual package. With
            three qualifying families ({REWARD} × 3), you could use {MAX_REDEMPTION} on your next package and keep {REWARD} for
            the one after. Balances do not expire during the pilot.
          </p>
        </section>

        <section aria-labelledby="terms-heading" className="mt-10">
          <h2 id="terms-heading" className={H2}>Terms</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-[#4A5568] marker:text-[#B45309]">
            {TERMS.map((term) => (
              <li key={term}>{term}</li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[#4A5568]">
            Terms version {TERMS_VERSION}, {TERMS_DATE}. Your normal customer rights and our refund terms are unchanged.
          </p>
        </section>

        <section aria-labelledby="privacy-heading" className="mt-10">
          <h2 id="privacy-heading" className={H2}>Your privacy</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 leading-relaxed text-[#4A5568] marker:text-[#B45309]">
            {PRIVACY.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-[#4A5568]">
            See also our{" "}
            <a href="/legal/privacy" className={TEXT_LINK}>
              privacy policy
            </a>
            .
          </p>
        </section>

        <a href="/student-academy" className={`${BACK} mt-10`}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to Student Academy
        </a>
      </div>
    </div>
  );
}

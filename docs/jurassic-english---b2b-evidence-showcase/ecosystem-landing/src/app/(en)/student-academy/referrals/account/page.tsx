import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { CopyCodeButton } from "@/components/student-academy/CopyCodeButton";
import { accountsEnabled, ACCOUNT_PATH, db, sessionHash } from "@/lib/familyRewards/server/env";
import { customerAccount, FrError, type CustomerAccount } from "@/lib/familyRewards/server/rpc";
import { CONTACT_EMAIL, EMAIL_HREF, formatVnd, MAX_REDEMPTION, ROUTE, RULES, ZALO_HREF, ZALO_LABEL } from "@/lib/familyRewards/terms";

// Private account page: dynamic (reads the session cookie), noindex, never
// cached (next.config.ts and vercel.json set private, no-store), not in the
// sitemap. Data comes only from fr_customer_account, which returns the
// member's own code and totals plus neutral aliases for referred families.

export const metadata: Metadata = { title: "My Family Rewards account", robots: { index: false, follow: false } };

const H2 = "text-xl font-extrabold text-[#1E4D3B]";
const CARD = "rounded-[1.25rem] border border-[#E6DEC8] bg-white p-5";
const PRIMARY = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";
const LINK = "font-bold text-[#1E4D3B] underline underline-offset-4 hover:text-[#B45309]";

const MESSAGES: Record<string, string> = {
  rate_limited: "Too many sign-in links were requested. Please try again in an hour.",
  invalid: "Please enter a valid email address.",
  invalid_link: "That sign-in link has expired or was already used. Request a new one below.",
  unauthenticated: "Please sign in again.",
  paused: "Accounts are temporarily unavailable. Your balance is safe.",
  unavailable: "Sign-in is temporarily unavailable. Please contact us.",
};

const TYPE_LABEL: Record<string, string> = {
  reward: "Reward earned", opening: "Opening balance", redemption: "Credit used", redemption_reversal: "Credit restored (invoice cancelled)",
  adjustment: "Correction", reversal: "Correction (reversal)",
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#FAF7F2] text-[#1C2526]">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:px-6">
        <a href={ROUTE} className={`inline-flex min-h-11 items-center gap-2 text-sm ${LINK}`}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Family Rewards terms
        </a>
        {children}
        <section aria-labelledby="support-heading" className="mt-10 text-sm text-[#4A5568]">
          <h2 id="support-heading" className="font-extrabold text-[#1E4D3B]">Account help</h2>
          <p className="mt-2">
            Questions about your balance or a referral?{" "}
            <a className={LINK} href={EMAIL_HREF}><Mail aria-hidden="true" className="mr-1 inline h-4 w-4" />Email {CONTACT_EMAIL}</a> or{" "}
            <a className={LINK} href={ZALO_HREF} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" className="mr-1 inline h-4 w-4" />Zalo {ZALO_LABEL}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}

function SignIn({ sent, error }: { sent: boolean; error?: string }) {
  return (
    <Shell>
      <h1 className="mt-4 text-[2rem] font-extrabold leading-tight text-[#1E4D3B]">My Family Rewards account</h1>
      <p className="mt-3 text-[#4A5568]">Sign in with the email address we linked to your membership. We will email you a one-time link; no password is needed.</p>
      {error ? <p role="alert" className="mt-4 rounded-xl bg-[#FDECEA] p-3 text-sm font-bold text-[#8A1C12]">{MESSAGES[error] ?? "Something went wrong. Please try again."}</p> : null}
      {sent ? (
        <p role="status" className="mt-4 rounded-xl bg-[#E6F4EA] p-3 text-sm font-bold text-[#137333]">If that address is linked to a membership, a sign-in link is on its way. It works once, for 30 minutes.</p>
      ) : null}
      <form method="post" action={`${ACCOUNT_PATH}/sign-in`} className={`${CARD} mt-6`}>
        <label htmlFor="fr-email" className="block text-sm font-bold text-[#1E4D3B]">Email address</label>
        <input id="fr-email" name="email" type="email" required autoComplete="email" className="mt-2 block min-h-11 w-full rounded-xl border border-[#E6DEC8] px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B]" />
        <button type="submit" className={`${PRIMARY} mt-4`}>Email me a sign-in link</button>
      </form>
      <p className="mt-4 text-sm text-[#4A5568]">Not a member yet? <a className={LINK} href={`${ROUTE}#join`}>Join the programme</a>.</p>
    </Shell>
  );
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  await connection(); // always request-time: never prerendered or shared
  if (!accountsEnabled()) notFound();
  const params = await searchParams;
  const session = await sessionHash();
  if (!session) return <SignIn sent={params.sent === "1"} error={params.error} />;

  let account: CustomerAccount;
  try {
    account = await customerAccount(db(), session);
  } catch (error) {
    if (error instanceof FrError && error.code === "unauthenticated") return <SignIn sent={false} error="unauthenticated" />;
    return <SignIn sent={false} error={error instanceof FrError ? error.code : "unavailable"} />;
  }

  const signOut = (
    <form method="post" action={`${ACCOUNT_PATH}/sign-out`} className="mt-4">
      <button type="submit" className={`text-sm ${LINK}`}>Sign out</button>
    </form>
  );

  if (!account.member) {
    return (
      <Shell>
        <h1 className="mt-4 text-[2rem] font-extrabold text-[#1E4D3B]">My Family Rewards account</h1>
        <p className="mt-3 text-[#4A5568]">You are signed in, but this email is not linked to a membership yet. If you have joined, we may still be checking your registration. Contact us below and we will link it.</p>
        {account.is_owner ? <p className="mt-3"><a className={LINK} href={`${ACCOUNT_PATH}/admin`}>Owner administration</a></p> : null}
        {signOut}
      </Shell>
    );
  }

  const t = account.totals;
  const shareText = `Jurassic English Student Academy: my Family Rewards code is ${account.referral_code}. Please give it to the academy before your first package payment. Terms: https://jurassicenglish.com${ROUTE}`;
  const cards = [
    { label: "Earned", value: t.earned, note: "Rewards credited to you" },
    { label: "Used", value: t.used, note: "Applied to your invoices" },
    { label: "Available", value: t.available, note: t.held ? `${formatVnd(t.held)} reserved for an invoice` : "Ready for your next package" },
    { label: "Pending", value: t.pending, note: "Awaiting verification; not yet usable" },
  ];

  return (
    <Shell>
      <h1 className="mt-4 text-[2rem] font-extrabold text-[#1E4D3B]">My Family Rewards account</h1>
      {account.is_owner ? <p className="mt-2"><a className={LINK} href={`${ACCOUNT_PATH}/admin`}>Owner administration</a></p> : null}

      <section aria-labelledby="code-heading" className={`${CARD} mt-6`}>
        <h2 id="code-heading" className={H2}>Your referral code</h2>
        <p className="mt-3 font-mono text-3xl font-extrabold tracking-wider text-[#1C2526]">{account.referral_code}</p>
        <p className="mt-2 text-sm text-[#4A5568]">Share it with a family you know. They give it to us before their first package payment. Your code is not a password.</p>
        <div className="mt-4"><CopyCodeButton code={account.referral_code} shareText={shareText} /></div>
      </section>

      <section aria-labelledby="balance-heading" className="mt-8">
        <h2 id="balance-heading" className={H2}>Your credit</h2>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className={CARD}>
              <dt className="text-sm font-bold text-[#4A5568]">{c.label}</dt>
              <dd className="mt-1 text-xl font-extrabold text-[#1E4D3B]">{formatVnd(c.value)}</dd>
              <dd className="mt-1 text-xs text-[#4A5568]">{c.note}</dd>
            </div>
          ))}
        </dl>
        {t.adjustments ? <p className="mt-2 text-sm text-[#4A5568]">Includes documented corrections of {formatVnd(t.adjustments)}.</p> : null}
      </section>

      <section aria-labelledby="use-heading" className={`${CARD} mt-8`}>
        <h2 id="use-heading" className={H2}>Using your credit</h2>
        <p className="mt-2 text-[#4A5568]">
          When you book your next {RULES.redemptionPackageLessons}-lesson individual package, tell us you would like to use credit. We apply up to {MAX_REDEMPTION} to that
          package&apos;s invoice; anything left stays in your balance for the next one. Credit is tuition credit only, not cash.
        </p>
        <a className={`${PRIMARY} mt-4`} href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Use Family Rewards credit (${account.referral_code})`)}`}>
          <Mail aria-hidden="true" className="h-4 w-4" /> Ask to use credit
        </a>
      </section>

      <section aria-labelledby="ref-heading" className="mt-8">
        <h2 id="ref-heading" className={H2}>Families you introduced</h2>
        {account.referrals.length === 0 ? (
          <p className="mt-2 text-[#4A5568]">No referrals recorded yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[20rem] text-left text-sm">
              <caption className="sr-only">Referrals and their status</caption>
              <thead><tr className="border-b border-[#E6DEC8] text-[#4A5568]"><th scope="col" className="py-2 pr-3">Family</th><th scope="col" className="py-2 pr-3">Since</th><th scope="col" className="py-2 pr-3">Status</th><th scope="col" className="py-2">Reward</th></tr></thead>
              <tbody>
                {account.referrals.map((r) => (
                  <tr key={`${r.family}-${r.since}`} className="border-b border-[#E6DEC8]">
                    <td className="py-2 pr-3 font-bold">{r.family}</td><td className="py-2 pr-3">{r.since}</td><td className="py-2 pr-3">{r.status}</td><td className="py-2">{formatVnd(r.reward)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section aria-labelledby="hist-heading" className="mt-8">
        <h2 id="hist-heading" className={H2}>Credit history</h2>
        {account.history.length === 0 ? (
          <p className="mt-2 text-[#4A5568]">No credit transactions yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[20rem] text-left text-sm">
              <caption className="sr-only">Dated credit transactions</caption>
              <thead><tr className="border-b border-[#E6DEC8] text-[#4A5568]"><th scope="col" className="py-2 pr-3">Date</th><th scope="col" className="py-2 pr-3">What</th><th scope="col" className="py-2 text-right">Amount</th></tr></thead>
              <tbody>
                {account.history.map((h, i) => (
                  <tr key={i} className="border-b border-[#E6DEC8]">
                    <td className="py-2 pr-3">{h.date}</td>
                    <td className="py-2 pr-3">{TYPE_LABEL[h.type] ?? h.type}{h.family ? ` · ${h.family}` : ""}{h.invoice ? ` · invoice ${h.invoice}` : ""}</td>
                    <td className={`py-2 text-right font-bold ${h.amount < 0 ? "text-[#8A1C12]" : "text-[#137333]"}`}>{h.amount > 0 ? "+" : "−"}{formatVnd(Math.abs(h.amount))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {signOut}
    </Shell>
  );
}

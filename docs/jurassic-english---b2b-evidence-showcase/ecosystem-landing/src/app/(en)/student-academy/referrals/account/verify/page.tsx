import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { accountsEnabled, ACCOUNT_PATH } from "@/lib/familyRewards/server/env";

export const metadata: Metadata = { title: "Sign in | Family Rewards", robots: { index: false, follow: false } };

// The emailed link lands here; signing in needs one more click (POST), so a
// mail scanner that opens the link cannot use up the one-time token.
export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  await connection(); // always request-time: never prerendered or shared
  if (!accountsEnabled()) notFound();
  const { t } = await searchParams;
  const token = typeof t === "string" && /^[A-Za-z0-9_-]{40,64}$/.test(t) ? t : null;
  return (
    <div className="bg-[#FAF7F2] px-4 py-16 text-[#1C2526]">
      <div className="mx-auto max-w-md rounded-[1.25rem] border border-[#E6DEC8] bg-white p-6">
        <h1 className="text-2xl font-extrabold text-[#1E4D3B]">Open your Family Rewards account</h1>
        {token ? (
          <form method="post" action={`${ACCOUNT_PATH}/verify/confirm`} className="mt-5">
            <input type="hidden" name="t" value={token} />
            <button type="submit" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#B45309] px-5 py-2.5 text-sm font-extrabold text-white hover:bg-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2">
              Continue to my account
            </button>
          </form>
        ) : (
          <p className="mt-3 text-[#4A5568]">This link is not valid. <a className="font-bold text-[#1E4D3B] underline" href={ACCOUNT_PATH}>Request a new sign-in link</a>.</p>
        )}
      </div>
    </div>
  );
}

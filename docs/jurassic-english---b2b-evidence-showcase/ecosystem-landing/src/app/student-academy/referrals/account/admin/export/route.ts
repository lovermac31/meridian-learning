import { accountsEnabled, db, sessionHash } from "@/lib/familyRewards/server/env";
import { FrError, ownerOverview } from "@/lib/familyRewards/server/rpc";

import { csvSection as section } from "@/lib/familyRewards/server/csv";

// Owner-only private accounting export (formula-safe cells; see csv.ts).
export async function GET() {
  if (!accountsEnabled()) return new Response("Not found", { status: 404 });
  const session = await sessionHash();
  if (!session) return new Response("Sign in first", { status: 401, headers: { "Cache-Control": "private, no-store" } });
  try {
    const o = await ownerOverview(db(), session);
    const body = [section("Members", o.members), section("Referrals", o.referrals), section("Invoices", o.invoices),
      section("Redemptions", o.redemptions), section("Ledger", o.ledger), section("Reconciliation", [o.reconciliation]), section("Budget", [o.budget])].join("\n");
    return new Response(body, { headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="family-rewards-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    } });
  } catch (error) {
    const forbidden = error instanceof FrError && (error.code === "forbidden" || error.code === "unauthenticated");
    return new Response(forbidden ? "Owner access only" : "Export unavailable", { status: forbidden ? 403 : 500, headers: { "Cache-Control": "private, no-store" } });
  }
}

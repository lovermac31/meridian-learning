import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { accountsEnabled, ACCOUNT_PATH, db, requestKey, sessionHash } from "@/lib/familyRewards/server/env";
import { FrError, ownerOverview, type OwnerOverview } from "@/lib/familyRewards/server/rpc";
import { formatVnd, TERMS_VERSION } from "@/lib/familyRewards/terms";

// Owner administration. Every read and write goes through fr_owner_* database
// functions, which reject any session that is not an owner. Forms post to
// ./action with a one-time request key, so a double submit is applied once.

export const metadata: Metadata = { title: "Family Rewards administration", robots: { index: false, follow: false } };

const ACTION = `${ACCOUNT_PATH}/admin/action`;
const INPUT = "mt-1 block min-h-10 w-full rounded-lg border border-[#E6DEC8] px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B]";
const BUTTON = "mt-3 inline-flex min-h-10 items-center rounded-full bg-[#1E4D3B] px-4 text-sm font-bold text-white hover:bg-[#B45309] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";
const TH = "border-b border-[#E6DEC8] px-2 py-1 text-left font-bold";
const TD = "border-b border-[#E6DEC8] px-2 py-1 align-top";

// Request-time default for date inputs (server render, once per request).
function hanoiNow() {
  return new Date(Date.now() + 7 * 3600_000).toISOString().slice(0, 16) + "+07:00";
}

type Field = { name: string; label: string; type?: string; required?: boolean; placeholder?: string; defaultValue?: string };

function OpForm({ op, title, fields, money = false, hint }: { op: string; title: string; fields: Field[]; money?: boolean; hint?: string }) {
  return (
    <form method="post" action={ACTION} className="rounded-xl border border-[#E6DEC8] bg-white p-4">
      <h3 className="font-extrabold text-[#1E4D3B]">{title}</h3>
      {hint ? <p className="mt-1 text-xs text-[#4A5568]">{hint}</p> : null}
      <input type="hidden" name="op" value={op} />
      <input type="hidden" name="key" value={requestKey()} />
      {fields.map((f) => f.type === "checkbox" ? (
        <label key={f.name} className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name={f.name} defaultChecked={f.defaultValue === "on"} /> {f.label}</label>
      ) : (
        <label key={f.name} className="mt-2 block text-sm font-bold">{f.label}
          <input name={f.name} type={f.type ?? "text"} required={f.required} placeholder={f.placeholder} defaultValue={f.defaultValue} className={INPUT} />
        </label>
      ))}
      <label className="mt-2 block text-sm font-bold">Reason (recorded in the audit log)
        <input name="reason" required minLength={3} maxLength={500} className={INPUT} />
      </label>
      {money ? <label className="mt-2 flex items-center gap-2 text-sm font-bold text-[#8A1C12]"><input type="checkbox" name="confirm" required /> I have checked this; apply it</label> : null}
      <button type="submit" className={BUTTON}>{title}</button>
    </form>
  );
}

function Table({ caption, rows, cols }: { caption: string; rows: Record<string, unknown>[]; cols: string[] }) {
  return (
    <div className="mt-3 overflow-x-auto">
      <table className="w-full min-w-[40rem] text-xs">
        <caption className="text-left text-sm font-extrabold text-[#1E4D3B]">{caption}</caption>
        <thead><tr>{cols.map((c) => <th key={c} scope="col" className={TH}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((r, i) => (
            <tr key={i}>{cols.map((c) => <td key={c} className={TD}>{typeof r[c] === "object" ? JSON.stringify(r[c]) : String(r[c] ?? "")}</td>)}</tr>
          )) : <tr><td className={TD} colSpan={cols.length}>None</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ ok?: string; result?: string; error?: string; message?: string }> }) {
  await connection(); // always request-time: never prerendered or shared
  if (!accountsEnabled()) notFound();
  const session = await sessionHash();
  let o: OwnerOverview | null = null;
  let denied = !session;
  if (session) {
    try { o = await ownerOverview(db(), session); } catch (error) { denied = error instanceof FrError; if (!denied) throw error; }
  }
  if (denied || !o) {
    return <div className="px-4 py-16 text-center"><h1 className="text-2xl font-extrabold text-[#1E4D3B]">Owner access only</h1><p className="mt-2"><a className="font-bold underline" href={ACCOUNT_PATH}>Sign in</a></p></div>;
  }
  const p = await searchParams;
  const nowLocal = hanoiNow();

  return (
    <div className="bg-[#FAF7F2] px-4 pb-16 pt-6 text-[#1C2526] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p><a className="text-sm font-bold underline" href={ACCOUNT_PATH}>← My account</a></p>
        <h1 className="mt-2 text-2xl font-extrabold text-[#1E4D3B]">Family Rewards administration</h1>
        {p.ok ? <p role="status" className="mt-3 rounded-lg bg-[#E6F4EA] p-3 text-sm font-bold text-[#137333]">Saved: {p.ok}. {p.result}</p> : null}
        {p.error ? <p role="alert" className="mt-3 rounded-lg bg-[#FDECEA] p-3 text-sm font-bold text-[#8A1C12]">Not applied ({p.error}): {p.message}</p> : null}

        <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Programme status">
          <div className="rounded-xl border border-[#E6DEC8] bg-white p-4 text-sm"><b>Funded</b><br />{formatVnd(o.budget.funded_vnd)}</div>
          <div className="rounded-xl border border-[#E6DEC8] bg-white p-4 text-sm"><b>Reserved / issued</b><br />{formatVnd(o.budget.reserved_vnd)} / {formatVnd(o.budget.issued_vnd)}</div>
          <div className="rounded-xl border border-[#E6DEC8] bg-white p-4 text-sm"><b>Switches</b><br />enrolment {String(o.settings.enrolment_open)} · accounts {String(o.settings.dashboard_open)} · credit changes {String(o.settings.ledger_writes_open)}</div>
        </section>
        <p className="mt-2 text-sm">Reconciliation: ledger total {formatVnd(Number(o.reconciliation.ledger_total))}; rewards posted {formatVnd(Number(o.reconciliation.rewards_posted))} = budget issued {formatVnd(Number(o.reconciliation.budget_issued))}; open reservations {formatVnd(Number(o.reconciliation.reserved_open))} = budget reserved {formatVnd(Number(o.reconciliation.budget_reserved))}. <a className="font-bold underline" href={`${ACCOUNT_PATH}/admin/export`}>Download private CSV</a></p>

        <Table caption="Members" rows={o.members} cols={["code", "name", "login_email", "phone", "verified", "status", "alias", "posted", "held", "id"]} />
        <Table caption="Referrals (private identities)" rows={o.referrals} cols={["referrer_code", "family", "name", "email", "package_ref", "declared", "first_payment", "paid", "completed", "issue_open", "refunded", "evidence", "status", "reward", "terms", "id"]} />
        <Table caption="Invoices" rows={o.invoices} cols={["id", "package", "payable", "committed", "status", "package_committed", "package_cap", "eligible"]} />
        <Table caption="Redemptions" rows={o.redemptions} cols={["code", "package", "invoice", "amount", "state", "external_ref", "id"]} />
        <Table caption="Ledger (append-only)" rows={o.ledger} cols={["at", "code", "type", "amount", "actor", "reason", "id"]} />

        <h2 className="mt-10 text-xl font-extrabold text-[#1E4D3B]">Actions</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <OpForm op="approve_member" title="Approve member and issue code" hint="Only after checking the person is a current or former academy family. They see their account after signing in with this email."
            fields={[{ name: "full_name", label: "Adult's full name", required: true }, { name: "email", label: "Their email (sign-in address)", type: "email", required: true },
              { name: "phone", label: "Zalo or phone (optional)" }, { name: "terms_version", label: "Terms version accepted", defaultValue: TERMS_VERSION, required: true },
              { name: "terms_accepted_at", label: "Terms accepted at (with time zone)", defaultValue: nowLocal, required: true }]} />
          <OpForm op="record_referral" title="Record referral (before first payment)" hint="Reserves the reward against the funded budget. Use the code the new family gave."
            fields={[{ name: "code", label: "Referral code", placeholder: "JE-XXXXXX", required: true }, { name: "full_name", label: "New family adult's name", required: true },
              { name: "email", label: "New family email", type: "email" }, { name: "phone", label: "New family phone" }, { name: "package_ref", label: "Booking/package reference", required: true },
              { name: "declared_at", label: "Code given at (with time zone)", defaultValue: nowLocal, required: true }]} />
          <OpForm op="update_evidence" title="Record payment and lesson evidence" hint="First payment time cannot change once recorded."
            fields={[{ name: "referral", label: "Referral id", required: true }, { name: "first_payment_at", label: "First package payment at (with time zone)" },
              { name: "lessons_paid", label: "Lessons paid", type: "number", required: true }, { name: "lessons_completed", label: "Lessons completed", type: "number", required: true },
              { name: "issue_open", label: "Unresolved payment or refund issue", type: "checkbox" }, { name: "refunded", label: "Refunded or cancelled", type: "checkbox" },
              { name: "evidence_ref", label: "Evidence reference (bank ref, attendance sheet)" }]} />
          <OpForm op="approve_qualification" title="Approve qualification and credit reward" money
            hint="Checks the recorded evidence (8 paid and completed lessons, payment after the code, no open issue or refund) and credits the reward in the same step."
            fields={[{ name: "referral", label: "Referral id", required: true }]} />
          <OpForm op="void_referral" title="Void unearned referral" money hint="Releases the reserved reward." fields={[{ name: "referral", label: "Referral id", required: true }]} />
          <OpForm op="register_invoice" title="Register later package invoice" fields={[{ name: "package_id", label: "Package id", required: true }, { name: "member", label: "Member id", required: true },
            { name: "lessons", label: "Lessons in package", type: "number", defaultValue: "8", required: true }, { name: "eligible", label: "Package takes part in Family Rewards", type: "checkbox", defaultValue: "on" },
            { name: "invoice_id", label: "Invoice id", required: true }, { name: "payable", label: "Amount payable (VND)", type: "number", required: true }]} />
          <OpForm op="hold_redemption" title="Hold credit for an invoice" money fields={[{ name: "member", label: "Member id", required: true }, { name: "invoice_id", label: "Invoice id", required: true },
            { name: "amount", label: "Amount (VND)", type: "number", required: true }]} />
          <OpForm op="confirm_redemption" title="Confirm credit applied to invoice" money hint="Only after the discount appears on the actual invoice."
            fields={[{ name: "redemption", label: "Redemption id", required: true }, { name: "external_ref", label: "Invoice/discount reference", required: true }]} />
          <OpForm op="release_redemption" title="Release a held credit" hint="Use when applying the discount failed." fields={[{ name: "redemption", label: "Redemption id", required: true }]} />
          <OpForm op="reverse_redemption" title="Restore credit (invoice cancelled)" money fields={[{ name: "redemption", label: "Redemption id", required: true }]} />
          <OpForm op="adjust" title="Documented correction" money hint="Positive or negative VND, or reverse a specific reward/adjustment entry."
            fields={[{ name: "member", label: "Member id", required: true }, { name: "amount", label: "Amount (VND, e.g. -50000)", type: "number" }, { name: "reverses_entry", label: "Or: entry id to reverse" }]} />
          <OpForm op="opening_balance" title="Import established credit (once per member)" money hint="Only for credit confirmed to a customer before this ledger existed. Cite the record."
            fields={[{ name: "member", label: "Member id", required: true }, { name: "amount", label: "Amount (VND)", type: "number", required: true }, { name: "source_ref", label: "Source record (message, invoice, sheet row)", required: true }]} />
          <OpForm op="set_budget" title="Set funded allocation" money fields={[{ name: "funded", label: "Funded total (VND)", type: "number", required: true }]} />
          <OpForm op="set_flags" title="Programme switches" hint="Turning off enrolment never hides existing accounts or balances."
            fields={[{ name: "enrolment", label: "Accept new members and referrals", type: "checkbox", defaultValue: o.settings.enrolment_open ? "on" : "" },
              { name: "dashboard", label: "Customers can open accounts", type: "checkbox", defaultValue: o.settings.dashboard_open ? "on" : "" },
              { name: "writes", label: "Allow credit changes", type: "checkbox", defaultValue: o.settings.ledger_writes_open ? "on" : "" }]} />
        </div>

        <h2 className="mt-10 text-xl font-extrabold text-[#1E4D3B]">Recent audit</h2>
        <Table caption="Audit log (latest 200)" rows={o.audit} cols={["at", "actor", "action", "target", "reason", "correlation_id"]} />
      </div>
    </div>
  );
}

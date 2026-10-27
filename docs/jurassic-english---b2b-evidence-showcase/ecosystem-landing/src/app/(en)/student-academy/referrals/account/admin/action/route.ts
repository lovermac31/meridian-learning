import { accountsEnabled, ACCOUNT_PATH, db, sameOrigin, seeOther, sessionHash } from "@/lib/familyRewards/server/env";
import { FrError, ownerOp, type OwnerOp } from "@/lib/familyRewards/server/rpc";

// One endpoint for owner operations. The database function re-checks that the
// session belongs to an owner; this handler only shapes the form input.
// Money-moving operations require an explicit confirmation tick.

const CONFIRM_REQUIRED = new Set(["approve_qualification", "hold_redemption", "confirm_redemption", "reverse_redemption", "adjust", "opening_balance", "set_budget", "void_referral"]);

const s = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const b = (f: FormData, k: string) => f.get(k) === "on" || f.get(k) === "true";

function parse(f: FormData): OwnerOp {
  const reason = s(f, "reason");
  switch (s(f, "op")) {
    case "set_budget": return { op: "set_budget", funded: Number(s(f, "funded")), reason };
    case "set_flags": return { op: "set_flags", enrolment: b(f, "enrolment"), dashboard: b(f, "dashboard"), writes: b(f, "writes"), reason };
    case "approve_member": return { op: "approve_member", fullName: s(f, "full_name"), email: s(f, "email"), phone: s(f, "phone"), termsVersion: s(f, "terms_version"), termsAcceptedAt: s(f, "terms_accepted_at"), reason };
    case "record_referral": return { op: "record_referral", code: s(f, "code"), fullName: s(f, "full_name"), email: s(f, "email"), phone: s(f, "phone"), packageRef: s(f, "package_ref"), declaredAt: s(f, "declared_at"), reason };
    case "update_evidence": return { op: "update_evidence", referral: s(f, "referral"), firstPaymentAt: s(f, "first_payment_at") || null, lessonsPaid: s(f, "lessons_paid") as unknown as number,
      lessonsCompleted: s(f, "lessons_completed") as unknown as number, issueOpen: b(f, "issue_open"), refunded: b(f, "refunded"), evidenceRef: s(f, "evidence_ref"), reason };
    case "approve_qualification": return { op: "approve_qualification", referral: s(f, "referral"), reason };
    case "void_referral": return { op: "void_referral", referral: s(f, "referral"), reason };
    case "register_invoice": return { op: "register_invoice", packageId: s(f, "package_id"), member: s(f, "member"), lessons: s(f, "lessons") as unknown as number, eligible: b(f, "eligible"),
      invoiceId: s(f, "invoice_id"), payable: s(f, "payable") as unknown as number, reason };
    case "hold_redemption": return { op: "hold_redemption", member: s(f, "member"), invoiceId: s(f, "invoice_id"), amount: s(f, "amount") as unknown as number, reason };
    case "confirm_redemption": return { op: "confirm_redemption", redemption: s(f, "redemption"), externalRef: s(f, "external_ref"), reason };
    case "release_redemption": return { op: "release_redemption", redemption: s(f, "redemption"), reason };
    case "reverse_redemption": return { op: "reverse_redemption", redemption: s(f, "redemption"), reason };
    case "adjust": return { op: "adjust", member: s(f, "member"), amount: s(f, "reverses_entry") ? null : (s(f, "amount") as unknown as number), reversesEntry: s(f, "reverses_entry") || null, reason };
    case "opening_balance": return { op: "opening_balance", member: s(f, "member"), amount: s(f, "amount") as unknown as number, sourceRef: s(f, "source_ref"), reason };
    default: throw new FrError("invalid", "Unknown operation.");
  }
}

export async function POST(request: Request) {
  if (!accountsEnabled()) return new Response("Not found", { status: 404 });
  if (!sameOrigin(request)) return new Response("Forbidden", { status: 403 });
  const session = await sessionHash();
  if (!session) return seeOther(ACCOUNT_PATH);
  const form = await request.formData();
  const back = `${ACCOUNT_PATH}/admin`;
  try {
    const op = parse(form);
    if (CONFIRM_REQUIRED.has(op.op) && form.get("confirm") !== "on") throw new FrError("confirm", "Tick the confirmation box to apply this change.");
    const result = await ownerOp(db(), session, s(form, "key"), op);
    return seeOther(`${back}?ok=${encodeURIComponent(op.op)}&result=${encodeURIComponent(JSON.stringify(result).slice(0, 300))}`);
  } catch (error) {
    const e = error instanceof FrError ? error : new FrError("unavailable", "The change could not be saved. Nothing was applied.");
    if (!(error instanceof FrError)) console.error("[family-rewards] owner action failed", (error as Error).message);
    return seeOther(`${back}?error=${encodeURIComponent(e.code)}&message=${encodeURIComponent(e.message.slice(0, 200))}`);
  }
}

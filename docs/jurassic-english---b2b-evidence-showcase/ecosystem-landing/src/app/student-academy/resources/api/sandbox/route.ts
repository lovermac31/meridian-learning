import { randomBytes } from "node:crypto";
import { applyEvent, ORDER_REF_PATTERN, type PaymentEvent } from "@/lib/resources/ledger";
import { clearLedger, readLedger, writeLedger } from "@/lib/resources/session";
import { guard, json } from "../_lib";

// Synthetic payment notifications for the preview. Each action builds the
// same event shape the live SePay webhook would hand to the ledger, so the
// confirm path under test is the real one. guard() 404s this in production.

const lastTxn = new Map<string, string>();

export async function POST(request: Request) {
  const blocked = guard(request, { write: true });
  if (blocked) return blocked;

  let body: { action?: unknown; ref?: unknown };
  try {
    body = JSON.parse(await request.text());
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  if (body.action === "reset") {
    await clearLedger();
    return json({ outcome: "reset" });
  }

  const ref = typeof body.ref === "string" ? body.ref : "";
  if (!ORDER_REF_PATTERN.test(ref)) return json({ error: "bad_ref" }, 400);
  const state = await readLedger();
  const order = state.orders.find((o) => o.ref === ref);
  if (!order) return json({ error: "not_found" }, 404);

  const now = Date.now();
  const freshTxn = `sbx_${randomBytes(6).toString("hex")}`;
  let ev: PaymentEvent;
  switch (body.action) {
    case "confirm":
      ev = { kind: "transfer", txnId: freshTxn, ref, amountVnd: order.amountVnd, at: now };
      break;
    case "duplicate":
      // Re-deliver the previous notification with the same transaction id.
      ev = { kind: "transfer", txnId: lastTxn.get(ref) ?? order.paidTxn ?? freshTxn, ref, amountVnd: order.amountVnd, at: now };
      break;
    case "underpay":
      ev = { kind: "transfer", txnId: freshTxn, ref, amountVnd: Math.floor(order.amountVnd / 2), at: now };
      break;
    case "fail":
      ev = { kind: "failed", ref, at: now };
      break;
    case "refund":
      ev = { kind: "refund", ref, at: now };
      break;
    default:
      return json({ error: "bad_action" }, 400);
  }
  if (ev.kind === "transfer") lastTxn.set(ref, ev.txnId);

  const result = applyEvent(state, ev);
  if (result.state !== state) await writeLedger(result.state);
  const updated = result.state.orders.find((o) => o.ref === ref);
  console.info("resources.sandbox_event", { action: body.action, outcome: result.outcome });
  return json({ outcome: result.outcome, status: updated?.status });
}

import { isSellable, productBySlug } from "@/lib/resources/catalog";
import { createOrder, ORDER_REF_PATTERN } from "@/lib/resources/ledger";
import { rateLimited } from "@/lib/resources/rateLimit";
import { newOrderRef, readLedger, writeLedger } from "@/lib/resources/session";
import { guard, json } from "../_lib";

// Same hold as the SePay-backed Baseline flow when auto-pay is on.
const HOLD_MS = 30 * 60 * 1000;

export async function POST(request: Request) {
  const blocked = guard(request, { write: true });
  if (blocked) return blocked;
  if (rateLimited(request, "orders", 10)) return json({ error: "rate_limited" }, 429);

  let body: { slug?: unknown; guardian?: unknown; terms?: unknown };
  try {
    const text = await request.text();
    if (text.length > 1024) return json({ error: "too_large" }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  if (typeof body.slug !== "string") return json({ error: "bad_slug" }, 400);
  if (body.guardian !== true || body.terms !== true) return json({ error: "consent_required" }, 400);

  // The price comes from the server catalogue, never from the request.
  const product = productBySlug(body.slug);
  if (!product || !isSellable(product)) return json({ error: "not_for_sale" }, 404);

  const state = await readLedger();
  const ref = newOrderRef();
  const next = createOrder(state, { ref, slug: product.slug, amountVnd: product.priceVnd, at: Date.now(), holdMs: HOLD_MS });
  await writeLedger(next);
  console.info("resources.order_created", { slug: product.slug, amountVnd: product.priceVnd });
  return json({ ref, amountVnd: product.priceVnd, holdMinutes: HOLD_MS / 60000 }, 201);
}

export async function GET(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;
  const ref = new URL(request.url).searchParams.get("ref") ?? "";
  if (!ORDER_REF_PATTERN.test(ref)) return json({ error: "bad_ref" }, 400);
  const order = (await readLedger()).orders.find((o) => o.ref === ref);
  if (!order) return json({ error: "not_found" }, 404);
  return json({ ref: order.ref, amountVnd: order.amountVnd, status: order.status, needsReview: order.needsReview });
}

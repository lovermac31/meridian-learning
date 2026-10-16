import { readLedger } from "@/lib/resources/session";
import { guard, json } from "../_lib";

export async function GET(request: Request) {
  const blocked = guard(request);
  if (blocked) return blocked;
  const state = await readLedger();
  return json({
    configured: true,
    owned: [...new Set(state.entitlements.filter((e) => e.revokedAt === undefined).map((e) => e.slug))],
    orders: state.orders.map((o) => ({
      ref: o.ref,
      slug: o.slug,
      status: o.status,
      amountVnd: o.amountVnd,
      createdAt: o.createdAt,
      needsReview: o.needsReview,
    })),
  });
}

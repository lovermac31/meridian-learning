// Resource store ledger (JE-ACADEMY-COMMERCE-2026-001, preview phase).
//
// Pure state machine for orders, payment events and entitlements. It has no
// imports so the same rules can be unit-tested with plain Node and later
// ported to one Postgres function (see JE_PAID_PREVIEW_AND_ENTITLEMENT_SPEC.md).
//
// Rules:
// - A payment event is applied at most once per provider transaction id
//   (idempotent: a re-delivered webhook returns "duplicate" and changes nothing).
// - Marking the order paid, recording the transaction and granting the
//   entitlement happen in one step: the function returns either the whole new
//   state or the unchanged state, never a partial one.
// - Underpayment never grants access. Overpayment grants and flags for review.
// - A refund revokes the entitlement; files are refused from then on.
// - The client never decides any of this. Only server code calls applyEvent.

export type OrderStatus = "pending" | "paid" | "underpaid" | "failed" | "expired" | "refunded";

export interface Order {
  ref: string;
  slug: string;
  amountVnd: number;
  status: OrderStatus;
  createdAt: number;
  expiresAt: number;
  paidTxn?: string;
  paidAt?: number;
  receivedVnd?: number;
  needsReview?: string;
  refundedAt?: number;
}

export interface Entitlement {
  slug: string;
  ref: string;
  grantedAt: number;
  revokedAt?: number;
}

export interface LedgerState {
  orders: Order[];
  processedTxns: string[];
  entitlements: Entitlement[];
}

export type PaymentEvent =
  | { kind: "transfer"; txnId: string; ref: string; amountVnd: number; at: number }
  | { kind: "failed"; ref: string; at: number }
  | { kind: "refund"; ref: string; at: number }
  | { kind: "expire"; ref: string; at: number };

export type Outcome =
  | "granted"
  | "granted_overpaid_review"
  | "duplicate"
  | "underpaid"
  | "unknown_ref"
  | "already_paid_review"
  | "order_closed"
  | "failed"
  | "refunded"
  | "not_refundable"
  | "expired"
  | "not_expirable";

export const EMPTY_LEDGER: LedgerState = { orders: [], processedTxns: [], entitlements: [] };

// Matches the existing JEAI…/JEBL… order references used by the SePay webhook.
export const ORDER_REF_PATTERN = /^JERS[0-9A-F]{6}$/;

// Bank apps mangle transfer memos (spaces, lower case, extra text). Pull the
// first plausible reference out of free text, like lib/sepay.ts does for JEAI.
export function extractRef(memo: string): string | null {
  const m = memo.toUpperCase().replace(/[^A-Z0-9]/g, "").match(/JERS[0-9A-F]{6}/);
  return m ? m[0] : null;
}

export function hasActiveEntitlement(state: LedgerState, slug: string): boolean {
  return state.entitlements.some((e) => e.slug === slug && e.revokedAt === undefined);
}

export function createOrder(
  state: LedgerState,
  input: { ref: string; slug: string; amountVnd: number; at: number; holdMs: number },
): LedgerState {
  if (!ORDER_REF_PATTERN.test(input.ref)) throw new Error("bad_ref");
  if (!Number.isInteger(input.amountVnd) || input.amountVnd <= 0) throw new Error("bad_amount");
  if (state.orders.some((o) => o.ref === input.ref)) throw new Error("duplicate_ref");
  const order: Order = {
    ref: input.ref,
    slug: input.slug,
    amountVnd: input.amountVnd,
    status: "pending",
    createdAt: input.at,
    expiresAt: input.at + input.holdMs,
  };
  return { ...state, orders: [...state.orders, order] };
}

function replaceOrder(state: LedgerState, order: Order): Order[] {
  return state.orders.map((o) => (o.ref === order.ref ? order : o));
}

export function applyEvent(state: LedgerState, ev: PaymentEvent): { state: LedgerState; outcome: Outcome } {
  const order = state.orders.find((o) => o.ref === ev.ref);

  if (ev.kind === "transfer") {
    if (state.processedTxns.includes(ev.txnId)) return { state, outcome: "duplicate" };
    // Record the transaction even when it cannot be matched, so a retry of the
    // same notification is still recognised as a duplicate.
    const processedTxns = [...state.processedTxns, ev.txnId];
    if (!order) return { state: { ...state, processedTxns }, outcome: "unknown_ref" };
    if (order.status === "paid") {
      // A second, different transfer for an order that is already paid: money
      // to return, not a second entitlement.
      return {
        state: { ...state, processedTxns, orders: replaceOrder(state, { ...order, needsReview: "second_payment" }) },
        outcome: "already_paid_review",
      };
    }
    if (order.status === "refunded" || order.status === "failed") {
      return {
        state: { ...state, processedTxns, orders: replaceOrder(state, { ...order, needsReview: "payment_after_close" }) },
        outcome: "order_closed",
      };
    }
    // An expired hold still counts: a late bank transfer is real money, so it
    // is honoured (the product is digital and not scarce).
    if (ev.amountVnd < order.amountVnd) {
      return {
        state: {
          ...state,
          processedTxns,
          orders: replaceOrder(state, { ...order, status: "underpaid", receivedVnd: ev.amountVnd, needsReview: "underpaid" }),
        },
        outcome: "underpaid",
      };
    }
    const paid: Order = {
      ...order,
      status: "paid",
      paidTxn: ev.txnId,
      paidAt: ev.at,
      receivedVnd: ev.amountVnd,
      needsReview: ev.amountVnd > order.amountVnd ? "overpaid" : undefined,
    };
    const entitlements = hasActiveEntitlement(state, order.slug)
      ? state.entitlements
      : [...state.entitlements, { slug: order.slug, ref: order.ref, grantedAt: ev.at }];
    return {
      state: { orders: replaceOrder(state, paid), processedTxns, entitlements },
      outcome: ev.amountVnd > order.amountVnd ? "granted_overpaid_review" : "granted",
    };
  }

  if (!order) return { state, outcome: "unknown_ref" };

  if (ev.kind === "failed") {
    if (order.status !== "pending") return { state, outcome: "order_closed" };
    return { state: { ...state, orders: replaceOrder(state, { ...order, status: "failed" }) }, outcome: "failed" };
  }

  if (ev.kind === "expire") {
    if (order.status !== "pending" || ev.at < order.expiresAt) return { state, outcome: "not_expirable" };
    return { state: { ...state, orders: replaceOrder(state, { ...order, status: "expired" }) }, outcome: "expired" };
  }

  // refund
  if (order.status !== "paid") return { state, outcome: "not_refundable" };
  return {
    state: {
      ...state,
      orders: replaceOrder(state, { ...order, status: "refunded", refundedAt: ev.at }),
      entitlements: state.entitlements.map((e) =>
        e.ref === order.ref && e.revokedAt === undefined ? { ...e, revokedAt: ev.at } : e,
      ),
    },
    outcome: "refunded",
  };
}

// Orders that a person must look at: the reconciliation queue.
export function reconciliationQueue(state: LedgerState): Order[] {
  return state.orders.filter((o) => o.needsReview !== undefined);
}

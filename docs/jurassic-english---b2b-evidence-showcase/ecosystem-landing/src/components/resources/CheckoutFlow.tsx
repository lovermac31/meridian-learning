"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useState } from "react";
import { track } from "@vercel/analytics";
import { BASE, formatVnd, withLang, t, type Lang } from "@/lib/resources/i18n";
import { INK_BTN, OUTLINE_BTN, PRIMARY_BTN, TEXT_LINK } from "./styles";

type Order = { ref: string; amountVnd: number; status: string; needsReview?: string };

export function CheckoutFlow({ slug, lang, title, priceVnd }: { slug: string; lang: Lang; title: string; priceVnd: number }) {
  const s = t(lang);
  const [guardian, setGuardian] = useState(false);
  const [terms, setTerms] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const ids = { g: useId(), t: useId(), err: useId() };

  const refresh = useCallback(async (ref: string) => {
    const res = await fetch(`${BASE}/api/orders?ref=${encodeURIComponent(ref)}`, { cache: "no-store" });
    if (!res.ok) return;
    const next = (await res.json()) as Order;
    setOrder((prev) => {
      if (prev && prev.status !== "paid" && next.status === "paid") track("purchase_confirmed", { slug });
      return next;
    });
  }, [slug]);

  // Poll the server while the order waits for the bank. The page never
  // decides that a payment succeeded; it only displays the server's status.
  useEffect(() => {
    if (!order || order.status !== "pending") return;
    const id = window.setInterval(() => refresh(order.ref), 8000);
    return () => window.clearInterval(id);
  }, [order, refresh]);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!guardian || !terms) {
      setError(lang === "vi" ? "Vui lòng xác nhận cả hai ô." : "Please confirm both boxes.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`${BASE}/api/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, guardian, terms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "order_failed");
      setOrder({ ref: data.ref, amountVnd: data.amountVnd, status: "pending" });
    } catch {
      setError(lang === "vi" ? "Không tạo được đơn. Vui lòng thử lại." : "We could not create the order. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function simulate(action: string) {
    if (!order) return;
    setBusy(true);
    try {
      await fetch(`${BASE}/api/sandbox`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action, ref: order.ref }),
      });
      await refresh(order.ref);
    } finally {
      setBusy(false);
    }
  }

  if (!order) {
    return (
      <form onSubmit={start} noValidate aria-describedby={error ? ids.err : undefined} className="space-y-4">
        <p className="text-lg font-extrabold">
          {title}: {formatVnd(priceVnd, lang)}
        </p>
        <div className="flex gap-3">
          <input id={ids.g} type="checkbox" checked={guardian} onChange={(e) => setGuardian(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#101820]" />
          <label htmlFor={ids.g}>{s.guardianLabel}</label>
        </div>
        <div className="flex gap-3">
          <input id={ids.t} type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#101820]" />
          <label htmlFor={ids.t}>{s.termsLabel}</label>
        </div>
        <p className="rounded-xl bg-[#F4F1EA] p-3 text-sm text-[#3d4852]">{s.emailNote}</p>
        {error ? (
          <p id={ids.err} role="alert" className="font-bold text-[#9b1c1c]">
            {error}
          </p>
        ) : null}
        <button type="submit" disabled={busy} className={PRIMARY_BTN}>
          {s.startPayment}
        </button>
      </form>
    );
  }

  const message =
    order.status === "paid"
      ? s.paid
      : order.status === "underpaid"
        ? s.underpaid
        : order.status === "failed"
          ? s.failed
          : order.status === "expired"
            ? s.expired
            : order.status === "refunded"
              ? s.refunded
              : s.waiting;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#101820]/15 bg-white p-5">
        <h2 className="text-xl font-extrabold">{s.payTitle}</h2>
        <p className="mt-2">{s.payBody(order.ref)}</p>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="font-bold">{s.orderRef}</dt>
          <dd className="font-mono text-base">{order.ref}</dd>
          <dt className="font-bold">{s.amount}</dt>
          <dd>{formatVnd(order.amountVnd, lang)}</dd>
        </dl>
        <p className="mt-3 rounded-xl border border-dashed border-[#101820]/40 p-3 text-sm">{s.sandboxQr}</p>
      </div>

      <p role="status" aria-live="polite" className="text-base font-bold">
        {message}
        {order.needsReview && order.status === "paid" ? ` ${s.review}` : ""}
      </p>

      {order.status === "paid" ? (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={withLang(`${BASE}/read/${slug}`, lang)} className={INK_BTN}>
            {s.openReader}
          </Link>
          <Link href={withLang(`${BASE}/library`, lang)} className={OUTLINE_BTN}>
            {s.library}
          </Link>
        </div>
      ) : null}

      <fieldset className="rounded-2xl border-2 border-dashed border-[#D4AF37] p-4">
        <legend className="px-1 text-sm font-extrabold">{s.sandboxTools}</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => simulate("confirm")} className={OUTLINE_BTN}>{s.simConfirm}</button>
          <button type="button" disabled={busy} onClick={() => simulate("duplicate")} className={OUTLINE_BTN}>{s.simDuplicate}</button>
          <button type="button" disabled={busy} onClick={() => simulate("underpay")} className={OUTLINE_BTN}>{s.simUnder}</button>
          <button type="button" disabled={busy} onClick={() => simulate("fail")} className={OUTLINE_BTN}>{s.simFail}</button>
          <button type="button" disabled={busy} onClick={() => simulate("refund")} className={OUTLINE_BTN}>{s.simRefund}</button>
        </div>
      </fieldset>
      <p className="text-sm">
        <Link href={withLang(`${BASE}/library`, lang)} className={TEXT_LINK}>{s.history}</Link>
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { Lock } from "lucide-react";
import { BASE, withLang, t, type Lang } from "@/lib/resources/i18n";
import { INK_BTN, OUTLINE_BTN, PRIMARY_BTN } from "./styles";

export type LibrarySummary = {
  configured: boolean;
  owned: string[];
  orders: { ref: string; slug: string; status: string; amountVnd: number; createdAt: number; needsReview?: string }[];
};

export async function fetchLibrary(): Promise<LibrarySummary | null> {
  try {
    const res = await fetch(`${BASE}/api/library`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as LibrarySummary;
  } catch {
    return null;
  }
}

// The free excerpt is plain HTML in the page (it is free content). We record
// sample_view once, when the excerpt is scrolled into view.
export function SampleViewer({ slug, title, html }: { slug: string; title: string; html: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    let sent = false;
    const io = new IntersectionObserver((entries) => {
      if (!sent && entries.some((e) => e.isIntersecting)) {
        sent = true;
        track("sample_view", { slug });
        io.disconnect();
      }
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [slug]);
  return (
    <div ref={ref} className="rounded-2xl border-2 border-[#D4AF37] bg-white p-5 sm:p-7">
      <h3 className="text-lg font-extrabold">{title}</h3>
      <div className="resource-prose mt-3" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export function LockedPanel({ lang }: { lang: Lang }) {
  const s = t(lang);
  return (
    <div className="flex gap-3 rounded-2xl border border-dashed border-[#101820]/40 bg-[#F4F1EA] p-5">
      <Lock aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <p className="font-extrabold">{s.lockedTitle}</p>
        <p className="mt-1 text-sm text-[#3d4852]">{s.lockedBody}</p>
      </div>
    </div>
  );
}

export function BuyOrOpen({ slug, lang, sellable }: { slug: string; lang: Lang; sellable: boolean }) {
  const s = t(lang);
  const [owned, setOwned] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    fetchLibrary().then((lib) => live && setOwned(Boolean(lib?.owned.includes(slug))));
    return () => {
      live = false;
    };
  }, [slug]);

  if (!sellable) return null;
  if (owned) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <p className="self-center text-sm font-bold">{s.owned}</p>
        <Link href={withLang(`${BASE}/read/${slug}`, lang)} className={INK_BTN}>
          {s.openReader}
        </Link>
        <a href={`${BASE}/api/file/${slug}?format=download`} className={OUTLINE_BTN}>
          {s.download}
        </a>
      </div>
    );
  }
  return (
    <Link
      href={withLang(`${BASE}/checkout/${slug}`, lang)}
      className={PRIMARY_BTN}
      onClick={() => track("checkout_start", { slug })}
    >
      {s.buy}
    </Link>
  );
}

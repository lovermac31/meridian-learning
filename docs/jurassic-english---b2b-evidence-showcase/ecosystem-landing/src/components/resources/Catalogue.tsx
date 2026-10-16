"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import type { Product, ResourceKind } from "@/lib/resources/catalog";
import { formatVnd, productHref, t, type Lang } from "@/lib/resources/i18n";
import { BADGE, CARD, GOLD_BADGE, MUTED, OUTLINE_BTN } from "./styles";

const KINDS: ResourceKind[] = ["free-sample", "activity-pack", "level-bundle"];

export function Catalogue({ lang, products }: { lang: Lang; products: Product[] }) {
  const s = t(lang);
  const [level, setLevel] = useState<string>("all");
  const [kind, setKind] = useState<string>("all");
  const [query, setQuery] = useState("");
  const ids = { level: useId(), kind: useId(), q: useId(), count: useId() };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) =>
        (level === "all" || String(p.level) === level) &&
        (kind === "all" || p.kind === kind) &&
        (!q || `${p.title[lang]} ${p.summary[lang]} ${p.keywords}`.toLowerCase().includes(q)),
    );
  }, [products, level, kind, query, lang]);

  const levels = [...new Set(products.map((p) => p.level))].sort();

  return (
    <section aria-labelledby="catalogue-heading" className="mx-auto max-w-6xl px-4 sm:px-6">
      <h2 id="catalogue-heading" className="sr-only">
        {s.filters}
      </h2>
      <form role="search" onSubmit={(e) => e.preventDefault()} className="grid gap-3 rounded-2xl bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
        <div>
          <label htmlFor={ids.q} className="block text-sm font-bold">
            {s.search}
          </label>
          <div className="relative mt-1">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#3d4852]" />
            <input
              id={ids.q}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-describedby={ids.count}
              className="min-h-11 w-full rounded-xl border border-[#101820]/25 bg-white py-2 pl-9 pr-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101820]"
            />
          </div>
        </div>
        <div>
          <label htmlFor={ids.level} className="block text-sm font-bold">
            {s.level}
          </label>
          <select
            id={ids.level}
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-[#101820]/25 bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101820] sm:w-44"
          >
            <option value="all">{s.allLevels}</option>
            {levels.map((l) => (
              <option key={l} value={String(l)}>
                {s.level} {l}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={ids.kind} className="block text-sm font-bold">
            {s.type}
          </label>
          <select
            id={ids.kind}
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border border-[#101820]/25 bg-white px-3 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101820] sm:w-44"
          >
            <option value="all">{s.allTypes}</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {s.kinds[k]}
              </option>
            ))}
          </select>
        </div>
      </form>

      <p id={ids.count} role="status" className="mt-4 text-sm font-semibold">
        {s.results(shown.length)}
      </p>

      {shown.length === 0 ? (
        <p className={`mt-4 ${MUTED}`}>{s.noResults}</p>
      ) : (
        <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <li key={p.slug}>
              <ProductCard p={p} lang={lang} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function ProductCard({ p, lang }: { p: Product; lang: Lang }) {
  const s = t(lang);
  const titleId = `card-${p.slug}`;
  return (
    <article aria-labelledby={titleId} className={`${CARD} flex h-full flex-col`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/overhaul/w/${p.cover}-480.webp`}
        alt={p.coverAlt[lang]}
        width={480}
        height={270}
        loading="lazy"
        decoding="async"
        className="aspect-[16/9] w-full rounded-xl object-cover"
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <span className={BADGE}>{s.kinds[p.kind]}</span>
        <span className={BADGE}>{p.levelName[lang]}</span>
        <span className={BADGE}>CEFR {p.cefr}</span>
      </div>
      <h3 id={titleId} className="mt-3 text-lg font-extrabold leading-snug">
        {p.title[lang]}
      </h3>
      <p className={`mt-1 text-sm ${MUTED}`}>
        {s.ages} {p.ages}
      </p>
      <p className={`mt-2 flex-1 text-sm leading-relaxed ${MUTED}`}>{p.summary[lang]}</p>
      <div className="mt-4">
        {p.availability === "in-review" ? (
          <p className="block text-sm font-bold">{s.inReview}</p>
        ) : p.priceVnd === 0 ? (
          <p className="text-lg font-extrabold">{s.free}</p>
        ) : (
          <p>
            <span className="text-lg font-extrabold">{formatVnd(p.priceVnd, lang)}</span>{" "}
            <span className={GOLD_BADGE}>{s.proposedPrice}</span>
          </p>
        )}
      </div>
      <Link href={productHref(lang, p.slug)} className={`${OUTLINE_BTN} mt-4`} aria-describedby={titleId}>
        {s.viewDetails}
      </Link>
    </article>
  );
}

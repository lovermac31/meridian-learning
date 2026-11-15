"use client";

import { useEffect, useState } from "react";
import { LIBRARY_COPY, LIBRARY_PREVIEW_PARAM, LIBRARY_TITLES, libraryWaitlistHref, type LibraryLocale } from "@/lib/academy/readingLibrary";

// Reading & Reasoning Library preview row inside a level section. Renders nothing unless the URL has ?library-preview=1,
// read after hydration so the server HTML (and production) is unchanged. No price, no buy button, no structured data.
// Colours: champagne, navy, crimson; no white fills.
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9B1C31] focus-visible:ring-offset-2";

export function LibraryRow({ level, locale }: { level: number; locale: LibraryLocale }) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    setOn(new URLSearchParams(window.location.search).get(LIBRARY_PREVIEW_PARAM) === "1");
  }, []);
  const titles = LIBRARY_TITLES.filter((t) => t.level === level);
  if (!on || !titles.length) return null;
  const c = LIBRARY_COPY[locale];
  return (
    <div className="mt-6 rounded-[1.25rem] border border-[#13294B]/25 bg-[#F3E8CF] p-4 text-[#13294B]" data-library-row={level}>
      <h3 className="text-lg font-extrabold">{c.heading}</h3>
      <ul className="mt-3 grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {titles.map((t) => (
          <li key={t.id} id={`rl-${t.id.replace(/^rl-/, "")}`} data-library-title={t.id} data-availability={t.availability} className="flex min-w-0 flex-col gap-2 rounded-xl border border-[#13294B]/30 bg-[#EADBB5] p-4 text-sm leading-relaxed [overflow-wrap:anywhere]">
            <div role="img" aria-label={c.cover(t.title)} className="flex aspect-[3/2] items-center justify-center rounded-lg bg-[#13294B] p-3 text-center font-extrabold text-[#F3E8CF]"><span lang="en">{t.title}</span></div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#9B1C31]">{c.level} {t.level} · {c.ages(t.ages)}</p>
            <h4 lang="en" className="text-base font-extrabold">{t.title}</h4>
            <p className="w-fit rounded-full border border-[#9B1C31] px-2.5 py-0.5 text-xs font-extrabold text-[#9B1C31]" data-library-pill="">{c.pill}</p>
            <p>{t[locale].synopsis}</p>
            <p><strong>{c.includesLabel}:</strong> {[t.includes.reader && c.reader, t.includes.workbook && c.workbook, t.includes.guide && c.guide].filter(Boolean).join(" · ")}</p>
            <p className="text-xs">{c.notForSale} {c.licence}</p>
            <a href={libraryWaitlistHref(t.id)} data-library-waitlist={t.id} className={`mt-auto inline-flex min-h-11 items-center font-extrabold underline underline-offset-4 ${FOCUS}`}>{c.waitlist}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

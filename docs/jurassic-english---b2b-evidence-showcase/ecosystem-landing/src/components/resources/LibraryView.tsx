"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BASE, formatVnd, withLang, t, type Lang } from "@/lib/resources/i18n";
import { fetchLibrary, type LibrarySummary } from "./ProductActions";
import { INK_BTN, MUTED, OUTLINE_BTN } from "./styles";

export function LibraryView({ lang, titles }: { lang: Lang; titles: Record<string, string> }) {
  const s = t(lang);
  const [lib, setLib] = useState<LibrarySummary | null | undefined>(undefined);
  useEffect(() => {
    fetchLibrary().then(setLib);
  }, []);

  async function reset() {
    await fetch(`${BASE}/api/sandbox`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    setLib(await fetchLibrary());
  }

  if (lib === undefined) return <p role="status">{s.readerLoading}</p>;
  if (lib === null || !lib.configured) {
    return <p role="alert">{s.support}</p>;
  }

  return (
    <div className="space-y-8">
      <section aria-labelledby="owned-heading">
        <h2 id="owned-heading" className="text-xl font-extrabold">{s.ownedTitle}</h2>
        {lib.owned.length === 0 ? (
          <p className={`mt-2 ${MUTED}`}>{s.libraryEmpty}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {lib.owned.map((slug) => (
              <li key={slug} className="flex flex-col gap-3 rounded-2xl bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <span className="font-bold">{titles[slug] ?? slug}</span>
                <span className="flex flex-wrap gap-2">
                  <Link href={withLang(`${BASE}/read/${slug}`, lang)} className={INK_BTN}>{s.openReader}</Link>
                  <a href={`${BASE}/api/file/${slug}?format=download`} className={OUTLINE_BTN}>{s.download}</a>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-xl font-extrabold">{s.history}</h2>
        {lib.orders.length === 0 ? (
          <p className={`mt-2 ${MUTED}`}>{s.libraryEmpty}</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-2xl bg-white">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[#101820]/10">
                  <th scope="col" className="p-3">{s.orderRef}</th>
                  <th scope="col" className="p-3">{lang === "vi" ? "Tài liệu" : "Resource"}</th>
                  <th scope="col" className="p-3">{s.amount}</th>
                  <th scope="col" className="p-3">{s.status}</th>
                </tr>
              </thead>
              <tbody>
                {[...lib.orders].reverse().map((o) => (
                  <tr key={o.ref} className="border-b border-[#101820]/5 last:border-0">
                    <td className="p-3 font-mono">{o.ref}</td>
                    <td className="p-3">{titles[o.slug] ?? o.slug}</td>
                    <td className="p-3">{formatVnd(o.amountVnd, lang)}</td>
                    <td className="p-3">
                      {s.statusNames[o.status as keyof typeof s.statusNames] ?? o.status}
                      {o.needsReview ? ` · ${s.review}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <button type="button" onClick={reset} className={OUTLINE_BTN}>{s.simReset}</button>
    </div>
  );
}

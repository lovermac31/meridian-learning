"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BASE, productHref, t, type Lang } from "@/lib/resources/i18n";
import { OUTLINE_BTN } from "./styles";

// Full content is fetched from the entitlement-checked file route at view
// time. It is never in the page HTML or the JS bundle.
export function Reader({ slug, lang }: { slug: string; lang: Lang }) {
  const s = t(lang);
  const [state, setState] = useState<{ kind: "loading" } | { kind: "denied" } | { kind: "ok"; html: string }>({ kind: "loading" });

  useEffect(() => {
    let live = true;
    fetch(`${BASE}/api/file/${slug}?format=reader`, { cache: "no-store" })
      .then(async (res) => {
        if (!live) return;
        if (!res.ok) return setState({ kind: "denied" });
        setState({ kind: "ok", html: await res.text() });
      })
      .catch(() => live && setState({ kind: "denied" }));
    return () => {
      live = false;
    };
  }, [slug]);

  if (state.kind === "loading") return <p role="status">{s.readerLoading}</p>;
  if (state.kind === "denied") {
    return (
      <div role="alert" className="space-y-4">
        <p className="font-bold">{s.readerDenied}</p>
        <Link href={productHref(lang, slug)} className={OUTLINE_BTN}>{s.viewDetails}</Link>
      </div>
    );
  }
  return (
    <>
      <article className="resource-prose rounded-2xl bg-white p-5 sm:p-8" dangerouslySetInnerHTML={{ __html: state.html }} />
      <p className="mt-4 text-sm text-[#3d4852]">{s.copyNote}</p>
      <a href={`${BASE}/api/file/${slug}?format=download`} className={`${OUTLINE_BTN} mt-4`}>{s.download}</a>
    </>
  );
}

import Link from "next/link";
import { ArrowLeft, BookOpen, Languages } from "lucide-react";
import { BASE, t, type Lang } from "@/lib/resources/i18n";
import { TEXT_LINK } from "./styles";

// Typography for sample and reader content (scoped to .resource-prose so it
// cannot affect the rest of the app).
const PROSE_CSS = `
.resource-prose{font-size:1.0625rem;line-height:1.7;color:#101820}
.resource-prose h2{font-size:1.35rem;font-weight:800;margin:1.6em 0 .5em}
.resource-prose h3{font-size:1.1rem;font-weight:800;margin:1.3em 0 .4em}
.resource-prose p{margin:.7em 0}
.resource-prose ol,.resource-prose ul{margin:.6em 0;padding-left:1.4em}
.resource-prose ol{list-style:decimal}.resource-prose ul{list-style:disc}
.resource-prose li{margin:.3em 0}
.resource-prose blockquote{border-left:4px solid #D4AF37;background:#F4F1EA;margin:1em 0;padding:.8em 1em;border-radius:.5rem}
.resource-prose .write-line{display:block;border-bottom:1px solid #101820;height:2rem;margin:.2em 0}
.resource-prose .synthetic{font-size:.85rem;font-weight:700;border:1px dashed #101820;border-radius:.5rem;padding:.4em .7em;display:inline-block}
.resource-licence{font-size:.8rem;border:1px solid #D4AF37;border-radius:.5rem;padding:.4em .7em;margin:.5em 0}
`;

// Page frame shared by every store page: preview banner, Vietnamese review
// notice, and the three links that matter (Academy, language, library).
export function StoreShell({
  lang,
  altHref,
  children,
}: {
  lang: Lang;
  altHref: string;
  children: React.ReactNode;
}) {
  const s = t(lang);
  return (
    <div lang={lang} className="bg-[#F4F1EA] text-[#101820]">
      <style dangerouslySetInnerHTML={{ __html: PROSE_CSS }} />
      <p role="note" className="bg-[#101820] px-4 py-2 text-center text-sm font-semibold text-[#D4AF37]">
        {s.previewBanner}
      </p>
      {lang === "vi" ? (
        <p role="note" className="border-b border-[#D4AF37] bg-[#fff8e6] px-4 py-2 text-center text-sm text-[#101820]">
          {s.viReviewNotice}
        </p>
      ) : null}
      <nav aria-label="Resource library" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 pt-5 sm:px-6">
        <Link href="/student-academy" className={`${TEXT_LINK} inline-flex min-h-11 items-center gap-1.5 text-sm`}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          {s.backToAcademy}
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={altHref}
            hrefLang={lang === "vi" ? "en" : "vi"}
            className={`${TEXT_LINK} inline-flex min-h-11 items-center gap-1.5 text-sm`}
          >
            <Languages aria-hidden="true" className="h-4 w-4" />
            {s.langSwitch}
          </Link>
          <Link
            href={lang === "vi" ? `${BASE}/library?lang=vi` : `${BASE}/library`}
            className={`${TEXT_LINK} inline-flex min-h-11 items-center gap-1.5 text-sm`}
          >
            <BookOpen aria-hidden="true" className="h-4 w-4" />
            {s.library}
          </Link>
        </div>
      </nav>
      {children}
    </div>
  );
}

export function SupportNote({ lang }: { lang: Lang }) {
  return (
    <p className="mx-auto max-w-6xl px-4 pb-14 pt-8 text-sm text-[#3d4852] sm:px-6">
      {t(lang).support}{" "}
      <a className={TEXT_LINK} href="mailto:info@jurassicenglish.com?subject=Resource%20library%20order">
        info@jurassicenglish.com
      </a>{" "}
      ·{" "}
      <a className={TEXT_LINK} href="https://zalo.me/84396085076" rel="noopener noreferrer" target="_blank">
        Zalo
      </a>
    </p>
  );
}

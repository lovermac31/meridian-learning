import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { FAQ, LICENCE, PRODUCTS, isSellable, productBySlug } from "@/lib/resources/catalog";
import { storeMode } from "@/lib/resources/gate";
import { catalogueHref, formatVnd, productHref, t, type Lang } from "@/lib/resources/i18n";
import { Catalogue } from "./Catalogue";
import { BuyOrOpen, LockedPanel, SampleViewer } from "./ProductActions";
import { StoreShell, SupportNote } from "./StoreShell";
import { BADGE, EYEBROW, GOLD_BADGE, H1, H2, MUTED, OUTLINE_BTN, PRIMARY_BTN, TEXT_LINK } from "./styles";

const DIAGNOSTIC = "/book-diagnostic";

// Product and catalogue pages are indexable once the store is released. Until
// then they exist only on preview deployments, which are never indexed, and
// production returns 404 (storeMode "off").
const PUBLIC_ROBOTS = { index: true, follow: true };
export const PRIVATE_ROBOTS: Metadata["robots"] = { index: false, follow: false, nocache: true };

export function assertStoreOpen() {
  if (storeMode() === "off") notFound();
}

export function catalogueMetadata(lang: Lang): Metadata {
  const s = t(lang);
  return {
    title: lang === "vi" ? "Thư viện Tài liệu | Jurassic English™ Student Academy" : "Resource Library | Jurassic English™ Student Academy",
    description: s.heroBody,
    robots: PUBLIC_ROBOTS,
    alternates: {
      canonical: catalogueHref(lang),
      languages: { en: catalogueHref("en"), vi: catalogueHref("vi") },
    },
  };
}

export function CataloguePage({ lang }: { lang: Lang }) {
  assertStoreOpen();
  const s = t(lang);
  const sample = PRODUCTS.find((p) => p.kind === "free-sample");
  return (
    <StoreShell lang={lang} altHref={catalogueHref(lang === "vi" ? "en" : "vi")}>
      <section className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-10 pt-8 sm:px-6 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className={EYEBROW}>
            <span className="border-b-2 border-[#F26419] pb-0.5">{s.eyebrow}</span>
          </p>
          <h1 className={`${H1} mt-4`}>{s.heroTitle}</h1>
          <p className={`mt-4 max-w-xl text-base leading-relaxed sm:text-lg ${MUTED}`}>{s.heroBody}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {sample ? (
              <Link href={productHref(lang, sample.slug)} className={PRIMARY_BTN}>
                {s.heroFree} <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            ) : null}
            <Link href={DIAGNOSTIC} className={OUTLINE_BTN}>
              {s.heroDiagnostic}
            </Link>
          </div>
        </div>
        <figure className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/overhaul/w/thinking-cycle-storybook-map-800.webp"
            srcSet="/images/overhaul/w/thinking-cycle-storybook-map-480.webp 480w, /images/overhaul/w/thinking-cycle-storybook-map-800.webp 800w"
            sizes="(min-width: 1024px) 40vw, 100vw"
            alt={lang === "vi" ? "Tranh minh hoạ bản đồ truyện với bốn bước tư duy" : "Storybook map illustration showing the four thinking steps"}
            width={800}
            height={450}
            fetchPriority="high"
            className="w-full rounded-2xl"
          />
          <figcaption className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold">
            {lang === "vi" ? "Tranh minh hoạ" : "Illustration"}
          </figcaption>
        </figure>
      </section>
      <Catalogue lang={lang} products={PRODUCTS} />
      <FaqSection lang={lang} />
      <SupportNote lang={lang} />
    </StoreShell>
  );
}

function FaqSection({ lang }: { lang: Lang }) {
  const s = t(lang);
  return (
    <section aria-labelledby="faq-heading" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <h2 id="faq-heading" className={H2}>
        {s.faq}
      </h2>
      <div className="mt-5 divide-y divide-[#101820]/10 rounded-2xl bg-white">
        {FAQ.map((f) => (
          <details key={f.q.en} className="group p-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26419]">
              {f.q[lang]}
              <span aria-hidden="true" className="text-xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className={`mt-2 leading-relaxed ${MUTED}`}>{f.a[lang]}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function productStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function productMetadata(lang: Lang, slug: string): Metadata {
  const p = productBySlug(slug);
  if (!p) return {};
  return {
    title: `${p.title[lang]} | Jurassic English™ Resource Library`,
    description: p.summary[lang],
    robots: p.availability === "preview" ? PUBLIC_ROBOTS : PRIVATE_ROBOTS,
    alternates: {
      canonical: productHref(lang, slug),
      languages: { en: productHref("en", slug), vi: productHref("vi", slug) },
    },
  };
}

function breadcrumbLd(lang: Lang, slug: string, title: string) {
  const origin = "https://jurassicenglish.com";
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Student Academy", item: `${origin}/student-academy` },
      { "@type": "ListItem", position: 2, name: lang === "vi" ? "Thư viện Tài liệu" : "Resource Library", item: `${origin}${catalogueHref(lang)}` },
      { "@type": "ListItem", position: 3, name: title, item: `${origin}${productHref(lang, slug)}` },
    ],
  };
}

export function ProductPage({ lang, slug }: { lang: Lang; slug: string }) {
  assertStoreOpen();
  const p = productBySlug(slug);
  if (!p) notFound();
  const s = t(lang);
  const sellable = isSellable(p);
  return (
    <StoreShell lang={lang} altHref={productHref(lang === "vi" ? "en" : "vi", slug)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd(lang, slug, p.title[lang])) }} />
      <div className="mx-auto max-w-6xl px-4 pb-4 pt-6 sm:px-6">
        <nav aria-label="Breadcrumb" className="text-sm">
          <ol className="flex flex-wrap gap-1.5">
            <li><Link className={TEXT_LINK} href="/student-academy">Student Academy</Link> /</li>
            <li><Link className={TEXT_LINK} href={catalogueHref(lang)}>{lang === "vi" ? "Thư viện Tài liệu" : "Resource Library"}</Link> /</li>
            <li aria-current="page">{p.title[lang]}</li>
          </ol>
        </nav>
      </div>
      <article className="mx-auto grid max-w-6xl gap-10 px-4 pb-6 sm:px-6 lg:grid-cols-[1.25fr_1fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className={BADGE}>{s.kinds[p.kind]}</span>
            <span className={BADGE}>{p.levelName[lang]}</span>
            <span className={BADGE}>CEFR {p.cefr}</span>
            <span className={BADGE}>{s.ages} {p.ages}</span>
          </div>
          <h1 className={`${H1} mt-4`}>{p.title[lang]}</h1>
          <p className={`mt-4 text-lg leading-relaxed ${MUTED}`}>{p.summary[lang]}</p>
          {p.reviewNote ? <p className="mt-4 rounded-xl border border-[#D4AF37] bg-white p-3 text-sm">{p.reviewNote[lang]}</p> : null}

          {p.sample ? (
            <section aria-labelledby="sample-heading" className="mt-8">
              <h2 id="sample-heading" className={H2}>{s.sampleTitle}</h2>
              <p className={`mt-2 text-sm ${MUTED}`}>{s.sampleNote}</p>
              <div className="mt-4">
                <SampleViewer slug={p.slug} title={p.sample.title[lang]} html={p.sample.html[lang]} />
              </div>
            </section>
          ) : null}
          {sellable ? (
            <div className="mt-5">
              <LockedPanel lang={lang} />
            </div>
          ) : null}
        </div>

        <aside aria-label={lang === "vi" ? "Thông tin mua" : "Purchase details"} className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/images/overhaul/w/${p.cover}-800.webp`}
            alt={p.coverAlt[lang]}
            width={800}
            height={450}
            className="aspect-[16/9] w-full rounded-2xl object-cover"
          />
          <div className="rounded-2xl bg-white p-5">
            {p.availability === "in-review" ? (
              <p className="font-bold">{s.inReview}</p>
            ) : p.priceVnd === 0 ? (
              <p className="text-2xl font-extrabold">{s.free}</p>
            ) : (
              <p>
                <span className="text-2xl font-extrabold">{formatVnd(p.priceVnd, lang)}</span>
                <span className={`${GOLD_BADGE} ml-2 align-middle`}>{s.proposedPrice}</span>
              </p>
            )}
            <div className="mt-4">
              <BuyOrOpen slug={p.slug} lang={lang} sellable={sellable} />
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="font-extrabold">{s.contents}</dt>
                <dd>
                  <ul className={`mt-1 list-disc space-y-1 pl-5 ${MUTED}`}>{p.contents[lang].map((c) => <li key={c}>{c}</li>)}</ul>
                </dd>
              </div>
              <div>
                <dt className="font-extrabold">{s.outcomes}</dt>
                <dd>
                  <ul className={`mt-1 list-disc space-y-1 pl-5 ${MUTED}`}>{p.outcomes[lang].map((c) => <li key={c}>{c}</li>)}</ul>
                </dd>
              </div>
              <div>
                <dt className="font-extrabold">{s.prerequisites}</dt>
                <dd className={`mt-1 ${MUTED}`}>{p.prerequisites[lang]}</dd>
              </div>
              <div>
                <dt className="font-extrabold">{s.format}</dt>
                <dd className={`mt-1 ${MUTED}`}>{p.format[lang]}</dd>
              </div>
              <div>
                <dt className="font-extrabold">{s.licence}</dt>
                <dd className={`mt-1 ${MUTED}`}>{LICENCE[lang]}</dd>
              </div>
            </dl>
          </div>
          <p className="text-sm">
            <Link href={DIAGNOSTIC} className={TEXT_LINK}>{s.heroDiagnostic}</Link>
          </p>
        </aside>
      </article>
      <FaqSection lang={lang} />
      <SupportNote lang={lang} />
    </StoreShell>
  );
}

export function langFromSearch(sp: Record<string, string | string[] | undefined>): Lang {
  return sp.lang === "vi" ? "vi" : "en";
}


import { notFound } from "next/navigation";
import { PRIVATE_ROBOTS, assertStoreOpen, langFromSearch } from "@/components/resources/pages";
import { Reader } from "@/components/resources/Reader";
import { StoreShell, SupportNote } from "@/components/resources/StoreShell";
import { H1 } from "@/components/resources/styles";
import { productBySlug } from "@/lib/resources/catalog";
import { BASE } from "@/lib/resources/i18n";

export const metadata = { title: "Reader | Jurassic English™ Resource Library", robots: PRIVATE_ROBOTS };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Read({ params, searchParams }: Props) {
  assertStoreOpen();
  const { slug } = await params;
  const lang = langFromSearch(await searchParams);
  const p = productBySlug(slug);
  if (!p) notFound();
  return (
    <StoreShell lang={lang} altHref={`${BASE}/read/${slug}${lang === "vi" ? "" : "?lang=vi"}`}>
      <div className="mx-auto max-w-3xl px-4 pb-4 pt-8 sm:px-6">
        <h1 className={H1}>{p.title[lang]}</h1>
        <div className="mt-6">
          <Reader slug={p.slug} lang={lang} />
        </div>
      </div>
      <SupportNote lang={lang} />
    </StoreShell>
  );
}

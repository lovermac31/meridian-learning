import { notFound } from "next/navigation";
import { CheckoutFlow } from "@/components/resources/CheckoutFlow";
import { PRIVATE_ROBOTS, assertStoreOpen, langFromSearch } from "@/components/resources/pages";
import { StoreShell, SupportNote } from "@/components/resources/StoreShell";
import { H1 } from "@/components/resources/styles";
import { isSellable, productBySlug } from "@/lib/resources/catalog";
import { BASE, t } from "@/lib/resources/i18n";

export const metadata = { title: "Checkout | Jurassic English™ Resource Library", robots: PRIVATE_ROBOTS };

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function Checkout({ params, searchParams }: Props) {
  assertStoreOpen();
  const { slug } = await params;
  const lang = langFromSearch(await searchParams);
  const p = productBySlug(slug);
  if (!p || !isSellable(p)) notFound();
  return (
    <StoreShell lang={lang} altHref={`${BASE}/checkout/${slug}${lang === "vi" ? "" : "?lang=vi"}`}>
      <div className="mx-auto max-w-2xl px-4 pb-4 pt-8 sm:px-6">
        <h1 className={H1}>{t(lang).checkoutTitle}</h1>
        <div className="mt-6 rounded-2xl bg-white p-5 sm:p-7">
          <CheckoutFlow slug={p.slug} lang={lang} title={p.title[lang]} priceVnd={p.priceVnd} />
        </div>
      </div>
      <SupportNote lang={lang} />
    </StoreShell>
  );
}

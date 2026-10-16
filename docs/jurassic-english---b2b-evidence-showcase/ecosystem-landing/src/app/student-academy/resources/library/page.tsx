import { LibraryView } from "@/components/resources/LibraryView";
import { PRIVATE_ROBOTS, assertStoreOpen, langFromSearch } from "@/components/resources/pages";
import { StoreShell, SupportNote } from "@/components/resources/StoreShell";
import { H1 } from "@/components/resources/styles";
import { PRODUCTS } from "@/lib/resources/catalog";
import { BASE, t } from "@/lib/resources/i18n";

export const metadata = { title: "My library | Jurassic English™ Resource Library", robots: PRIVATE_ROBOTS };

export default async function Library({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  assertStoreOpen();
  const lang = langFromSearch(await searchParams);
  const titles = Object.fromEntries(PRODUCTS.map((p) => [p.slug, p.title[lang]]));
  return (
    <StoreShell lang={lang} altHref={`${BASE}/library${lang === "vi" ? "" : "?lang=vi"}`}>
      <div className="mx-auto max-w-4xl px-4 pb-4 pt-8 sm:px-6">
        <h1 className={H1}>{t(lang).libraryTitle}</h1>
        <div className="mt-6">
          <LibraryView lang={lang} titles={titles} />
        </div>
      </div>
      <SupportNote lang={lang} />
    </StoreShell>
  );
}

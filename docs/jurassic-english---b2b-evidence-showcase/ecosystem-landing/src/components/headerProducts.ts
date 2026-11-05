// Products door for the ecosystem header (kept apart from the component so a plain Node test can import it).
// Mirrors src/i18n/content/overhaul.ts: "Products & prices" (short "Products") and "Sản phẩm & học phí" (short "Sản phẩm").
export type HeaderLang = "en" | "vi";

export const PRODUCTS = {
  en: { label: "Products", full: "Products & prices", href: "/products" },
  vi: { label: "Sản phẩm", full: "Sản phẩm & học phí", href: "/vi/products" },
} as const;

export function getHeaderProducts(lang: HeaderLang = "en") {
  return PRODUCTS[lang];
}

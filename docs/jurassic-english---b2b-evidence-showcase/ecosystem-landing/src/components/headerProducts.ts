// Products door for the ecosystem header (kept apart from the component so a plain Node test can import it).
// Mirrors src/i18n/content/overhaul.ts, header wording Option A (Jay, 15 Nov 2026): "Books & Prices" / "Sách & Bảng giá"
// (the Vietnamese needs a native read before merge).
export type HeaderLang = "en" | "vi";

export const PRODUCTS = {
  en: { label: "Books & Prices", full: "Books & Prices", href: "/products" },
  vi: { label: "Sách & Bảng giá", full: "Sách & Bảng giá", href: "/vi/products" },
} as const;

export function getHeaderProducts(lang: HeaderLang = "en") {
  return PRODUCTS[lang];
}

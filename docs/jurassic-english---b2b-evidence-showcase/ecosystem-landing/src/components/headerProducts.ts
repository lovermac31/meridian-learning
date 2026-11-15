// Products door for the ecosystem header (kept apart from the component so a plain Node test can import it).
// Mirrors src/i18n/content/overhaul.ts, header wording Option A (Jay, 15 Nov 2026): "Books & Prices" / "Sách & Bảng giá"
// (the Vietnamese needs a native read before merge).
export type HeaderLang = "en" | "vi";

// `short`: the standalone link beside the header button below 768 px (Jay, 15 Nov 2026: "Short label: Products").
export const PRODUCTS = {
  en: { label: "Books & Prices", short: "Products", full: "Books & Prices", href: "/products" },
  vi: { label: "Sách & Bảng giá", short: "Sản phẩm", full: "Sách & Bảng giá", href: "/vi/products" },
} as const;

export function getHeaderProducts(lang: HeaderLang = "en") {
  return PRODUCTS[lang];
}

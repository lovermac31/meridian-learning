import { ArrowRight, Menu } from "lucide-react";
import { HeaderMenuDismiss } from "./HeaderMenuDismiss";

// Same header as the main jurassicenglish.com SPA (src/components/Navbar.tsx and
// src/i18n/content/overhaul.ts nav): five doors, the Baseline CTA, EN | Tiếng Việt. Every link is a
// plain document navigation because each door is served by a different app
// (SPA, static Young Learners page, AI Speaking app) behind one domain.

const NAV = [
  { label: "Kids Academy (5–12)", desc: "Reading & Story Adventures", href: "/student-academy" },
  { label: "Ages 9–18", desc: "Speaking Confidence & Teen IELTS", href: "/young-learners-speaking/" },
  { label: "IELTS Writing", badge: "New", desc: "IELTS Writing Task 2: introduction & demo", href: "/ai-speaking/writing" },
  { label: "AI Speaking Mocks", desc: "Adult IELTS Speaking practice (18+)", href: "/ai-speaking" },
  { label: "Pricing", desc: "Mr. Jay, plans and pricing", href: "/#pricing-options" },
];
// The Live Speaking Baseline booking page (AI Speaking app), as on every other page of the site.
const CTA_HREF = "/ai-speaking/baseline";
// The desktop row drops a bracketed suffix ("Kids Academy (5–12)" shows "Kids Academy"): the full label
// pushes the last item under the language switch (same header as the main site, measured 26 Oct).
// The mobile menu, aria-label and title keep the full label.
function DesktopNavLabel({ label }: { label: string }) {
  const match = label.match(/^(.*?)\s(\(.+\))$/);
  if (!match) return <>{label}</>;
  return (
    <>
      {match[1]}
      <span className="sr-only"> {match[2]}</span>
    </>
  );
}

const NEW_BADGE = "ml-1.5 inline-block rounded-full bg-[#B45309] px-1.5 align-[1px] text-[11px] font-bold leading-4 text-white";
const CTA =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#B45309] px-2.5 py-2 text-[13px] font-extrabold text-white transition hover:bg-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2 min-[360px]:px-3 sm:px-4";

export function ProductionStyleHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E6DEC8] bg-[#FAF7F2]/95 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 px-3 min-[360px]:gap-3 min-[360px]:px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-6">
          {/* Below 430px the wordmark wraps to two lines, as in the main Navbar, so the Baseline CTA never covers it. */}
          {/* "/" on jurassicenglish.com is the main SPA, not this app's own index, so a document navigation is intended. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/"
            aria-label="Jurassic English™ home"
            className="shrink-0 whitespace-nowrap max-[429px]:w-min max-[429px]:whitespace-normal rounded-md px-1 py-0.5 text-left leading-tight text-[0.875rem] uppercase min-[360px]:text-[1.05rem] text-[#1E4D3B] sm:text-[1.2rem]"
            style={{ fontFamily: '"Neuland-Inline", Copperplate, Georgia, serif' }}
          >
            Jurassic English<sup className="text-[0.5em] text-[#B45309]">™</sup>
          </a>
          <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                aria-label={`${item.badge ? `${item.label} ${item.badge}` : item.label} · ${item.desc}`}
                title={`${item.label} · ${item.desc}`}
                className="whitespace-nowrap rounded-xl px-1 py-1.5 text-[0.95rem] font-semibold text-[#1E4D3B] transition hover:text-[#92400E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706] focus-visible:ring-offset-2"
              >
                <DesktopNavLabel label={item.label} />
                {item.badge ? <>{" "}<span className={NEW_BADGE}>{item.badge}</span></> : null}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 min-[360px]:gap-2 sm:gap-3">
          <div className="hidden rounded-full border border-[#E6DEC8] bg-white p-1 text-xs font-semibold xl:flex" role="group" aria-label="Language">
            <span className="rounded-full bg-[#1E4D3B] px-3 py-1.5 text-white" aria-current="true">EN</span>
            {/* The Student Academy has no Vietnamese page yet, so Tiếng Việt goes to the Vietnamese home page. */}
            <a href="/vi" lang="vi" className="rounded-full px-3 py-1.5 text-[#4A5568] hover:text-[#1E4D3B]">Tiếng Việt</a>
          </div>
          <a href={CTA_HREF} className={CTA}>
            <span className="hidden sm:inline">Book Baseline · 690k₫</span>
            <span className="sm:hidden">Baseline · 690k₫</span>
            <ArrowRight aria-hidden="true" className="hidden h-4 w-4 min-[360px]:block" />
          </a>
          <details data-site-menu="" className="relative xl:hidden">
            <summary
              aria-label="Open menu"
              className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[#E6DEC8] bg-white text-[#1E4D3B] [&::-webkit-details-marker]:hidden"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </summary>
            <div className="absolute right-0 top-12 flex w-[min(18rem,calc(100vw-1.5rem))] flex-col gap-2 rounded-2xl border border-[#E6DEC8] bg-[#FAF7F2] p-4 shadow-lg">
              <a href={CTA_HREF} className={`${CTA} w-full justify-center py-3 text-base`}>
                Book Baseline · 690k₫
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className="rounded-xl border border-[#E6DEC8] bg-white px-4 py-3">
                  <span className="block text-base font-bold text-[#1E4D3B]">
                    {item.label}
                    {item.badge ? <>{" "}<span className={NEW_BADGE}>{item.badge}</span></> : null}
                  </span>
                  <span className="block text-sm text-[#1C2526]">{item.desc}</span>
                </a>
              ))}
              <a href="/vi" lang="vi" className="border-t border-[#E6DEC8] px-1 pt-3 text-sm font-semibold text-[#1E4D3B]">Tiếng Việt</a>
            </div>
          </details>
          <HeaderMenuDismiss />
        </div>
      </div>
    </header>
  );
}

export default ProductionStyleHeader;

import { ArrowRight, Menu } from "lucide-react";

// 10/10 overhaul header (Oct 2026), matching the main jurassicenglish.com
// SPA: four age doors, the sticky Baseline CTA, EN | VI. Every link is a
// plain document navigation because each door is served by a different app
// (SPA, static Young Learners page, AI Speaking app) behind one domain.
// The Student Academy has no Vietnamese page yet, so VI goes to /vi.

const NAV = [
  { label: "Reading & Story Adventures", href: "/student-academy" },
  { label: "Speaking Confidence & Teen IELTS", href: "/young-learners-speaking/" },
  { label: "Adult IELTS Practice", href: "/ai-speaking" },
  { label: "Meet Mr. Jay & Pricing", href: "/#pricing-options" },
];
// On the Student Academy the header CTA triggers this page's matched action.
const CTA_HREF = "/student-academy#diagnostic";
const CTA =
  "inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-[#B45309] px-3 py-2 text-[13px] font-extrabold text-white transition hover:bg-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2 sm:px-4";

export function ProductionStyleHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#E6DEC8] bg-[#FAF7F2]/95 py-3 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* "/" on jurassicenglish.com is the main SPA, not this app's own index, so a document navigation is intended. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          aria-label="Jurassic English home"
          className="shrink-0 whitespace-nowrap rounded-md px-1 py-0.5 text-[1.05rem] uppercase text-[#1E4D3B] sm:text-[1.2rem]"
          style={{ fontFamily: '"Neuland-Inline", Copperplate, Georgia, serif' }}
        >
          Jurassic English<sup className="text-[0.5em] text-[#B45309]">™</sup>
        </a>
        <nav aria-label="Main" className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="max-w-[11rem] rounded-xl px-2.5 py-1.5 text-[13px] font-bold leading-tight text-[#1E4D3B] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D97706]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <a href={CTA_HREF} className={CTA}>
            <span className="hidden sm:inline">Choose a Starting Step</span>
            <span className="sm:hidden">Start here</span>
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
          <div className="hidden rounded-full border border-[#E6DEC8] bg-white p-1 text-xs font-semibold xl:flex" role="group" aria-label="Language">
            <span className="rounded-full bg-[#1E4D3B] px-3 py-1.5 text-white" aria-current="true">EN</span>
            <a href="/vi" lang="vi" className="rounded-full px-3 py-1.5 text-[#4A5568] hover:text-[#1E4D3B]">VI</a>
          </div>
          <details className="relative xl:hidden">
            <summary
              aria-label="Open menu"
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full border border-[#E6DEC8] bg-white text-[#1E4D3B] [&::-webkit-details-marker]:hidden"
            >
              <Menu aria-hidden="true" className="h-5 w-5" />
            </summary>
            <div className="absolute right-0 top-12 flex w-72 flex-col gap-2 rounded-2xl border border-[#E6DEC8] bg-[#FAF7F2] p-4 shadow-lg">
              {NAV.map((item) => (
                <a key={item.href} href={item.href} className="rounded-xl border border-[#E6DEC8] bg-white px-4 py-3">
                  <span className="block text-base font-bold text-[#1E4D3B]">{item.label}</span>
                </a>
              ))}
              <a href="/vi" lang="vi" className="px-1 pt-2 text-sm font-semibold text-[#1E4D3B]">Tiếng Việt</a>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

export default ProductionStyleHeader;

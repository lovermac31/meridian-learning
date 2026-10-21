// 10/10 overhaul footer (Oct 2026), matching the main jurassicenglish.com
// footer: one navigation row, the institutional pointer, and the one-line
// independence notice. Replaces the multi-column sitemap footer.

import { ROUTE as FAMILY_REWARDS_ROUTE } from "@/lib/familyRewards/terms";

const LINKS = [
  { label: "Reading & Story Adventures", href: "/student-academy" },
  { label: "Speaking & Teen IELTS", href: "/young-learners-speaking/" },
  { label: "Adult IELTS Practice", href: "/ai-speaking" },
  { label: "IELTS Writing Task 2 (Coming Soon)", href: "/ai-speaking/writing" },
  { label: "Live Speaking Baseline", href: "/ai-speaking/baseline" },
  { label: "Academic Framework", href: "/framework" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Terms", href: "/legal/terms" },
];

// Local link only (no global header item). Shown only while the Family
// Rewards gate is open; see src/lib/familyRewards/flag.ts.
const FAMILY_REWARDS_LINK = { label: "Family Rewards", href: FAMILY_REWARDS_ROUTE };

export function StudentAcademyFooter({ familyRewards = false }: { familyRewards?: boolean }) {
  const links = familyRewards ? [...LINKS.slice(0, 1), FAMILY_REWARDS_LINK, ...LINKS.slice(1)] : LINKS;
  return (
    <footer className="border-t border-[#E6DEC8] bg-white pb-24 lg:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <span
            className="text-[1.2rem] uppercase text-[#1E4D3B]"
            style={{ fontFamily: '"Neuland-Inline", Copperplate, Georgia, serif' }}
          >
            Jurassic English<sup className="text-[0.5em] text-[#B45309]">™</sup>
          </span>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm font-semibold text-[#1E4D3B] underline-offset-4 hover:text-[#B45309] hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-[#4A5568]">
          Looking for university AI governance, Circular 54 readiness, or school curriculum licensing? Visit{" "}
          <a href="https://www.worldwiselearning.app/" target="_blank" rel="noopener" className="font-bold text-[#1E4D3B] underline underline-offset-4">
            WorldWise Learning
          </a>
          .
        </p>
        <p className="mt-4 max-w-4xl border-t border-[#E6DEC8] pt-4 text-xs leading-relaxed text-[#4A5568]">
          Jurassic English™ is an independent education provider operated by WorldWise Learning in Hanoi, Vietnam
          (info@jurassicenglish.com, Zalo/Phone +84 396 085 076) and is not affiliated with or endorsed by IELTS, IDP,
          the British Council, or Cambridge. Band figures are coaching estimates, never guaranteed official exam scores.
        </p>
        <p className="mt-3 text-xs text-[#4A5568]">© 2026 World Wise Learning. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default StudentAcademyFooter;

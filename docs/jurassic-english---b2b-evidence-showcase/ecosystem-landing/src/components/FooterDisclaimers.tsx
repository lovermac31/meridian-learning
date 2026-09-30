/**
 * Standing disclaimers for every footer on the rewritten jurassicenglish.com routes (site-wide rule: all
 * disclaimers live in the footer). Wording mirrors the main site's Footer and passes tests/claims-safety.test.ts.
 */
const SITE = "https://jurassicenglish.com";

export const LEGAL_LINKS = [
  { label: "Terms", href: `${SITE}/legal/terms` },
  { label: "Privacy", href: `${SITE}/legal/privacy` },
  { label: "Cookies", href: `${SITE}/legal/cookies` },
  { label: "Accessibility", href: `${SITE}/legal/accessibility` },
  { label: "Disclaimer", href: `${SITE}/legal/disclaimer` },
] as const;

export const DISCLAIMERS = [
  "IELTS is a registered trademark of University of Cambridge ESOL, the British Council and IDP Education Australia. Jurassic English™ is independent and is not affiliated with, approved or endorsed by them.",
  "Jurassic English™ does not promise any score, band, grade or admission outcome. Progress depends on each learner's starting point, attendance and practice.",
  "Jurassic AI Speaking gives AI-generated practice feedback. It is not an official IELTS score and is not an official basis for grading, placement, admission or employment.",
] as const;

export function FooterDisclaimers({ className = "" }: { className?: string }) {
  return (
    <div className={`text-left text-xs leading-relaxed text-primary-foreground/55 ${className}`}>
      <nav aria-label="Legal" className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
        {LEGAL_LINKS.map((l) => (
          <a key={l.href} href={l.href} className="text-primary-foreground/70 transition-colors hover:text-primary-foreground">{l.label}</a>
        ))}
        <a href="mailto:info@jurassicenglish.com" className="text-primary-foreground/70 transition-colors hover:text-primary-foreground">info@jurassicenglish.com</a>
      </nav>
      <ul className="space-y-1">
        {DISCLAIMERS.map((d) => <li key={d}>{d}</li>)}
      </ul>
    </div>
  );
}

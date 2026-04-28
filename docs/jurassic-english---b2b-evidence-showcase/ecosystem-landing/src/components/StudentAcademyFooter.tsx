import Link from "next/link";

// Student Academy footer.
// Anchor IDs and routes were verified against the rendered /student-academy
// page and the ecosystem-landing route table. Manual Access entries are
// rendered as muted "Coming soon" text only — no links — until those flows
// are built. Legal links resolve to the production www.jurassicenglish.com
// /legal section.

type FooterLink = {
  label: string;
  href: string;
};

type FooterComingSoon = {
  label: string;
};

type FooterColumn = {
  heading: string;
  description?: string;
  links?: FooterLink[];
  comingSoon?: FooterComingSoon[];
};

const academyColumn: FooterColumn = {
  heading: "Student Academy",
  links: [
    { label: "Five-level pathway", href: "/student-academy#pathway" },
    {
      label: "Thinking Cycle",
      href: "/student-academy#thinking-cycle-heading",
    },
    {
      label: "Interactive Demo",
      href: "/interactive-demo",
    },
    {
      label: "Writing with evidence (CEIW)",
      href: "/student-academy#ceiw-heading",
    },
    {
      label: "Digital Reasoning Engine",
      href: "/student-academy#dre-heading",
    },
    {
      label: "Built for every learner",
      href: "/student-academy#every-learner-heading",
    },
    {
      label: "Frequently asked questions",
      href: "/student-academy#student-faq-heading",
    },
  ],
};

const placementColumn: FooterColumn = {
  heading: "Placement & evidence",
  links: [
    {
      label: "Student Thinking Diagnostic",
      href: "/student-academy#diagnostic-detail",
    },
    { label: "Book a Diagnostic", href: "/book-diagnostic" },
    {
      label: "DRE — full overview",
      href: "/digital-reasoning-engine",
    },
    {
      label: "Talk to the Academy team",
      href: "/student-academy#student-final-cta-heading",
    },
  ],
};

const accessColumn: FooterColumn = {
  heading: "Manual Access",
  description:
    "Direct learner and family resources are being prepared for the public launch.",
  comingSoon: [
    { label: "Parent guide" },
    { label: "Learner workbook samples" },
    { label: "Counsellor briefing" },
  ],
};

const legalColumn: FooterColumn = {
  heading: "Legal & Privacy",
  links: [
    { label: "Terms of Service", href: "https://www.jurassicenglish.com/legal/terms" },
    { label: "Privacy Policy", href: "https://www.jurassicenglish.com/legal/privacy" },
    { label: "Cookie Policy", href: "https://www.jurassicenglish.com/legal/cookies" },
    {
      label: "Accessibility Statement",
      href: "https://www.jurassicenglish.com/legal/accessibility",
    },
    { label: "Disclaimer", href: "https://www.jurassicenglish.com/legal/disclaimer" },
    {
      label: "legal@worldwiselearning.com",
      href: "mailto:legal@worldwiselearning.com",
    },
  ],
};

const FOOTER_COLUMNS: FooterColumn[] = [
  academyColumn,
  placementColumn,
  accessColumn,
  legalColumn,
];

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function isMailtoHref(href: string) {
  return /^mailto:/i.test(href);
}

function renderColumnLinks(column: FooterColumn) {
  if (column.comingSoon && column.comingSoon.length > 0) {
    return (
      <ul className="space-y-2 text-sm">
        {column.comingSoon.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 text-primary-foreground/45"
          >
            <span>{item.label}</span>
            <span className="rounded-full border border-primary-foreground/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] text-primary-foreground/55">
              Coming soon
            </span>
          </li>
        ))}
      </ul>
    );
  }

  if (!column.links || column.links.length === 0) {
    return null;
  }

  return (
    <ul className="space-y-2 text-sm">
      {column.links.map((link) => {
        if (isMailtoHref(link.href)) {
          return (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-primary-foreground/65 transition-colors hover:text-primary-foreground"
              >
                {link.label}
              </a>
            </li>
          );
        }
        if (isExternalHref(link.href)) {
          return (
            <li key={link.href}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/65 transition-colors hover:text-primary-foreground"
              >
                {link.label}
              </a>
            </li>
          );
        }
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-primary-foreground/65 transition-colors hover:text-primary-foreground"
            >
              {link.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function StudentAcademyFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-primary-foreground/10 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-10 flex flex-col items-start gap-4">
          <span className="font-display text-2xl tracking-tight text-primary-foreground">
            Jurassic English
            <span className="text-xs align-top text-jurassic-accent">™</span>{" "}
            Student Academy
          </span>
          <p className="max-w-xl text-sm text-primary-foreground/65">
            A five-level literature-based learning ecosystem that helps
            students read deeply, speak clearly, write with evidence, and
            think in English.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {FOOTER_COLUMNS.map((column) => (
            <section
              key={column.heading}
              aria-label={column.heading}
              className="flex flex-col gap-3"
            >
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/80">
                {column.heading}
              </h2>
              {column.description ? (
                <p className="text-xs text-primary-foreground/55">
                  {column.description}
                </p>
              ) : null}
              {renderColumnLinks(column)}
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-xs text-primary-foreground/55">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <span className="font-semibold uppercase tracking-[0.18em] text-primary-foreground/70">
              Contact
            </span>
            <a
              href="mailto:info@jurassicenglish.com"
              className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
            >
              info@jurassicenglish.com
            </a>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <p>
              © {year} World Wise Learning. All rights reserved. Jurassic
              English
              <span className="align-top">™</span> is a trademark of World
              Wise Learning.
            </p>
            <Link
              href="/evidence"
              className="text-primary-foreground/65 transition-colors hover:text-primary-foreground"
            >
              Claims &amp; Evidence Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default StudentAcademyFooter;

import type { Metadata } from "next";
import Link from "next/link";
import {
  EvidenceSafeClaimBox,
  ThisIsForBlock,
  DREFlowDiagram,
} from "@/components/shared-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Building,
  GraduationCap,
  LayoutDashboard,
  User,
  Users,
} from "lucide-react";
import {
  jeThemeCss,
  JE_CTA_PRIMARY_DARK,
  JE_CTA_GLASS_DARK,
  JE_EYEBROW_DARK,
  JE_EYEBROW_LIGHT,
} from "@/lib/jeTheme";
import { JsonLd } from "@/components/JsonLd";

// Sprint 3A — page-level structured data.
const DRE_WEBPAGE_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://jurassicenglish.com/digital-reasoning-engine#webpage",
  url: "https://jurassicenglish.com/digital-reasoning-engine",
  name: "Digital Reasoning Engine | Jurassic English™",
  description:
    "How the Jurassic English™ Digital Reasoning Engine helps students build claims, organize evidence, construct CEIW arguments, and generate portfolio proof.",
  isPartOf: { "@id": "https://jurassicenglish.com/#website" },
  about: { "@id": "https://jurassicenglish.com/#organization" },
  inLanguage: "en",
};

// Page-specific metadata (Sprint 1 — preserved unchanged in Sprint 2).
export const metadata: Metadata = {
  title: "Digital Reasoning Engine | Jurassic English™",
  description:
    "How the Jurassic English™ Digital Reasoning Engine helps students build claims, organize evidence, construct CEIW arguments, and generate portfolio proof.",
  alternates: {
    canonical: "/digital-reasoning-engine",
  },
  openGraph: {
    title: "Digital Reasoning Engine | Jurassic English™",
    description:
      "A digital reasoning scaffold that supports claim-making, evidence organization, CEIW arguments, and portfolio evidence — reviewed by teachers.",
    type: "website",
    url: "/digital-reasoning-engine",
    images: [
      {
        url: "/images/student-academy-page/student-academy-hero.webp",
        width: 1200,
        height: 630,
        alt: "Jurassic English™ Digital Reasoning Engine",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Digital Reasoning Engine | Jurassic English™",
    description:
      "A digital reasoning scaffold for claims, evidence, CEIW arguments, and portfolio evidence.",
    images: ["/images/student-academy-page/student-academy-hero.webp"],
  },
};

// Sprint 2 — page-scoped JE theme. Mirrors `sa-theme` / `id-theme`.
const dreThemeCss = jeThemeCss("dre-theme");

export default function DigitalReasoningEngine() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dreThemeCss }} />
      <JsonLd data={DRE_WEBPAGE_LD} id="ld-dre" />
      <div className="dre-theme bg-background">
        {/* Hero — premium dark pattern matching SA + ID */}
        <section
          aria-labelledby="dre-hero-heading"
          className="relative overflow-hidden bg-primary text-primary-foreground"
        >
          <div className="hidden lg:block absolute -right-20 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="hidden lg:block absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-muted/15 blur-3xl pointer-events-none" />
          <div className="container mx-auto max-w-5xl px-6 py-20 lg:py-24 relative">
            <div className="text-center">
              <Badge variant="outline" className={JE_EYEBROW_DARK}>
                <Users className="w-3 h-3" />
                Teachers, centers &amp; schools
              </Badge>
              <h1
                id="dre-hero-heading"
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5 text-primary-foreground"
              >
                Jurassic English
                <span className="align-super text-base text-accent">™</span>{" "}
                Digital Reasoning Engine
                <span className="block text-accent font-serif font-light italic mt-2 text-3xl md:text-4xl lg:text-5xl">
                  Make student thinking visible.
                </span>
              </h1>
              <p className="text-lg md:text-xl font-light leading-relaxed text-primary-foreground/75 mb-8 max-w-2xl mx-auto">
                A digital reasoning scaffold that helps students build claims,
                organize evidence, construct CEIW arguments, and generate
                portfolio proof.
              </p>
              <p className="mt-4 text-xs italic text-primary-foreground/55 max-w-xl mx-auto">
                The DRE does not replace teachers. It helps make reasoning
                visible, structured, reviewable, and reportable. The teacher
                always has the final word.
              </p>
            </div>
          </div>
        </section>

        {/* Content — parchment surfaces, premium cards */}
        <section
          aria-labelledby="dre-body-heading"
          className="py-16 md:py-20 px-6 bg-background"
        >
          <h2 id="dre-body-heading" className="sr-only">
            What the Digital Reasoning Engine supports
          </h2>
          <div className="container mx-auto max-w-5xl space-y-20 md:space-y-24">
            {/* What DRE Solves */}
            <section aria-labelledby="dre-solves-heading">
              <div className="text-center mb-10">
                <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                  Why it exists
                </Badge>
                <h2
                  id="dre-solves-heading"
                  className="text-3xl md:text-[2.25rem] font-bold text-primary leading-[1.2]"
                >
                  What the DRE solves
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Students give vague answers",
                  "Teachers struggle to track reasoning",
                  "Parents cannot see thinking growth",
                  "Centers need visible progress evidence",
                  "Schools need reviewable academic artifacts",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl bg-white border border-primary/10 px-5 py-4"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                    />
                    <p className="text-[15px] font-medium text-foreground/85 leading-snug">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <ThisIsForBlock
                  isFor="Institutions and teachers looking to scaffold the reasoning process and capture visible evidence."
                  isNotFor="An LMS replacement or an automated grading system."
                />
              </div>
            </section>

            {/* How It Works */}
            <section
              id="how-it-works"
              aria-labelledby="dre-how-heading"
            >
              <div className="text-center mb-10">
                <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                  How it works
                </Badge>
                <h2
                  id="dre-how-heading"
                  className="text-3xl md:text-[2.25rem] font-bold text-primary leading-[1.2] mb-3"
                >
                  A structured reasoning sequence.
                </h2>
                <p className="text-[15px] md:text-base font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  The DRE guides students through claim-making, evidence,
                  interpretation, and warrant — and captures the thought
                  process at every step for teacher review.
                </p>
              </div>
              <DREFlowDiagram />
            </section>

            {/* DRE by Level */}
            <section aria-labelledby="dre-by-level-heading">
              <div className="text-center mb-10">
                <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                  By level
                </Badge>
                <h2
                  id="dre-by-level-heading"
                  className="text-3xl md:text-[2.25rem] font-bold text-primary leading-[1.2]"
                >
                  How depth grows from Level 1 to Level 5.
                </h2>
              </div>
              <div className="overflow-x-auto rounded-2xl border border-primary/10 bg-white">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#F4F1EA] text-primary">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em] border-r border-primary/10"
                      >
                        Level
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.14em]"
                      >
                        DRE function
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { level: "Level 1", func: "Word Fossil + Because Bridge" },
                      { level: "Level 2", func: "Claim + Evidence card" },
                      { level: "Level 3", func: "Thinking Cycle map" },
                      { level: "Level 4", func: "CEIW essay builder" },
                      { level: "Level 5", func: "Dual Warrant + IELTS argument map" },
                    ].map((row) => (
                      <tr
                        key={row.level}
                        className="border-b border-primary/5 last:border-0 hover:bg-primary/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-bold text-primary border-r border-primary/10 whitespace-nowrap">
                          {row.level}
                        </td>
                        <td className="px-6 py-4 text-foreground/85">
                          {row.func}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* User Views */}
            <section aria-labelledby="dre-views-heading">
              <div className="text-center mb-10">
                <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                  Who sees what
                </Badge>
                <h2
                  id="dre-views-heading"
                  className="text-3xl md:text-[2.25rem] font-bold text-primary leading-[1.2]"
                >
                  Comprehensive views for every stakeholder.
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                {[
                  { icon: User, label: "Student dashboard" },
                  { icon: Users, label: "Parent summary" },
                  { icon: GraduationCap, label: "Teacher evidence view" },
                  { icon: LayoutDashboard, label: "Center cohort view" },
                  { icon: Building, label: "School reporting view" },
                ].map((item) => (
                  <Card
                    key={item.label}
                    className="bg-white border border-primary/10 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgba(16,24,32,0.25)] transition-all"
                  >
                    <CardContent className="p-6 flex flex-col items-center justify-center gap-3 h-full">
                      <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <item.icon className="w-5 h-5" />
                      </span>
                      <span className="text-[13px] font-semibold text-primary leading-snug">
                        {item.label}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* Proof — claims-safe statement box */}
            <section aria-labelledby="dre-proof-heading">
              <h2 id="dre-proof-heading" className="sr-only">
                Claims and Evidence
              </h2>
              <EvidenceSafeClaimBox
                approvedClaim="The DRE is built to collect evidence of reasoning growth over time."
                unsupportedClaimToAvoid="The DRE proves score improvement."
                evidenceType={[
                  "Reasoning Sequences",
                  "Argument Maps",
                  "Portfolio Generation",
                ]}
              />
            </section>
          </div>
        </section>

        {/*
          Sprint 1 conversion CTA — preserved verbatim. Headline + body +
          both link destinations are unchanged. Only visual layout is now
          aligned with the JE theme + premium CTA recipes.
        */}
        <section
          aria-labelledby="dre-conversion-cta-heading"
          className="py-16 md:py-20 px-6 bg-primary text-primary-foreground"
        >
          <div className="container mx-auto max-w-3xl text-center">
            <Badge variant="outline" className={JE_EYEBROW_DARK}>
              Ready to take the next step?
            </Badge>
            <h2
              id="dre-conversion-cta-heading"
              className="text-3xl md:text-[2.25rem] font-bold leading-[1.2] mb-3 text-primary-foreground"
            >
              Want to see how this supports a real student pathway?
            </h2>
            <p className="text-base md:text-lg font-light text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Start with the Interactive Demo, then book a Student Thinking
              Diagnostic to identify the right starting point.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/interactive-demo" className={JE_CTA_PRIMARY_DARK}>
                Open the Interactive Demo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link href="/book-diagnostic" className={JE_CTA_GLASS_DARK}>
                Book a Diagnostic
              </Link>
            </div>
            <p className="mt-4 text-xs italic text-primary-foreground/55">
              We do not promise scores. The teacher always has the final word
              on placement and progress.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

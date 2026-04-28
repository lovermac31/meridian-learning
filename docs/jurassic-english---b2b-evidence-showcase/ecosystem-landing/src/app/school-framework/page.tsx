import type { Metadata } from "next";
import Link from "next/link";
import {
  EvidenceSafeClaimBox,
  ThisIsForBlock,
  PathwayFooterWarning,
} from "@/components/shared-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  GraduationCap,
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
const SCHOOL_FRAMEWORK_WEBPAGE_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://jurassicenglish.com/school-framework#webpage",
  url: "https://jurassicenglish.com/school-framework",
  name: "School Framework | Jurassic English™",
  description:
    "A coherent literature-based English curriculum for schools and centers — curriculum alignment, teacher consistency, visible portfolio evidence, and a premium academic English pathway.",
  isPartOf: { "@id": "https://jurassicenglish.com/#website" },
  about: { "@id": "https://jurassicenglish.com/#organization" },
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "school",
  },
  inLanguage: "en",
};

// Page-specific metadata (Sprint 1 — preserved unchanged in Sprint 2).
export const metadata: Metadata = {
  title: "School Framework | Jurassic English™",
  description:
    "A coherent literature-based English curriculum for schools and centers — curriculum alignment, teacher consistency, visible portfolio evidence, and a premium academic English pathway.",
  alternates: {
    canonical: "/school-framework",
  },
  openGraph: {
    title: "School Framework | Jurassic English™",
    description:
      "Curriculum coherence, teacher consistency, visible portfolio evidence, and a premium academic English pathway for schools and centers.",
    type: "website",
    url: "/school-framework",
    images: [
      {
        url: "/images/student-academy-page/student-academy-hero.webp",
        width: 1200,
        height: 630,
        alt: "Jurassic English™ School Framework",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "School Framework | Jurassic English™",
    description:
      "Curriculum coherence, teacher consistency, visible portfolio evidence, and a premium academic English pathway for schools and centers.",
    images: ["/images/student-academy-page/student-academy-hero.webp"],
  },
};

const sfThemeCss = jeThemeCss("sf-theme");

export default function SchoolFramework() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: sfThemeCss }} />
      <JsonLd data={SCHOOL_FRAMEWORK_WEBPAGE_LD} id="ld-school-framework" />
      <div className="sf-theme bg-background">
        {/* Hero — premium dark pattern matching SA + ID + DRE + Evidence */}
        <section
          aria-labelledby="sf-hero-heading"
          className="relative overflow-hidden bg-primary text-primary-foreground"
        >
          <div className="hidden lg:block absolute -right-20 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="hidden lg:block absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-muted/15 blur-3xl pointer-events-none" />
          <div className="container mx-auto max-w-5xl px-6 py-20 lg:py-24 relative">
            <div className="text-center">
              <Badge variant="outline" className={JE_EYEBROW_DARK}>
                <Building2 className="w-3 h-3" />
                Schools &amp; centers
              </Badge>
              <h1
                id="sf-hero-heading"
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5 text-primary-foreground"
              >
                Jurassic English
                <span className="align-super text-base text-accent">™</span>{" "}
                School Framework
                <span className="block text-accent font-serif font-light italic mt-2 text-2xl md:text-3xl lg:text-4xl">
                  A coherent literature-based English curriculum.
                </span>
              </h1>
              <p className="text-lg md:text-xl font-light leading-relaxed text-primary-foreground/75 mb-2 max-w-2xl mx-auto">
                Designed for institutions that need curriculum coherence,
                teacher consistency, visible student progress, and a premium
                academic English pathway.
              </p>
            </div>
          </div>
        </section>

        {/* Body */}
        <section
          aria-labelledby="sf-body-heading"
          className="py-16 md:py-20 px-6 bg-background"
        >
          <h2 id="sf-body-heading" className="sr-only">
            School framework detail
          </h2>
          <div className="container mx-auto max-w-5xl space-y-20 md:space-y-24">
            {/* The Institutional Problem */}
            <section aria-labelledby="sf-problem-heading">
              <div className="text-center mb-10">
                <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                  Why schools come to us
                </Badge>
                <h2
                  id="sf-problem-heading"
                  className="text-3xl md:text-[2.25rem] font-bold text-primary leading-[1.2]"
                >
                  The institutional problem.
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Fragmented curriculum",
                    desc: "No clear progression between levels or disjointed materials.",
                  },
                  {
                    title: "Inconsistent delivery",
                    desc: "Heavy reliance on individual teacher interpretation and varying quality.",
                  },
                  {
                    title: "Unclear evidence",
                    desc: "Parents demand proof of progress, but centers lack visible artifacts.",
                  },
                ].map((item) => (
                  <Card
                    key={item.title}
                    className="border border-destructive/15 bg-destructive/5"
                  >
                    <CardContent className="p-6">
                      <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-destructive/10 text-destructive mb-4">
                        <AlertTriangle className="w-4 h-4" />
                      </span>
                      <h3 className="font-bold text-destructive mb-2 text-base">
                        {item.title}
                      </h3>
                      <p className="text-sm text-foreground/75 leading-relaxed">
                        {item.desc}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8">
                <ThisIsForBlock
                  isFor="Schools and centers seeking curriculum coherence and teacher implementation support."
                  isNotFor="A single-student tutoring package."
                />
              </div>
            </section>

            {/* What the Framework Provides */}
            <section
              id="overview"
              aria-labelledby="sf-overview-heading"
            >
              <div className="rounded-2xl bg-primary text-primary-foreground p-8 md:p-12">
                <div className="text-center mb-10">
                  <Badge variant="outline" className={JE_EYEBROW_DARK}>
                    What you get
                  </Badge>
                  <h2
                    id="sf-overview-heading"
                    className="text-3xl md:text-[2.25rem] font-bold leading-[1.2] text-primary-foreground"
                  >
                    What the framework provides.
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 max-w-3xl mx-auto">
                  {[
                    "Level 1–5 curriculum map",
                    "Teacher training",
                    "Assessment rubrics",
                    "DRE integration",
                    "Parent reporting",
                    "Neuroinclusive learning support",
                    "Implementation review",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                      <span className="font-medium text-base text-primary-foreground/90 leading-snug">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Center & School Benefits */}
            <section aria-labelledby="sf-benefits-heading">
              <div className="text-center mb-10">
                <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                  Two audiences
                </Badge>
                <h2
                  id="sf-benefits-heading"
                  className="text-3xl md:text-[2.25rem] font-bold text-primary leading-[1.2]"
                >
                  Center and school benefits.
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-white border border-primary/10">
                  <CardContent className="p-7 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Building2 className="w-5 h-5" />
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold text-primary">
                        Center benefits
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {[
                        "Differentiation from generic English centers",
                        "Higher-value academic positioning",
                        "Scalable cohort model",
                        "Clearer parent communication",
                        "Teacher delivery consistency",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                          <span className="text-[15px] text-foreground/85 leading-snug">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-primary/10">
                  <CardContent className="p-7 md:p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <GraduationCap className="w-5 h-5" />
                      </span>
                      <h3 className="text-xl md:text-2xl font-bold text-primary">
                        School benefits
                      </h3>
                    </div>
                    <ul className="space-y-3">
                      {[
                        "Standards-informed progression",
                        "Academic English pathway",
                        "Teacher calibration",
                        "Visible portfolio evidence",
                        "Stronger curriculum identity",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span
                            aria-hidden="true"
                            className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                          />
                          <span className="text-[15px] text-foreground/85 leading-snug">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Proof — claims-safe statement box */}
            <section aria-labelledby="sf-proof-heading">
              <h2 id="sf-proof-heading" className="sr-only">
                Claims and Evidence
              </h2>
              <EvidenceSafeClaimBox
                approvedClaim="The framework is designed to generate visible learning evidence through student portfolios, writing samples, classroom discussion records, and teacher assessment rubrics."
                unsupportedClaimToAvoid="Our program guarantees higher exam scores."
                evidenceType={[
                  "Portfolios",
                  "Writing Samples",
                  "Discussion Records",
                  "Teacher Rubrics",
                ]}
              />
            </section>

            <PathwayFooterWarning
              text="Looking for individual student support instead?"
              linkText="Explore Jurassic English™ Student Academy"
              href="/student-academy"
            />
          </div>
        </section>

        {/*
          Sprint 1 school-facing B2B CTA — preserved verbatim. Headline +
          body + both link destinations are unchanged. Visual layout now
          aligns with the JE theme + premium CTA recipes.
        */}
        <section
          aria-labelledby="school-cta-heading"
          className="py-16 md:py-20 px-6 bg-primary text-primary-foreground"
        >
          <div className="container mx-auto max-w-3xl text-center">
            <Badge variant="outline" className={JE_EYEBROW_DARK}>
              Ready to take the next step?
            </Badge>
            <h2
              id="school-cta-heading"
              className="text-3xl md:text-[2.25rem] font-bold leading-[1.2] mb-3 text-primary-foreground"
            >
              Want to explore this framework for your school?
            </h2>
            <p className="text-base md:text-lg font-light text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Review the framework, then contact Jurassic English<span className="align-super text-xs text-accent">™</span>{" "}
              to discuss curriculum alignment, teacher training, or a school
              pilot.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://www.jurassicenglish.com/get-started"
                className={JE_CTA_PRIMARY_DARK}
              >
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
              <Link href="/evidence" className={JE_CTA_GLASS_DARK}>
                View the Evidence Policy
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

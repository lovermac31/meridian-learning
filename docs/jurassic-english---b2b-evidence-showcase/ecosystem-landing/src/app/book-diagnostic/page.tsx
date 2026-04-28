import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { RegistrationForm } from "@/components/student-academy/RegistrationForm";
import { JsonLd } from "@/components/JsonLd";

// Sprint 3A — page-level structured data. ContactPage is the closest
// Schema.org type for a diagnostic-request form. No offers, prices, or
// rating fields per spec.
const BOOK_DIAGNOSTIC_LD = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "@id": "https://jurassicenglish.com/book-diagnostic#webpage",
  url: "https://jurassicenglish.com/book-diagnostic",
  name: "Book a Student Thinking Diagnostic | Jurassic English™ Student Academy",
  description:
    "Find the right starting point for your child. Tell us about your child's English level, learning goals, and current needs. We will review the information and follow up with the next step.",
  isPartOf: { "@id": "https://jurassicenglish.com/#website" },
  about: { "@id": "https://jurassicenglish.com/#student-academy-course" },
  inLanguage: "en",
};

export const metadata: Metadata = {
  title:
    "Book a Student Thinking Diagnostic | Jurassic English™ Student Academy",
  description:
    "Find the right starting point for your child. Tell us about your child's English level, learning goals, and current needs. We will review the information and follow up with the next step.",
  alternates: {
    canonical: "/book-diagnostic",
  },
  openGraph: {
    title:
      "Book a Student Thinking Diagnostic | Jurassic English™ Student Academy",
    description:
      "Find the right starting point for your child. A clear, parent-friendly next step after the Interactive Demo.",
    type: "website",
    url: "/book-diagnostic",
    images: [
      {
        url: "/images/student-academy-page/student-academy-hero.webp",
        width: 1200,
        height: 630,
        alt: "Jurassic English™ Student Academy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Book a Student Thinking Diagnostic | Jurassic English™ Student Academy",
    description:
      "Find the right starting point for your child. A clear, parent-friendly next step.",
    images: ["/images/student-academy-page/student-academy-hero.webp"],
  },
};

const JE_EYEBROW_DARK =
  "bg-white/5 border border-white/10 text-white/85 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";
const JE_EYEBROW_LIGHT =
  "bg-[#F8F7F4] border border-foreground/10 text-foreground/70 mb-3 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";

const trustPoints = [
  "No pressure to enroll immediately",
  "Parent-friendly follow-up",
  "Clear starting-level recommendation",
  "Reading, reasoning, speaking, and writing pathway",
] as const;

const whatHappensNextSteps = [
  {
    n: 1,
    label: "We review your child's information.",
  },
  {
    n: 2,
    label: "We recommend the right starting point.",
  },
  {
    n: 3,
    label: "We contact you with the next step.",
  },
] as const;

function WhatHappensNextSection() {
  return (
    <section
      aria-labelledby="what-happens-next-heading"
      className="pb-16 px-4 bg-background"
    >
      <div className="container mx-auto max-w-3xl">
        <Card className="bg-card border border-primary/10">
          <CardContent className="p-6 md:p-8">
            <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
              After you submit
            </Badge>
            <h2
              id="what-happens-next-heading"
              className="text-2xl md:text-[1.75rem] font-bold text-primary leading-[1.2] mb-5"
            >
              What happens next?
            </h2>
            <ol className="space-y-3">
              {whatHappensNextSteps.map((step) => (
                <li key={step.n} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C5A059]/15 text-[#8a6f33] font-bold text-sm"
                  >
                    {step.n}
                  </span>
                  <span className="text-sm md:text-[15px] text-foreground/85 leading-snug">
                    {step.label}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[13px] italic text-foreground/60 leading-relaxed">
              The diagnostic is a starting-point conversation, not a
              pressure-based enrollment form.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default function BookDiagnosticPage() {
  return (
    <main className="min-h-screen bg-background">
      <JsonLd data={BOOK_DIAGNOSTIC_LD} id="ld-book-diagnostic" />
      {/* Hero band — Phase 12 Task D copy */}
      <section
        className="relative overflow-hidden bg-primary text-primary-foreground"
        aria-labelledby="register-hero-heading"
      >
        <div className="hidden lg:block absolute -right-20 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
        <div className="hidden lg:block absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-muted/15 blur-3xl pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-6 py-16 md:py-20 lg:py-24 relative">
          <Badge variant="outline" className={JE_EYEBROW_DARK}>
            Student Thinking Diagnostic
          </Badge>
          <h1
            id="register-hero-heading"
            className="text-4xl md:text-5xl font-bold leading-[1.05] mb-4 text-primary-foreground"
          >
            Find the right starting point for your child.
          </h1>
          <p className="text-lg md:text-xl font-light leading-relaxed text-primary-foreground/80 max-w-2xl">
            Tell us a little about your child&rsquo;s English level, learning
            goals, and current needs. We will review the information and follow
            up with the next step.
          </p>

          {/* Trust points — quick parent-facing reassurance */}
          <ul className="mt-7 grid sm:grid-cols-2 gap-x-6 gap-y-2 max-w-2xl">
            {trustPoints.map((point) => (
              <li
                key={point}
                className="flex items-start gap-2 text-sm text-primary-foreground/80"
              >
                <CheckCircle2
                  className="w-4 h-4 mt-0.5 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-sm italic text-primary-foreground/55 max-w-2xl">
            We do not promise scores. The teacher always has the final word on
            placement and progress.
          </p>
        </div>
      </section>

      {/* Form panel */}
      <section
        className="py-16 px-4 bg-background"
        aria-labelledby="register-form-heading"
      >
        <div className="container mx-auto max-w-3xl">
          <h2 id="register-form-heading" className="sr-only">
            Student Thinking Diagnostic request form
          </h2>
          <RegistrationForm />

          <p className="mt-8 text-center text-xs text-foreground/55">
            By submitting you agree to receive a confirmation email with the
            next step. We do not share your information with third parties.
          </p>
        </div>
      </section>

      {/* Phase 12 Task E — What happens next? */}
      <WhatHappensNextSection />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { ProofRoadmap } from "@/components/shared-ui";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  CheckCircle2,
  LineChart,
  MessageSquare,
  PenTool,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  jeThemeCss,
  JE_CTA_PRIMARY_LIGHT,
  JE_EYEBROW_DARK,
  JE_EYEBROW_LIGHT,
} from "@/lib/jeTheme";
import { JsonLd } from "@/components/JsonLd";

// Sprint 3A — page-level structured data.
const EVIDENCE_WEBPAGE_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://jurassicenglish.com/evidence#webpage",
  url: "https://jurassicenglish.com/evidence",
  name: "Evidence, Student Progress, and Responsible Claims | Jurassic English™",
  description:
    "How Jurassic English™ tracks learning through visible student work, diagnostic evidence, portfolio artifacts, and teacher-reviewed progress.",
  isPartOf: { "@id": "https://jurassicenglish.com/#website" },
  about: { "@id": "https://jurassicenglish.com/#organization" },
  inLanguage: "en",
};

// Page-specific metadata (Sprint 1 — preserved unchanged in Sprint 2).
export const metadata: Metadata = {
  title:
    "Evidence, Student Progress, and Responsible Claims | Jurassic English™",
  description:
    "How Jurassic English™ tracks learning through visible student work, diagnostic evidence, portfolio artifacts, and teacher-reviewed progress.",
  alternates: {
    canonical: "/evidence",
  },
  openGraph: {
    title:
      "Evidence, Student Progress, and Responsible Claims | Jurassic English™",
    description:
      "Visible student work, diagnostic evidence, portfolio artifacts, and teacher-reviewed progress — the Jurassic English™ Claims and Evidence Policy.",
    type: "website",
    url: "/evidence",
    images: [
      {
        url: "/images/student-academy-page/student-academy-hero.webp",
        width: 1200,
        height: 630,
        alt: "Jurassic English™ Claims and Evidence Policy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Evidence, Student Progress, and Responsible Claims | Jurassic English™",
    description:
      "How Jurassic English™ tracks learning through visible student work, diagnostic evidence, portfolio artifacts, and teacher-reviewed progress.",
    images: ["/images/student-academy-page/student-academy-hero.webp"],
  },
};

const evidenceThemeCss = jeThemeCss("evi-theme");

export default function EvidencePolicy() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: evidenceThemeCss }} />
      <JsonLd data={EVIDENCE_WEBPAGE_LD} id="ld-evidence" />
      <div className="evi-theme bg-background">
        {/* Hero — premium dark pattern matching SA + ID + DRE */}
        <section
          aria-labelledby="evi-hero-heading"
          className="relative overflow-hidden bg-primary text-primary-foreground"
        >
          <div className="hidden lg:block absolute -right-20 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
          <div className="hidden lg:block absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-muted/15 blur-3xl pointer-events-none" />
          <div className="container mx-auto max-w-4xl px-6 py-20 lg:py-24 relative">
            <div className="text-center">
              <Badge variant="outline" className={JE_EYEBROW_DARK}>
                <ShieldCheck className="w-3 h-3" />
                Claims policy
              </Badge>
              <h1
                id="evi-hero-heading"
                className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5 text-primary-foreground"
              >
                Evidence, student progress,
                <span className="block text-accent font-serif font-light italic mt-2 text-3xl md:text-4xl lg:text-5xl">
                  and responsible claims.
                </span>
              </h1>
              <p className="text-lg md:text-xl font-light leading-relaxed text-primary-foreground/80 max-w-2xl mx-auto">
                Jurassic English<span className="align-super text-xs text-accent">™</span>{" "}
                tracks learning through visible student work, diagnostic
                evidence, portfolio artifacts, and teacher-reviewed progress.
              </p>
              <p className="mt-4 text-xs italic text-primary-foreground/55 max-w-xl mx-auto">
                We do not promise scores. The teacher always has the final
                word.
              </p>
            </div>
          </div>
        </section>

        {/* Body */}
        <section
          aria-labelledby="evi-body-heading"
          className="py-16 md:py-20 px-6 bg-background"
        >
          <h2 id="evi-body-heading" className="sr-only">
            Evidence policy detail
          </h2>
          <div className="container mx-auto max-w-5xl space-y-20 md:space-y-24">
            {/* What We Track */}
            <section aria-labelledby="evi-track-heading">
              <div className="text-center mb-10">
                <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                  Visible learning evidence
                </Badge>
                <h2
                  id="evi-track-heading"
                  className="text-3xl md:text-[2.25rem] font-bold text-primary leading-[1.2]"
                >
                  What we track.
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { icon: PenTool, text: "Diagnostic writing samples" },
                  { icon: MessageSquare, text: "Speaking samples" },
                  { icon: CheckCircle2, text: "CEIW paragraphs" },
                  { icon: PenTool, text: "Essay revisions" },
                  { icon: LineChart, text: "Growth Portfolio entries" },
                  { icon: BookOpen, text: "Reflection records" },
                  { icon: UserCheck, text: "Teacher rubric notes" },
                  { icon: ShieldCheck, text: "Parent progress reports" },
                ].map((item, i) => (
                  <Card
                    key={`${item.text}-${i}`}
                    className="bg-white border border-primary/10 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgba(16,24,32,0.25)] transition-all"
                  >
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                      <span className="inline-flex w-9 h-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <item.icon className="w-4 h-4" />
                      </span>
                      <span className="text-[13px] font-medium text-foreground/85 leading-snug">
                        {item.text}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* What We Do Not Claim Yet */}
            <section aria-labelledby="evi-not-claim-heading">
              <Card className="border border-destructive/15 bg-destructive/5">
                <CardContent className="p-7 md:p-9">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <ShieldAlert className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-destructive/80 mb-1">
                        Public denial
                      </p>
                      <h2
                        id="evi-not-claim-heading"
                        className="text-2xl md:text-[1.75rem] font-bold text-destructive leading-[1.2]"
                      >
                        What we do not claim yet.
                      </h2>
                    </div>
                  </div>
                  <p className="text-[15px] md:text-base text-foreground/85 leading-relaxed font-medium">
                    Until sufficient pilot data has been collected, Jurassic
                    English<span className="align-super text-xs text-accent">™</span>{" "}
                    does not claim guaranteed score increases, guaranteed
                    IELTS bands, guaranteed school admission, or
                    statistically proven outcomes.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* What We Can Responsibly Say */}
            <section aria-labelledby="evi-responsibly-heading">
              <Card className="border border-primary/15 bg-primary/5">
                <CardContent className="p-7 md:p-9">
                  <div className="flex items-start gap-4 mb-4">
                    <span className="inline-flex w-10 h-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <CheckCircle2 className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary/80 mb-1">
                        Responsible position
                      </p>
                      <h2
                        id="evi-responsibly-heading"
                        className="text-2xl md:text-[1.75rem] font-bold text-primary leading-[1.2]"
                      >
                        What we can responsibly say.
                      </h2>
                    </div>
                  </div>
                  <p className="text-[15px] md:text-base text-foreground/85 leading-relaxed font-medium">
                    Jurassic English<span className="align-super text-xs text-accent">™</span>{" "}
                    is designed to develop the underlying skills connected to
                    academic English performance: reading comprehension,
                    evidence use, argument structure, speaking confidence,
                    reflection, and academic vocabulary.
                  </p>
                </CardContent>
              </Card>
            </section>

            {/* Future Evidence Roadmap */}
            <section aria-labelledby="evi-roadmap-heading">
              <div className="text-center mb-10">
                <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                  Roadmap
                </Badge>
                <h2
                  id="evi-roadmap-heading"
                  className="text-3xl md:text-[2.25rem] font-bold text-primary leading-[1.2]"
                >
                  Future evidence roadmap.
                </h2>
              </div>
              <ProofRoadmap />
            </section>

            {/* CTA — sample portfolio request */}
            <section aria-labelledby="evi-cta-heading">
              <Card className="border border-primary/10 bg-card">
                <CardContent className="p-8 md:p-12 text-center">
                  <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                    Sample portfolio
                  </Badge>
                  <h2
                    id="evi-cta-heading"
                    className="text-2xl md:text-[1.75rem] font-bold text-primary leading-[1.2] mb-3"
                  >
                    Want to see our progress?
                  </h2>
                  <p className="text-[15px] md:text-base text-foreground/75 max-w-xl mx-auto mb-7 leading-relaxed">
                    We are actively building our portfolio of evidence. Reach
                    out to see anonymized samples of student work and
                    cognitive mapping.
                  </p>
                  <Link
                    href="/book-consultation"
                    className={JE_CTA_PRIMARY_LIGHT}
                  >
                    Request Sample Portfolio Evidence
                  </Link>
                </CardContent>
              </Card>
            </section>
          </div>
        </section>
      </div>
    </>
  );
}

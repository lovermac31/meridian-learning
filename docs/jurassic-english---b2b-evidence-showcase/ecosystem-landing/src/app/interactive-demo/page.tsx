import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  BookOpen,
  Compass,
  MessageSquare,
  PenTool,
  ScrollText,
  Users,
} from "lucide-react";
import { PathwayExplorer } from "@/components/interactive-demo/PathwayExplorer";
import { TryOneThinkingMove } from "@/components/interactive-demo/TryOneThinkingMove";
import { DiagnosticBridge } from "@/components/interactive-demo/DiagnosticBridge";
import { MobileStickyConvBar } from "@/components/interactive-demo/MobileStickyConvBar";
import { JsonLd } from "@/components/JsonLd";
import { parentEvidenceItems } from "@/lib/interactiveDemoLevels";

// Sprint 3A — page-level structured data. WebPage describes the
// Interactive Demo and links it back to the Student Academy course as
// the topic.
const INTERACTIVE_DEMO_WEBPAGE_LD = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://jurassicenglish.com/interactive-demo#webpage",
  url: "https://jurassicenglish.com/interactive-demo",
  name: "Interactive Demo | Jurassic English™ Student Academy Pathway Explorer",
  description:
    "Preview how a Jurassic English™ student moves from first story claims at Level 1 to advanced exam-transfer reasoning at Level 5.",
  isPartOf: { "@id": "https://jurassicenglish.com/#website" },
  about: { "@id": "https://jurassicenglish.com/#student-academy-course" },
  inLanguage: "en",
};

export const metadata: Metadata = {
  title:
    "Interactive Demo | Jurassic English™ Student Academy Pathway Explorer",
  description:
    "Preview how a Jurassic English™ student moves from first story claims at Level 1 to advanced exam-transfer reasoning at Level 5. A guided, parent-friendly look at the five-level pathway.",
  alternates: {
    canonical: "/interactive-demo",
  },
  openGraph: {
    title:
      "Jurassic English™ Student Academy — Interactive Pathway Demo",
    description:
      "Explore how students move from first story claims to evidence-based interpretation, academic writing, and advanced argument across five levels.",
    type: "website",
    siteName: "Jurassic English™",
    url: "/interactive-demo",
    images: [
      {
        url: "/images/student-academy-page/student-academy-hero.webp",
        width: 1200,
        height: 630,
        alt: "Jurassic English™ Student Academy Interactive Demo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jurassic English™ Student Academy Interactive Pathway Demo",
    description:
      "Preview the five-level student thinking pathway, from claim-making to academic argument.",
    images: ["/images/student-academy-page/student-academy-hero.webp"],
  },
};

// Reuse the same theme tokens used on /student-academy so the Interactive
// Demo feels like a natural extension of the Student Academy experience
// rather than a separate technical product.
const interactiveDemoThemeCss = `
  .id-theme {
    --background:           #ffffff;
    --foreground:           #101820;
    --primary:              #101820;
    --primary-foreground:   #F4F1EA;
    --secondary:            #101820;
    --secondary-foreground: #F4F1EA;
    --accent:               #F26419;
    --accent-foreground:    #ffffff;
    --card:                 #F8F7F4;
    --card-foreground:      #101820;
    --muted:                #F4F1EA;
    --muted-foreground:     #475569;
    --border:               rgba(16, 24, 32, 0.08);
    --input:                rgba(16, 24, 32, 0.08);
    --ring:                 #F26419;
    font-family: Aptos, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  }
  .id-theme [data-slot="button"] { border-radius: 9999px; }
  .id-theme [data-slot="badge"]  { border-radius: 9999px; }
  .id-theme [data-slot="card"] {
    border-radius: 1rem;
    box-shadow: inset 0 0 0 1px rgba(16, 24, 32, 0.08) !important;
  }
  .id-theme h1, .id-theme h2, .id-theme h3 {
    letter-spacing: -0.025em;
  }
`;

const JE_CTA_PRIMARY_DARK =
  "inline-flex items-center justify-center bg-accent text-white px-8 py-4 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)]";
const JE_CTA_GLASS_DARK =
  "inline-flex items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-white/10 transition";
const JE_EYEBROW_LIGHT =
  "bg-[#F8F7F4] border border-foreground/10 text-foreground/70 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";
const JE_EYEBROW_DARK =
  "bg-white/5 border border-white/10 text-white/85 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";

const evidenceIconMap = {
  reading: BookOpen,
  speaking: MessageSquare,
  writing: PenTool,
  reasoning: Compass,
} as const;

function InteractiveDemoHero() {
  return (
    <section
      className="relative overflow-hidden bg-primary text-primary-foreground"
      aria-labelledby="interactive-demo-hero-heading"
    >
      <div className="hidden lg:block absolute -right-20 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-muted/15 blur-3xl pointer-events-none" />
      <div className="container mx-auto max-w-5xl px-6 py-16 md:py-20 lg:py-24 relative">
        <div className="text-center">
          <Badge variant="outline" className={JE_EYEBROW_DARK}>
            <Users className="w-3 h-3 mr-1.5" />
            Interactive demo for parents and students
          </Badge>
          <h1
            id="interactive-demo-hero-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] mb-5 text-primary-foreground"
          >
            See how Jurassic English
            <span className="align-super text-base text-accent">™</span>{" "}
            grows student thinking from
            <span className="block text-accent font-serif font-light italic mt-2">
              Level 1 to Level 5.
            </span>
          </h1>
          <p className="text-lg md:text-xl font-light leading-relaxed text-primary-foreground/75 mb-8 max-w-2xl mx-auto">
            Preview how students move from first story claims to evidence-based
            interpretation, academic writing, and advanced argument.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-diagnostic" className={JE_CTA_PRIMARY_DARK}>
              Book a Student Thinking Diagnostic
            </Link>
            <Link href="/student-academy" className={JE_CTA_GLASS_DARK}>
              Back to Student Academy
            </Link>
          </div>
          <p className="mt-4 text-xs italic text-primary-foreground/55 max-w-xl mx-auto">
            We do not promise scores. The teacher always has the final word on
            placement and progress.
          </p>
        </div>
      </div>
    </section>
  );
}

function ParentEvidencePanel() {
  return (
    <section
      id="parent-evidence"
      aria-labelledby="parent-evidence-heading"
      className="py-16 md:py-20 px-6 bg-background"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            What parents can see
          </Badge>
          <h2
            id="parent-evidence-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-3 leading-[1.2]"
          >
            Visible learning evidence at every level.
          </h2>
          <p className="text-[15px] md:text-base font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Jurassic English<span className="align-super text-xs text-accent">™</span>{" "}
            does not ask parents to trust vague progress. Each level produces
            visible learning evidence: claim cards, evidence notes,
            interpretation paragraphs, CEIW writing, reflections, and portfolio
            artifacts.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {parentEvidenceItems.map((item) => {
            const Icon = evidenceIconMap[item.key];
            return (
              <Card
                key={item.key}
                className="bg-card border border-primary/10"
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex w-10 h-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-primary mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 max-w-3xl mx-auto rounded-2xl bg-[#F4F1EA] border border-primary/5 p-5 text-center">
          <p className="text-sm md:text-[15px] text-foreground/75 leading-relaxed">
            <ScrollText className="inline-block w-4 h-4 mr-1.5 align-text-bottom text-accent" />
            Portfolio evidence is reviewed and described by your child&rsquo;s
            teacher. Jurassic English<span className="align-super text-[10px] text-accent">™</span>{" "}
            does not replace teacher judgement — it makes student thinking
            easier to see.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalConversionSection() {
  return (
    <section
      aria-labelledby="interactive-demo-final-cta-heading"
      className="py-14 md:py-16 px-6 bg-primary text-primary-foreground"
    >
      <div className="container mx-auto max-w-3xl text-center">
        <Badge variant="outline" className={JE_EYEBROW_DARK}>
          Ready to take the next step?
        </Badge>
        <h2
          id="interactive-demo-final-cta-heading"
          className="text-3xl md:text-[2.25rem] font-bold leading-[1.2] mb-3"
        >
          Not sure where your child should begin?
        </h2>
        <p className="text-base md:text-lg font-light text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
          That is exactly what the Student Thinking Diagnostic is for. The demo
          shows the pathway; the diagnostic helps identify the right starting
          point for your child.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/book-diagnostic" className={JE_CTA_PRIMARY_DARK}>
            Book a Student Thinking Diagnostic
          </Link>
          <Link href="/student-academy" className={JE_CTA_GLASS_DARK}>
            Return to Student Academy
          </Link>
        </div>
        <p className="mt-4 text-xs italic text-primary-foreground/55">
          No pressure to enroll immediately. Start with a clear,
          parent-friendly next step.
        </p>
        <div className="mt-8 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-primary-foreground/55">
          <ArrowRight className="w-3 h-3" />
          {/* Visible-progress / portfolio-evidence claims-safety markers */}
          Visible progress · Portfolio evidence
        </div>
      </div>
    </section>
  );
}

export default function InteractiveDemoPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: interactiveDemoThemeCss }} />
      <JsonLd data={INTERACTIVE_DEMO_WEBPAGE_LD} id="ld-interactive-demo" />
      {/*
        Page bottom padding on mobile keeps page content from hiding behind
        the MobileStickyConvBar (which is fixed-position, lg:hidden).
      */}
      <div className="id-theme bg-background pb-20 lg:pb-0">
        <InteractiveDemoHero />
        <PathwayExplorer />
        <TryOneThinkingMove />
        <DiagnosticBridge />
        <ParentEvidencePanel />
        <FinalConversionSection />
      </div>
      <MobileStickyConvBar />
    </>
  );
}

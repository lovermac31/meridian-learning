import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen, Compass, Target } from "lucide-react";

// Phase 12 Task C — Diagnostic bridge.
//
// Purpose: a compact conversion bridge that sits BETWEEN the interactive
// PathwayExplorer and the ParentEvidencePanel. The page already gives a
// parent the "what" of the pathway; this block answers the "where do I
// start?" question explicitly and pushes them toward /book-diagnostic.
//
// Design: light parchment card, 2-column desktop / stacked mobile, three
// small proof points (what the diagnostic will look at) and a clear
// primary CTA. No claims-risk language. Server-rendered (no client state).

const JE_CTA_PRIMARY_LIGHT =
  "inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_15px_30px_-12px_rgba(242,100,25,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(242,100,25,0.4)]";
const JE_CTA_OUTLINE_LIGHT =
  "inline-flex items-center justify-center bg-white border border-primary/15 text-primary px-6 py-3 rounded-full text-sm font-bold hover:bg-primary/5 transition-colors";
const JE_EYEBROW_LIGHT =
  "bg-[#F8F7F4] border border-foreground/10 text-foreground/70 mb-3 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";

const proofPoints = [
  {
    icon: BookOpen,
    label: "Current English level",
  },
  {
    icon: Compass,
    label: "Reasoning and writing needs",
  },
  {
    icon: Target,
    label: "Recommended pathway level",
  },
] as const;

export function DiagnosticBridge() {
  return (
    <section
      aria-labelledby="diagnostic-bridge-heading"
      className="py-14 md:py-16 px-6 bg-background"
    >
      <div className="container mx-auto max-w-5xl">
        <Card className="bg-white border border-primary/10 overflow-hidden">
          <CardContent className="p-6 md:p-10">
            <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-10 items-center">
              {/* Left column — copy + CTAs */}
              <div>
                <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                  Bridge to your next step
                </Badge>
                <h2
                  id="diagnostic-bridge-heading"
                  className="text-2xl md:text-3xl font-bold text-primary leading-[1.2] mb-4"
                >
                  The demo shows the pathway. The diagnostic finds the starting
                  point.
                </h2>
                <p className="text-[15px] md:text-base text-foreground/75 leading-relaxed mb-6">
                  Every learner enters the pathway differently. The Student
                  Thinking Diagnostic helps us understand your child&rsquo;s
                  current reading, reasoning, speaking, and writing needs
                  before recommending a starting level.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/book-diagnostic"
                    className={JE_CTA_PRIMARY_LIGHT}
                  >
                    Book a Student Thinking Diagnostic
                  </Link>
                  <Link href="/student-academy" className={JE_CTA_OUTLINE_LIGHT}>
                    Back to Student Academy
                  </Link>
                </div>
              </div>

              {/* Right column — proof points */}
              <div className="rounded-2xl bg-[#F4F1EA] border border-primary/5 p-5 md:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/60 mb-4">
                  What the diagnostic looks at
                </p>
                <ul className="space-y-3">
                  {proofPoints.map((point) => {
                    const Icon = point.icon;
                    return (
                      <li
                        key={point.label}
                        className="flex items-start gap-3"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-primary/10 text-primary"
                        >
                          <Icon className="w-4 h-4" />
                        </span>
                        <span className="text-sm md:text-[15px] font-medium text-foreground/85 leading-snug">
                          {point.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-5 inline-flex items-center gap-1.5 text-[12px] text-foreground/55 italic">
                  <ArrowRight className="w-3 h-3" />
                  Reviewed by your child&rsquo;s teacher.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default DiagnosticBridge;

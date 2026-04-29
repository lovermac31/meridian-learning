import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EvidenceSafeClaimBox } from "@/components/shared-ui";
import {
  Search,
  Scale,
  Quote,
  RefreshCw,
  MessageSquare,
  BookOpen,
  PenTool,
  GraduationCap,
  Lightbulb,
  ScrollText,
  Compass,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Heart,
  Layers,
  Users,
  ArrowRight,
  Leaf,
  Target,
  Eye,
  Library,
} from "lucide-react";
import {
  academyPathways,
  ceiwMoves,
  claimsSafeCopy,
  diagnosticCaption,
  diagnosticMeasures,
  dreDoes,
  dreDoesNot,
  learnerSupports,
  portfolioEvidenceTypes,
  pricingReference,
  studentAcademyFAQs,
  studentFitFor,
  studentFitNotFor,
  studentLevels,
  studentOutcomes,
  studentProblems,
  threeBeats,
  thinkingCycleStages,
  type StudentOutcome,
  type ThinkingCycleStage,
  type ThreeBeat,
} from "@/lib/studentAcademyData";

// Image folder is namespaced as `student-academy-page` (not `student-academy`)
// because the production root Vite app already serves a different image at
// `/images/student-academy/student-academy-hero.webp` for its home-page
// mural. Renaming this folder avoids a path collision when the
// ecosystem-landing Student Academy page is mounted at
// jurassicenglish.com/student-academy via Vercel rewrites.
const STUDENT_ACADEMY_IMAGE_DIR = "/images/student-academy-page";

const thinkingCycleIconMap: Record<
  ThinkingCycleStage["iconKey"],
  typeof Search
> = {
  regulate: Heart,
  encounter: Eye,
  analyze: Search,
  evaluate: Scale,
  justify: Quote,
  reflect: RefreshCw,
  publish: Sparkles,
};

const threeBeatIconMap: Record<ThreeBeat["iconKey"], typeof Search> = {
  literature: Library,
  regulation: Heart,
  cycle: RefreshCw,
};

const outcomeIconMap: Record<StudentOutcome["iconKey"], typeof MessageSquare> = {
  speaking: MessageSquare,
  reading: BookOpen,
  vocabulary: GraduationCap,
  writing: PenTool,
  literature: ScrollText,
  reflection: Compass,
  portfolio: Layers,
  exam: Sparkles,
};

const learnerIconCycle = [BookOpen, MessageSquare, PenTool, Compass, Heart, Users];

// JE-aligned reusable CTA recipe class strings
const JE_CTA_PRIMARY_DARK =
  "inline-flex items-center justify-center bg-accent text-white px-8 py-4 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.6)]";
const JE_CTA_GLASS_DARK =
  "inline-flex items-center justify-center bg-white/5 border border-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full text-sm font-bold hover:bg-white/10 transition";
const JE_CTA_PRIMARY_LIGHT =
  "inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_15px_30px_-12px_rgba(242,100,25,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(242,100,25,0.4)]";
const JE_CTA_OUTLINE_LIGHT =
  "inline-flex items-center justify-center bg-white border border-[#F4F1EA] text-foreground px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#F8F7F4] transition";
const JE_CTA_LINK_ACCENT =
  "inline-flex items-center justify-center text-accent hover:text-accent/80 underline underline-offset-4 decoration-accent text-sm font-semibold py-1";

// JE-aligned eyebrow/badge recipes
const JE_EYEBROW_LIGHT =
  "bg-[#F8F7F4] border border-foreground/10 text-foreground/70 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";
const JE_EYEBROW_DARK =
  "bg-white/5 border border-white/10 text-white/85 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";

function HeroVisual() {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl border border-white/10"
      role="img"
      aria-label="Jurassic English Student Academy — premium literature-based learning visual"
    >
      <div className="aspect-[16/10] w-full relative">
        <Image
          src={`${STUDENT_ACADEMY_IMAGE_DIR}/student-academy-hero.webp`}
          alt="Six diverse students gathered around a literature table in a warm Jurassic English academy library, looking at a tablet showing a thinking-cycle visualization"
          fill
          priority
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
          unoptimized
        />
      </div>
    </div>
  );
}

export function StudentAcademyHero() {
  return (
    <section
      className="relative overflow-hidden bg-primary text-primary-foreground"
      aria-labelledby="student-academy-hero-heading"
    >
      <div className="hidden lg:block absolute -right-20 top-10 h-72 w-72 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-muted/15 blur-3xl pointer-events-none" />
      <div className="container mx-auto max-w-7xl px-6 py-20 lg:py-24 flex items-center relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
          <div>
            {/*
              Audience badge intentionally compact: rounded-full, tight px-3 py-1,
              small uppercase text. mb-4 keeps it close to the hero headline so
              the eye flows directly into "Reading. Reasoning. Writing." rather
              than reading the badge as a separate stand-alone block.
            */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-xs font-semibold uppercase tracking-[0.12em] text-white/85 mb-4">
              <Users className="w-3.5 h-3.5" />
              For Parents &amp; Students
            </div>
            <h1
              id="student-academy-hero-heading"
              className="text-5xl md:text-6xl font-bold leading-[1.05] mb-6 text-primary-foreground"
            >
              Reading. Reasoning. Writing.
              <span className="block text-accent font-serif font-light italic mt-2">
                With the books your child deserves.
              </span>
            </h1>
            <p className="text-xl font-light leading-relaxed text-primary-foreground/70 mb-8 max-w-xl">
              Jurassic English<span className="align-super text-xs text-accent">™</span>{" "}
              Student Academy is a five-level academic English program built
              around authentic literature, regulated thinking, and visible
              reasoning. Your child reads real stories, thinks aloud, writes
              with evidence, and grows through portfolio work that you can see.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/book-diagnostic" className={JE_CTA_PRIMARY_DARK}>
                Book a Student Thinking Diagnostic
              </Link>
              <Link
                href="/interactive-demo#try-one-thinking-move"
                className={JE_CTA_GLASS_DARK}
              >
                Try one thinking move
              </Link>
            </div>
            <p className="mt-3 text-sm italic text-primary-foreground/55">
              {diagnosticCaption}
            </p>
            <div className="mt-8 flex flex-wrap gap-2 text-xs">
              {[
                "Authentic literature first",
                "Regulation-before-reasoning",
                "Visible thinking",
                "Portfolio-tracked",
              ].map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm text-white/75 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="lg:pl-4">
            <HeroVisual />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Quick Start for Parents — conversion strip rendered directly under the
 * hero, before StudentProblemSection. The shortest possible "what next"
 * answer for a parent who just landed on the page: 3 numbered steps + 2
 * CTAs (primary = book diagnostic, secondary = open interactive demo).
 *
 * Design constraints:
 *   - Compact (parchment band, py-10 / py-12 not py-20)
 *   - Mobile-stacked, desktop-horizontal 3-column
 *   - Same Jurassic palette: parchment surface, deep-green primary text,
 *     muted-gold step numerals, jurassic-accent orange primary CTA
 *   - Premium education feel, not SaaS-onboarding
 */
export function QuickStartStripSection() {
  const steps = [
    { n: 1, label: "Try one thinking move (2 minutes)" },
    { n: 2, label: "Understand the five-level pathway" },
    { n: 3, label: "Book a Student Thinking Diagnostic" },
  ] as const;

  return (
    <section
      className="py-10 md:py-12 px-6 bg-[#F4F1EA] border-b border-primary/5"
      aria-labelledby="quick-start-strip-heading"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-6">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            For parents and students
          </Badge>
          <h2
            id="quick-start-strip-heading"
            className="text-2xl md:text-3xl font-bold text-primary leading-[1.2]"
          >
            Start with the clearest path.
          </h2>
        </div>

        {/* Steps — mobile stacked, desktop 3-column */}
        <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-7 max-w-4xl mx-auto">
          {steps.map((step) => (
            <li
              key={step.n}
              className="flex items-start gap-3 rounded-2xl bg-white/70 border border-primary/10 px-4 py-4"
            >
              <span
                aria-hidden="true"
                className="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#C5A059]/15 text-[#8a6f33] font-bold text-sm"
              >
                {step.n}
              </span>
              <span className="text-sm md:text-[15px] font-medium text-foreground/80 leading-snug">
                {step.label}
              </span>
            </li>
          ))}
        </ol>

        {/* CTA pair — Book Diagnostic primary, Interactive Demo secondary */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/book-diagnostic" className={JE_CTA_PRIMARY_LIGHT}>
            Book a Student Thinking Diagnostic
          </Link>
          <Link
            href="/interactive-demo#try-one-thinking-move"
            className="inline-flex items-center justify-center bg-white border border-primary/15 text-primary px-6 py-3 rounded-full text-sm font-bold hover:bg-primary/5 transition-colors"
          >
            Open the Interactive Demo
          </Link>
        </div>
      </div>
    </section>
  );
}

export function StudentProblemSection() {
  return (
    <section
      className="py-20 px-6 bg-background"
      aria-labelledby="student-problem-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            Why families come to us
          </Badge>
          <h2
            id="student-problem-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
          >
            Most English programs teach vocabulary and stop.
          </h2>
          <p className="text-lg font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Children sound fluent but cannot defend an idea, cite a source, or
            interpret what they read.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studentProblems.map((problem) => (
            <Card
              key={problem.title}
              className="bg-card hover:bg-card/80 transition-colors"
            >
              <CardContent className="p-7">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1 text-base">
                      {problem.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {problem.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ThreeBeatSolution() {
  return (
    <section
      className="py-20 px-6 bg-[#F8F7F4]"
      aria-labelledby="three-beats-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            The Three Beats
          </Badge>
          <h2
            id="three-beats-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
          >
            How Jurassic English<span className="align-super text-base text-accent">™</span>{" "}
            Works
          </h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Three principles that make academic reasoning land — every lesson,
            every level.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {threeBeats.map((beat, i) => {
            const Icon = threeBeatIconMap[beat.iconKey];
            return (
              <Card
                key={beat.title}
                className="bg-white hover:bg-white/90 transition-colors"
              >
                <CardContent className="p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-semibold text-accent uppercase tracking-[0.12em]">
                      Beat {i + 1}
                    </div>
                  </div>
                  <h3 className="font-bold text-foreground text-lg mb-2">
                    {beat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {beat.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function ThinkingCycleSection() {
  return (
    <section
      className="py-20 px-6 bg-background"
      aria-labelledby="thinking-cycle-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            Seven stages, every lesson
          </Badge>
          <h2
            id="thinking-cycle-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
          >
            How we help students think before they write
          </h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            A seven-stage routine &mdash; the Jurassic Thinking Cycle
            <span className="align-super text-xs text-accent">™</span>{" "}
            &mdash; that turns reading, speaking, and writing into a visible
            thinking process. Regulation first, then reasoning made visible.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {thinkingCycleStages.map((stage) => {
            const Icon = thinkingCycleIconMap[stage.iconKey];
            return (
              <div
                key={stage.name}
                className="rounded-2xl bg-card p-6 border border-foreground/8"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-accent/40 font-serif">
                    {stage.number}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-base mb-1">
                  {stage.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {stage.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function LevelPathwaySection() {
  return (
    <section
      id="pathway"
      className="py-20 px-6 bg-[#F8F7F4] scroll-mt-24"
      aria-labelledby="level-pathway-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            The Five-Level Pathway
          </Badge>
          <h2
            id="level-pathway-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
          >
            From First Stories to Academic Argument
          </h2>
          <p className="text-lg font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Every student enters at the right level, anchored to CEFR and CEIW
            depth. Placement is based on the diagnostic, not on age alone.
          </p>
        </div>

        <div className="hidden lg:block overflow-x-auto rounded-2xl border border-foreground/8 bg-white">
          <table className="w-full text-sm text-left">
            <thead className="bg-foreground text-background uppercase font-semibold text-xs tracking-[0.12em]">
              <tr>
                <th className="px-6 py-4">Level</th>
                <th className="px-6 py-4">Title</th>
                <th className="px-6 py-4">Cognitive Focus</th>
                <th className="px-6 py-4">CEFR Band</th>
                <th className="px-6 py-4">What Your Child Builds</th>
              </tr>
            </thead>
            <tbody>
              {studentLevels.map((row, i) => (
                <tr
                  key={row.id}
                  className={
                    i % 2 === 0
                      ? "bg-white border-b border-foreground/5 last:border-0"
                      : "bg-[#F8F7F4] border-b border-foreground/5 last:border-0"
                  }
                >
                  <td className="px-6 py-5 font-bold text-foreground whitespace-nowrap">
                    {row.level}
                  </td>
                  <td className="px-6 py-5 text-foreground font-semibold">
                    {row.title}
                  </td>
                  <td className="px-6 py-5 text-foreground/80 italic">
                    {row.focus}
                  </td>
                  <td className="px-6 py-5 text-muted-foreground whitespace-nowrap">
                    {row.cefr}
                  </td>
                  <td className="px-6 py-5">
                    <ul className="space-y-1 text-xs text-foreground/80">
                      {row.outcomes.map((o) => (
                        <li key={o} className="flex items-start gap-2">
                          <span className="mt-1 w-1 h-1 rounded-full bg-accent shrink-0" />
                          <span>{o}</span>
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="lg:hidden space-y-4">
          {studentLevels.map((row) => (
            <Card key={row.id} className="bg-white">
              <CardContent className="p-7">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-bold text-foreground text-lg">
                    {row.level}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {row.cefr}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground mb-1">
                  {row.title}
                </h3>
                <p className="italic text-sm text-foreground/80 mb-4">
                  {row.focus}
                </p>
                <ul className="space-y-1.5">
                  {row.outcomes.map((o) => (
                    <li
                      key={o}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/book-diagnostic" className={JE_CTA_PRIMARY_LIGHT}>
            Find My Student&rsquo;s Level
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Inline Interactive Demo CTA — placed between the Level Pathway / Thinking
 * Cycle structural sections and the CEIW writing-with-evidence detail.
 *
 * Purpose: surface a clear path to /interactive-demo from /student-academy.
 * The production-parity header (mirroring www.jurassicenglish.com) does not
 * include "Interactive Demo" as a top-level link, so this section is the
 * primary discoverability hook for that route on the SA page.
 *
 * Design: parchment panel with deep-green primary text and a jurassic-accent
 * orange CTA pill. Two-column on lg+, single-column on mobile.
 */
export function InteractiveDemoCTASection() {
  return (
    <section
      className="py-16 px-6 bg-[#F4F1EA]"
      aria-labelledby="interactive-demo-cta-heading"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="rounded-3xl border border-primary/10 bg-[#F8F7F4] px-6 py-8 sm:px-10 sm:py-10 shadow-[0_18px_45px_rgba(11,59,36,0.08)]">
          <div className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-8 lg:gap-10 items-center">
            {/* Left: headline + body */}
            <div>
              <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
                See it in action
              </Badge>
              <h2
                id="interactive-demo-cta-heading"
                className="text-2xl md:text-3xl font-bold text-primary leading-[1.2] mb-3"
              >
                Try one thinking move. See how your child would reason.
              </h2>
              <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-xl">
                On the Interactive Demo, you can read a short passage, choose a
                stronger claim, pick supporting evidence, and reveal one
                possible Jurassic English<span className="align-super text-xs text-accent">™</span>{" "}
                response &mdash; in about two minutes. Then book a diagnostic
                if you&rsquo;re ready.
              </p>
            </div>

            {/* Right: primary + secondary CTA pair (conversion bridge) */}
            <div className="flex flex-col items-start lg:items-end gap-3">
              <Link
                href="/interactive-demo#try-one-thinking-move"
                className={JE_CTA_PRIMARY_LIGHT}
              >
                Try one thinking move (2 minutes)
              </Link>
              <Link
                href="/book-diagnostic"
                className="inline-flex items-center justify-center bg-white border border-primary/15 text-primary px-6 py-3 rounded-full text-sm font-bold hover:bg-primary/5 transition-colors"
              >
                Book a Student Thinking Diagnostic
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CEIWSection() {
  return (
    <section
      className="py-20 px-6 bg-background"
      aria-labelledby="ceiw-heading"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-10">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            The visible architecture
          </Badge>
          <h2
            id="ceiw-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
          >
            What your child will be doing
          </h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Every response leaves evidence of thinking. CEIW &mdash; Claim,
            Evidence, Interpretation, Warrant &mdash; is the visible
            architecture your child learns to use. We teach it from Level 1 in
            age-appropriate forms. The architecture stays the same; the depth
            grows.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-foreground/8 bg-card">
          <table className="w-full text-sm text-left">
            <thead className="bg-foreground text-background uppercase font-semibold text-xs tracking-[0.12em]">
              <tr>
                <th className="px-6 py-4 w-24">Move</th>
                <th className="px-6 py-4">Plain statement</th>
              </tr>
            </thead>
            <tbody>
              {ceiwMoves.map((move, i) => (
                <tr
                  key={move.name}
                  className={
                    i % 2 === 0
                      ? "bg-card border-b border-foreground/5 last:border-0"
                      : "bg-white border-b border-foreground/5 last:border-0"
                  }
                >
                  <td className="px-6 py-5 align-top whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex w-9 h-9 rounded-lg bg-foreground text-background items-center justify-center font-bold">
                        {move.letter}
                      </span>
                      <span className="font-semibold text-foreground">
                        {move.name}
                      </span>
                    </div>
                    {move.isSenior && (
                      <span className="ml-12 mt-1 inline-block text-[10px] uppercase tracking-[0.12em] text-accent font-semibold">
                        Senior levels (4 &amp; 5)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5 text-foreground/85 align-top">
                    {move.plain}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 text-sm text-muted-foreground text-center max-w-2xl mx-auto">
          Impact appears at senior levels (4 and 5). Counter-warrants are added
          at Level 5 for exam-ready argument.
        </p>
      </div>
    </section>
  );
}

export function DRESection() {
  return (
    <section
      className="py-20 px-6 bg-primary text-primary-foreground relative overflow-hidden"
      aria-labelledby="dre-heading"
    >
      <div className="hidden lg:block absolute -right-32 top-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute -left-32 bottom-10 h-72 w-72 rounded-full bg-muted/10 blur-3xl pointer-events-none" />
      <div className="container mx-auto max-w-5xl relative">
        <div className="text-center mb-10 max-w-3xl mx-auto">
          <Badge variant="outline" className={JE_EYEBROW_DARK}>
            Teacher-led. Auditable. Quiet.
          </Badge>
          <h2
            id="dre-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-primary-foreground mb-4 leading-[1.2]"
          >
            What Is the Digital Reasoning Engine?
          </h2>
          <p className="text-lg font-light text-primary-foreground/70 leading-relaxed">
            The Digital Reasoning Engine (DRE) is a quiet tool that makes your
            child&rsquo;s thinking visible. It captures their work, organizes
            their portfolio, and helps us send you clear updates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-7">
            <div className="flex items-center gap-2 mb-5">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <h3 className="font-bold text-primary-foreground">
                The DRE does
              </h3>
            </div>
            <ul className="space-y-3">
              {dreDoes.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-primary-foreground/85"
                >
                  <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-7">
            <div className="flex items-center gap-2 mb-5">
              <XCircle className="w-5 h-5 text-primary-foreground/60" />
              <h3 className="font-bold text-primary-foreground">
                The DRE does not
              </h3>
            </div>
            <ul className="space-y-3">
              {dreDoesNot.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-primary-foreground/70"
                >
                  <XCircle className="w-4 h-4 text-primary-foreground/50 mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-10 text-center text-base font-semibold text-accent">
          The teacher always has the final word.
        </p>
      </div>
    </section>
  );
}

export function StudentOutcomesGrid() {
  return (
    <section
      className="py-20 px-6 bg-background"
      aria-labelledby="student-outcomes-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            What students build
          </Badge>
          <h2
            id="student-outcomes-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
          >
            Visible Growth Parents Can Understand
          </h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Students learn to explain their ideas, not just answer quickly.
            Growth shows up in real student work &mdash; speaking samples,
            CEIW writing, reflections, and Growth Portfolio artifacts parents
            can review.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {studentOutcomes.map((outcome) => {
            const Icon = outcomeIconMap[outcome.iconKey];
            return (
              <div
                key={outcome.label}
                className="group rounded-2xl bg-card p-7 border border-foreground/8 hover:border-accent/40 transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-foreground/5 text-foreground flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-foreground mb-1.5">
                  {outcome.label}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {outcome.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function BuiltForEveryLearnerSection() {
  return (
    <section
      className="py-20 px-6 bg-[#F8F7F4]"
      aria-labelledby="every-learner-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          <div className="lg:col-span-2 lg:sticky lg:top-24">
            <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
              Inclusive by design
            </Badge>
            <h2
              id="every-learner-heading"
              className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
            >
              Built for Every Learner
            </h2>
            <p className="text-xl font-light text-foreground/85 leading-relaxed mb-4">
              We diversify the route, not the academic demand.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Jurassic English<span className="align-super text-[10px]">™</span>{" "}
              gives students structured ways to read, speak, write, and show
              their thinking while keeping expectations high. Learners may need
              different routes into the work, but every student is still
              guided toward serious academic English.
            </p>
            <div
              className="relative mt-8 aspect-[16/10] w-full rounded-2xl overflow-hidden border border-foreground/8"
              role="img"
              aria-label="Students reading, writing, and discussing ideas in a supportive academic English learning environment"
            >
              <Image
                src={`${STUDENT_ACADEMY_IMAGE_DIR}/built-for-every-learner.webp`}
                alt="Students reading, writing, and discussing ideas in a supportive academic English learning environment"
                fill
                sizes="(min-width: 1024px) 400px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>
          <div className="lg:col-span-3 grid sm:grid-cols-2 gap-4">
            {learnerSupports.map((support, i) => {
              const Icon = learnerIconCycle[i % learnerIconCycle.length];
              return (
                <Card
                  key={support.title}
                  className="bg-white"
                >
                  <CardContent className="p-6">
                    <div className="w-9 h-9 rounded-lg bg-foreground/5 text-foreground flex items-center justify-center mb-3">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h3 className="font-semibold text-foreground text-sm mb-1.5">
                      {support.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {support.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function DiagnosticCTASection() {
  return (
    <section
      className="py-20 px-6 bg-primary text-primary-foreground relative overflow-hidden"
      aria-labelledby="diagnostic-heading"
    >
      <div className="hidden lg:block absolute -right-32 top-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute -left-32 bottom-10 h-72 w-72 rounded-full bg-muted/15 blur-3xl pointer-events-none" />
      <div className="container mx-auto max-w-5xl relative">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <Badge variant="outline" className={JE_EYEBROW_DARK}>
            Where families start
          </Badge>
          <h2
            id="diagnostic-heading"
            className="text-3xl md:text-[2.25rem] font-bold mb-4 leading-[1.2]"
          >
            Start with a Student Thinking Diagnostic
          </h2>
          <p className="text-lg font-light text-primary-foreground/70 leading-relaxed">
            The diagnostic is a placement conversation, not a test. It helps
            identify how the student currently reads, speaks, writes, justifies
            ideas, and reflects in English — and recommends a Level 1–5
            placement. There is no fail.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-12">
          {diagnosticMeasures.map((m) => (
            <div
              key={m.title}
              className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md p-5"
            >
              <div className="flex items-start gap-3">
                <Target className="w-4 h-4 text-accent mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold text-primary-foreground mb-1 text-sm">
                    {m.title}
                  </h3>
                  <p className="text-xs text-primary-foreground/70 leading-relaxed">
                    {m.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/book-diagnostic" className={JE_CTA_PRIMARY_DARK}>
            Book a Student Thinking Diagnostic
          </Link>
          <Link href="#diagnostic-detail" className={JE_CTA_GLASS_DARK}>
            See How Progress Is Tracked
          </Link>
        </div>
        <p className="mt-4 text-center text-sm italic text-primary-foreground/55">
          {diagnosticCaption}
        </p>

        <p className="mt-10 max-w-2xl mx-auto text-center text-xs text-primary-foreground/65 leading-relaxed">
          {pricingReference}
        </p>
      </div>
    </section>
  );
}

export function PortfolioEvidenceSection() {
  return (
    <section
      id="diagnostic-detail"
      className="py-20 px-6 bg-background scroll-mt-24"
      aria-labelledby="portfolio-evidence-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="grid lg:grid-cols-5 gap-10 items-start">
          <div className="lg:col-span-2">
            <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
              Growth Portfolio
            </Badge>
            <h2
              id="portfolio-evidence-heading"
              className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
            >
              Progress You Can See
            </h2>
            <p className="text-lg font-light text-muted-foreground leading-relaxed mb-8">
              Each Jurassic English<span className="align-super text-xs text-accent">™</span>{" "}
              student builds a Growth Portfolio over time — not a grade, but
              visible evidence of how their reasoning, writing, and academic
              English are developing.
            </p>
            <div
              className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden border border-foreground/8"
              role="img"
              aria-label="Growth Portfolio evidence"
            >
              <Image
                src={`${STUDENT_ACADEMY_IMAGE_DIR}/growth-portfolio-evidence.webp`}
                alt="A parent and student reviewing a Growth Portfolio of writing samples and reasoning artifacts together at a study desk"
                fill
                sizes="(min-width: 1024px) 400px, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
          </div>

          <div className="lg:col-span-3">
            <ul className="grid sm:grid-cols-2 gap-3">
              {portfolioEvidenceTypes.map((item) => (
                <li
                  key={item.title}
                  className="rounded-2xl bg-card p-6 border border-foreground/8"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded-lg bg-foreground/5 text-foreground flex items-center justify-center shrink-0">
                      <Lightbulb className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-sm mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <EvidenceSafeClaimBox
                approvedClaim={claimsSafeCopy.approvedClaim}
                unsupportedClaimToAvoid={claimsSafeCopy.unsupportedClaimToAvoid}
                evidenceType={claimsSafeCopy.evidenceTypes}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function StudentProgramPathways() {
  return (
    <section
      className="py-20 px-6 bg-[#F8F7F4]"
      aria-labelledby="program-pathways-heading"
    >
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            Placement after the diagnostic
          </Badge>
          <h2
            id="program-pathways-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
          >
            Recommended Pathways After Diagnostic
          </h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Placement comes from the Student Thinking Diagnostic, not from age.
            Academic Thinker and IELTS Reasoning Lab are sibling pathways for
            advanced learners — not Student Academy sub-products.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {academyPathways.map((p) => (
            <Card
              key={p.id}
              className="flex flex-col h-full bg-white"
            >
              <CardContent className="p-7 flex flex-col h-full">
                <div className="text-[11px] font-semibold text-accent mb-2 uppercase tracking-[0.12em]">
                  {p.audience}
                </div>
                <h3 className="font-bold text-foreground text-lg mb-3">
                  {p.name}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-grow">
                  {p.description}
                </p>
                <div className="space-y-2">
                  <Link href={p.ctaHref} className={`${JE_CTA_OUTLINE_LIGHT} w-full`}>
                    {p.ctaText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                  {p.secondaryCtaText && p.secondaryCtaHref ? (
                    <Link
                      href={p.secondaryCtaHref}
                      className={`${JE_CTA_LINK_ACCENT} w-full`}
                    >
                      {p.secondaryCtaText}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StudentFitBlock() {
  return (
    <section
      className="py-20 px-6 bg-background"
      aria-labelledby="student-fit-heading"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h2
            id="student-fit-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
          >
            Is the Student Academy the Right Fit?
          </h2>
          <p className="text-lg font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A clear picture of who this is for — and who it is not.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-card">
            <CardContent className="p-7">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-foreground" />
                <h3 className="font-bold text-foreground">This is for</h3>
              </div>
              <ul className="space-y-3">
                {studentFitFor.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-foreground/85"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-7">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-foreground/50" />
                <h3 className="font-bold text-foreground/70">This is not</h3>
              </div>
              <ul className="space-y-3">
                {studentFitNotFor.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-foreground/85"
                  >
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-foreground/40 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

/**
 * Final conversion reminder — placed directly before the FAQ.
 *
 * Purpose: catch the parent who has scrolled past every other CTA and
 * isn't sure where to start. One-line reassurance + single primary
 * action (book diagnostic). No secondary CTA on this one — keep the
 * decision binary.
 */
export function FinalConversionReminderSection() {
  return (
    <section
      className="py-14 px-6 bg-[#F4F1EA]"
      aria-labelledby="final-conversion-reminder-heading"
    >
      <div className="container mx-auto max-w-4xl">
        <div className="rounded-3xl bg-white border border-primary/10 px-6 py-8 sm:px-10 sm:py-10 text-center shadow-[0_18px_45px_rgba(11,59,36,0.06)]">
          <h2
            id="final-conversion-reminder-heading"
            className="text-2xl md:text-3xl font-bold text-primary leading-[1.2] mb-3"
          >
            Not sure where your child should begin?
          </h2>
          <p className="text-base md:text-lg text-foreground/75 leading-relaxed max-w-2xl mx-auto mb-7">
            The Student Thinking Diagnostic helps identify the right starting
            level before a student joins the pathway.
          </p>
          <Link
            href="/book-diagnostic"
            className={JE_CTA_PRIMARY_LIGHT}
          >
            Book a Student Thinking Diagnostic
          </Link>
        </div>
      </div>
    </section>
  );
}

export function StudentAcademyFAQ() {
  return (
    <section
      className="py-20 px-6 bg-[#F8F7F4]"
      aria-labelledby="student-faq-heading"
    >
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <h2
            id="student-faq-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-foreground mb-4 leading-[1.2]"
          >
            Parent &amp; Student Questions
          </h2>
          <p className="text-lg font-light text-muted-foreground leading-relaxed">
            Clear answers about the Jurassic English<span className="align-super text-xs text-accent">™</span>{" "}
            Student Academy.
          </p>
        </div>
        <Accordion className="rounded-2xl bg-white border border-foreground/8 px-6">
          {studentAcademyFAQs.map((faq, i) => (
            <AccordionItem key={i} value={`student-faq-${i}`}>
              <AccordionTrigger className="text-left font-semibold text-foreground py-5 text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function StudentFinalCTA() {
  return (
    <section
      className="relative py-24 md:py-32 px-6 bg-secondary text-secondary-foreground overflow-hidden"
      aria-labelledby="student-final-cta-heading"
    >
      <div className="absolute inset-0 pointer-events-none opacity-15">
        <Image
          src={`${STUDENT_ACADEMY_IMAGE_DIR}/student-academy-final-cta.webp`}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
          unoptimized
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #101820 0%, #101820 60%, #101820 100%)",
          }}
        />
      </div>
      <div className="hidden lg:block absolute -right-32 top-20 h-80 w-80 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute -left-32 bottom-10 h-72 w-72 rounded-full bg-muted/10 blur-3xl pointer-events-none" />
      <div className="container mx-auto max-w-3xl relative text-center">
        <Leaf className="w-8 h-8 text-accent mx-auto mb-6" />
        <h2
          id="student-final-cta-heading"
          className="text-3xl md:text-5xl font-bold mb-6 leading-[1.1]"
        >
          Is Your Child Learning English — or Learning to{" "}
          <span className="text-accent font-serif italic font-light">
            Think
          </span>{" "}
          in English?
        </h2>
        <p className="text-lg font-light text-secondary-foreground/85 mb-10 leading-relaxed">
          Start with a diagnostic and receive a recommended Jurassic English
          <span className="align-super text-base text-accent">™</span> pathway.
          No score guarantees — just a clear, evidence-led plan for your
          student.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/book-diagnostic" className={JE_CTA_PRIMARY_DARK}>
            Book a Student Thinking Diagnostic
          </Link>
          <Link href="/" className={JE_CTA_GLASS_DARK}>
            View the Full Ecosystem
          </Link>
        </div>
        <p className="mt-4 text-sm italic text-secondary-foreground/55">
          {diagnosticCaption}
        </p>
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { track } from "@vercel/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  Layers,
  MousePointerClick,
  PenTool,
  Quote,
  ScrollText,
  Sparkles,
  Target,
} from "lucide-react";
import { demoLevels, type DemoLevel } from "@/lib/interactiveDemoLevels";

// Reusable CTA recipe — matches the SA page's JE_CTA_PRIMARY_LIGHT and
// JE_EYEBROW_LIGHT for visual continuity across /student-academy and
// /interactive-demo. (Kept inline here so this file remains
// self-contained as a client component.)
const JE_CTA_PRIMARY_LIGHT =
  "inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_15px_30px_-12px_rgba(242,100,25,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(242,100,25,0.4)]";
const JE_EYEBROW_LIGHT =
  "bg-[#F8F7F4] border border-foreground/10 text-foreground/70 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";

type FieldRow = {
  icon: typeof BookOpen;
  label: string;
  body: string;
};

function buildFieldRows(level: DemoLevel): FieldRow[] {
  return [
    { icon: BookOpen, label: "Student task", body: level.studentTask },
    { icon: Compass, label: "Thinking move", body: level.thinkingMove },
    { icon: PenTool, label: "CEIW scaffold", body: level.ceiwScaffold },
    { icon: ScrollText, label: "Portfolio evidence", body: level.portfolio },
  ];
}

// Phase 13 — small numbered "1 → 2 → 3 → 4 → 5" progress strip. Visual
// only; the actual interactive control is `LevelCards` below. Past steps
// fill deep-green, current step fills accent-orange, future steps stay
// neutral. The strip gives the parent a "where am I in the journey?"
// glance at any moment.
function ProgressStrip({ active }: { active: number }) {
  return (
    <div
      role="presentation"
      aria-hidden="true"
      className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3"
    >
      {demoLevels.map((lvl, i) => {
        const isCurrent = lvl.number === active;
        const isPast = lvl.number < active;
        return (
          <div
            key={lvl.number}
            className="flex items-center gap-1 sm:gap-1.5"
          >
            <span
              className={
                "inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border text-[11px] sm:text-xs font-bold transition-colors " +
                (isCurrent
                  ? "bg-accent text-white border-accent shadow-[0_6px_16px_-6px_rgba(242,100,25,0.6)]"
                  : isPast
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-white text-foreground/65 border-primary/15")
              }
            >
              {lvl.number}
            </span>
            {i < demoLevels.length - 1 ? (
              <ChevronRight
                className={
                  "w-3.5 h-3.5 transition-colors " +
                  (isPast ? "text-primary/60" : "text-foreground/25")
                }
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

// Phase 13 — Currently-previewing chip. Live status indicator that
// changes as the user clicks levels.
function CurrentlyPreviewing({ level }: { level: DemoLevel }) {
  return (
    <p
      role="status"
      aria-live="polite"
      className="mt-1 mb-7 text-center text-sm md:text-[15px] text-foreground/70"
    >
      Currently previewing:{" "}
      <span className="font-bold text-primary">
        Level {level.number} — {level.shortTitle}
      </span>
    </p>
  );
}

// Phase 13 — Big card-style level selector. Each card is a full <button>
// with cursor-pointer, hover lift, focus-visible ring, and active state
// that fills with deep-green + scales up so it is unambiguous which
// level is currently showing. On mobile the cards stack into a 2-column
// grid; lg+ they line up in a 5-column row.
//
// Sprint 3A — full ARIA tablist keyboard navigation:
//   ArrowRight → next level (clamped at L5, no wrap)
//   ArrowLeft  → previous level (clamped at L1, no wrap)
//   Home       → Level 1
//   End        → Level 5
// Selecting via keyboard also moves focus to the newly active tab so
// screen-reader users hear the new tab announce. Non-wrapping behavior
// matches the existing Prev/Next button pattern (Phase 13).
function LevelCards({
  active,
  onSelect,
  tabRefs,
}: {
  active: number;
  onSelect: (n: number) => void;
  tabRefs: React.MutableRefObject<Array<HTMLButtonElement | null>>;
}) {
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    currentIdx: number,
  ) => {
    let nextIdx: number | null = null;
    switch (e.key) {
      case "ArrowRight":
        nextIdx = Math.min(currentIdx + 1, demoLevels.length - 1);
        break;
      case "ArrowLeft":
        nextIdx = Math.max(currentIdx - 1, 0);
        break;
      case "Home":
        nextIdx = 0;
        break;
      case "End":
        nextIdx = demoLevels.length - 1;
        break;
      default:
        return;
    }
    if (nextIdx === null || nextIdx === currentIdx) return;
    e.preventDefault();
    const targetLevel = demoLevels[nextIdx].number;
    onSelect(targetLevel);
    // Focus the newly-selected tab on the next paint so the focus move
    // happens after React has rendered the state change. requestAnimation
    // Frame keeps the move synchronous-feeling for screen readers.
    requestAnimationFrame(() => {
      tabRefs.current[nextIdx!]?.focus();
    });
  };

  return (
    <div
      role="tablist"
      aria-label="Select a Student Academy level"
      aria-orientation="horizontal"
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3"
    >
      {demoLevels.map((lvl, idx) => {
        const isActive = lvl.number === active;
        return (
          <button
            key={lvl.number}
            ref={(el) => {
              tabRefs.current[idx] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`level-panel-${lvl.number}`}
            id={`level-tab-${lvl.number}`}
            // Roving tabindex — only the active tab is in the document tab
            // sequence. Inactive tabs are reachable via arrow keys once the
            // tablist has focus.
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(lvl.number)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={
              "group relative text-left rounded-2xl border p-4 md:p-5 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F1EA] " +
              (isActive
                ? "bg-primary text-primary-foreground border-primary shadow-[0_24px_48px_-16px_rgba(16,24,32,0.45)] scale-[1.02]"
                : "bg-white text-primary border-primary/10 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-14px_rgba(16,24,32,0.25)] hover:border-primary/30")
            }
          >
            {/* Big level numeral */}
            <div
              aria-hidden="true"
              className={
                "inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-bold mb-3 transition-colors " +
                (isActive
                  ? "bg-accent text-white"
                  : "bg-[#C5A059]/15 text-[#8a6f33] group-hover:bg-accent/15 group-hover:text-accent")
              }
            >
              {lvl.number}
            </div>

            <p
              className={
                "text-[10.5px] font-semibold uppercase tracking-[0.14em] mb-1 " +
                (isActive ? "text-accent" : "text-foreground/55")
              }
            >
              Level {lvl.number}
            </p>
            <p
              className={
                "text-sm md:text-[15px] font-bold leading-snug " +
                (isActive ? "text-primary-foreground" : "text-primary")
              }
            >
              {lvl.shortTitle}
            </p>

            {/* Click affordance / "now showing" marker */}
            {isActive ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-accent">
                <Sparkles className="w-3 h-3" />
                Now showing
              </p>
            ) : (
              <p className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-foreground/45 group-hover:text-accent transition-colors">
                <MousePointerClick className="w-3 h-3" />
                Click to preview
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}

// Phase 13 — Previous / Next level buttons. Disabled at boundaries.
// Show the destination level's short title as a soft preview so parents
// know what's coming next. Sits between LevelPanel and TryTheThinkingMove.
function PrevNextNav({
  active,
  onSelect,
}: {
  active: number;
  onSelect: (n: number) => void;
}) {
  const prev = demoLevels.find((l) => l.number === active - 1);
  const next = demoLevels.find((l) => l.number === active + 1);

  const baseBtn =
    "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F1EA]";
  const enabled =
    "bg-white border-primary/15 text-primary hover:bg-primary/5 cursor-pointer";
  const disabled =
    "bg-white/60 border-primary/10 text-foreground/35 cursor-not-allowed";

  return (
    <nav
      aria-label="Move between levels"
      className="flex items-center justify-between gap-3 flex-wrap"
    >
      <button
        type="button"
        onClick={() => prev && onSelect(prev.number)}
        disabled={!prev}
        // Sprint 3C — aria-label removed. The visible text spans
        // ("Previous level" + level title) compute the accessible name
        // automatically and satisfy WCAG 2.5.3 "Label in Name" without
        // any colon-separator mismatch. The `disabled` attribute
        // communicates the boundary state to assistive tech.
        className={baseBtn + " " + (prev ? enabled : disabled)}
      >
        <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
        <span className="flex flex-col items-start leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
            Previous level
          </span>
          <span className="text-[13px]">
            {prev ? `Level ${prev.number} — ${prev.shortTitle}` : "—"}
          </span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => next && onSelect(next.number)}
        disabled={!next}
        // Sprint 3C — aria-label removed (see Previous-button comment).
        className={baseBtn + " " + (next ? enabled : disabled)}
      >
        <span className="flex flex-col items-end leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">
            Next level
          </span>
          <span className="text-[13px]">
            {next ? `Level ${next.number} — ${next.shortTitle}` : "—"}
          </span>
        </span>
        <ArrowRight className="w-3.5 h-3.5 shrink-0" />
      </button>
    </nav>
  );
}

function LevelPanel({ level }: { level: DemoLevel }) {
  const rows = buildFieldRows(level);

  return (
    <div
      role="tabpanel"
      id={`level-panel-${level.number}`}
      aria-labelledby={`level-tab-${level.number}`}
      className="space-y-6"
    >
      {/* Header strip — level number + title + CEFR band */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-1">
            Level {level.number}
          </p>
          <h3 className="text-2xl md:text-3xl font-bold text-primary leading-tight">
            {level.shortTitle}
          </h3>
        </div>
        <span className="inline-flex items-center self-start sm:self-end rounded-full bg-[#F4F1EA] border border-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary/70">
          CEFR {level.cefrBand}
        </span>
      </div>

      {/* A — Parent-friendly promise: featured, full-width */}
      <Card className="bg-white border border-primary/10">
        <CardContent className="p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0 w-9 h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/60 mb-1">
                Parent-friendly promise
              </p>
              <p className="text-base md:text-[17px] font-medium text-primary leading-snug">
                {level.promise}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* B-E — Four supporting fields, 2-column grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <Card
              key={row.label}
              className="bg-white border border-primary/10"
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/60 mb-1">
                      {row.label}
                    </p>
                    <p className="text-sm md:text-[15px] text-foreground/85 leading-relaxed whitespace-pre-line">
                      {row.body}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* F — Best next step with inline Book Diagnostic CTA */}
      <Card className="bg-primary text-primary-foreground border-0">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3 max-w-2xl">
              <div className="mt-0.5 shrink-0 w-8 h-8 rounded-lg bg-accent/20 text-accent flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground/70 mb-1">
                  Best next step
                </p>
                <p className="text-sm md:text-[15px] text-primary-foreground/90 leading-relaxed">
                  {level.bestNextStep}
                </p>
              </div>
            </div>
            <Link
              href="/book-diagnostic"
              className={JE_CTA_PRIMARY_LIGHT + " shrink-0 self-start md:self-auto"}
            >
              Book a Diagnostic
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ScaffoldVisual({ scaffold }: { scaffold: string }) {
  // Visual-only render of the CEIW scaffold. We DO NOT collect input here —
  // this is just a representation of the structure that the student sees.
  // For multi-line scaffolds (e.g. "Claim: ___\nEvidence: ___") we render
  // each line as its own faint dashed-bordered placeholder strip. For
  // single-line scaffolds with "___" placeholders we render inline blanks.

  const lines = scaffold.split("\n").map((l) => l.trim()).filter(Boolean);

  if (lines.length > 1) {
    return (
      <div className="space-y-2">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className="rounded-lg border border-dashed border-primary/20 bg-[#FCFBF8] px-3 py-2.5 font-mono text-[13px] text-foreground/75"
          >
            {line.split("___").map((part, i, arr) => (
              <span key={i}>
                {part}
                {i < arr.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="inline-block align-middle min-w-[3.5rem] h-[1.1em] mx-0.5 rounded-sm bg-[#C5A059]/20 border border-[#C5A059]/40"
                  />
                ) : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Single line: render the scaffold label as a calmer display row, with
  // ___ placeholders if any.
  const single = lines[0] ?? scaffold;
  if (single.includes("___")) {
    return (
      <div className="rounded-lg border border-dashed border-primary/20 bg-[#FCFBF8] px-3 py-3 font-mono text-[13px] text-foreground/75">
        {single.split("___").map((part, i, arr) => (
          <span key={i}>
            {part}
            {i < arr.length - 1 ? (
              <span
                aria-hidden="true"
                className="inline-block align-middle min-w-[3.5rem] h-[1.1em] mx-0.5 rounded-sm bg-[#C5A059]/20 border border-[#C5A059]/40"
              />
            ) : null}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-primary/20 bg-[#FCFBF8] px-3 py-3 font-mono text-[13px] text-foreground/75">
      {single}
    </div>
  );
}

// Phase 13 — Try the Thinking Move with reveal interaction. The sample
// response is hidden by default behind a "Show sample response" button.
// Clicking the button reveals the sample with a fade. Switching levels
// re-hides the sample so each new level invites the same interaction.
function TryTheThinkingMove({
  level,
  revealed,
  onReveal,
  onHide,
}: {
  level: DemoLevel;
  revealed: boolean;
  onReveal: () => void;
  onHide: () => void;
}) {
  return (
    <Card className="bg-card border border-primary/10">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/10 text-accent">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/65">
            Try the thinking move
          </p>
        </div>

        <h4 className="text-lg md:text-xl font-bold text-primary leading-snug mb-5">
          A short look at how a Level {level.number} student would think.
        </h4>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Demo prompt */}
          <div className="rounded-xl bg-white border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-3.5 h-3.5 text-primary/70" />
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-foreground/60">
                Demo prompt
              </p>
            </div>
            <p className="text-sm text-foreground/85 leading-relaxed italic">
              {level.tryPrompt}
            </p>
          </div>

          {/* Student scaffold */}
          <div className="rounded-xl bg-white border border-primary/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-3.5 h-3.5 text-primary/70" />
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-foreground/60">
                Student scaffold
              </p>
            </div>
            <ScaffoldVisual scaffold={level.tryScaffold} />
          </div>

          {/* Sample response — hidden by default, reveal on click */}
          <div className="rounded-xl bg-white border border-primary/10 p-4 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Quote className="w-3.5 h-3.5 text-primary/70" />
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-foreground/60">
                Sample response
              </p>
            </div>

            {revealed ? (
              <div className="flex-1 flex flex-col">
                <p
                  className="text-sm text-foreground/85 leading-relaxed animate-in fade-in duration-300"
                  aria-live="polite"
                >
                  {level.trySample}
                </p>
                <button
                  type="button"
                  onClick={onHide}
                  className="mt-3 inline-flex items-center gap-1.5 self-start text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/55 hover:text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  <EyeOff className="w-3 h-3" />
                  Hide sample
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onReveal}
                aria-expanded="false"
                aria-controls={`sample-response-${level.number}`}
                className="flex-1 flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/25 bg-[#FCFBF8] py-5 px-3 text-center cursor-pointer hover:bg-white hover:border-accent/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group"
              >
                <Eye className="w-5 h-5 text-accent mb-2" />
                <span className="text-[13px] font-bold text-primary group-hover:text-accent transition-colors">
                  Show sample response
                </span>
                <span className="text-[11px] text-foreground/55 mt-1">
                  Click to reveal
                </span>
              </button>
            )}
          </div>
        </div>

        <p className="mt-5 text-[12.5px] text-foreground/55 leading-relaxed">
          This is a visual preview only. Nothing is collected, stored, or
          submitted. The teacher always has the final word on a student&rsquo;s
          actual placement and progress.
        </p>
      </CardContent>
    </Card>
  );
}

export function PathwayExplorer() {
  // Default to Level 3 — middle of the pathway, clearest starting frame
  // for a parent landing on the page for the first time.
  const [active, setActive] = useState<number>(3);
  const [revealed, setRevealed] = useState<boolean>(false);
  const level = demoLevels.find((l) => l.number === active) ?? demoLevels[2];

  // Sprint 3A — refs for ARIA tablist keyboard navigation. LevelCards uses
  // these to focus the newly-selected tab after Arrow / Home / End keys
  // change the active level.
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // Switching levels re-hides the sample so each new level keeps the
  // "click to reveal" invitation — that's the core interactivity beat.
  const handleSelectLevel = (n: number) => {
    if (n !== active) {
      // Sprint 3C — engagement telemetry. Public-safe properties only:
      // level number + public short title (already shown on the page).
      const lvl = demoLevels.find((l) => l.number === n);
      track("interactive_demo_level_changed", {
        level: n,
        title: lvl?.shortTitle ?? "",
      });
    }
    setActive(n);
    setRevealed(false);
  };

  // Sprint 3C — track when a parent reveals the sample response on the
  // active level. Captures actual engagement with the Try-the-Move
  // interaction beat that Phase 13 introduced.
  const handleReveal = () => {
    track("interactive_demo_sample_revealed", { level: active });
    setRevealed(true);
  };

  return (
    <section
      id="pathway-explorer"
      aria-labelledby="pathway-explorer-heading"
      className="py-16 md:py-20 px-6 bg-[#F4F1EA] border-y border-primary/5"
    >
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-6">
          <Badge variant="outline" className={JE_EYEBROW_LIGHT}>
            Interactive pathway explorer
          </Badge>
          <h2
            id="pathway-explorer-heading"
            className="text-3xl md:text-[2.25rem] font-bold text-primary leading-[1.2] mb-3"
          >
            Choose a level to preview the learning experience.
          </h2>
          <p className="text-[15px] md:text-base font-light text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Click a level below to see how the Student Academy grows thinking
            step by step. Each level keeps the same Jurassic Thinking Cycle™
            and CEIW architecture, then deepens what the student is asked to do.
          </p>
        </div>

        {/* Phase 13 — visual progress strip + live status indicator */}
        <ProgressStrip active={active} />
        <CurrentlyPreviewing level={level} />

        {/* Phase 13 — large interactive level cards */}
        <div className="mb-8">
          <LevelCards
            active={active}
            onSelect={handleSelectLevel}
            tabRefs={tabRefs}
          />
        </div>

        <div className="space-y-8">
          <LevelPanel level={level} />

          {/* Phase 13 — Previous / Next level navigation */}
          <PrevNextNav active={active} onSelect={handleSelectLevel} />

          <TryTheThinkingMove
            level={level}
            revealed={revealed}
            onReveal={handleReveal}
            onHide={() => setRevealed(false)}
          />
        </div>

        {/* Inline helper note pointing to the parent-evidence section */}
        <div className="mt-10 text-center">
          <Link
            href="#parent-evidence"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-accent transition-colors"
          >
            See what parents can actually look at
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default PathwayExplorer;

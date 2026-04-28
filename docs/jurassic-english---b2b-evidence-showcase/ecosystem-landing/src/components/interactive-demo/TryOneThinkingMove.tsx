"use client";

// Phase 4 — "Try one thinking move" parent-facing playable micro-demo.
//
// Goals:
//   - Frontend-only. No API. No Supabase. No localStorage.
//   - Multi-step: read passage → choose claim → choose evidence →
//     reveal one possible CEIW response.
//   - No scoring. No correct/incorrect. No timer. No AI-tutor framing.
//   - Premium academic style — deep card, parchment panels, muted-gold
//     step markers, orange CTA. Smooth minimal transitions.
//   - Fully keyboard accessible: native radiogroup semantics via
//     <fieldset>+<legend>+<input type="radio">.
//   - Respects prefers-reduced-motion.
//
// Content note: the mini passage and choices below are original,
// public-domain-style invented text — not real exam material and not
// curriculum-internal text. Same convention used in
// src/lib/interactiveDemoLevels.ts.

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { track } from "@vercel/analytics";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Eye,
  Quote,
  Sparkles,
} from "lucide-react";

// Reusable token recipes — kept inline so this client component is
// self-contained, matching the pattern used by PathwayExplorer.tsx.
const JE_EYEBROW_LIGHT =
  "bg-[#F8F7F4] border border-foreground/10 text-foreground/70 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]";
const JE_CTA_PRIMARY_LIGHT =
  "inline-flex items-center justify-center bg-accent text-white px-6 py-3 rounded-full text-sm font-bold transition-all duration-500 shadow-[0_15px_30px_-12px_rgba(242,100,25,0.3)] hover:shadow-[0_20px_40px_-12px_rgba(242,100,25,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

// ---------------------------------------------------------------------------
// Content: the micro-demo passage and choices.
// ---------------------------------------------------------------------------
const PASSAGE_TEXT =
  "During the long winter, a village librarian quietly carries books home each night and returns them at dawn. She tells no one why. When the snows finally melt, the library shelves are empty for a single morning — but every book is back by lunchtime, dry, intact, and arranged exactly as before.";

type ClaimChoice = {
  id: "claim-a" | "claim-b";
  label: string;
  hint: string;
};

const CLAIM_CHOICES: ClaimChoice[] = [
  {
    id: "claim-a",
    label: "The librarian is careful with her work.",
    hint: "A description of behaviour you can observe directly.",
  },
  {
    id: "claim-b",
    label: "The librarian is protecting the books from a quiet danger.",
    hint: "An interpretation of why she might be doing it.",
  },
];

type EvidenceChoice = {
  id: "evidence-1" | "evidence-2" | "evidence-3";
  label: string;
};

const EVIDENCE_CHOICES: EvidenceChoice[] = [
  {
    id: "evidence-1",
    label: "She tells no one why.",
  },
  {
    id: "evidence-2",
    label:
      "Every book is back by lunchtime, dry, intact, and arranged exactly as before.",
  },
  {
    id: "evidence-3",
    label:
      "She quietly carries books home each night and returns them at dawn.",
  },
];

// ---------------------------------------------------------------------------
// Step marker — small muted-gold pill that lights up as the parent moves
// through the four steps. Visual only; the actual control is the radios
// and the reveal button.
// ---------------------------------------------------------------------------
function StepMarkers({ active }: { active: 1 | 2 | 3 | 4 }) {
  const labels: Array<{ n: 1 | 2 | 3 | 4; text: string }> = [
    { n: 1, text: "Read" },
    { n: 2, text: "Claim" },
    { n: 3, text: "Evidence" },
    { n: 4, text: "Reveal" },
  ];
  return (
    <ol
      role="presentation"
      aria-hidden="true"
      className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6"
    >
      {labels.map((s, i) => {
        const reached = active >= s.n;
        return (
          <li key={s.n} className="flex items-center gap-2 sm:gap-3">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-300 ${
                reached
                  ? "bg-[#C9A86A]/15 text-[#8C7339] border border-[#C9A86A]/30"
                  : "bg-foreground/[0.04] text-foreground/40 border border-foreground/10"
              }`}
            >
              <span
                className={`inline-flex w-4 h-4 items-center justify-center rounded-full text-[10px] font-bold ${
                  reached
                    ? "bg-[#C9A86A] text-white"
                    : "bg-foreground/10 text-foreground/40"
                }`}
              >
                {s.n}
              </span>
              {s.text}
            </span>
            {i < labels.length - 1 ? (
              <span
                className={`h-px w-3 sm:w-5 ${
                  active > s.n ? "bg-[#C9A86A]/50" : "bg-foreground/15"
                }`}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// Choice card — wraps a native <input type="radio"> + <label>. Native
// semantics give us free arrow-key navigation, focus management, and
// SR announcements. We only style the visual chrome.
// ---------------------------------------------------------------------------
function ChoiceCard({
  name,
  value,
  checked,
  onChange,
  primaryText,
  secondaryText,
}: {
  name: string;
  value: string;
  checked: boolean;
  onChange: (v: string) => void;
  primaryText: string;
  secondaryText?: string;
}) {
  const inputId = `${name}-${value}`;
  return (
    <label
      htmlFor={inputId}
      className={`group relative block cursor-pointer rounded-xl border p-4 transition-colors duration-200 ${
        checked
          ? "border-accent/60 bg-accent/[0.04]"
          : "border-foreground/10 bg-white hover:border-foreground/25 hover:bg-foreground/[0.02]"
      } focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-1`}
    >
      <input
        id={inputId}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        // Position the native input off-screen but keep it in tab/arrow
        // flow. We keep the label fully clickable.
        className="sr-only"
      />
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={`mt-0.5 inline-flex w-4 h-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            checked
              ? "border-accent bg-accent"
              : "border-foreground/30 bg-white group-hover:border-foreground/60"
          }`}
        >
          {checked ? (
            <span className="block w-1.5 h-1.5 rounded-full bg-white" />
          ) : null}
        </span>
        <span className="flex-1">
          <span className="block text-[14px] sm:text-[15px] text-foreground leading-snug">
            {primaryText}
          </span>
          {secondaryText ? (
            <span className="mt-1 block text-[12px] text-muted-foreground italic leading-snug">
              {secondaryText}
            </span>
          ) : null}
        </span>
      </div>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Main component.
// ---------------------------------------------------------------------------
export function TryOneThinkingMove() {
  const headingId = useId();
  const reduceMotion = useReducedMotion();

  const [claim, setClaim] = useState<ClaimChoice["id"] | null>(null);
  const [evidence, setEvidence] = useState<EvidenceChoice["id"] | null>(null);
  const [revealed, setRevealed] = useState(false);
  const startedRef = useRef(false);
  const revealRef = useRef<HTMLDivElement | null>(null);

  // Compute active step for the muted-gold step markers — purely visual.
  const active: 1 | 2 | 3 | 4 = revealed
    ? 4
    : evidence
    ? 3
    : claim
    ? 2
    : 1;

  // Sprint 3C convention — fire a single "started" event the first time
  // the parent makes any selection. No PII; payload only carries the
  // step name.
  function handleClaim(value: string) {
    setClaim(value as ClaimChoice["id"]);
    if (!startedRef.current) {
      startedRef.current = true;
      track("interactive_demo_micro_demo_started", { step: "claim" });
    }
    // Re-hide the reveal if the parent revisits earlier steps so the
    // reveal stays an intentional final action.
    if (revealed) setRevealed(false);
  }

  function handleEvidence(value: string) {
    setEvidence(value as EvidenceChoice["id"]);
    if (!startedRef.current) {
      startedRef.current = true;
      track("interactive_demo_micro_demo_started", { step: "evidence" });
    }
    if (revealed) setRevealed(false);
  }

  function handleReveal() {
    setRevealed(true);
    track("interactive_demo_micro_demo_revealed");
  }

  // Move focus to the reveal panel when it appears so SR + keyboard
  // users land on the new content directly. Skipped if reduced motion is
  // requested AND we're on a small screen, to avoid jarring jumps.
  useEffect(() => {
    if (revealed && revealRef.current) {
      revealRef.current.focus();
    }
  }, [revealed]);

  const canReveal = claim !== null && evidence !== null;

  return (
    <section
      id="try-one-thinking-move"
      aria-labelledby={headingId}
      className="py-16 md:py-20 px-6 bg-primary text-primary-foreground"
    >
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <Badge
            variant="outline"
            className="bg-white/5 border border-white/10 text-white/85 mb-4 h-7 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]"
          >
            <Sparkles className="w-3 h-3 mr-1.5" />
            Try one thinking move
          </Badge>
          <h2
            id={headingId}
            className="text-3xl md:text-[2.25rem] font-bold leading-[1.2] mb-3"
          >
            Compare your reasoning to one possible response.
          </h2>
          <p className="text-base md:text-[17px] font-light text-primary-foreground/75 max-w-2xl mx-auto leading-relaxed">
            Read a short passage, choose a claim that feels stronger, pick the
            line that supports it, then reveal one way a Jurassic English
            <span className="align-super text-xs text-accent">™</span> student
            might reason. There is no score and no grading.
          </p>
        </div>

        {/* Parchment card holds the playable steps — keeps the academic
            "page" feel against the deep outer section. */}
        <div className="rounded-2xl bg-[#F4F1EA] text-foreground p-5 sm:p-7 md:p-8 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]">
          <StepMarkers active={active} />

          {/* Step 1 — passage */}
          <article className="rounded-xl bg-white border border-foreground/10 p-5 sm:p-6 mb-6">
            <div className="flex items-center gap-2 mb-3 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground/55">
              <BookOpen className="w-3.5 h-3.5" />
              Step 1 — Read the passage
            </div>
            <Quote
              aria-hidden="true"
              className="w-5 h-5 text-accent/70 mb-2"
            />
            <p className="text-[15px] sm:text-[16px] text-foreground leading-relaxed font-serif italic">
              {PASSAGE_TEXT}
            </p>
          </article>

          {/* Step 2 — claim choice */}
          <fieldset className="rounded-xl bg-white border border-foreground/10 p-5 sm:p-6 mb-6">
            <legend className="px-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground/55 inline-flex items-center gap-2">
              <Compass className="w-3.5 h-3.5" />
              Step 2 — Which claim feels stronger to you?
            </legend>
            <p className="text-[12px] text-muted-foreground italic mb-3 mt-1">
              Both claims are valid. Choose the one you find more interesting
              to think about.
            </p>
            <div className="grid gap-3">
              {CLAIM_CHOICES.map((c) => (
                <ChoiceCard
                  key={c.id}
                  name="micro-demo-claim"
                  value={c.id}
                  checked={claim === c.id}
                  onChange={handleClaim}
                  primaryText={c.label}
                  secondaryText={c.hint}
                />
              ))}
            </div>
          </fieldset>

          {/* Step 3 — evidence choice — only visible after claim is set */}
          <fieldset
            className={`rounded-xl bg-white border border-foreground/10 p-5 sm:p-6 mb-6 transition-opacity duration-300 ${
              claim ? "opacity-100" : "opacity-50"
            }`}
            disabled={!claim}
            aria-disabled={!claim}
          >
            <legend className="px-2 text-[11px] uppercase tracking-[0.12em] font-semibold text-foreground/55 inline-flex items-center gap-2">
              <Eye className="w-3.5 h-3.5" />
              Step 3 — Which line best supports your claim?
            </legend>
            <p className="text-[12px] text-muted-foreground italic mb-3 mt-1">
              Any of these can support a thoughtful claim. Pick the one you
              would point to.
            </p>
            <div className="grid gap-3">
              {EVIDENCE_CHOICES.map((e) => (
                <ChoiceCard
                  key={e.id}
                  name="micro-demo-evidence"
                  value={e.id}
                  checked={evidence === e.id}
                  onChange={handleEvidence}
                  primaryText={e.label}
                />
              ))}
            </div>
          </fieldset>

          {/* Step 4 — reveal */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleReveal}
              disabled={!canReveal}
              aria-controls="micro-demo-reveal-panel"
              aria-expanded={revealed}
              className={`inline-flex items-center justify-center px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ${
                canReveal
                  ? "bg-foreground text-background hover:bg-foreground/90 shadow-[0_15px_30px_-12px_rgba(0,0,0,0.35)]"
                  : "bg-foreground/10 text-foreground/40 cursor-not-allowed"
              }`}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Reveal one possible response
            </button>
            {!canReveal ? (
              <p className="mt-3 text-[12px] text-muted-foreground italic">
                Choose a claim and a line above to reveal a model response.
              </p>
            ) : null}
          </div>

          {/* Reveal panel — animated entrance, aria-live polite */}
          {revealed ? (
            <motion.div
              id="micro-demo-reveal-panel"
              ref={revealRef}
              tabIndex={-1}
              role="region"
              aria-live="polite"
              aria-atomic="true"
              initial={
                reduceMotion
                  ? { opacity: 1, y: 0 }
                  : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={
                reduceMotion ? { duration: 0 } : { duration: 0.35, ease: "easeOut" }
              }
              className="mt-6 rounded-xl bg-foreground text-background p-5 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              <div className="flex items-center gap-2 mb-3 text-[11px] uppercase tracking-[0.12em] font-semibold text-background/70">
                <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                One possible Jurassic English
                <span className="align-super text-[9px] text-accent">™</span>{" "}
                response
              </div>
              <p className="text-[14.5px] sm:text-[15.5px] leading-relaxed">
                <strong className="text-accent">Claim.</strong> The librarian
                is protecting the books from a quiet danger.{" "}
                <strong className="text-accent">Evidence.</strong> Every book
                is back by lunchtime, dry, intact, and arranged exactly as
                before. <strong className="text-accent">Interpretation.</strong>{" "}
                This suggests her nightly rounds were not routine but
                deliberate care during a season she could not name.{" "}
                <strong className="text-accent">Warrant.</strong> The story
                shows that protection sometimes looks like ordinary work done
                in silence.
              </p>
              <p className="mt-4 text-[12px] italic text-background/65">
                There is no single correct answer here. This is a thinking
                move, not a grade. This is the kind of thinking the diagnostic
                helps place.
              </p>
            </motion.div>
          ) : null}
        </div>

        {/* Final CTA bar */}
        <div className="mt-8 text-center">
          <p className="text-[15px] md:text-base font-light text-primary-foreground/85 mb-4 max-w-xl mx-auto leading-relaxed">
            Want to know your child&rsquo;s starting level?
          </p>
          <Link href="/book-diagnostic" className={JE_CTA_PRIMARY_LIGHT}>
            Book a Student Thinking Diagnostic
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <p className="mt-4 text-[11px] italic text-primary-foreground/55 max-w-md mx-auto">
            We do not promise scores. The teacher always has the final word on
            placement and progress.
          </p>
        </div>
      </div>
    </section>
  );
}

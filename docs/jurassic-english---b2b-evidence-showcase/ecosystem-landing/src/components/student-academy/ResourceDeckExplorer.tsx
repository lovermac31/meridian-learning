"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

const LEVELS = [
  { id: 1, label: "Level 1", stage: "Foundation", range: "Pre-A1 / A1", focus: "Notice a story detail and share a simple choice.", example: "I think Maya should warn the crew. I noticed the reef is close." },
  { id: 2, label: "Level 2", stage: "Early Reasoner", range: "A1 / A2", focus: "Explain a character’s choice and support an idea with a detail.", example: "Maya should use the flare because the crew may not see the reef." },
  { id: 3, label: "Level 3", stage: "Developing Analyst", range: "A2 / B1", focus: "Compare viewpoints and connect evidence to a reason.", example: "Although saving the flare could protect Maya, warning the crew may prevent greater harm." },
  { id: 4, label: "Level 4", stage: "Academic Builder", range: "B1 / B2", focus: "Build a structured paragraph with a clear claim and explanation.", example: "The decision prioritises immediate collective safety over individual preparedness, supported by the danger near the reef." },
  { id: 5, label: "Level 5", stage: "Advanced Thinker", range: "B2 / C1", focus: "Weigh a counterargument and qualify a conclusion.", example: "While keeping a reserve flare is prudent, the visible danger to several people makes immediate warning the stronger choice." },
];

const ROUTINE = [
  { label: "Analyze", prompt: "What choice is Maya facing?", detail: "Find the decision and the people affected." },
  { label: "Evaluate", prompt: "Which option is stronger, and why?", detail: "Consider the likely consequences of both options." },
  { label: "Justify", prompt: "What detail supports your view?", detail: "Point to evidence from the short scenario." },
  { label: "Reflect", prompt: "What might you reconsider?", detail: "Connect the reasoning to a new situation." },
];

export function ResourceDeckExplorer() {
  const [level, setLevel] = useState(0);
  const [step, setStep] = useState(0);
  const selected = LEVELS[level];
  const current = ROUTINE[step];

  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#E6DEC8] bg-white shadow-sm" aria-label="Interactive sample resource preview">
      <div className="flex items-center justify-between gap-3 bg-[#1E4D3B] px-5 py-4 text-white">
        <div><p className="text-xs font-bold uppercase tracking-widest text-[#F6C453]">Level sampler</p><h3 className="mt-1 text-lg font-extrabold">Explore the learning progression</h3></div>
        <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">Illustrative</span>
      </div>
      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Choose a learning level">
          {LEVELS.map((item, index) => (
            <button key={item.id} type="button" onClick={() => { setLevel(index); setStep(0); }} aria-pressed={index === level} className={`min-h-10 rounded-full border px-3.5 text-sm font-extrabold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309] focus-visible:ring-offset-2 ${index === level ? "border-[#1E4D3B] bg-[#1E4D3B] text-white" : "border-[#1E4D3B]/25 bg-white text-[#1E4D3B] hover:bg-[#E6F4EA]"}`}>
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-2xl bg-[#FAF7F2] p-4 sm:p-5" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div><p className="text-xs font-extrabold uppercase tracking-wider text-[#B45309]">{selected.label} · {selected.range}</p><h4 className="mt-1 text-xl font-extrabold text-[#1E4D3B]">{selected.stage}</h4></div>
            <span className="rounded-full border border-[#E6DEC8] bg-white px-3 py-1 text-xs font-bold text-[#4A5568]">Sample progression</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-[#4A5568]"><strong className="text-[#1C2526]">Focus:</strong> {selected.focus}</p>
          <blockquote className="mt-4 rounded-xl border-l-4 border-[#B45309] bg-white p-4 text-sm italic leading-relaxed text-[#1C2526]">“{selected.example}”</blockquote>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-extrabold uppercase tracking-wider text-[#B45309]">The thinking routine</p><h4 className="mt-1 font-extrabold text-[#1E4D3B]">{current.label}</h4></div>
            <div className="flex items-center gap-2">
              <button type="button" aria-label="Previous thinking step" onClick={() => setStep((s) => (s + ROUTINE.length - 1) % ROUTINE.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1E4D3B]/25 text-[#1E4D3B] hover:bg-[#E6F4EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]"><ChevronLeft aria-hidden="true" className="h-5 w-5" /></button>
              <span className="min-w-12 text-center text-sm font-bold text-[#4A5568]">{step + 1} / 4</span>
              <button type="button" aria-label="Next thinking step" onClick={() => setStep((s) => (s + 1) % ROUTINE.length)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[#1E4D3B]/25 text-[#1E4D3B] hover:bg-[#E6F4EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]"><ChevronRight aria-hidden="true" className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-4 gap-1.5" aria-hidden="true">
            {ROUTINE.map((item, index) => <span key={item.label} className={`h-1.5 rounded-full ${index <= step ? "bg-[#B45309]" : "bg-[#E6DEC8]"}`} />)}
          </div>
          <p className="mt-3 text-sm font-bold text-[#1C2526]" aria-live="polite">{current.prompt}</p>
          <p className="mt-1 text-sm leading-relaxed text-[#4A5568]">{current.detail}</p>
          <div className="mt-4 flex items-center justify-between border-t border-[#E6DEC8] pt-3 text-xs text-[#4A5568]">
            <span className="inline-flex items-center gap-1.5"><Check aria-hidden="true" className="h-4 w-4 text-[#137333]" /> No account needed for this sample</span>
            <button type="button" onClick={() => { setLevel(0); setStep(0); }} className="inline-flex min-h-9 items-center gap-1.5 font-bold text-[#1E4D3B] underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B45309]"><RotateCcw aria-hidden="true" className="h-3.5 w-3.5" /> Reset</button>
          </div>
        </div>
      </div>
    </div>
  );
}

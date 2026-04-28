// Interactive Demo Level 1–5 content.
//
// All copy here is parent-facing and conforms to the Student Academy
// claims-safety policy: no score promises, no AI tutor framing, no
// guaranteed outcomes. Source of truth is the Phase 11 spec
// (Level 1–5 Pathway Explorer) — see docs/site-architecture.md or
// the project spec for the controlling text.
//
// Six fields per level:
//   A. promise        — Parent-friendly promise
//   B. studentTask    — What the student does
//   C. thinkingMove   — The cognitive shift the level introduces
//   D. ceiwScaffold   — How CEIW grows at this level
//   E. portfolio      — Visible portfolio evidence
//   F. bestNextStep   — Audience-targeted next-step language
//
// Plus three "Try the Thinking Move" fields used for a visual-only
// mini-task. These use invented, public-domain-style material — not
// real exam content and not curriculum-internal text.

export type DemoLevelNumber = 1 | 2 | 3 | 4 | 5;

export type DemoLevel = {
  number: DemoLevelNumber;
  shortTitle: string;
  fullTitle: string;
  cefrBand: string;
  promise: string;
  studentTask: string;
  thinkingMove: string;
  ceiwScaffold: string;
  portfolio: string;
  bestNextStep: string;
  tryPrompt: string;
  tryScaffold: string;
  trySample: string;
};

export const demoLevels: DemoLevel[] = [
  {
    number: 1,
    shortTitle: "First Stories, First Thinking",
    fullTitle: "Level 1 — First Stories, First Thinking",
    cefrBand: "Pre-A1 / A1",
    promise:
      "Your child begins using English to notice, name, explain, and connect ideas.",
    studentTask:
      'Read or listen to a short story moment and complete: "I think… because…"',
    thinkingMove:
      "First claim-making through story, feeling, and evidence.",
    ceiwScaffold:
      "Claim only — oral, drawn, or one-sentence written.",
    portfolio:
      "Drawing or simple claim card with teacher-transcribed reasoning.",
    bestNextStep:
      "Book a diagnostic if your child is beginning English or needs confidence with speaking and story comprehension.",
    tryPrompt:
      "A small sparrow flies through snow to bring a leaf back to its nest.",
    tryScaffold: "I think this story is about ___ because ___.",
    trySample:
      "I think this story is about being brave because the sparrow flies in the snow.",
  },
  {
    number: 2,
    shortTitle: "Stories to Evidence",
    fullTitle: "Level 2 — Stories to Evidence",
    cefrBand: "A1+ / A2",
    promise:
      "Your child begins using English to explain ideas with evidence from the text.",
    studentTask:
      "Choose a claim and find one sentence or detail from the story that supports it.",
    thinkingMove: "Moving from memory to evidence.",
    ceiwScaffold: "Claim + Evidence.",
    portfolio:
      "Short evidence card or paragraph with cited story detail.",
    bestNextStep:
      "Book a diagnostic if your child can answer basic English questions but needs stronger explanation.",
    tryPrompt:
      "A lighthouse keeper keeps the lamp burning during a storm.",
    tryScaffold:
      "Claim: The lighthouse keeper is ___.\nEvidence: In the story, ___.",
    trySample:
      "The lighthouse keeper is determined. In the story, she does not leave the lamp even when she is tired.",
  },
  {
    number: 3,
    shortTitle: "From Opinion to Interpretation",
    fullTitle: "Level 3 — From Opinion to Interpretation",
    cefrBand: "A2+ / B1",
    promise:
      "Your child learns to move beyond opinion into interpretation.",
    studentTask:
      "Explain what a story detail may suggest about a character, choice, or meaning.",
    thinkingMove: "From opinion to interpretation.",
    ceiwScaffold: "Claim + Evidence + Interpretation.",
    portfolio: "Analytical paragraph or paired-text response.",
    bestNextStep:
      "Book a diagnostic if your child speaks English but struggles to explain deeper meaning.",
    tryPrompt:
      "A student quietly returns a lost wallet without asking for praise.",
    tryScaffold: "Claim + Evidence + Interpretation.",
    trySample:
      "The story suggests that honesty can be quiet because the student does the right thing without asking anyone to notice.",
  },
  {
    number: 4,
    shortTitle: "Interpretation to Argument",
    fullTitle: "Level 4 — Interpretation to Argument",
    cefrBand: "B1+ / B2",
    promise:
      "Your child builds structured academic arguments in English.",
    studentTask:
      "Use a claim, evidence, interpretation, and warrant to explain a deeper idea.",
    thinkingMove: "From interpretation to argument.",
    ceiwScaffold: "Claim + Evidence + Interpretation + Warrant.",
    portfolio:
      "Academic argument paragraph, essay scaffold, seminar response, or debate preparation.",
    bestNextStep:
      "Book a diagnostic if your child needs stronger academic writing, seminar speaking, or literature analysis.",
    tryPrompt:
      "Two characters make different choices under pressure.",
    tryScaffold: "Claim + Evidence + Interpretation + Warrant.",
    trySample:
      "This contrast shows that courage is not only action but responsibility. The underlying principle is that moral choices matter most when no reward is guaranteed.",
  },
  {
    number: 5,
    shortTitle: "Systems, Warrants, Exam Transfer",
    fullTitle: "Level 5 — Systems, Warrants, Exam Transfer",
    cefrBand: "B2+ / C1",
    promise:
      "Your child learns to defend ideas across texts, systems, and exam-style contexts.",
    studentTask:
      "Build an argument with evidence, warrant, impact, and possible counter-warrant.",
    thinkingMove:
      "Advanced academic reasoning and exam-transfer thinking.",
    ceiwScaffold:
      "Claim + Evidence + Interpretation + Warrant + Impact, with counter-warrant.",
    portfolio:
      "Capstone argument, timed response, oral defense, or exam-transfer portfolio sample.",
    bestNextStep:
      "Book a diagnostic if your child is preparing for advanced academic writing, IELTS/Cambridge/IB-style reasoning, or university-readiness work.",
    tryPrompt:
      "A community debates whether progress should protect or replace tradition.",
    tryScaffold: "Claim + Evidence + Interpretation + Warrant + Impact.",
    trySample:
      "The argument suggests that progress without memory can become a form of loss. If accepted, this has implications for how communities balance innovation with responsibility.",
  },
];

export type ParentEvidenceItem = {
  key: "reading" | "speaking" | "writing" | "reasoning";
  title: string;
  body: string;
};

export const parentEvidenceItems: ParentEvidenceItem[] = [
  {
    key: "reading",
    title: "Reading evidence",
    body: "Annotated story responses, paired-text comparisons, and reading reflections that show what your child notices in a text.",
  },
  {
    key: "speaking",
    title: "Speaking evidence",
    body: "Recorded explanations, seminar contributions, and oral defenses that show how your child reasons aloud.",
  },
  {
    key: "writing",
    title: "Writing evidence",
    body: "Claim cards, evidence paragraphs, CEIW arguments, and capstone pieces that show structured written reasoning.",
  },
  {
    key: "reasoning",
    title: "Reasoning evidence",
    body: "Interpretation moves, warrants, counter-warrants, and reflections that show how your child thinks about meaning.",
  },
];

export type StudentLevel = {
  id: string;
  level: string;
  title: string;
  cefr: string;
  focus: string;
  outcomes: string[];
};

export type StudentOutcome = {
  iconKey:
    | "speaking"
    | "reading"
    | "vocabulary"
    | "writing"
    | "literature"
    | "reflection"
    | "portfolio"
    | "exam";
  label: string;
  description: string;
};

export type DiagnosticMeasure = {
  title: string;
  description: string;
};

export type PortfolioEvidenceType = {
  title: string;
  description: string;
};

export type AcademyPathway = {
  id: string;
  name: string;
  audience: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
};

export type FAQItem = {
  question: string;
  answer: string;
};

export type LearnerSupport = {
  title: string;
  description: string;
};

export type ProblemCard = {
  title: string;
  description: string;
};

export type ThreeBeat = {
  iconKey: "literature" | "regulation" | "cycle";
  title: string;
  description: string;
};

export type ThinkingCycleStage = {
  iconKey:
    | "regulate"
    | "encounter"
    | "analyze"
    | "evaluate"
    | "justify"
    | "reflect"
    | "publish";
  number: string;
  name: string;
  description: string;
};

export type CEIWMove = {
  letter: string;
  name: string;
  plain: string;
  isSenior?: boolean;
};

export const studentLevels: StudentLevel[] = [
  {
    id: "level-1",
    level: "Level 1",
    title: "Foundation",
    cefr: "Pre-A1 / A1",
    focus: "First Stories, First Thinking",
    outcomes: [
      "Emotional and descriptive language",
      "Oral confidence",
      "Simple claim + evidence",
    ],
  },
  {
    id: "level-2",
    level: "Level 2",
    title: "Early Reasoner",
    cefr: "A1 / A2",
    focus: "Stories to Evidence",
    outcomes: [
      "Character choices",
      "Sentence-level reasoning",
      "Early explanation",
    ],
  },
  {
    id: "level-3",
    level: "Level 3",
    title: "Developing Analyst",
    cefr: "A2 / B1",
    focus: "From Opinion to Interpretation",
    outcomes: [
      "Accountable talk",
      "Literary analysis",
      "Analytical paragraphs",
    ],
  },
  {
    id: "level-4",
    level: "Level 4",
    title: "Academic Builder",
    cefr: "B1 / B2",
    focus: "Interpretation to Argument",
    outcomes: [
      "CEIW writing with named warrants",
      "Academic vocabulary",
      "Seminar discussion",
    ],
  },
  {
    id: "level-5",
    level: "Level 5",
    title: "Advanced Thinker",
    cefr: "B2 / C1",
    focus: "Systems, Counter-warrants, Exam Transfer",
    outcomes: [
      "CEIW + Impact with counter-warrants",
      "IELTS / IB / Cambridge readiness",
      "University-pathway writing",
    ],
  },
];

export const studentProblems: ProblemCard[] = [
  {
    title: "Fluent speech, weak explanation",
    description:
      "Students can speak English but struggle to explain ideas clearly when the question gets harder.",
  },
  {
    title: "Vocabulary without evidence",
    description:
      "Students know words and phrases but cannot support answers with reasons, examples, or text evidence.",
  },
  {
    title: "Sentences, not arguments",
    description:
      "Students write correct sentences but cannot build a structured argument across paragraphs.",
  },
  {
    title: "Memorized templates",
    description:
      "Students prepare for exams using repetition and templates, leaving them stuck when prompts shift.",
  },
  {
    title: "Confidence drops with complexity",
    description:
      "Students lose confidence when literature, essay tasks, or seminar-style discussion become demanding.",
  },
];

export const threeBeats: ThreeBeat[] = [
  {
    iconKey: "literature",
    title: "Authentic Literature First",
    description:
      "Your child reads real books, not abridged worksheets. Real stories carry the language, ideas, and depth that academic English requires.",
  },
  {
    iconKey: "regulation",
    title: "Regulation-Before-Reasoning",
    description:
      "Every lesson begins with calm attention. Thinking follows readiness — quiet learners thrive when the cycle is predictable.",
  },
  {
    iconKey: "cycle",
    title: "The Jurassic Thinking Cycle™",
    description:
      "A seven-stage routine — Regulate, Encounter, Analyze, Evaluate, Justify, Reflect, Publish — that your child uses every lesson to make reasoning visible.",
  },
];

export const thinkingCycleStages: ThinkingCycleStage[] = [
  {
    iconKey: "regulate",
    number: "01",
    name: "Regulate",
    description: "Begin with calm. Thinking follows readiness.",
  },
  {
    iconKey: "encounter",
    number: "02",
    name: "Encounter",
    description: "Meet the text. Notice. Wonder.",
  },
  {
    iconKey: "analyze",
    number: "03",
    name: "Analyze",
    description: "Look closely. What does the text actually say?",
  },
  {
    iconKey: "evaluate",
    number: "04",
    name: "Evaluate",
    description: "Weigh choices, voices, and consequences.",
  },
  {
    iconKey: "justify",
    number: "05",
    name: "Justify",
    description: "Support ideas with evidence and reasoning.",
  },
  {
    iconKey: "reflect",
    number: "06",
    name: "Reflect",
    description: "Connect learning to self, others, and the world.",
  },
  {
    iconKey: "publish",
    number: "07",
    name: "Publish",
    description: "Make thinking visible. Add it to the portfolio.",
  },
];

export const ceiwMoves: CEIWMove[] = [
  {
    letter: "C",
    name: "Claim",
    plain: "The point your child is making.",
  },
  {
    letter: "E",
    name: "Evidence",
    plain: "The proof from the text.",
  },
  {
    letter: "I",
    name: "Interpretation",
    plain: "What the evidence means.",
  },
  {
    letter: "W",
    name: "Warrant",
    plain: "The underlying principle.",
  },
  {
    letter: "+",
    name: "Impact",
    plain: "The consequence of accepting the argument.",
    isSenior: true,
  },
];

export const dreDoes: string[] = [
  "Show your child the reasoning scaffold",
  "Capture portfolio evidence",
  "Send you clear updates",
  "Stay teacher-led",
];

export const dreDoesNot: string[] = [
  "Replace your child's teacher",
  "Grade work autonomously",
  "Predict exam scores",
  "Write your child's response",
];

export const studentOutcomes: StudentOutcome[] = [
  {
    iconKey: "speaking",
    label: "Speaking confidence",
    description:
      "Structured speaking practice with accountable talk and oral defense of ideas.",
  },
  {
    iconKey: "reading",
    label: "Reading comprehension",
    description:
      "Literature-based reading that builds inference, interpretation, and depth.",
  },
  {
    iconKey: "vocabulary",
    label: "Academic vocabulary",
    description:
      "Word Fossil records and contextual vocabulary built through reading and writing.",
  },
  {
    iconKey: "writing",
    label: "Evidence-based writing",
    description:
      "CEIW writing — claim, evidence, interpretation, warrant — across paragraph and essay tasks.",
  },
  {
    iconKey: "literature",
    label: "Literature interpretation",
    description:
      "Analytical reading of stories, characters, and themes with structured response tasks.",
  },
  {
    iconKey: "reflection",
    label: "Structured reflection",
    description:
      "Reflection records that make student thinking visible after each cycle.",
  },
  {
    iconKey: "portfolio",
    label: "Portfolio evidence",
    description:
      "A Growth Portfolio of writing, speaking, and reflection samples parents can review.",
  },
  {
    iconKey: "exam",
    label: "Exam-transfer readiness",
    description:
      "Reasoning structures that transfer to IELTS, IB, Cambridge, and academic English tasks.",
  },
];

export const learnerSupports: LearnerSupport[] = [
  {
    title: "Multiple ways to read",
    description:
      "Text, audio-paired reading, and pre-taught vocabulary support every reader.",
  },
  {
    title: "Multiple ways to listen and respond",
    description:
      "Scaffolded oral retell and structured speaking time make participation predictable.",
  },
  {
    title: "Multiple ways to write",
    description:
      "Typed, handwritten, drawn, or dictated — the destination is the same.",
  },
  {
    title: "Predictable lesson rhythms",
    description:
      "Regulation first, then reasoning. Lesson order stays the same so attention can deepen.",
  },
  {
    title: "Embedded access plans",
    description:
      "Documented access notes are read carefully and supported inside the lesson, not as an exception.",
  },
  {
    title: "No single learner singled out",
    description:
      "Access is part of the room. Every learner is invited to contribute, never forced.",
  },
];

export const diagnosticMeasures: DiagnosticMeasure[] = [
  {
    title: "Short reading or story response",
    description:
      "How the student engages with a story or short text — what they notice and how they respond.",
  },
  {
    title: "Oral explanation",
    description:
      "How clearly the student speaks, organizes ideas, and explains a position out loud.",
  },
  {
    title: "Written response",
    description:
      "How the student structures a written answer at sentence and paragraph level.",
  },
  {
    title: "Evidence-use check",
    description:
      "How the student uses examples, quotations, or details to support an idea.",
  },
  {
    title: "Reasoning profile",
    description:
      "Where the student sits across analyze, evaluate, justify, and reflect.",
  },
  {
    title: "Recommended level placement",
    description:
      "A specific Level 1–5 recommendation with notes for parents and teachers.",
  },
];

export const portfolioEvidenceTypes: PortfolioEvidenceType[] = [
  {
    title: "Word Fossil vocabulary records",
    description:
      "Student-built vocabulary entries with context, meaning, and example use.",
  },
  {
    title: "Because Bridge responses",
    description:
      "Short reasoning artifacts linking claim to evidence using a structured frame.",
  },
  {
    title: "Claim + evidence paragraphs",
    description:
      "Paragraph-level work showing the move from opinion to interpretation.",
  },
  {
    title: "CEIW writing samples",
    description:
      "Full claim-evidence-interpretation-warrant pieces collected over time.",
  },
  {
    title: "Seminar reflections",
    description:
      "Written reflections after accountable-talk discussions and seminar tasks.",
  },
  {
    title: "Before / after writing revisions",
    description:
      "Revision pairs that show how a draft has been strengthened with feedback.",
  },
  {
    title: "Parent progress summaries",
    description:
      "Periodic summaries that translate evidence into parent-readable progress notes.",
  },
];

export const academyPathways: AcademyPathway[] = [
  {
    id: "levels-1-3",
    name: "Levels 1–3 Placement",
    audience: "Foundation through Developing Analyst",
    description:
      "Story-based reasoning, claim + evidence, and early interpretation.",
    ctaText: "Book Student Thinking Diagnostic",
    ctaHref: "/book-diagnostic",
  },
  {
    id: "level-4",
    name: "Level 4 Placement",
    audience: "Academic Builder",
    description:
      "Full CEIW writing with named warrants. Optional early Academic Thinker exposure.",
    ctaText: "Book Student Thinking Diagnostic",
    ctaHref: "/book-diagnostic",
  },
  {
    id: "level-5",
    name: "Level 5 Placement",
    audience: "Advanced Thinker",
    description:
      "Counter-warrants, Impact, and exam transfer. May route to the Academic Thinker Program.",
    ctaText: "Book Student Thinking Diagnostic",
    ctaHref: "/book-diagnostic",
    secondaryCtaText: "Explore Academic Thinker",
    secondaryCtaHref: "/academic-thinker",
  },
  {
    id: "ielts-bridge",
    name: "IELTS Bridge",
    audience: "For older students whose goal is IELTS",
    description:
      "Routes to the IELTS Reasoning Lab, a sibling brand layer for dedicated exam preparation.",
    ctaText: "Explore IELTS Reasoning Lab",
    ctaHref: "/ielts-reasoning-lab",
  },
];

export const studentAcademyFAQs: FAQItem[] = [
  {
    question: "Is this English tutoring?",
    answer:
      "No. Tutoring patches gaps. The Student Academy builds a foundation. Children leave able to read, reason, and write at academic standard, not only able to pass tests.",
  },
  {
    question: "What makes it different?",
    answer:
      "Three things: authentic literature first (real books, not worksheet content), the visible reasoning architecture of CEIW, and portfolio evidence you can see — not just a grade.",
  },
  {
    question: "What is CEIW?",
    answer:
      "CEIW stands for Claim, Evidence, Interpretation, Warrant — extended at senior levels with Impact. It is the visible architecture your child learns to use, taught from Level 1 in age-appropriate forms.",
  },
  {
    question: "What is the Digital Reasoning Engine?",
    answer:
      "A quiet tool that makes your child's thinking visible. It captures their work, organizes their portfolio, and helps us send you clear updates. The teacher always has the final word.",
  },
  {
    question: "Will it help with IELTS?",
    answer:
      "At Levels 4 and 5, yes — the same reasoning that produces strong academic writing produces strong IELTS Writing Task 2 and Speaking Part 3 performance. We do not promise scores. We build the reasoning the bands reward.",
  },
  {
    question: "Is there a guaranteed score?",
    answer:
      "No. Any program that promises a specific score is over-promising. We share rubric-anchored, evidence-based progress; we do not guarantee outcomes.",
  },
  {
    question: "How is my child placed?",
    answer:
      "Through the Student Thinking Diagnostic — a 45-minute placement conversation, not a test. Your child reads, speaks, and writes about a short story. After the diagnostic, you receive a Parent Diagnostic Report with a recommended starting level. There is no fail.",
  },
  {
    question: "What will I see each month?",
    answer:
      "Real samples of your child's work in the portfolio, a brief monthly note from the teacher, and a termly Learner Growth Report with a 20-minute parent meeting.",
  },
  {
    question: "What if my child is shy?",
    answer:
      "Quiet learners thrive. Regulation-Before-Reasoning is the program's first principle. Lessons begin with calm; participation is structured; thinking time is protected. Your child is invited to contribute, never forced.",
  },
  {
    question: "What if my child has learning differences?",
    answer:
      "The Neuroinclusive Access Layer is built into every level. Your child can read, listen, draw, speak, or type — multiple paths to the same destination. We diversify the route, not the academic demand.",
  },
];

export const claimsSafeCopy = {
  approvedClaim:
    "Jurassic English™ is designed to make student reasoning visible through structured learning artifacts, writing samples, speaking evidence, and portfolio records.",
  unsupportedClaimToAvoid:
    "Guaranteed IELTS, Cambridge, IB, or admission results.",
  evidenceTypes: [
    "Diagnostic Records",
    "Speaking Samples",
    "CEIW Writing",
    "Reflection Records",
    "Growth Portfolios",
  ],
};

export const studentFitFor: string[] = [
  "Students who need stronger English reasoning, not just conversation practice",
  "Parents who want visible, structured academic progress",
  "Learners preparing for international school or academic English",
  "Students who can speak English but struggle to write or justify ideas",
  "Families seeking a literature-based, reasoning-led English pathway",
];

export const studentFitNotFor: string[] = [
  "A generic grammar worksheet program",
  "A quick exam-hack or score-cramming course",
  "A score-improvement product with promised outcomes",
  "A full school licensing or teacher-training package",
  "The internal Pilot Program Portal",
];

export const pricingReference =
  "Specific pricing is provided after the Student Thinking Diagnostic so the recommended pathway matches the learner's level, goals, and support needs.";

export const diagnosticCaption =
  "45 minutes. No score. Just a clear next step.";

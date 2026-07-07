// /companies — B2B hub: "English Readiness for Tech Teams".
// Operationalises the Vietnam B2B wedge (AI-assisted business/technical English,
// sold B2B to tech & export employers). EN-only for now; VI mirror is a follow-up.
// Integrity: no fabricated metrics — framing is qualitative; any published figure
// must come later from measured pilot/survey data (the English-Readiness Index).
export const companiesPageContent = {
  hero: {
    backCta: 'Back to main site',
    eyebrow: 'For Companies · Tech & Export Teams',
    title: 'English readiness for your technical teams.',
    body: 'Your engineers are technically excellent — but on US, Japanese, and European client work, communication becomes the bottleneck, not code. Jurassic English turns technical talent into confident, client-ready communicators, and measures the gain in CEFR/IELTS terms — built and graded by IELTS professionals, not an app alone.',
    primaryCta: 'Book a scoping call',
    secondaryCta: 'See the 6-week pilot',
    badge: 'Ho Chi Minh City · Hanoi · Online',
  },

  problem: {
    eyebrow: 'The cost of weak English',
    title: 'Communication — not capability — is where technical teams lose ground.',
    body: 'Capable engineers stall on client calls, lose time to rework on English documentation, and get held back from client-facing and senior roles. As more work serves global clients, the English gap becomes a revenue and retention issue, not a training nicety.',
    modes: [
      {
        title: 'Client calls & standups',
        body: 'Engineers who write excellent code freeze on live calls with US/Japan clients — meetings run long, requirements get missed, and confidence erodes.',
      },
      {
        title: 'Docs & code review',
        body: 'Unclear written English costs rework: specs, tickets, pull-request reviews, and email threads that have to be redone or clarified.',
      },
      {
        title: 'Stalled promotions',
        body: 'Talented people are passed over for client-facing and lead roles because communication — not technical skill — is the visible gap.',
      },
    ],
  },

  audiences: {
    eyebrow: 'Who this is for',
    title: 'Built for the people accountable for team readiness.',
    body: 'We sell to organisations whose people already have technical skill but lose opportunity on English — measured for the buyer who answers for outcomes.',
    cards: [
      {
        role: 'Software / IT & offshore-dev firms',
        headline: 'Protect US & Japan accounts by making client-facing engineers fluent.',
        body: 'For delivery leads and engineering managers whose teams work with global clients, we build the exact communication skills those accounts depend on — and report the movement.',
        signals: [
          'Client-call and standup fluency',
          'Code-review and documentation clarity',
          'Manager dashboard: team readiness score',
          'Pilot-first, measured in CEFR gains',
        ],
      },
      {
        role: 'Semiconductor & MNC captives',
        headline: 'English readiness for global-team mandates and the deep-tech workforce.',
        body: 'For HR and plant training leads under a global-team or upskilling mandate, we deliver structured business English aligned to CEFR — practical for engineers, defensible for the board.',
        signals: [
          'CEFR-aligned placement and progress testing',
          'Business & technical English for real tasks',
          'Cohort scheduling around shift work',
          'Readiness reporting for leadership',
        ],
      },
      {
        role: 'Universities & vocational colleges',
        headline: 'Graduate employability, aligned to the national English mandate.',
        body: 'For deans and programme directors improving graduate readiness, we license a CEFR-aligned business-English pathway with examiner-built assessment.',
        signals: [
          'Employability-focused speaking & writing',
          'Examiner-built assessment and progression',
          'Curriculum or white-label licensing',
          'Aligned to the MOET ESL-2035 direction',
        ],
      },
      {
        role: 'English centres (white-label)',
        headline: 'Add an AI-assisted business-English track you don\'t have to build.',
        body: 'For owners and academic directors who want a corporate track without building it, we enable — not compete — with content, method, and assessment you can deliver under your own brand.',
        signals: [
          'Ready business & technical English content',
          'AI speaking practice layer',
          'Examiner-grade assessment framework',
          'Partner enablement, not competition',
        ],
      },
    ],
  },

  approach: {
    eyebrow: 'How it works',
    title: 'Measured outcomes, not hours.',
    body: 'A blended program: human coaching for the outcome employers pay for, plus AI speaking practice so busy engineers improve between sessions. Every engagement starts with a CEFR/IELTS-aligned placement and ends with a measured readiness score.',
    steps: [
      {
        number: '01',
        title: 'Placement',
        body: 'We assess one team with a CEFR/IELTS-aligned placement test — a clear starting score for every engineer.',
      },
      {
        number: '02',
        title: 'Coached practice',
        body: 'Focused live sessions on real work — client calls, standups, code review, email and docs — with AI speaking practice between sessions.',
      },
      {
        number: '03',
        title: 'Measured readiness',
        body: 'We re-test and report the measured CEFR gain and a team readiness score managers can act on — and a plan to scale if the results earn it.',
      },
    ],
  },

  proof: {
    eyebrow: 'Why Jurassic English',
    title: 'Examiner-built method. Accredited, not a generic app.',
    body: 'Our credibility is the moat: a program built and graded by IELTS professionals, aligned to CEFR, and focused on your actual work — not textbook English. We report what changed and price on results.',
    items: [
      { label: 'IELTS-examiner-built', detail: 'Curriculum and grading by IELTS professionals' },
      { label: 'CEFR-aligned', detail: 'Placement and progress on the public CEFR/IELTS criteria' },
      { label: 'Business & technical', detail: 'Client calls, standups, code review, docs, presentations' },
      { label: 'Outcome-first', detail: 'Measured CEFR gain per cohort; manager dashboard' },
    ],
  },

  cta: {
    eyebrow: 'Start with one team',
    title: 'Book a scoping call.',
    body: 'We\'ll assess one team and scope a 6-week pilot with measured outcomes. Pilot fee and per-seat pricing are quoted after a short scoping call, based on team size and goals.',
    primaryCta: 'Book a scoping call',
    secondaryCta: 'See the 6-week pilot',
    note: 'B2B corporate & technical English training and software — delivered to employers, universities, and training partners. Pricing on enquiry, anchored on measured CEFR/IELTS outcomes.',
  },
} as const;

import type { Locale } from '../locales';

// Vietnamese content will be added before /vi/companies is released.
export function getCompaniesPageContent(_locale: Locale = 'en') {
  return companiesPageContent;
}

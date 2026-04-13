export const cefrAlignmentPageContent = {
  hero: {
    backCta: 'Back to main site',
    eyebrow: 'Standards Architecture',
    title: 'Standards alignment is not a badge. It is a documented architectural decision.',
    body: 'Any programme can label its levels A1 through C1. Genuine CEFR alignment requires that the curriculum is structurally built around communicative competence progression — and that the evidence for that alignment can be audited, documented, and defended to a procurement committee.',
    primaryCta: 'Request an Audit Sprint',
    secondaryCta: 'Book a Discovery Call',
    badge: 'CEFR · CEFR-V · MOET 2030',
  },

  problem: {
    eyebrow: 'The Alignment Gap',
    title: 'Most programmes claim CEFR alignment. Far fewer can demonstrate it.',
    body: 'The difference between claimed and structural alignment is the difference between a marketing statement and a defensible curriculum architecture. Procurement committees, accreditation bodies, and government regulators are increasingly able to tell them apart.',
    modes: [
      {
        title: 'Label Alignment vs. Structural Alignment',
        body: 'Labelling a coursebook unit "B1" without mapping the tasks, assessment criteria, and progression logic to B1 communicative competence descriptors is decoration, not architecture. CEFR levels are descriptions of learner capability — not headings for textbook chapters.',
      },
      {
        title: 'Grammar-First vs. Competence-First',
        body: 'CEFR is a framework for communicative competence — what a learner can do with language — not a grammar syllabus with level labels. Programmes that organise progression around tense sequences and vocabulary lists while calling it CEFR-aligned have misread the framework.',
      },
      {
        title: 'International Standards vs. Local Requirements',
        body: 'CEFR alignment is necessary but insufficient in Vietnam. CEFR-V and the MOET 2030 National English Language Programme introduce specific institutional obligations — progression targets, teacher qualification standards, and compliance documentation requirements — that generic CEFR maps do not address.',
      },
    ],
  },

  cefrFramework: {
    eyebrow: 'What CEFR Actually Requires',
    title: 'Communicative competence, not linguistic inventory.',
    body: 'The Common European Framework of Reference for Languages describes what learners can do with language across five domains: reading, listening, spoken interaction, spoken production, and writing. Progression through CEFR levels is a progression in communicative capability and cognitive complexity — not simply in vocabulary range or grammatical accuracy.',
    pillars: [
      {
        domain: 'Reading',
        descriptor: 'Ability to understand and critically process written texts of increasing complexity, authorial intent, and argumentative structure.',
        howAddressed: 'The Analyze stage of the Thinking Cycle directly develops CEFR reading competence — not just comprehension, but interrogation of how and why a text is constructed.',
      },
      {
        domain: 'Spoken Interaction',
        descriptor: 'Ability to engage in structured academic dialogue — building on another\'s argument, challenging positions with evidence, and defending a reasoned stance.',
        howAddressed: 'Socratic seminar and structured debate protocols are embedded from Level 2 onward, developing the spontaneity and precision that higher CEFR levels require.',
      },
      {
        domain: 'Writing',
        descriptor: 'Ability to produce organised, evidence-based written argument — moving from simple justification sentences at A1 to research-quality extended essays at C1.',
        howAddressed: 'The Justify stage produces structured academic writing at every level. The CEIW framework (Claim, Evidence, Interpretation, Warrant) scaffolds progression from single sentence to multi-paragraph to extended essay.',
      },
    ],
    note: 'The Jurassic English™ curriculum is built around CEFR CAN-DO descriptors at every level — not retrofitted to them after design.',
  },

  vietnam: {
    eyebrow: 'The Vietnam Standards Context',
    title: 'CEFR-V and MOET 2030 create institutional obligations that international CEFR maps do not cover.',
    body: 'For schools, training centres, and institutional partners operating in Vietnam, standards compliance extends beyond general CEFR alignment. Two frameworks define the regulatory and procurement landscape.',
    frameworks: [
      {
        label: 'CEFR-V',
        fullName: 'Vietnam Language Competency Framework (Khung năng lực ngoại ngữ 6 bậc)',
        detail: 'The official Vietnamese adaptation of CEFR, issued under Ministry of Education and Training Decision 01/2014/TT-BGDĐT. Six aligned levels from pre-A1 through C2. All public school English programmes are required to demonstrate CEFR-V alignment — not general CEFR alignment.',
        implication: 'Curriculum documentation submitted for institutional review or accreditation must reference CEFR-V descriptors specifically.',
      },
      {
        label: 'MOET 2030',
        fullName: 'National English Language Education Project 2017–2030',
        detail: 'The national programme requiring Vietnamese students to reach defined CEFR-V benchmarks by graduation. School graduates: minimum B1. University graduates: minimum B2. Teachers: minimum B2 (primary), C1 (secondary). Institutional programmes must demonstrate a credible pathway to these targets.',
        implication: 'Procurement committees at compliant institutions are now required to assess whether partner curricula can document progress toward MOET 2030 targets.',
      },
    ],
    worldwiseNote: 'WorldWise Learning\'s institutional curriculum is mapped to both CEFR-V and MOET 2030 targets. The Audit Sprint produces standards documentation formatted specifically for institutional review under these frameworks.',
  },

  progressionMap: {
    eyebrow: 'Curriculum Progression Map',
    title: 'Pre-A1 through C1. Five levels. One coherent architecture.',
    body: 'Every Jurassic English™ level is mapped to CEFR communicative competence descriptors. Progression is determined by reasoning demand and text complexity — not simply vocabulary load or grammar scope.',
    levels: [
      {
        number: '01',
        title: 'Foundation',
        cefrRange: 'Pre-A1 → A1',
        ageBand: 'Ages 4–8',
        path: '/series/level-1-foundation',
        descriptors: [
          'First justification writing: Claim + Evidence sentence structure',
          'Text interrogation through guided Analyze stage',
          'Moral reasoning about character choices in picture books',
          'Oral response using CEFR A1 spoken interaction frames',
        ],
        tag: 'Level 1',
      },
      {
        number: '02',
        title: 'Development',
        cefrRange: 'A1 → A2',
        ageBand: 'Ages 8–10',
        path: '/series/level-2-development',
        descriptors: [
          'Point-Evidence-Comment paragraph structure introduced',
          'Evaluate stage: assessing argument quality in early chapter books',
          'Socratic dialogue protocols at A2 spoken interaction level',
          'Written justification responses across core text set',
        ],
        tag: 'Level 2',
      },
      {
        number: '03',
        title: 'Expansion',
        cefrRange: 'A2 → B1',
        ageBand: 'Ages 10–12',
        path: '/series/level-3-expansion',
        descriptors: [
          'The Literacy Pivot: transition to complex chapter book analysis',
          'CEIW writing structure: Claim, Evidence, Interpretation, Warrant',
          'B1 reading competence: identifying implicit meaning and authorial intent',
          'Structured academic debate at B1 spoken production level',
        ],
        tag: 'Level 3',
      },
      {
        number: '04',
        title: 'Mastery',
        cefrRange: 'B1 → B2',
        ageBand: 'Ages 12–14',
        path: '/series/level-4-mastery',
        descriptors: [
          'Novel analysis: contested texts with multiple interpretive positions',
          'Multi-paragraph academic essay to B2 written production standards',
          'Formal debate: position construction, rebuttal, cross-examination',
          'B2 reading: nuanced comprehension of abstract and contested argument',
        ],
        tag: 'Level 4',
      },
      {
        number: '05',
        title: 'Advanced',
        cefrRange: 'B2 → C1',
        ageBand: 'Ages 14+',
        path: '/series/level-5-advanced',
        descriptors: [
          'Intertextual analysis: comparative reading across literary and critical texts',
          'Research essay to C1 extended writing standards',
          'IB Language A and Cambridge Literature preparation pathway',
          'C1 spoken: sustained academic argument with precision and register control',
        ],
        tag: 'Level 5',
      },
    ],
  },

  institutions: {
    eyebrow: 'For Institutional Leaders',
    title: 'Standards alignment serves different institutional needs depending on your role.',
    body: 'The WorldWise Learning curriculum and Audit Sprint are designed to produce documentation that is useful to the people who have to defend programme quality — not just describe it.',
    cards: [
      {
        role: 'SME Centre Owners',
        headline: 'Documented alignment turns a positioning claim into a defensible competitive advantage.',
        body: 'Parents and institutional clients increasingly ask for evidence of standards alignment — not just CEFR level labels. A programme that can produce documented CEFR-V alignment and a MOET 2030 progression pathway is positioned differently from one that cannot.',
        signals: [
          'CEFR-V alignment documentation for institutional marketing',
          'Progression evidence for parent and client enquiries',
          'Differentiation from test-prep category competitors',
          'Audit Sprint produces the documentation from your existing programme',
        ],
      },
      {
        role: 'School Leaders and Principals',
        headline: 'Accreditation-ready standards documentation for committee and regulatory review.',
        body: 'Whether your school is preparing for CEFR-V compliance under MOET 2030, applying for Cambridge or IB accreditation, or entering an internal programme review cycle, the evidence base required is the same: documented curriculum architecture, aligned to named standards, with a defensible progression logic.',
        signals: [
          'CEFR-V and MOET 2030 compliance documentation pathway',
          'Cambridge and IB alignment mapping',
          'Committee-formatted gap analysis and standards report',
          'WorldWise Learning partnership includes ongoing compliance support',
        ],
      },
      {
        role: 'Academic Directors',
        headline: 'A shared standards framework that governs what happens across every classroom.',
        body: 'Academic governance depends on having a curriculum framework that teachers can be measured against — not just a set of materials. CEFR-V alignment embedded in the curriculum architecture gives academic directors an auditable standard against which teacher practice and programme delivery can be assessed.',
        signals: [
          'Teacher practice alignment to CEFR-V competence descriptors',
          'Multi-level progression coherence across your full programme',
          'Assessment and moderation framework aligned to CEFR standards',
          'Audit Sprint outputs formatted for academic committee review',
        ],
      },
    ],
  },

  cta: {
    eyebrow: 'Start with the Standards Conversation',
    title: 'Know where your programme stands against the standards that matter.',
    body: 'The Curriculum Coherence Audit Sprint is the most direct route to understanding your programme\'s current alignment posture — and what a documented pathway to CEFR-V and MOET 2030 compliance looks like in your specific institutional context.',
    primaryCta: 'Request an Audit Sprint',
    discoveryCta: 'Book a Discovery Call instead',
    overviewCta: 'Request a Curriculum Overview',
    note: 'The Audit Sprint produces three formal documents: a Curriculum Gap Analysis, a Standards Alignment Map, and an Implementation Roadmap — all formatted for institutional review. Pricing is provided on enquiry based on institution size and programme scope.',
  },
} as const;

import type { Locale } from '../locales';

// Vietnamese content will be added before /vi/cefr-alignment is released.
export function getCefrAlignmentPageContent(_locale: Locale = 'en') {
  return cefrAlignmentPageContent;
}

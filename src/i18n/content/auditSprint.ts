export const auditSprintPageContent = {
  hero: {
    backCta: 'Back to main site',
    eyebrow: 'Institutional Entry Point',
    title: 'The Curriculum Coherence Audit Sprint.',
    body: 'A structured 10-business-day diagnostic of your current English programme — curriculum alignment, teacher practice, materials quality, and progression logic — delivered as a formal gap analysis with a clear implementation roadmap.',
    primaryCta: 'Request Your Audit Sprint',
    secondaryCta: 'Book a Discovery Call',
    badge: '10 Business Days',
  },

  problem: {
    eyebrow: 'Why Programmes Underperform',
    title: 'Most English programmes are not failing because of effort. They are failing because of architecture.',
    body: 'Capable teachers, reasonable materials, and genuine commitment are not enough when the underlying programme lacks coherence. Without a structured review, the same gaps recur year after year.',
    modes: [
      {
        title: 'Standards Drift',
        body: 'Programmes that were once CEFR-aligned gradually drift as materials are swapped, teachers change, and institutional memory erodes. Alignment becomes assumed rather than verified.',
      },
      {
        title: 'Inconsistent Delivery',
        body: 'When curriculum design lives inside individual teachers rather than in a shared framework, quality depends entirely on who is in the room. That is not a scalable or auditable model.',
      },
      {
        title: 'Invisible Progression Gaps',
        body: 'Students plateau not because they lack ability, but because the programme has no coherent progression logic — no structured movement from comprehension to reasoning to justification.',
      },
    ],
  },

  audiences: {
    eyebrow: 'Who This Is For',
    title: 'Built for the people responsible for programme quality.',
    body: 'The Audit Sprint is designed for institutional leaders who need evidence, not opinions — and a clear picture of what the right next step looks like.',
    cards: [
      {
        role: 'SME Centre Owners',
        headline: 'Know exactly where your programme stands — and what it would take to differentiate it.',
        body: 'If your centre competes on price rather than method, an Audit Sprint gives you the evidence to justify a repositioning. You leave with a documented picture of your programme\'s current state and a concrete pathway to standards alignment.',
        signals: [
          'Clear gap analysis against CEFR progression',
          'Materials and methodology quality review',
          'Differentiation roadmap from category sameness',
          'Pilot conversion pathway included',
        ],
      },
      {
        role: 'Academic Directors',
        headline: 'A structured external review of what is actually happening in your classrooms.',
        body: 'Internal reviews are limited by institutional familiarity. An Audit Sprint brings structured external analysis — examining what your curriculum requires, what your teachers deliver, and where the distance between those two things is creating quality risk.',
        signals: [
          'Teacher practice alignment review',
          'Assessment and moderation architecture audit',
          'Multi-level progression coherence check',
          'Report formatted for committee and board review',
        ],
      },
      {
        role: 'School Leaders & Principals',
        headline: 'Accreditation-ready documentation of your current English curriculum posture.',
        body: 'Whether you are preparing for CEFR-V compliance, an international accreditation cycle, or simply strengthening your programme ahead of enrolment season, the Audit Sprint produces documentation that holds up to external scrutiny.',
        signals: [
          'CEFR-V and MOET 2030 standards alignment mapping',
          'Formal gap analysis report for committee review',
          'Implementation roadmap scoped to institutional timeline',
          'WorldWise Learning partnership pathway on completion',
        ],
      },
    ],
  },

  deliverables: {
    eyebrow: 'What You Receive',
    title: 'Three formal documents. One clear picture.',
    body: 'The Audit Sprint produces three structured outputs, delivered at the end of the engagement. Each document is formatted for institutional review and decision-making — not for internal use only.',
    items: [
      {
        number: '01',
        title: 'Curriculum Gap Analysis Report',
        body: 'A structured assessment of your current programme against CEFR and MOET 2030 benchmarks. Covers curriculum design, materials quality, standards coverage, and progression coherence. Presented as a formal written report.',
        tag: 'Primary Deliverable',
      },
      {
        number: '02',
        title: 'Standards Alignment Map',
        body: 'A visual and tabular mapping of your current curriculum against CEFR-V levels and WorldWise Learning framework benchmarks. Identifies alignment gaps, coverage overlaps, and progression sequence risks.',
        tag: 'Included',
      },
      {
        number: '03',
        title: 'Implementation Roadmap',
        body: 'A sequenced pathway from your current programme state to WorldWise Learning alignment. Scoped to your institution\'s size, staffing, timeline, and budget constraints. Includes pilot structure and conversion logic.',
        tag: 'Included',
      },
    ],
  },

  process: {
    eyebrow: 'The Process',
    title: 'Structured. Scoped. Delivered in 10 business days.',
    body: 'The Audit Sprint follows a fixed three-phase process. Scope is agreed before any work begins. You will not receive an open-ended engagement or a vague discovery call — this is a defined professional service.',
    steps: [
      {
        number: '01',
        duration: 'Days 1–3',
        title: 'Programme Intake & Materials Review',
        body: 'You submit your curriculum materials, lesson samples, assessment structures, and any existing standards documentation. Our team reviews these against the WorldWise Learning framework and CEFR-V benchmarks before live contact begins.',
      },
      {
        number: '02',
        duration: 'Days 4–7',
        title: 'Structured Review Sessions',
        body: 'Two to three structured sessions with your academic lead and relevant teachers. Each session follows a fixed review protocol — we are auditing the programme, not conducting an informal chat. Sessions are recorded for documentation purposes.',
      },
      {
        number: '03',
        duration: 'Days 8–10',
        title: 'Report Delivery & Debrief',
        body: 'All three documents are delivered in writing before the final debrief session. The debrief covers key findings, priority recommendations, and the implementation roadmap. No upsell pressure — the report stands on its own.',
      },
    ],
  },

  standards: {
    eyebrow: 'Standards Alignment',
    title: 'Reviewed against the frameworks that matter in 2026.',
    body: 'The Audit Sprint uses the WorldWise Learning framework as its primary benchmark — which is itself built for alignment with the standards that institutional procurement committees, accreditation bodies, and government regulators currently apply.',
    items: [
      { label: 'CEFR-V', detail: 'Vietnam Ministry of Education 2030 adaptation' },
      { label: 'MOET 2030', detail: 'National English competency framework' },
      { label: 'Cambridge & IB', detail: 'International accreditation pathway mapping' },
      { label: 'UNESCO ESD', detail: 'Ecological and social learning strand' },
      { label: 'iPGCE/PGCE', detail: 'Teacher qualification standard' },
    ],
  },

  cta: {
    eyebrow: 'Start Here',
    title: 'Request your Audit Sprint.',
    body: 'Submit your enquiry and a member of the WorldWise Learning team will respond within two business days. We will confirm scope, timeline, and any pre-submission materials before work begins.',
    primaryCta: 'Request Your Audit Sprint',
    secondaryCta: 'Book a Discovery Call',
    pilotCta: 'View the Pilot Programme',
    note: 'The Audit Sprint is a fixed-scope professional service. Pricing is provided on enquiry based on institution size and programme complexity. All responses are handled directly by the WorldWise Learning academic team.',
  },
} as const;

import type { Locale } from '../locales';

// Vietnamese content will be added before /vi/audit-sprint is released.
export function getAuditSprintPageContent(_locale: Locale = 'en') {
  return auditSprintPageContent;
}

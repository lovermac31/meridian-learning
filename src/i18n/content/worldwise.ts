export const worldwisePageContent = {
  hero: {
    backCta: 'Back to main site',
    eyebrow: 'Institutional Curriculum Architecture',
    title: 'The Curriculum OS for English Education Institutions.',
    body: 'WorldWise Learning provides the structural foundation that makes high-quality English instruction consistent, scalable, and auditable — for schools, training centres, and institutional partners.',
    primaryCta: 'Request an Audit Sprint',
    secondaryCta: 'Book a Discovery Call',
  },
  proposition: {
    eyebrow: 'What WorldWise Learning Provides',
    title: 'Curriculum infrastructure, not just content.',
    body: 'Most English programmes have capable teachers and reasonable materials. What they lack is architecture: a coherent system that connects standards, lesson design, assessment, and progression into something that can be reviewed, governed, and scaled.',
    pillars: [
      {
        title: 'Standards-Native Alignment',
        body: 'CEFR-V and MOET 2030 compliance mapping, curriculum-to-standard gap analysis, and assessment architecture review — built for institutional procurement cycles.',
      },
      {
        title: 'Methodology Governance',
        body: 'The Jurassic Thinking Cycle™ implementation framework, iPGCE-qualified teacher standards, and moderation structures that make quality reproducible across classrooms.',
      },
      {
        title: 'Implementation Architecture',
        body: 'Scope, sequence, and progression design from entry audit through to full programme deployment. Licensing and long-term partnership structures built for institutional scale.',
      },
    ],
  },
  audiences: {
    eyebrow: 'Designed for Institutional Buyers',
    title: 'Three lanes. One framework.',
    body: 'WorldWise Learning serves different roles in an institution\'s decision-making hierarchy. Each entry point is supported by a structured pathway.',
    cards: [
      {
        role: 'School Leaders & Principals',
        headline: 'Accreditation-ready curriculum architecture.',
        body: 'WorldWise Learning supports school principals navigating CEFR-V compliance, Cambridge or IB accreditation, and international school positioning. We provide formal proposals, standards mapping, and implementation pathways designed for institutional review committees.',
        signals: [
          'CEFR-V and MOET 2030 alignment documentation',
          'iPGCE/PGCE teacher qualification standard',
          'Formal curriculum proposals for review committees',
          'Long-term programme licensing and governance',
        ],
      },
      {
        role: 'Academic Directors',
        headline: 'Consistent quality across every classroom.',
        body: 'Managing curriculum consistency across multiple teachers, levels, and campuses is the defining challenge for academic directors. WorldWise Learning provides the governance layer — methodology standards, teacher training architecture, and assessment moderation — that makes quality reproducible at scale.',
        signals: [
          'Multi-campus methodology consistency framework',
          'Teacher development and fidelity standards',
          'Assessment moderation and progression review',
          'Bi-weekly feedback sprints during implementation',
        ],
      },
      {
        role: 'SME Centre Owners',
        headline: 'Stop reinventing your curriculum every year.',
        body: 'English centres that rely on ad hoc materials and individual teacher creativity cannot scale or differentiate. WorldWise Learning provides a curriculum framework you can deploy, train to, and stand behind as a genuine market differentiator — from a position of methodology, not price.',
        signals: [
          'Curriculum Coherence Audit as a low-friction entry point',
          'Ready-to-deploy standards-aligned curriculum framework',
          'Methodology that solves "category sameness"',
          'Pilot-first implementation with clear conversion logic',
        ],
      },
    ],
  },
  process: {
    eyebrow: 'How It Works',
    title: 'From audit to implementation.',
    body: 'Every WorldWise Learning engagement begins with a structured review — not a sales call. We need to understand your programme before recommending a pathway.',
    steps: [
      {
        number: '01',
        title: 'Curriculum Coherence Audit',
        body: 'A structured review of your current programme: standards alignment, teacher practices, materials quality, and progression logic. Delivered as a formal gap analysis report.',
      },
      {
        number: '02',
        title: 'Report & Roadmap',
        body: 'A clear picture of what is working, what needs restructuring, and what a WorldWise Learning partnership would look like — scoped to your institution\'s size, goals, and timeline.',
      },
      {
        number: '03',
        title: 'Implementation & Partnership',
        body: 'From pilot cohort to full programme deployment. Teacher training, methodology moderation, assessment design, and ongoing review built in from the start.',
      },
    ],
  },
  methodology: {
    eyebrow: 'Powered by Jurassic English™',
    title: 'Built on the Jurassic Thinking Cycle™.',
    body: 'Every WorldWise Learning programme is anchored in the Jurassic English™ methodology — the Thinking Cycle, authentic unabridged literature, and the four non-negotiables of classroom instruction. Methodology is the product. Everything else follows from it.',
    frameworkCta: 'View the full framework',
    thinkingCycleCta: 'Explore the Thinking Cycle',
  },
  cta: {
    eyebrow: 'Start the Conversation',
    title: 'The entry point is always a curriculum review.',
    body: 'We do not begin with pricing. We begin with understanding your programme. The Curriculum Coherence Audit is the fastest way to establish where you are and what the right next step looks like.',
    primaryCta: 'Request an Audit Sprint',
    secondaryCta: 'Book a Discovery Call',
    pilotCta: 'View the Pilot Programme',
    overviewCta: 'Request a Curriculum Overview',
    note: 'All enquiries are reviewed by the WorldWise Learning team. We typically respond within two business days.',
  },
} as const;

import type { Locale } from '../locales';

// Vietnamese content will be added before /vi/worldwise is released.
export function getWorldWisePageContent(_locale: Locale = 'en') {
  return worldwisePageContent;
}

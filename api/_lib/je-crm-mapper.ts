/**
 * JE CRM Mapping Engine
 * Source of truth: JE-BT-MAOI-Alignment-2026
 *
 * Implements alignment classification, service catalogue, CTA mapping,
 * CRM tag generation, and structured context building for every
 * Plans & Pricing intake submission.
 */

// ─── Canonical Keys ───────────────────────────────────────────────────────────

export const BT = {
  ADMIN:   'school_admin',
  TEACHER: 'teacher_cpd_lead',
  PARENT:  'parent_guardian',
  PARTNER: 'institutional_partner',
  OTHER:   'other',
} as const;

export const MAOI = {
  TT:  'teacher_training',
  SL:  'school_licensing',
  CR:  'curriculum_review',
  AC:  'academic_consulting',
  IP:  'institutional_partnerships',
  DRE: 'digital_reasoning_engine',
} as const;

export type BuyerTypeKey = typeof BT[keyof typeof BT];
export type MaoiKey = typeof MAOI[keyof typeof MAOI];
export type AlignmentStatus = 'primary' | 'secondary' | 'context_dependent' | 'manual_review';

export type LeadStatus =
  | 'New'
  | 'Reviewed'
  | 'Awaiting Discovery Call'
  | 'Access Sent'
  | 'Qualified'
  | 'Proposal Pending';

// ─── Label Maps ───────────────────────────────────────────────────────────────

export const BT_LABELS: Record<BuyerTypeKey, string> = {
  school_admin:          'School Administrator / Academic Director',
  teacher_cpd_lead:      'Teacher / CPD Lead',
  parent_guardian:       'Parent / Guardian',
  institutional_partner: 'Institutional Partner',
  other:                 'Other',
};

export const MAOI_LABELS: Record<MaoiKey, string> = {
  teacher_training:          'Teacher Training',
  school_licensing:          'School Licensing',
  curriculum_review:         'Curriculum Review',
  academic_consulting:       'Academic Consulting',
  institutional_partnerships:'Institutional Partnerships',
  digital_reasoning_engine:  'Digital Reasoning Engine',
};

// ─── Alignment Map ────────────────────────────────────────────────────────────

const ALIGNMENT_MAP: Record<BuyerTypeKey, { primary: MaoiKey[]; secondary: MaoiKey[] }> = {
  school_admin: {
    primary:   ['school_licensing', 'academic_consulting', 'curriculum_review'],
    secondary: ['teacher_training', 'digital_reasoning_engine', 'institutional_partnerships'],
  },
  teacher_cpd_lead: {
    primary:   ['teacher_training'],
    secondary: ['curriculum_review', 'digital_reasoning_engine'],
  },
  parent_guardian: {
    primary:   ['digital_reasoning_engine'],
    secondary: ['school_licensing', 'curriculum_review'],
  },
  institutional_partner: {
    primary:   ['institutional_partnerships', 'academic_consulting'],
    secondary: ['teacher_training', 'digital_reasoning_engine', 'school_licensing', 'curriculum_review'],
  },
  other: {
    primary:   ['teacher_training', 'curriculum_review', 'academic_consulting'],
    secondary: ['institutional_partnerships', 'digital_reasoning_engine', 'school_licensing'],
  },
};

// ─── Service Catalogue ────────────────────────────────────────────────────────

type TrainingModule = { name: string; format: string; perEd: string; perGroup: string };
type LicensingModule = { name: string; price: string };
type ReviewModule    = { name: string; scope: string; price: string };
type ConsultingModule= { name: string; scope: string; price: string };
type PartnerModule   = { name: string; scope: string; price: string };
type DreModule       = { name: string; price: string; discount: string };

type ServiceEntry =
  | { label: string; modules: TrainingModule[];  rangeSummary: string; note: string }
  | { label: string; modules: LicensingModule[]; rangeSummary: string; note: string }
  | { label: string; modules: ReviewModule[];    rangeSummary: string; note: string }
  | { label: string; modules: ConsultingModule[];rangeSummary: string; note: string }
  | { label: string; modules: PartnerModule[];   rangeSummary: string; note: string }
  | { label: string; modules: DreModule[];       rangeSummary: string; note: string };

export const SERVICE_CATALOGUE: Record<MaoiKey, ServiceEntry> = {
  teacher_training: {
    label: 'Teacher Training',
    modules: [
      { name: 'Framework Onboarding',               format: '1 day',     perEd: '$350',   perGroup: '$2,800–$4,200' },
      { name: 'Thinking Cycle™ Facilitation',       format: '1.5 days',  perEd: '$480',   perGroup: '$3,500–$5,500' },
      { name: 'Regulation-Before-Reasoning',        format: '0.5 day',   perEd: '$220',   perGroup: '$1,500–$2,200' },
      { name: 'CEIW Writing & Feedback',            format: '1.5 days',  perEd: '$520',   perGroup: '$3,800–$5,800' },
      { name: 'Annual Refresher / Calibration',     format: '0.5 day',   perEd: '$150',   perGroup: '$900–$1,400'   },
      { name: 'Apex: Train-the-Trainer Cert.',      format: '3 days',    perEd: '$1,200', perGroup: '$8,500–$14,000'},
    ] as TrainingModule[],
    rangeSummary: '$150–$1,200/educator  |  $900–$14,000/group',
    note: 'Certification aligned to iPGCE/PGCE CPD standards. Group rates for 8–12 educators.',
  },
  school_licensing: {
    label: 'School Licensing (Annual)',
    modules: [
      { name: 'Foundation / up to 150',       price: '$2,500/yr'   },
      { name: 'Foundation / 151–400',         price: '$3,500/yr'   },
      { name: 'Foundation / 401–800',         price: '$4,500/yr'   },
      { name: 'Foundation / 801–1,500',       price: '$6,000/yr'   },
      { name: 'Intermediate / up to 150',     price: '$3,500/yr'   },
      { name: 'Intermediate / 151–400',       price: '$5,000/yr'   },
      { name: 'Intermediate / 401–800',       price: '$6,500/yr'   },
      { name: 'Intermediate / 801–1,500',     price: '$8,500/yr'   },
      { name: 'Advanced / up to 150',         price: '$5,000/yr'   },
      { name: 'Advanced / 151–400',           price: '$7,000/yr'   },
      { name: 'Advanced / 401–800',           price: '$9,000/yr'   },
      { name: 'Advanced / 801–1,500',         price: '$11,000/yr'  },
      { name: 'Full School / up to 150',      price: '$8,500/yr'   },
      { name: 'Full School / 151–400',        price: '$12,000/yr'  },
      { name: 'Full School / 401–800',        price: '$16,500/yr'  },
      { name: 'Full School / 801–1,500',      price: '$21,000/yr'  },
      { name: 'Multi-campus / 1,500+',        price: 'Bespoke proposal' },
    ] as LicensingModule[],
    rangeSummary: '$2,500–$21,000/year (by school size and tier)',
    note: 'Includes WWL quality assurance governance, CEFR/IB/Cambridge compliance reporting, and DRE Read-Only access.',
  },
  curriculum_review: {
    label: 'Curriculum Review',
    modules: [
      { name: 'CEFR Alignment Audit',      scope: '3–5 days',    price: '$2,500–$5,000'  },
      { name: 'Full Curriculum Review',    scope: '1–2 weeks',   price: '$5,000–$12,000' },
      { name: 'Implementation Strategy',   scope: '2–4 weeks',   price: '$8,000–$18,000' },
      { name: 'Follow-up Consultation',    scope: '2 hours',     price: 'Optional add-on'},
    ] as ReviewModule[],
    rangeSummary: '$2,500–$12,000 (scope-dependent)',
    note: 'Engagements are scoped after an initial Discovery Call and Resource Allocation Audit.',
  },
  academic_consulting: {
    label: 'Academic Consulting',
    modules: [
      { name: 'Implementation Strategy',       scope: '2–4 weeks', price: '$8,000–$18,000'        },
      { name: 'Standards Rollout Consulting',  scope: 'Monthly',   price: '$3,500–$7,000/month'    },
      { name: 'Multi-Campus Governance',       scope: 'Bespoke',   price: '$6,000–$15,000+'        },
      { name: 'CEFR Alignment Audit',          scope: '3–5 days',  price: '$2,500–$5,000'          },
    ] as ConsultingModule[],
    rangeSummary: '$8,000–$18,000 fixed  |  $3,500–$7,000/month retainer',
    note: 'Bespoke engagements. Formal proposal issued after Discovery Call.',
  },
  institutional_partnerships: {
    label: 'Institutional Partnerships',
    modules: [
      { name: 'Partnership Agreement',                scope: 'Bespoke', price: 'Revenue share / flat annual / in-kind' },
      { name: 'Co-branded Materials Package',         scope: 'Included', price: 'Within partnership scope'             },
      { name: 'Multi-Campus Governance Design',       scope: 'Bespoke', price: '$6,000–$15,000+'                       },
      { name: 'Joint QA Framework & Reporting',       scope: 'Annual',  price: 'Included in partnership agreement'     },
    ] as PartnerModule[],
    rangeSummary: 'Bespoke — revenue share / flat annual fee / in-kind exchange',
    note: 'Partnership scoping consultation is no-cost. Formal agreement follows scoping report.',
  },
  digital_reasoning_engine: {
    label: 'Digital Reasoning Engine (DRE)',
    modules: [
      { name: 'DRE Read-Only',       price: '$0',             discount: 'Included in all school licences'           },
      { name: 'DRE Standard',        price: '$18/student/yr', discount: '5% off 100+ students'                      },
      { name: 'DRE Advanced',        price: '$32/student/yr', discount: '8% off 200+  ·  12% off 500+'              },
      { name: 'DRE Institutional',   price: '$45/student/yr', discount: '15% off 300+  ·  Bespoke 1,000+'           },
    ] as DreModule[],
    rangeSummary: '$0–$45/student/year (by access tier)',
    note: 'DRE access is tiered by school licence. Standalone DRE access for unlicensed schools available on request.',
  },
};

// ─── CTA Map ──────────────────────────────────────────────────────────────────

export const CTA_MAP: Record<BuyerTypeKey, string> = {
  school_admin:
    'Book Discovery Call + Resource Allocation Audit (no cost, no obligation)',
  teacher_cpd_lead:
    'Enquire about training modules or pathway packages → Framework Onboarding through Train-the-Trainer',
  parent_guardian:
    'Ask your school whether they are JE-licensed, or contact WWL to find the nearest licensed academy / explore independent learner access',
  institutional_partner:
    'Request a no-cost Partnership Scoping Consultation → scoping report + bespoke agreement',
  other:
    'Submit enquiry → Discovery Call confirmed within 5 business days (no cost, no obligation)',
};

// ─── Engagement Process ───────────────────────────────────────────────────────

export const ENGAGEMENT_PROCESS = [
  'Receive and review Plans & Pricing registration',
  'Confirm buyer type and primary area of interest',
  'Schedule no-cost Discovery Call (30 min)',
  'Conduct Resource Allocation Audit (scoping)',
  'Issue formal proposal with phased pricing',
];

// ─── BT / MAOI 3-char codes for Registration ID ──────────────────────────────

const BT_CODES: Record<BuyerTypeKey, string> = {
  school_admin:          'SCH',
  teacher_cpd_lead:      'TCL',
  parent_guardian:       'PAR',
  institutional_partner: 'INS',
  other:                 'OTH',
};

const MAOI_CODES: Record<MaoiKey, string> = {
  teacher_training:           'TRT',
  school_licensing:           'SLI',
  curriculum_review:          'CRV',
  academic_consulting:        'ACN',
  institutional_partnerships: 'IPP',
  digital_reasoning_engine:   'DRE',
};

// ─── Core Functions ───────────────────────────────────────────────────────────

export function classifyAlignment(
  btKey: BuyerTypeKey,
  maoiKey: MaoiKey
): { status: AlignmentStatus; label: string } {
  if (btKey === 'other') {
    const entry = ALIGNMENT_MAP[btKey];
    if (entry.primary.includes(maoiKey)) return { status: 'primary', label: 'Primary' };
    return { status: 'context_dependent', label: 'Context-Dependent' };
  }

  const entry = ALIGNMENT_MAP[btKey];
  if (!entry) return { status: 'manual_review', label: 'Manual Review — Weak fit: confirm via Discovery Call' };

  if (entry.primary.includes(maoiKey)) return { status: 'primary', label: 'Primary' };
  if (entry.secondary.includes(maoiKey)) return { status: 'secondary', label: 'Secondary' };
  return { status: 'manual_review', label: 'Manual Review — Weak fit: confirm via Discovery Call' };
}

export function generateRegistrationId(btKey: BuyerTypeKey, maoiKey: MaoiKey): string {
  const bt   = BT_CODES[btKey]   ?? 'UNK';
  const maoi = MAOI_CODES[maoiKey] ?? 'UNK';
  const ts   = Date.now().toString(36).toUpperCase();
  return `JE-${bt}-${maoi}-${ts}`;
}

export function buildCrmTags(
  btKey: BuyerTypeKey,
  maoiKey: MaoiKey,
  alignment: { status: AlignmentStatus; label: string },
  registrationId: string,
  leadStatus: LeadStatus
): Record<string, string> {
  const service = SERVICE_CATALOGUE[maoiKey];
  return {
    buyer_type:      btKey,
    maoi:            maoiKey,
    alignment:       alignment.status,
    pricing_band:    service.rangeSummary,
    next_step:       CTA_MAP[btKey],
    registration_id: registrationId,
    lead_status:     leadStatus,
    source_ref:      'JE-BT-MAOI-Alignment-2026',
    submitted_at:    new Date().toISOString(),
  };
}

export type CrmContext = {
  registrationId: string;
  buyerType:       { key: BuyerTypeKey; label: string };
  maoi:            { key: MaoiKey; label: string };
  alignment:       { status: AlignmentStatus; label: string };
  service:         ServiceEntry;
  cta:             string;
  nextStep:        string;
  primaryMaois:    MaoiKey[];
  secondaryMaois:  MaoiKey[];
  crmTags:         Record<string, string>;
  sourceRef:       string;
  engagementProcess: string[];
};

export function map(
  btKey: BuyerTypeKey,
  maoiKey: MaoiKey,
  leadStatus: LeadStatus = 'New'
): CrmContext {
  const alignment     = classifyAlignment(btKey, maoiKey);
  const registrationId = generateRegistrationId(btKey, maoiKey);
  const service       = SERVICE_CATALOGUE[maoiKey];
  const cta           = CTA_MAP[btKey];
  const crmTags       = buildCrmTags(btKey, maoiKey, alignment, registrationId, leadStatus);
  const entry         = ALIGNMENT_MAP[btKey] ?? { primary: [], secondary: [] };

  return {
    registrationId,
    buyerType:  { key: btKey,   label: BT_LABELS[btKey]     },
    maoi:       { key: maoiKey, label: MAOI_LABELS[maoiKey] },
    alignment,
    service,
    cta,
    nextStep:   cta,
    primaryMaois:   entry.primary,
    secondaryMaois: entry.secondary,
    crmTags,
    sourceRef: 'JE-BT-MAOI-Alignment-2026',
    engagementProcess: ENGAGEMENT_PROCESS,
  };
}

// ─── Normalisers ──────────────────────────────────────────────────────────────

/**
 * Map form values and human-readable labels → canonical BT keys.
 * Handles both the schema's `school_administrator` key and the spec's `school_admin`.
 */
export function normaliseBuyerType(raw: string): BuyerTypeKey {
  const s = raw.toLowerCase().trim();

  if (s === 'school_admin' || s === 'school_administrator' || s.includes('school') || s.includes('admin') || s.includes('academic director')) {
    return 'school_admin';
  }
  if (s === 'teacher_cpd_lead' || s.includes('teacher') || s.includes('cpd')) {
    return 'teacher_cpd_lead';
  }
  if (s === 'parent_guardian' || s.includes('parent') || s.includes('guardian')) {
    return 'parent_guardian';
  }
  if (s === 'institutional_partner' || s.includes('institutional') || s.includes('partner')) {
    return 'institutional_partner';
  }
  return 'other';
}

/**
 * Map form values and human-readable labels → canonical MAOI keys.
 */
export function normaliseMAOI(raw: string): MaoiKey {
  const s = raw.toLowerCase().trim();

  if (s === 'teacher_training' || s.includes('teacher') && s.includes('train')) return 'teacher_training';
  if (s === 'school_licensing' || s.includes('licens')) return 'school_licensing';
  if (s === 'curriculum_review' || s.includes('curriculum')) return 'curriculum_review';
  if (s === 'academic_consulting' || s.includes('consult')) return 'academic_consulting';
  if (s === 'institutional_partnerships' || s.includes('partnership')) return 'institutional_partnerships';
  if (s === 'digital_reasoning_engine' || s.includes('digital') || s.includes('dre')) return 'digital_reasoning_engine';

  // Fallback: try exact key match
  const allMaoiKeys: MaoiKey[] = [
    'teacher_training', 'school_licensing', 'curriculum_review',
    'academic_consulting', 'institutional_partnerships', 'digital_reasoning_engine',
  ];
  if (allMaoiKeys.includes(s as MaoiKey)) return s as MaoiKey;

  return 'teacher_training';
}

// ─── Colour Palette (for email rendering) ────────────────────────────────────

export const COLOURS = {
  ink:    '#111120',
  orange: '#F57C00',
  blue:   '#1565C0',
  green:  '#1B5E20',
  purple: '#6A1B9A',
  red:    '#B71C1C',
  slate:  '#37474F',
  gold:   '#F9A825',
  mist:   '#F5F5F5',
  ltgray: '#EEEEEE',
  midgray:'#90A4AE',
  white:  '#FFFFFF',
};

export const BT_COLOURS: Record<BuyerTypeKey, string> = {
  school_admin:          COLOURS.blue,
  teacher_cpd_lead:      COLOURS.green,
  parent_guardian:       COLOURS.purple,
  institutional_partner: COLOURS.red,
  other:                 COLOURS.slate,
};

export const MAOI_COLOURS: Record<MaoiKey, string> = {
  teacher_training:           COLOURS.blue,
  school_licensing:           COLOURS.green,
  curriculum_review:          COLOURS.purple,
  academic_consulting:        COLOURS.orange,
  institutional_partnerships: COLOURS.red,
  digital_reasoning_engine:   COLOURS.slate,
};

export const ALIGNMENT_COLOURS: Record<AlignmentStatus, string> = {
  primary:           COLOURS.green,
  secondary:         COLOURS.blue,
  context_dependent: COLOURS.orange,
  manual_review:     COLOURS.red,
};

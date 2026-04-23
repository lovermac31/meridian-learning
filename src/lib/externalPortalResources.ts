export const externalPortalResourceKeys = [
  'pilot_overview_pack',
  'readiness_checklist',
  'executive_summary_sample',
  'consultation_prep',
] as const;

export type ExternalPortalResourceKey = (typeof externalPortalResourceKeys)[number];

export type ExternalPortalResource = {
  key: ExternalPortalResourceKey;
  title: string;
  eyebrow: string;
  summary: string;
  sections: string[];
};

export const externalPortalResources: Record<ExternalPortalResourceKey, ExternalPortalResource> = {
  pilot_overview_pack: {
    key: 'pilot_overview_pack',
    eyebrow: 'Pilot Overview Pack',
    title: 'Institutional pilot overview',
    summary:
      'A concise programme brief covering pilot purpose, structure, governance, measurement, support rhythm, and adoption decision logic.',
    sections: [
      'Pilot purpose and institutional fit',
      '6-8 week structure and decision gates',
      'Governance roles and review cadence',
      'Measurement categories and final recommendation format',
    ],
  },
  readiness_checklist: {
    key: 'readiness_checklist',
    eyebrow: 'Readiness Checklist',
    title: 'Pilot readiness checklist',
    summary:
      'A review checklist for confirming whether a school, academy, or training centre is ready to run a meaningful pilot.',
    sections: [
      'Named sponsor, academic lead, implementation lead, and teacher champion',
      'Protected timetable window and scoped learner cohort',
      'Baseline curriculum context and success measures',
      'Evidence collection owner and weekly review rhythm',
    ],
  },
  executive_summary_sample: {
    key: 'executive_summary_sample',
    eyebrow: 'Reporting Sample',
    title: 'Executive summary sample',
    summary:
      'A sample reporting structure showing how pilot evidence can be summarized for leadership, owners, or procurement review.',
    sections: [
      'Institution context and pilot scope',
      'KPI block: student, teacher, parent, and system outcomes',
      'Implementation observations and risk register',
      'Rollout recommendation and next-step pathway',
    ],
  },
  consultation_prep: {
    key: 'consultation_prep',
    eyebrow: 'Consultation Preparation',
    title: 'Pilot consultation preparation',
    summary:
      'A short preparation guide for institutions that need a discovery or pilot consultation before receiving deeper programme materials.',
    sections: [
      'Current curriculum challenge',
      'Learner group and standards context',
      'Teacher readiness and operational constraints',
      'Preferred decision timeline and approval stakeholders',
    ],
  },
};

export function getExternalPortalResources(scope: readonly string[]) {
  return scope
    .filter((key): key is ExternalPortalResourceKey =>
      (externalPortalResourceKeys as readonly string[]).includes(key),
    )
    .map((key) => externalPortalResources[key]);
}

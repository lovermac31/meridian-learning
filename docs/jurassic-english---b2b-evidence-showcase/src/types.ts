export interface AuditStep {
  id: number;
  q: string;
  desc: string;
  options: string[];
}

export interface KPI {
  label: string;
  score: number;
  color: string;
  desc: string;
}

export interface JourneyStep {
  title: string;
  week: string;
  desc: string;
  items: string[];
}

export interface QualifierCriterion {
  key: string;
  label: string;
  desc: string;
}

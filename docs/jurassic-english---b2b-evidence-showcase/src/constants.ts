import { AuditStep, KPI, JourneyStep, QualifierCriterion } from './types';

export const AUDIT_STEPS: AuditStep[] = [
  { 
    id: 1, 
    q: "Instruction Volume vs. Reasoning Quality", 
    desc: "Is there a measurable gap between your weekly English hours and student ability to form unscripted arguments?", 
    options: ["Significant Gap", "Moderate Gap", "Aligned", "Highly Advanced"] 
  },
  { 
    id: 2, 
    q: "Curriculum Methodology", 
    desc: "Does your current framework rely on simplified/graded readers or authentic literature?", 
    options: ["Graded/Abridged Only", "Mix of Both", "Authentic Literature", "Custom Internal"] 
  },
  { 
    id: 3, 
    q: "Teacher Planning Burden", 
    desc: "How many hours per week do your teachers spend on lesson preparation from scratch?", 
    options: ["10+ Hours", "5-10 Hours", "2-5 Hours", "Minimal/Automated"] 
  }
];

export const KPIS: KPI[] = [
  { label: "Student Reasoning Evidence", score: 85, color: "bg-emerald-500", desc: "Analysis of unscripted debate and justification." },
  { label: "Teacher Fidelity", score: 92, color: "bg-emerald-500", desc: "Protocol adherence in the classroom." },
  { label: "Progression Fit", score: 78, color: "bg-blue-500", desc: "Alignment with MOET/CEFR standards." },
  { label: "Operational Load", score: 88, color: "bg-emerald-500", desc: "Sustainable hours for admin and staff." },
  { label: "Stakeholder Confidence", score: 94, color: "bg-emerald-500", desc: "Parent and management feedback." },
  { label: "Commercial Readiness", score: 70, color: "bg-amber-500", desc: "Board-level cost/benefit alignment." },
];

export const JOURNEY_STEPS: JourneyStep[] = [
  { title: "Setup", week: "Week 1", desc: "Scope & Readiness, Teacher Orientation.", items: ["Named Sponsor Review", "Teacher Champion Onboarding", "Baseline Assessment"] },
  { title: "Guided Classroom", week: "Weeks 2-7", desc: "Evidence Capture & Real-time Tracking.", items: ["Fidelity Check-ins", "Thinking Cycle Integration", "Continuous Data Feed"] },
  { title: "Executive Review", week: "Week 8", desc: "The Deliverable Presentation.", items: ["Executive Summary Report", "Board Briefing", "Gap Closure Analysis"] },
  { title: "Decision Gate", week: "Post-Pilot", desc: "Commercial Pathway Selection.", items: ["MVP Rollout", "Scale Readiness", "Advisory Upgrade"] },
];

export const QUALIFIER_CRITERIA: QualifierCriterion[] = [
  { key: "sponsor", label: "Named Pilot Sponsor", desc: "A senior leader (Principal/Owner) committed to reviewing the final evidence report." },
  { key: "learners", label: "Defined Learner Group", desc: "A specific class or age cohort selected (e.g., Grade 5, B1 Level)." },
  { key: "timeline", label: "Protected Timeline", desc: "6-8 weeks of instruction space protected from competing pilot projects." },
  { key: "champion", label: "Teacher Champion", desc: "At least one lead teacher eager to adopt the Jurassic Thinking Cycle™." },
  { key: "intent", label: "Commercial Intent", desc: "Institution has defined budget/intent for rollout if evidence criteria are met." },
];

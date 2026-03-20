export const frameworkResearchDomains = [
  {
    title: 'Critical Thinking',
    description:
      'The framework embeds elements of thought and intellectual standards directly into questioning, discussion, and written reasoning.',
  },
  {
    title: 'Moral Development',
    description:
      'Ethical reasoning is treated as a staged capability, developed through dilemma analysis and justified judgment.',
  },
  {
    title: 'Disciplinary Literacy',
    description:
      'Literature is used as a disciplinary tool for reasoning rather than as a source of language practice alone.',
  },
  {
    title: 'Cognitive Apprenticeship',
    description:
      'Teacher modelling, scaffolding, and gradual release support students as they move toward independent reasoning.',
  },
  {
    title: 'Culturally Sustaining Pedagogy',
    description:
      'Cultural responsiveness is treated as an intellectual resource that strengthens interpretation, dialogue, and judgment.',
  },
  {
    title: 'SLA and CEFR Progression',
    description:
      'Language progression is planned alongside cognitive demand, including support for sustained development toward the B2 plateau.',
  },
  {
    title: 'Ecocentric Education',
    description:
      'Ecological literacy, place-based text selection, and human-nature relationships become legitimate domains of inquiry.',
  },
  {
    title: 'Education for Sustainable Development',
    description:
      'Critical thinking, systems thinking, and anticipatory thinking extend the framework into ecological and civic responsibility.',
  },
] as const;

export const frameworkEvidenceBase = [
  'Literature-based moral education strengthens character identification, perspective-taking, and ethical interpretation.',
  'Structured classroom dialogue improves the quality of reasoning, discussion, and accountable talk.',
  'Written justification supports stronger evidence use and more disciplined academic expression.',
  'Cross-cultural text analysis deepens interpretation and broadens perspective-taking.',
  'Nature-based and eco-themed texts support ecological empathy and environmental awareness.',
  'Place-based education improves motivation by grounding learning in local and ecological context.',
  'CLIL and content-based instruction strengthen language development through meaningful subject engagement.',
] as const;

export const frameworkConceptualModel = [
  {
    layer: 'Epistemological',
    question: 'How do we know what is right?',
    locus: 'Text selection criteria and moral dilemma design',
  },
  {
    layer: 'Pedagogical',
    question: 'How do we teach reasoning?',
    locus: 'Jurassic Thinking Cycle™, questioning hierarchy, and accountable talk',
  },
  {
    layer: 'Operational',
    question: 'What do teachers and students do?',
    locus: 'Lesson plan templates, 40/60-minute models, and the rubric system',
  },
] as const;

export const frameworkInstructionalStandards = [
  {
    title: 'Multiple Means of Engagement',
    description:
      'Students access meaningful choice in response format and context while staying inside a common reasoning framework.',
  },
  {
    title: 'Multiple Means of Representation',
    description:
      'Texts can be accessed through visual, auditory, and kinesthetic pathways without reducing cognitive demand.',
  },
  {
    title: 'Multiple Means of Action and Expression',
    description:
      'Students show reasoning through essays, debate, artistic response, digital storytelling, and ecological observation.',
  },
  {
    title: 'Differentiation Across Language and Reasoning',
    description:
      'Supports scale from glossaries and sentence frames through to independent inquiry and metacognitive transfer.',
  },
  {
    title: 'Regulation-Aware Access',
    description:
      'Movement, sensory transitions, and attentional resets are treated as conditions that preserve learning access rather than interrupt it.',
  },
] as const;

export const frameworkEcocentricExtension = {
  intro:
    'Version 3.0 extends the framework through ecocentric reasoning. The living world becomes a legitimate domain of moral and intellectual inquiry rather than a decorative theme.',
  metaphor:
    'The Jurassic metaphor is used deliberately: language is the fossil record of thought, stories are the strata in which values are preserved, and students become palaeontologists of meaning.',
  reflectionRule:
    'At Level 3 and above, teachers are expected to include at least one ecological reflection prompt per unit.',
  reflectionTypes: [
    'Personal reflection connects the text to lived experience.',
    'Universal reflection draws out a lesson for the wider human community.',
    'Ethical reflection asks what the story means for how we live.',
    'Metacognitive reflection tracks how thinking changes.',
    'Ecological reflection asks what responsibility the story creates toward the living world.',
  ],
  textCriteria: [
    'Meaningful human-nature relationships',
    'Environmental consequence',
    'Stewardship ethic',
    'Ecological systems thinking',
    'Indigenous ecological knowledge where appropriate',
  ],
} as const;

export const frameworkGovernance = [
  {
    title: 'Lesson Plan Audit',
    cadence: 'Termly',
    description:
      'A sample of lesson plans is reviewed to confirm fidelity to the framework’s reasoning architecture.',
  },
  {
    title: 'Classroom Observation',
    cadence: 'Annual',
    description:
      'Observed or recorded lessons are reviewed against a shared implementation rubric at higher rollout tiers.',
  },
  {
    title: 'Student Portfolio Moderation',
    cadence: 'Annual',
    description:
      'Cross-classroom moderation calibrates student work against the framework’s reasoning standards.',
  },
  {
    title: 'Data Review',
    cadence: 'Annual',
    description:
      'Programme leaders review placement trends and assessment evidence to identify strengths and gaps.',
  },
  {
    title: 'Programme Renewal',
    cadence: 'Every 3 years',
    description:
      'Curriculum content and research foundations are reviewed formally rather than left to drift.',
  },
] as const;

export const frameworkScalability = [
  {
    title: 'Fidelity at Scale',
    description:
      'The framework treats scale without fidelity as dilution. Growth is only valid if the core intellectual architecture remains intact.',
  },
  {
    title: 'Tier 1: Single Classroom Launch',
    description:
      'A teacher begins by studying the framework, teaching a first lesson, completing one full unit, and submitting reflective evidence.',
  },
  {
    title: 'Tier 2: Department or Year-Level Rollout',
    description:
      'A cohort of teachers shares planning, participates in observation cycles, and calibrates assessment through moderation.',
  },
  {
    title: 'Tiered Partnership Model',
    description:
      'Implementation is supported through certification, shared protocols, and quality assurance infrastructure rather than informal adoption.',
  },
] as const;

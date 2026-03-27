export type CoreText = {
  title: string;
  author: string;
  theme: string;
  isEco?: boolean;
};

export type TermBlock = {
  term: string;
  lessonRange: string;
  units: string;
  focusPoints: string[];
};

export type AssessmentMethod = {
  method: string;
  frequency: string;
  detail: string;
};

export type SyllabusData = {
  slug: string;
  syllabusRoutePath: string;
  welcomeText: string[];
  levelAtAGlance: {
    ageRange: string;
    cefrRange: string;
    cefrProgression: string;
    cognitiveFocus: string;
    textComplexity: string;
    totalLessons: string;
    lessonDuration: string;
    ecoStrand: string;
  };
  coreTexts: CoreText[];
  coreTextNote?: string;
  termBreakdown: TermBlock[];
  assessmentMethods: AssessmentMethod[];
  reasoningRubric: Array<{ level: string; label: string; description: string }>;
  ecoThreadSummary: string;
  ecoStrandLabel: string;
  progressionFrom: string;
  progressionTo: string;
  readinessStatement: string;
  homeSupportTips: string[];
};

const sharedRubric = [
  {
    level: '1',
    label: 'Emerging',
    description:
      'States a position without support. Opinion only — no warrant. No textual evidence cited.',
  },
  {
    level: '2',
    label: 'Developing',
    description:
      'Cites evidence without clear connection. Evidence present; warrant absent or unclear.',
  },
  {
    level: '3',
    label: 'Proficient',
    description:
      'Links evidence to claim with clear reasoning. Claim + Evidence + Warrant all present. Evidence selected purposefully.',
  },
  {
    level: '4',
    label: 'Advanced',
    description:
      'Anticipates counterarguments; extends to broader implications. Full CEIW with multiple evidence points.',
  },
];

export const syllabusData: SyllabusData[] = [
  {
    slug: 'level-1-foundation',
    syllabusRoutePath: '/series/level-1-foundation/syllabus',
    welcomeText: [
      'Welcome to Level 1: Foundation — the beginning of an extraordinary thinking journey.',
      'At this level, your child will explore the world through beautifully crafted picture books and short stories. But these are not ordinary story-times. Every book in the Jurassic English™ programme has been chosen because it raises a real question — about fairness, feelings, community, or our place in the natural world.',
      'From the very first lesson, your child will be asked to think out loud, share their views, and use the words of the text to explain what they believe. By the end of this year, your child will not merely read stories. They will analyse them, evaluate characters\' choices, and write their first justified opinions.',
    ],
    levelAtAGlance: {
      ageRange: '6–8 years',
      cefrRange: 'Pre-A1 → A1',
      cefrProgression: 'Pre-A1 → A1 (approx. 90–100 instructional hours)',
      cognitiveFocus: 'BICS — phonics, high-frequency vocabulary, context-embedded language',
      textComplexity: 'Picture books and predictable narratives',
      totalLessons: '40 structured lessons per academic year',
      lessonDuration: '40–60 minutes per lesson',
      ecoStrand: 'Local nature, seasons, and animal relationships',
    },
    coreTexts: [
      {
        title: "There's an Alligator Under My Bed",
        author: 'Mayer',
        theme: 'Imagination, courage, and problem-solving',
      },
      {
        title: 'The Name Jar',
        author: 'Choi',
        theme: 'Identity, naming, and cultural belonging',
      },
      {
        title: 'A Chair for My Mother',
        author: 'Williams',
        theme: 'Family resilience, community, and generosity',
      },
      {
        title: 'Owl Moon',
        author: 'Yolen',
        theme: 'Wonder in the natural world; patience and presence',
        isEco: true,
      },
    ],
    coreTextNote:
      '6 additional titles are selected per WWL text criteria in consultation with the school community. All selected texts meet the five-criterion standard for diverse cultural perspectives and ecological richness.',
    termBreakdown: [
      {
        term: 'Term 1',
        lessonRange: 'Lessons 1–13',
        units: 'Units 1–3',
        focusPoints: [
          'Introduce the Jurassic Thinking Cycle™',
          'Guided Analyze — \'What do we notice?\' with partner share and sentence frames',
          'First oral Evaluate: \'Was this a good or bad choice?\'',
          'Eco warm-up: 2-minute outdoor observation before each lesson',
        ],
      },
      {
        term: 'Term 2',
        lessonRange: 'Lessons 14–27',
        units: 'Units 4–7',
        focusPoints: [
          'First written justification sentences (Claim + Evidence)',
          'Introduce personal Reflect prompt: \'This connects to my life because…\'',
          'Eco strand active: informal nature journaling begins',
          'Ecological prompt: \'What do we name things in nature? Why does naming matter?\'',
        ],
      },
      {
        term: 'Term 3',
        lessonRange: 'Lessons 28–40',
        units: 'Units 8–10',
        focusPoints: [
          'Full Thinking Cycle across all four stages with light scaffolding',
          'Portfolio introduction: students choose their best justification sentence',
          'CEFR self-assessment on Pre-A1 / A1 descriptor grid',
          'Reading celebration — students share their reasoning journey',
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Lesson Observation',
        frequency: 'Every lesson',
        detail:
          'Teacher notes who provides evidence vs. opinion-only responses. Prompts and redirects with clarification questions.',
      },
      {
        method: 'Written Justification',
        frequency: '2–3 per week',
        detail:
          'One-sentence Claim + Evidence response. Feedback returned within 24 hours. Sentence frames available.',
      },
      {
        method: 'Exit Ticket',
        frequency: 'End of each lesson',
        detail:
          'One Reflect prompt; one sentence. Teacher sorts into Ready / Nearly / Not Yet to plan next lesson.',
      },
      {
        method: 'Portfolio',
        frequency: 'Per unit × 10',
        detail:
          'Student selects their best justification sentence and annotates: \'This shows my best thinking because…\'',
      },
      {
        method: 'CEFR Self-Assessment',
        frequency: 'Each term',
        detail:
          'Student marks current level on Pre-A1 / A1 descriptor grid. Teacher confirms or challenges in conference.',
      },
      {
        method: 'Year-End Growth Narrative',
        frequency: 'End of year',
        detail:
          '\'My reasoning journey this year…\' — teacher reads holistically to inform Level 2 placement.',
      },
    ],
    reasoningRubric: sharedRubric,
    ecoThreadSummary:
      'At Foundation level, eco-learning begins with wonder. Books such as Owl Moon invite children to slow down, notice the living world, and feel a sense of connection and responsibility. Children begin an informal nature journal — drawing and labelling what they observe. The Ecological Reflection prompt at this level asks: \'What do we name things in nature? Why does naming matter?\'',
    ecoStrandLabel: 'Local nature, seasons, and animal relationships',
    progressionFrom: 'Programme entry point',
    progressionTo: 'Level 2: Development',
    readinessStatement:
      'Students are ready for Level 2 when they can sustain a focused discussion using textual evidence, write one independent Claim + Evidence sentence, and make a personal connection in their Reflect response. CEFR readiness for A1 is confirmed through end-of-year portfolio review and teacher assessment. Placement is never based on a single test.',
    homeSupportTips: [
      'Read aloud together for 15 minutes daily — your voice models fluent, expressive English and builds listening comprehension.',
      "After reading, ask: 'Why did the character do that?' — not just 'What happened?' This develops reasoning rather than recall.",
      "Take a 5-minute 'observation walk' outside. Ask your child to name 3 living things and describe one relationship between them.",
      "Display your child's best justification sentence visibly — visible pride reinforces the reasoning habit.",
      "Let your child 'teach you' what they discussed in today's lesson. Explaining to others deepens understanding significantly.",
    ],
  },
  {
    slug: 'level-2-development',
    syllabusRoutePath: '/series/level-2-development/syllabus',
    welcomeText: [
      'Welcome to Level 2: Development — where thinking becomes a disciplined habit.',
      'In this level, your child will move from picture books into chapter books: longer, richer, and full of the moral questions that do not have easy answers. Is it ever right to stay silent when someone is being treated unjustly? What responsibility do we have to animals and to the environment?',
      'Your child will learn to use textual evidence to back up their opinions, structure their reasoning in writing, and listen carefully to the arguments of their classmates. By the end of this year, your child will write full justification paragraphs, lead a structured class discussion, and make connections between literature, their own lives, and the living world.',
    ],
    levelAtAGlance: {
      ageRange: '8–10 years',
      cefrRange: 'A1 → A2',
      cefrProgression: 'A1 → A2 (approx. 180–200 instructional hours)',
      cognitiveFocus: 'Context-Embedded Learning — students describe their world and begin to evaluate it',
      textComplexity: 'Early chapter books with clear moral dilemmas',
      totalLessons: '40 structured lessons per academic year',
      lessonDuration: '40–60 minutes per lesson',
      ecoStrand: 'Environmental consequence, habitat, and food chains',
    },
    coreTexts: [
      {
        title: "Charlotte's Web",
        author: 'White',
        theme: 'Friendship, life cycles, and what we owe to other creatures',
        isEco: true,
      },
      {
        title: 'The Hundred Dresses',
        author: 'Estes',
        theme: 'Bullying, moral courage, and the cost of silence',
      },
      {
        title: 'Esperanza Rising',
        author: 'Ryan',
        theme: 'Migration, identity, dignity, and resilience',
      },
      {
        title: 'The Lorax',
        author: 'Seuss',
        theme: 'Environmental consequence, corporate greed, and ecological stewardship',
        isEco: true,
      },
    ],
    coreTextNote:
      '6 additional titles are selected per WWL text criteria in consultation with the school community. All selected texts meet the five-criterion standard.',
    termBreakdown: [
      {
        term: 'Term 1',
        lessonRange: 'Lessons 1–13',
        units: 'Units 1–3',
        focusPoints: [
          'Consolidate Analyze with longer texts — guided annotation, stand-and-point to evidence',
          "Evaluate introduced formally: partner discussions with criteria ('Was this fair? By what standard?')",
          "Eco strand: Charlotte's Web — food chains, animal intelligence, and what we owe to non-human lives",
          'Accountable talk protocols established for whole-group discussion',
        ],
      },
      {
        term: 'Term 2',
        lessonRange: 'Lessons 14–27',
        units: 'Units 4–7',
        focusPoints: [
          'Full Justify stage: Claim + Evidence + Warrant paragraphs',
          'Socratic discussion protocols established',
          "The Lorax eco-reasoning unit: 'What responsibility do businesses have to the environment?'",
          "Stewardship Challenge introduced: 'What would a responsible member of this ecosystem do?'",
        ],
      },
      {
        term: 'Term 3',
        lessonRange: 'Lessons 28–40',
        units: 'Units 8–10',
        focusPoints: [
          'Complete Thinking Cycle independently across all four stages',
          "Reflect stage: ethical prompt ('Why does this matter for how we live?')",
          'Portfolio assembly: students curate their 10 best justification paragraphs',
          'CEFR A2 self-assessment and readiness review',
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Lesson Observation',
        frequency: 'Every lesson',
        detail:
          'Teacher notes who distinguishes explicit from implicit information. Prompts with clarification questions.',
      },
      {
        method: 'Partner Discussion',
        frequency: 'Every lesson',
        detail:
          "Teacher listens for evaluation criteria. Strong evaluations marked publicly: 'That was an evaluation — you used a criterion.'",
      },
      {
        method: 'Written Justification',
        frequency: '2–3 per week',
        detail:
          'Claim + Evidence + Warrant paragraph. Feedback within 24 hours. Sentence frame available for Emerging writers.',
      },
      {
        method: 'Exit Ticket',
        frequency: 'End of each lesson',
        detail:
          'One Reflect prompt: personal or ecological. Teacher sorts into Ready / Nearly / Not Yet.',
      },
      {
        method: 'Portfolio',
        frequency: 'Per unit × 10',
        detail:
          'Best justification paragraph per unit. Student annotates why this represents their best reasoning.',
      },
      {
        method: 'CEFR Self-Assessment',
        frequency: 'Each term',
        detail:
          'Student marks A1 / A2 descriptor grid. Teacher confirms in conference; result informs Term 2 differentiation.',
      },
    ],
    reasoningRubric: sharedRubric,
    ecoThreadSummary:
      "Level 2 is where eco-reasoning becomes explicit and structured. Charlotte's Web invites students to ask: 'What do we owe to non-human lives?' The Lorax requires students to evaluate corporate decision-making against ecological consequence. The Stewardship Challenge — 'What would a responsible member of this ecosystem do?' — is introduced as a formal dialogue prompt. Students begin a structured nature observation log.",
    ecoStrandLabel: 'Environmental consequence, habitat, and food chains',
    progressionFrom: 'Level 1: Foundation (or programme entry)',
    progressionTo: 'Level 3: Expansion',
    readinessStatement:
      'Students are ready for Level 3 when they can construct a complete Claim + Evidence + Warrant justification paragraph independently, sustain a 5-minute Socratic discussion using textual evidence, and write a personal reflection that extends beyond summary to evaluation or ethical connection. CEFR A2 readiness is confirmed through portfolio review and teacher assessment.',
    homeSupportTips: [
      "Encourage your child to read one chapter independently each week and report the most interesting decision a character made — not what happened, but what the character chose.",
      "Ask: 'Was that a fair decision?' then follow up: 'What evidence from the story supports your view?'",
      "Watch a nature documentary together and discuss: 'Do humans have a responsibility to protect this animal?'",
      "Ask your child to read their best justification paragraph aloud, then ask: 'What is the warrant — the connection between your evidence and your claim?'",
      "Review your child's CEFR self-assessment each term and celebrate progress on the descriptor grid.",
    ],
  },
  {
    slug: 'level-3-expansion',
    syllabusRoutePath: '/series/level-3-expansion/syllabus',
    welcomeText: [
      "Welcome to Level 3: Expansion — the year literature becomes a lens on the world.",
      "Researchers call the transition from A2 to B1 the 'Literacy Pivot': the point at which English shifts from describing the immediate world to reasoning about abstract ideas — justice, memory, collective responsibility, ecological survival. This is one of the most significant transitions in a young person's intellectual development, and it is the work of Level 3.",
      "At this level, students are expected to hold competing interpretations in mind simultaneously — to say, with intellectual honesty, 'both of these could be right, and here is how I weigh them.' Welcome to the Literacy Pivot.",
    ],
    levelAtAGlance: {
      ageRange: '10–12 years',
      cefrRange: 'A2 → B1',
      cefrProgression: 'A2 → B1 (approx. 350–400 instructional hours — the Literacy Pivot)',
      cognitiveFocus:
        'The Literacy Pivot (Cummins): English transitions from social communication to the medium of academic reasoning',
      textComplexity: 'Chapter books with ambiguous endings',
      totalLessons: '40 structured lessons per academic year',
      lessonDuration: '40–60 minutes per lesson',
      ecoStrand: 'Extinction, conservation, and human-nature conflict',
    },
    coreTexts: [
      {
        title: 'The Giver',
        author: 'Lowry',
        theme: 'Memory, freedom, and the cost of a controlled society',
      },
      {
        title: 'Number the Stars',
        author: 'Lowry',
        theme: 'Moral courage, duty, and the responsibilities of ordinary people',
      },
      {
        title: 'Roll of Thunder, Hear My Cry',
        author: 'Taylor',
        theme: 'Racial injustice, dignity, and the politics of land and voice',
      },
      {
        title: 'Island of the Blue Dolphins',
        author: "O'Dell",
        theme: 'Survival, isolation, and the ethics of human-nature relationship',
        isEco: true,
      },
    ],
    coreTextNote:
      '6 additional titles are selected per WWL text criteria in consultation with the school community. At minimum 2 eco-integrated units per year per UNESCO ESD requirement.',
    termBreakdown: [
      {
        term: 'Term 1',
        lessonRange: 'Lessons 1–13',
        units: 'Units 1–3',
        focusPoints: [
          'Transition to longer texts with ambiguous endings',
          'Introduce contested interpretation — multiple defensible readings',
          'Full CEIW paragraph structure (adding Impact to previous level)',
          "First eco-integrated unit: Island of the Blue Dolphins — 'What does the island owe to its people? What do the people owe to the island?'",
        ],
      },
      {
        term: 'Term 2',
        lessonRange: 'Lessons 14–27',
        units: 'Units 4–7',
        focusPoints: [
          'Structured Socratic seminars with student-led discussion facilitation',
          "Systems Thinking eco-reasoning probe: 'If we change this one thing in the story, what else changes?'",
          'Place-based outdoor observation integrated as lesson warm-up',
          'Written debate: take and defend a position, anticipate counterargument',
        ],
      },
      {
        term: 'Term 3',
        lessonRange: 'Lessons 28–40',
        units: 'Units 8–10',
        focusPoints: [
          'Extended analytical essay: multi-paragraph, CEIW structure throughout',
          "Eco-reflection portfolio entry: 'My ecological thinking grew when…'",
          'CEFR B1 self-assessment — the formal Literacy Pivot milestone',
          "Growth narrative first draft: 'My reasoning journey so far'",
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Lesson Observation',
        frequency: 'Every lesson',
        detail:
          'Teacher notes who identifies competing interpretations. Socratic pressing and revoicing used to deepen reasoning.',
      },
      {
        method: 'Socratic Seminar',
        frequency: 'Per unit',
        detail:
          'Student-led discussion. Evaluated on: evidence use, response to peers, evaluation criteria, and ecological extension in eco units.',
      },
      {
        method: 'CEIW Paragraph',
        frequency: '2–3 per week',
        detail:
          'Full Claim–Evidence–Warrant–Impact structure. Feedback within 24 hours. Developing writers receive partial paragraph frames.',
      },
      {
        method: 'Eco-Reasoning Reflection',
        frequency: 'Per eco unit',
        detail:
          "Written response: 'My ecological thinking grew when I…' Teacher checks for genuine ecological engagement vs. surface-level mention.",
      },
      {
        method: 'Portfolio',
        frequency: 'Per unit × 10',
        detail:
          'Best CEIW paragraph + eco-reasoning reflection per eco-designated unit. Student annotates growth evidence.',
      },
      {
        method: 'CEFR Self-Assessment',
        frequency: 'Each term',
        detail:
          'Student marks A2 / B1 descriptor grid. The Literacy Pivot (B1) is formally confirmed here — a significant milestone.',
      },
    ],
    reasoningRubric: sharedRubric,
    ecoThreadSummary:
      'Level 3 introduces the full eco-reasoning framework as a formal programme element. At least two units per year carry eco-integrated lesson plans with an Ecological Anchor Question. Students engage the Jurassic Thinking Cycle™ applied to extinction, conservation, and human-nature conflict. The Systems Thinking Probe — \'If we change this, what else changes?\' — models interdependence thinking.',
    ecoStrandLabel: 'Extinction, conservation, and human-nature conflict',
    progressionFrom: 'Level 2: Development',
    progressionTo: 'Level 4: Mastery',
    readinessStatement:
      'Students ready for Level 4 can write a full CEIW analytical paragraph independently, lead and sustain a structured debate using textual evidence, and produce an eco-reasoning reflection that demonstrates genuine engagement with ecological ethics. CEFR B1 readiness — the formal Literacy Pivot — is confirmed through portfolio moderation, teacher assessment, and CEFR self-assessment.',
    homeSupportTips: [
      'Discuss real-world injustice with your child — Level 3 students are ready to connect literature to news, history, and community events.',
      "Ask: 'Could there be another interpretation of that character's choice?' — practise holding two reasonable, opposing ideas simultaneously.",
      'Encourage a weekly nature journal: 5 minutes of outdoor observation with 3 written observations and a sketch.',
      "Read one of your child's CEIW paragraphs and ask: 'What is the Impact — why does your argument matter beyond this story?'",
      "Review the B1 CEFR descriptor with your child and celebrate the Literacy Pivot milestone — it is a genuine academic achievement.",
    ],
  },
  {
    slug: 'level-4-mastery',
    syllabusRoutePath: '/series/level-4-mastery/syllabus',
    welcomeText: [
      'Welcome to Level 4: Mastery — the heart of the Jurassic English™ programme.',
      'This is the year of full novels, contested interpretations, and the kind of moral reasoning that prepares students for academic life at the highest level. The B1–B2 transition — the B2 Plateau — is the most cognitively demanding stage in language development. Abstract concepts, subtext, irony, and multi-perspectival analysis all come into sharp focus here.',
      'At Level 4, students move from understanding to argumentation. They construct evidence-based cases, anticipate counterarguments, and write with the precision of academic discourse. In the eco-reasoning strand, they engage climate justice, indigenous knowledge systems, and the ethics of stewardship.',
    ],
    levelAtAGlance: {
      ageRange: '12–14 years',
      cefrRange: 'B1 → B2',
      cefrProgression: 'B1 → B2 (approx. 500–600 instructional hours — the B2 Plateau)',
      cognitiveFocus:
        'The B2 Plateau: abstract concepts, subtext, irony, and multi-perspectival analysis',
      textComplexity: 'Full novels with contested interpretations',
      totalLessons: '40 structured lessons per academic year',
      lessonDuration: '40–60 minutes per lesson',
      ecoStrand: 'Climate justice, indigenous knowledge, and stewardship ethics',
    },
    coreTexts: [
      {
        title: 'To Kill a Mockingbird',
        author: 'Lee',
        theme: 'Racial justice, moral courage, the law, and who bears the cost',
      },
      {
        title: 'The House on Mango Street',
        author: 'Cisneros',
        theme: 'Gender, voice, urban identity, aspiration, and structural inequality',
      },
      {
        title: 'Night',
        author: 'Wiesel',
        theme: 'Trauma, memory, and the moral imperative to witness and testify',
      },
      {
        title: 'Hatchet',
        author: 'Paulsen',
        theme: 'Survival, self-reliance, and the demands of the natural world',
        isEco: true,
      },
    ],
    coreTextNote:
      '6 additional titles are selected per WWL text criteria in consultation with the school community. At minimum 2 eco-integrated units per year per UNESCO ESD requirement.',
    termBreakdown: [
      {
        term: 'Term 1',
        lessonRange: 'Lessons 1–13',
        units: 'Units 1–3',
        focusPoints: [
          'Full novel analysis across sustained 4-lesson units',
          'Contested interpretation: students identify and defend multiple defensible readings',
          'Extended CEIW essay with counterargument and rebuttal',
          'Eco strand begins: community as ecosystem — injustice as environmental degradation of the social fabric',
        ],
      },
      {
        term: 'Term 2',
        lessonRange: 'Lessons 14–27',
        units: 'Units 4–7',
        focusPoints: [
          'Formal debate structure — two sides, textual evidence, academic language',
          "Temporal Extension eco-reasoning: 'What will this place look like in 100 years if this decision stands?'",
          'Indigenous Perspective dialogue introduced formally',
          'Climate justice framed as a moral philosophy problem, not merely a scientific one',
        ],
      },
      {
        term: 'Term 3',
        lessonRange: 'Lessons 28–40',
        units: 'Units 8–10',
        focusPoints: [
          "Multi-text synthesis essay: 'How do two novels illuminate the same ethical question from different angles?'",
          "Portfolio growth narrative: 'My reasoning journey this year'",
          'CEFR B2 readiness review',
          'Preparation for Level 5 academic demands and international examination contexts',
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Lesson Observation',
        frequency: 'Every lesson',
        detail:
          'Teacher assesses multi-perspectival reasoning. Pressing and eco-pressing dialogue moves deepen analysis beyond initial positions.',
      },
      {
        method: 'Formal Debate',
        frequency: 'Per term',
        detail:
          'Structured debate with academic language requirements. Assessed on: evidence strength, counterargument quality, and ecological extension where applicable.',
      },
      {
        method: 'Multi-Paragraph Essay',
        frequency: 'Per unit',
        detail:
          'CEIW structure with counterargument and rebuttal. Feedback within 24 hours. Developing writers receive essay frame with open prompts.',
      },
      {
        method: 'Eco-Reasoning Portfolio',
        frequency: 'Per eco unit',
        detail:
          'Temporal Extension or Indigenous Perspective reflection. Teacher assesses philosophical depth and genuine ecological engagement.',
      },
      {
        method: 'Portfolio',
        frequency: 'Per unit × 10',
        detail:
          "Best essay excerpt + eco-reasoning reflection per unit. Year-end growth narrative: 'My reasoning journey this year.'",
      },
      {
        method: 'CEFR Self-Assessment',
        frequency: 'Each term',
        detail:
          'Student marks B1 / B2 descriptor grid. B2 — the Plateau — is the most demanding CEFR transition and may take 1.5–2 years of sustained effort.',
      },
    ],
    reasoningRubric: sharedRubric,
    ecoThreadSummary:
      'Level 4 integrates the most demanding eco-reasoning strand in the lower curriculum. Climate justice is framed as a moral philosophy problem. Indigenous knowledge systems are introduced as legitimate and rigorous ecological frameworks. The Temporal Extension dialogue — \'What will this place look like in 100 years?\' — is a formal requirement of at least two eco-integrated lessons.',
    ecoStrandLabel: 'Climate justice, indigenous knowledge, and stewardship ethics',
    progressionFrom: 'Level 3: Expansion',
    progressionTo: 'Level 5: Advanced',
    readinessStatement:
      'Students ready for Level 5 demonstrate advanced multi-paragraph analytical writing with counterargument and synthesis, can engage intertextual comparison across two or more novels, and apply eco-reasoning — including Indigenous Perspective and Temporal Extension — independently. CEFR B2 readiness is confirmed through portfolio moderation, teacher assessment, and CEFR self-assessment.',
    homeSupportTips: [
      'Engage your child as an intellectual equal — share your own views on justice, memory, and environmental responsibility, and be genuinely willing to be challenged.',
      "Discuss current events together and ask: 'How does this connect to the novel we just finished?'",
      "Encourage your child to identify the counterargument in any position they take: 'What would someone who disagrees say, and how would you respond?'",
      "Ask your child to explain the Temporal Extension question from their last lesson. Thinking 100 years forward is a transferable skill for any decision-making context.",
      "Review the WWL Four-Level Reasoning Rubric with your child — they should be able to honestly place their own writing on it.",
    ],
  },
  {
    slug: 'level-5-advanced',
    syllabusRoutePath: '/series/level-5-advanced/syllabus',
    welcomeText: [
      'Welcome to Level 5: Advanced — the culmination of the Jurassic English™ journey.',
      'This is the level of full Cognitive Academic Language Proficiency (CALP): the register of academic journals, university essays, legal argument, and intellectual debate. At Level 5, students engage in intertextual analysis — comparing how different authors, genres, and cultural traditions approach the same philosophical questions.',
      'This year prepares students directly for international examinations — IB English, Cambridge Advanced, AP Literature — and for the demands of university-level academic writing. It is also, for students who began at Level 1, the completion of an extraordinary journey from first story to full academic voice.',
    ],
    levelAtAGlance: {
      ageRange: '14+ years',
      cefrRange: 'B2 → C1',
      cefrProgression: 'B2 → C1 (approx. 700–800+ instructional hours — Full CALP)',
      cognitiveFocus:
        'Full CALP: nuance, subtext, academic synthesis, and the register of IB HL / Cambridge Advanced',
      textComplexity: 'Diverse genres — memoir, satire, postcolonial fiction, scientific essay',
      totalLessons: '40 structured lessons per academic year',
      lessonDuration: '40–60 minutes per lesson',
      ecoStrand: 'Systems thinking, ecological philosophy, and policy critique',
    },
    coreTexts: [
      {
        title: 'Things Fall Apart',
        author: 'Achebe',
        theme: 'Colonialism, cultural identity, and the cost of enforced change',
      },
      {
        title: '1984',
        author: 'Orwell',
        theme: 'Power, surveillance, language as control, and the possibility of truth',
      },
      {
        title: 'Beloved',
        author: 'Morrison',
        theme: 'Memory, trauma, the legacy of slavery, and the ethics of witness',
      },
      {
        title: 'The Overstory',
        author: 'Powers',
        theme: 'Human-tree interdependence, ecological grief, and activist ethics',
        isEco: true,
      },
      {
        title: 'Braiding Sweetgrass (selected essays)',
        author: 'Kimmerer',
        theme: 'Indigenous ecological knowledge, reciprocity, and the grammar of animacy',
        isEco: true,
      },
    ],
    coreTextNote:
      '5 additional titles are selected per WWL text criteria for diverse genres, intertextual analysis, and ecological philosophy. At minimum 2 eco-integrated units per year per UNESCO ESD requirement.',
    termBreakdown: [
      {
        term: 'Term 1',
        lessonRange: 'Lessons 1–13',
        units: 'Units 1–3',
        focusPoints: [
          'Intertextual analysis: postcolonial and dystopian frameworks compared',
          'Full academic essay — counterargument, synthesis, and formal citation',
          "Eco strand: The Overstory — ecological grief and activist ethics as philosophical positions",
          "Ecological Anchor Question: 'What do humans owe to trees — and why?'",
        ],
      },
      {
        term: 'Term 2',
        lessonRange: 'Lessons 14–27',
        units: 'Units 4–7',
        focusPoints: [
          'Genre diversity: memoir and scientific-literary essay as formal literary modes',
          "Policy critique eco-reasoning: 'What systemic changes does this ecological crisis require, and who bears the cost?'",
          'Systems Thinking Probe at full philosophical depth',
          'Indigenous knowledge frameworks evaluated on their own terms',
        ],
      },
      {
        term: 'Term 3',
        lessonRange: 'Lessons 28–40',
        units: 'Units 8–10',
        focusPoints: [
          'Extended research essay: multi-text thematic synthesis with formal citation',
          "Final portfolio growth narrative: 'My reasoning journey across all levels of Jurassic English™'",
          'CEFR C1 self-assessment',
          'International examination preparation — IB, Cambridge Advanced, AP Literature',
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Lesson Observation',
        frequency: 'Every lesson',
        detail:
          "Teacher assesses intertextual reasoning, source evaluation, and philosophical positioning. Eco-pressing dialogue: 'What does this mean for the living world beyond the story?'",
      },
      {
        method: 'Academic Essay',
        frequency: 'Per unit',
        detail:
          'Multi-paragraph with counterargument, synthesis, and citation. Feedback within 24 hours. Aligned to IB/Cambridge assessment criteria.',
      },
      {
        method: 'Policy Critique Reflection',
        frequency: 'Per eco unit',
        detail:
          "Formal written argument: 'What systemic changes does this crisis require?' Assessed on philosophical depth, evidence quality, and systemic reasoning.",
      },
      {
        method: 'Research Essay',
        frequency: 'Terms 2 and 3',
        detail:
          'Multi-text thematic synthesis with formal citation. Preparation for international examination extended essay or commentary formats.',
      },
      {
        method: 'Portfolio',
        frequency: 'Per unit × 10',
        detail:
          'Best essay excerpt + eco-reasoning reflection per unit. Year-end: final growth narrative synthesising the full Jurassic English™ journey.',
      },
      {
        method: 'CEFR Self-Assessment',
        frequency: 'Each term',
        detail:
          'Student marks B2 / C1 descriptor grid. C1 readiness is confirmed through portfolio moderation, examination performance, and teacher assessment.',
      },
    ],
    reasoningRubric: sharedRubric,
    ecoThreadSummary:
      "At Level 5, eco-reasoning reaches full philosophical scope. The Overstory reconceives the relationship between human consciousness and the living world. Braiding Sweetgrass is engaged as a model of indigenous scientific and ethical reasoning that challenges and extends Western analytical traditions. Policy critique becomes a formal assessment task: 'What systemic changes does this ecological crisis require, and who bears the cost?'",
    ecoStrandLabel: 'Systems thinking, ecological philosophy, and policy critique',
    progressionFrom: 'Level 4: Mastery',
    progressionTo: 'University / International Examinations (IB HL, Cambridge C1 Advanced, AP Literature)',
    readinessStatement:
      'Level 5 completers with Advanced-level portfolio work and demonstrated CEFR C1 competency are fully prepared for international English examinations. The WWL Growth Narrative portfolio provides documentation of sustained reasoning development for university and scholarship applications.',
    homeSupportTips: [
      'Engage your young adult as an intellectual equal — share articles, international news, and documentaries that connect directly to the texts they are studying.',
      "Discuss ecological philosophy at home: 'Do you think forests have rights? What would Kimmerer say?'",
      'Encourage reading across international news sources in English — Level 5 reasoning requires multi-perspectival information literacy.',
      'Ask your child to share and genuinely defend a counterargument they wrote — respond as if you are the opposition in a formal debate.',
      'If your child has been in Jurassic English™ since Level 1, take time to celebrate an extraordinary intellectual journey — from first sentences to academic essays.',
    ],
  },
];

export const getSyllabusBySlug = (slug: string): SyllabusData | null =>
  syllabusData.find((s) => s.slug === slug) ?? null;

export const getSyllabusByRoutePath = (pathname: string): SyllabusData | null =>
  syllabusData.find((s) => s.syllabusRoutePath === pathname) ?? null;

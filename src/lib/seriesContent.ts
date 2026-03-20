export type SeriesLevelDetail = {
  order: number;
  slug: string;
  path: string;
  syllabusPath: string;
  syllabusFileName: string;
  title: string;
  levelName: string;
  tagline: string;
  ageBand: string;
  cefrRange: string;
  lessonsPerYear: string;
  coreTexts: string;
  cefrProgression: string;
  cognitiveFocus: string;
  textComplexity: string;
  intro: string[];
  competencies: Array<{
    title: string;
    description: string;
  }>;
  assessmentSnapshot: string[];
  assessmentNote: string;
  progression: {
    thisLevel: string;
    nextStageTitle: string;
    nextStageSummary: string;
  };
  color: string;
};

export const seriesLevels: SeriesLevelDetail[] = [
  {
    order: 1,
    slug: 'level-1-foundation',
    path: '/series/level-1-foundation',
    syllabusPath: '/syllabus/JE-Level1-Foundation-Syllabus-2025-26.docx',
    syllabusFileName: 'JE-Level1-Foundation-Syllabus-2025-26.docx',
    title: 'Level 1: Foundation',
    levelName: 'Foundation',
    tagline: 'First Stories. First Thinking.',
    ageBand: '6–8 years',
    cefrRange: 'Pre-A1 → A1',
    lessonsPerYear: '40 structured lessons per academic year',
    coreTexts: '10 core texts (4 lessons each)',
    cefrProgression: 'Pre-A1 → A1 (approx. 90–100 instructional hours)',
    cognitiveFocus: 'BICS — phonics, high-frequency vocabulary, context-embedded language',
    textComplexity: 'Picture books and predictable narratives',
    intro: [
      'Welcome to Level 1: Foundation — the beginning of an extraordinary thinking journey.',
      'At this level, your child will explore the world through beautifully crafted picture books and short stories. From the very first lesson, your child will be asked to think out loud, share their views, and use the words of the text to explain what they believe.',
    ],
    competencies: [
      {
        title: 'Critical Thinking',
        description:
          'Students begin to notice what is happening in a story and distinguish what they observe from what they infer.',
      },
      {
        title: 'Moral Reasoning',
        description:
          "Students consider whether a character's choice was right or wrong, and why — giving a simple reason.",
      },
      {
        title: 'Structured Reflection',
        description:
          "Students connect story themes to their own lives: 'This reminds me of…'",
      },
      {
        title: 'Academic Expression',
        description:
          'Students use sentence frames to share opinions aloud and write their first justification sentences.',
      },
    ],
    assessmentSnapshot: [
      'Lesson observation every lesson: teacher notes who provides evidence vs. opinion-only responses.',
      'Written justification 2–3 per week: one-sentence Claim + Evidence response with feedback returned within 24 hours.',
      'Exit ticket at the end of each lesson: one Reflect prompt; one sentence.',
      'CEFR self-assessment each term on the Pre-A1 / A1 descriptor grid.',
    ],
    assessmentNote:
      'All written justification tasks are assessed using the WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        "By the end of this year, students analyse stories, evaluate characters' choices, and write their first justified opinions.",
      nextStageTitle: 'Leads to Level 2: Development',
      nextStageSummary:
        'In Level 2, students move from picture books into chapter books and begin writing full justification paragraphs.',
    },
    color: 'border-l-jurassic-accent',
  },
  {
    order: 2,
    slug: 'level-2-development',
    path: '/series/level-2-development',
    syllabusPath: '/syllabus/JE-Level2-Development-Syllabus-2025-26.docx',
    syllabusFileName: 'JE-Level2-Development-Syllabus-2025-26.docx',
    title: 'Level 2: Development',
    levelName: 'Development',
    tagline: 'Growing Thinkers. Growing Readers.',
    ageBand: '8–10 years',
    cefrRange: 'A1 → A2',
    lessonsPerYear: '40 structured lessons per academic year',
    coreTexts: '10 core texts (4 lessons each)',
    cefrProgression: 'A1 → A2 (approx. 180–200 instructional hours, 6–10 months at high intensity)',
    cognitiveFocus:
      'Context-Embedded Learning — students describe their world and begin to evaluate it',
    textComplexity: 'Early chapter books with clear moral dilemmas',
    intro: [
      'Welcome to Level 2: Development — where thinking becomes a disciplined habit.',
      'In this level, your child will move from picture books into chapter books: longer, richer, and full of the moral questions that do not have easy answers. Your child will learn to use textual evidence to back up their opinions, structure their reasoning in writing, and listen carefully to the arguments of their classmates.',
    ],
    competencies: [
      {
        title: 'Critical Thinking',
        description:
          'Students distinguish explicit from implicit information, identify narrative perspective, and recognise craft moves in the author’s choices.',
      },
      {
        title: 'Moral Reasoning',
        description:
          "Students evaluate characters' decisions using stated criteria: fairness, consequences, who is helped, who is harmed.",
      },
      {
        title: 'Structured Reflection',
        description:
          'Students connect textual themes to personal experience, to broader community, and — for the first time — to the natural world.',
      },
      {
        title: 'Academic Expression',
        description:
          'Students write Claim + Evidence paragraphs and sustain focused partner and whole-group discussions using accountable talk protocols.',
      },
    ],
    assessmentSnapshot: [
      'Lesson observation every lesson: teacher notes who distinguishes explicit from implicit information.',
      'Partner discussion every lesson: teacher listens for evaluation criteria and marks strong evaluations publicly.',
      'Written justification 2–3 per week: Claim + Evidence + Warrant paragraph with feedback within 24 hours.',
      'CEFR self-assessment each term on the A1 / A2 descriptor grid.',
    ],
    assessmentNote:
      'All written justification tasks are assessed using the WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        'By the end of this year, students write full justification paragraphs, lead a structured class discussion, and make connections between literature, their own lives, and the living world.',
      nextStageTitle: 'Leads to Level 3: Expansion',
      nextStageSummary:
        "Level 3 is the Literacy Pivot: English shifts from describing the immediate world to reasoning about abstract ideas across subjects.",
    },
    color: 'border-l-amber-500',
  },
  {
    order: 3,
    slug: 'level-3-expansion',
    path: '/series/level-3-expansion',
    syllabusPath: '/syllabus/JE-Level3-Expansion-Syllabus-2025-26.docx',
    syllabusFileName: 'JE-Level3-Expansion-Syllabus-2025-26.docx',
    title: 'Level 3: Expansion',
    levelName: 'Expansion',
    tagline: 'Complex Texts. Deeper Thinking.',
    ageBand: '10–12 years',
    cefrRange: 'A2 → B1',
    lessonsPerYear: '40 structured lessons per academic year',
    coreTexts: '10 core texts (4 lessons each)',
    cefrProgression: 'A2 → B1 (approx. 350–400 instructional hours — the Literacy Pivot)',
    cognitiveFocus:
      'The Literacy Pivot (Cummins): English transitions from social communication to the medium of academic reasoning across subjects',
    textComplexity: 'Chapter books with ambiguous endings',
    intro: [
      'Welcome to Level 3: Expansion — the year literature becomes a lens on the world.',
      "Researchers call the transition from A2 to B1 the 'Literacy Pivot': the point at which English shifts from describing the immediate world to reasoning about abstract ideas. At this level, students are expected to hold competing interpretations in mind simultaneously and explain how they weigh them.",
    ],
    competencies: [
      {
        title: 'Critical Thinking',
        description:
          'Students deconstruct narratives at multiple levels — plot, character motivation, authorial craft, and cultural assumptions. They hold competing interpretations simultaneously.',
      },
      {
        title: 'Moral Reasoning',
        description:
          'Students engage ethical dilemmas that have no single correct answer, using moral philosophy frameworks to construct and defend positions.',
      },
      {
        title: 'Structured Reflection',
        description:
          'Students move between personal, universal, ethical, metacognitive, and ecological reflection — choosing the most generative lens for each text.',
      },
      {
        title: 'Academic Expression',
        description:
          'Students write full CEIW (Claim–Evidence–Warrant–Impact) analytical paragraphs and lead structured Socratic seminars.',
      },
    ],
    assessmentSnapshot: [
      'Lesson observation every lesson: teacher notes who identifies competing interpretations and uses Socratic pressing and revoicing to deepen reasoning.',
      'Socratic seminar per unit: evaluated on evidence use, response to peers, evaluation criteria, and ecological extension in eco units.',
      'CEIW paragraph 2–3 per week: full Claim–Evidence–Warrant–Impact structure with feedback within 24 hours.',
      'CEFR self-assessment each term on the A2 / B1 descriptor grid; the Literacy Pivot (B1) is formally confirmed here.',
    ],
    assessmentNote:
      'All written justification tasks are assessed using the WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        'At this level, students handle texts with genuinely ambiguous endings without seeking a single correct answer.',
      nextStageTitle: 'Leads to Level 4: Mastery',
      nextStageSummary:
        'Level 4 moves into full novels, contested interpretations, and the B1–B2 transition known as the B2 Plateau.',
    },
    color: 'border-l-jurassic-gold',
  },
  {
    order: 4,
    slug: 'level-4-mastery',
    path: '/series/level-4-mastery',
    syllabusPath: '/syllabus/JE-Level4-Mastery-Syllabus-2025-26.docx',
    syllabusFileName: 'JE-Level4-Mastery-Syllabus-2025-26.docx',
    title: 'Level 4: Mastery',
    levelName: 'Mastery',
    tagline: 'Novels. Nuance. Real-World Stakes.',
    ageBand: '12–14 years',
    cefrRange: 'B1 → B2',
    lessonsPerYear: '40 structured lessons per academic year',
    coreTexts: '10 core texts (4 lessons each)',
    cefrProgression: 'B1 → B2 (approx. 500–600 instructional hours — the B2 Plateau)',
    cognitiveFocus:
      'The B2 Plateau: abstract concepts, subtext, irony, and multi-perspectival analysis. High-quality literature is the most effective vehicle for this transition.',
    textComplexity: 'Full novels with contested interpretations',
    intro: [
      'Welcome to Level 4: Mastery — the heart of the Jurassic English™ programme.',
      'This is the year of full novels, contested interpretations, and the kind of moral reasoning that prepares students for academic life at the highest level. At Level 4, students move from understanding to argumentation: they construct evidence-based cases, anticipate counterarguments, and write with the precision of academic discourse.',
    ],
    competencies: [
      {
        title: 'Critical Thinking',
        description:
          'Students produce advanced intertextual analysis — comparing how different authors treat the same ethical question across different cultural and historical contexts.',
      },
      {
        title: 'Moral Reasoning',
        description:
          'Students construct formal moral arguments using established ethical frameworks, anticipate counterarguments, and write with the structure of academic argumentation.',
      },
      {
        title: 'Structured Reflection',
        description:
          "Students apply ecological reflection at depth — including Temporal Extension ('100 years from now') and Indigenous Perspective as formal reasoning lenses.",
      },
      {
        title: 'Academic Expression',
        description:
          'Students write multi-paragraph analytical essays with counterargument and rebuttal, and engage in formal debate with academic precision.',
      },
    ],
    assessmentSnapshot: [
      'Lesson observation every lesson: teacher assesses multi-perspectival reasoning and uses pressing and eco-pressing dialogue moves.',
      'Formal debate per term: assessed on evidence strength, counterargument quality, and ecological extension where applicable.',
      'Multi-paragraph essay per unit: CEIW structure with counterargument and rebuttal, with feedback within 24 hours.',
      'CEFR self-assessment each term on the B1 / B2 descriptor grid; B2 — the Plateau — may take 1.5–2 years of sustained effort.',
    ],
    assessmentNote:
      'All written justification tasks are assessed using the WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        'This level develops full novel analysis, sustained analytical attention, and academic argumentation across longer units.',
      nextStageTitle: 'Leads to Level 5: Advanced',
      nextStageSummary:
        'Level 5 reaches full CALP, intertextual analysis, multi-source arguments, and the register of international examinations.',
    },
    color: 'border-l-teal-500',
  },
  {
    order: 5,
    slug: 'level-5-advanced',
    path: '/series/level-5-advanced',
    syllabusPath: '/syllabus/JE-Level5-Advanced-Syllabus-2025-26.docx',
    syllabusFileName: 'JE-Level5-Advanced-Syllabus-2025-26.docx',
    title: 'Level 5: Advanced',
    levelName: 'Advanced',
    tagline: 'Academic Excellence. Global Responsibility.',
    ageBand: '14+ years',
    cefrRange: 'B2 → C1',
    lessonsPerYear: '40 structured lessons per academic year',
    coreTexts: '10 core texts (4 lessons each)',
    cefrProgression: 'B2 → C1 (approx. 700–800+ instructional hours — Full CALP)',
    cognitiveFocus:
      'Full CALP (Cognitive Academic Language Proficiency): nuance, subtext, academic synthesis, and the register of IB HL / Cambridge Advanced',
    textComplexity: 'Diverse genres — memoir, satire, postcolonial fiction, scientific essay',
    intro: [
      'Welcome to Level 5: Advanced — the culmination of the Jurassic English™ journey.',
      'This is the level of full Cognitive Academic Language Proficiency (CALP): the register of academic journals, university essays, legal argument, and intellectual debate. Students engage in intertextual analysis, write with academic precision, and construct multi-source arguments with the rigour of scholarly discourse.',
    ],
    competencies: [
      {
        title: 'Critical Thinking',
        description:
          'Students produce intertextual analysis — comparing how multiple authors across genres and cultural traditions approach the same philosophical question, evaluating each framework on its own terms.',
      },
      {
        title: 'Moral Reasoning',
        description:
          "Students engage ecological philosophy, postcolonial ethics, and political philosophy as rigorous intellectual systems, not merely as 'alternative views'.",
      },
      {
        title: 'Structured Reflection',
        description:
          'Students write extended ecological philosophy reflections, policy critique arguments, and growth narratives that synthesise their entire Jurassic English™ journey.',
      },
      {
        title: 'Academic Expression',
        description:
          'Students write multi-source research essays with citation, academic precision, and the register demanded by international examinations (IB, Cambridge, AP).',
      },
    ],
    assessmentSnapshot: [
      'Lesson observation every lesson: teacher assesses intertextual reasoning, source evaluation, and philosophical positioning.',
      'Academic essay per unit: multi-paragraph with counterargument, synthesis, and citation, aligned to IB/Cambridge assessment criteria.',
      'Research essay in Terms 2 and 3: multi-text thematic synthesis with formal citation.',
      'CEFR self-assessment each term on the B2 / C1 descriptor grid; C1 readiness is confirmed through portfolio moderation, examination performance, and teacher assessment.',
    ],
    assessmentNote:
      'All written justification tasks are assessed using the WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        'This year prepares students directly for international examinations — IB English, Cambridge Advanced, AP Literature — and for the demands of university-level academic writing.',
      nextStageTitle: 'Outcome of the series',
      nextStageSummary:
        'For students who began at Level 1, this is the completion of the journey from first story to full academic voice.',
    },
    color: 'border-l-jurassic-blue',
  },
];

export const getSeriesLevelByPath = (pathname: string) =>
  seriesLevels.find((level) => level.path === pathname) ?? null;

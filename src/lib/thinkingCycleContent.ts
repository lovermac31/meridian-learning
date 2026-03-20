export type ThinkingCycleStageDetail = {
  order: number;
  slug: string;
  path: string;
  studentManualPath: string;
  studentManualFileName: string;
  teacherManualPath: string;
  teacherManualFileName: string;
  title: string;
  line: string;
  cognitiveOperation: string;
  bloomLevel: string;
  primaryTarget: string;
  lessonSlot: string;
  intro: string[];
  studentExpectations: string[];
  promptBank: Array<{
    type: string;
    summary: string;
  }>;
  languageBank: Array<{
    function: string;
    frame: string;
  }>;
  practicePrompts: Array<{
    levelBand: string;
    prompt: string;
  }>;
  assessmentSnapshot: string[];
  teacherAction: string;
  primaryActivity: string;
  ecoExtension: string;
  crossStageConnection: string;
  accent: string;
};

export const thinkingCycleStages: ThinkingCycleStageDetail[] = [
  {
    order: 1,
    slug: 'analyze',
    path: '/thinking-cycle/analyze',
    studentManualPath: '/thinking-cycle/JE-Stage1-ANALYZE-Student-Manual.docx',
    studentManualFileName: 'JE-Stage1-ANALYZE-Student-Manual.docx',
    teacherManualPath: '/thinking-cycle/JE-Stage1-ANALYZE-Teacher-Manual.docx',
    teacherManualFileName: 'JE-Stage1-ANALYZE-Teacher-Manual.docx',
    title: 'ANALYZE',
    line: 'Break the text apart. Find the evidence. Establish what is really there.',
    cognitiveOperation:
      'Deconstruction of textual elements to establish objective understanding.',
    bloomLevel: '3 (Analysis)',
    primaryTarget: 'Deconstruct',
    lessonSlot: '5–15 min',
    intro: [
      'Stage 1: ANALYZE provides the complete instructional architecture for deconstructing a text before any judgment or argument is made.',
      'This stage establishes what is explicitly present, what can be inferred, and which textual details will later support evaluation and justification.',
    ],
    studentExpectations: [
      'Identify characters, setting, and plot events with textual grounding.',
      'Distinguish explicitly stated information from implicit inference.',
      'Recognise narrative perspective and authorial craft choices.',
      'Note emotional and psychological states of characters with evidence.',
      'Identify ecological and environmental details embedded in the setting.',
    ],
    promptBank: [
      { type: 'Elicitation', summary: "Establish baseline comprehension: 'What is happening in this scene?'" },
      { type: 'Clarification', summary: "Distinguish observation from inference: 'What evidence shows the character is afraid?'" },
      { type: 'Structural', summary: "Reveal craft moves and authorial intention: 'How does the author organise this information?'" },
      { type: 'Ecological', summary: "Surface ecological and environmental dimensions in the setting." },
    ],
    languageBank: [
      { function: 'Analysis', frame: "'In this scene, ___ is happening.'" },
      { function: 'Evidence', frame: "'The text states / shows / describes ___.'" },
      { function: 'Inference', frame: "'This suggests / implies that ___.'" },
      { function: 'Craft', frame: "'The author uses ___ to show ___.'" },
      { function: 'Ecological', frame: "'The setting shows the relationship between ___ and the environment by ___.'" },
    ],
    practicePrompts: [
      {
        levelBand: 'Foundation / Development (Pre-A1 to A2)',
        prompt:
          'Identify three facts about the main character directly from the text. What does the character do in this scene? What words tell you how the character is feeling?',
      },
      {
        levelBand: 'Expansion / Mastery (A2 to B2)',
        prompt:
          "What evidence shows the character's motivation? How does the author use language to reveal internal conflict? What does the setting contribute to the mood?",
      },
      {
        levelBand: 'Advanced (B2 to C1)',
        prompt:
          "Analyse the narrative perspective and its effect on reader interpretation. What is the author's craft move in this passage? How does the ecological setting function as more than background detail?",
      },
    ],
    assessmentSnapshot: [
      'Assessment type: Observation.',
      'Assessment form: Circulate; note which students identify implicit vs. explicit.',
      'Formative sequence during Analyze stage: prompt or redirect with clarification questions.',
      'Portfolio standard includes eco-reasoning reflection per unit at Level 3+ and CEFR self-assessment each term.',
    ],
    teacherAction: 'Prompt or redirect with clarification questions.',
    primaryActivity: 'Guided close reading; teacher models with think-aloud.',
    ecoExtension:
      "Add an Ecological Analyze prompt in every lesson. At Level 3+, nature observations are logged and at least one ecological reflection prompt per unit is mandatory.",
    crossStageConnection:
      'Thorough Analyze work directly determines the quality of Evaluate judgments. Analysis is the foundation on which all subsequent reasoning is built.',
    accent: 'text-jurassic-accent',
  },
  {
    order: 2,
    slug: 'evaluate',
    path: '/thinking-cycle/evaluate',
    studentManualPath: '/thinking-cycle/JE-Stage2-EVALUATE-Student-Manual.docx',
    studentManualFileName: 'JE-Stage2-EVALUATE-Student-Manual.docx',
    teacherManualPath: '/thinking-cycle/JE-Stage2-EVALUATE-Teacher-Manual.docx',
    teacherManualFileName: 'JE-Stage2-EVALUATE-Teacher-Manual.docx',
    title: 'EVALUATE',
    line: 'Make a judgment. Apply a standard. Defend it with reason.',
    cognitiveOperation:
      'Assessment of quality, effectiveness, or morality based on established criteria.',
    bloomLevel: '4 (Evaluation)',
    primaryTarget: 'Judge',
    lessonSlot: '15–25 min',
    intro: [
      'Stage 2: EVALUATE is the point at which comprehension becomes judgment.',
      'Students name a criterion, assess quality or morality against that standard, and begin to articulate the reasoning that will later become a formal justification.',
    ],
    studentExpectations: [
      'Identify explicit criteria before making any judgment.',
      'Assess the quality, fairness, or morality of decisions and events in the text.',
      'Compare alternative courses of action or interpretation.',
      "Predict consequences of characters' choices with logical reasoning.",
      'Recognise ecological and long-term systemic consequences where applicable.',
    ],
    promptBank: [
      { type: 'Evaluative', summary: "Elicit judgment with an explicit standard: 'Was this a good decision? By what criteria?'" },
      { type: 'Consequential', summary: "Develop predictive and causal reasoning about what might happen next." },
      { type: 'Alternative', summary: 'Foster creative and critical problem-solving through other possible solutions.' },
      { type: 'Comparative', summary: 'Introduce equity and multiple-perspective reasoning by asking who benefits and who is harmed.' },
      { type: 'Ecological', summary: 'Assess long-term consequences for the environment or ecosystem.' },
    ],
    languageBank: [
      { function: 'Judgment', frame: "'This decision was ___ because ___.'" },
      { function: 'Criterion', frame: "'I am judging this by the standard of ___, and based on that ___.'" },
      { function: 'Alternative', frame: "'A better alternative might be ___ because ___.'" },
      { function: 'Equity', frame: "'This is / is not fair because ___. The person most affected is ___.'" },
      { function: 'Ecological', frame: "'The long-term effect on the environment would be ___ because ___.'" },
    ],
    practicePrompts: [
      {
        levelBand: 'Foundation / Development (Pre-A1 to A2)',
        prompt:
          "Was the character's choice a good one? Tell a partner one reason. Was it fair? Who was helped and who was hurt?",
      },
      {
        levelBand: 'Expansion / Mastery (A2 to B2)',
        prompt:
          "Evaluate the character's decision using two criteria. Was there a better alternative? Who bears the cost of this choice? Apply an equity lens to your judgment.",
      },
      {
        levelBand: 'Advanced (B2 to C1)',
        prompt:
          'Evaluate the moral framework implicit in the author’s text. What criteria does the narrative privilege? What perspectives are silenced or marginalised? What are the long-term ecological consequences of the world depicted?',
      },
    ],
    assessmentSnapshot: [
      'Assessment type: Partner discussion.',
      'Assessment form: Listen for evaluation criteria during pair-share.',
      "Formative sequence during Evaluate stage: mark strong evaluations publicly — 'That was an evaluation because you used a criterion.'",
      'Portfolio standard includes best justification paragraph per unit, eco-reasoning reflection per unit at Level 3+, and CEFR self-assessment each term.',
    ],
    teacherAction:
      "Mark strong evaluations publicly: 'That was an evaluation because you used a criterion.'",
    primaryActivity: 'Partner discussion; whole-group accountable talk.',
    ecoExtension:
      "Ecological evaluation asks students to assess decisions by their impact on the non-human world. At Level 2+, introduce the Stewardship Challenge; at Level 4+, add Temporal Extension and Indigenous Perspective.",
    crossStageConnection:
      'Evaluate is the pivot between comprehension and argument. The criterion named in Stage 2 becomes the logical spine of the Stage 3 justification paragraph.',
    accent: 'text-amber-500',
  },
  {
    order: 3,
    slug: 'justify',
    path: '/thinking-cycle/justify',
    studentManualPath: '/thinking-cycle/JE-Stage3-JUSTIFY-Student-Manual.docx',
    studentManualFileName: 'JE-Stage3-JUSTIFY-Student-Manual.docx',
    teacherManualPath: '/thinking-cycle/JE-Stage3-JUSTIFY-Teacher-Manual.docx',
    teacherManualFileName: 'JE-Stage3-JUSTIFY-Teacher-Manual.docx',
    title: 'JUSTIFY',
    line: 'Make your claim. Cite your evidence. Explain the connection. Show the impact.',
    cognitiveOperation:
      'Support claims using textual evidence and rigorous logical reasoning.',
    bloomLevel: '5 (Synthesis / Justification)',
    primaryTarget: 'Construct',
    lessonSlot: '25–35 min',
    intro: [
      'Stage 3: JUSTIFY is the culminating written or oral argument built from the earlier stages.',
      'Students construct a CEIW response by stating a claim, selecting evidence, explaining the warrant, and extending the significance of the argument.',
    ],
    studentExpectations: [
      'State a clear, arguable claim.',
      'Select purposeful textual evidence that directly supports the claim.',
      'Write a warrant that explains why the evidence proves the claim.',
      'Extend to the Impact: the significance or broader implication of the argument.',
      'Anticipate and address counterarguments at Advanced level.',
    ],
    promptBank: [
      { type: 'Full CEIW', summary: "Scaffold the complete four-part structure: 'Write one paragraph: Claim + Evidence + Warrant + Impact.'" },
      { type: 'Claim Isolation', summary: 'Build the claim before constructing the argument.' },
      { type: 'Evidence Only', summary: 'Train purposeful evidence selection with exact quotations.' },
      { type: 'Warrant Prompt', summary: 'Target the most commonly missing component by asking why the quotation proves the claim.' },
      { type: 'Counterargument', summary: 'Introduce adversarial reasoning at advanced level.' },
    ],
    languageBank: [
      { function: 'Claim', frame: "'I believe / argue that ___ because ___.'" },
      { function: 'Evidence', frame: "'The text states: [exact quotation].'" },
      { function: 'Warrant', frame: "'This shows / reveals / demonstrates that ___, which proves ___ because ___.'" },
      { function: 'Impact', frame: "'This is significant because ___ / This pattern suggests that ___.'" },
      { function: 'Counterargument', frame: "'While some might argue ___, the text actually shows ___.'" },
      { function: 'Eco-Justify', frame: "'The text shows that humans have a responsibility to ___ because the evidence reveals ___.'" },
    ],
    practicePrompts: [
      {
        levelBand: 'Foundation / Development (Pre-A1 to A2)',
        prompt:
          "Complete this frame: '___ felt ___ because the text says ___.' Circle the evidence in your text.",
      },
      {
        levelBand: 'Expansion / Mastery (A2 to B2)',
        prompt:
          'Write a Claim + Evidence + Warrant paragraph. Your claim must be arguable, and your warrant must explain WHY the evidence proves the claim.',
      },
      {
        levelBand: 'Advanced (B2 to C1)',
        prompt:
          'Write a full CEIW paragraph including an Impact sentence and one counterargument. Use two pieces of evidence and justify your selection.',
      },
    ],
    assessmentSnapshot: [
      'Assessment type: Written justification.',
      'Assessment form: CEIW paragraph collected and assessed against the Four-Level Rubric.',
      'Formative sequence during Justify stage: respond with written feedback within 24 hours and identify exactly which CEIW component is missing or weak.',
      'Portfolio standard includes best justification paragraph per unit, eco-reasoning reflection per unit at Level 3+, and CEFR self-assessment each term.',
    ],
    teacherAction:
      'Respond with written feedback within 24 hours; identify exactly which CEIW component is missing or weak.',
    primaryActivity:
      'Independent written justification (CEIW); quiet signal; offer sentence frame for Emerging learners.',
    ecoExtension:
      "Eco-justification asks students to construct arguments about human responsibility toward the natural world. At Level 3+, the eco-justification paragraph qualifies as the portfolio best-justification paragraph for eco-designated units.",
    crossStageConnection:
      'Justify depends entirely on Stage 1 evidence and Stage 2 judgment. Skipping or abbreviating the earlier stages weakens the final writing.',
    accent: 'text-jurassic-gold',
  },
  {
    order: 4,
    slug: 'reflect',
    path: '/thinking-cycle/reflect',
    studentManualPath: '/thinking-cycle/JE-Stage4-REFLECT-Student-Manual.docx',
    studentManualFileName: 'JE-Stage4-REFLECT-Student-Manual.docx',
    teacherManualPath: '/thinking-cycle/JE-Stage4-REFLECT-Teacher-Manual.docx',
    teacherManualFileName: 'JE-Stage4-REFLECT-Teacher-Manual.docx',
    title: 'REFLECT',
    line: 'Connect. Transform. Take your thinking beyond the text.',
    cognitiveOperation:
      'Connection of textual themes to personal experience, broader contexts, ethical principles, and the living world.',
    bloomLevel: '6 (Creation / Metacognition)',
    primaryTarget: 'Transfer',
    lessonSlot: '35–40 min',
    intro: [
      'Stage 4: REFLECT is where thought is transferred from the text into life, ethics, and the living world.',
      'This stage asks students to generalise, identify a shift in their own thinking, and articulate a concrete responsibility or commitment where appropriate.',
    ],
    studentExpectations: [
      "Connect the text's theme to personal lived experience with specificity.",
      'Generalise a lesson from the text to the broader human community.',
      'Apply ethical reasoning to the moral questions raised by the text.',
      'Examine how reading the text has changed their own thinking.',
      'Articulate a responsibility toward the living world prompted by the text at Level 3+.',
    ],
    promptBank: [
      { type: 'Personal', summary: 'Build self-awareness and personal connection.' },
      { type: 'Universal', summary: 'Generalise beyond the text to the broader human community.' },
      { type: 'Ethical', summary: 'Apply moral reasoning to how we live our lives.' },
      { type: 'Metacognitive', summary: 'Identify a shift in thought or worldview.' },
      { type: 'Ecological', summary: 'Ask what responsibility the text creates toward the natural world.' },
    ],
    languageBank: [
      { function: 'Personal', frame: "'This connects to my life because ___.'" },
      { function: 'Universal', frame: "'A lesson all people can learn from this is ___ because ___.'" },
      { function: 'Ethical', frame: "'This matters for how we live because ___.'" },
      { function: 'Metacognitive', frame: "'Before reading this, I thought ___. Now I think ___ because ___.'" },
      { function: 'Ecological', frame: "'This story shows that humans and the natural world ___. This matters because ___.'" },
      { function: 'Growth', frame: "'My reasoning grew when I ___ because ___.'" },
    ],
    practicePrompts: [
      {
        levelBand: 'Foundation / Development (Pre-A1 to A2)',
        prompt:
          "Complete: 'This story makes me think about ___.' Write one sentence about what you learned. Tell a partner: 'I would / would not have done the same because ___.'",
      },
      {
        levelBand: 'Expansion / Mastery (A2 to B2)',
        prompt:
          "Write a reflection connecting the story's theme to a real-world situation you know. Include what you noticed in the text, what this makes you think about in life, and why this matters. Add an ecological reflection if applicable.",
      },
      {
        levelBand: 'Advanced (B2 to C1)',
        prompt:
          'Write a metacognitive reflection: how has this text shifted your thinking? What assumption did you hold before reading? What is your responsibility as a result of this text? Include an ecological ethics dimension.',
      },
    ],
    assessmentSnapshot: [
      'Assessment type: Exit ticket.',
      'Assessment form: One Reflect prompt; one complete sentence minimum.',
      'Formative sequence in the last 5 minutes of the lesson: sort responses into Ready / Nearly / Not Yet and use them as planning data for the next lesson.',
      'Portfolio standard includes eco-reasoning reflection per unit at Level 3+ and CEFR self-assessment each term.',
    ],
    teacherAction:
      'Sort responses into 3 piles: Ready / Nearly / Not Yet. Use as planning data for the next lesson.',
    primaryActivity:
      'Exit ticket: one reflection prompt; option: ecological reflection prompt (Level 3+).',
    ecoExtension:
      'Version 3.0 adds the Ecological Reflect prompt as a fifth reflection domain. The target output is a stewardship commitment statement, logged in the Nature Journal and connected to the portfolio eco-reasoning component.',
    crossStageConnection:
      'Reflect is not a cool-down activity. A lesson that ends before Reflect ends at comprehension; the goal of Jurassic English is transformation, not merely understanding.',
    accent: 'text-emerald-500',
  },
];

export const getThinkingCycleStageByPath = (pathname: string) =>
  thinkingCycleStages.find((stage) => stage.path === pathname) ?? null;

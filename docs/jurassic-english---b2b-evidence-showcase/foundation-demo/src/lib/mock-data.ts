export const studentProfile = {
  name: "Leo",
  level: "Foundation 1",
  avatar: "🦖",
  progress: {
    analyze: true,
    evaluate: false,
    justify: false,
    reflect: false,
  },
  fossilWordsFound: 0,
  totalFossilWords: 3,
};

export const currentStory = {
  title: "The Brave Little Triceratops",
  text: "Trixie was a small Triceratops. She loved exploring the Big Valley, but she was sometimes afraid of the dark shadows. One day, her friend Pip got stuck behind a large rock. Trixie had to be brave to push the rock away.",
  fossilWords: ["exploring", "afraid", "brave"],
  bigQuestion: "Why did Trixie push the rock?",
  evaluateOptions: [
    { id: "A", text: "Because she was angry." },
    { id: "B", text: "To help her friend Pip." },
    { id: "C", text: "She wanted to play a game." },
  ],
  correctEvaluateOption: "B",
  justifyOptions: [
    { id: "J1", text: "The text says she was small." },
    { id: "J2", text: "The text says Pip got stuck behind a rock." },
    { id: "J3", text: "The text says she loved the Big Valley." },
  ],
  correctJustifyOption: "J2",
};

export const teacherDashboardData = {
  className: "Foundation Cohort Alpha",
  students: [
    { name: "Leo", status: "EVALUATE", engagement: "High" },
    { name: "Mia", status: "JUSTIFY", engagement: "Medium" },
    { name: "Sam", status: "REFLECT", engagement: "High" },
    { name: "Zoe", status: "ANALYZE", engagement: "Low" },
  ],
  classMastery: {
    analyze: 85,
    evaluate: 70,
    justify: 50,
    reflect: 60,
  }
};

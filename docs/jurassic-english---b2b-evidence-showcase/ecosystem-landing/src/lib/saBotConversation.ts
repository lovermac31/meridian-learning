// Student Academy bot conversation script. All copy here is shown to
// students, parents, and counsellors visiting /student-academy. The
// language is intentionally factual and avoids any guarantees, score
// promises, or "AI tutor / AI grader" framing. See the claims-safety
// list in the project docs for forbidden phrases.

import {
  getSaBotDestination,
  type SaBotDestination,
  type SaBotDestinationKey,
} from "./saBotRoutes";

export type SaBotIntent =
  | "fastestPath"
  | "pathway"
  | "diagnostic"
  | "evidence"
  | "support"
  | "talk";

export type SaBotIntentOption = {
  label: string;
  value: SaBotIntent;
};

export const SA_BOT_WELCOME_MESSAGE =
  "Welcome to Jurassic English™ Student Academy. I can help you understand the five-level pathway, the Student Thinking Diagnostic, portfolio evidence, and how the program supports different learners.";

export const SA_BOT_INTENT_PROMPT =
  "Choose what would help you most right now.";

// "Show me the fastest path" sits at the top — it's the highest-converting
// shortcut for parents/students who want to act quickly. The other intents
// remain for visitors who want context first.
export const SA_BOT_INTENT_OPTIONS: SaBotIntentOption[] = [
  { label: "Show me the fastest path", value: "fastestPath" },
  { label: "Show me the five-level pathway", value: "pathway" },
  { label: "Tell me about the Student Thinking Diagnostic", value: "diagnostic" },
  { label: "How do students show evidence of progress?", value: "evidence" },
  { label: "How does the Academy support different learners?", value: "support" },
  { label: "I want to talk to the Academy team", value: "talk" },
];

export type SaBotSubMenu = {
  prompt: string;
  destinations: SaBotDestination[];
};

export const SA_BOT_BACK_TO_MENU_VALUE = "__sa_menu";
export const SA_BOT_BACK_TO_MENU_LABEL = "Back to the menu";

function dest(key: SaBotDestinationKey) {
  return getSaBotDestination(key);
}

export function getSaBotIntentResponse(intent: SaBotIntent): {
  message: string;
  subMenu: SaBotSubMenu;
} {
  if (intent === "fastestPath") {
    // Per-submenu label overrides — canonical paths are preserved (so the
    // destination allow-list still validates), and the visible text
    // matches the Phase 5 Sprint A conversion spec: lead with the
    // Phase 4 "Try one thinking move" micro-demo, then pathway, then
    // diagnostic.
    return {
      message:
        "The fastest path is simple: try one thinking move on the Interactive Demo, review the five-level pathway, then book a Student Thinking Diagnostic.",
      subMenu: {
        prompt: "Pick the next step.",
        destinations: [
          { ...dest("microDemo"), label: "Try one thinking move (2 min)" },
          { ...dest("pathway"), label: "View the Five-Level Pathway" },
          { ...dest("bookDiagnostic"), label: "Book the Diagnostic" },
        ],
      },
    };
  }

  if (intent === "pathway") {
    return {
      message:
        "The Student Academy is a five-level literature-based pathway. Students move from foundational reading and speaking through structured academic argument and senior-level analysis.",
      subMenu: {
        prompt: "Where would you like to go next?",
        destinations: [
          dest("pathway"),
          dest("thinkingCycle"),
          dest("interactiveDemo"),
          dest("ceiw"),
          dest("bookDiagnostic"),
        ],
      },
    };
  }

  if (intent === "diagnostic") {
    return {
      message:
        "The Student Thinking Diagnostic is how the Academy places a learner. It reviews the student's current reading, speaking, writing, and reasoning, and recommends the level and supports that fit.",
      subMenu: {
        prompt: "Choose what would help you most right now.",
        destinations: [
          dest("diagnosticDetail"),
          dest("everyLearner"),
          dest("bookDiagnostic"),
          dest("faq"),
        ],
      },
    };
  }

  if (intent === "evidence") {
    return {
      message:
        "Students build a growth portfolio of their own work — reading responses, spoken explanations, written arguments, and reflections — so progress is shown through real student artefacts, not a single score.",
      subMenu: {
        prompt: "Choose where to go next.",
        destinations: [
          dest("ceiw"),
          dest("dre"),
          dest("dreOverview"),
          dest("finalCta"),
        ],
      },
    };
  }

  if (intent === "support") {
    return {
      message:
        "The Academy diversifies the route, not the academic demand. Learners may need different ways to read, listen, write, or show their thinking, and the program is designed so every student is still guided toward serious academic English.",
      subMenu: {
        prompt: "Where would you like to go next?",
        destinations: [
          dest("everyLearner"),
          dest("diagnosticDetail"),
          dest("faq"),
          dest("bookDiagnostic"),
        ],
      },
    };
  }

  return {
    message:
      "The Academy team can answer questions about placement, levels, and what fits a particular learner.",
    subMenu: {
      prompt: "Choose how you would like to connect.",
      destinations: [
        dest("bookDiagnostic"),
        dest("finalCta"),
        dest("faq"),
      ],
    },
  };
}

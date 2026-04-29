// Student Academy bot route allow-list and approved destination map.
// All destinations were verified against the rendered /student-academy page
// (anchors and IDs) and a small set of cross-page canonical routes inside
// the ecosystem-landing app. Anything outside this allow-list must not be
// surfaced by the bot.

function normalizePathname(pathname: string) {
  if (!pathname) return "/";
  return pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;
}

// The Student Academy bot is intentionally scoped to /student-academy only.
// Other ecosystem-landing pages keep their existing chrome and do not render
// the bot.
const SA_BOT_ALLOWED_ROUTES = new Set<string>(["/student-academy"]);

export function isSaBotRouteAllowed(pathname: string) {
  return SA_BOT_ALLOWED_ROUTES.has(normalizePathname(pathname));
}

export type SaBotDestinationKey =
  | "bookDiagnostic"
  | "pathway"
  | "thinkingCycle"
  | "ceiw"
  | "dre"
  | "dreOverview"
  | "interactiveDemo"
  | "microDemo"
  | "everyLearner"
  | "diagnosticDetail"
  | "faq"
  | "finalCta";

export type SaBotDestination = {
  key: SaBotDestinationKey;
  label: string;
  path: string;
};

// Verified destinations only. Each path was confirmed to resolve to either
// a real Student Academy section heading ID or a real ecosystem-landing
// route. Do not add destinations here without re-verifying.
const SA_BOT_DESTINATIONS: Record<SaBotDestinationKey, SaBotDestination> = {
  bookDiagnostic: {
    key: "bookDiagnostic",
    label: "Book the Student Thinking Diagnostic",
    path: "/book-diagnostic",
  },
  pathway: {
    key: "pathway",
    label: "See the five-level pathway",
    path: "/student-academy#pathway",
  },
  thinkingCycle: {
    key: "thinkingCycle",
    label: "How students learn to think (the Thinking Cycle)",
    path: "/student-academy#thinking-cycle-heading",
  },
  ceiw: {
    key: "ceiw",
    label: "How students learn to write with evidence (CEIW)",
    path: "/student-academy#ceiw-heading",
  },
  dre: {
    key: "dre",
    label: "How the Digital Reasoning Engine supports thinking",
    path: "/student-academy#dre-heading",
  },
  dreOverview: {
    key: "dreOverview",
    label: "Open the full DRE overview",
    path: "/digital-reasoning-engine",
  },
  interactiveDemo: {
    key: "interactiveDemo",
    label: "Open the Interactive Demo",
    path: "/interactive-demo",
  },
  microDemo: {
    // Phase 5 Sprint A — narrowly scoped destination that points the parent
    // directly at the Phase 4 "Try one thinking move" component. The
    // anchored fragment matches the section id rendered by
    // src/components/interactive-demo/TryOneThinkingMove.tsx.
    key: "microDemo",
    label: "Try one thinking move (2 min)",
    path: "/interactive-demo#try-one-thinking-move",
  },
  everyLearner: {
    key: "everyLearner",
    label: "How the Academy supports different learners",
    path: "/student-academy#every-learner-heading",
  },
  diagnosticDetail: {
    key: "diagnosticDetail",
    label: "What the Diagnostic includes",
    path: "/student-academy#diagnostic-detail",
  },
  faq: {
    key: "faq",
    label: "Read frequently asked questions",
    path: "/student-academy#student-faq-heading",
  },
  finalCta: {
    key: "finalCta",
    label: "Talk to the Academy team",
    path: "/student-academy#student-final-cta-heading",
  },
};

export function getSaBotDestination(
  key: SaBotDestinationKey,
): SaBotDestination {
  return SA_BOT_DESTINATIONS[key];
}

export function isSaBotDestinationAllowed(path: string) {
  return Object.values(SA_BOT_DESTINATIONS).some(
    (destination) => destination.path === path,
  );
}

export const discoveryPageContent = {
  hero: {
    backCta: 'Back to main site',
    eyebrow: 'Discovery Call',
    title: 'The conversation that shapes everything that follows.',
    body: 'A Discovery Call is a structured 45-minute session between your institutional leadership and the WorldWise Learning team. We use it to understand your programme, your constraints, and your goals — before recommending anything.',
    primaryCta: 'Request a Discovery Call',
    secondaryCta: 'Request an Audit Sprint',
    badge: '45 Minutes · Structured',
  },

  qualify: {
    eyebrow: 'Who This Call Is For',
    title: 'Tell us your context. We will shape the conversation around it.',
    body: 'The Discovery Call is designed differently depending on your role. Choose the path that fits you — we will prepare accordingly.',
    paths: [
      {
        role: 'I run a centre',
        icon: 'building',
        headline: 'You want to stop competing on price and start competing on method.',
        body: 'If you run an SME English centre and your programme relies on individual teachers rather than a shared curriculum framework, this call will help you understand what structured alignment looks like — and what it would take to get there.',
        agenda: [
          'Current programme and materials review',
          'Positioning gap vs. CEFR-aligned competitors',
          'Curriculum Coherence Audit Sprint as next step',
          'Pilot structure and investment discussion',
        ],
      },
      {
        role: 'I lead a school',
        icon: 'school',
        headline: 'You need documented curriculum architecture for accreditation or institutional review.',
        body: 'If you lead a school facing CEFR-V compliance, Cambridge or IB accreditation, or an internal programme review cycle, this call gives your leadership team a clear picture of where your English curriculum stands and what a WorldWise Learning partnership would look like in your specific context.',
        agenda: [
          'CEFR-V and MOET 2030 compliance landscape',
          'Current programme posture and gap assessment',
          'WorldWise Learning scope and engagement model',
          'Timeline, documentation, and governance pathway',
        ],
      },
      {
        role: 'I want teacher development',
        icon: 'training',
        headline: 'You want your teachers trained in a methodology that holds up at scale.',
        body: 'If your focus is on building consistent, high-quality classroom delivery across your team — rather than curriculum architecture — this call will map your current teacher capability against the Jurassic English™ Thinking Cycle and iPGCE standards, and identify the right training entry point.',
        agenda: [
          'Current teacher capability and training history',
          'Jurassic Thinking Cycle™ methodology overview',
          'Teacher development pathway and standards review',
          'Training engagement structure and timeline',
        ],
      },
    ],
  },

  expect: {
    eyebrow: 'What to Expect',
    title: 'A structured session. Not a sales call.',
    body: 'Every Discovery Call follows the same format. You will speak directly with the WorldWise Learning academic team — not a business development function.',
    items: [
      {
        step: '01',
        title: 'Programme Context',
        body: 'We start with your programme — your current curriculum, your team structure, your student profile, and the institutional pressures you are navigating. We listen before we recommend.',
      },
      {
        step: '02',
        title: 'Gap and Fit Assessment',
        body: 'We walk through how WorldWise Learning and Jurassic English™ would address your specific context. We are honest about fit — if the methodology is not right for your setting, we will tell you.',
      },
      {
        step: '03',
        title: 'Clear Next Step',
        body: 'The call ends with a documented next step — whether that is an Audit Sprint proposal, a teacher training scope, a curriculum review timeline, or simply a referral to the right resource. No open-ended follow-up loops.',
      },
    ],
  },

  outcomes: {
    eyebrow: 'What You Leave With',
    title: 'A session that produces something concrete.',
    items: [
      'A clear picture of where your programme stands against WorldWise Learning standards',
      'An honest assessment of fit — whether and how we could work together',
      'A documented next step with scope, timeline, and entry point',
      'A written summary of the session sent within 24 hours',
    ],
  },

  cta: {
    eyebrow: 'Request a Discovery Call',
    title: 'Start the conversation.',
    body: 'Submit your enquiry and a member of the WorldWise Learning academic team will respond within two business days to confirm a session time. Please include your role and institutional context in the message field.',
    primaryCta: 'Request a Discovery Call',
    auditCta: 'Request an Audit Sprint instead',
    worldwiseCta: 'View the WorldWise Framework',
    note: 'Discovery Calls are held via video conference. Sessions are typically 45 minutes. All enquiries are reviewed and responded to by the WorldWise Learning academic team — not an automated system.',
  },
} as const;

export function getDiscoveryPageContent() {
  return discoveryPageContent;
}

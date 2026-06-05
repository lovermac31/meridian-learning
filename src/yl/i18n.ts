/**
 * YL trilingual i18n runtime + dictionary — scoped to /young-learners-speaking/.
 *
 * SCOPE: This module powers ONLY the static YL landing page and its BotUI
 * island. It does NOT touch the SPA, the SPA's i18n (src/i18n/*), or the
 * SPA's BotUIChat. The main website's language system is unchanged.
 *
 * LANGUAGE RESOLUTION (in priority order):
 *   1. URL param ?lang=en|vi|zh-CN  (wins, and is persisted to localStorage)
 *   2. localStorage['yls_preferred_language']
 *   3. 'en' (default)
 *
 * The same resolved language drives the page content (via pageI18n.ts) AND
 * the React BotUI (via the useLang() hook), so they always match.
 *
 * EN values below are the source of truth and mirror the static HTML exactly,
 * so switching en→vi→en produces no text drift. VI and zh-CN are professional,
 * meaning-first localizations (not word-for-word). IELTS terminology is kept
 * accurate; no score-promise claims are introduced.
 */

import viStrings from './i18n.vi.json';
import zhCNStrings from './i18n.zh-CN.json';

export const LANGS = ['en', 'vi', 'zh-CN'] as const;
export type Lang = (typeof LANGS)[number];

export const STORAGE_KEY = 'yls_preferred_language';
const PARAM = 'lang';

/** HTML lang attribute value per UI language (zh-CN → zh-Hans is the correct BCP-47 tag). */
export const HTML_LANG: Record<Lang, string> = { en: 'en', vi: 'vi', 'zh-CN': 'zh-Hans' };
/** og:locale per language. */
export const OG_LOCALE: Record<Lang, string> = { en: 'en_GB', vi: 'vi_VN', 'zh-CN': 'zh_CN' };

/** Tolerant normalization of any incoming language string to a supported Lang, or null. */
export function normalizeLang(value: string | null | undefined): Lang | null {
  if (!value) return null;
  const s = value.trim().toLowerCase();
  if (s === 'zh-cn' || s === 'zh' || s === 'zh_cn' || s === 'zh-hans' || s === 'zh-hans-cn') return 'zh-CN';
  if (s === 'vi' || s === 'vi-vn' || s.startsWith('vi')) return 'vi';
  if (s === 'en' || s.startsWith('en')) return 'en';
  return null;
}

let current: Lang = 'en';

/** Resolve and set the active language from URL param → localStorage → 'en'. Idempotent. */
export function resolveInitialLang(): Lang {
  try {
    const url = new URL(window.location.href);
    const fromParam = normalizeLang(url.searchParams.get(PARAM));
    if (fromParam) {
      try {
        localStorage.setItem(STORAGE_KEY, fromParam);
      } catch {
        /* storage may be blocked — non-fatal */
      }
      current = fromParam;
      return current;
    }
    const fromStore = normalizeLang(localStorage.getItem(STORAGE_KEY));
    if (fromStore) {
      current = fromStore;
      return current;
    }
  } catch {
    /* URL/storage unavailable — fall through to default */
  }
  current = 'en';
  return current;
}

export function getLang(): Lang {
  return current;
}

const listeners = new Set<(lang: Lang) => void>();

/** Subscribe to language changes. Returns an unsubscribe function. */
export function subscribeLang(cb: (lang: Lang) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Change the active language: persist, reflect in the URL (?lang=), and notify subscribers. */
export function setLang(lang: Lang): void {
  if (!LANGS.includes(lang) || lang === current) {
    if (lang === current) {
      // still notify so any late subscriber state stays consistent
      listeners.forEach((cb) => {
        try {
          cb(lang);
        } catch {
          /* listener errors must never break language switching */
        }
      });
    }
    return;
  }
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* non-fatal */
  }
  try {
    const url = new URL(window.location.href);
    url.searchParams.set(PARAM, lang);
    window.history.replaceState(null, '', url.toString());
  } catch {
    /* non-fatal */
  }
  listeners.forEach((cb) => {
    try {
      cb(lang);
    } catch {
      /* non-fatal */
    }
  });
}

/** Translate a key for the given (or current) language, falling back to EN, then the key. */
export function t(key: string, lang: Lang = current): string {
  return STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
}

type Dict = Record<string, string>;

/**
 * STRINGS.en is the canonical source of truth and matches the static HTML
 * verbatim. STRINGS.vi and STRINGS['zh-CN'] are professional localizations.
 * Keys are grouped by page region; `botui.*` keys feed the React island.
 */
const en: Dict = {
  // ---- Metadata (head) ----
  'meta.title': 'IELTS Speaking Coaching for Ages 9-18 | Jurassic English',
  'meta.description':
    'Jurassic English provides IELTS-aligned 1-to-1 and small-group speaking coaching for ages 9-18. Book a free 30-minute evaluation online, by house-call, or at a facility location TBA.',
  'meta.ogTitle': 'IELTS Speaking Coaching for Ages 9-18 | Jurassic English',
  'meta.ogDescription':
    'IELTS-aligned speaking coaching for young learners, built around fluency, vocabulary, grammar, pronunciation, confidence, and academic response structure.',
  'meta.twitterTitle': 'IELTS Speaking Coaching for Ages 9-18 | Jurassic English',
  'meta.twitterDescription':
    'Book a free 30-minute IELTS-aligned speaking evaluation for your child.',

  // ---- Nav ----
  'nav.parents': 'Parents',
  'nav.journey': 'Journey',
  'nav.method': 'Method',
  'nav.pricing': 'Pricing',
  'nav.mainSite': 'Main site',
  'nav.freeEval': 'Free evaluation',
  'nav.langLabel': 'Language',

  // ---- Hero ----
  'hero.kicker': 'Jurassic English · Young Learners · Speaking Mastery',
  'hero.h1': 'The head start that reaches <span class="orange">Band 8.5.</span>',
  'hero.subtitle':
    'A structured English-speaking journey for ages 9-18, building the fluency and confidence that open universities and the world.',
  'hero.motto': 'Excavate <span>·</span> Analyze <span>·</span> Justify <span>·</span> Reflect',
  'hero.ctaBook': 'Book a free evaluation',
  'hero.ctaJourney': 'See the journey',
  'hero.age1': 'Later Primary',
  'hero.age1sub': 'Ages 9-11',
  'hero.age2': 'Middle School',
  'hero.age2sub': 'Ages 11-14',
  'hero.age3': 'High School',
  'hero.age3sub': 'Ages 15-18',
  'hero.age4': 'University-Ready',
  'hero.age4sub': 'Band 7-8.5',
  'hero.foot1': 'English-speaking coaching for young learners · Hanoi & online',

  // ---- Parents section ----
  'parents.kicker': 'For parents who think ahead',
  'parents.h2': "Reading and writing aren't the problem. Speaking is.",
  'parents.p':
    'It is the skill that opens universities and careers, and the one that takes longest to build. So we start early.',
  'parents.metric1num': '~73%',
  'parents.metric1': 'of candidates never reach Band 7.0. Speaking is almost always the wall.',
  'parents.metric2num': '16+',
  'parents.metric2': 'the age IELTS is designed for, so the years before it are where fluency is built.',
  'parents.metric3num': '9-18',
  'parents.metric3': 'the window we coach: later primary, middle school, and high school on one path.',
  'parents.calloutH3': 'Why starting early is the real advantage',
  'parents.calloutP':
    'IELTS is not recommended before age 16, and scores last only two years. The smart move is the opposite: use the primary and middle-school years to build confident fluency, so a high band in high school is the natural result.',
  'parents.quoteH3': 'Sound familiar?',
  'parents.quote1': 'She gets top marks in written English, but goes quiet the moment she has to speak.',
  'parents.quote2': "He's taken years of classes, yet freezes in an interview or in front of the class.",
  'parents.quote3': "We can't tell if she's really improving, or just getting older.",
  'parents.quoteP':
    '<strong>If any of these ring true, your child does not need more grammar.</strong> They need structured speaking practice with real feedback, which is exactly what we do.',
  'parents.mini1H': 'University',
  'parents.mini1P': 'Admissions and interviews in English',
  'parents.mini2H': 'Scholarships',
  'parents.mini2P': 'Where speaking sets applicants apart',
  'parents.mini3H': 'Study Abroad',
  'parents.mini3P': 'The band that unlocks the visa',
  'parents.mini4H': 'Confidence',
  'parents.mini4P': 'For class, clubs, and life',

  // ---- Journey section ----
  'journey.kicker': 'The journey · the heart of the programme',
  'journey.h2': 'Three stages, one path: 9 to 18',
  'journey.p': 'Each stage meets your child where they are and builds the skills that matter next.',
  'grid.now': 'Where they are now',
  'grid.build': 'What we build',
  'grid.measure': 'How we measure it',
  'grid.able': "What they'll be able to do",
  'stage1.ageSub': 'Later Primary',
  'stage1.h3': 'Confidence & Foundations',
  'stage1.sub': 'Learn to enjoy speaking, and never fear it.',
  'stage1.cefr': 'CEFR<br>A2 to B1',
  'stage1.now': 'Often shy to speak, even when they know the words. They translate in their head and stop when it gets hard.',
  'stage1.build': 'Confidence to speak without fear, clear pronunciation habits, core fluency, everyday vocabulary, and a love of ideas and stories.',
  'stage1.measure': 'Playful speaking tasks and short recordings, with a simple progress note parents can follow.',
  'stage1.able': 'Speak up happily, describe and explain in connected sentences, and arrive at middle school years ahead.',
  'stage2.ageSub': 'Middle School',
  'stage2.h3': 'Structure & Range',
  'stage2.sub': 'From simple answers to real ideas.',
  'stage2.cefr': 'CEFR B1-B2<br>Band 5.5-6.5',
  'stage2.now': 'Can chat, but answers are short and repetitive. They avoid harder structures and repeat safe words.',
  'stage2.build': 'Organised ideas, precise vocabulary, opinions with reasons, and the first real exam-style awareness.',
  'stage2.measure': 'The Four-Pillar method begins: fluency, vocabulary, grammar, and pronunciation tracked each lesson.',
  'stage2.able': 'Develop an idea across several sentences, give opinions confidently, and sit on a Band 6 trajectory.',
  'journey.benefit1H': 'Start early, finish ahead',
  'journey.benefit1P': 'Years of confident speaking compound, so the exam becomes the easy part, not a teenage cram.',
  'journey.benefit2H': 'Confidence before pressure',
  'journey.benefit2P': 'We build the voice first, long before stakes and deadlines get high.',
  'journey.benefit3H': 'One teacher, one path',
  'journey.benefit3P': 'No starting over each year. Your child grows along a single deliberate journey.',

  // ---- High-school section ----
  'hs.kicker': 'High school · ages 15-18',
  'hs.h2': 'Where it all comes together',
  'hs.p': 'The full IELTS Speaking method: calm, confident, exam-ready, Band 6.5 to 8.5.',
  'stage3.ageSub': 'High School',
  'stage3.h3': 'Mastery & the Exam',
  'stage3.sub': 'The full IELTS Speaking method: Band 6.5 to 8.5.',
  'stage3.cefr': 'CEFR B2-C2<br>Band 6.5-8.5',
  'stage3.now': 'Capable speakers who need to convert ability into a real high IELTS band for university and study-abroad applications.',
  'stage3.build': 'Abstract Part 3 argument, precision and idiom, advanced grammar under pressure, prosody, and full mock readiness.',
  'stage3.measure': 'Formal half-band ratings, a full recorded mock, and a portfolio your child keeps as evidence of progress.',
  'stage3.able': 'Walk into the test calm and ready, targeting Band 7 to 8.5, and speak fluently in interviews and seminars for years after.',
  'hs.calloutH3': 'The full band ladder, inside high school',
  'hs.calloutP': 'The high-school stage runs the complete six-step ladder: 5.0 to 6.0, 6.0 to 6.5, 6.5 to 7.0, 7.0 to 7.5, 7.5 to 8.0, and 8.0 to 8.5. Each step is grounded in the official IELTS descriptors.',
  'hs.unlockH3': 'What a high band actually unlocks',
  'hs.unlock1band': 'Band 6.5-7.0',
  'hs.unlock1': 'Most undergraduate programmes worldwide, and many university scholarships.',
  'hs.unlock2band': 'Band 7.0-7.5',
  'hs.unlock2': 'Top-ranked universities, competitive courses, and skilled-migration visas.',
  'hs.unlock3band': 'Band 8.0-8.5',
  'hs.unlock3': 'Elite admissions and applications that genuinely stand out from the crowd.',

  // ---- Method section ----
  'method.kicker': 'A real method, not chat in English',
  'method.h2': 'How we actually teach speaking',
  'method.p': 'Diagnosed and trained, then measured on the same four pillars examiners use.',
  'method.card1tag': 'Fluency',
  'method.card1h': 'Speaking smoothly',
  'method.card1p': 'Connected, confident speech without long pauses, restarts, or freezing.',
  'method.card2tag': 'Vocabulary',
  'method.card2h': 'The right words',
  'method.card2p': 'Precise, varied vocabulary that grows with age, beyond "good" and "things."',
  'method.card3tag': 'Grammar',
  'method.card3h': 'Accurate sentences',
  'method.card3p': 'Complex structures kept correct, even when the topic gets harder.',
  'method.card4tag': 'Pronunciation',
  'method.card4h': 'Easy to understand',
  'method.card4p': 'Clear rhythm, stress, and sounds, so listeners never have to strain.',
  'method.move1h': 'Excavate',
  'method.move1p': 'Find what is holding your child back.',
  'method.move2h': 'Analyze',
  'method.move2p': 'Target the one or two things that help most.',
  'method.move3h': 'Justify',
  'method.move3p': 'Practice real ideas under rising challenge.',
  'method.move4h': 'Reflect',
  'method.move4p': 'Listen back to lock in every gain.',
  'method.sessionH3': 'A typical 60-minute session',
  'method.session1b': 'Opening focus',
  'method.session1h': 'Warm-up & focus',
  'method.session1p': "Settle in and set today's clear target.",
  'method.session2b': 'Main practice',
  'method.session2h': 'Guided practice',
  'method.session2p': 'The real speaking work, recorded for review.',
  'method.session3b': 'Correction loop',
  'method.session3h': 'Feedback & re-try',
  'method.session3p': 'Hear it, fix it, say it again, better.',
  'method.session4b': 'Take-home plan',
  'method.session4h': 'Reflect & plan',
  'method.session4p': 'One small thing to practice before next time.',
  'method.takehomeH3': 'What your child takes home',
  'method.takehome1': 'A recorded portfolio: their voice now vs. months later.',
  'method.takehome2': 'A Four-Pillar progress tracker you can follow.',
  'method.takehome3': 'A plain-language progress report for the family.',
  'method.takehome4': 'A personal handbook and practice they enjoy.',
  'method.takehome5': 'The habit of reflecting and improving alone.',
  'method.takehome6': 'Confidence that shows up beyond English class.',
  'evidence.kicker': 'IELTS-aligned academic speaking',
  'evidence.h3': 'Built from public IELTS criteria, Cambridge English principles, and proven speaking research',
  'evidence.lead': 'Our method is designed to make students sound academically acceptable, organized, and proficient: not memorized, not over-rehearsed, and not casual conversation dressed up as IELTS preparation.',
  'evidence.item1b': 'IELTS Speaking Criteria',
  'evidence.item1p': 'Every evaluation and progress note maps to the public IELTS Speaking pillars: fluency and coherence, lexical resource, grammatical range and accuracy, and pronunciation.',
  'evidence.item2b': 'Cambridge / CEFR Pathway',
  'evidence.item2p': 'Tasks move from supported personal answers to academic explanation, comparison, justification, and reflection, matching the communicative progression described in CEFR-based Cambridge English teaching.',
  'evidence.item3b': 'Academic Output Practice',
  'evidence.item3p': 'Students learn to extend answers, organize ideas, explain reasons, qualify opinions, and repair weak language: the behaviors that make spoken English sound academically mature.',
  'evidence.item4b': 'Feedback + Re-try Loop',
  'evidence.item4p': 'Short recorded tasks, targeted corrective feedback, and immediate re-speaking turn mistakes into usable skill rather than passive grammar knowledge.',
  'evidence.p': 'The result is a 100% IELTS-aligned training pathway in the practical sense: lesson targets, speaking tasks, feedback, and parent reports are all organized around the same public criteria used to describe IELTS Speaking performance.',
  'evidence.ref1': 'IELTS public Speaking band descriptors: fluency and coherence, lexical resource, grammatical range and accuracy, pronunciation.',
  'evidence.ref2': 'Cambridge English / CEFR-aligned progression: communicative competence, spoken production, spoken interaction, and increasing control across levels.',
  'evidence.ref3': 'Assessment-for-learning: clear goals, evidence of performance, feedback, and next-step action.',
  'evidence.ref4': 'Second-language speaking research: output practice, interaction, corrective feedback, retrieval, and reflection improve spoken fluency and accuracy over time.',
  'evidence.disclaimer': 'Jurassic English is IELTS-aligned; it is not officially endorsed by IELTS, Cambridge, British Council, or IDP. Band goals are training targets, not score guarantees.',

  // ---- Why-families section ----
  'why.kicker': 'Why families choose Jurassic English',
  'why.h2': 'More than a tutor',
  'why.p': 'A specialist method, measured progress, and a caring structured place your child looks forward to.',
  'why.benefit1H': 'Progress you can see',
  'why.benefit1P': 'Every lesson is scored and tracked. You get clear reports, not vague reassurance.',
  'why.benefit2H': 'Age-appropriate, always',
  'why.benefit2P': "Tasks, topics, and pace match your child's stage, from playful primary to exam-focused high school.",
  'why.benefit3H': 'More than an exam',
  'why.benefit3P': 'We build critical thinking, confidence, and global-mindedness: skills that last after the test.',
  'why.benefit4H': 'One connected path',
  'why.benefit4P': 'No starting over each year. Your child grows along a single deliberate journey to Band 7-8.5.',
  'why.benefit5H': 'Evidence, not promises',
  'why.benefit5P': 'A recorded portfolio lets you hear how far your child has come.',
  'why.benefit6H': 'In person or online',
  'why.benefit6P': 'Coaching in Hanoi or live online worldwide, the same method wherever you are.',
  'why.calloutH3': "Your child's privacy comes first",
  'why.calloutP': 'Recordings are made only with parent consent, stored securely, used solely to help your child improve, and deleted at the end of the programme unless you ask to keep the portfolio.',

  // ---- Pricing section ----
  'pricing.kicker': 'Getting started',
  'pricing.h2': 'Programmes & family pricing',
  'pricing.p': "Begin with a free diagnostic to find your child's level and the right starting point.",
  'pricing.startHere': 'Start here',
  'pricing.card1h': 'Free Evaluation',
  'pricing.card1price': 'Free',
  'pricing.card1p': '30 minutes. Online with good internet and microphone, house-call, or facility location TBA.',
  'pricing.card2h': 'Self-Study Toolkit',
  'pricing.card2p': 'Handbook, activities, and video guides for habits at home.',
  'pricing.card3h': 'Group Cohort',
  'pricing.card3p': 'Max 6, six weeks. Peers motivate, live coaching corrects.',
  'pricing.privateH3': 'Private 1-on-1 coaching: choose your commitment',
  'pricing.th1': 'Commitment',
  'pricing.th2': 'Price',
  'pricing.th3': 'Per lesson',
  'pricing.th4': 'Save',
  'pricing.th5': 'Best for',
  'pricing.row1name': 'Pay-as-you-go',
  'pricing.row1best': 'Trying the method',
  'pricing.row2name': 'Monthly',
  'pricing.row2best': 'Steady term-time progress',
  'pricing.row3name': '6-Month Journey · Best Value',
  'pricing.row3best': 'A multi-band climb plus Band 7 Target Pathway',
  'pricing.row4name': 'Annual Mastery',
  'pricing.row4best': 'Long-runway journeys to Band 8+',
  'pricing.flexNoteH': 'Flexible family payment options',
  'pricing.flexNoteP': 'Keep the training plan strong while choosing a payment rhythm that fits your household budget.',
  'pricing.flex1Badge': 'Monthly Flex',
  'pricing.flex1H': 'Smaller monthly entry',
  'pricing.flex1P': 'Pay monthly, split into two smaller payments, or arrange a weekly rhythm after the free evaluation.',
  'pricing.flex2Badge': 'Recommended',
  'pricing.flex2H': '6-Month Journey',
  'pricing.flex2P': 'Monthly, biweekly, or weekly payments are available while your child keeps the full 48-lesson pathway.',
  'pricing.flex3Badge': 'Long runway',
  'pricing.flex3H': 'Annual Mastery',
  'pricing.flex3P': 'Choose monthly, quarterly, or upfront payment for a full-year Band 8+ speaking journey.',
  'pricing.flex4Badge': 'Deadline support',
  'pricing.flex4H': 'Exam Sprint',
  'pricing.flex4P': 'Pay in full or split the sprint across two to four payments before the exam window.',
  'pricing.flexTrust1': 'First payment secures lesson slots.',
  'pricing.flexTrust2': 'Bank transfer, QR, or international card options where available.',
  'pricing.flexTrust3': 'No hidden finance fee on standard monthly plans.',
  'pricing.flexCta': 'Ask about a flexible payment plan',
  'pricing.whichH3': 'Which is right for my child?',
  'pricing.which1h': 'Younger / just starting (9-13)',
  'pricing.which1p': 'Build confidence in a <strong>Group Cohort</strong> or with the <strong>Self-Study Toolkit</strong>.',
  'pricing.which2h': 'Building toward the exam (14-16)',
  'pricing.which2p': 'Steady 1-on-1 progress on the <strong>Monthly</strong> or <strong>6-Month</strong> plan.',
  'pricing.which3h': 'Exam within 3 months (16-18)',
  'pricing.which3p': 'Go intensive with the <strong>Exam Sprint</strong> or <strong>1-on-1</strong>.',

  // ---- Booking (dark-final) ----
  'book.kicker': 'Who will teach your child',
  'book.h2': 'Coaching built on a real method',
  'book.teacherName': 'Mr. Jay Adams',
  'book.teacherRole': 'Founder & Lead Coach · WorldWise Learning · Jurassic English',
  'book.teacherBio': 'An international educator who designs standards-aligned English programmes mapped to CEFR and built on assessment-for-learning principles. Mr. Adams specialises in IELTS Speaking and confident, durable spoken fluency for young learners.',
  'book.giftP': '<strong>The gift that lasts.</strong> The confidence to speak English well does not just pass an exam. It changes which universities, scholarships, and careers are open to your child.',
  'book.step1h': 'Get in touch',
  'book.step1p': 'Message us on Zalo or email info@jurassicenglish.com.',
  'book.step2h': "Get your child's plan",
  'book.step2p': 'We arrange the 30-minute free evaluation and share their level and next step.',
  'book.step3h': 'Start the journey',
  'book.step3p': 'In Hanoi or live online, at exactly the right level.',
  'book.bookingH2': 'Book a free evaluation session',
  'book.bookingP': "To arrange your child's 30-minute free speaking evaluation, complete the parent inquiry form, scan to chat on Zalo, or use the contact details below.",
  'book.formKicker': 'Parent inquiry form',
  'book.formH3': "Tell us your child's age, speaking goal, and best evaluation time.",
  'book.formP': 'Choose online evaluation, house-call, or facility location TBA. Online evaluations require a good internet connection and microphone.',
  'book.openForm': 'Open evaluation form',
  'book.formQrLabel': 'Online form · Free evaluation request',
  'book.zaloLabel': 'Zalo · Chat to book',
  'book.websiteLabel': 'Our website',
  'book.emailBtn': 'Email to book',

  // ---- Certifications strip (quiet YL logo marquee) ----
  'certstrip.label': 'Aligned with international English standards',
  'certstrip.note': 'Teaching credentials, assessment frameworks, and academic English references.',

  // ---- BotUI (React island) ----
  'botui.bubbleAria': 'Open parent guide chat',
  'botui.bubbleTooltip': 'Parent guide',
  'botui.headerTitle': 'Parent guide',
  'botui.headerSubtitle': 'IELTS Speaking, ages 9-18 · no personal info collected',
  'botui.closeAria': 'Close parent guide chat',
  'botui.greeting': "Hi! I'm here to help parents explore IELTS Speaking coaching for ages 9-18. What would you like to know? Tap a question below.",
  'botui.resetMsg': 'Back to the start. What else would you like to know? Tap a question below.',
  'botui.startOver': 'Start over',
  'botui.privacyNote': "This guide doesn't collect personal info. Your child's details stay with the booking form.",
  'botui.chip.programme.label': 'What is the programme?',
  'botui.chip.programme.reply': 'We run IELTS-aligned 1-to-1 and small-group speaking coaching for ages 9-18. Sessions use the public IELTS Speaking criteria, CEFR-aligned progression, recorded practice, and corrective feedback. Parents receive progress reports.',
  'botui.chip.journey.label': "What does my child's journey look like?",
  'botui.chip.journey.reply': 'A typical journey starts with a free 30-minute speaking evaluation. From there, we recommend a session format (1-to-1 or small-group) and build a structured path through fluency, vocabulary, grammar, pronunciation, and academic response shape.',
  'botui.chip.pricing.label': 'How much does it cost?',
  'botui.chip.pricing.reply': 'Pricing varies by session format and frequency. The pricing section on this page shows current rates for 1-to-1 and small-group coaching.',
  'botui.chip.book.label': 'How do I book a free evaluation?',
  'botui.chip.book.reply': 'You can book a free 30-minute speaking evaluation three ways: open the parent inquiry form, scan the Zalo QR to chat, or email us. All three are in the booking section below — no info required to start.',
  'botui.chip.email.label': 'Email a question ↗',
  'botui.chip.email.reply': "Sure — happy to answer by email. I'll open a draft to info@jurassicenglish.com so you can write whatever you'd like to know.",
  'botui.cta.jumpTo': 'Jump to {x} →',
  'botui.cta.openEmail': 'Open email ↗',
  'botui.cta.emailToBook': 'Email to book ↗',
  'botui.anchor.method': 'method',
  'botui.anchor.journey': 'journey',
  'botui.anchor.pricing': 'pricing',
  'botui.anchor.book': 'booking',
};

const vi: Dict = viStrings as Dict;

const zhCN: Dict = zhCNStrings as Dict;

export const STRINGS: Record<Lang, Dict> = {
  en,
  vi,
  'zh-CN': zhCN,
};

import { ArrowRight, ArrowUpRight, BookOpen, Gift, Mail, MessageCircle, ShieldCheck, Users } from "lucide-react";
import { REWARD, ROUTE as FAMILY_REWARDS_ROUTE } from "@/lib/familyRewards/terms";
import { BOOKS_BASE_URL, levelHref } from "@/lib/academy/levelBooks";

// Student Academy (human-centered overhaul, revised spec §3 Page B).
// Plain-language copy for parents. Every image is a storybook illustration
// and is labelled as one; the Maya lesson is an illustrative teaching
// example (badged), never presented as real student work. Under-18 sessions
// are never recorded, so the Growth Portfolio is written evidence only.
// White text only on #1E4D3B or #B45309; #D97706 is decorative.

const IMG = "/images/overhaul";
const STORY_QUEST = "https://worldwise-story-quest.vercel.app/#home";
const EMAIL = "mailto:info@jurassicenglish.com?subject=Reading%20%26%20Thinking%20Placement%20Consultation";
const ZALO = "https://zalo.me/84396085076";
// The two doors parents look for first (W-1, Jay 27 Oct 2026): the free books and Story Club, one compact row.
const FREE_BOOKS = `${BOOKS_BASE_URL}/?utm_source=academy`;
const STORY_CLUB = "/story-club?utm_source=academy";

const PRIMARY =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-2.5 text-center text-sm font-extrabold text-white transition hover:bg-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";
const SECONDARY =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#1E4D3B]/30 bg-white px-5 py-2.5 text-center text-sm font-bold text-[#1E4D3B] transition hover:border-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";
const DOOR =
  "flex min-h-14 items-center gap-3 rounded-[1.25rem] border border-[#E6DEC8] bg-white px-4 py-3 font-extrabold text-[#1E4D3B] transition hover:border-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";
const EYEBROW = "text-xs font-bold uppercase tracking-[0.14em] text-[#B45309]";
const H2 = "text-2xl font-extrabold leading-tight text-[#1E4D3B] sm:text-3xl";

const STEPS = [
  { title: "Start calm & curious.", body: "A relaxed warm-up and pre-taught story words (Word Fossils), so even shy learners feel safe to share." },
  { title: "Explore a real book together.", body: "Guided by Professor Rex across four illustrated story worlds, students notice character choices, dilemmas and themes." },
  { title: "Look closely, weigh the choices, prove it, connect it.", body: "Our 4-step thinking routine (Analyze · Evaluate · Justify · Reflect) turns a quick opinion into a reason backed by the text." },
  { title: "Add to your child’s Growth Portfolio.", body: "Written Word Fossil vocabulary logs, before-and-after paragraph revisions and written teacher observation notes, shared in a plain-language parent update." },
];

const COACHED = [
  { tag: "1. Point", color: "bg-[#E6F4EA] text-[#137333]", text: "“I think Maya made the right choice...”" },
  { tag: "2. Proof", color: "bg-amber-100 text-[#B45309]", text: "“...because she fires her last dry flare to warn the lost fishing crew about the reef...”" },
  { tag: "3. Explain", color: "bg-teal-50 text-[#0F766E]", text: "“...which shows she values saving several lives right now over keeping a backup for herself.”" },
];

const LEVELS = [
  { n: 1, level: "Level 1 · Foundation", world: "Mistwood Harbor", cefr: "Pre-A1 / A1", image: "world-01-mistwood-harbor", body: "Picture-rich stories, speaking in full sentences without fear, and linking an opinion to a story detail with a “Because Bridge.”" },
  { n: 2, level: "Level 2 · Early Reasoner", world: "Whispering Woods", cefr: "A1 / A2", image: "world-02-whispering-woods", body: "Explaining why characters make tough choices, Word Fossil notebooks, and clear 3–4 sentence story responses." },
  { n: 3, level: "Level 3 · Developing Analyst", world: "The Grand Archive", cefr: "A2 / B1", image: "world-03-grand-archive", body: "Leading small-group discussions, comparing two viewpoints, and analytical paragraphs backed by quotes." },
  { n: 4, level: "Level 4 · Academic Builder", world: "Cloudpeak Observatory", cefr: "B1 / B2", image: "world-04-cloudpeak-observatory", body: "Multi-paragraph essays with clear principles, academic vocabulary and seminar-style debate." },
  { n: 5, level: "Level 5 · Advanced Thinker", world: "University & Exam Bridge", cefr: "B2 / C1", image: "", body: "Handling counter-arguments and carrying reasoning into IELTS, IB, IGCSE and Cambridge essays and interviews." },
];

// Smaller width variants live in /images/overhaul/w/<name>-<width>.webp; the
// original file stays the largest candidate (and the src fallback).
function srcSetFor(name: string, widths: number[], originalWidth: number) {
  return [...widths.map((w) => `${IMG}/w/${name}-${w}.webp ${w}w`), `${IMG}/${name}.webp ${originalWidth}w`].join(", ");
}

const WORLD_SIZES = "(min-width: 1280px) 230px, (min-width: 1024px) calc(20vw - 26px), (min-width: 640px) calc(50vw - 34px), calc(100vw - 32px)";

function Illustration({ src, alt, className, eager = false, width, height, sizes }: { src: string; alt: string; className: string; eager?: boolean; width: number; height: number; sizes: string }) {
  return (
    <figure className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`${IMG}/${src}.webp`} srcSet={srcSetFor(src, [480, 800, 1200], width)} sizes={sizes} alt={alt} width={width} height={height} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} decoding="async" className={className} />
      <figcaption className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#1E4D3B]">Illustration</figcaption>
    </figure>
  );
}

export function StudentAcademyOverhaul({ familyRewards = false }: { familyRewards?: boolean }) {
  return (
    <div className="bg-[#FAF7F2] text-[#1C2526]">
      {/* Hero */}
      <section className="px-4 pb-12 pt-10 sm:px-6">
        <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <p className={EYEBROW}>Reading & Story Adventures · Ages 6–14 · Levels 1–5 · Hanoi & live online</p>
            <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.1] text-[#1E4D3B] sm:text-[2.6rem]">
              Great stories turn quiet readers into confident thinkers, speakers, and writers.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#4A5568] sm:text-lg">
              Most English classes stop at vocabulary lists and fill-in-the-blank worksheets. Here, your child reads
              real storybooks, talks through big questions with peers, and builds a written Growth Portfolio you can
              read every month.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#diagnostic" className={PRIMARY}>
                Request a Reading Placement Consultation <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a href={STORY_QUEST} target="_blank" rel="noopener" className={SECONDARY}>
                Play the Free 2-Min Story Quest (ages 6–12) <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-5 flex items-start gap-2 text-sm font-semibold text-[#137333]">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none" />
              Sessions with learners under 18 are never recorded.
            </p>
          </div>
          <Illustration
            src="hero-story-expedition"
            alt="Storybook illustration: Professor Rex and young explorers gathered around an illustrated map of story worlds"
            width={1400}
            height={788}
            sizes="(min-width: 1280px) 592px, (min-width: 1024px) calc(50vw - 48px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
            eager
            className="aspect-[16/9] w-full rounded-[1.75rem] border border-[#E6DEC8] object-cover"
          />
        </div>
        <ul aria-label="Start here" className="mx-auto mt-8 grid max-w-7xl gap-3 sm:grid-cols-2">
          <li>
            <a href={FREE_BOOKS} target="_blank" rel="noopener" className={DOOR} data-door="free-books">
              <BookOpen aria-hidden="true" className="h-5 w-5 flex-none text-[#B45309]" />
              <span className="flex-1">Free storybooks: read Story 1 of every level</span>
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 flex-none" />
            </a>
          </li>
          <li>
            <a href={STORY_CLUB} className={DOOR} data-door="story-club">
              <Users aria-hidden="true" className="h-5 w-5 flex-none text-[#B45309]" />
              <span className="flex-1">Story Club with Mr. Jay (ages 5–8) · Saturdays 9:00</span>
              <ArrowRight aria-hidden="true" className="h-4 w-4 flex-none" />
            </a>
          </li>
        </ul>
      </section>

      {/* How every lesson works + thinking map */}
      <section className="border-y border-[#E6DEC8] bg-white px-4 py-14 sm:px-6" aria-labelledby="lesson-heading">
        <div className="mx-auto max-w-7xl">
          <h2 id="lesson-heading" className={H2}>How every lesson works, for confident and shy learners</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-2">
            <ol className="space-y-5">
              {STEPS.map((step, i) => (
                <li key={step.title} className="flex gap-4">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#1E4D3B] text-sm font-extrabold text-white">{i + 1}</span>
                  <div>
                    <p className="font-extrabold text-[#1E4D3B]">{step.title}</p>
                    <p className="mt-1 text-[#4A5568]">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <Illustration
              src="thinking-cycle-storybook-map"
              alt="Illustrated explorer journal map of the 4-Step Thinking Cycle: Analyze, Evaluate, Justify, Reflect"
              width={1400}
              height={788}
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) calc(50vw - 40px), (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)"
              className="aspect-[16/9] w-full rounded-[1.25rem] border border-[#E6DEC8] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Illustrative teaching example */}
      <section className="px-4 py-14 sm:px-6" aria-labelledby="example-heading">
        <div className="mx-auto max-w-5xl">
          <p className="inline-flex rounded-full border border-[#D97706] bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.1em] text-[#B45309]">Illustrative Teaching Example</p>
          <h2 id="example-heading" className={`${H2} mt-3`}>From a one-line opinion to a supported explanation</h2>
          <blockquote className="mt-5 rounded-2xl border-l-4 border-[#1E4D3B] bg-white p-4 italic leading-relaxed">
            “As the storm rose, Maya looked at her last dry flare. She could save it to signal the rescue boat for
            herself, or fire it now so the lost fishing crew could see the reef.”
          </blockquote>
          <div className="mt-4 grid overflow-hidden rounded-[1.25rem] border border-[#E6DEC8] bg-white md:grid-cols-2">
            <div className="p-5">
              <p className="font-extrabold text-[#1E4D3B]">Typical uncoached answer</p>
              <p className="mt-2 italic text-[#4A5568]">“Yes, I think Maya made a good choice because she is very brave and kind to other people.”</p>
            </div>
            <div className="border-t border-[#E6DEC8] p-5 md:border-l md:border-t-0">
              <p className="font-extrabold text-[#1E4D3B]">Coached: Point + Proof + Explain</p>
              <ul className="mt-2 space-y-2 text-sm">
                {COACHED.map((b) => (
                  <li key={b.tag}>
                    <span className={`mr-2 rounded px-1.5 py-0.5 text-xs font-extrabold ${b.color}`}>{b.tag}</span>
                    <span className="italic">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Five-level pathway */}
      <section className="border-y border-[#E6DEC8] bg-white px-4 py-14 sm:px-6" aria-labelledby="levels-heading">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${IMG}/w/professor-rex-mascot-160.webp`} alt="Professor Rex, the storybook dinosaur guide of Jurassic English Story Quest (illustration)" width={80} height={80} loading="lazy" decoding="async" className="h-16 w-16 flex-none rounded-2xl object-cover" />
            <h2 id="levels-heading" className={H2}>The 5-level pathway, placed by readiness, not just age</h2>
          </div>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {LEVELS.map((lv) => (
              <li key={lv.level} className="flex flex-col overflow-hidden rounded-[1.25rem] border border-[#E6DEC8] bg-[#FAF7F2]">
                {lv.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`${IMG}/${lv.image}.webp`} srcSet={srcSetFor(lv.image, [480, 800], 1200)} sizes={WORLD_SIZES} alt={`Storybook illustration of ${lv.world}`} width={1200} height={676} loading="lazy" decoding="async" className="aspect-[16/9] w-full object-cover" />
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center bg-[#1E4D3B] px-4 text-center text-sm font-extrabold text-white">{lv.world}</div>
                )}
                <div className="p-4">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#B45309]">{lv.level}</p>
                  <p className="mt-1 font-extrabold text-[#1E4D3B]">{lv.world}</p>
                  <p className="mt-1 inline-flex rounded-full bg-[#E6F4EA] px-2.5 py-0.5 text-xs font-bold text-[#137333]">{lv.cefr}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#4A5568]">{lv.body}</p>
                </div>
                <a href={levelHref(lv.n)} className={`${PRIMARY} mx-4 mb-4 mt-auto`}>
                  Open Level {lv.n} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Placement consultation */}
      <section id="diagnostic" className="scroll-mt-24 px-4 py-14 sm:px-6" aria-labelledby="diagnostic-heading">
        <div className="mx-auto max-w-3xl text-center">
          <h2 id="diagnostic-heading" className={H2}>Start with a friendly 45-minute Reading & Thinking Placement Consultation</h2>
          <p className="mt-3 font-bold text-[#1E4D3B]">No test stress. No pass or fail. Just a clear picture of how your child reads, speaks, and thinks.</p>
          <p className="mt-3 leading-relaxed text-[#4A5568]">
            Send us a request by email or Zalo. We review a short reading and writing sample with your child, then send a
            written placement note with their recommended Level (1–5) and class options for your time zone. Sessions
            with learners under 18 are never recorded.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a href={EMAIL} className={PRIMARY}>
              <Mail aria-hidden="true" className="h-4 w-4" /> Request by email
            </a>
            <a href={ZALO} target="_blank" rel="noopener" className={SECONDARY}>
              <MessageCircle aria-hidden="true" className="h-4 w-4" /> Message on Zalo (+84 396 085 076)
            </a>
          </div>
          <p className="mt-4 text-sm text-[#4A5568]">
            Want to try first?{" "}
            <a href={STORY_QUEST} target="_blank" rel="noopener" className="font-bold text-[#1E4D3B] underline underline-offset-4">
              Play the free 2-minute Story Quest
            </a>{" "}
            (ages 6–12). Is your child already a confident reader who is quiet out loud?{" "}
            <a href="/young-learners-speaking/" className="font-bold text-[#1E4D3B] underline underline-offset-4">See Speaking Confidence &amp; Teen IELTS</a>.
          </p>
        </div>
      </section>

      {/* Family Rewards: deliberately compact (the page has a 550-word
          ceiling in scripts/verify-overhaul.mjs). All terms live on the
          referrals page. Rendered only while the release gate is open. */}
      {familyRewards ? (
        <section className="px-4 pb-14 sm:px-6" aria-labelledby="family-rewards-heading">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-[1.25rem] border border-[#E6DEC8] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Gift aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none text-[#B45309]" />
              <div>
                <h2 id="family-rewards-heading" className="font-extrabold text-[#1E4D3B]">Family Rewards</h2>
                <p className="mt-1 text-sm text-[#4A5568]">Introduce a new family; earn {REWARD} tuition credit.</p>
              </div>
            </div>
            <a href={FAMILY_REWARDS_ROUTE} className={`${SECONDARY} flex-none`}>
              How it works <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </a>
          </div>
        </section>
      ) : null}
    </div>
  );
}

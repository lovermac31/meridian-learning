import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Download,
  GraduationCap,
  LockKeyhole,
  Mail,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { ResourceDeckExplorer } from "@/components/student-academy/ResourceDeckExplorer";

const canonical = "https://jurassicenglish.com/student-academy/resources";

const PAGE_LD = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${canonical}#webpage`,
  url: canonical,
  name: "Student Learning Deck | Jurassic English™",
  description:
    "Explore an illustrative Student Academy sample, the free Story Quest, and how learner and educator materials are organised.",
  isPartOf: { "@id": "https://jurassicenglish.com/#website" },
  about: { "@id": "https://jurassicenglish.com/#student-academy-course" },
  inLanguage: "en",
};

export const metadata: Metadata = {
  title: "Student Learning Deck | Jurassic English™",
  description:
    "Preview the Jurassic English Student Academy learning deck: try a free story quest, explore level examples, and see what families and educators receive.",
  alternates: { canonical: "/student-academy/resources" },
  openGraph: {
    title: "Student Learning Deck | Jurassic English™",
    description:
      "A parent-friendly look inside our story-based learning experience, with a free original sample activity.",
    type: "website",
    siteName: "Jurassic English™",
    url: "/student-academy/resources",
    images: [
      {
        url: "/images/overhaul/thinking-cycle-storybook-map.webp",
        width: 1200,
        height: 630,
        alt: "Illustrated map of the Jurassic English Student Academy thinking cycle",
      },
    ],
  },
  robots: { index: true, follow: true },
};

const FOUR_STEPS = [
  { n: "01", title: "Free interactive preview", description: "Play the existing two-minute Story Quest to experience a guided story decision. It is a separate activity from this resource deck.", icon: Sparkles },
  { n: "02", title: "Level sampler", description: "Browse the skills and formats represented across Levels 1–5. The sample below is an original illustrative activity, not a real learner submission or a placement result.", icon: BookOpen },
  { n: "03", title: "Enrolled-family library", description: "Ask the Academy team which level materials are currently available. Learner-only materials are shared directly with enrolled families; this page does not expose private handbooks or teacher notes.", icon: UsersRound },
  { n: "04", title: "Educator collection", description: "A separate collection for authorised teachers and school partners. Teacher manuals, lesson plans, training and assessment materials are not public downloads.", icon: GraduationCap },
];

const CARD = "rounded-[1.5rem] border border-[#E6DEC8] bg-white p-5 shadow-sm";
const PILL = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-2 text-sm font-extrabold text-white transition hover:bg-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";
const OUTLINE = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#1E4D3B]/30 bg-white px-5 py-2 text-sm font-bold text-[#1E4D3B] transition hover:border-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";

export default function StudentAcademyResourcesPage() {
  return (
    <div className="bg-[#FAF7F2] text-[#1C2526]">
      <JsonLd data={PAGE_LD} id="ld-student-learning-deck" />
      <section className="relative overflow-hidden border-b border-[#E6DEC8] bg-[#1E4D3B] px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="text-sm text-white/80">
            <Link href="/student-academy" className="underline decoration-white/50 underline-offset-4 hover:text-white">Student Academy</Link>
            <span aria-hidden="true"> / </span><span aria-current="page">Learning Deck</span>
          </nav>
          <div className="mt-8 grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#F6C453]">A guided look inside the materials</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight sm:text-5xl">See how a story becomes confident thinking.</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
                Explore one free activity, preview the level pathway, and understand what is available to learners and educators. Examples are labelled clearly; private course materials remain protected.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#sample" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#F6C453] px-5 py-2.5 text-center text-sm font-extrabold text-[#1C2526] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E4D3B]">
                  Preview and download the sample <Download aria-hidden="true" className="h-4 w-4" />
                </a>
                <a href="https://worldwise-story-quest.vercel.app/#home" target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/60 px-5 py-2.5 text-center text-sm font-bold text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  Play free Story Quest <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </div>
            <figure className="relative overflow-hidden rounded-[1.5rem] border border-white/20 bg-[#FAF7F2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/overhaul/thinking-cycle-storybook-map.webp" alt="Illustration of a storybook map showing the four thinking steps: Analyze, Evaluate, Justify, Reflect" width={1400} height={788} className="aspect-[16/9] w-full object-cover" />
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#1E4D3B]">Illustration · Jurassic English learning model</figcaption>
            </figure>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <section aria-labelledby="four-ways-heading">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#B45309]">The resource deck</p>
            <h2 id="four-ways-heading" className="mt-2 text-3xl font-extrabold leading-tight text-[#1E4D3B] sm:text-4xl">Four clear ways to explore</h2>
            <p className="mt-3 leading-relaxed text-[#4A5568]">Start with a real interactive preview, then see how examples, learner resources and educator materials fit together.</p>
          </div>
          <ol className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {FOUR_STEPS.map(({ n, title, description, icon: Icon }) => (
              <li key={n} className={`${CARD} flex flex-col`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black tracking-widest text-[#B45309]">{n}</span>
                  <Icon aria-hidden="true" className="h-5 w-5 text-[#1E4D3B]" />
                </div>
                <h3 className="mt-4 text-lg font-extrabold text-[#1E4D3B]">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[#4A5568]">{description}</p>
                {n === "01" && <a href="https://worldwise-story-quest.vercel.app/#home" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-[#1E4D3B] underline underline-offset-4">Play Story Quest <ArrowUpRight aria-hidden="true" className="h-4 w-4" /></a>}
                {n === "02" && <a href="#sample" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-[#1E4D3B] underline underline-offset-4">Open the sample <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>}
                {n === "03" && <a href="/student-academy#diagnostic" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-[#1E4D3B] underline underline-offset-4">Ask about learner access <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>}
                {n === "04" && <a href="mailto:info@jurassicenglish.com?subject=Educator%20resource%20enquiry" className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-extrabold text-[#1E4D3B] underline underline-offset-4">Enquire about school access <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>}
              </li>
            ))}
          </ol>
        </section>

        <section id="sample" aria-labelledby="sample-heading" className="mt-16 scroll-mt-24">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#B45309]">Free original sample · English</p>
              <h2 id="sample-heading" className="mt-2 text-3xl font-extrabold leading-tight text-[#1E4D3B] sm:text-4xl">Try the four-step thinking routine</h2>
              <p className="mt-3 leading-relaxed text-[#4A5568]">A short, original practice activity lets families see the kind of thinking we model: notice the choice, weigh it, support an idea, then reflect.</p>
              <div className="mt-5 rounded-2xl border border-[#E6DEC8] bg-white p-5">
                <h3 className="font-extrabold text-[#1E4D3B]">Maya’s last flare</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4A5568]">During a storm, Maya has one dry flare left. She can save it for herself or use it to warn a fishing crew near a reef. What should she do, and what details support your view?</p>
                <p className="mt-3 text-xs leading-relaxed text-[#4A5568]">This is an illustrative example created for demonstration. It is not a real student response, an assessment, or a level placement.</p>
                <a href="/downloads/jurassic-student-academy-sample.pdf" download className={`${PILL} mt-4 w-full sm:w-auto`}>
                  Download the 2-page sample PDF <Download aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </div>
            <ResourceDeckExplorer />
          </div>
        </section>

        <section aria-labelledby="library-heading" className="mt-16">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#B45309]">What is inside the wider collection</p>
            <h2 id="library-heading" className="mt-2 text-3xl font-extrabold leading-tight text-[#1E4D3B] sm:text-4xl">Built for learners and the people who teach them</h2>
          </div>
          <div className="mt-7 grid gap-5 lg:grid-cols-2">
            <article className={`${CARD} relative overflow-hidden`}>
              <div className="flex items-center gap-3"><span className="rounded-xl bg-[#E6F4EA] p-3 text-[#1E4D3B]"><BookOpen aria-hidden="true" className="h-5 w-5" /></span><div><h3 className="text-xl font-extrabold text-[#1E4D3B]">Learner and family materials</h3><p className="text-sm text-[#4A5568]">Examples from the level pathway</p></div></div>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[#4A5568]">
                <li><strong className="text-[#1C2526]">Level 1 example:</strong> a picture-rich story response using LOOK · CHOOSE · SHOW · FEEL.</li>
                <li><strong className="text-[#1C2526]">Level 2 example:</strong> a story-thinking workbook using ANALYSE · EVALUATE · JUSTIFY · REFLECT.</li>
                <li><strong className="text-[#1C2526]">Across the pathway:</strong> vocabulary logs, evidence-backed responses and revision activities.</li>
              </ul>
              <div className="mt-5 flex items-start gap-3 rounded-xl bg-[#FAF7F2] p-4 text-sm leading-relaxed text-[#4A5568]">
                <LockKeyhole aria-hidden="true" className="mt-0.5 h-4 w-4 flex-none text-[#1E4D3B]" />
                <p>Full learner handbooks are not public downloads on this page. Enrolled-family access is arranged directly; a self-service protected library is not being implied here.</p>
              </div>
            </article>
            <article className={`${CARD} relative overflow-hidden`}>
              <div className="flex items-center gap-3"><span className="rounded-xl bg-[#FFF1D6] p-3 text-[#8A3B05]"><GraduationCap aria-hidden="true" className="h-5 w-5" /></span><div><h3 className="text-xl font-extrabold text-[#1E4D3B]">Educator and school resources</h3><p className="text-sm text-[#4A5568]">A separate professional collection</p></div></div>
              <p className="mt-5 text-sm leading-relaxed text-[#4A5568]">Teacher implementation manuals, lesson plans, training guides, internal rubrics and curriculum architecture are reserved for authorised educators and school partners. They are not exposed as customer-facing downloads.</p>
              <a href="mailto:info@jurassicenglish.com?subject=Educator%20resource%20enquiry" className={`${OUTLINE} mt-5 w-full sm:w-auto`}><Mail aria-hidden="true" className="h-4 w-4" /> Ask about educator access <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
            </article>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-[#4A5568]">The downloadable sample is intentionally public. Any file that a visitor downloads can be saved or shared; this page does not claim technical copy protection. Full paid or staff-only downloads require a separate authenticated delivery system.</p>
        </section>

        <section className="mt-16 rounded-[1.5rem] bg-[#1E4D3B] px-6 py-9 text-white sm:px-9 sm:py-11" aria-labelledby="next-step-heading">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div><p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#F6C453]">Choose your next step</p><h2 id="next-step-heading" className="mt-2 text-2xl font-extrabold sm:text-3xl">Want to see which level may fit?</h2><p className="mt-2 max-w-2xl leading-relaxed text-white/85">Talk with the Academy team about a friendly placement consultation and the materials used for your learner.</p></div>
            <a href="/student-academy#diagnostic" className="inline-flex min-h-11 flex-none items-center justify-center gap-2 rounded-full bg-[#F6C453] px-5 py-2.5 text-sm font-extrabold text-[#1C2526] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E4D3B]">Request a consultation <ArrowRight aria-hidden="true" className="h-4 w-4" /></a>
          </div>
        </section>
      </main>
    </div>
  );
}

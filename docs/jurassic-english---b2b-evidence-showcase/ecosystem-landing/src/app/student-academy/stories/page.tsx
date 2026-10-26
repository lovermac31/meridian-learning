import type { Metadata } from "next";
import { ArrowLeft, ArrowRight, BookOpen, MessageCircle } from "lucide-react";
import {
  LEVEL_BOOKS,
  bookHref,
  continueHref,
  coverSrc,
  levelAnchor,
  type AcademyLevel,
  type Book,
} from "@/lib/academy/levelBooks";

// Story collections for the five Student Academy levels. Each level shows
// Story 1, Story 2 and "Continue with Mr. Jay" (the commercial next step,
// always available and visually distinct from a third story). All links come
// from src/lib/academy/levelBooks.ts.

export const metadata: Metadata = {
  title: "Level stories | Jurassic English™ Student Academy",
  description:
    "Two original Jurassic English storybooks for each Student Academy level, and the next step with Mr. Jay.",
  alternates: { canonical: "/student-academy/stories" },
};

const H2 = "text-2xl font-extrabold leading-tight text-[#1E4D3B]";
const PRIMARY =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-2.5 text-center text-sm font-extrabold text-white transition hover:bg-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";

function StoryItem({ level, book, n }: { level: AcademyLevel; book: Book; n: 1 | 2 }) {
  const href = bookHref(level, book);
  const cover = coverSrc(level, book);
  const body = (
    <>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={`Cover of ${book.title}`} width={480} height={320} loading="lazy" decoding="async" className="aspect-[3/2] w-full rounded-xl object-cover" />
      ) : (
        <div className="flex aspect-[3/2] w-full items-center justify-center rounded-xl bg-[#F4F1EA] px-4 text-center font-extrabold text-[#1E4D3B]">
          <BookOpen aria-hidden="true" className="mr-2 h-5 w-5 flex-none" />
          {book.title}
        </div>
      )}
      <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-[#B45309]">Story {n}</p>
      <p className="mt-1 font-extrabold text-[#1E4D3B]">{book.title}</p>
      <p className="mt-1 text-sm text-[#4A5568]">
        {href ? (n === 1 ? "Read, listen and do the activities." : "Read your next story.") : level.accepted ? "Opening soon" : "In preparation"}
      </p>
    </>
  );
  return (
    <li className="rounded-[1.25rem] border border-[#E6DEC8] bg-white p-4">
      {href ? (
        <a href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2">
          {body}
        </a>
      ) : (
        body
      )}
    </li>
  );
}

function ContinueItem({ level }: { level: AcademyLevel }) {
  return (
    <li className="flex flex-col justify-between rounded-[1.25rem] bg-[#1E4D3B] p-5 text-white">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#F4F1EA]">Next step</p>
        <p className="mt-1 text-lg font-extrabold">Continue with Mr. Jay</p>
        <p className="mt-2 text-sm leading-relaxed text-[#F4F1EA]">
          {level.level <= 2
            ? "Story Club (ages 5–8): a small weekly story group with a personal reply from Mr. Jay."
            : "Mr. Jay will confirm a suitable option for your child before you pay."}
        </p>
      </div>
      <a href={continueHref(level.level)} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E4D3B]">
        Ask about a place <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </a>
    </li>
  );
}

export default function LevelStoriesPage() {
  return (
    <div className="bg-[#FAF7F2] px-4 py-10 text-[#1C2526] sm:px-6">
      <div className="mx-auto max-w-6xl">
        <a href="/student-academy#levels-heading" className="inline-flex items-center gap-2 text-sm font-bold text-[#1E4D3B] underline underline-offset-4">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to the 5-level pathway
        </a>
        <h1 className="mt-4 text-[2rem] font-extrabold leading-tight text-[#1E4D3B]">Level stories</h1>
        <p className="mt-2 max-w-2xl text-[#4A5568]">
          Two original Jurassic English storybooks for each level, then the next step with Mr. Jay. Reading progress is
          saved on your device only.
        </p>

        {LEVEL_BOOKS.map((level) => (
          <section key={level.level} id={levelAnchor(level.level)} aria-labelledby={`${levelAnchor(level.level)}-h`} className="mt-10 scroll-mt-24">
            <h2 id={`${levelAnchor(level.level)}-h`} className={H2}>
              Level {level.level} · {level.world}
            </h2>
            {!level.accepted ? (
              <p className="mt-1 text-sm font-bold text-[#B45309]">Stories in preparation · ask Mr. Jay</p>
            ) : null}
            <ol className="mt-4 grid gap-4 md:grid-cols-3">
              <StoryItem level={level} book={level.stories[0]} n={1} />
              <StoryItem level={level} book={level.stories[1]} n={2} />
              <ContinueItem level={level} />
            </ol>
            {level.extras.length ? (
              <p className="mt-3 text-sm text-[#4A5568]">
                Also in this level:{" "}
                {level.extras.map((b) => {
                  const href = bookHref(level, b);
                  return href ? (
                    <a key={b.id} href={href} className="font-bold text-[#1E4D3B] underline underline-offset-4">{b.title}</a>
                  ) : (
                    <span key={b.id} className="font-bold">{b.title}</span>
                  );
                })}
              </p>
            ) : null}
          </section>
        ))}

        <div className="mt-12 rounded-[1.25rem] border border-[#E6DEC8] bg-white p-5 text-center">
          <p className="font-extrabold text-[#1E4D3B]">Not sure which level fits?</p>
          <a href="/student-academy#diagnostic" className={`${PRIMARY} mt-3`}>
            <MessageCircle aria-hidden="true" className="h-4 w-4" /> Request a placement consultation
          </a>
        </div>
      </div>
    </div>
  );
}

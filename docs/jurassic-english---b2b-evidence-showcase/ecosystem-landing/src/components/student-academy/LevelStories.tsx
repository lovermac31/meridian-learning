import { ArrowLeft, ArrowRight, BookOpen, MessageCircle } from "lucide-react";
import {
  LEVEL_BOOKS,
  bookHref,
  continueHref,
  coverSrc,
  levelAnchor,
  type AcademyLevel,
  type Book,
  type Locale,
} from "@/lib/academy/levelBooks";

// Story collections for the five Student Academy levels, in English (/student-academy/stories) and Vietnamese
// (/vi/student-academy/stories). Each level shows Story 1, Story 2 and "Continue with Mr. Jay" (the commercial
// next step, always available and visually distinct from a third story). All links come from
// src/lib/academy/levelBooks.ts. Book titles stay in English. The Vietnamese copy is machine-drafted and needs
// a native read.

const H2 = "text-2xl font-extrabold leading-tight text-[#1E4D3B]";
const PRIMARY =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-2.5 text-center text-sm font-extrabold text-white transition hover:bg-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";

const COPY = {
  en: {
    back: "Back to the 5-level pathway",
    title: "Level stories",
    intro:
      "Two original Jurassic English storybooks for each level, then the next step with Mr. Jay. Reading progress is saved on your device only.",
    level: "Level",
    inPreparation: "Stories in preparation · ask Mr. Jay",
    story: "Story",
    firstStory: "Read, listen and do the activities.",
    nextStory: "Read your next story.",
    openingSoon: "Opening soon",
    preparing: "In preparation",
    cover: (title: string) => `Cover of ${title}`,
    nextStep: "Next step",
    continueTitle: "Continue with Mr. Jay",
    storyClub: "Story Club (ages 5–8): a small weekly story group with a personal reply from Mr. Jay.",
    baseline: "A Live Speaking Baseline with Mr. Jay, the first step for older readers.",
    askPlace: "Ask about a place",
    continueCta: "Continue with Mr. Jay",
    alsoInLevel: "Also in this level:",
    unsure: "Not sure which level fits?",
    consultation: "Request a placement consultation",
  },
  vi: {
    back: "Quay lại lộ trình 5 cấp độ",
    title: "Truyện theo cấp độ",
    intro:
      "Hai truyện tranh gốc của Jurassic English cho mỗi cấp độ, rồi bước tiếp theo cùng thầy Jay. Tiến độ đọc chỉ được lưu trên thiết bị của bạn.",
    level: "Cấp độ",
    inPreparation: "Truyện đang được chuẩn bị · hỏi thầy Jay",
    story: "Truyện",
    firstStory: "Đọc, nghe và làm các hoạt động.",
    nextStory: "Đọc truyện tiếp theo.",
    openingSoon: "Sắp ra mắt",
    preparing: "Đang chuẩn bị",
    cover: (title: string) => `Bìa truyện ${title}`,
    nextStep: "Bước tiếp theo",
    continueTitle: "Tiếp tục cùng thầy Jay",
    storyClub: "Câu lạc bộ Truyện (5–8 tuổi): nhóm nhỏ đọc truyện mỗi tuần, có phản hồi riêng từ thầy Jay.",
    baseline: "Buổi Đánh giá Nói trực tiếp với thầy Jay, bước đầu tiên cho các bạn lớn hơn.",
    askPlace: "Hỏi về một chỗ",
    continueCta: "Tiếp tục cùng thầy Jay",
    alsoInLevel: "Cũng trong cấp độ này:",
    unsure: "Chưa chắc cấp độ nào phù hợp?",
    consultation: "Gửi yêu cầu tư vấn xếp lớp",
  },
} as const;

type Copy = (typeof COPY)[Locale];

function StoryItem({ level, book, n, c }: { level: AcademyLevel; book: Book; n: 1 | 2; c: Copy }) {
  const href = bookHref(level, book);
  const cover = coverSrc(level, book);
  const body = (
    <>
      {cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={cover} alt={c.cover(book.title)} width={480} height={320} loading="lazy" decoding="async" className="aspect-[3/2] w-full rounded-xl object-cover" />
      ) : (
        <div className="flex aspect-[3/2] w-full items-center justify-center rounded-xl bg-[#F4F1EA] px-4 text-center font-extrabold text-[#1E4D3B]">
          <BookOpen aria-hidden="true" className="mr-2 h-5 w-5 flex-none" />
          <span lang="en">{book.title}</span>
        </div>
      )}
      <p className="mt-3 text-xs font-extrabold uppercase tracking-wider text-[#B45309]">
        {c.story} {n}
      </p>
      <p className="mt-1 font-extrabold text-[#1E4D3B]" lang="en">{book.title}</p>
      <p className="mt-1 text-sm text-[#4A5568]">
        {href ? (n === 1 ? c.firstStory : c.nextStory) : level.accepted ? c.openingSoon : c.preparing}
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

function ContinueItem({ level, locale, c }: { level: AcademyLevel; locale: Locale; c: Copy }) {
  const storyClub = level.level <= 2;
  return (
    <li className="flex flex-col justify-between rounded-[1.25rem] bg-[#1E4D3B] p-5 text-white">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#F4F1EA]">{c.nextStep}</p>
        <p className="mt-1 text-lg font-extrabold">{c.continueTitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#F4F1EA]">{storyClub ? c.storyClub : c.baseline}</p>
      </div>
      <a href={continueHref(level.level, locale)} className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E4D3B]">
        {storyClub ? c.askPlace : c.continueCta} <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </a>
    </li>
  );
}

export function LevelStories({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  return (
    <div className="bg-[#FAF7F2] px-4 py-10 text-[#1C2526] sm:px-6" lang={locale}>
      <div className="mx-auto max-w-6xl">
        {/* The 5-level pathway and the consultation form are on the English page only. */}
        <a href="/student-academy#levels-heading" className="inline-flex items-center gap-2 text-sm font-bold text-[#1E4D3B] underline underline-offset-4">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {c.back}
        </a>
        <h1 className="mt-4 text-[2rem] font-extrabold leading-tight text-[#1E4D3B]">{c.title}</h1>
        <p className="mt-2 max-w-2xl text-[#4A5568]">{c.intro}</p>

        {LEVEL_BOOKS.map((level) => (
          <section key={level.level} id={levelAnchor(level.level)} aria-labelledby={`${levelAnchor(level.level)}-h`} className="mt-10 scroll-mt-24">
            <h2 id={`${levelAnchor(level.level)}-h`} className={H2}>
              {c.level} {level.level} · <span lang="en">{level.world}</span>
            </h2>
            {!level.accepted ? <p className="mt-1 text-sm font-bold text-[#B45309]">{c.inPreparation}</p> : null}
            <ol className="mt-4 grid gap-4 md:grid-cols-3">
              <StoryItem level={level} book={level.stories[0]} n={1} c={c} />
              <StoryItem level={level} book={level.stories[1]} n={2} c={c} />
              <ContinueItem level={level} locale={locale} c={c} />
            </ol>
            {level.extras.length ? (
              <p className="mt-3 text-sm text-[#4A5568]">
                {c.alsoInLevel}{" "}
                {level.extras.map((b) => {
                  const href = bookHref(level, b);
                  return href ? (
                    <a key={b.id} href={href} lang="en" className="font-bold text-[#1E4D3B] underline underline-offset-4">{b.title}</a>
                  ) : (
                    <span key={b.id} lang="en" className="font-bold">{b.title}</span>
                  );
                })}
              </p>
            ) : null}
          </section>
        ))}

        <div className="mt-12 rounded-[1.25rem] border border-[#E6DEC8] bg-white p-5 text-center">
          <p className="font-extrabold text-[#1E4D3B]">{c.unsure}</p>
          <a href="/student-academy#diagnostic" className={`${PRIMARY} mt-3`}>
            <MessageCircle aria-hidden="true" className="h-4 w-4" /> {c.consultation}
          </a>
        </div>
      </div>
    </div>
  );
}

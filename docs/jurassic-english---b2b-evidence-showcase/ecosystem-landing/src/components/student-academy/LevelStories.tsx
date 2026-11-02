"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, MessageCircle, Mic, Tag, Users } from "lucide-react";
import links from "@/lib/assetLinks.json";
import {
  LEVEL_BOOKS,
  bookHref,
  continueHref,
  STORY_HUB_ZALO,
  samplePackHref,
  teacherPackHref,
  COVER_SIZES,
  coverSrc,
  coverSrcSet,
  levelAnchor,
  type AcademyLevel,
  type Book,
  type Locale,
} from "@/lib/academy/levelBooks";

// Story collections for the five Student Academy levels, in English (/student-academy/stories) and Vietnamese
// (/vi/student-academy/stories). Layout from Jay's Stitch mock (stories-desktop.png, 2 Nov 2026): title and intro,
// level filter pills, the Story Club strip, then one section per level with Story 1, Story 2 and the dark-green
// "Continue with Mr. Jay" card (the commercial next step, always available and visually distinct from a third story).
// Every word, price and age band comes from the repo or the live site, never from the mock. All links come from
// src/lib/academy/levelBooks.ts and src/lib/assetLinks.json. Book titles stay in English. The Vietnamese copy is
// machine-drafted and needs a native read.
//
// A client component only for the level filter (useState); it renders "All" on the server, so SSR and hydration match.

const H2 = "text-2xl font-extrabold leading-tight text-[#1E4D3B] sm:text-[1.75rem]";
const EYEBROW = "text-xs font-extrabold uppercase tracking-wider text-[#B45309]";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E4D3B] focus-visible:ring-offset-2";
const PRIMARY = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#B45309] px-5 py-2.5 text-center text-sm font-extrabold text-white transition hover:bg-[#1E4D3B] ${FOCUS}`;
const TEXT_LINK = `inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-[#1E4D3B] underline underline-offset-4 hover:text-[#B45309] ${FOCUS}`;

const COPY = {
  en: {
    back: "Back to the 5-level pathway",
    title: "Level stories",
    intro:
      "Two original Jurassic English storybooks for each level, then the next step with Mr. Jay. Reading progress is saved on your device only.",
    filterLabel: "Show one level",
    all: "All levels",
    level: "Level",
    ages: (a: string) => `Ages ${a}`,
    inPreparation: "Stories in preparation · ask Mr. Jay",
    story: "Story",
    firstStory: "Read, listen and do the activities.",
    nextStory: "Read your next story.",
    startReading: "Start reading",
    openingSoon: "Opening soon",
    preparing: "In preparation",
    cover: (title: string) => `Cover of ${title}`,
    nextStep: "Next step",
    continueTitle: "Continue with Mr. Jay",
    storyClub: "Story Club (ages 5–8): a small weekly story group with a personal reply from Mr. Jay.",
    baseline: "A Live Speaking Baseline with Mr. Jay, the first step for older readers.",
    // Story Club: src/i18n/content/products.ts (title, forWho, price, unit). Baseline: the same file.
    clubTitle: "Story Club with Mr. Jay",
    clubForWho: "Ages 5–8. Up to 6 children a group, Saturdays 9:00.",
    clubPrice: "590.000₫ for 4 weeks",
    clubTag: "Story Club · 590.000₫ for 4 weeks",
    baselineTag: "Live Speaking Baseline · 690.000₫",
    continueCta: "Ask Mr. Jay on Zalo",
    // The Zalo number as the live Story Club page prints it.
    zaloLine: "Zalo / phone: +84 396 085 076",
    samplePack: "Free sample pack: one storybook, one activity page and one lesson plan.",
    samplePackCta: "Send me the sample pack",
    alsoInLevel: "Also in this level:",
    comingSoon: "Coming soon",
    unsure: "Not sure which level fits?",
    // From the /student-academy page description.
    unsureLine: "Start with a 45-minute Reading & Thinking Placement Consultation.",
    consultation: "Request a placement consultation",
    teacherPack: (level: number) => `For teachers: Level ${level} Teacher Pack`,
  },
  vi: {
    back: "Quay lại lộ trình 5 cấp độ",
    title: "Truyện theo cấp độ",
    intro:
      "Hai truyện tranh gốc của Jurassic English cho mỗi cấp độ, rồi bước tiếp theo cùng thầy Jay. Tiến độ đọc chỉ được lưu trên thiết bị của bạn.",
    filterLabel: "Chọn một cấp độ",
    all: "Tất cả cấp độ",
    level: "Cấp độ",
    ages: (a: string) => (a.endsWith("+") ? `Từ ${a.slice(0, -1)} tuổi` : `${a} tuổi`),
    inPreparation: "Truyện đang được chuẩn bị · hỏi thầy Jay",
    story: "Truyện",
    firstStory: "Đọc, nghe và làm các hoạt động.",
    nextStory: "Đọc truyện tiếp theo.",
    startReading: "Bắt đầu đọc",
    openingSoon: "Sắp ra mắt",
    preparing: "Đang chuẩn bị",
    cover: (title: string) => `Bìa truyện ${title}`,
    nextStep: "Bước tiếp theo",
    continueTitle: "Tiếp tục cùng thầy Jay",
    storyClub: "Câu lạc bộ Truyện (5–8 tuổi): nhóm nhỏ đọc truyện mỗi tuần, có phản hồi riêng từ thầy Jay.",
    baseline: "Buổi Đánh giá Nói trực tiếp với thầy Jay, bước đầu tiên cho các bạn lớn hơn.",
    clubTitle: "Câu lạc bộ Truyện cùng thầy Jay",
    clubForWho: "Bé 5–8 tuổi. Tối đa 6 bé một nhóm, sáng thứ Bảy 9:00.",
    clubPrice: "590.000₫ cho 4 tuần",
    clubTag: "Câu lạc bộ Truyện · 590.000₫ cho 4 tuần",
    baselineTag: "Đánh giá Nói trực tiếp · 690.000₫",
    continueCta: "Nhắn thầy Jay qua Zalo",
    zaloLine: "Zalo / điện thoại: +84 396 085 076",
    samplePack: "Bộ mẫu miễn phí: 1 truyện, 1 trang bài tập và 1 giáo án.",
    samplePackCta: "Gửi bộ mẫu cho tôi",
    alsoInLevel: "Cũng trong cấp độ này:",
    comingSoon: "Sắp có",
    unsure: "Chưa chắc cấp độ nào phù hợp?",
    unsureLine: "",
    consultation: "Gửi yêu cầu tư vấn xếp lớp",
    teacherPack: (level: number) => `Dành cho giáo viên: Bộ tài liệu Giáo viên Level ${level}`,
  },
} as const;

type Copy = (typeof COPY)[Locale];

function StoryItem({ level, book, n, c }: { level: AcademyLevel; book: Book; n: 1 | 2; c: Copy }) {
  const href = bookHref(level, book);
  const cover = coverSrc(level, book);
  const body = (
    <>
      <div className="relative">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} srcSet={coverSrcSet(level, book) ?? undefined} sizes={COVER_SIZES} alt={c.cover(book.title)} width={400} height={267} loading="lazy" decoding="async" className="aspect-[3/2] w-full object-cover" />
        ) : (
          <div className="flex aspect-[3/2] w-full items-center justify-center bg-[#F4F1EA] px-4 text-center font-extrabold text-[#1E4D3B]">
            <BookOpen aria-hidden="true" className="mr-2 h-5 w-5 flex-none" />
            <span lang="en">{book.title}</span>
          </div>
        )}
        <span className="absolute bottom-3 right-3 rounded-full bg-[#1E4D3B] px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm">
          {c.level} {level.level}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className={EYEBROW}>
          {c.story} {n}
        </p>
        <p className="mt-1 text-lg font-extrabold leading-snug text-[#1E4D3B]" lang="en">{book.title}</p>
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[#4A5568]">
          {href ? (n === 1 ? c.firstStory : c.nextStory) : level.accepted ? c.openingSoon : c.preparing}
        </p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 pt-4">
          <span className="inline-flex max-w-full items-start gap-1.5 rounded-lg border border-[#E6DEC8] bg-[#FAF7F2] px-2 py-1 text-xs font-bold text-[#4A5568]" lang="en">
            <Tag aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 flex-none text-[#B45309]" />
            <span>{book.theme}</span>
          </span>
          {href ? (
            <span className="inline-flex min-h-11 items-center gap-1 text-sm font-extrabold text-[#1E4D3B] group-hover:text-[#B45309]">
              {c.startReading} <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </span>
          ) : null}
        </div>
      </div>
    </>
  );
  return (
    <li className="flex overflow-hidden rounded-[1.25rem] border border-[#E6DEC8] bg-white shadow-[0_1px_2px_rgba(28,37,38,0.04)]">
      {href ? (
        <a href={href} className={`group flex w-full flex-col rounded-[1.25rem] ${FOCUS}`}>
          {body}
        </a>
      ) : (
        <div className="flex w-full flex-col">{body}</div>
      )}
    </li>
  );
}

function ContinueItem({ level, locale, c }: { level: AcademyLevel; locale: Locale; c: Copy }) {
  const storyClub = level.level <= 2;
  const Icon = storyClub ? Users : Mic;
  return (
    <li className="flex flex-col rounded-[1.25rem] bg-[#1E4D3B] p-5 text-white md:col-span-2 lg:col-span-1">
      <div className="mb-5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#F4F1EA]">{c.nextStep}</p>
        <p className="mt-1 text-xl font-extrabold leading-snug">{c.continueTitle}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#F4F1EA]">{storyClub ? c.storyClub : c.baseline}</p>
        {/* The offer behind the next step, as a link to its own page (continueHref keeps utm_source=academy and the level). */}
        <a
          href={continueHref(level.level, locale)}
          className="mt-4 inline-flex min-h-11 w-fit max-w-full items-center gap-2 rounded-lg bg-[#2A5F4B] px-3 py-2 text-xs font-bold leading-snug text-[#F4F1EA] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E4D3B]"
        >
          <Icon aria-hidden="true" className="h-4 w-4 flex-none" />
          <span>{storyClub ? c.clubTag : c.baselineTag}</span>
        </a>
      </div>
      {/* Straight to Zalo (website assessment, 27 Oct 2026, fix 10): one click instead of three via Story Club. Zalo
          links cannot carry a message, so the link carries utm_source=story-hub. */}
      <a href={STORY_HUB_ZALO} target="_blank" rel="noopener" className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#1E4D3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E4D3B]">
        <MessageCircle aria-hidden="true" className="h-4 w-4" /> {c.continueCta}
      </a>
      <p className="mt-3 text-center text-xs font-semibold text-[#F4F1EA]">{c.zaloLine}</p>
    </li>
  );
}

/** The Story Club strip: the page's asset-links card (src/lib/assetLinks.json) in the mock's layout. The aside and its
 * two hrefs, in order, are what scripts/check-seo-asset-links.mjs verifies on the built page. */
function StoryClubStrip({ pathname, c }: { pathname: string; c: Copy }) {
  const card = links.find((entry) => entry.path === pathname);
  if (!card) return null;
  return (
    <aside data-seo-asset-links={pathname} lang={card.locale} className="mt-8 rounded-[1.25rem] border border-[#E6DEC8] bg-white p-5 shadow-[0_1px_2px_rgba(28,37,38,0.04)] sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <span aria-hidden="true" className="hidden h-12 w-12 flex-none items-center justify-center rounded-full bg-[#FAF7F2] text-[#B45309] sm:inline-flex">
            <Users className="h-6 w-6" />
          </span>
          <div>
            <p className={EYEBROW}>{card.heading}</p>
            <h2 className="mt-1 text-xl font-extrabold text-[#1E4D3B]">{c.clubTitle}</h2>
            <p className="mt-1 text-sm text-[#4A5568]">
              {c.clubForWho} <span className="font-extrabold text-[#1E4D3B]">{c.clubPrice}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 lg:items-end">
          <a className={`${PRIMARY} w-full sm:w-auto`} href={card.links[0].href}>
            {card.links[0].text}
          </a>
          <a className={TEXT_LINK} href={card.links[1].href}>
            {card.links[1].text} <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </aside>
  );
}

function LevelFilter({ active, onChange, c }: { active: number; onChange: (level: number) => void; c: Copy }) {
  const pill = (on: boolean) =>
    `inline-flex min-h-11 flex-none items-center whitespace-nowrap rounded-full border px-4 text-sm font-bold transition ${FOCUS} ${
      on ? "border-[#1E4D3B] bg-[#1E4D3B] text-white" : "border-[#E6DEC8] bg-white text-[#1E4D3B] hover:border-[#1E4D3B]"
    }`;
  return (
    <div role="group" aria-label={c.filterLabel} className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <button type="button" aria-pressed={active === 0} onClick={() => onChange(0)} className={pill(active === 0)}>
        {c.all}
      </button>
      {LEVEL_BOOKS.map((level) => (
        <button key={level.level} type="button" aria-pressed={active === level.level} onClick={() => onChange(level.level)} className={pill(active === level.level)}>
          {c.level} {level.level} · {c.ages(level.ages)}
        </button>
      ))}
    </div>
  );
}

export function LevelStories({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const pathname = locale === "vi" ? "/vi/student-academy/stories" : "/student-academy/stories";
  const [active, setActive] = useState(0);
  const inPreparation = LEVEL_BOOKS.filter((level) => !level.accepted);
  return (
    <div className="bg-[#FAF7F2] px-4 py-8 text-[#1C2526] sm:px-6 sm:py-10" lang={locale}>
      <div className="mx-auto max-w-[1100px]">
        {/* The 5-level pathway and the consultation form are on the English page only. */}
        <a href="/student-academy#levels-heading" className={TEXT_LINK}>
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> {c.back}
        </a>
        <h1 className="mt-3 text-[2rem] font-extrabold leading-tight text-[#1E4D3B] sm:text-[2.5rem]">{c.title}</h1>
        <p className="mt-2 max-w-2xl text-[#4A5568]">{c.intro}</p>

        <LevelFilter active={active} onChange={setActive} c={c} />

        <StoryClubStrip pathname={pathname} c={c} />

        {LEVEL_BOOKS.map((level) => (
          <section
            key={level.level}
            id={levelAnchor(level.level)}
            aria-labelledby={`${levelAnchor(level.level)}-h`}
            hidden={active !== 0 && active !== level.level}
            className="mt-12 scroll-mt-24"
          >
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
              <div>
                <p className={EYEBROW}>
                  {level.name} · {c.ages(level.ages)}
                </p>
                <h2 id={`${levelAnchor(level.level)}-h`} className={`${H2} mt-1`}>
                  {c.level} {level.level} · <span lang="en">{level.world}</span>
                </h2>
              </div>
              <p className="inline-flex rounded-full bg-[#E6F4EA] px-2.5 py-1 text-xs font-bold text-[#137333]">{level.cefr}</p>
            </div>
            {!level.accepted ? <p className="mt-1 text-sm font-bold text-[#B45309]">{c.inPreparation}</p> : null}
            <ol className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)]">
              <StoryItem level={level} book={level.stories[0]} n={1} c={c} />
              <StoryItem level={level} book={level.stories[1]} n={2} c={c} />
              <ContinueItem level={level} locale={locale} c={c} />
            </ol>
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-0 text-sm">
              <a href={teacherPackHref(level.level, locale)} className={TEXT_LINK} data-link={`story-hub-teacher-pack-l${level.level}`}>
                {c.teacherPack(level.level)}
              </a>
              {level.extras.length ? (
                <p className="inline-flex min-h-11 flex-wrap items-center gap-x-2 text-[#4A5568]">
                  {c.alsoInLevel}
                  {level.extras.map((b) => {
                    const href = bookHref(level, b);
                    return href ? (
                      <a key={b.id} href={href} lang="en" className={TEXT_LINK}>{b.title}</a>
                    ) : (
                      <span key={b.id} lang="en" className="font-bold">{b.title}</span>
                    );
                  })}
                </p>
              ) : null}
            </div>
          </section>
        ))}

        {/* Only while a level's stories are still in preparation (levelBooks `accepted`); today every level is accepted. */}
        {inPreparation.length ? (
          <div className="mt-12 rounded-[1.25rem] border border-[#E6DEC8] bg-[#FFF8EC] p-5">
            <p className={EYEBROW}>{c.comingSoon}</p>
            <ul className="mt-2 text-sm text-[#4A5568]">
              {inPreparation.map((level) => (
                <li key={level.level}>
                  {c.level} {level.level} · <span lang="en">{level.stories.map((b) => b.title).join(", ")}</span> · {c.preparing}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-12 rounded-[1.25rem] border border-[#E6DEC8] bg-white p-6 text-center">
          <p className="text-xl font-extrabold text-[#1E4D3B]">{c.unsure}</p>
          {c.unsureLine ? <p className="mx-auto mt-1 max-w-xl text-sm text-[#4A5568]">{c.unsureLine}</p> : null}
          <a href="/student-academy#diagnostic" className={`${PRIMARY} mt-4`}>
            <MessageCircle aria-hidden="true" className="h-4 w-4" /> {c.consultation}
          </a>
        </div>

        {/* The free sample pack (website assessment, 27 Oct 2026): the form lives on the main site's home page. */}
        <div className="mt-6 rounded-[1.25rem] border border-[#E6DEC8] bg-white p-6 text-center" data-sample-pack-link="">
          <p className="text-xl font-extrabold text-[#1E4D3B]">{c.samplePack}</p>
          <a href={samplePackHref(locale)} className={`${PRIMARY} mt-4`}>
            {c.samplePackCta} <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}


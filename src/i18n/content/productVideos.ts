import type { Locale } from '../locales';

/**
 * Sales and product films (Jay, 27 Oct 2026: "put the videos on the site, each with the correct product").
 * Each film lives in public/videos/<slug>/: video.mp4 (16:9, starts muted, loads only on play), poster.webp,
 * and one <lang>.vtt per subtitle language listed here. A product shows its film when its PRODUCTS entry
 * has `video: '<slug>'`; a test checks every file both ways, so a new film is one entry here plus one line there.
 */
export const VIDEO_DIR = '/videos';

export const VIDEO_LANGS = ['en', 'vi', 'zh'] as const;
export type VideoLang = (typeof VIDEO_LANGS)[number];

/** The picker's labels, each in its own language. */
export const VIDEO_LANG_LABELS: Record<VideoLang, string> = { en: 'EN', vi: 'VI', zh: '中文' };

export type ProductVideo = {
  // Subtitle files present in public/videos/<slug>/ (VI and 中文 are machine-drafted, awaiting native review).
  langs: VideoLang[];
  // Product films omit it and show the product's own title.
  title?: Record<Locale, string>;
};

const ALL_LANGS: VideoLang[] = [...VIDEO_LANGS];

export const PRODUCT_VIDEOS: Record<string, ProductVideo> = {
  'je-01-the-one-question': { langs: ['en', 'vi', 'zh'], title: { en: 'The one question', vi: 'Một câu hỏi' } },
  'je-02-spot-the-clue': { langs: ['en', 'vi', 'zh'], title: { en: 'Spot the clue', vi: 'Tìm manh mối' } },
  'je-03-why-stories': { langs: ['en', 'vi', 'zh'], title: { en: 'Why Mr. Jay teaches with stories', vi: 'Vì sao Mr. Jay dạy bằng truyện' } },
  // Product films (video factory, 27 Oct 2026): slug = product id, one line each.
  'ielts-writing-ladder-task2': { langs: ALL_LANGS },
  'ielts-writing-task1-method': { langs: ALL_LANGS },
  'ielts-writing-teacher-pack': { langs: ALL_LANGS },
  'teacher-bundle': { langs: ALL_LANGS },
  'thinking-cycle-set': { langs: ALL_LANGS },
  'story-club': { langs: ALL_LANGS },
  'baseline': { langs: ALL_LANGS },
  'one-to-one': { langs: ALL_LANGS },
  'printable-pack': { langs: ALL_LANGS },
  'centre-licence': { langs: ALL_LANGS },
  'parent-pack-l1': { langs: ALL_LANGS },
  'parent-pack-l2': { langs: ALL_LANGS },
  'teacher-pack-l1': { langs: ALL_LANGS },
  'teacher-pack-l2': { langs: ALL_LANGS },
  'teacher-pack-l3': { langs: ALL_LANGS },
  'teacher-pack-l4': { langs: ALL_LANGS },
  'teacher-pack-l5': { langs: ALL_LANGS },
  'student-workbook-l1': { langs: ALL_LANGS },
  'student-workbook-l2': { langs: ALL_LANGS },
  'student-workbook-l3': { langs: ALL_LANGS },
  'student-workbook-l4': { langs: ALL_LANGS },
  'student-workbook-l5': { langs: ALL_LANGS },
  'reasoning-assessment-kit': { langs: ALL_LANGS },
  'ielts-speaking-ladder': { langs: ALL_LANGS },
  'teacher-training-course': { langs: ALL_LANGS },
  'pilot-class-kit': { langs: ALL_LANGS },
  'curriculum-overview': { langs: ALL_LANGS },
};

/** Films 01–03 on /story-club and /vi/story-club, in this order. */
export const STORY_CLUB_VIDEOS = ['je-01-the-one-question', 'je-02-spot-the-clue', 'je-03-why-stories'];

export const VIDEO_COPY: Record<Locale, { subtitles: string; muted: string; watch: string; storyClubHeading: string }> = {
  en: {
    subtitles: 'Subtitles',
    muted: 'Starts muted: tap the speaker for sound.',
    watch: 'Watch',
    storyClubHeading: 'Watch Story Club in under a minute',
  },
  vi: {
    subtitles: 'Phụ đề',
    muted: 'Video bắt đầu ở chế độ tắt tiếng: chạm biểu tượng loa để nghe.',
    watch: 'Xem video',
    storyClubHeading: 'Xem Story Club trong chưa đầy một phút',
  },
};

/** Anchor of a product page's film, for the "Watch" link on /products. */
export const PRODUCT_VIDEO_ANCHOR = 'video';

export function videoFiles(slug: string) {
  const base = `${VIDEO_DIR}/${slug}`;
  return { src: `${base}/video.mp4`, poster: `${base}/poster.webp`, track: (lang: VideoLang) => `${base}/${lang}.vtt` };
}

/** The subtitle language a visitor sees first: the page's language when the film has it, else the first one. */
export function defaultVideoLang(slug: string, locale: Locale): VideoLang {
  const langs = PRODUCT_VIDEOS[slug]?.langs ?? [];
  return langs.includes(locale) ? locale : (langs[0] ?? 'en');
}

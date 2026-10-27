// The one place that maps each Student Academy level to its two original
// storybooks. Cards, the /student-academy/stories collections and tests all
// read from here; never hard-code a book link in a component.
//
// Book ids and titles come from academy-book-pages/data/original-stories.js
// (26 Oct 2026). `accepted` follows the Revenue Decision Log: Level 1 accepted,
// Level 2 done and free (Jay, 26 Oct); Levels 3–5 stay "in preparation" until
// Jay accepts them.
//
// BOOKS_BASE_URL is where the book app is published. While it is empty the
// story items render as "Opening soon" text, never a link, so the public site
// can never ship a localhost or preview-domain book link. Setting it (one edit,
// no trailing slash) turns every accepted story into a link to
// `${BOOKS_BASE_URL}/book.html#<id>` with its cover image.
export const BOOKS_BASE_URL = "https://books.jurassicenglish.com";

export type Book = { id: string; title: string };

export type AcademyLevel = {
  level: 1 | 2 | 3 | 4 | 5;
  world: string;
  accepted: boolean;
  stories: [Book, Book];
  extras: Book[];
};

export const LEVEL_BOOKS: AcademyLevel[] = [
  {
    level: 1,
    world: "Mistwood Harbor",
    accepted: true,
    stories: [
      { id: "mina-and-the-midnight-drum", title: "Mina and the Midnight Drum" },
      { id: "the-lantern-with-two-handles", title: "The Lantern With Two Handles" },
    ],
    extras: [{ id: "lina-and-the-orchard-map", title: "Lina and the Orchard Map" }],
  },
  {
    level: 2,
    world: "Whispering Woods",
    accepted: true,
    stories: [
      { id: "the-bell-that-rang-too-early", title: "The Bell That Rang Too Early" },
      { id: "the-rain-on-platform-seven", title: "The Rain on Platform Seven" },
    ],
    extras: [],
  },
  {
    level: 3,
    world: "The Grand Archive",
    accepted: true,
    stories: [
      { id: "the-unsent-weather-report", title: "The Unsent Weather Report" },
      { id: "the-last-seat-on-the-night-ferry", title: "The Last Seat on the Night Ferry" },
    ],
    extras: [],
  },
  {
    level: 4,
    world: "Cloudpeak Observatory",
    accepted: true,
    stories: [
      { id: "the-missing-column", title: "The Missing Column" },
      { id: "the-bridge-committee", title: "The Bridge Committee" },
    ],
    extras: [],
  },
  {
    level: 5,
    world: "University & Exam Bridge",
    accepted: true,
    stories: [
      { id: "a-box-called-other", title: "A Box Called Other" },
      { id: "the-map-beneath-the-map", title: "The Map Beneath the Map" },
    ],
    extras: [],
  },
];

export type Locale = "en" | "vi";

export const STORIES_PATH = "/student-academy/stories";
export const STORIES_VI_PATH = "/vi/student-academy/stories";

export const levelAnchor = (level: number) => `level-${level}`;

export const levelHref = (level: number) => `${STORIES_PATH}#${levelAnchor(level)}`;

/** Book link, or null while the book app has no public home or the level is not accepted. */
export function bookHref(level: AcademyLevel, book: Book): string | null {
  if (!BOOKS_BASE_URL || !level.accepted) return null;
  return `${BOOKS_BASE_URL}/book.html#${book.id}`;
}

/**
 * Cover image for a story card: a resized WebP of the book's cover (public/student-academy/covers/<id>-400|640.webp,
 * made from books.jurassicenglish.com/assets/art/<id>/cover.jpg). The full 1440 px JPGs were 270–380 KB each, about
 * 2 MB per page, for a card drawn about 324 px wide on a phone (QA, 27 Oct 2026). The path sits under /student-academy,
 * which jurassicenglish.com already proxies to this app.
 */
export const COVER_WIDTHS = [400, 640] as const;
export const COVER_SIZES = "(min-width: 1024px) 300px, (min-width: 640px) 45vw, calc(100vw - 66px)";

export function coverSrc(level: AcademyLevel, book: Book): string | null {
  if (!BOOKS_BASE_URL || !level.accepted) return null;
  return `/student-academy/covers/${book.id}-${COVER_WIDTHS[0]}.webp`;
}

export function coverSrcSet(level: AcademyLevel, book: Book): string | null {
  if (!coverSrc(level, book)) return null;
  return COVER_WIDTHS.map((w) => `/student-academy/covers/${book.id}-${w}.webp ${w}w`).join(", ");
}

/**
 * "For teachers: Level N Teacher Pack": the level's card on the main site's /products. Tagged utm_source=academy like
 * the hub's other links (the Sale Team's UTM table: the Level Stories hub is `academy`, order code AC).
 */
export function teacherPackHref(level: number, locale: Locale = "en"): string {
  return `${locale === "vi" ? "/vi" : ""}/products?utm_source=academy#teacher-pack-l${level}`;
}

/** The Level Stories hub's next step: Mr. Jay on Zalo (website assessment, 27 Oct 2026, fix 10). Zalo cannot prefill a
 * message, so the link is tagged utm_source=story-hub for the Sale Team's table. */
export const STORY_HUB_ZALO = "https://zalo.me/84396085076?utm_source=story-hub";

/** The free sample pack form on the main site's home page, tagged like the hub's other links (academy, order code AC). */
export function samplePackHref(locale: Locale = "en"): string {
  return `${locale === "vi" ? "/vi" : "/"}?utm_source=academy#free-sample-pack`;
}

/**
 * The commercial next step, carrying only non-personal context. Story Club is for ages 5–8, so Levels 1–2 go
 * there; Levels 3–5 go to Mr. Jay's Live Speaking Baseline (the same split as the storybooks' own hand-off).
 */
export function continueHref(level: number, locale: Locale = "en"): string {
  if (level <= 2) return `${locale === "vi" ? "/vi" : ""}/story-club/?level=${level}&utm_source=academy`;
  return `/ai-speaking/${locale === "vi" ? "vi/" : ""}baseline?utm_source=academy&level=${level}`;
}

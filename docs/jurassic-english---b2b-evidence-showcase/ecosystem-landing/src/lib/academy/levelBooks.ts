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
// PREVIEW BRANCH ONLY (preview/clickable-stories): protected books preview, never merge to main.
export const BOOKS_BASE_URL = "https://je-storybooks-preview-r9mrx8gvh-jay71adams-1388s-projects.vercel.app";

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
    accepted: true, // PREVIEW: Jay asked for all levels clickable
    stories: [
      { id: "the-unsent-weather-report", title: "The Unsent Weather Report" },
      { id: "the-last-seat-on-the-night-ferry", title: "The Last Seat on the Night Ferry" },
    ],
    extras: [],
  },
  {
    level: 4,
    world: "Cloudpeak Observatory",
    accepted: true, // PREVIEW: Jay asked for all levels clickable
    stories: [
      { id: "the-missing-column", title: "The Missing Column" },
      { id: "the-bridge-committee", title: "The Bridge Committee" },
    ],
    extras: [],
  },
  {
    level: 5,
    world: "University & Exam Bridge",
    accepted: true, // PREVIEW: Jay asked for all levels clickable
    stories: [
      { id: "a-box-called-other", title: "A Box Called Other" },
      { id: "the-map-beneath-the-map", title: "The Map Beneath the Map" },
    ],
    extras: [],
  },
];

export const STORIES_PATH = "/student-academy/stories";

export const levelAnchor = (level: number) => `level-${level}`;

export const levelHref = (level: number) => `${STORIES_PATH}#${levelAnchor(level)}`;

/** Book link, or null while the book app has no public home or the level is not accepted. */
export function bookHref(level: AcademyLevel, book: Book): string | null {
  if (!BOOKS_BASE_URL || !level.accepted) return null;
  return `${BOOKS_BASE_URL}/book.html#${book.id}`;
}

export function coverSrc(level: AcademyLevel, book: Book): string | null {
  if (!BOOKS_BASE_URL || !level.accepted) return null;
  return `${BOOKS_BASE_URL}/assets/art/${book.id}/cover.jpg`;
}

/** The commercial next step: Story Club, carrying only non-personal context. */
export const continueHref = (level: number) => `/story-club/?level=${level}&src=academy`;

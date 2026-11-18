/**
 * Free stories page (DRAFT preview, brief WW-20261115-RL6C, 15 Nov 2026).
 * Seven free half-story editions: first half of the story + 3 activity pages (colouring, connect-the-dots, word search)
 * + a back page linking to the full book. Unlisted and noindex until Jay approves (see routeMetadata.ts). Not in PRODUCTS,
 * JSON-LD product lists, the sitemap or llms. No buy buttons: each card links to an existing page only.
 * Level and age labels are the site's own level data (hub levelBooks.ts); synopses come from the story JSON facts only.
 * Nothing here is rights-cleared for a new product; the free editions' PDFs are still being built.
 */
import type { Locale } from '../locales';

export const FREE_STORIES_PATH = '/free-stories';
export const FREE_STORIES_VI_PATH = '/vi/free-stories';
export const FREE_STORIES_UTM = 'utm_source=free-stories';

/** Placeholder for a free-edition PDF that does not exist yet (listed in the PR body). A card with this value shows
 *  "being prepared" text instead of a link, so nothing points at a missing file. Replace per title when the PDF ships. */
export const PENDING_PDF = 'PENDING_PDF';

export type FreeStory = {
  id: string;
  sourceId: string;
  level: 1 | 3 | 4 | 5;
  ages: string;
  title: string;
  /** Existing product page that contains the full story (text link, not a buy button). */
  fullBookPath: string;
  /** Level 1 only: Story Club (ages 5–8) is a second existing destination. */
  storyClub: boolean;
  /** The Heron Stamp is for teacher and teen channels only. */
  teenOnly: boolean;
  pdfHref: string;
  en: { synopsis: string };
  // NEEDS-NATIVE-READ: every Vietnamese string in this file is machine-drafted.
  vi: { synopsis: string };
};

export const FREE_STORIES: FreeStory[] = [
  { id: 'free-je-l1-18', sourceId: 'JE-L1-18', level: 1, ages: '4–8', title: 'The Wind, the Sun and the Yellow Coat', fullBookPath: '/products/story-workbooks-l1', storyClub: true, teenOnly: false, pdfHref: PENDING_PDF,
    en: { synopsis: 'The Wind blows hard to take Ruby’s yellow coat, but she only holds it tighter. Then the Sun tries a gentler way.' },
    vi: { synopsis: 'Gió thổi mạnh để lấy chiếc áo khoác vàng của Ruby, nhưng bạn chỉ giữ áo chặt hơn. Rồi Mặt Trời thử một cách nhẹ nhàng hơn.' } },
  { id: 'free-je-l1-01', sourceId: 'JE-L1-01', level: 1, ages: '4–8', title: 'Mina and the Midnight Drum', fullBookPath: '/products/story-workbooks-l1', storyClub: true, teenOnly: false, pdfHref: PENDING_PDF,
    en: { synopsis: 'Mina loves her drum, but her friend Sami finds it too loud. They look for a small sound that works for both.' },
    vi: { synopsis: 'Mina yêu chiếc trống của mình, nhưng bạn Sami thấy nó quá to. Hai bạn tìm một âm thanh nhỏ phù hợp với cả hai.' } },
  { id: 'free-je-l1-17', sourceId: 'JE-L1-17', level: 1, ages: '4–8', title: 'Skip and the Red Roof', fullBookPath: '/products/story-workbooks-l1', storyClub: true, teenOnly: false, pdfHref: PENDING_PDF,
    en: { synopsis: 'A big wind blows little swallow Skip far from his nest under the red roof. He has to find the way home.' },
    vi: { synopsis: 'Một cơn gió lớn thổi chú chim én nhỏ Skip bay xa tổ dưới mái nhà đỏ. Chú phải tìm đường về nhà.' } },
  { id: 'free-je-l1-13', sourceId: 'JE-L1-13', level: 1, ages: '4–8', title: 'The Song Across the Lake', fullBookPath: '/products/story-workbooks-l1', storyClub: true, teenOnly: false, pdfHref: PENDING_PDF,
    en: { synopsis: 'Nina and her little brother Bin wait by the dark lake for Mum’s boat. They sing a song so she can hear them.' },
    vi: { synopsis: 'Nina và em trai Bin ngồi chờ thuyền của mẹ bên hồ tối. Hai bạn hát một bài để mẹ nghe thấy.' } },
  { id: 'free-je-l3-c03', sourceId: 'JE-L3-C03', level: 3, ages: '10–12', title: 'The Last Seat on the Night Ferry', fullBookPath: '/products/story-workbooks-l3', storyClub: false, teenOnly: false, pdfHref: PENDING_PDF,
    en: { synopsis: 'On the old ferry’s final evening, Sela carries a sign that says KEEP OUR FERRY. Tala’s need for a way home sends her to ask better questions.' },
    vi: { synopsis: 'Trong buổi tối cuối cùng của chuyến phà cũ, Sela mang tấm biển KEEP OUR FERRY. Việc Tala cần một cách về nhà khiến bạn đặt những câu hỏi tốt hơn.' } },
  { id: 'free-je-l4-c02', sourceId: 'JE-L4-C02', level: 4, ages: '12–14', title: 'The Night Rota', fullBookPath: '/products/story-workbooks-l4', storyClub: false, teenOnly: false, pdfHref: PENDING_PDF,
    en: { synopsis: 'After food goes missing on a field week, students build a night rota with rules nobody voted on. Then the evidence points somewhere else.' },
    vi: { synopsis: 'Sau khi thức ăn bị mất trong tuần học ngoài trời, các bạn lập lịch canh đêm với những luật chưa ai bỏ phiếu. Rồi bằng chứng chỉ về hướng khác.' } },
  { id: 'free-je-l5-c02', sourceId: 'JE-L5-C02', level: 5, ages: '14+', title: 'The Heron Stamp', fullBookPath: '/products/story-workbooks-l5', storyClub: false, teenOnly: true, pdfHref: PENDING_PDF,
    en: { synopsis: 'For a school archive project, Ana sets two accounts of why a pottery cooperative shrank side by side, then checks the ledgers.' },
    vi: { synopsis: 'Trong một dự án lưu trữ của trường, Ana đặt hai lời kể về lý do một hợp tác xã gốm thu nhỏ cạnh nhau, rồi kiểm tra sổ sách.' } },
];

export const freeStoriesContent = {
  en: {
    title: 'Free stories',
    eyebrow: 'Jurassic English · free editions',
    lead: 'Read the first half of a story for free, with three activity pages. Love it? The whole story is one tap away.',
    cardsLabel: 'Free story editions',
    level: 'Level',
    ages: (a: string) => (a.endsWith('+') ? `Ages ${a.slice(0, -1)} and up` : `Ages ${a}`),
    freeLine: 'Free: first half of the story + 3 activity pages',
    activities: 'Colouring, connect-the-dots and a word search, plus a back page that links to the full book.',
    cover: (t: string) => `Cover panel for ${t}`,
    download: 'Download the free edition (PDF)',
    pending: 'Free PDF: being prepared',
    whole: 'Read the whole story',
    wholeIn: (n: number) => `In Story Workbooks Level ${n}`,
    club: 'Story Club (ages 5–8)',
    teen: 'For teachers and teens, ages 14+',
    note: 'The free edition is a sample. The full story, workbook and teacher guide are on the linked page, where the price is shown.',
  },
  vi: {
    title: 'Truyện miễn phí',
    eyebrow: 'Jurassic English · bản đọc miễn phí',
    lead: 'Đọc miễn phí nửa đầu của một truyện, kèm ba trang hoạt động. Thích rồi? Cả truyện chỉ cách một chạm.',
    cardsLabel: 'Các bản truyện miễn phí',
    level: 'Cấp độ',
    ages: (a: string) => (a.endsWith('+') ? `Từ ${a.slice(0, -1)} tuổi` : `${a} tuổi`),
    freeLine: 'Miễn phí: nửa đầu truyện + 3 trang hoạt động',
    activities: 'Tô màu, nối điểm và ô chữ, cùng một trang cuối dẫn tới cuốn đầy đủ.',
    cover: (t: string) => `Bìa tạm của ${t}`,
    download: 'Tải bản miễn phí (PDF)',
    pending: 'File PDF miễn phí: đang chuẩn bị',
    whole: 'Đọc trọn câu chuyện',
    wholeIn: (n: number) => `Có trong Sách truyện bài tập Level ${n}`,
    club: 'Câu lạc bộ Truyện (5–8 tuổi)',
    teen: 'Dành cho giáo viên và học sinh từ 14 tuổi',
    note: 'Bản miễn phí chỉ là bản đọc thử. Truyện đầy đủ, sách bài tập và hướng dẫn giáo viên nằm ở trang được liên kết, nơi có hiển thị giá.',
  },
} as const;

/** Existing-page links, localized and tagged (utm_source last; no #anchor). */
export const freeStoryHref = (path: string, locale: Locale) => `${locale === 'vi' ? '/vi' : ''}${path}?${FREE_STORIES_UTM}`;

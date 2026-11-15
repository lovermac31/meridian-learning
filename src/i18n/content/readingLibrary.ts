/**
 * Reading & Reasoning Library: PREVIEW ONLY (brief WW-20261115-RL6B, 15 Nov 2026).
 *
 * Library titles are deliberately NOT in PRODUCTS: that list feeds PAID_OFFERS, Product/Offer JSON-LD (InStock),
 * product routes, the sitemap and public/llms-products.md. A title here can therefore never get a price, a buy button,
 * an Offer or a sitemap URL. Cards render only when the URL carries ?library-preview=1 (client-side check), so the
 * default page, its prerendered HTML and its structured data are unchanged even if this branch is merged.
 * Nothing here is rights-cleared for a new product or owner-approved. Only Jay merges, deploys, prices and spends.
 */
import type { Locale } from '../locales';

export const LIBRARY_PREVIEW_PARAM = 'library-preview';
export const LIBRARY_ANCHOR = 'reading-library';
export type LibraryAvailability = 'PREVIEW_ONLY' | 'WAITLIST' | 'ON_SALE';

export type LibraryTitle = {
  id: string;
  /** Source id in the Reading Library inventory (01-inventory/manifest.csv). */
  sourceId: string;
  level: 1 | 2 | 3 | 4 | 5;
  /** Display strings taken from the site's own level data (levelBooks.ts); never parsed. */
  ages: string;
  availability: 'PREVIEW_ONLY';
  includes: { reader: boolean; workbook: boolean; guide: boolean };
  title: string;
  en: { synopsis: string };
  // NEEDS-NATIVE-READ: every Vietnamese string in this file is machine-drafted.
  vi: { synopsis: string };
};

// Synopses are written only from the story JSON facts (academy-book-pages/stories/*.json, read 15 Nov 2026).
export const LIBRARY_TITLES: LibraryTitle[] = [
  {
    id: 'rl-je-l1-18', sourceId: 'JE-L1-18', level: 1, ages: '4–8', availability: 'PREVIEW_ONLY',
    includes: { reader: true, workbook: true, guide: true },
    title: 'The Wind, the Sun and the Yellow Coat',
    en: { synopsis: 'The Wind blows hard to take Ruby’s yellow coat, but she only holds it tighter. Then the Sun tries a gentler way.' },
    vi: { synopsis: 'Gió thổi mạnh để lấy chiếc áo khoác vàng của Ruby, nhưng bạn chỉ giữ áo chặt hơn. Rồi Mặt Trời thử một cách nhẹ nhàng hơn.' },
  },
  {
    id: 'rl-je-l3-c03', sourceId: 'JE-L3-C03', level: 3, ages: '10–12', availability: 'PREVIEW_ONLY',
    includes: { reader: true, workbook: true, guide: true },
    title: 'The Last Seat on the Night Ferry',
    en: { synopsis: 'On the old ferry’s final evening, Sela carries a sign that says KEEP OUR FERRY. Tala’s need for a way home sends her to ask better questions.' },
    vi: { synopsis: 'Trong buổi tối cuối cùng của chuyến phà cũ, Sela mang tấm biển KEEP OUR FERRY. Việc Tala cần một cách về nhà khiến bạn đặt những câu hỏi tốt hơn.' },
  },
  {
    id: 'rl-je-l5-c02', sourceId: 'JE-L5-C02', level: 5, ages: '14+', availability: 'PREVIEW_ONLY',
    includes: { reader: true, workbook: true, guide: true },
    title: 'The Heron Stamp',
    en: { synopsis: 'For a school archive project, Ana sets two accounts of why a pottery cooperative shrank side by side, then checks the ledgers.' },
    vi: { synopsis: 'Trong một dự án lưu trữ của trường, Ana đặt hai lời kể về lý do một hợp tác xã gốm thu nhỏ cạnh nhau, rồi kiểm tra sổ sách.' },
  },
];

export const LIBRARY_COPY = {
  en: {
    heading: 'Reading & Reasoning Library (preview)',
    intro: 'Preview only. These new standalone editions have no price yet; the stories are already in our Story Workbooks.',
    level: 'Level', ages: (a: string) => (a.endsWith('+') ? `Ages ${a.slice(0, -1)} and up` : `Ages ${a}`),
    pill: 'Preview only',
    includesLabel: 'Planned parts',
    reader: 'Illustrated reader', workbook: 'Companion workbook', guide: 'Teacher and parent guide',
    cover: (t: string) => `Cover panel for ${t}`,
    notForSale: 'This new standalone edition (reader + workbook + teacher/parent guide) is a preview with no price yet.',
    included: 'The story itself is already included in',
    includedLink: (n: number) => `Story Workbooks Level ${n}`,
    waitlist: 'Ask Mr. Jay to tell you when it is ready',
    licence: 'Licence and delivery details will be published when the title is approved.',
  },
  vi: {
    heading: 'Thư viện Đọc & Lập luận (bản xem trước)',
    intro: 'Chỉ xem trước. Các ấn bản độc lập mới này chưa có giá; các truyện đã có trong Sách truyện bài tập của chúng tôi.',
    level: 'Cấp độ', ages: (a: string) => (a.endsWith('+') ? `Từ ${a.slice(0, -1)} tuổi` : `${a} tuổi`),
    pill: 'Chỉ xem trước',
    includesLabel: 'Các phần dự kiến',
    reader: 'Sách đọc có tranh minh họa', workbook: 'Sách bài tập đi kèm', guide: 'Hướng dẫn cho giáo viên và phụ huynh',
    cover: (t: string) => `Bìa tạm của ${t}`,
    notForSale: 'Ấn bản độc lập mới này (sách đọc + sách bài tập + hướng dẫn giáo viên/phụ huynh) mới chỉ là bản xem trước, chưa có giá.',
    included: 'Bản thân truyện đã có trong',
    includedLink: (n: number) => `Sách truyện bài tập Level ${n}`,
    waitlist: 'Nhờ thầy Jay báo khi sách sẵn sàng',
    licence: 'Thông tin giấy phép và cách nhận sách sẽ được công bố khi tựa sách được duyệt.',
  },
} as const;

/** Client-side flag check. Always false on the server and on the first client render, so SSR and hydration match. */
export const isLibraryPreview = (search: string) => new URLSearchParams(search).get(LIBRARY_PREVIEW_PARAM) === '1';

export const libraryAnchorId = (id: string) => `rl-${id.replace(/^rl-/, '')}`;

/** Waitlist link: reuses /go/zalo/<id> (query before any #anchor, utm_source last as on every link). */
export const libraryWaitlistHref = (id: string, source: 'products' | 'academy') =>
  `/go/zalo/${id}?utm_content=${id}-waitlist&utm_campaign=reading-library&utm_source=${source}`;

export const titlesForLevel = (level: number) => LIBRARY_TITLES.filter((t) => t.level === level);

/** Only an explicitly approved, rights-cleared ON_SALE title may ever be sold; none exists in this preview. */
export const isSellable = (t: { availability: string }) => t.availability === 'ON_SALE';

/** Existing product page that already contains the story (not a buy button on the card). */
export const libraryIncludedHref = (level: number, locale: Locale, source: 'products' | 'academy') =>
  `${locale === 'vi' ? '/vi' : ''}/products/story-workbooks-l${level}?utm_source=${source}`;

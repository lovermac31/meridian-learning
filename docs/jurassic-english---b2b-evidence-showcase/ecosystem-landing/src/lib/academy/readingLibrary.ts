// Hub-side mirror of src/i18n/content/readingLibrary.ts (the Next app cannot import from the main app's src/).
// A test in tests/reading-library.test.ts keeps the two in step. PREVIEW ONLY: cards render only with ?library-preview=1.
// Not in PRODUCTS: no price, no buy button, no Offer. Synopses come from the story JSON facts only.
// NEEDS-NATIVE-READ: every Vietnamese string here is machine-drafted.
export const LIBRARY_PREVIEW_PARAM = "library-preview";
export type LibraryLocale = "en" | "vi";

export type LibraryTitle = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5;
  ages: string;
  availability: "PREVIEW_ONLY";
  includes: { reader: boolean; workbook: boolean; guide: boolean };
  title: string;
  en: { synopsis: string };
  vi: { synopsis: string };
};

export const LIBRARY_TITLES: LibraryTitle[] = [
  {
    id: "rl-je-l1-18", level: 1, ages: "4–8", availability: "PREVIEW_ONLY",
    includes: { reader: true, workbook: true, guide: true },
    title: "The Wind, the Sun and the Yellow Coat",
    en: { synopsis: "The Wind blows hard to take Ruby’s yellow coat, but she only holds it tighter. Then the Sun tries a gentler way." },
    vi: { synopsis: "Gió thổi mạnh để lấy chiếc áo khoác vàng của Ruby, nhưng bạn chỉ giữ áo chặt hơn. Rồi Mặt Trời thử một cách nhẹ nhàng hơn." },
  },
  {
    id: "rl-je-l3-c03", level: 3, ages: "10–12", availability: "PREVIEW_ONLY",
    includes: { reader: true, workbook: true, guide: true },
    title: "The Last Seat on the Night Ferry",
    en: { synopsis: "On the old ferry’s final evening, Sela carries a sign that says KEEP OUR FERRY. Tala’s need for a way home sends her to ask better questions." },
    vi: { synopsis: "Trong buổi tối cuối cùng của chuyến phà cũ, Sela mang tấm biển KEEP OUR FERRY. Việc Tala cần một cách về nhà khiến bạn đặt những câu hỏi tốt hơn." },
  },
  {
    id: "rl-je-l5-c02", level: 5, ages: "14+", availability: "PREVIEW_ONLY",
    includes: { reader: true, workbook: true, guide: true },
    title: "The Heron Stamp",
    en: { synopsis: "For a school archive project, Ana sets two accounts of why a pottery cooperative shrank side by side, then checks the ledgers." },
    vi: { synopsis: "Trong một dự án lưu trữ của trường, Ana đặt hai lời kể về lý do một hợp tác xã gốm thu nhỏ cạnh nhau, rồi kiểm tra sổ sách." },
  },
];

export const LIBRARY_COPY = {
  en: {
    heading: "Reading & Reasoning Library (preview)",
    intro: "Preview only. These titles are not for sale and have no price yet.",
    level: "Level", ages: (a: string) => (a.endsWith("+") ? `Ages ${a.slice(0, -1)} and up` : `Ages ${a}`),
    pill: "Preview only", includesLabel: "Planned parts",
    reader: "Illustrated reader", workbook: "Companion workbook", guide: "Teacher and parent guide",
    cover: (t: string) => `Cover panel for ${t}`,
    notForSale: "Not for sale yet. No price, no order button.",
    waitlist: "Ask Mr. Jay to tell you when it is ready",
    licence: "Licence and delivery details will be published when the title is approved.",
  },
  vi: {
    heading: "Thư viện Đọc & Lập luận (bản xem trước)",
    intro: "Chỉ xem trước. Các tựa sách này chưa bán và chưa có giá.",
    level: "Cấp độ", ages: (a: string) => (a.endsWith("+") ? `Từ ${a.slice(0, -1)} tuổi` : `${a} tuổi`),
    pill: "Chỉ xem trước", includesLabel: "Các phần dự kiến",
    reader: "Sách đọc có tranh minh họa", workbook: "Sách bài tập đi kèm", guide: "Hướng dẫn cho giáo viên và phụ huynh",
    cover: (t: string) => `Bìa tạm của ${t}`,
    notForSale: "Chưa bán. Không có giá, không có nút đặt mua.",
    waitlist: "Nhờ thầy Jay báo khi sách sẵn sàng",
    licence: "Thông tin giấy phép và cách nhận sách sẽ được công bố khi tựa sách được duyệt.",
  },
} as const;

export const libraryWaitlistHref = (id: string) =>
  `/go/zalo/${id}?utm_content=${id}-waitlist&utm_campaign=reading-library&utm_source=academy`;

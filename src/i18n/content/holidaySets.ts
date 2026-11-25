/**
 * Holiday sets, 28 Nov to 6 Dec 2026: the page copy, English and Vietnamese. Dates, prices and prefixes live in
 * src/config/holidaySets.ts; the three products inside each set are read from PRODUCTS (products.ts), so a title or an
 * included item cannot drift from its own product page.
 *
 * Wording rules (Jay's rules for this test): amounts and end dates, never a percentage and never a countdown; no claim
 * beyond what the three product pages already say; the licence stays the one on each product's own page.
 * The Vietnamese copy is machine-drafted and needs a native read, like the rest of the product copy.
 */
import type { Locale } from '../locales';
import { HOLIDAY_SETS, holidaySetById, type HolidaySet } from '../../config/holidaySets.js';
import { PRODUCTS, type Product } from './products.js';

type SetText = { label: string; title: string; problem: string; inside: string; forWho: string; unit: string };

const SET_TEXT: Record<HolidaySet['id'], Record<Locale, SetText>> = {
  'holiday-reading-set-l1': {
    en: {
      label: 'Holiday set · 3 digital downloads · families',
      title: 'Holiday Reading Set, Level 1',
      problem: 'Over the holidays your child stops reading English, and you want a plan, stories and word practice in one place.',
      inside: 'Three digital downloads: the Level 1 Parent Home Reading Pack (46 printable A4 pages), the Holiday Reading Challenge, Levels 1–2 (29 printable A4 pages) and the Word Fossil Flashcards, Level 1 (120 picture cards and 8 games, 26 printable A4 pages).',
      forWho: 'Families with children aged 4–8 at Level 1. One family, for its own children; printable at home. Each item keeps the licence on its own product page.',
      unit: 'holiday set · 3 downloads · one-time',
    },
    vi: {
      label: 'Bộ kỳ nghỉ · 3 tài liệu số · gia đình',
      title: 'Bộ Đọc sách kỳ nghỉ Level 1',
      problem: 'Trong kỳ nghỉ con ngừng đọc tiếng Anh, và bạn muốn có sẵn kế hoạch, truyện và thẻ từ vựng ở một nơi.',
      inside: 'Ba tài liệu số: Bộ đọc sách tại nhà cho phụ huynh Level 1 (46 trang A4 in được), Thử thách đọc sách kỳ nghỉ Level 1–2 (29 trang A4 in được) và Thẻ từ vựng Word Fossil Level 1 (120 thẻ hình và 8 trò chơi, 26 trang A4 in được).',
      forWho: 'Gia đình có con 4–8 tuổi ở Level 1. Một gia đình, cho con của mình; in tại nhà. Mỗi tài liệu giữ nguyên bản quyền ghi trên trang sản phẩm riêng của nó.',
      unit: 'bộ kỳ nghỉ · 3 tài liệu · mua một lần',
    },
  },
  'teacher-starter-set': {
    en: {
      label: 'Holiday set · 3 digital downloads · one teacher',
      title: 'Teacher Starter Set',
      problem: 'You teach young children privately and want lesson plans, a thinking routine and a way to show parents progress, ready before the new term.',
      inside: 'Three digital downloads: the Level 1 Teacher Pack (the course, 40 lesson plans and eleven Teacher Books, 12 PDFs), the Jurassic Thinking Cycle Manual Set and the Reasoning Assessment Kit, Levels 1–5.',
      forWho: 'One named tutor or teacher, for their own classes. Not for use across a centre; centres need the Centre Licence. Each item keeps the licence on its own product page.',
      unit: 'holiday set · 3 downloads · one-time',
    },
    vi: {
      label: 'Bộ kỳ nghỉ · 3 tài liệu số · một giáo viên',
      title: 'Bộ Khởi đầu cho Giáo viên',
      problem: 'Thầy cô dạy kèm các bé và muốn có sẵn giáo án, một thói quen tư duy và cách cho phụ huynh thấy tiến bộ, trước khi vào học kỳ mới.',
      inside: 'Ba tài liệu số: Bộ tài liệu Giáo viên Level 1 (khóa học, 40 giáo án và mười một Sách giáo viên, 12 tệp PDF), Bộ Sổ tay Chu trình Tư duy Jurassic và Bộ công cụ Đánh giá Lập luận Level 1–5.',
      forWho: 'Một giáo viên đứng tên, dùng cho lớp của chính mình. Không dùng cho cả trung tâm; trung tâm cần Giấy phép Trung tâm. Mỗi tài liệu giữ nguyên bản quyền ghi trên trang sản phẩm riêng của nó.',
      unit: 'bộ kỳ nghỉ · 3 tài liệu · mua một lần',
    },
  },
};

const money = (amount: number, locale: Locale) => `${new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(amount)}₫`;
export const holidayMoney = money;

export const holidaySetText = (id: HolidaySet['id'], locale: Locale): SetText => SET_TEXT[id][locale];

/** The three products inside a set, from PRODUCTS (live ones only; a test fails if one goes missing). */
export function holidaySetComponents(set: HolidaySet): Product[] {
  return set.components.map((id) => PRODUCTS.find((product) => product.id === id && product.live)).filter((product): product is Product => Boolean(product));
}

/** The set's title as the payment code and the checkout name it (the OfferLike shape of src/config/payment.ts). */
export const HOLIDAY_OFFER_TITLES = Object.fromEntries(HOLIDAY_SETS.map((set) => [set.id, { en: { title: SET_TEXT[set.id].en.title }, vi: { title: SET_TEXT[set.id].vi.title } }])) as Record<HolidaySet['id'], Record<Locale, { title: string }>>;

export const HOLIDAY_PAGE_COPY: Record<Locale, {
  home: string; products: string; includedHeading: string; includedLead: string; seeSample: string; priceHeading: string;
  usually: (list: string) => string; save: (saving: string) => string; window: string; ends: string; payNote: string; honest: string;
  beforeNote: (opens: string) => string; endedHeading: string; endedBody: string; separate: string; checking: string; all: string;
  bandHeading: string; bandLead: string; bandCta: string; includes: string; soldOneByOne: string; zaloCta: string; orderCode: string; delivery: string;
}> = {
  en: {
    home: 'Home', products: 'Products', includedHeading: 'What is inside', includedLead: 'Look at each item before you decide: every one has the same free sample pages as its own product page.',
    seeSample: 'See the sample pages', priceHeading: 'Holiday set price',
    usually: (list) => `Bought one by one: ${list}`, save: (saving) => `You save ${saving} with the set.`,
    window: 'Offer dates', ends: 'Offer ends', payNote: 'Pay by bank transfer (VietQR) or, outside Vietnam, by PayPal. Mr. Jay checks every set payment by hand, then sends your three files by Google Drive within 24 hours.',
    honest: 'The three items are the same files, with the same licence, as when bought one by one. Nothing else in the set is new.',
    beforeNote: (opens) => `This set opens on ${opens}. Until then each item is sold on its own page at its usual price.`,
    endedHeading: 'This holiday offer has ended',
    endedBody: 'The set is no longer on sale and no payment code is made for it. Each item is still sold on its own page at its usual price.',
    separate: 'Sold separately', checking: 'Checking the offer dates…', all: 'All products and prices',
    bandHeading: 'Holiday sets, 28 November to 6 December', bandLead: 'Three digital downloads in one set, for the holiday weeks. Samples and the set price are on each set’s page.',
    bandCta: 'See the set', includes: 'Includes', soldOneByOne: 'Sold one by one at their usual prices.', zaloCta: 'Ask on Zalo', orderCode: 'When you message, mention code', delivery: 'Digital download. Pay by VietQR; files by Google Drive within 24 hours after Mr. Jay checks your payment.',
  },
  vi: {
    home: 'Trang chủ', products: 'Sản phẩm', includedHeading: 'Bộ gồm những gì', includedLead: 'Xem từng tài liệu trước khi quyết định: mỗi tài liệu có đúng các trang xem thử miễn phí như trên trang sản phẩm riêng của nó.',
    seeSample: 'Xem các trang mẫu', priceHeading: 'Giá bộ kỳ nghỉ',
    usually: (list) => `Mua lẻ từng tài liệu: ${list}`, save: (saving) => `Mua cả bộ tiết kiệm ${saving}.`,
    window: 'Thời gian áp dụng', ends: 'Ưu đãi kết thúc', payNote: 'Thanh toán chuyển khoản (VietQR) hoặc, ngoài Việt Nam, qua PayPal. Thầy Jay kiểm tra từng khoản thanh toán của bộ bằng tay, rồi gửi ba tệp qua Google Drive trong vòng 24 giờ.',
    honest: 'Ba tài liệu là đúng các tệp, cùng bản quyền, như khi mua lẻ từng cái. Bộ không có thêm nội dung mới nào khác.',
    beforeNote: (opens) => `Bộ này mở bán vào ${opens}. Trước đó từng tài liệu được bán riêng trên trang của nó với giá thông thường.`,
    endedHeading: 'Ưu đãi kỳ nghỉ đã kết thúc',
    endedBody: 'Bộ không còn được bán và không tạo mã thanh toán cho bộ nữa. Từng tài liệu vẫn được bán riêng trên trang của nó với giá thông thường.',
    separate: 'Bán riêng', checking: 'Đang kiểm tra thời gian ưu đãi…', all: 'Tất cả sản phẩm và học phí',
    bandHeading: 'Bộ kỳ nghỉ, 28/11 đến 6/12', bandLead: 'Ba tài liệu số trong một bộ, cho những tuần nghỉ. Bản xem thử và giá bộ nằm trên trang của từng bộ.',
    bandCta: 'Xem bộ này', includes: 'Gồm', soldOneByOne: 'Mua lẻ từng tài liệu theo giá thông thường.', zaloCta: 'Hỏi qua Zalo', orderCode: 'Khi nhắn tin, hãy nhắc mã', delivery: 'Tài liệu số. Thanh toán qua VietQR; tệp gửi qua Google Drive trong vòng 24 giờ sau khi thầy Jay kiểm tra khoản thanh toán.',
  },
};

export const holidayPageSeo = (id: HolidaySet['id'], locale: Locale) => {
  const set = holidaySetById(id)!;
  const t = SET_TEXT[id][locale];
  const sale = money(set.saleVnd, locale);
  return {
    title: locale === 'vi' ? `${t.title}, ${sale}, 28/11 đến 6/12 | Jurassic English™` : `${t.title}, ${sale}, 28 Nov to 6 Dec | Jurassic English™`,
    description: locale === 'vi'
      ? `${t.label}. ${sale} thay vì ${money(set.listVnd, 'vi')} khi mua lẻ, chỉ từ 28/11 đến hết 6/12/2026. Xem mẫu trước khi mua.`
      : `${t.label}. ${sale} instead of ${money(set.listVnd, 'en')} bought one by one, from 28 November to 6 December 2026 only. See the samples before you buy.`,
  };
};

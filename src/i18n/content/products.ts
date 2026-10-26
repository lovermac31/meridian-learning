/**
 * /products — every Jurassic English product with its price and how to buy it (master directive P-1, Jay 27 Oct 2026:
 * "start building things that I can sell").
 *
 * Follows the JE Page Infrastructure Standard: one hub (reached from the footer and Kids Academy, never the header or
 * home page), audience sections with anchors (#families, #teachers, #centres), cards with one CTA each, EN/VI twins,
 * and utm_source=products on every outbound link (query before any #anchor).
 *
 * DATA-DRIVEN: PRODUCTS below is the one list of cards. A new product is one entry: its section, price, link, whether
 * it is a digital download, whether it has an image, and its EN + VI text. Cards appear in list order within their
 * section. A square (1:1) product image is shown when `image: true` and public/images/products/<id>.webp exists.
 *
 * Prices approved by Jay on 27 Oct 2026, including the Level 1 Printable Storybook Pack (149.000₫) and the Level 1
 * Teacher Pack (690.000₫). Card copy (problem → what's inside → who it's for) is the Kids Academy session's P-3 copy
 * (Drive doc "08 /products page copy", 27 Oct), with two lines aligned to the live pages: the Baseline report as the
 * Baseline page describes it (no fee-credit promise), and 1-to-1 lessons "with Mr. Jay's team" as the checkout says.
 * The Vietnamese copy is machine-drafted and needs a native read. Only Jurassic English's own storybooks are named;
 * the Teacher Pack says the lessons use 10 widely available picture books.
 */
import type { Locale } from '../locales';

export const PRODUCTS_PATH = '/products';
export const PRODUCTS_VI_PATH = '/vi/products';
export const PRODUCTS_UTM = 'utm_source=products';
export const PRODUCTS_ZALO = `https://zalo.me/84396085076?${PRODUCTS_UTM}`;
export const PRODUCT_IMAGE_DIR = '/images/products';

export const PRODUCT_SECTIONS = ['families', 'teachers', 'centres'] as const;
export type ProductSectionId = (typeof PRODUCT_SECTIONS)[number];

type CardText = {
  label: string;
  title: string;
  problem: string;
  inside: string;
  forWho: string;
  unit: string;
  cta: string;
  // Alt text for the product image; the title is used when it is missing.
  imageAlt?: string;
};

export type Product = {
  id: string;
  section: ProductSectionId;
  price: string;
  // Internal path (localized and tagged by the page) or 'zalo'.
  href: string;
  // Digital download: the payment and delivery line is shown under the CTA.
  delivery?: boolean;
  // A square WebP exists at public/images/products/<id>.webp.
  image?: boolean;
  en: CardText;
  vi: CardText;
};

export const PRODUCTS: Product[] = [
  {
    id: 'story-club',
    section: 'families',
    price: '590.000₫',
    href: '/story-club',
    en: {
      label: 'Live online group',
      title: 'Story Club with Mr. Jay',
      problem: 'Your child reads, but nobody checks they understood, and big classes give no personal feedback.',
      inside: '4 Saturday sessions of 30 minutes on Google Meet (not recorded), one small task at home each week, and Mr. Jay’s personal reply to every child on Zalo.',
      forWho: 'Ages 5–8. Up to 6 children a group, Saturdays 9:00.',
      unit: 'for 4 weeks',
      cta: 'Ask for a place',
    },
    vi: {
      label: 'Nhóm nhỏ trực tuyến',
      title: 'Câu lạc bộ Truyện cùng thầy Jay',
      problem: 'Con có đọc truyện, nhưng không ai kiểm tra con hiểu đến đâu, và lớp đông thì không có nhận xét riêng cho con.',
      inside: '4 buổi sáng thứ Bảy, mỗi buổi 30 phút qua Google Meet (không ghi hình), mỗi tuần một bài nhỏ ở nhà, và thầy Jay phản hồi riêng cho từng bé qua Zalo.',
      forWho: 'Bé 5–8 tuổi. Tối đa 6 bé một nhóm, sáng thứ Bảy 9:00.',
      unit: 'cho 4 tuần',
      cta: 'Hỏi giữ chỗ',
    },
  },
  {
    id: 'baseline',
    section: 'families',
    price: '690.000₫',
    href: '/ai-speaking/baseline',
    en: {
      label: 'Live online · one session',
      title: 'Live Speaking Baseline',
      problem: 'You pay for courses without knowing your child’s real speaking level or what to fix first.',
      inside: 'One live 15–20 minute speaking session with Mr. Jay, then a written plan: four criterion bands, an overall band and what to work on next.',
      forWho: 'Learners aged 9–18 with a school or exam target, and parents who want a diagnosis before they buy a course.',
      unit: 'one session',
      cta: 'Book a Baseline',
    },
    vi: {
      label: 'Trực tuyến · một buổi',
      title: 'Đánh giá Nói trực tiếp',
      problem: 'Bố mẹ đóng tiền khóa học mà chưa biết con thực sự nói tiếng Anh ở mức nào, và cần ưu tiên cải thiện điều gì trước.',
      inside: 'Một buổi nói trực tiếp 15–20 phút với thầy Jay, sau đó là kế hoạch bằng văn bản: điểm bốn tiêu chí, điểm tổng và điều cần luyện tiếp theo.',
      forWho: 'Học sinh 9–18 tuổi có mục tiêu ở trường hoặc kỳ thi, và phụ huynh muốn biết rõ trình độ trước khi đăng ký khóa học.',
      unit: 'một buổi',
      cta: 'Đặt lịch đánh giá',
    },
  },
  {
    id: 'one-to-one',
    section: 'families',
    price: '800.000₫',
    href: '/ai-speaking/lessons',
    en: {
      label: 'Live online · private',
      title: '1-to-1 lessons with Mr. Jay’s team',
      problem: 'Your child is shy in big classes, or needs one specific skill fixed, and group lessons move at someone else’s pace.',
      inside: '60-minute private lessons on Google Meet, planned around your child’s own goals.',
      forWho: 'Any age. Best after a Baseline, or for families who need their own times.',
      unit: 'per 60-minute lesson · 8 lessons 5.600.000₫',
      cta: 'Book 1-to-1 lessons',
    },
    vi: {
      label: 'Trực tuyến · học riêng',
      title: 'Học 1 kèm 1 với đội ngũ của thầy Jay',
      problem: 'Con nhút nhát trong lớp đông, hoặc cần cải thiện đúng một kỹ năng, mà lớp nhóm lại đi theo tốc độ của người khác.',
      inside: 'Buổi học riêng 60 phút qua Google Meet, xây dựng theo mục tiêu của chính con.',
      forWho: 'Mọi độ tuổi. Phù hợp nhất sau buổi đánh giá, hoặc với gia đình cần lịch học riêng.',
      unit: 'mỗi buổi 60 phút · 8 buổi 5.600.000₫',
      cta: 'Đặt lịch học 1 kèm 1',
    },
  },
  {
    id: 'printable-pack',
    section: 'families',
    price: '149.000₫',
    href: 'zalo',
    delivery: true,
    en: {
      label: 'Digital download',
      title: 'Level 1 Printable Storybook Pack',
      problem: 'Your young child loves the free stories on screen, but you want something to read together away from the screen, with activities that turn reading into talking.',
      inside: 'Print-ready PDFs of the 3 original Jurassic English Level 1 storybooks (Mina and the Midnight Drum, The Lantern With Two Handles, Lina and the Orchard Map) with their activity books.',
      forWho: 'Families with children aged 4–8. One-family licence: print as many copies as you like for your own home.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số',
      title: 'Bộ truyện in Level 1',
      problem: 'Con thích đọc truyện miễn phí trên màn hình, nhưng bố mẹ muốn có truyện in để cùng đọc với con, kèm hoạt động giúp con nói về câu chuyện.',
      inside: 'Bản PDF sẵn sàng để in của 3 cuốn truyện gốc Jurassic English Level 1 (Mina and the Midnight Drum, The Lantern With Two Handles, Lina and the Orchard Map) kèm sách hoạt động.',
      forWho: 'Gia đình có bé 4–8 tuổi. Bản quyền cho một gia đình: in bao nhiêu bản cũng được để dùng trong nhà.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'teacher-pack',
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    delivery: true,
    en: {
      label: 'Digital download · one teacher',
      title: 'Level 1 Teacher Pack',
      problem: 'You teach young children privately and spend your evenings planning lessons from scratch.',
      inside: 'The Level 1 Foundation teacher materials: 40 lessons scripted minute by minute with the teacher’s lines and a simple rubric, the Teacher Implementation Manual, and the 3 original storybooks.',
      forWho: 'One named tutor or teacher, for their own classes (ages 4–8). Not for use across a centre; centres need the Centre Licence. The lessons use 10 widely available picture books the teacher provides.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · một giáo viên',
      title: 'Bộ tài liệu Giáo viên Level 1',
      problem: 'Thầy cô dạy kèm các bé và mất cả buổi tối để tự soạn bài từ đầu.',
      inside: 'Bộ tài liệu giáo viên Level 1 Foundation: 40 giáo án soạn sẵn từng phút có lời thoại giáo viên và thang đánh giá đơn giản, Sổ tay triển khai cho giáo viên, và 3 cuốn truyện gốc.',
      forWho: 'Một giáo viên đứng tên, dùng cho lớp của chính mình (bé 4–8 tuổi). Không dùng cho cả trung tâm; trung tâm cần Giấy phép Trung tâm. Giáo án sử dụng 10 cuốn sách tranh phổ biến, giáo viên tự chuẩn bị.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'centre-licence',
    section: 'centres',
    price: '4.900.000₫',
    href: 'zalo',
    delivery: true,
    en: {
      label: 'Founding price',
      title: 'Level 1 Centre Licence',
      problem: 'A teacher leaves and the class loses a term, because the curriculum walked out with the teacher.',
      inside: 'A full school year for ages 4–8: 40 scripted lessons with the teacher’s lines, the Teacher Implementation Manual, the Teacher Training Manual and slides, a sample unit, and 3 original storybooks. A new teacher can run it next week.',
      forWho: 'Owners and academic leads of young-learner and kindergarten centres. One campus, one school year, all its teachers. Founding price for the first centres.',
      unit: 'per campus, per school year',
      cta: 'See a lesson in 10 minutes',
    },
    vi: {
      label: 'Giá sáng lập',
      title: 'Giấy phép Trung tâm Level 1',
      problem: 'Một giáo viên nghỉ việc là lớp học mất cả một học kỳ, vì giáo trình nằm trong đầu giáo viên đó.',
      inside: 'Trọn một năm học cho bé 4–8 tuổi: 40 giáo án soạn sẵn có lời thoại giáo viên, Sổ tay triển khai, Tài liệu đào tạo giáo viên và slide, bài mẫu, và 3 cuốn truyện gốc. Giáo viên mới có thể dạy ngay từ tuần sau.',
      forWho: 'Chủ trung tâm và trưởng học thuật của trung tâm tiếng Anh thiếu nhi, trường mầm non. Một cơ sở, một năm học, toàn bộ giáo viên. Giá sáng lập dành cho các trung tâm đầu tiên.',
      unit: 'mỗi cơ sở, mỗi năm học',
      cta: 'Xem một bài dạy trong 10 phút',
    },
  },
];

type PageCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  back: string;
  delivery: string;
  leadIns: { problem: string; inside: string; forWho: string };
  sections: Record<ProductSectionId, { heading: string; intro: string }>;
  closing: { heading: string; body: string; cta: string };
};

const PAGE: Record<Locale, PageCopy> = {
  en: {
    eyebrow: 'Products and prices',
    title: 'Jurassic English products',
    lead: 'Small, personal English for children who need to think, explain and speak, not just memorise. Pick the problem you want solved.',
    back: 'Jurassic English home',
    delivery: 'Pay by VietQR after a written order summary; your files arrive by Google Drive within 24 hours.',
    leadIns: { problem: 'The problem', inside: 'What’s inside', forWho: 'Who it’s for' },
    sections: {
      families: { heading: 'For families', intro: 'Live classes with Mr. Jay, and printables for home.' },
      teachers: { heading: 'For teachers', intro: 'Materials for one teacher, ready to use in class.' },
      centres: { heading: 'For centres', intro: 'One licence for every teacher on a campus.' },
    },
    closing: { heading: 'Not sure which fits?', body: 'Message Mr. Jay on Zalo and he will point you to the right option. Nothing is charged until you accept a written order summary.', cta: 'Ask Mr. Jay on Zalo' },
  },
  // Machine-drafted (27 Oct 2026, P-3). Needs a native read before merge.
  vi: {
    eyebrow: 'Sản phẩm và học phí',
    title: 'Sản phẩm Jurassic English',
    lead: 'Tiếng Anh nhóm nhỏ, kèm riêng, dành cho các con cần biết suy nghĩ, giải thích và nói, không chỉ học thuộc. Chọn đúng vấn đề nhà mình đang cần giải quyết.',
    back: 'Trang chủ Jurassic English',
    delivery: 'Thanh toán qua VietQR sau khi nhận bản tóm tắt đơn hàng; tài liệu được gửi qua Google Drive trong vòng 24 giờ.',
    leadIns: { problem: 'Vấn đề', inside: 'Gồm có', forWho: 'Dành cho' },
    sections: {
      families: { heading: 'Dành cho gia đình', intro: 'Lớp học trực tiếp cùng thầy Jay, và tài liệu in để học ở nhà.' },
      teachers: { heading: 'Dành cho giáo viên', intro: 'Tài liệu cho một giáo viên, dùng được ngay trên lớp.' },
      centres: { heading: 'Dành cho trung tâm', intro: 'Một giấy phép cho tất cả giáo viên của một cơ sở.' },
    },
    closing: { heading: 'Chưa chắc sản phẩm nào phù hợp?', body: 'Nhắn thầy Jay qua Zalo, thầy sẽ gợi ý lựa chọn phù hợp. Không thu tiền cho đến khi bạn đồng ý bản tóm tắt đơn hàng bằng văn bản.', cta: 'Hỏi thầy Jay qua Zalo' },
  },
};

export type ProductCard = CardText & Pick<Product, 'id' | 'price' | 'href' | 'delivery' | 'image'>;

/** The page in one language: its copy, and the sections in order with their cards from PRODUCTS. */
export function productsPage(locale: Locale) {
  const copy = PAGE[locale];
  return {
    ...copy,
    sections: PRODUCT_SECTIONS.map((id) => ({
      id,
      ...copy.sections[id],
      cards: PRODUCTS.filter((p) => p.section === id).map(
        ({ id: cardId, price, href, delivery, image, [locale]: text }): ProductCard => ({ id: cardId, price, href, delivery, image, ...text }),
      ),
    })).filter((section) => section.cards.length > 0),
  };
}

export const productsContent: Record<Locale, ReturnType<typeof productsPage>> = { en: productsPage('en'), vi: productsPage('vi') };

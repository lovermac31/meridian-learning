/**
 * /products — every Jurassic English product with its price and how to buy it (master directive P-1, Jay 27 Oct 2026:
 * "start building things that I can sell").
 *
 * Follows the JE Page Infrastructure Standard: one hub (reached from the footer and Kids Academy, never the header or
 * home page), audience sections with anchors (#families, #teachers, #centres), cards with one CTA each, EN/VI twins,
 * and utm_source=products on every outbound link (query before any #anchor).
 *
 * PROPOSED until Jay confirms on merge: the Level 1 Printable Storybook Pack (149.000₫) and the Level 1 Teacher Pack
 * (690.000₫). Copy is a placeholder until the Kids Academy session's product copy (P-3) lands. The Vietnamese copy is
 * machine-drafted and needs a native read. No published book titles: the Teacher Pack only says the lessons use
 * 10 widely available picture books.
 */
import type { Locale } from '../locales';

export const PRODUCTS_PATH = '/products';
export const PRODUCTS_VI_PATH = '/vi/products';
export const PRODUCTS_UTM = 'utm_source=products';
export const PRODUCTS_ZALO = `https://zalo.me/84396085076?${PRODUCTS_UTM}`;

export type ProductSectionId = 'families' | 'teachers' | 'centres';

export type ProductCard = {
  id: string;
  label: string;
  title: string;
  body: string;
  price: string;
  unit: string;
  cta: string;
  // Internal path (localized and tagged by the page) or 'zalo'.
  href: string;
  // Digital products: how payment and delivery work, shown under the CTA.
  delivery?: boolean;
};

type ProductsCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  back: string;
  delivery: string;
  sections: { id: ProductSectionId; heading: string; intro: string; cards: ProductCard[] }[];
  closing: { heading: string; body: string; cta: string };
};

const en: ProductsCopy = {
  eyebrow: 'Products and prices',
  title: 'Jurassic English products',
  lead:
    'Classes and lessons for families, ready-to-teach materials for teachers, and a licence for centres. Each one shows its price and how to buy it.',
  back: 'Jurassic English home',
  delivery: 'Pay by VietQR after a written order summary; your files arrive by Google Drive within 24 hours.',
  sections: [
    {
      id: 'families',
      heading: 'For families',
      intro: 'Live classes with Mr. Jay, and printables for home.',
      cards: [
        {
          id: 'story-club',
          label: 'Ages 5–8 · small online group',
          title: 'Story Club with Mr. Jay',
          body: 'A 30-minute live story time each week, one small task at home and a personal reply from Mr. Jay. Up to 6 children per group, Saturdays 9:00.',
          price: '590.000₫',
          unit: 'for 4 weeks',
          cta: 'See Story Club',
          href: '/story-club',
        },
        {
          id: 'baseline',
          label: 'Ages 9–18 and adults · online',
          title: 'Live Speaking Baseline',
          body: 'A 15–20 minute live speaking session with Mr. Jay, then a written report of the starting point and what to work on first.',
          price: '690.000₫',
          unit: 'one session',
          cta: 'Book the Baseline',
          href: '/ai-speaking/baseline',
        },
        {
          id: 'one-to-one',
          label: 'All ages · 60 minutes online',
          title: '1-to-1 with Mr. Jay',
          body: 'A private online lesson planned around your child’s next step. Pay online by VietQR or PayPal.',
          price: '800.000₫',
          unit: 'per 60-minute lesson',
          cta: 'Book a lesson',
          href: '/ai-speaking/lessons',
        },
        {
          id: 'printable-pack',
          label: 'Ages 4–8 · digital download',
          title: 'Level 1 Printable Storybook Pack',
          body: 'Print-ready activity books and certificates for our three original Level 1 storybooks. The stories themselves stay free to read online.',
          price: '149.000₫',
          unit: 'one-time',
          cta: 'Order on Zalo',
          href: 'zalo',
          delivery: true,
        },
      ],
    },
    {
      id: 'teachers',
      heading: 'For teachers',
      intro: 'Materials for one teacher, ready to use in class.',
      cards: [
        {
          id: 'teacher-pack',
          label: 'One teacher · ages 4–8 · digital download',
          title: 'Level 1 Teacher Pack',
          body: 'The Level 1 syllabus, 40 lesson plans scripted minute by minute, and the teacher manual. The lessons use 10 widely available picture books, which you provide. For a whole centre, see the Centre Licence.',
          price: '690.000₫',
          unit: 'one-time',
          cta: 'Order on Zalo',
          href: 'zalo',
          delivery: true,
        },
      ],
    },
    {
      id: 'centres',
      heading: 'For centres',
      intro: 'One licence for every teacher on a campus.',
      cards: [
        {
          id: 'centre-licence',
          label: 'Founding price · one campus, one school year',
          title: 'Level 1 Centre Licence',
          body: 'Everything in the Teacher Pack for every teacher on one campus, plus teacher training and our three original storybooks with print editions.',
          price: '4.900.000₫',
          unit: 'per campus, per school year',
          cta: 'Message Mr. Jay on Zalo',
          href: 'zalo',
          delivery: true,
        },
      ],
    },
  ],
  closing: {
    heading: 'Not sure which fits?',
    body: 'Message Mr. Jay on Zalo and he will point you to the right option. Nothing is charged until you accept a written order summary.',
    cta: 'Ask Mr. Jay on Zalo',
  },
};

// Machine-drafted (27 Oct 2026). Needs a native read before merge.
const vi: ProductsCopy = {
  eyebrow: 'Sản phẩm và học phí',
  title: 'Sản phẩm của Jurassic English',
  lead:
    'Lớp học và buổi học cho gia đình, tài liệu dạy sẵn cho giáo viên, và giấy phép cho trung tâm. Mỗi sản phẩm đều ghi rõ giá và cách mua.',
  back: 'Trang chủ Jurassic English',
  delivery: 'Thanh toán qua VietQR sau khi nhận bản tóm tắt đơn hàng; tài liệu được gửi qua Google Drive trong vòng 24 giờ.',
  sections: [
    {
      id: 'families',
      heading: 'Dành cho gia đình',
      intro: 'Lớp học trực tiếp cùng thầy Jay, và tài liệu in để học ở nhà.',
      cards: [
        {
          id: 'story-club',
          label: 'Bé 5–8 tuổi · nhóm nhỏ trực tuyến',
          title: 'Câu lạc bộ Truyện cùng thầy Jay',
          body: 'Mỗi tuần 30 phút kể chuyện trực tiếp, một bài nhỏ ở nhà và phản hồi riêng từ thầy Jay. Tối đa 6 bạn mỗi nhóm, sáng thứ Bảy 9:00.',
          price: '590.000₫',
          unit: 'cho 4 tuần',
          cta: 'Xem Câu lạc bộ Truyện',
          href: '/story-club',
        },
        {
          id: 'baseline',
          label: '9–18 tuổi và người lớn · trực tuyến',
          title: 'Đánh giá Nói trực tiếp',
          body: 'Một buổi nói trực tiếp 15–20 phút với thầy Jay, sau đó là báo cáo bằng văn bản về điểm xuất phát và điều cần luyện trước tiên.',
          price: '690.000₫',
          unit: 'một buổi',
          cta: 'Đặt lịch Đánh giá',
          href: '/ai-speaking/baseline',
        },
        {
          id: 'one-to-one',
          label: 'Mọi lứa tuổi · 60 phút trực tuyến',
          title: 'Học 1 kèm 1 với thầy Jay',
          body: 'Một buổi học riêng trực tuyến, được lên kế hoạch theo bước tiếp theo của con. Thanh toán trực tuyến qua VietQR hoặc PayPal.',
          price: '800.000₫',
          unit: 'mỗi buổi 60 phút',
          cta: 'Đặt buổi học',
          href: '/ai-speaking/lessons',
        },
        {
          id: 'printable-pack',
          label: 'Bé 4–8 tuổi · tài liệu số',
          title: 'Bộ tài liệu in truyện Level 1',
          body: 'Sách hoạt động và giấy chứng nhận sẵn để in cho ba truyện tranh gốc Level 1. Bản thân các truyện vẫn đọc miễn phí trực tuyến.',
          price: '149.000₫',
          unit: 'mua một lần',
          cta: 'Đặt mua qua Zalo',
          href: 'zalo',
          delivery: true,
        },
      ],
    },
    {
      id: 'teachers',
      heading: 'Dành cho giáo viên',
      intro: 'Tài liệu cho một giáo viên, dùng được ngay trên lớp.',
      cards: [
        {
          id: 'teacher-pack',
          label: 'Một giáo viên · bé 4–8 tuổi · tài liệu số',
          title: 'Bộ tài liệu Giáo viên Level 1',
          body: 'Chương trình Level 1, 40 giáo án soạn sẵn từng phút và sổ tay giáo viên. Các bài học dùng 10 cuốn truyện tranh phổ biến, giáo viên tự chuẩn bị. Cho cả trung tâm, xem Giấy phép Trung tâm.',
          price: '690.000₫',
          unit: 'mua một lần',
          cta: 'Đặt mua qua Zalo',
          href: 'zalo',
          delivery: true,
        },
      ],
    },
    {
      id: 'centres',
      heading: 'Dành cho trung tâm',
      intro: 'Một giấy phép cho tất cả giáo viên của một cơ sở.',
      cards: [
        {
          id: 'centre-licence',
          label: 'Giá sáng lập · một cơ sở, một năm học',
          title: 'Giấy phép Trung tâm Level 1',
          body: 'Toàn bộ Bộ tài liệu Giáo viên cho mọi giáo viên của một cơ sở, cùng tài liệu đào tạo giáo viên và ba truyện tranh gốc có bản in.',
          price: '4.900.000₫',
          unit: 'mỗi cơ sở, mỗi năm học',
          cta: 'Nhắn thầy Jay qua Zalo',
          href: 'zalo',
          delivery: true,
        },
      ],
    },
  ],
  closing: {
    heading: 'Chưa chắc sản phẩm nào phù hợp?',
    body: 'Nhắn thầy Jay qua Zalo, thầy sẽ gợi ý lựa chọn phù hợp. Không thu tiền cho đến khi bạn đồng ý bản tóm tắt đơn hàng bằng văn bản.',
    cta: 'Hỏi thầy Jay qua Zalo',
  },
};

export const productsContent: Record<Locale, ProductsCopy> = { en, vi };

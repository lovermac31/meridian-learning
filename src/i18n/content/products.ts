/**
 * /products — every Jurassic English product with its price and how to buy it (master directive P-1, Jay 27 Oct 2026:
 * "start building things that I can sell").
 *
 * Follows the JE Page Infrastructure Standard: one hub (reached from the footer and Kids Academy, never the header or
 * home page), audience sections with anchors (#families, #teachers, #centres), cards with one CTA each, EN/VI twins,
 * and utm_source=products on every outbound link (query before any #anchor).
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

export type ProductSectionId = 'families' | 'teachers' | 'centres';

export type ProductCard = {
  id: string;
  label: string;
  title: string;
  problem: string;
  inside: string;
  forWho: string;
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
  leadIns: { problem: string; inside: string; forWho: string };
  sections: { id: ProductSectionId; heading: string; intro: string; cards: ProductCard[] }[];
  closing: { heading: string; body: string; cta: string };
};

const en: ProductsCopy = {
  eyebrow: 'Products and prices',
  title: 'Jurassic English products',
  lead: 'Small, personal English for children who need to think, explain and speak, not just memorise. Pick the problem you want solved.',
  back: 'Jurassic English home',
  delivery: 'Pay by VietQR after a written order summary; your files arrive by Google Drive within 24 hours.',
  leadIns: { problem: 'The problem', inside: 'What’s inside', forWho: 'Who it’s for' },
  sections: [
    {
      id: 'families',
      heading: 'For families',
      intro: 'Live classes with Mr. Jay, and printables for home.',
      cards: [
        {
          id: 'story-club',
          label: 'Live online group',
          title: 'Story Club with Mr. Jay',
          problem: 'Your child reads, but nobody checks they understood, and big classes give no personal feedback.',
          inside: '4 Saturday sessions of 30 minutes on Google Meet (not recorded), one small task at home each week, and Mr. Jay’s personal reply to every child on Zalo.',
          forWho: 'Ages 5–8. Up to 6 children a group, Saturdays 9:00.',
          price: '590.000₫',
          unit: 'for 4 weeks',
          cta: 'Ask for a place',
          href: '/story-club',
        },
        {
          id: 'baseline',
          label: 'Live online · one session',
          title: 'Live Speaking Baseline',
          problem: 'You pay for courses without knowing your child’s real speaking level or what to fix first.',
          inside: 'One live 15–20 minute speaking session with Mr. Jay, then a written plan: four criterion bands, an overall band and what to work on next.',
          forWho: 'Learners aged 9–18 with a school or exam target, and parents who want a diagnosis before they buy a course.',
          price: '690.000₫',
          unit: 'one session',
          cta: 'Book a Baseline',
          href: '/ai-speaking/baseline',
        },
        {
          id: 'one-to-one',
          label: 'Live online · private',
          title: '1-to-1 lessons with Mr. Jay’s team',
          problem: 'Your child is shy in big classes, or needs one specific skill fixed, and group lessons move at someone else’s pace.',
          inside: '60-minute private lessons on Google Meet, planned around your child’s own goals.',
          forWho: 'Any age. Best after a Baseline, or for families who need their own times.',
          price: '800.000₫',
          unit: 'per 60-minute lesson · 8 lessons 5.600.000₫',
          cta: 'Book 1-to-1 lessons',
          href: '/ai-speaking/lessons',
        },
        {
          id: 'printable-pack',
          label: 'Digital download',
          title: 'Level 1 Printable Storybook Pack',
          problem: 'Your young child loves the free stories on screen, but you want something to read together away from the screen, with activities that turn reading into talking.',
          inside: 'Print-ready PDFs of the 3 original Jurassic English Level 1 storybooks (Mina and the Midnight Drum, The Lantern With Two Handles, Lina and the Orchard Map) with their activity books.',
          forWho: 'Families with children aged 4–8. One-family licence: print as many copies as you like for your own home.',
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
          label: 'Digital download · one teacher',
          title: 'Level 1 Teacher Pack',
          problem: 'You teach young children privately and spend your evenings planning lessons from scratch.',
          inside: 'The Level 1 Foundation teacher materials: 40 lessons scripted minute by minute with the teacher’s lines and a simple rubric, the Teacher Implementation Manual, and the 3 original storybooks.',
          forWho: 'One named tutor or teacher, for their own classes (ages 4–8). Not for use across a centre; centres need the Centre Licence. The lessons use 10 widely available picture books the teacher provides.',
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
          label: 'Founding price',
          title: 'Level 1 Centre Licence',
          problem: 'A teacher leaves and the class loses a term, because the curriculum walked out with the teacher.',
          inside: 'A full school year for ages 4–8: 40 scripted lessons with the teacher’s lines, the Teacher Implementation Manual, the Teacher Training Manual and slides, a sample unit, and 3 original storybooks. A new teacher can run it next week.',
          forWho: 'Owners and academic leads of young-learner and kindergarten centres. One campus, one school year, all its teachers. Founding price for the first centres.',
          price: '4.900.000₫',
          unit: 'per campus, per school year',
          cta: 'See a lesson in 10 minutes',
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

// Machine-drafted (27 Oct 2026, P-3). Needs a native read before merge.
const vi: ProductsCopy = {
  eyebrow: 'Sản phẩm và học phí',
  title: 'Sản phẩm Jurassic English',
  lead: 'Tiếng Anh nhóm nhỏ, kèm riêng, dành cho các con cần biết suy nghĩ, giải thích và nói, không chỉ học thuộc. Chọn đúng vấn đề nhà mình đang cần giải quyết.',
  back: 'Trang chủ Jurassic English',
  delivery: 'Thanh toán qua VietQR sau khi nhận bản tóm tắt đơn hàng; tài liệu được gửi qua Google Drive trong vòng 24 giờ.',
  leadIns: { problem: 'Vấn đề', inside: 'Gồm có', forWho: 'Dành cho' },
  sections: [
    {
      id: 'families',
      heading: 'Dành cho gia đình',
      intro: 'Lớp học trực tiếp cùng thầy Jay, và tài liệu in để học ở nhà.',
      cards: [
        {
          id: 'story-club',
          label: 'Nhóm nhỏ trực tuyến',
          title: 'Câu lạc bộ Truyện cùng thầy Jay',
          problem: 'Con có đọc truyện, nhưng không ai kiểm tra con hiểu đến đâu, và lớp đông thì không có nhận xét riêng cho con.',
          inside: '4 buổi sáng thứ Bảy, mỗi buổi 30 phút qua Google Meet (không ghi hình), mỗi tuần một bài nhỏ ở nhà, và thầy Jay phản hồi riêng cho từng bé qua Zalo.',
          forWho: 'Bé 5–8 tuổi. Tối đa 6 bé một nhóm, sáng thứ Bảy 9:00.',
          price: '590.000₫',
          unit: 'cho 4 tuần',
          cta: 'Hỏi giữ chỗ',
          href: '/story-club',
        },
        {
          id: 'baseline',
          label: 'Trực tuyến · một buổi',
          title: 'Đánh giá Nói trực tiếp',
          problem: 'Bố mẹ đóng tiền khóa học mà chưa biết con thực sự nói tiếng Anh ở mức nào, và cần ưu tiên cải thiện điều gì trước.',
          inside: 'Một buổi nói trực tiếp 15–20 phút với thầy Jay, sau đó là kế hoạch bằng văn bản: điểm bốn tiêu chí, điểm tổng và điều cần luyện tiếp theo.',
          forWho: 'Học sinh 9–18 tuổi có mục tiêu ở trường hoặc kỳ thi, và phụ huynh muốn biết rõ trình độ trước khi đăng ký khóa học.',
          price: '690.000₫',
          unit: 'một buổi',
          cta: 'Đặt lịch đánh giá',
          href: '/ai-speaking/baseline',
        },
        {
          id: 'one-to-one',
          label: 'Trực tuyến · học riêng',
          title: 'Học 1 kèm 1 với đội ngũ của thầy Jay',
          problem: 'Con nhút nhát trong lớp đông, hoặc cần cải thiện đúng một kỹ năng, mà lớp nhóm lại đi theo tốc độ của người khác.',
          inside: 'Buổi học riêng 60 phút qua Google Meet, xây dựng theo mục tiêu của chính con.',
          forWho: 'Mọi độ tuổi. Phù hợp nhất sau buổi đánh giá, hoặc với gia đình cần lịch học riêng.',
          price: '800.000₫',
          unit: 'mỗi buổi 60 phút · 8 buổi 5.600.000₫',
          cta: 'Đặt lịch học 1 kèm 1',
          href: '/ai-speaking/lessons',
        },
        {
          id: 'printable-pack',
          label: 'Tài liệu số',
          title: 'Bộ truyện in Level 1',
          problem: 'Con thích đọc truyện miễn phí trên màn hình, nhưng bố mẹ muốn có truyện in để cùng đọc với con, kèm hoạt động giúp con nói về câu chuyện.',
          inside: 'Bản PDF sẵn sàng để in của 3 cuốn truyện gốc Jurassic English Level 1 (Mina and the Midnight Drum, The Lantern With Two Handles, Lina and the Orchard Map) kèm sách hoạt động.',
          forWho: 'Gia đình có bé 4–8 tuổi. Bản quyền cho một gia đình: in bao nhiêu bản cũng được để dùng trong nhà.',
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
          label: 'Tài liệu số · một giáo viên',
          title: 'Bộ tài liệu Giáo viên Level 1',
          problem: 'Thầy cô dạy kèm các bé và mất cả buổi tối để tự soạn bài từ đầu.',
          inside: 'Bộ tài liệu giáo viên Level 1 Foundation: 40 giáo án soạn sẵn từng phút có lời thoại giáo viên và thang đánh giá đơn giản, Sổ tay triển khai cho giáo viên, và 3 cuốn truyện gốc.',
          forWho: 'Một giáo viên đứng tên, dùng cho lớp của chính mình (bé 4–8 tuổi). Không dùng cho cả trung tâm; trung tâm cần Giấy phép Trung tâm. Giáo án sử dụng 10 cuốn sách tranh phổ biến, giáo viên tự chuẩn bị.',
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
          label: 'Giá sáng lập',
          title: 'Giấy phép Trung tâm Level 1',
          problem: 'Một giáo viên nghỉ việc là lớp học mất cả một học kỳ, vì giáo trình nằm trong đầu giáo viên đó.',
          inside: 'Trọn một năm học cho bé 4–8 tuổi: 40 giáo án soạn sẵn có lời thoại giáo viên, Sổ tay triển khai, Tài liệu đào tạo giáo viên và slide, bài mẫu, và 3 cuốn truyện gốc. Giáo viên mới có thể dạy ngay từ tuần sau.',
          forWho: 'Chủ trung tâm và trưởng học thuật của trung tâm tiếng Anh thiếu nhi, trường mầm non. Một cơ sở, một năm học, toàn bộ giáo viên. Giá sáng lập dành cho các trung tâm đầu tiên.',
          price: '4.900.000₫',
          unit: 'mỗi cơ sở, mỗi năm học',
          cta: 'Xem một bài dạy trong 10 phút',
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

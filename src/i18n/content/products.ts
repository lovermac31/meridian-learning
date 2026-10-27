/**
 * /products — every Jurassic English product with its price and how to buy it (master directive P-1, Jay 27 Oct 2026:
 * "start building things that I can sell").
 *
 * Follows the JE Page Infrastructure Standard: one hub (reached from the footer and Kids Academy, never the header or
 * home page), audience sections with anchors (#families, #teachers, #centres), cards with one CTA each, EN/VI twins,
 * and utm_source=products on every outbound link (query before any #anchor).
 *
 * DATA-DRIVEN: PRODUCTS below is the one list of cards. A new product is one entry: whether it is live, its section,
 * price, link, whether it is a digital download, its image, and its EN + VI text. Only live entries are shown; cards
 * appear in list order within their section.
 * `image` names a square (1:1) WebP in public/images/products (ChatGPT illustrations from the image-studio session,
 * 27 Oct 2026, no people or logos); every product has its own, hidden ones included, so going live is one line.
 *
 * Prices approved by Jay on 27 Oct 2026, including the Level 1 Printable Storybook Pack (149.000₫) and the Level 1
 * Teacher Pack (690.000₫); the 11 factory packs' prices were approved the same day (relayed by the master session),
 * with the Curriculum Overview credited against a Centre Licence. Card copy (problem → what's inside → who it's for) is the Kids Academy session's P-3 copy
 * (Drive doc "08 /products page copy" v2, 27 Oct); the later teacher and centre packs follow the Selling Assets index, with two lines aligned to the live pages: the Baseline report as the
 * Baseline page describes it (no fee-credit promise), and 1-to-1 lessons "with Mr. Jay's team" as the checkout says.
 * The IELTS Speaking Ladder, Teacher Training Course and Curriculum Overview cards follow their cleared Drive 00 READ MEs
 * (27 Oct): the Ladder is 18 self-study lessons plus a separate 1-lesson One-to-One Starter, not a one-to-one course.
 * The Vietnamese copy is machine-drafted and needs a native read. Only Jurassic English's own storybooks are named;
 * the Teacher Pack says the lessons use 10 widely available picture books.
 */
import type { Locale } from '../locales';
import { SAMPLE_PAGE_COUNTS } from './samplePages';

export const PRODUCTS_PATH = '/products';
export const PRODUCTS_VI_PATH = '/vi/products';
export const PRODUCTS_UTM = 'utm_source=products';
export const PRODUCTS_ZALO = `https://zalo.me/84396085076?${PRODUCTS_UTM}`;
export const PRODUCT_IMAGE_DIR = '/images/products';
// Public sample of each product (Jay, 27 Oct 2026: "Everybody has to see the samples" before a price or a booking):
// three card thumbnails <stem>-p1.webp … -p3.webp and, in the view-only sample viewer, the watermarked page set
// pages/<stem>-pgNN.webp (samplePages.ts). No sample PDF is published (Jay, 27 Oct 2026: no download, no print).
export const PRODUCT_SAMPLE_DIR = '/samples';

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
};

// Card ids that were renamed but may still be linked: each stays an anchor on its card (master, 27 Oct 2026:
// the Level 1 Teacher Pack is #teacher-pack-l1 like Levels 2–5; #teacher-pack keeps working).
export const PRODUCT_FORMER_IDS: Record<string, string[]> = { 'teacher-pack-l1': ['teacher-pack'] };

export type Product = {
  id: string;
  // Shown on the page only when true. A factory-built pack stays false until its Drive 00 READ ME says "Cleared"
  // (copyright and buyer-facing checks done) and Jay has approved its price.
  live: boolean;
  section: ProductSectionId;
  price: string;
  // Internal path (localized and tagged by the page) or 'zalo'.
  href: string;
  // Digital download: the payment and delivery line is shown under the CTA.
  delivery?: boolean;
  // File name (no extension) of the card's square WebP in public/images/products.
  image?: string;
  // International buyers can pay the US$ price (ceil(VND ÷ 25,897), approved by Jay 27 Oct 2026) by PayPal, with
  // Google Drive delivery within 24 hours (S1). VND and VietQR stay first for Vietnam.
  paypal?: boolean;
  // File stem of the product's public sample in public/samples. Set it only once all four files are in the repo
  // (a test checks both ways), so the "See a sample" block never shows a broken link.
  sample?: string;
  // An extra link under the card text, e.g. the Writing Baseline's sample reports (internal path, localized and tagged).
  link?: { href: string; en: string; vi: string };
  // Slug of the product's film in productVideos.ts (public/videos/<slug>/), shown above the sample on its page.
  video?: string;
  // A one-line pointer to this card from another section's list ({link} = the card title, {price} = its price).
  alsoIn?: { section: ProductSectionId; en: string; vi: string };
  en: CardText;
  vi: CardText;
};

export const PRODUCTS: Product[] = [
  {
    id: 'story-club',
    video: 'story-club',
    live: true,
    section: 'families',
    price: '590.000₫',
    href: '/story-club',
    image: 'story-club',
    sample: 'story-club',
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
    video: 'baseline',
    live: true,
    section: 'families',
    price: '690.000₫',
    href: '/ai-speaking/baseline',
    image: 'baseline',
    sample: 'baseline',
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
    video: 'one-to-one',
    live: true,
    section: 'families',
    price: '800.000₫',
    href: '/ai-speaking/lessons',
    image: 'one-to-one',
    sample: 'one-to-one',
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
    video: 'printable-pack',
    live: true,
    section: 'families',
    price: '149.000₫',
    href: 'zalo',
    image: 'printable-pack-l1',
    sample: 'printable-pack-l1',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download',
      title: 'Level 1 Printable Storybook Pack',
      problem: 'Your young child loves the free stories on screen, but you want something to read together away from the screen, with activities that turn reading into talking.',
      inside: 'Print-ready PDFs of the 3 original Jurassic English Level 1 storybooks (Mina and the Midnight Drum, The Lantern With Two Handles, Lina and the Orchard Map) with their activity books, plus certificates.',
      forWho: 'Families with children aged 4–8. One-family licence: print as many copies as you like for your own home.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số',
      title: 'Bộ truyện in Level 1',
      problem: 'Con thích đọc truyện miễn phí trên màn hình, nhưng bố mẹ muốn có truyện in để cùng đọc với con, kèm hoạt động giúp con nói về câu chuyện.',
      inside: 'Bản PDF sẵn sàng để in của 3 cuốn truyện gốc Jurassic English Level 1 (Mina and the Midnight Drum, The Lantern With Two Handles, Lina and the Orchard Map) kèm sách hoạt động và giấy chứng nhận.',
      forWho: 'Gia đình có bé 4–8 tuổi. Bản quyền cho một gia đình: in bao nhiêu bản cũng được để dùng trong nhà.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'parent-pack-l1',
    video: 'parent-pack-l1',
    live: true,
    section: 'families',
    price: '249.000₫',
    href: 'zalo',
    image: 'parent-pack-l1',
    sample: 'parent-pack-l1',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · families',
      title: 'Level 1 Parent Home Reading Pack',
      problem: 'You want to read English with your child at home but are not sure what to do or say, especially if your own English feels rusty.',
      inside: 'A parent guide in English and Vietnamese with a ten-minute daily routine, the three original Level 1 storybooks, 12 activity pages, and a progress chart with a certificate: 46 printable A4 pages for six weeks of reading together.',
      forWho: 'Parents of children aged 4–8 (CEFR Pre-A1 → A1). No teaching experience needed. One-family licence, printable at home.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · gia đình',
      title: 'Bộ đọc sách tại nhà cho phụ huynh Level 1',
      problem: 'Bạn muốn đọc tiếng Anh cùng con ở nhà nhưng chưa biết nên làm gì, nói gì, nhất là khi tiếng Anh của bạn đã lâu không dùng.',
      inside: 'Hướng dẫn cho phụ huynh bằng tiếng Anh và tiếng Việt với nếp đọc mười phút mỗi ngày, ba truyện tranh gốc Level 1, 12 trang hoạt động và bảng theo dõi tiến bộ kèm giấy khen: 46 trang A4 in được cho sáu tuần đọc cùng con.',
      forWho: 'Phụ huynh có con 4–8 tuổi (CEFR Pre-A1 → A1). Không cần kinh nghiệm dạy học. Bản quyền cho một gia đình, in tại nhà.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'parent-pack-l2',
    video: 'parent-pack-l2',
    live: true,
    section: 'families',
    price: '249.000₫',
    href: 'zalo',
    image: 'parent-pack-l2',
    sample: 'parent-pack-l2',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · families',
      title: 'Level 2 Parent Home Reading Pack',
      problem: 'Your 8–10 year old reads English alone now, but rarely explains what a story means or backs up an idea with evidence.',
      inside: 'A parent guide in English and Vietnamese with a fifteen-minute daily routine, two original Level 2 storybooks with their activity pages, and a progress chart: 34 printable A4 pages for four weeks of reading together.',
      forWho: 'Parents of children aged 8–10 (CEFR A1 → A2). No teaching experience needed. One-family licence, printable at home.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · gia đình',
      title: 'Bộ đọc sách tại nhà cho phụ huynh Level 2',
      problem: 'Con 8–10 tuổi đã tự đọc tiếng Anh, nhưng hiếm khi giải thích ý nghĩa câu chuyện hay dùng chi tiết trong truyện để chứng minh ý kiến.',
      inside: 'Hướng dẫn cho phụ huynh bằng tiếng Anh và tiếng Việt với nếp đọc mười lăm phút mỗi ngày, hai truyện tranh gốc Level 2 kèm trang hoạt động, và bảng theo dõi tiến bộ: 34 trang A4 in được cho bốn tuần đọc cùng con.',
      forWho: 'Phụ huynh có con 8–10 tuổi (CEFR A1 → A2). Không cần kinh nghiệm dạy học. Bản quyền cho một gia đình, in tại nhà.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    // 35-today plan (Jay, 27 Oct 2026): sample approved by the master; copy from the factory’s product definition (pdf-studio/products/parent-pack-l3.json).
    id: 'parent-pack-l3',
    video: 'parent-pack-l3',
    live: true,
    section: 'families',
    price: '249.000₫',
    href: 'zalo',
    image: 'parent-pack-l3',
    sample: 'parent-pack-l3',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · families',
      title: 'Level 3 Parent Home Reading Pack',
      problem: 'You want to keep reading English with your older child at home, but the books and the talk need to grow with them.',
      inside: 'Fifteen minutes a day for six weeks: a parent guide in English and Vietnamese, three original storybooks (two illustrated, and one text edition whose pictures come later), 12 activity pages and a progress chart with a certificate: 41 printable A4 pages.',
      forWho: 'Parents of children aged 10–12 (CEFR A2 → B1). No teaching experience needed. One family, for its own children; printable at home.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · gia đình',
      title: 'Bộ đọc sách tại nhà cho phụ huynh Level 3',
      problem: 'Bạn muốn tiếp tục đọc tiếng Anh cùng con lớn hơn ở nhà, nhưng sách và cách trò chuyện cần lớn lên cùng con.',
      inside: 'Mười lăm phút mỗi ngày trong sáu tuần: hướng dẫn cho phụ huynh bằng tiếng Anh và tiếng Việt, ba truyện gốc (hai truyện có tranh, một bản chữ sẽ có tranh sau), 12 trang hoạt động và bảng theo dõi tiến bộ kèm giấy khen: 41 trang A4 in được.',
      forWho: 'Phụ huynh có con 10–12 tuổi (CEFR A2 → B1). Không cần kinh nghiệm dạy học. Một gia đình, cho con của mình; in tại nhà.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    // 35-today plan (Jay, 27 Oct 2026): sample approved by the master; copy from the factory’s product definition (pdf-studio/products/holiday-challenge.json).
    id: 'holiday-reading-challenge',
    video: 'holiday-reading-challenge',
    live: true,
    section: 'families',
    price: '149.000₫',
    href: 'zalo',
    image: 'holiday-reading-challenge',
    sample: 'holiday-challenge',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · families',
      title: 'Holiday Reading Challenge, Levels 1–2',
      problem: 'Over the holidays your child stops reading English, and the first weeks back at school are hard.',
      inside: 'Four weeks, four original stories (free to read in the online reader), ten minutes a day: a day-by-day home plan in English and Vietnamese, 12 story activities, a reading log and a certificate: 29 printable A4 pages.',
      forWho: 'Families with children aged 4–10 at Levels 1–2. One family, for its own children; printable at home.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · gia đình',
      title: 'Thử thách đọc sách kỳ nghỉ, Level 1–2',
      problem: 'Trong kỳ nghỉ con ngừng đọc tiếng Anh, và những tuần đầu quay lại trường thật vất vả.',
      inside: 'Bốn tuần, bốn truyện gốc (đọc miễn phí trên trình đọc trực tuyến), mười phút mỗi ngày: kế hoạch từng ngày tại nhà bằng tiếng Anh và tiếng Việt, 12 hoạt động theo truyện, sổ ghi chép đọc sách và giấy khen: 29 trang A4 in được.',
      forWho: 'Gia đình có con 4–10 tuổi ở Level 1–2. Một gia đình, cho con của mình; in tại nhà.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'teacher-pack-l1',
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l1',
    sample: 'teacher-pack-l1',
    video: 'teacher-pack-l1',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · one teacher',
      title: 'Level 1 Teacher Pack',
      problem: 'You teach young children privately and spend your evenings planning lessons from scratch.',
      inside: 'The Level 1 Foundation teacher materials: the syllabus, 40 lessons scripted minute by minute with the teacher’s lines and a simple rubric, and the Teacher Implementation Manual.',
      forWho: 'One named tutor or teacher, for their own classes (ages 4–8). Not for use across a centre; centres need the Centre Licence. The lessons use 10 widely available picture books the teacher provides.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · một giáo viên',
      title: 'Bộ tài liệu Giáo viên Level 1',
      problem: 'Thầy cô dạy kèm các bé và mất cả buổi tối để tự soạn bài từ đầu.',
      inside: 'Bộ tài liệu giáo viên Level 1 Foundation: chương trình học, 40 giáo án soạn sẵn từng phút có lời thoại giáo viên và thang đánh giá đơn giản, và Sổ tay triển khai cho giáo viên.',
      forWho: 'Một giáo viên đứng tên, dùng cho lớp của chính mình (bé 4–8 tuổi). Không dùng cho cả trung tâm; trung tâm cần Giấy phép Trung tâm. Giáo án sử dụng 10 cuốn sách tranh phổ biến, giáo viên tự chuẩn bị.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'teacher-pack-l2',
    video: 'teacher-pack-l2',
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l2',
    sample: 'teacher-pack-l2',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · one teacher',
      title: 'Level 2 Teacher Pack',
      problem: 'Your students have moved past picture books, and planning a year of lessons that make them explain why takes every evening.',
      inside: 'The Level 2 Development teacher materials: the syllabus, the Teacher Implementation Manual and 40 lesson plans.',
      forWho: 'One named tutor or teacher, for their own classes (ages 8–10, CEFR A1 → A2). Not for use across a centre. The lessons are built on published books, which you provide.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · một giáo viên',
      title: 'Bộ tài liệu Giáo viên Level 2',
      problem: 'Học sinh đã vượt qua truyện tranh, và việc soạn cả năm bài học giúp các em giải thích “vì sao” chiếm hết buổi tối của thầy cô.',
      inside: 'Tài liệu giáo viên Level 2 Development: chương trình học, Sổ tay triển khai cho giáo viên và 40 giáo án.',
      forWho: 'Một giáo viên đứng tên, dùng cho lớp của chính mình (8–10 tuổi, CEFR A1 → A2). Không dùng cho cả trung tâm. Giáo án được xây dựng trên các cuốn sách đã xuất bản, giáo viên tự chuẩn bị.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'teacher-pack-l3',
    video: 'teacher-pack-l3',
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l3',
    sample: 'teacher-pack-l3',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · one teacher',
      title: 'Level 3 Teacher Pack',
      problem: 'Your students can read, but explaining and weighing ideas in English is where they stall, and building those lessons from scratch takes weeks.',
      inside: 'The Level 3 Expansion teacher materials: the syllabus, the Teacher Implementation Manual and 40 lesson plans.',
      forWho: 'One named tutor or teacher, for their own classes (ages 10–12, CEFR A2 → B1). Not for use across a centre. The lessons are built on published books, which you provide.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · một giáo viên',
      title: 'Bộ tài liệu Giáo viên Level 3',
      problem: 'Học sinh đọc được, nhưng lại chững lại khi phải giải thích và cân nhắc ý kiến bằng tiếng Anh, còn tự soạn bài từ đầu mất hàng tuần.',
      inside: 'Tài liệu giáo viên Level 3 Expansion: chương trình học, Sổ tay triển khai cho giáo viên và 40 giáo án.',
      forWho: 'Một giáo viên đứng tên, dùng cho lớp của chính mình (10–12 tuổi, CEFR A2 → B1). Không dùng cho cả trung tâm. Giáo án được xây dựng trên các cuốn sách đã xuất bản, giáo viên tự chuẩn bị.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'teacher-pack-l4',
    video: 'teacher-pack-l4',
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l4',
    sample: 'teacher-pack-l4',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · one teacher',
      title: 'Level 4 Teacher Pack',
      problem: 'Your older students need essay-level reasoning and discussion, and you are writing every lesson yourself.',
      inside: 'The Level 4 Mastery teacher materials: the syllabus, the Teacher Implementation Manual and 40 lesson plans.',
      forWho: 'One named tutor or teacher, for their own classes (ages 12–14, CEFR B1 → B2). Not for use across a centre. The lessons are built on published books, which you provide.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · một giáo viên',
      title: 'Bộ tài liệu Giáo viên Level 4',
      problem: 'Học sinh lớn cần lập luận ở mức bài luận và thảo luận, mà thầy cô đang phải tự viết từng bài.',
      inside: 'Tài liệu giáo viên Level 4 Mastery: chương trình học, Sổ tay triển khai cho giáo viên và 40 giáo án.',
      forWho: 'Một giáo viên đứng tên, dùng cho lớp của chính mình (12–14 tuổi, CEFR B1 → B2). Không dùng cho cả trung tâm. Giáo án được xây dựng trên các cuốn sách đã xuất bản, giáo viên tự chuẩn bị.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'teacher-pack-l5',
    video: 'teacher-pack-l5',
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l5',
    sample: 'teacher-pack-l5',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · one teacher',
      title: 'Level 5 Teacher Pack',
      problem: 'Your advanced students need to argue, answer counter-arguments and write at exam level, and lesson plans for that are hard to find.',
      inside: 'The Level 5 Advanced teacher materials: the syllabus, the Teacher Implementation Manual and 40 lesson plans.',
      forWho: 'One named tutor or teacher, for their own classes (ages 14+, CEFR B2 → C1). Not for use across a centre. The lessons are built on published books, which you provide.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · một giáo viên',
      title: 'Bộ tài liệu Giáo viên Level 5',
      problem: 'Học sinh nâng cao cần tranh luận, phản biện và viết ở mức bài thi, nhưng giáo án cho việc này rất khó tìm.',
      inside: 'Tài liệu giáo viên Level 5 Advanced: chương trình học, Sổ tay triển khai cho giáo viên và 40 giáo án.',
      forWho: 'Một giáo viên đứng tên, dùng cho lớp của chính mình (từ 14 tuổi, CEFR B2 → C1). Không dùng cho cả trung tâm. Giáo án được xây dựng trên các cuốn sách đã xuất bản, giáo viên tự chuẩn bị.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'teacher-bundle',
    video: 'teacher-bundle',
    live: true,
    section: 'teachers',
    price: '2.900.000₫',
    href: 'zalo',
    image: 'teacher-bundle',
    sample: 'teacher-bundle',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · one teacher · Levels 1–5',
      title: 'Complete Teacher Bundle, Levels 1–5',
      problem: 'You teach several age groups and want one consistent programme from age 4 to 14+, not five different sets of notes.',
      inside: 'All five Teacher Packs: the syllabus, Teacher Implementation Manual and 40 lesson plans for each level, 200 lesson plans in all.',
      forWho: 'One named tutor or teacher who teaches across levels. Bought separately, the five packs cost 3.450.000₫. The lessons are built on published books, which you provide.',
      unit: 'one-time · all 5 levels',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · một giáo viên · Level 1–5',
      title: 'Trọn bộ tài liệu Giáo viên Level 1–5',
      problem: 'Thầy cô dạy nhiều lứa tuổi và muốn một chương trình thống nhất từ 4 đến trên 14 tuổi, thay vì năm bộ ghi chú khác nhau.',
      inside: 'Cả năm Bộ tài liệu Giáo viên: chương trình học, Sổ tay triển khai và 40 giáo án cho mỗi cấp độ, tổng cộng 200 giáo án.',
      forWho: 'Một giáo viên đứng tên dạy nhiều cấp độ. Mua lẻ, năm bộ có giá 3.450.000₫. Giáo án được xây dựng trên các cuốn sách đã xuất bản, giáo viên tự chuẩn bị.',
      unit: 'mua một lần · cả 5 cấp độ',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'student-workbook-l1',
    video: 'student-workbook-l1',
    live: true,
    section: 'teachers',
    price: '190.000₫',
    href: 'zalo',
    image: 'student-workbook-l1',
    sample: 'student-workbook-l1',
    delivery: true,
    paypal: true,
    alsoIn: {
      section: 'families',
      en: 'Doing Level 1 at home? The {link} has a page for every lesson: {price} a learner, using 10 picture books you provide.',
      vi: 'Học Level 1 ở nhà? {link} có một trang cho mỗi bài học: {price} mỗi học viên, dùng 10 cuốn sách tranh bạn tự chuẩn bị.',
    },
    en: {
      label: 'Digital download · per learner · class sets',
      title: 'Level 1 Student Workbook',
      problem: 'Your Level 1 learners need their own page for every lesson, and copying worksheets together each week takes hours.',
      inside: '63 printable A4 pages: 40 lesson pages (Dig, Weigh, Because, Show) in the order of the Level 1 Teacher Pack, 10 story openers, a Thinking Passport, a word wall and a certificate. You receive the PDF and editable Google Docs.',
      forWho: 'Children aged 4–8 doing Level 1 with a teacher, tutor or parent. The lessons use 10 widely available picture books, which you provide. One learner per licence; a class set for 10 learners is 1.490.000₫ on Zalo.',
      unit: 'per learner · class set of 10: 1.490.000₫',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · mỗi học viên · bộ cho lớp',
      title: 'Sách bài tập học viên Level 1',
      problem: 'Học viên Level 1 cần trang riêng cho mỗi bài học, còn tự photo phiếu bài tập mỗi tuần thì tốn hàng giờ.',
      inside: '63 trang A4 in được: 40 trang theo từng bài (Dig, Weigh, Because, Show) đúng thứ tự Bộ tài liệu Giáo viên Level 1, 10 trang mở đầu truyện, Hộ chiếu tư duy, bức tường từ vựng và giấy khen. Bạn nhận file PDF và Google Docs chỉnh sửa được.',
      forWho: 'Trẻ 4–8 tuổi học Level 1 cùng giáo viên, gia sư hoặc phụ huynh. Bài học dùng 10 cuốn sách tranh phổ biến, bạn tự chuẩn bị. Mỗi bản quyền cho một học viên; bộ cho lớp 10 học viên giá 1.490.000₫ qua Zalo.',
      unit: 'mỗi học viên · bộ 10 học viên: 1.490.000₫',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'student-workbook-l2',
    video: 'student-workbook-l2',
    live: true,
    section: 'teachers',
    price: '190.000₫',
    href: 'zalo',
    image: 'student-workbook-l2',
    sample: 'student-workbook-l2',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · per learner · class sets',
      title: 'Level 2 Student Workbook',
      problem: 'Your Level 2 learners need their own organiser for every lesson, and building those pages each week takes hours.',
      inside: '62 printable A4 pages: 40 lesson pages with Excavation, Strata, Justification and Impact organisers in the order of the Level 2 Teacher Pack, 10 text openers (predictions, words to track, a reading plan), a Thinking Passport, a Word Fossil Log and a certificate.',
      forWho: 'Learners aged 8–10 (CEFR A1 → A2) following Level 2 Development with a teacher or tutor. The lessons are built on published books, which you provide. One learner per licence; a class set for 10 learners is 1.490.000₫ on Zalo.',
      unit: 'per learner · class set of 10: 1.490.000₫',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · mỗi học viên · bộ cho lớp',
      title: 'Sách bài tập học viên Level 2',
      problem: 'Học viên Level 2 cần trang tổ chức ý riêng cho mỗi bài học, còn tự soạn những trang đó mỗi tuần thì tốn hàng giờ.',
      inside: '62 trang A4 in được: 40 trang theo từng bài với khung Excavation, Strata, Justification và Impact đúng thứ tự Bộ tài liệu Giáo viên Level 2, 10 trang mở đầu văn bản (dự đoán, từ cần theo dõi, kế hoạch đọc), Hộ chiếu tư duy, Sổ Word Fossil và giấy khen.',
      forWho: 'Học viên 8–10 tuổi (CEFR A1 → A2) học Level 2 Development cùng giáo viên hoặc gia sư. Bài học dựa trên sách đã xuất bản, bạn tự chuẩn bị sách. Mỗi bản quyền cho một học viên; bộ cho lớp 10 học viên giá 1.490.000₫ qua Zalo.',
      unit: 'mỗi học viên · bộ 10 học viên: 1.490.000₫',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'student-workbook-l3',
    video: 'student-workbook-l3',
    live: true,
    section: 'teachers',
    price: '190.000₫',
    href: 'zalo',
    image: 'student-workbook-l3',
    sample: 'student-workbook-l3',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · per learner · class sets',
      title: 'Level 3 Student Workbook',
      problem: 'Your Level 3 learners need their own organiser for every lesson, and building those pages each week takes hours.',
      inside: '62 printable A4 pages: 40 lesson pages with Excavation, Strata, Justification and Impact organisers in the order of the Level 3 Teacher Pack, 10 text openers (predictions, words to track, a reading plan), a Thinking Passport, a Word Fossil Log and a certificate.',
      forWho: 'Learners aged 10–12 (CEFR A2 → B1) following Level 3 Expansion with a teacher or tutor. The lessons are built on published books, which you provide. One learner per licence; a class set for 10 learners is 1.490.000₫ on Zalo.',
      unit: 'per learner · class set of 10: 1.490.000₫',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · mỗi học viên · bộ cho lớp',
      title: 'Sách bài tập học viên Level 3',
      problem: 'Học viên Level 3 cần trang tổ chức ý riêng cho mỗi bài học, còn tự soạn những trang đó mỗi tuần thì tốn hàng giờ.',
      inside: '62 trang A4 in được: 40 trang theo từng bài với khung Excavation, Strata, Justification và Impact đúng thứ tự Bộ tài liệu Giáo viên Level 3, 10 trang mở đầu văn bản (dự đoán, từ cần theo dõi, kế hoạch đọc), Hộ chiếu tư duy, Sổ Word Fossil và giấy khen.',
      forWho: 'Học viên 10–12 tuổi (CEFR A2 → B1) học Level 3 Expansion cùng giáo viên hoặc gia sư. Bài học dựa trên sách đã xuất bản, bạn tự chuẩn bị sách. Mỗi bản quyền cho một học viên; bộ cho lớp 10 học viên giá 1.490.000₫ qua Zalo.',
      unit: 'mỗi học viên · bộ 10 học viên: 1.490.000₫',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'student-workbook-l4',
    video: 'student-workbook-l4',
    live: true,
    section: 'teachers',
    price: '190.000₫',
    href: 'zalo',
    image: 'student-workbook-l4',
    sample: 'student-workbook-l4',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · per learner · class sets',
      title: 'Level 4 Student Workbook',
      problem: 'Your Level 4 learners need their own organiser for every lesson, and building those pages each week takes hours.',
      inside: '62 printable A4 pages: 40 lesson pages with Excavation, Strata, Justification and Impact organisers in the order of the Level 4 Teacher Pack, 10 text openers (predictions, words to track, a reading plan), a Thinking Passport, a Word Fossil Log and a certificate.',
      forWho: 'Learners aged 12–14 (CEFR B1 → B2) following Level 4 Mastery with a teacher or tutor. The lessons are built on published books, which you provide. One learner per licence; a class set for 10 learners is 1.490.000₫ on Zalo.',
      unit: 'per learner · class set of 10: 1.490.000₫',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · mỗi học viên · bộ cho lớp',
      title: 'Sách bài tập học viên Level 4',
      problem: 'Học viên Level 4 cần trang tổ chức ý riêng cho mỗi bài học, còn tự soạn những trang đó mỗi tuần thì tốn hàng giờ.',
      inside: '62 trang A4 in được: 40 trang theo từng bài với khung Excavation, Strata, Justification và Impact đúng thứ tự Bộ tài liệu Giáo viên Level 4, 10 trang mở đầu văn bản (dự đoán, từ cần theo dõi, kế hoạch đọc), Hộ chiếu tư duy, Sổ Word Fossil và giấy khen.',
      forWho: 'Học viên 12–14 tuổi (CEFR B1 → B2) học Level 4 Mastery cùng giáo viên hoặc gia sư. Bài học dựa trên sách đã xuất bản, bạn tự chuẩn bị sách. Mỗi bản quyền cho một học viên; bộ cho lớp 10 học viên giá 1.490.000₫ qua Zalo.',
      unit: 'mỗi học viên · bộ 10 học viên: 1.490.000₫',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'student-workbook-l5',
    video: 'student-workbook-l5',
    live: true,
    section: 'teachers',
    price: '190.000₫',
    href: 'zalo',
    image: 'student-workbook-l5',
    sample: 'student-workbook-l5',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · per learner · class sets',
      title: 'Level 5 Student Workbook',
      problem: 'Your Level 5 learners need their own organiser for every lesson, and building those pages each week takes hours.',
      inside: '62 printable A4 pages: 40 lesson pages with Excavation, Strata, Justification and Impact organisers in the order of the Level 5 Teacher Pack, 10 text openers (predictions, words to track, a reading plan), a Thinking Passport, a Word Fossil Log and a certificate.',
      forWho: 'Learners aged 14+ (CEFR B2 → C1) following Level 5 Advanced with a teacher or tutor. The lessons are built on published books, which you provide. One learner per licence; a class set for 10 learners is 1.490.000₫ on Zalo.',
      unit: 'per learner · class set of 10: 1.490.000₫',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · mỗi học viên · bộ cho lớp',
      title: 'Sách bài tập học viên Level 5',
      problem: 'Học viên Level 5 cần trang tổ chức ý riêng cho mỗi bài học, còn tự soạn những trang đó mỗi tuần thì tốn hàng giờ.',
      inside: '62 trang A4 in được: 40 trang theo từng bài với khung Excavation, Strata, Justification và Impact đúng thứ tự Bộ tài liệu Giáo viên Level 5, 10 trang mở đầu văn bản (dự đoán, từ cần theo dõi, kế hoạch đọc), Hộ chiếu tư duy, Sổ Word Fossil và giấy khen.',
      forWho: 'Học viên từ 14 tuổi (CEFR B2 → C1) học Level 5 Advanced cùng giáo viên hoặc gia sư. Bài học dựa trên sách đã xuất bản, bạn tự chuẩn bị sách. Mỗi bản quyền cho một học viên; bộ cho lớp 10 học viên giá 1.490.000₫ qua Zalo.',
      unit: 'mỗi học viên · bộ 10 học viên: 1.490.000₫',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    // 35-today plan (Jay, 27 Oct 2026): sample approved by the master; copy from the factory’s product definition (pdf-studio/products/word-fossil-flashcards-l1.json).
    id: 'word-fossil-flashcards-l1',
    video: 'word-fossil-flashcards-l1',
    live: true,
    section: 'teachers',
    price: '190.000₫',
    href: 'zalo',
    image: 'word-fossil-flashcards-l1',
    sample: 'word-fossil-flashcards-l1',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · teachers and families',
      title: 'Word Fossil Flashcards, Level 1',
      problem: 'New words from the stories are gone by the next lesson because there is nothing to practise them with.',
      inside: '120 printable picture cards for the Level 1 Word Wall (feelings, character words and nature words), each with an original picture, the English word and the Vietnamese word, plus 8 blank cards and 8 games and routines: 26 printable A4 pages.',
      forWho: 'Teachers and parents of Level 1 learners (ages 4–8). One teacher, one classroom or one family.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · giáo viên và gia đình',
      title: 'Thẻ từ vựng Word Fossil, Level 1',
      problem: 'Từ mới trong truyện bị quên ngay buổi sau vì không có gì để luyện lại.',
      inside: '120 thẻ hình in được cho Bức tường từ vựng Level 1 (từ cảm xúc, từ chỉ tính cách và từ về thiên nhiên), mỗi thẻ có hình gốc, từ tiếng Anh và từ tiếng Việt, kèm 8 thẻ trống và 8 trò chơi, hoạt động: 26 trang A4 in được.',
      forWho: 'Giáo viên và phụ huynh của học sinh Level 1 (4–8 tuổi). Một giáo viên, một lớp học hoặc một gia đình.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'thinking-cycle-set',
    video: 'thinking-cycle-set',
    live: true,
    section: 'teachers',
    price: '490.000₫',
    href: 'zalo',
    delivery: true,
    paypal: true,
    image: 'thinking-cycle-set',
    sample: 'thinking-cycle-set',
    en: {
      label: 'Digital download · teachers and tutors',
      title: 'Jurassic Thinking Cycle Manual Set',
      problem: 'Your students give one-word answers and opinions with no reasons, whatever text you use.',
      inside: 'Teacher and student manuals for the four stages, Analyze, Evaluate, Justify and Reflect, plus the CEIW writing framework and a lesson plan template you can use with any text.',
      forWho: 'Teachers and tutors at any level who want a thinking routine to use with their own books and materials.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · giáo viên và gia sư',
      title: 'Bộ Sổ tay Chu trình Tư duy Jurassic',
      problem: 'Học sinh chỉ trả lời một từ và nêu ý kiến không kèm lý do, dù thầy cô dùng văn bản nào.',
      inside: 'Sổ tay giáo viên và học sinh cho bốn bước Analyze, Evaluate, Justify và Reflect, cùng khung viết CEIW và mẫu giáo án dùng được với mọi văn bản.',
      forWho: 'Giáo viên và gia sư ở mọi cấp độ muốn có một thói quen tư duy để dùng với sách và tài liệu của chính mình.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    // 35-today plan (Jay, 27 Oct 2026): sample approved by the master; copy from the factory’s product definition (pdf-studio/products/thinking-cycle-posters.json).
    id: 'thinking-cycle-posters',
    video: 'thinking-cycle-posters',
    live: true,
    section: 'teachers',
    price: '149.000₫',
    href: 'zalo',
    image: 'thinking-cycle-posters',
    sample: 'thinking-cycle-posters',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · teachers and centres',
      title: 'Thinking Cycle Classroom Posters',
      problem: 'Students forget the Thinking Cycle steps between lessons because nothing in the room shows them.',
      inside: 'Eight A3 classroom posters in English and Vietnamese: the Thinking Cycle, Claim, Evidence, Interpretation, Warrant, Word Fossils, the Butterfly Hug and Accountable Talk. A separate true-A3 print file, plus a 14-page guide with the posters at A4.',
      forWho: 'Teachers who use the Thinking Cycle in class, at any level. One teacher, one classroom.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · giáo viên và trung tâm',
      title: 'Bộ poster lớp học Thinking Cycle',
      problem: 'Học sinh quên các bước của Thinking Cycle giữa các buổi học vì trong lớp không có gì nhắc lại.',
      inside: 'Tám poster A3 cho lớp học bằng tiếng Anh và tiếng Việt: Thinking Cycle, Claim, Evidence, Interpretation, Warrant, Word Fossils, Butterfly Hug và Accountable Talk. Kèm một tệp in A3 chuẩn riêng và hướng dẫn 14 trang có các poster khổ A4.',
      forWho: 'Giáo viên dùng Thinking Cycle trong lớp, ở mọi cấp độ. Một giáo viên, một lớp học.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'reasoning-assessment-kit',
    live: true,
    section: 'teachers',
    price: '390.000₫',
    href: 'zalo',
    delivery: true,
    paypal: true,
    image: 'reasoning-assessment-kit',
    sample: 'reasoning-assessment-kit',
    video: 'reasoning-assessment-kit',
    en: {
      label: 'Digital download · teachers and centres',
      title: 'Reasoning Assessment Kit, Levels 1–5',
      problem: 'You can hear that a student reasons better, but you have nothing on paper to show parents or to place new students.',
      inside: 'CEIW reasoning worksheets for Levels 1–5, scoring sheets with feedback codes, a placement diagnostic guide and a parent report template.',
      forWho: 'Teachers and centres who want to place students and report their reasoning to parents in writing.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · giáo viên và trung tâm',
      title: 'Bộ công cụ Đánh giá Lập luận Level 1–5',
      problem: 'Thầy cô nghe được học sinh lập luận tốt hơn, nhưng không có gì trên giấy để cho phụ huynh xem hay để xếp lớp học sinh mới.',
      inside: 'Phiếu bài tập lập luận CEIW cho Level 1–5, phiếu chấm điểm kèm mã nhận xét, hướng dẫn kiểm tra xếp lớp và mẫu báo cáo cho phụ huynh.',
      forWho: 'Giáo viên và trung tâm muốn xếp lớp học sinh và báo cáo năng lực lập luận cho phụ huynh bằng văn bản.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'ielts-speaking-ladder',
    live: true,
    section: 'teachers',
    price: '390.000₫',
    href: 'zalo',
    delivery: true,
    paypal: true,
    image: 'ielts-speaking-ladder',
    sample: 'ielts-speaking-ladder',
    video: 'ielts-speaking-ladder',
    en: {
      label: 'Digital download · learners and tutors',
      title: 'IELTS Speaking Ladder Pack',
      problem: 'You lose marks on the same small habits, like articles, -s and -ed endings and tense, and your Part 2 answer stops after less than a minute.',
      inside: '18 self-study lessons in three levels, from Band 5.0 to 6.5–7.0. Each lesson fixes one habit, with model answers, timed Part 1, 2 and 3 speaking tasks, a self-check and an answer key. Tutors can add the One-to-One Starter: one 90-minute lesson plan with a student handout, 149.000₫ on its own.',
      forWho: 'Learners at IELTS Speaking Band 5.0–6.5, and tutors who teach them one-to-one. Practice material, not an official score.',
      unit: 'self-study pack · with the One-to-One Starter 490.000₫',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · học viên và gia sư',
      title: 'Bộ IELTS Speaking Ladder',
      problem: 'Bạn liên tục mất điểm ở cùng những lỗi nhỏ như mạo từ, đuôi -s và -ed, thì của động từ, và câu trả lời Part 2 dừng lại chưa đến một phút.',
      inside: '18 bài tự học chia ba cấp độ, từ Band 5.0 đến 6.5–7.0. Mỗi bài sửa một thói quen, có câu trả lời mẫu, bài nói Part 1, 2 và 3 có bấm giờ, phần tự kiểm tra và đáp án. Gia sư có thể mua thêm One-to-One Starter: một giáo án 1 kèm 1 dài 90 phút kèm phiếu cho học viên, 149.000₫ nếu mua riêng.',
      forWho: 'Người học đang ở IELTS Speaking Band 5.0–6.5, và gia sư dạy 1 kèm 1. Tài liệu luyện tập, không phải điểm thi chính thức.',
      unit: 'bộ tự học · kèm One-to-One Starter 490.000₫',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    // 35-today plan (Jay, 27 Oct 2026): built (pdf-studio ielts-one-to-one-starter.json); view-only sample (8 pages with real lesson pages) by ielts-generic-lesson, approved by the master.
    id: 'ielts-one-to-one-starter',
    video: 'ielts-one-to-one-starter',
    live: true,
    section: 'teachers',
    price: '149.000₫',
    href: 'zalo',
    image: 'ielts-one-to-one-starter',
    sample: 'ielts-one-to-one-starter',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · tutors',
      title: 'IELTS Speaking One-to-One Starter',
      problem: 'You tutor IELTS Speaking one-to-one and plan every lesson from scratch.',
      inside: 'One complete 90-minute one-to-one lesson, Lesson 6 of the Speaking Ladder, "The Full Ladder: 110 Seconds": tutor notes, keys and scripts, and an answer-free student handout.',
      forWho: 'Tutors who teach IELTS Speaking one-to-one. One tutor, with their own students. 490.000₫ together with the 18-lesson IELTS Speaking Ladder Pack. Practice material, not an official score.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · gia sư',
      title: 'IELTS Speaking One-to-One Starter',
      problem: 'Bạn dạy IELTS Speaking 1 kèm 1 và phải tự soạn từng buổi.',
      inside: 'Một giáo án 1 kèm 1 trọn vẹn 90 phút, Bài 6 của Speaking Ladder, "The Full Ladder: 110 Seconds": ghi chú cho gia sư, đáp án và kịch bản, kèm phiếu cho học viên không có đáp án.',
      forWho: 'Gia sư dạy IELTS Speaking 1 kèm 1. Một gia sư, dùng với học viên của mình. 490.000₫ khi mua kèm bộ 18 bài IELTS Speaking Ladder. Tài liệu luyện tập, không phải điểm chính thức.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    // 35-today plan (Jay, 27 Oct 2026): sample approved by the master; copy from the factory’s product definition (pdf-studio/products/ielts-cue-card-bank.json).
    id: 'ielts-cue-card-bank',
    video: 'ielts-cue-card-bank',
    live: true,
    section: 'teachers',
    price: '290.000₫',
    href: 'zalo',
    image: 'ielts-cue-card-bank',
    sample: 'ielts-cue-card-bank',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · learners and tutors',
      title: 'IELTS Speaking Part 2 Cue Card Bank',
      problem: 'Your Part 2 answers run out early because you have practised too few cue cards.',
      inside: '60 original Part 2 cue cards across six themes, each with a 1-minute plan on the four-rung ladder, a full Band 7-style answer and the same key moment at Band 6 and Band 8 style, plus two Part 3 questions: 69 printable pages.',
      forWho: 'Teens and adults preparing for IELTS Speaking, and tutors who teach them. One learner, or one tutor with their own students. Practice material, not an official score.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · học viên và gia sư',
      title: 'Bộ thẻ đề IELTS Speaking Part 2',
      problem: 'Câu trả lời Part 2 của bạn hết ý sớm vì bạn mới luyện quá ít đề.',
      inside: '60 thẻ đề Part 2 gốc theo sáu chủ đề, mỗi thẻ có dàn ý 1 phút theo bốn bậc thang, một bài trả lời đầy đủ mức Band 7 và cùng đoạn then chốt ở mức Band 6 và Band 8, kèm hai câu hỏi Part 3: 69 trang in được.',
      forWho: 'Thanh thiếu niên và người lớn luyện IELTS Speaking, và gia sư dạy họ. Một học viên, hoặc một gia sư dùng với học viên của mình. Tài liệu luyện tập, không phải điểm chính thức.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    // 35-today plan (Jay, 27 Oct 2026; master's decision): sold now on Zalo as a manual service at the three approved
    // prices (pdf-studio writing-baseline.json). Mr. Jay or his team reads each essay by hand; the Writing app is not
    // open, so the card links only to its sample reports. No PayPal.
    id: 'writing-baseline',
    video: 'writing-baseline',
    live: true,
    section: 'teachers',
    price: '79.000₫',
    href: 'zalo',
    image: 'writing-baseline',
    sample: 'writing-baseline',
    link: { href: '/ai-speaking/writing/demo', en: 'See a sample report', vi: 'Xem báo cáo mẫu' },
    en: {
      label: 'Practice feedback · teens and adults',
      title: 'IELTS Writing Baseline',
      problem: 'You keep writing Task 2 essays without knowing which problem to fix first.',
      inside: 'Send one Task 2 essay. Mr. Jay or his team reads it by hand and sends back, by Zalo or email, one strength to keep and three priorities in the order to fix them. Each priority quotes your own sentence, shows an example of the fix and names the lesson that trains it.',
      forWho: 'Teens and adults preparing for IELTS Writing. Basic 79.000₫ · Intermediate 199.000₫ (your revision and a new essay, read again) · Advanced 449.000₫ (Intermediate plus a written review by Mr. Jay’s team). Practice feedback, not an official IELTS score; no band number is given.',
      unit: 'Basic · one essay',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Phản hồi luyện tập · thanh thiếu niên và người lớn',
      title: 'IELTS Writing Baseline',
      problem: 'Bạn viết bài Task 2 liên tục mà không biết nên sửa điều gì trước.',
      inside: 'Gửi một bài luận Task 2. Thầy Jay hoặc đội ngũ của thầy đọc bằng tay và gửi lại qua Zalo hoặc email một điểm mạnh cần giữ và ba ưu tiên cần sửa theo thứ tự. Mỗi ưu tiên trích câu của chính bạn, có ví dụ cách sửa và bài học luyện kỹ năng đó.',
      forWho: 'Thanh thiếu niên và người lớn luyện IELTS Writing. Cơ bản 79.000₫ · Trung cấp 199.000₫ (bài sửa và một bài mới, được đọc lại) · Nâng cao 449.000₫ (Trung cấp kèm nhận xét bằng văn bản của đội ngũ thầy Jay). Phản hồi luyện tập, không phải điểm IELTS chính thức; không đưa ra điểm band.',
      unit: 'Cơ bản · một bài luận',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'ielts-writing-ladder-task2',
    video: 'ielts-writing-ladder-task2',
    live: true,
    section: 'teachers',
    price: '390.000₫',
    href: 'zalo',
    delivery: true,
    paypal: true,
    image: 'ielts-writing-ladder-task2',
    sample: 'ielts-writing-ladder-task2',
    en: {
      label: 'Digital download · learners and tutors',
      title: 'IELTS Writing Ladder: Task 2',
      problem: 'Your Task 2 essays are stuck at 5.5–6.0. Examiners mark your reasoning, and a memorised template does not show it.',
      inside: 'Seven lessons that teach the reasoning: take a position, give reasons that hold, prove them, answer the other side, and finish a full essay in 40 minutes. Every lesson has timed writing, Band 6, 7 and 8-style model answers and a fix-the-paragraph drill, with Vietnamese support.',
      forWho: 'Writers stuck at IELTS Writing 5.5–6.0, and tutors who teach them. Task 2 only. Practice material, not an official score.',
      unit: 'self-study pack · 7 lessons',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · học viên và gia sư',
      title: 'IELTS Writing Ladder: Task 2',
      problem: 'Bài luận Task 2 của bạn đang dừng ở 5.5–6.0. Giám khảo chấm cách bạn lập luận, và một bài mẫu học thuộc lòng không thể hiện được điều đó.',
      inside: 'Bảy bài học dạy chính cách lập luận: nêu quan điểm, đưa lý do vững chắc, chứng minh, phản biện ý kiến trái chiều và hoàn thành bài luận trong 40 phút. Mỗi bài có phần viết bấm giờ, bài mẫu mức Band 6, 7, 8 và bài tập sửa đoạn văn, kèm hỗ trợ tiếng Việt.',
      forWho: 'Người viết đang dừng ở IELTS Writing 5.5–6.0, và gia sư dạy họ. Chỉ Task 2. Tài liệu luyện tập, không phải điểm chính thức.',
      unit: 'bộ tự học · 7 bài',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'ielts-writing-task1-method',
    video: 'ielts-writing-task1-method',
    live: true,
    section: 'teachers',
    price: '290.000₫',
    href: 'zalo',
    delivery: true,
    paypal: true,
    image: 'ielts-writing-task1-method',
    sample: 'ielts-writing-task1-method',
    en: {
      label: 'Digital download · learners and tutors',
      title: 'IELTS Writing Task 1: the 20-minute method',
      problem: 'You write Task 1 like an essay: no clear overview, and the figures listed one after another instead of compared.',
      inside: 'Four lessons for Academic and General Training. Write the overview first, then choose and compare figures instead of listing them. Describe maps and processes in order, and write letters in the right tone, all on a 20-minute clock. Each lesson includes model answers in Band 6, 7 and 8 style and a fix-the-paragraph drill, with Vietnamese support.',
      forWho: 'IELTS Academic and General Training candidates, and tutors who teach them. Task 1 only. Practice material, not an official score.',
      unit: 'self-study pack · 4 lessons',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · học viên và gia sư',
      title: 'IELTS Writing Task 1: Phương pháp 20 phút',
      problem: 'Bạn viết Task 1 như một bài luận: không có phần tổng quan rõ ràng, và liệt kê số liệu lần lượt thay vì so sánh.',
      inside: 'Bốn bài học cho Academic và General Training. Viết phần tổng quan trước, rồi chọn và so sánh số liệu thay vì liệt kê. Mô tả bản đồ và quy trình theo thứ tự, và viết thư đúng giọng điệu, tất cả trong 20 phút. Mỗi bài có bài mẫu mức Band 6, 7, 8 và bài tập sửa đoạn văn, kèm hỗ trợ tiếng Việt.',
      forWho: 'Thí sinh IELTS Academic và General Training, và gia sư dạy họ. Chỉ Task 1. Tài liệu luyện tập, không phải điểm chính thức.',
      unit: 'bộ tự học · 4 bài',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    // 35-today plan (Jay, 27 Oct 2026): sample approved by the master; copy from the factory’s product definition (pdf-studio/products/ielts-essay-bank-task2.json).
    id: 'ielts-essay-bank-task2',
    video: 'ielts-essay-bank-task2',
    live: true,
    section: 'teachers',
    price: '290.000₫',
    href: 'zalo',
    image: 'ielts-essay-bank-task2',
    sample: 'ielts-essay-bank-task2',
    delivery: true,
    paypal: true,
    en: {
      label: 'Digital download · learners and tutors',
      title: 'IELTS Writing Task 2 Essay Bank',
      problem: 'You know the essay types, but you have not planned and compared enough complete answers.',
      inside: '40 original Task 2 prompts, eight of each kind (opinion, discuss both views, advantages and disadvantages, causes and solutions, two-part questions), each with a Thinking Cycle plan and a complete Band 7-style model essay of at least 250 words: 85 printable pages.',
      forWho: 'Teens and adults preparing for IELTS Writing, and tutors who teach them. One learner, or one tutor with their own students. Practice material, not an official score.',
      unit: 'one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · học viên và gia sư',
      title: 'Ngân hàng bài luận IELTS Writing Task 2',
      problem: 'Bạn biết các dạng đề, nhưng chưa lập dàn ý và so sánh với đủ nhiều bài viết hoàn chỉnh.',
      inside: '40 đề Task 2 gốc, mỗi dạng tám đề (nêu quan điểm, thảo luận hai quan điểm, ưu và nhược điểm, nguyên nhân và giải pháp, câu hỏi hai phần), mỗi đề có dàn ý theo Thinking Cycle và một bài mẫu hoàn chỉnh mức Band 7 dài ít nhất 250 từ: 85 trang in được.',
      forWho: 'Thanh thiếu niên và người lớn luyện IELTS Writing, và gia sư dạy họ. Một học viên, hoặc một gia sư dùng với học viên của mình. Tài liệu luyện tập, không phải điểm chính thức.',
      unit: 'mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'ielts-writing-teacher-pack',
    video: 'ielts-writing-teacher-pack',
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    delivery: true,
    paypal: true,
    image: 'ielts-writing-teacher-pack',
    sample: 'ielts-writing-teacher-pack',
    en: {
      label: 'Digital download · teachers and centres',
      title: 'IELTS Writing Teacher Pack',
      problem: 'You plan every IELTS Writing class from scratch, and your marking does not tell students which lesson fixes their mistake.',
      inside: 'Ten ready-to-teach 60-minute class lessons: six for Task 2, built on the Thinking Cycle, and four for Task 1 reports and letters. Every step comes with projected text, teacher notes and a line on running it with a class. Also inside: a countable marking guide, 24 margin codes that each point to the lesson that fixes them, and 55 model scripts in Band 6, 7 and 8 style.',
      forWho: 'Teachers and centres running IELTS Writing classes. Practice material, not an official score.',
      unit: 'one teacher or one centre · one-time',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · giáo viên và trung tâm',
      title: 'Bộ giáo viên IELTS Writing',
      problem: 'Thầy cô soạn từng buổi IELTS Writing từ đầu, và lời chấm bài không cho học viên biết bài học nào sửa được lỗi của mình.',
      inside: 'Mười bài dạy lớp 60 phút, sẵn sàng sử dụng: sáu bài Task 2 theo Thinking Cycle và bốn bài Task 1 về báo cáo và thư. Mỗi bước có phần trình chiếu, ghi chú cho giáo viên và hướng dẫn tổ chức lớp. Kèm theo: bảng chấm điểm dạng đếm, 24 mã sửa bài gắn với bài học tương ứng, và 55 bài mẫu mức Band 6, 7, 8.',
      forWho: 'Giáo viên và trung tâm dạy lớp IELTS Writing. Tài liệu luyện tập, không phải điểm chính thức.',
      unit: 'một giáo viên hoặc một trung tâm · mua một lần',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'centre-licence',
    video: 'centre-licence',
    live: true,
    section: 'centres',
    price: '4.900.000₫',
    href: 'zalo',
    image: 'centre-licence',
    sample: 'centre-licence',
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
  {
    id: 'teacher-training-course',
    video: 'teacher-training-course',
    live: true,
    section: 'centres',
    price: '1.490.000₫',
    href: 'zalo',
    delivery: true,
    paypal: true,
    image: 'teacher-training-course',
    sample: 'teacher-training-course',
    en: {
      label: 'Digital course · one centre',
      title: 'Teacher Training Course (train-the-trainer)',
      problem: 'Every new teacher learns your method differently, so lessons drift and quality depends on who is teaching.',
      inside: 'The Train-the-Trainer manual (Edition 1.1), a trainer toolkit with a 3-hour rubric calibration session, a lesson observation checklist, a teacher certification checklist and a common-error coaching guide, and a bank of scored examples for every level.',
      forWho: 'Academic leads who train their own teachers in the Jurassic English method. One centre.',
      unit: 'per centre',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Khóa học số · một trung tâm',
      title: 'Khóa đào tạo giáo viên (đào tạo người đào tạo)',
      problem: 'Mỗi giáo viên mới tiếp thu phương pháp một kiểu, nên bài dạy lệch dần và chất lượng phụ thuộc vào người dạy.',
      inside: 'Sổ tay Đào tạo người đào tạo (Phiên bản 1.1), bộ công cụ cho người đào tạo gồm buổi hiệu chuẩn thang đánh giá 3 giờ, danh sách quan sát giờ dạy, danh sách cấp chứng nhận giáo viên và hướng dẫn kèm cặp các lỗi thường gặp, cùng ngân hàng bài mẫu đã chấm cho mọi cấp độ.',
      forWho: 'Trưởng học thuật tự đào tạo giáo viên theo phương pháp Jurassic English. Một trung tâm.',
      unit: 'mỗi trung tâm',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'pilot-class-kit',
    video: 'pilot-class-kit',
    live: true,
    section: 'centres',
    price: '690.000₫',
    href: 'zalo',
    delivery: true,
    paypal: true,
    image: 'pilot-class-kit',
    sample: 'pilot-class-kit',
    en: {
      label: 'Digital kit · one centre · 6–8 weeks',
      title: 'Pilot Class Launch Kit',
      problem: 'You want to try a new programme with one class first, but planning the pilot, the parent meeting and the review takes more time than teaching it.',
      inside: 'A 6–8 week pilot plan and schedule, a teacher guide, a parent orientation script and FAQ, student onboarding, demo lesson outlines for Levels 1–5, worksheets, a parent reporting template and an end-of-pilot review report.',
      forWho: 'Centre owners who want to run one pilot class before rolling out across the centre. One centre.',
      unit: 'per centre',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Bộ tài liệu số · một trung tâm · 6–8 tuần',
      title: 'Bộ tài liệu Mở lớp thí điểm',
      problem: 'Trung tâm muốn thử chương trình mới với một lớp trước, nhưng lên kế hoạch thí điểm, buổi họp phụ huynh và đánh giá lại tốn nhiều thời gian hơn cả việc dạy.',
      inside: 'Kế hoạch và lịch thí điểm 6–8 tuần, hướng dẫn giáo viên, kịch bản và câu hỏi thường gặp cho buổi gặp phụ huynh, hướng dẫn nhập học cho học sinh, dàn ý bài dạy mẫu Level 1–5, phiếu bài tập, mẫu báo cáo phụ huynh và báo cáo đánh giá cuối đợt thí điểm.',
      forWho: 'Chủ trung tâm muốn chạy một lớp thí điểm trước khi triển khai cho cả trung tâm. Một trung tâm.',
      unit: 'mỗi trung tâm',
      cta: 'Đặt mua qua Zalo',
    },
  },
  {
    id: 'curriculum-overview',
    video: 'curriculum-overview',
    live: true,
    section: 'centres',
    price: '290.000₫',
    href: 'zalo',
    delivery: true,
    paypal: true,
    image: 'curriculum-overview',
    sample: 'curriculum-overview',
    en: {
      label: 'Digital · schools and centres',
      title: 'Curriculum Overview for Schools, Levels 1–5',
      problem: 'You need to show your board or parents how a literature-based programme fits together before you commit to it.',
      inside: 'The Four-Lesson Cycle architecture, the curriculum framework, curriculum models for all five levels and the Levels 1–5 syllabus and unit sequence.',
      forWho: 'Principals and heads of English comparing programmes before a licence decision.',
      unit: 'one-time · credited against a Centre Licence',
      cta: 'Order on Zalo',
    },
    vi: {
      label: 'Tài liệu số · trường học và trung tâm',
      title: 'Tổng quan Chương trình cho Trường học, Level 1–5',
      problem: 'Nhà trường cần cho hội đồng hoặc phụ huynh thấy một chương trình dựa trên văn học được xây dựng thế nào trước khi quyết định.',
      inside: 'Kiến trúc Chu trình Bốn Bài học, khung chương trình, mô hình chương trình cho cả năm Level và chương trình học cùng trình tự đơn vị bài học Level 1–5.',
      forWho: 'Hiệu trưởng và trưởng bộ môn tiếng Anh đang so sánh các chương trình trước khi quyết định cấp phép.',
      unit: 'mua một lần · được trừ vào phí Giấy phép Trung tâm',
      cta: 'Đặt mua qua Zalo',
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
  sample: { heading: string; note: string; open: string };
  viewer: { title: string; prev: string; next: string; close: string; counter: string; end: string; viewOnly: string };
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
    sample: { heading: 'See a sample', note: 'See exactly what you get before you pay.', open: 'See the sample pages' },
    viewer: { title: 'Sample pages', prev: 'Previous page', next: 'Next page', close: 'Close', counter: 'Page {n} of {total}', end: 'That’s the sample. Ready to order?', viewOnly: 'Sample pages are for viewing only.' },
    sections: {
      families: { heading: 'For families', intro: 'Live classes with Mr. Jay, and printables for home.' },
      teachers: { heading: 'For teachers', intro: 'Ready-to-use materials for teachers and tutors.' },
      centres: { heading: 'For centres', intro: 'Programmes and materials for schools and centres.' },
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
    sample: { heading: 'Xem mẫu', note: 'Xem đúng những gì bạn nhận được trước khi thanh toán.', open: 'Xem các trang mẫu' },
    viewer: { title: 'Trang mẫu', prev: 'Trang trước', next: 'Trang sau', close: 'Đóng', counter: 'Trang {n}/{total}', end: 'Đó là bản mẫu. Sẵn sàng đặt mua?', viewOnly: 'Trang mẫu chỉ để xem.' },
    sections: {
      families: { heading: 'Dành cho gia đình', intro: 'Lớp học trực tiếp cùng thầy Jay, và tài liệu in để học ở nhà.' },
      teachers: { heading: 'Dành cho giáo viên', intro: 'Tài liệu dùng ngay cho giáo viên và gia sư.' },
      centres: { heading: 'Dành cho trung tâm', intro: 'Chương trình và tài liệu cho trường học và trung tâm.' },
    },
    closing: { heading: 'Chưa chắc sản phẩm nào phù hợp?', body: 'Nhắn thầy Jay qua Zalo, thầy sẽ gợi ý lựa chọn phù hợp. Không thu tiền cho đến khi bạn đồng ý bản tóm tắt đơn hàng bằng văn bản.', cta: 'Hỏi thầy Jay qua Zalo' },
  },
};

export type ProductCard = CardText & Pick<Product, 'id' | 'price' | 'href' | 'delivery' | 'image' | 'sample' | 'paypal' | 'video'> & {
  link?: { href: string; label: string };
};

/** A product's extra link in one language. */
export const cardLink = (product: Product, locale: Locale) => (product.link ? { href: product.link.href, label: product.link[locale] } : undefined);

/** The page in one language: its copy, and the sections in order with their cards from PRODUCTS. */
export function productsPage(locale: Locale) {
  const copy = PAGE[locale];
  return {
    ...copy,
    sections: PRODUCT_SECTIONS.map((id) => ({
      id,
      ...copy.sections[id],
      cards: PRODUCTS.filter((p) => p.live && p.section === id).map(
        (product): ProductCard => {
          const { id: cardId, price, href, delivery, image, sample, paypal, video, [locale]: text } = product;
          return { id: cardId, price, href, delivery, image, sample, paypal, video, link: cardLink(product, locale), ...text };
        },
      ),
      // One-line pointers to a card listed in another section ({link} becomes a link to that card).
      also: PRODUCTS.filter((p) => p.live && p.alsoIn?.section === id).map((p) => {
        const [before, after] = p.alsoIn![locale].replace('{price}', p.price).split('{link}');
        return { id: p.id, title: p[locale].title, before, after };
      }),
    })).filter((section) => section.cards.length > 0),
  };
}

export const productsContent: Record<Locale, ReturnType<typeof productsPage>> = { en: productsPage('en'), vi: productsPage('vi') };

/** The sample's PDF and its three page thumbnails, from a product's sample stem. */
export function productSampleFiles(stem: string) {
  const thumbs = [1, 2, 3].map((n) => `${PRODUCT_SAMPLE_DIR}/${stem}-p${n}.webp`);
  const count = SAMPLE_PAGE_COUNTS[stem] ?? 0;
  return {
    thumbs,
    // The viewer's pages: the full watermarked set, or the three thumbnails until that set lands.
    pages: count
      ? Array.from({ length: count }, (_, i) => `${PRODUCT_SAMPLE_DIR}/pages/${stem}-pg${String(i + 1).padStart(2, '0')}.webp`)
      : thumbs,
  };
}

/** Anchor of a card's sample block on /products. */
export const productSampleAnchor = (id: string) => `${id}-sample`;

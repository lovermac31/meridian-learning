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

export const PRODUCTS_PATH = '/products';
export const PRODUCTS_VI_PATH = '/vi/products';
export const PRODUCTS_UTM = 'utm_source=products';
export const PRODUCTS_ZALO = `https://zalo.me/84396085076?${PRODUCTS_UTM}`;
export const PRODUCT_IMAGE_DIR = '/images/products';
// Public sample of each product (Jay, 27 Oct 2026: "Everybody has to see the samples" before a price or a booking):
// <stem>-sample.pdf plus three page thumbnails <stem>-p1.webp … -p3.webp, made by the factory sessions to the
// master's SAMPLES-AND-BRANDED-PDF-SPEC.
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
  // File stem of the product's public sample in public/samples. Set it only once all four files are in the repo
  // (a test checks both ways), so the "See a sample" block never shows a broken link.
  sample?: string;
  en: CardText;
  vi: CardText;
};

export const PRODUCTS: Product[] = [
  {
    id: 'story-club',
    live: true,
    section: 'families',
    price: '590.000₫',
    href: '/story-club',
    image: 'story-club',
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
    live: true,
    section: 'families',
    price: '690.000₫',
    href: '/ai-speaking/baseline',
    image: 'baseline',
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
    live: true,
    section: 'families',
    price: '800.000₫',
    href: '/ai-speaking/lessons',
    image: 'one-to-one',
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
    live: true,
    section: 'families',
    price: '149.000₫',
    href: 'zalo',
    image: 'printable-pack-l1',
    delivery: true,
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
    id: 'teacher-pack',
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l1',
    delivery: true,
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
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l2',
    delivery: true,
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
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l3',
    delivery: true,
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
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l4',
    delivery: true,
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
    live: true,
    section: 'teachers',
    price: '690.000₫',
    href: 'zalo',
    image: 'teacher-pack-l5',
    delivery: true,
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
    live: true,
    section: 'teachers',
    price: '2.900.000₫',
    href: 'zalo',
    image: 'teacher-bundle',
    delivery: true,
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
    id: 'thinking-cycle-set',
    live: true,
    section: 'teachers',
    price: '490.000₫',
    href: 'zalo',
    delivery: true,
    image: 'thinking-cycle-set',
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
    id: 'reasoning-assessment-kit',
    live: true,
    section: 'teachers',
    price: '390.000₫',
    href: 'zalo',
    delivery: true,
    image: 'reasoning-assessment-kit',
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
    image: 'ielts-speaking-ladder',
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
    id: 'centre-licence',
    live: true,
    section: 'centres',
    price: '4.900.000₫',
    href: 'zalo',
    image: 'centre-licence',
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
    live: true,
    section: 'centres',
    price: '1.490.000₫',
    href: 'zalo',
    delivery: true,
    image: 'teacher-training-course',
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
    live: true,
    section: 'centres',
    price: '690.000₫',
    href: 'zalo',
    delivery: true,
    image: 'pilot-class-kit',
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
    live: true,
    section: 'centres',
    price: '290.000₫',
    href: 'zalo',
    delivery: true,
    image: 'curriculum-overview',
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
    sample: { heading: 'See a sample', note: 'See exactly what you get before you pay.', open: 'Open the sample (PDF)' },
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
    sample: { heading: 'Xem mẫu', note: 'Xem đúng những gì bạn nhận được trước khi thanh toán.', open: 'Mở bản mẫu (PDF)' },
    sections: {
      families: { heading: 'Dành cho gia đình', intro: 'Lớp học trực tiếp cùng thầy Jay, và tài liệu in để học ở nhà.' },
      teachers: { heading: 'Dành cho giáo viên', intro: 'Tài liệu dùng ngay cho giáo viên và gia sư.' },
      centres: { heading: 'Dành cho trung tâm', intro: 'Chương trình và tài liệu cho trường học và trung tâm.' },
    },
    closing: { heading: 'Chưa chắc sản phẩm nào phù hợp?', body: 'Nhắn thầy Jay qua Zalo, thầy sẽ gợi ý lựa chọn phù hợp. Không thu tiền cho đến khi bạn đồng ý bản tóm tắt đơn hàng bằng văn bản.', cta: 'Hỏi thầy Jay qua Zalo' },
  },
};

export type ProductCard = CardText & Pick<Product, 'id' | 'price' | 'href' | 'delivery' | 'image' | 'sample'>;

/** The page in one language: its copy, and the sections in order with their cards from PRODUCTS. */
export function productsPage(locale: Locale) {
  const copy = PAGE[locale];
  return {
    ...copy,
    sections: PRODUCT_SECTIONS.map((id) => ({
      id,
      ...copy.sections[id],
      cards: PRODUCTS.filter((p) => p.live && p.section === id).map(
        ({ id: cardId, price, href, delivery, image, sample, [locale]: text }): ProductCard => ({
          id: cardId, price, href, delivery, image, sample, ...text,
        }),
      ),
    })).filter((section) => section.cards.length > 0),
  };
}

export const productsContent: Record<Locale, ReturnType<typeof productsPage>> = { en: productsPage('en'), vi: productsPage('vi') };

/** The sample's PDF and its three page thumbnails, from a product's sample stem. */
export function productSampleFiles(stem: string) {
  return {
    pdf: `${PRODUCT_SAMPLE_DIR}/${stem}-sample.pdf`,
    pages: [1, 2, 3].map((n) => `${PRODUCT_SAMPLE_DIR}/${stem}-p${n}.webp`),
  };
}

/** Anchor of a card's sample block on /products. */
export const productSampleAnchor = (id: string) => `${id}-sample`;

/**
 * One indexable page per product (Jay, 27 Oct 2026: "each of these pages, all 27 of these services, needs to be set
 * up on Bing.com and Google so people can find them"). The /products hub keeps its cards; each live card also gets
 * /products/<id> and /vi/products/<id>, built from PRODUCTS (products.ts) plus the search copy below.
 *
 * Per product: the one search phrase the page targets in each language (Vietnam demand first), and the page title
 * (≤ 60 characters) and meta description (80–160). The H1 uses the localized search title to distinguish the detailed offer from hubs and cards. Phrase choice and evidence:
 * Marketing/SEO-Manager/products-seo-plan.md (SEO Manager, 27 Oct 2026). The Vietnamese is machine-drafted and needs
 * a native read, like the hub's.
 */
import type { Locale } from '../locales';
import { PRODUCTS, PRODUCT_SECTIONS, productsPage, type Product } from './products';
import { PAYPAL_CARD_COPY } from '../../lib/productsSource';

type SeoText = { keyword: string; title: string; description: string };
export type ProductSeo = Record<Locale, SeoText>;

export const PRODUCT_SEO: Record<string, ProductSeo> = {
  'story-club': {
    en: {
      keyword: 'online english story club for kids',
      title: 'Online English Story Club for Kids 5–8 | Mr. Jay',
      description: 'A small online English story group for ages 5–8: four 30-minute Saturday sessions, a task at home each week and Mr. Jay’s personal reply. 590.000₫.',
    },
    vi: {
      keyword: 'câu lạc bộ đọc truyện tiếng anh cho bé',
      title: 'Câu lạc bộ đọc truyện tiếng Anh online cho bé 5–8 tuổi',
      description: 'Nhóm nhỏ đọc truyện tiếng Anh trực tuyến cho bé 5–8 tuổi: 4 buổi sáng thứ Bảy, bài nhỏ ở nhà mỗi tuần và thầy Jay phản hồi riêng từng bé. 590.000₫.',
    },
  },
  baseline: {
    en: {
      keyword: 'english speaking level test for kids',
      title: 'English Speaking Level Test for Ages 9–18 | Baseline',
      description: 'A live 15–20 minute speaking session with Mr. Jay, then a written plan: four criterion bands, an overall band and what to work on next. 690.000₫.',
    },
    vi: {
      keyword: 'kiểm tra trình độ nói tiếng anh cho con',
      title: 'Kiểm tra trình độ nói tiếng Anh cho con 9–18 tuổi',
      description: 'Một buổi nói trực tiếp 15–20 phút với thầy Jay, sau đó là kế hoạch bằng văn bản: điểm bốn tiêu chí, điểm tổng và điều cần luyện tiếp. 690.000₫.',
    },
  },
  'one-to-one': {
    en: {
      keyword: 'online 1-to-1 english lessons',
      title: 'Online 1-to-1 English & IELTS Speaking Lessons',
      description: 'Private 60-minute online lessons with Mr. Jay’s team of professional teachers, built on a speaking diagnosis. 800.000₫ a lesson, 8 lessons 5.600.000₫.',
    },
    vi: {
      keyword: 'học tiếng anh 1 kèm 1 online',
      title: 'Học tiếng Anh 1 kèm 1 online với đội ngũ thầy Jay',
      description: 'Buổi học riêng 60 phút trực tuyến với đội ngũ giáo viên chuyên nghiệp của thầy Jay, dựa trên đánh giá nói. 800.000₫/buổi, gói 8 buổi 5.600.000₫.',
    },
  },
  'printable-pack': {
    en: {
      keyword: 'printable english storybooks for kids',
      title: 'Printable English Storybooks for Kids 4–8 (PDF)',
      description: 'Print-ready PDFs of 3 original Jurassic English Level 1 storybooks for ages 4–8. One-family licence, print as many copies as you like. 149.000₫.',
    },
    vi: {
      keyword: 'truyện tiếng anh cho bé pdf',
      title: 'Truyện tiếng Anh cho bé 4–8 tuổi bản in PDF',
      description: 'Bản PDF in sẵn 3 truyện tiếng Anh gốc Level 1 của Jurassic English cho bé 4–8 tuổi. Giấy phép một gia đình, in bao nhiêu bản tùy ý. 149.000₫.',
    },
  },
  'parent-pack-l1': {
    en: {
      keyword: 'english reading at home for kids 4–8',
      title: 'English Reading at Home for Kids 4–8 | Parent Pack',
      description: 'A ten-minute daily English reading routine for parents of children aged 4–8: bilingual guide, three storybooks, 12 activity pages, progress chart. 249.000₫.',
    },
    vi: {
      keyword: 'dạy con đọc tiếng anh tại nhà',
      title: 'Dạy con đọc tiếng Anh tại nhà (4–8 tuổi) | Level 1',
      description: 'Lộ trình đọc tiếng Anh 10 phút mỗi ngày cho phụ huynh có con 4–8 tuổi: hướng dẫn song ngữ, 3 truyện, 12 trang hoạt động, bảng tiến bộ. 249.000₫.',
    },
  },
  'parent-pack-l2': {
    en: {
      keyword: 'english reading at home for kids 8–10',
      title: 'English Reading at Home for Kids 8–10 | Parent Pack',
      description: 'A fifteen-minute daily English reading routine for parents of children aged 8–10: bilingual guide, two storybooks, activity pages, progress chart. 249.000₫.',
    },
    vi: {
      keyword: 'dạy con đọc tiếng anh 8–10 tuổi',
      title: 'Dạy con đọc tiếng Anh tại nhà (8–10 tuổi) | Level 2',
      description: 'Lộ trình đọc tiếng Anh 15 phút mỗi ngày cho phụ huynh có con 8–10 tuổi: hướng dẫn song ngữ, 2 truyện, trang hoạt động và bảng tiến bộ. 249.000₫.',
    },
  },
  'teacher-pack-l1': {
    en: {
      keyword: 'english lesson plans for kids ages 4–8',
      title: 'English Lesson Plans for Kids 4–8 | Teacher Pack L1',
      description: '40 scripted English lessons for ages 4–8 with the teacher’s lines and a simple rubric, plus the syllabus and implementation manual. One teacher. 690.000₫.',
    },
    vi: {
      keyword: 'giáo án tiếng anh cho trẻ em',
      title: 'Giáo án tiếng Anh cho trẻ 4–8 tuổi | Level 1',
      description: '40 giáo án tiếng Anh soạn sẵn từng phút cho trẻ 4–8 tuổi, có lời thoại giáo viên và tiêu chí chấm, kèm khung chương trình và sổ tay. 690.000₫.',
    },
  },
  'teacher-pack-l2': {
    en: {
      keyword: 'english lesson plans for ages 8–10',
      title: 'English Lesson Plans for Ages 8–10 | Teacher Pack L2',
      description: 'Level 2 teacher materials for ages 8–10 (CEFR A1 → A2): the syllabus, the Teacher Implementation Manual and 40 lesson plans. One teacher. 690.000₫.',
    },
    vi: {
      keyword: 'giáo án tiếng anh 8–10 tuổi',
      title: 'Giáo án tiếng Anh cho học sinh 8–10 tuổi | Level 2',
      description: 'Tài liệu giáo viên Level 2 cho học sinh 8–10 tuổi (CEFR A1 → A2): khung chương trình, sổ tay triển khai và 40 giáo án. Một giáo viên. 690.000₫.',
    },
  },
  'teacher-pack-l3': {
    en: {
      keyword: 'english lesson plans for ages 10–12',
      title: 'English Lesson Plans for Ages 10–12 | Teacher Pack L3',
      description: 'Level 3 teacher materials for ages 10–12 (CEFR A2 → B1): the syllabus, the Teacher Implementation Manual and 40 lesson plans. One teacher. 690.000₫.',
    },
    vi: {
      keyword: 'giáo án tiếng anh 10–12 tuổi',
      title: 'Giáo án tiếng Anh cho học sinh 10–12 tuổi | Level 3',
      description: 'Tài liệu giáo viên Level 3 cho học sinh 10–12 tuổi (CEFR A2 → B1): khung chương trình, sổ tay triển khai và 40 giáo án. Một giáo viên. 690.000₫.',
    },
  },
  'teacher-pack-l4': {
    en: {
      keyword: 'english lesson plans for ages 12–14',
      title: 'English Lesson Plans for Ages 12–14 | Teacher Pack L4',
      description: 'Level 4 teacher materials for ages 12–14 (CEFR B1 → B2): the syllabus, the Teacher Implementation Manual and 40 lesson plans. One teacher. 690.000₫.',
    },
    vi: {
      keyword: 'giáo án tiếng anh thcs',
      title: 'Giáo án tiếng Anh cho học sinh 12–14 tuổi | Level 4',
      description: 'Tài liệu giáo viên Level 4 cho học sinh 12–14 tuổi (CEFR B1 → B2): khung chương trình, sổ tay triển khai và 40 giáo án. Một giáo viên. 690.000₫.',
    },
  },
  'teacher-pack-l5': {
    en: {
      keyword: 'english lesson plans for teenagers 14+',
      title: 'English Lesson Plans for Teens 14+ | Teacher Pack L5',
      description: 'Level 5 teacher materials for ages 14+ (CEFR B2 → C1): the syllabus, the Teacher Implementation Manual and 40 lesson plans. One teacher. 690.000₫.',
    },
    vi: {
      keyword: 'giáo án tiếng anh thpt nâng cao',
      title: 'Giáo án tiếng Anh nâng cao cho học sinh 14+ | Level 5',
      description: 'Tài liệu giáo viên Level 5 cho học sinh từ 14 tuổi (CEFR B2 → C1): khung chương trình, sổ tay triển khai và 40 giáo án. Một giáo viên. 690.000₫.',
    },
  },
  'teacher-bundle': {
    en: {
      keyword: 'english curriculum lesson plans levels 1–5',
      title: '200 English Lesson Plans, Levels 1–5 | Teacher Bundle',
      description: 'All five Jurassic English Teacher Packs: the syllabus, implementation manual and 40 lesson plans for each level, 200 in all. One teacher. 2.900.000₫.',
    },
    vi: {
      keyword: 'trọn bộ giáo án tiếng anh',
      title: 'Trọn bộ 200 giáo án tiếng Anh Level 1–5',
      description: 'Cả năm bộ tài liệu giáo viên Jurassic English: khung chương trình, sổ tay triển khai và 40 giáo án mỗi level, tổng 200 giáo án. Một giáo viên. 2.900.000₫.',
    },
  },
  'student-workbook-l1': {
    en: {
      keyword: 'printable english workbook for kids 4–8',
      title: 'Printable English Workbook for Kids 4–8 | Level 1',
      description: '63 printable A4 English pages for ages 4–8: 40 lesson pages, story openers and a Thinking Passport. 190.000₫ per learner, class set of 10 for 1.490.000₫.',
    },
    vi: {
      keyword: 'sách bài tập tiếng anh cho bé',
      title: 'Sách bài tập tiếng Anh cho bé 4–8 tuổi | Level 1',
      description: '63 trang A4 in sẵn cho bé 4–8 tuổi: 40 trang bài học, mở đầu truyện và Hộ chiếu Tư duy. 190.000₫ mỗi học viên, bộ lớp 10 em 1.490.000₫.',
    },
  },
  'student-workbook-l2': {
    en: {
      keyword: 'english workbook for ages 8–10',
      title: 'Printable English Workbook for Ages 8–10 | Level 2',
      description: '62 printable A4 pages for learners aged 8–10 (CEFR A1 → A2), in the order of the Level 2 Teacher Pack. 190.000₫ per learner, class set of 10 1.490.000₫.',
    },
    vi: {
      keyword: 'sách bài tập tiếng anh 8–10 tuổi',
      title: 'Sách bài tập tiếng Anh cho học sinh 8–10 tuổi | Level 2',
      description: '62 trang A4 in sẵn cho học sinh 8–10 tuổi (CEFR A1 → A2), theo thứ tự giáo án Level 2. 190.000₫ mỗi học viên, bộ lớp 10 em 1.490.000₫.',
    },
  },
  'student-workbook-l3': {
    en: {
      keyword: 'english workbook for ages 10–12',
      title: 'Printable English Workbook for Ages 10–12 | Level 3',
      description: '62 printable A4 pages for learners aged 10–12 (CEFR A2 → B1), in the order of the Level 3 Teacher Pack. 190.000₫ per learner, class set of 10 1.490.000₫.',
    },
    vi: {
      keyword: 'sách bài tập tiếng anh 10–12 tuổi',
      title: 'Sách bài tập tiếng Anh cho học sinh 10–12 tuổi | Level 3',
      description: '62 trang A4 in sẵn cho học sinh 10–12 tuổi (CEFR A2 → B1), theo thứ tự giáo án Level 3. 190.000₫ mỗi học viên, bộ lớp 10 em 1.490.000₫.',
    },
  },
  'student-workbook-l4': {
    en: {
      keyword: 'english workbook for ages 12–14',
      title: 'Printable English Workbook for Ages 12–14 | Level 4',
      description: '62 printable A4 pages for learners aged 12–14 (CEFR B1 → B2), in the order of the Level 4 Teacher Pack. 190.000₫ per learner, class set of 10 1.490.000₫.',
    },
    vi: {
      keyword: 'sách bài tập tiếng anh thcs',
      title: 'Sách bài tập tiếng Anh cho học sinh 12–14 tuổi | Level 4',
      description: '62 trang A4 in sẵn cho học sinh 12–14 tuổi (CEFR B1 → B2), theo thứ tự giáo án Level 4. 190.000₫ mỗi học viên, bộ lớp 10 em 1.490.000₫.',
    },
  },
  'student-workbook-l5': {
    en: {
      keyword: 'advanced english workbook for teens',
      title: 'Advanced English Workbook for Teens 14+ | Level 5',
      description: '62 printable A4 pages for learners aged 14+ (CEFR B2 → C1), in the order of the Level 5 Teacher Pack. 190.000₫ per learner, class set of 10 1.490.000₫.',
    },
    vi: {
      keyword: 'sách bài tập tiếng anh nâng cao',
      title: 'Sách bài tập tiếng Anh nâng cao cho học sinh 14+ | Level 5',
      description: '62 trang A4 in sẵn cho học sinh từ 14 tuổi (CEFR B2 → C1), theo thứ tự giáo án Level 5. 190.000₫ mỗi học viên, bộ lớp 10 em 1.490.000₫.',
    },
  },
  'thinking-cycle-set': {
    en: {
      keyword: 'critical thinking lesson plan for english class',
      title: 'Critical Thinking Routine for English Classes | Manuals',
      description: 'Teacher and student manuals for the Jurassic Thinking Cycle (Analyze, Evaluate, Justify, Reflect), the CEIW writing framework, a lesson template. 490.000₫.',
    },
    vi: {
      keyword: 'dạy tư duy phản biện tiếng anh',
      title: 'Dạy tư duy phản biện trong lớp tiếng Anh | Sổ tay',
      description: 'Sổ tay giáo viên và học sinh cho Chu trình Tư duy Jurassic bốn bước (Phân tích, Đánh giá, Lập luận, Suy ngẫm), khung viết CEIW và mẫu giáo án. 490.000₫.',
    },
  },
  'reasoning-assessment-kit': {
    en: {
      keyword: 'english placement test and rubric for kids',
      title: 'English Reasoning Assessment & Placement Kit, Levels 1–5',
      description: 'Reasoning worksheets for Levels 1–5, scoring sheets with feedback codes, a placement guide and a parent report template. For teachers and centres. 390.000₫.',
    },
    vi: {
      keyword: 'bài kiểm tra xếp lớp tiếng anh trẻ em',
      title: 'Bộ đánh giá lập luận và xếp lớp tiếng Anh Level 1–5',
      description: 'Phiếu lập luận Level 1–5, phiếu chấm có mã nhận xét, hướng dẫn kiểm tra xếp lớp và mẫu báo cáo cho phụ huynh. Dành cho giáo viên và trung tâm. 390.000₫.',
    },
  },
  'ielts-speaking-ladder': {
    en: {
      keyword: 'ielts speaking self-study band 5 to 7',
      title: 'IELTS Speaking Self-Study: Band 5.0 to 6.5–7.0',
      description: '18 self-study IELTS Speaking lessons from Band 5.0 to 6.5–7.0, one habit per lesson, timed Part 1–3 tasks. Not an official IELTS score. 390.000₫.',
    },
    vi: {
      keyword: 'tự học ielts speaking',
      title: 'Tự học IELTS Speaking từ 5.0 lên 6.5–7.0',
      description: '18 bài tự học IELTS Speaking từ Band 5.0 lên 6.5–7.0, mỗi bài sửa một thói quen, bài nói Part 1–3 bấm giờ. Không phải điểm IELTS chính thức. 390.000₫.',
    },
  },
  'ielts-writing-ladder-task2': {
    en: {
      keyword: 'ielts writing task 2 self-study',
      title: 'IELTS Writing Task 2 Self-Study: 7 Lessons from 5.5',
      description: 'Seven IELTS Writing Task 2 lessons: take a position, give reasons that hold, answer the other side, finish in 40 minutes. Not an official IELTS score. 390.000₫.',
    },
    vi: {
      keyword: 'ielts writing task 2',
      title: 'Tự học IELTS Writing Task 2: 7 bài từ 5.5 trở lên',
      description: '7 bài IELTS Writing Task 2: chọn quan điểm, đưa lý do vững, phản biện ý ngược lại, xong bài trong 40 phút. Không phải điểm IELTS chính thức. 390.000₫.',
    },
  },
  'ielts-writing-task1-method': {
    en: {
      keyword: 'ielts writing task 1 method',
      title: 'IELTS Writing Task 1: the 20-Minute Method (4 Lessons)',
      description: 'Four IELTS Writing Task 1 lessons for Academic and General Training: overview first, compare figures, maps, processes, letters. Not an official score. 290.000₫.',
    },
    vi: {
      keyword: 'ielts writing task 1',
      title: 'IELTS Writing Task 1: phương pháp 20 phút (4 bài)',
      description: '4 bài IELTS Writing Task 1 cho Academic và General Training: overview trước, so sánh số liệu, bản đồ, quy trình, thư. Không phải điểm chính thức. 290.000₫.',
    },
  },
  'ielts-writing-teacher-pack': {
    en: {
      keyword: 'ielts writing lesson plans for teachers',
      title: 'IELTS Writing Lesson Plans for Teachers (10 Lessons)',
      description: 'Ten ready-to-teach 60-minute IELTS Writing class lessons: six for Task 2 and four for Task 1 reports and letters. For teachers and centres. 690.000₫.',
    },
    vi: {
      keyword: 'giáo án ielts writing',
      title: 'Giáo án IELTS Writing cho giáo viên (10 buổi)',
      description: '10 giáo án IELTS Writing 60 phút dạy ngay: 6 buổi Task 2 và 4 buổi Task 1 (báo cáo và thư). Dành cho giáo viên và trung tâm. 690.000₫.',
    },
  },
  'centre-licence': {
    en: {
      keyword: 'english curriculum licence for language centres',
      title: 'English Curriculum Licence for Centres, Ages 4–8',
      description: 'A full school year of English for ages 4–8: 40 scripted lessons, implementation and training manuals and slides. Per campus, per school year. 4.900.000₫.',
    },
    vi: {
      keyword: 'chương trình tiếng anh cho trung tâm',
      title: 'Bản quyền chương trình tiếng Anh cho trung tâm (4–8 tuổi)',
      description: 'Trọn một năm học tiếng Anh cho trẻ 4–8 tuổi: 40 giáo án soạn sẵn, sổ tay triển khai và đào tạo, slide. Mỗi cơ sở, mỗi năm học. 4.900.000₫.',
    },
  },
  'teacher-training-course': {
    en: {
      keyword: 'english teacher training course for centres',
      title: 'English Teacher Training Course for Centres (Trainer Kit)',
      description: 'Train your own teachers in the Jurassic English method: Train-the-Trainer manual, rubric calibration session, observation checklist. One centre. 1.490.000₫.',
    },
    vi: {
      keyword: 'khóa đào tạo giáo viên tiếng anh',
      title: 'Khóa đào tạo giáo viên tiếng Anh cho trung tâm',
      description: 'Tự đào tạo giáo viên theo phương pháp Jurassic English: sổ tay đào tạo người đào tạo, buổi thống nhất tiêu chí chấm, phiếu dự giờ. Một trung tâm. 1.490.000₫.',
    },
  },
  'pilot-class-kit': {
    en: {
      keyword: 'how to launch a pilot english class',
      title: 'Pilot English Class Launch Kit for Centres (6–8 Weeks)',
      description: 'Run one pilot English class before rolling out: a 6–8 week plan, teacher guide, parent orientation script and FAQ, and demo lessons for Levels 1–5. 690.000₫.',
    },
    vi: {
      keyword: 'mở lớp tiếng anh thí điểm',
      title: 'Bộ tài liệu mở lớp tiếng Anh thí điểm (6–8 tuần)',
      description: 'Chạy một lớp tiếng Anh thí điểm trước khi triển khai: kế hoạch 6–8 tuần, hướng dẫn giáo viên, kịch bản họp phụ huynh và bài dạy mẫu Level 1–5. 690.000₫.',
    },
  },
  'curriculum-overview': {
    en: {
      keyword: 'english curriculum overview for schools',
      title: 'English Curriculum Overview for Schools, Levels 1–5',
      description: 'The Four-Lesson Cycle, the curriculum framework, models for all five levels and the Levels 1–5 syllabus. For principals comparing programmes. 290.000₫.',
    },
    vi: {
      keyword: 'khung chương trình tiếng anh cho trường học',
      title: 'Khung chương trình tiếng Anh cho trường học, Level 1–5',
      description: 'Chu trình Bốn Bài học, khung chương trình, mô hình cho cả năm level và đề cương Level 1–5. Dành cho hiệu trưởng so sánh chương trình. 290.000₫.',
    },
  },
  // 35-today plan (27 Oct 2026): search copy for the eight new products; each page appears when its card goes live.
  'parent-pack-l3': {
    en: {
      keyword: 'english reading at home for kids 10-12',
      title: 'Level 3 Parent Home Reading Pack: Ages 10–12 (PDF)',
      description: 'A parent guide in English and Vietnamese, three original Level 3 storybooks, 12 activity pages and a progress chart: six weeks at home, ages 10–12. 249.000₫.',
    },
    vi: {
      keyword: 'đọc sách tiếng anh tại nhà cho con 10-12 tuổi',
      title: 'Bộ đọc sách tại nhà cho phụ huynh Level 3 (10–12 tuổi)',
      description: 'Hướng dẫn cho phụ huynh song ngữ, ba truyện gốc Level 3, 12 trang hoạt động và bảng theo dõi tiến bộ: sáu tuần tại nhà cho con 10–12 tuổi. 249.000₫.',
    },
  },
  'holiday-reading-challenge': {
    en: {
      keyword: 'holiday reading challenge for kids',
      title: 'Holiday Reading Challenge for Kids, Levels 1–2 (PDF)',
      description: 'A four-week home reading plan for the holidays: a reading log, 12 story activities and a certificate, for children at Levels 1–2. 149.000₫.',
    },
    vi: {
      keyword: 'thử thách đọc sách tiếng anh kỳ nghỉ',
      title: 'Thử thách đọc sách tiếng Anh kỳ nghỉ, Level 1–2',
      description: 'Kế hoạch đọc tại nhà bốn tuần cho kỳ nghỉ: sổ ghi chép đọc sách, 12 hoạt động theo truyện và giấy khen cho con ở Level 1–2. 149.000₫.',
    },
  },
  'word-fossil-flashcards-l1': {
    en: {
      keyword: 'printable english flashcards for kids',
      title: 'Printable English Picture Flashcards, Level 1 (120)',
      description: '120 printable picture flashcards in English and Vietnamese for Level 1 learners aged 4–8, for teachers and parents. 190.000₫.',
    },
    vi: {
      keyword: 'thẻ từ vựng tiếng anh có hình cho bé',
      title: 'Thẻ từ vựng tiếng Anh có hình để in, Level 1 (120 thẻ)',
      description: '120 thẻ từ vựng có hình để in, song ngữ Anh–Việt, cho học sinh Level 1 từ 4–8 tuổi, dành cho giáo viên và phụ huynh. 190.000₫.',
    },
  },
  'thinking-cycle-posters': {
    en: {
      keyword: 'critical thinking classroom posters',
      title: 'Thinking Cycle Classroom Posters: 8 A3, EN/VI (PDF)',
      description: '8 A3 classroom posters of the Jurassic Thinking Cycle in English and Vietnamese, ready to print, for teachers and centres. 149.000₫.',
    },
    vi: {
      keyword: 'poster tư duy phản biện cho lớp học',
      title: 'Bộ poster lớp học Thinking Cycle: 8 tờ A3 song ngữ',
      description: '8 poster A3 cho lớp học về Jurassic Thinking Cycle, song ngữ Anh–Việt, sẵn sàng để in, dành cho giáo viên và trung tâm. 149.000₫.',
    },
  },
  'ielts-one-to-one-starter': {
    en: {
      keyword: 'ielts speaking 1 to 1 lesson plan',
      title: 'IELTS Speaking One-to-One Lesson Plan (90 min, PDF)',
      description: 'One complete 90-minute IELTS Speaking one-to-one lesson with tutor notes, keys, scripts and an answer-free student handout. For tutors. 149.000₫.',
    },
    vi: {
      keyword: 'giáo án ielts speaking 1 kèm 1',
      title: 'Giáo án IELTS Speaking 1 kèm 1 trọn vẹn 90 phút',
      description: 'Một giáo án IELTS Speaking 1 kèm 1 trọn vẹn 90 phút, có ghi chú cho gia sư, đáp án, kịch bản và phiếu cho học viên. Dành cho gia sư. 149.000₫.',
    },
  },
  'ielts-cue-card-bank': {
    en: {
      keyword: 'ielts speaking part 2 cue cards',
      title: 'IELTS Speaking Part 2 Cue Cards with Model Answers',
      description: '60 original IELTS Speaking Part 2 cue cards, each with a 1-minute plan, a Band 7-style answer and Band 6 and 8-style moments. Practice material. 290.000₫.',
    },
    vi: {
      keyword: 'đề ielts speaking part 2 có bài mẫu',
      title: 'Bộ thẻ đề IELTS Speaking Part 2 kèm bài mẫu',
      description: '60 thẻ đề IELTS Speaking Part 2 gốc, mỗi thẻ có dàn ý 1 phút, bài trả lời mức Band 7 và đoạn mẫu mức Band 6, 8. Tài liệu luyện tập. 290.000₫.',
    },
  },
  'writing-baseline': {
    en: {
      keyword: 'ielts writing task 2 feedback',
      title: 'IELTS Writing Task 2 Feedback: One Essay, Three Priorities',
      description: 'Send one IELTS Task 2 essay. Mr. Jay or his team reads it by hand and returns one strength and three ranked priorities by Zalo or email. From 79.000₫.',
    },
    vi: {
      keyword: 'chấm bài ielts writing task 2',
      title: 'Chấm bài IELTS Writing Task 2: một bài, ba ưu tiên sửa',
      description: 'Gửi một bài IELTS Task 2. Thầy Jay hoặc đội ngũ đọc bằng tay và gửi lại một điểm mạnh, ba ưu tiên cần sửa qua Zalo hoặc email. Từ 79.000₫.',
    },
  },
  'ielts-essay-bank-task2': {
    en: {
      keyword: 'ielts writing task 2 sample essays',
      title: 'IELTS Writing Task 2 Essay Bank: 40 Prompts and Models',
      description: '40 original IELTS Writing Task 2 prompts, each with a Thinking Cycle plan and a Band 7-style model essay. Practice material. 290.000₫.',
    },
    vi: {
      keyword: 'bài mẫu ielts writing task 2',
      title: 'Ngân hàng bài luận IELTS Writing Task 2: 40 đề và bài mẫu',
      description: '40 đề IELTS Writing Task 2 gốc, mỗi đề có dàn ý theo Thinking Cycle và một bài mẫu mức Band 7. Tài liệu luyện tập. 290.000₫.',
    },
  },
};

export const productPath = (id: string) => `/products/${id}`;

/** The live products that have a page, in list order. */
export const PAGE_PRODUCTS: Product[] = PRODUCTS.filter((product) => product.live && PRODUCT_SEO[product.id]);
/** English paths of every product page (the /vi twin comes from the locale routing). */
export const PRODUCT_PAGE_PATHS = PAGE_PRODUCTS.map((product) => productPath(product.id));

/** The live product a /products/<id> path names, or null (an unknown id stays a 404). */
export function getProductByPath(pathname: string): Product | null {
  const id = pathname.match(/^\/products\/([^/]+)$/)?.[1];
  return (id && PAGE_PRODUCTS.find((product) => product.id === id)) || null;
}

/** Three related products: the next live cards in the same section (wrapping), topped up from the next sections. */
export function relatedProducts(id: string, count = 3): Product[] {
  const product = PAGE_PRODUCTS.find((entry) => entry.id === id);
  if (!product) return [];
  const sectionOrder = [product.section, ...PRODUCT_SECTIONS.filter((section) => section !== product.section)];
  const sameSection = PAGE_PRODUCTS.filter((entry) => entry.section === product.section);
  const at = sameSection.indexOf(product);
  const wrapped = [...sameSection.slice(at + 1), ...sameSection.slice(0, at)];
  const others = sectionOrder.slice(1).flatMap((section) => PAGE_PRODUCTS.filter((entry) => entry.section === section));
  return [...wrapped, ...others].slice(0, count);
}

const FAQ_QUESTIONS: Record<Locale, { sample: string; pay: string; abroad: string; unsure: string }> = {
  en: {
    sample: 'Can I see it before I pay?',
    pay: 'How do I pay, and when do the files arrive?',
    abroad: 'Can I buy from outside Vietnam?',
    unsure: 'What if I am not sure this is the right one?',
  },
  vi: {
    sample: 'Tôi có xem trước được không?',
    pay: 'Thanh toán thế nào và khi nào nhận được tài liệu?',
    abroad: 'Ở ngoài Việt Nam có mua được không?',
    unsure: 'Nếu chưa chắc sản phẩm này phù hợp thì sao?',
  },
};

/** The page's FAQ: questions answered only with the approved /products copy (sample, delivery, PayPal, closing). */
export function productFaq(product: Product, locale: Locale): Array<{ question: string; answer: string }> {
  const page = productsPage(locale);
  const q = FAQ_QUESTIONS[locale];
  return [
    ...(product.sample ? [{ question: q.sample, answer: `${page.sample.note} ${page.viewer.viewOnly}` }] : []),
    ...(product.delivery ? [{ question: q.pay, answer: page.delivery }] : []),
    ...(product.paypal ? [{ question: q.abroad, answer: PAYPAL_CARD_COPY[locale].note }] : []),
    { question: q.unsure, answer: page.closing.body },
  ];
}

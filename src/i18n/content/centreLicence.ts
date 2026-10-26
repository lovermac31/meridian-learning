/**
 * /centres/level-1 — Level 1 Centre Licence, for owners of young-learner centres (ages 4–8).
 *
 * UNLISTED SALES PAGE (master directive L-4, 27 Oct 2026). Shared only in Zalo after an owner replies:
 * noindex, out of the sitemap, and linked from nowhere on the site. Copy follows the Notion
 * "L1 Centre Licence — Launch Kit Spec": no published book titles, one price (the spec's §1), no clients or
 * outcome promises. The Vietnamese copy is machine-drafted and needs a native read before use.
 * Jay approves the page at the Tue 3 Nov review; it does not merge before then.
 */
import type { Locale } from '../locales';

export const CENTRE_LICENCE_PATH = '/centres/level-1';
export const CENTRE_LICENCE_VI_PATH = '/vi/centres/level-1';
export const CENTRE_LICENCE_ZALO = 'https://zalo.me/84396085076?utm_source=centre-page';

// {FOUNDING_PRICE}: the one place the price appears on this page. Spec §1, approved by Jay on 27 Oct 2026:
// 4,900,000 ₫ per campus per school year. Set it to null to show "price on request" instead.
export const FOUNDING_PRICE: string | null = '4.900.000₫';

type Item = { title: string; body: string };
type Phase = { time: string; name: string; detail: string; script?: string };
type Book = { id: string; title: string; theme: string; alt: string };
type Faq = { q: string; a: string };

type CentreLicenceCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  cta: string;
  ctaNote: string;
  why: { heading: string; items: Item[] };
  inside: { heading: string; items: string[]; note: string };
  lesson: {
    heading: string;
    intro: string;
    meta: string;
    scriptLabel: string;
    phases: Phase[];
    tiersHeading: string;
    tiers: Item[];
    notes: string[];
  };
  books: { heading: string; intro: string; items: Book[] };
  terms: { heading: string; items: string[] };
  price: { heading: string; unit: string; onRequest: string; note: string };
  steps: { heading: string; items: Item[] };
  faq: { heading: string; items: Faq[] };
  closing: { heading: string; body: string };
  footer: { rights: string; privacy: string; terms: string };
};

const en: CentreLicenceCopy = {
  eyebrow: 'For centre owners · Ages 4–8 · Level 1 Foundation',
  title: 'A full school year of thinking-English for ages 4–\u20608, Monday-ready.',
  lead:
    'The Jurassic English Level 1 Centre Licence gives your campus 40 lessons scripted minute by minute, teacher training and three original storybooks no other centre has. A new teacher can run it next week.',
  cta: 'Message Mr. Jay on Zalo',
  ctaNote: 'Mr. Jay replies personally and can walk you through a full lesson on your phone.',
  why: {
    heading: 'Why centres choose it',
    items: [
      {
        title: '40 lessons scripted minute by minute',
        body: 'Every lesson gives the teacher their lines, the timings, support for different learners and a simple rubric. Nobody at your centre has to write curriculum.',
      },
      {
        title: 'A new teacher can run it within a week',
        body: 'The Teacher Implementation Manual, the Teacher Training Manual and the training slides prepare a teacher who is new to the course. When a teacher leaves, the next one picks up the same plan, so turnover stops costing you a term.',
      },
      {
        title: 'Thinking-English parents can see',
        body: 'Original Jurassic English storybooks with read-aloud, activity books and printables, and the “I think … because …” thinking routine that shows in children’s work.',
      },
    ],
  },
  inside: {
    heading: 'What’s inside the licence',
    items: [
      'Teacher Implementation Manual',
      'Level 1 curriculum overview for the full year',
      '40 lesson plans, scripted minute by minute (38 story lessons and 2 review lessons)',
      'Teacher Training Manual and training slides',
      'A sample unit with student and teacher handbooks, built on our original story The Lantern With Two Handles',
      'The 3 original Level 1 storybooks, each with read-aloud, an activity book and student and teacher print editions',
    ],
    note: 'Your copy carries your centre’s name: every PDF reads “Licensed to [your centre], [campus]”.',
  },
  lesson: {
    heading: 'Inside one lesson: an excerpt from Lesson 09',
    intro:
      'Lesson 09, “Excavation”, is a 40-minute lesson. This is how it is written for the teacher. Story-specific lines are left out of this preview; the full lesson is in the licence.',
    meta: 'Ages 4–8 · Pre-A1 → A1 · 40 minutes',
    scriptLabel: 'The teacher says',
    phases: [
      {
        time: '0–5 min',
        name: 'Regulation before reasoning',
        detail: 'The Butterfly Hug.',
        script:
          '“Before we open the book, we must get our brains and bodies into the Green Zone. Cross your arms over your chest. Hook your thumbs together. Now, tap left, right, left, right. Close your eyes and breathe quietly for 60 seconds.”',
      },
      {
        time: '5–15 min',
        name: 'The dig site: active reading',
        detail: 'Read aloud slowly. Do not stop to explain grammar.',
        script:
          '“Today, we are hunting for new Word Fossils: words that tell us how the characters feel inside their bodies and hearts. Listen closely. When you hear a feeling word, place your hand over your heart.”',
      },
      {
        time: '15–30 min',
        name: 'Excavation: the Word Fossil hunt',
        detail: 'Children share a feeling word. The teacher marks it and builds the Word Wall.',
        script: '“You found a fossil. ‘Happy’ is a feeling we heard many times. Let’s put that on our Word Wall.”',
      },
      {
        time: '30–35 min',
        name: 'Connecting words to pictures',
        detail: 'Children match a Word Fossil to an emotion card or a picture from the story.',
      },
      {
        time: '35–40 min',
        name: 'Closure',
        detail: 'A short reflection, a review of the new Word Wall and a preview of the next lesson.',
      },
    ],
    tiersHeading: 'Every lesson plans for three levels',
    tiers: [
      { title: 'Support', body: 'Picture cards on the desk: a child holds up the feeling they noticed instead of recalling the word.' },
      { title: 'Core', body: 'A spoken claim with evidence: pointing at the picture and saying the feeling, for example “He is tired.”' },
      { title: 'Extension', body: '“Can you find two feelings on our Word Wall that are opposites?”' },
    ],
    notes: [
      'Neuroinclusive notes in every lesson: for example, a small smooth stone to hold during reading, and the teacher models first so no anxious child is cold-called.',
      'A four-level rubric for each objective: Emerging, Developing, Proficient and Mastery.',
    ],
  },
  books: {
    heading: 'Three original storybooks, included',
    intro: 'Written for Jurassic English, with original art. Children hear each story read aloud, then work through its activity book.',
    items: [
      {
        id: 'mina-and-the-midnight-drum',
        title: 'Mina and the Midnight Drum',
        theme: 'Feelings, needs and thoughtful choices',
        alt: 'Mina and Sami smile beside a large golden drum at a night festival, with paper lanterns and the moon behind them.',
      },
      {
        id: 'the-lantern-with-two-handles',
        title: 'The Lantern With Two Handles',
        theme: 'Care, sharing and asking for help',
        alt: 'Nuri and Bo walk together at night, each holding one handle of a glowing yellow lantern, with Grandad behind them.',
      },
      {
        id: 'lina-and-the-orchard-map',
        title: 'Lina and the Orchard Map',
        theme: 'Curiosity, care and helping things grow',
        alt: 'Lina holds a little map with a red apple on it at the start of a sunny orchard path, with a blue bird beside her.',
      },
    ],
  },
  terms: {
    heading: 'Licence terms',
    items: [
      'One campus, one school year, every teacher at that campus.',
      'For use inside your campus only: no resale, sharing or uploading elsewhere.',
      'Shared to your centre’s named Gmail accounts.',
      'Every PDF footer reads “Licensed to [your centre], [campus], [school year]”.',
      'Lessons 1–40 use 10 widely available picture books, which your centre provides. The storybooks and the sample unit are Jurassic English originals.',
    ],
  },
  price: {
    heading: 'Founding licence',
    unit: 'per campus, per school year',
    onRequest: 'Price on request',
    note: 'A founding licence for the first centres. Payment is by bank transfer (VietQR), in full, before access.',
  },
  steps: {
    heading: 'How it works',
    items: [
      { title: '1. Message Mr. Jay on Zalo', body: 'He shows you a full lesson and the sample unit on your phone.' },
      { title: '2. Written order summary', body: 'You receive the terms and an order reference. Reply “I accept” when you are ready.' },
      { title: '3. Pay by bank transfer', body: 'VietQR, with the order reference, before access.' },
      { title: '4. Your copy within 24 hours', body: 'Shared to your named Gmail accounts, with the storybook links. Mr. Jay checks in after one week.' },
    ],
  },
  faq: {
    heading: 'Questions from centre owners',
    items: [
      {
        q: 'Do we need to buy any books?',
        a: 'Lessons 1–40 use 10 widely available picture books, which your centre provides. The three storybooks and the sample unit are Jurassic English originals and come with the licence.',
      },
      {
        q: 'Can a teacher who is new to the course teach it?',
        a: 'Yes. Every lesson is scripted minute by minute, with the teacher’s lines, and the Teacher Implementation Manual, Training Manual and slides prepare a new teacher within a week.',
      },
      {
        q: 'Who can use one licence?',
        a: 'Every teacher and class at one campus, for one school year. Each extra campus needs its own licence.',
      },
      {
        q: 'How do we pay and receive the files?',
        a: 'Mr. Jay sends a written order summary on Zalo. After you reply “I accept”, you pay by bank transfer (VietQR) with the order reference. Within 24 hours, a copy of the pack is shared to your centre’s named Gmail accounts. No files are sent before payment.',
      },
      {
        q: 'Can we see more before we decide?',
        a: 'Yes. Message Mr. Jay on Zalo and he will show you a full lesson and the sample unit on your phone.',
      },
    ],
  },
  closing: {
    heading: 'Want to see a full lesson first?',
    body: 'Mr. Jay will walk you through it on your phone. Nothing is sent or charged until you accept a written order summary.',
  },
  footer: {
    rights: '© 2026 World Wise Learning. Jurassic English™ is a trademark of World Wise Learning.',
    privacy: 'Privacy',
    terms: 'Terms',
  },
};

// Machine-drafted (27 Oct 2026). Needs a native read before the page is shared.
const vi: CentreLicenceCopy = {
  eyebrow: 'Dành cho chủ trung tâm · Bé 4–8 tuổi · Level 1 Foundation',
  title: 'Trọn một năm “tiếng Anh tư duy” cho bé 4–\u20608 tuổi — giáo viên mới dạy được ngay từ thứ Hai.',
  lead:
    'Giấy phép Trung tâm Level 1 của Jurassic English mang đến cho cơ sở của bạn 40 giáo án soạn sẵn từng phút, tài liệu đào tạo giáo viên và ba truyện tranh gốc mà không trung tâm nào khác có. Giáo viên mới có thể dạy ngay tuần sau.',
  cta: 'Nhắn thầy Jay qua Zalo',
  ctaNote: 'Thầy Jay trả lời trực tiếp và có thể cho bạn xem trọn một bài học ngay trên điện thoại.',
  why: {
    heading: 'Vì sao trung tâm chọn chương trình này',
    items: [
      {
        title: '40 giáo án soạn sẵn từng phút',
        body: 'Mỗi bài có sẵn lời của giáo viên, thời gian từng phần, cách hỗ trợ từng nhóm học sinh và một thang đánh giá đơn giản. Trung tâm không cần tự soạn chương trình.',
      },
      {
        title: 'Giáo viên mới dạy được trong vòng một tuần',
        body: 'Sổ tay triển khai, Sổ tay đào tạo giáo viên và slide đào tạo giúp giáo viên mới làm quen với chương trình. Khi một giáo viên nghỉ, người tiếp theo dạy tiếp đúng kế hoạch đó, nên trung tâm không mất cả một học kỳ.',
      },
      {
        title: '“Tiếng Anh tư duy” phụ huynh nhìn thấy được',
        body: 'Truyện tranh gốc của Jurassic English kèm đọc mẫu, sách hoạt động và tài liệu in, cùng thói quen tư duy “I think … because …” thể hiện qua bài làm của bé.',
      },
    ],
  },
  inside: {
    heading: 'Giấy phép gồm những gì',
    items: [
      'Sổ tay triển khai cho giáo viên (Teacher Implementation Manual)',
      'Tổng quan chương trình Level 1 cho cả năm học',
      '40 giáo án soạn sẵn từng phút (38 bài theo truyện và 2 bài ôn tập)',
      'Sổ tay đào tạo giáo viên và slide đào tạo',
      'Một đơn vị bài học mẫu, có sổ tay cho học sinh và giáo viên, xây dựng trên truyện gốc The Lantern With Two Handles',
      '3 truyện tranh gốc Level 1, mỗi truyện có đọc mẫu, sách hoạt động và bản in cho học sinh và giáo viên',
    ],
    note: 'Bản của bạn mang tên trung tâm: mỗi tệp PDF đều ghi “Licensed to [trung tâm], [cơ sở]”.',
  },
  lesson: {
    heading: 'Bên trong một bài học: trích từ Bài 09',
    intro:
      'Bài 09, “Excavation” (Khai quật), dài 40 phút. Đây là cách bài được viết cho giáo viên. Những câu gắn với nội dung truyện cụ thể đã được lược bỏ trong bản xem trước này; bài đầy đủ có trong giấy phép.',
    meta: 'Bé 4–8 tuổi · Pre-A1 → A1 · 40 phút',
    scriptLabel: 'Lời giáo viên (tiếng Anh, như trong giáo án)',
    phases: [
      {
        time: '0–5 phút',
        name: 'Ổn định trước khi tư duy',
        detail: 'Bài tập “Butterfly Hug” (cái ôm bươm bướm).',
        script:
          '“Before we open the book, we must get our brains and bodies into the Green Zone. Cross your arms over your chest. Hook your thumbs together. Now, tap left, right, left, right. Close your eyes and breathe quietly for 60 seconds.”',
      },
      {
        time: '5–15 phút',
        name: 'Công trường: đọc chủ động',
        detail: 'Đọc to, chậm rãi. Không dừng lại để giải thích ngữ pháp.',
        script:
          '“Today, we are hunting for new Word Fossils: words that tell us how the characters feel inside their bodies and hearts. Listen closely. When you hear a feeling word, place your hand over your heart.”',
      },
      {
        time: '15–30 phút',
        name: 'Khai quật: săn “Word Fossil”',
        detail: 'Các bé nói một từ chỉ cảm xúc; giáo viên ghi nhận và đưa từ lên Bức tường từ vựng.',
        script: '“You found a fossil. ‘Happy’ is a feeling we heard many times. Let’s put that on our Word Wall.”',
      },
      {
        time: '30–35 phút',
        name: 'Nối từ với hình ảnh',
        detail: 'Các bé chọn “Word Fossil” khớp với thẻ cảm xúc hoặc một hình trong truyện.',
      },
      {
        time: '35–40 phút',
        name: 'Kết thúc bài',
        detail: 'Một phút suy ngẫm ngắn, ôn lại Bức tường từ vựng mới và giới thiệu bài tiếp theo.',
      },
    ],
    tiersHeading: 'Mỗi bài đều có ba mức',
    tiers: [
      { title: 'Hỗ trợ', body: 'Thẻ hình đặt trên bàn: bé giơ thẻ cảm xúc mình nhận ra thay vì phải nhớ từ.' },
      { title: 'Cơ bản', body: 'Nói một nhận định kèm bằng chứng: chỉ vào hình và nói cảm xúc, ví dụ “He is tired.”' },
      { title: 'Nâng cao', body: '“Can you find two feelings on our Word Wall that are opposites?” (Con có tìm được hai cảm xúc trái ngược nhau trên Bức tường từ vựng không?)' },
    ],
    notes: [
      'Ghi chú hỗ trợ học sinh đa dạng thần kinh trong mỗi bài: ví dụ một viên đá nhỏ để cầm khi nghe đọc, và giáo viên làm mẫu trước để không bé nhút nhát nào bị gọi bất ngờ.',
      'Thang đánh giá bốn mức cho từng mục tiêu: Emerging, Developing, Proficient và Mastery.',
    ],
  },
  books: {
    heading: 'Ba truyện tranh gốc, đi kèm giấy phép',
    intro: 'Viết riêng cho Jurassic English, với tranh minh họa gốc. Bé nghe đọc mẫu từng truyện, rồi làm sách hoạt động đi kèm.',
    items: [
      {
        id: 'mina-and-the-midnight-drum',
        title: 'Mina and the Midnight Drum',
        theme: 'Cảm xúc, nhu cầu và những lựa chọn chín chắn',
        alt: 'Mina và Sami mỉm cười bên chiếc trống vàng lớn trong lễ hội đêm, phía sau là đèn lồng giấy và mặt trăng.',
      },
      {
        id: 'the-lantern-with-two-handles',
        title: 'The Lantern With Two Handles',
        theme: 'Quan tâm, chia sẻ và biết nhờ giúp đỡ',
        alt: 'Nuri và Bo đi cùng nhau trong đêm, mỗi bạn cầm một quai của chiếc đèn lồng vàng, ông đi phía sau.',
      },
      {
        id: 'lina-and-the-orchard-map',
        title: 'Lina and the Orchard Map',
        theme: 'Tò mò, quan tâm và giúp mọi thứ lớn lên',
        alt: 'Lina cầm tấm bản đồ nhỏ có hình quả táo đỏ ở đầu con đường vườn cây đầy nắng, bên cạnh là một chú chim xanh.',
      },
    ],
  },
  terms: {
    heading: 'Điều khoản giấy phép',
    items: [
      'Một cơ sở, một năm học, tất cả giáo viên của cơ sở đó.',
      'Chỉ dùng trong cơ sở của bạn: không bán lại, chia sẻ hay tải lên nơi khác.',
      'Chia sẻ tới các tài khoản Gmail có tên của trung tâm.',
      'Chân trang mỗi tệp PDF ghi “Licensed to [trung tâm], [cơ sở], [năm học]”.',
      'Bài 1–40 dùng 10 cuốn truyện tranh phổ biến, trung tâm tự chuẩn bị. Truyện tranh và đơn vị bài mẫu là bản gốc của Jurassic English.',
    ],
  },
  price: {
    heading: 'Giấy phép sáng lập',
    unit: 'mỗi cơ sở, mỗi năm học',
    onRequest: 'Giá: liên hệ',
    note: 'Giấy phép sáng lập dành cho những trung tâm đầu tiên. Thanh toán toàn bộ bằng chuyển khoản (VietQR) trước khi nhận tài liệu.',
  },
  steps: {
    heading: 'Cách thức',
    items: [
      { title: '1. Nhắn thầy Jay qua Zalo', body: 'Thầy cho bạn xem trọn một bài học và đơn vị bài mẫu ngay trên điện thoại.' },
      { title: '2. Bản tóm tắt đơn hàng', body: 'Bạn nhận điều khoản và mã đơn hàng. Khi sẵn sàng, trả lời “Đồng ý”.' },
      { title: '3. Chuyển khoản', body: 'Qua VietQR, ghi mã đơn hàng, trước khi nhận tài liệu.' },
      { title: '4. Nhận bản của bạn trong 24 giờ', body: 'Chia sẻ tới các Gmail có tên của trung tâm, kèm đường dẫn truyện. Sau một tuần, thầy Jay hỏi thăm tình hình.' },
    ],
  },
  faq: {
    heading: 'Câu hỏi của chủ trung tâm',
    items: [
      {
        q: 'Trung tâm có cần mua sách không?',
        a: 'Bài 1–40 dùng 10 cuốn truyện tranh phổ biến, trung tâm tự chuẩn bị. Ba truyện tranh và đơn vị bài mẫu là bản gốc của Jurassic English, đi kèm giấy phép.',
      },
      {
        q: 'Giáo viên mới với chương trình có dạy được không?',
        a: 'Được. Mỗi bài được soạn sẵn từng phút kèm lời của giáo viên; Sổ tay triển khai, Sổ tay đào tạo và slide giúp giáo viên mới chuẩn bị trong vòng một tuần.',
      },
      {
        q: 'Một giấy phép dùng cho ai?',
        a: 'Tất cả giáo viên và lớp học tại một cơ sở, trong một năm học. Mỗi cơ sở thêm cần một giấy phép riêng.',
      },
      {
        q: 'Thanh toán và nhận tài liệu thế nào?',
        a: 'Thầy Jay gửi bản tóm tắt đơn hàng qua Zalo. Sau khi bạn trả lời “Đồng ý”, bạn chuyển khoản qua VietQR kèm mã đơn hàng. Trong vòng 24 giờ, bản sao bộ tài liệu được chia sẻ tới các Gmail có tên của trung tâm. Không gửi tệp nào trước khi thanh toán.',
      },
      {
        q: 'Có thể xem thêm trước khi quyết định không?',
        a: 'Có. Nhắn thầy Jay qua Zalo, thầy sẽ cho bạn xem trọn một bài học và đơn vị bài mẫu ngay trên điện thoại.',
      },
    ],
  },
  closing: {
    heading: 'Muốn xem trọn một bài học trước?',
    body: 'Thầy Jay sẽ hướng dẫn bạn ngay trên điện thoại. Không gửi tài liệu hay thu tiền cho đến khi bạn đồng ý bản tóm tắt đơn hàng bằng văn bản.',
  },
  footer: {
    rights: '© 2026 World Wise Learning. Jurassic English™ là nhãn hiệu của World Wise Learning.',
    privacy: 'Quyền riêng tư',
    terms: 'Điều khoản',
  },
};

export const centreLicenceContent: Record<Locale, CentreLicenceCopy> = { en, vi };

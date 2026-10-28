/**
 * /story-club — "Story Club with Mr. Jay": a small weekly story group for ages 5–8.
 *
 * PRICE AND SCHEDULE ARE A PROPOSAL (26 Oct 2026) — Jay approves both before this merges.
 * Payment is by bank transfer (VietQR) after a written order summary on Zalo; there is no
 * online checkout for this offer yet. Policies restate the site's existing rules (under-18
 * sessions are never recorded; Google Meet; GMT+7).
 */
import type { Locale } from '../locales';

export const STORY_CLUB_ZALO = '/go/zalo/story-club';
// The Student Academy story collections (W-1, Jay 27 Oct 2026): a quiet link under the price for parents who
// want to try a free story first. It opens the Level 1 collection, not the book app directly. The tag sits before the
// #anchor so it reaches analytics.
export const STORY_CLUB_FREE_STORIES: Record<Locale, string> = {
  en: '/student-academy/stories?utm_source=storyclub#level-1',
  vi: '/vi/student-academy/stories?utm_source=storyclub#level-1',
};

type Step = { title: string; body: string };
type Faq = { q: string; a: string };

type StoryClubCopy = {
  eyebrow: string;
  title: string;
  lead: string;
  price: { amount: string; unit: string; note: string; seats: string; tryFree: string };
  week: { heading: string; steps: Step[] };
  parents: { heading: string; items: string[] };
  forWho: { heading: string; yes: string[]; no: string[]; yesLabel: string; noLabel: string; link: string };
  older: { heading: string; body: string; oneToOne: string; ask: string };
  join: { heading: string; steps: Step[]; cta: string; ctaNote: string };
  faq: { heading: string; items: Faq[] };
  closing: { heading: string; body: string; cta: string };
};

const en: StoryClubCopy = {
  eyebrow: 'Ages 5–8 · Small group · Online',
  title: 'Story Club with Mr. Jay',
  lead:
    'Once a week, a small group of children meets Mr. Jay on Google Meet for an original Jurassic English story. In between, your child sends one small piece of work, a drawing, a sentence or a short voice note, and Mr. Jay replies personally.',
  price: {
    amount: '590.000₫',
    unit: 'for 4 weeks',
    note: 'Founding price for the first group. Paid by bank transfer (VietQR) after you receive a written summary on Zalo.',
    seats: 'Up to 6 children per group',
    tryFree: 'Try a free story first',
  },
  week: {
    heading: 'How one week works',
    steps: [
      { title: '1. Live story time (30 minutes)', body: 'Mr. Jay reads an original Jurassic English story on screen, with pictures, and the children answer questions about what happens and why.' },
      { title: '2. One small task at home', body: 'A drawing, one or two sentences, or a short voice note about the story. Ten minutes is enough.' },
      { title: '3. Personal reply from Mr. Jay', body: 'Your child gets a short written or voice reply on Zalo: one thing they did well and one thing to try next time.' },
    ],
  },
  parents: {
    heading: 'What parents get',
    items: [
      'A clear weekly rhythm your child looks forward to',
      'Mr. Jay’s reply to your child’s own work, every week',
      'A short note at the end of the 4 weeks on what your child can now do with stories',
      'Live sessions are never recorded, for child-safety reasons',
    ],
  },
  forWho: {
    heading: 'Is it right for your child?',
    yesLabel: 'A good fit if your child…',
    yes: [
      'is 5–8 years old and enjoys stories or pictures',
      'knows some English words and can follow simple instructions',
      'can join a 30-minute video call with a grown-up nearby',
    ],
    noLabel: 'Probably not the right fit if…',
    no: [
      'you are looking for exam preparation or a promised result',
      'your child needs one-to-one lessons (see our 1-to-1 options instead)',
      'you need lessons recorded',
    ],
    link: 'See the 1-to-1 options',
  },
  older: {
    heading: 'Older child, or Levels 3–5?',
    body: 'Story Club is for ages 5–8. For older children or Levels 3–5, Mr. Jay will confirm a suitable option before you pay.',
    oneToOne: 'See 1-to-1 lessons',
    ask: 'Ask about a place',
  },
  join: {
    heading: 'How to join',
    steps: [
      { title: '1. Message Mr. Jay on Zalo', body: 'Tell us your child’s age and how much English they use now.' },
      { title: '2. Get a written summary', body: 'You receive the dates, the time, the price and the rules in writing before you pay.' },
      { title: '3. Pay and get your place', body: 'Pay by bank transfer with the VietQR code in the summary. Your child’s place is confirmed when the payment arrives.' },
    ],
    cta: 'Message Mr. Jay on Zalo',
    ctaNote: 'Zalo / phone: +84 396 085 076',
  },
  faq: {
    heading: 'Questions parents ask',
    items: [
      { q: 'What if my child misses a session?', a: 'The story and the task are sent on Zalo the same day, so your child can still do the task and get a reply.' },
      { q: 'Does my child need to speak English well?', a: 'No. Some words and simple sentences are enough. Mr. Jay keeps the language simple and uses pictures.' },
      { q: 'Is this the same as a 1-to-1 lesson?', a: 'No. Story Club is a small group with a personal reply each week. For a full lesson with only your child, see the 1-to-1 options.' },
      { q: 'How do I pay?', a: 'By bank transfer with VietQR, after you have the written summary. There is no card payment for Story Club.' },
    ],
  },
  closing: {
    heading: 'Places are limited to 6 children per group.',
    body: 'Message Mr. Jay with your child’s age to ask for a place.',
    cta: 'Ask for a place on Zalo',
  },
};

const vi: StoryClubCopy = {
  eyebrow: '5–8 tuổi · Nhóm nhỏ · Trực tuyến',
  title: 'Câu lạc bộ Truyện cùng thầy Jay',
  lead:
    'Mỗi tuần một lần, một nhóm nhỏ các con gặp thầy Jay qua Google Meet để cùng đọc một câu chuyện do Jurassic English sáng tác. Giữa các buổi, con gửi một bài nhỏ, có thể là một bức tranh, một câu văn hay một đoạn ghi âm ngắn, và thầy Jay phản hồi riêng cho con.',
  price: {
    amount: '590.000₫',
    unit: 'cho 4 tuần',
    note: 'Giá ưu đãi cho nhóm đầu tiên. Thanh toán bằng chuyển khoản (VietQR) sau khi bạn nhận bản tóm tắt bằng văn bản qua Zalo.',
    seats: 'Tối đa 6 bạn nhỏ mỗi nhóm',
    tryFree: 'Đọc thử một truyện miễn phí trước',
  },
  week: {
    heading: 'Một tuần diễn ra như thế nào',
    steps: [
      { title: '1. Giờ kể chuyện trực tiếp (30 phút)', body: 'Thầy Jay đọc một câu chuyện của Jurassic English trên màn hình, có tranh minh hoạ, và các con trả lời câu hỏi về điều gì xảy ra và vì sao.' },
      { title: '2. Một bài nhỏ ở nhà', body: 'Một bức tranh, một hai câu văn, hoặc một đoạn ghi âm ngắn về câu chuyện. Chỉ cần khoảng mười phút.' },
      { title: '3. Phản hồi riêng từ thầy Jay', body: 'Con nhận phản hồi ngắn bằng chữ hoặc giọng nói qua Zalo: một điều con làm tốt và một điều nên thử ở lần sau.' },
    ],
  },
  parents: {
    heading: 'Phụ huynh nhận được gì',
    items: [
      'Một nhịp học đều đặn mỗi tuần mà con mong chờ',
      'Phản hồi của thầy Jay cho chính bài làm của con, mỗi tuần',
      'Một nhận xét ngắn sau 4 tuần về những gì con đã làm được với câu chuyện',
      'Các buổi học trực tiếp không bao giờ được ghi âm, ghi hình, vì lý do an toàn cho trẻ',
    ],
  },
  forWho: {
    heading: 'Câu lạc bộ có phù hợp với con?',
    yesLabel: 'Phù hợp nếu con…',
    yes: [
      '5–8 tuổi và thích truyện hoặc tranh ảnh',
      'biết một số từ tiếng Anh và làm theo được hướng dẫn đơn giản',
      'tham gia được cuộc gọi video 30 phút, có người lớn ở gần',
    ],
    noLabel: 'Có thể chưa phù hợp nếu…',
    no: [
      'bạn đang tìm khoá luyện thi hoặc muốn được hứa trước kết quả',
      'con cần học 1 kèm 1 (hãy xem các lựa chọn học 1 kèm 1)',
      'bạn cần bản ghi âm, ghi hình buổi học',
    ],
    link: 'Xem các lựa chọn học 1 kèm 1',
  },
  older: {
    heading: 'Con lớn hơn, hoặc ở Cấp độ 3–5?',
    body: 'Câu lạc bộ Truyện dành cho bé 5–8 tuổi. Với các con lớn hơn hoặc ở Cấp độ 3–5, thầy Jay sẽ xác nhận lựa chọn phù hợp trước khi bạn thanh toán.',
    oneToOne: 'Xem học 1 kèm 1',
    ask: 'Hỏi về một chỗ',
  },
  join: {
    heading: 'Cách đăng ký',
    steps: [
      { title: '1. Nhắn tin cho thầy Jay qua Zalo', body: 'Cho chúng tôi biết tuổi của con và con đang dùng tiếng Anh ở mức nào.' },
      { title: '2. Nhận bản tóm tắt bằng văn bản', body: 'Bạn nhận lịch học, giờ học, học phí và quy định bằng văn bản trước khi thanh toán.' },
      { title: '3. Thanh toán và giữ chỗ', body: 'Chuyển khoản bằng mã VietQR trong bản tóm tắt. Chỗ của con được xác nhận khi nhận được thanh toán.' },
    ],
    cta: 'Nhắn tin cho thầy Jay qua Zalo',
    ctaNote: 'Zalo / điện thoại: +84 396 085 076',
  },
  faq: {
    heading: 'Câu hỏi phụ huynh thường hỏi',
    items: [
      { q: 'Nếu con vắng một buổi thì sao?', a: 'Câu chuyện và bài nhỏ được gửi qua Zalo ngay trong ngày, nên con vẫn làm bài và nhận phản hồi.' },
      { q: 'Con có cần nói tiếng Anh giỏi không?', a: 'Không. Biết một số từ và câu đơn giản là đủ. Thầy Jay dùng ngôn ngữ đơn giản và nhiều tranh minh hoạ.' },
      { q: 'Câu lạc bộ có giống học 1 kèm 1 không?', a: 'Không. Câu lạc bộ là nhóm nhỏ, mỗi tuần con có phản hồi riêng. Nếu muốn buổi học chỉ riêng con, hãy xem các lựa chọn học 1 kèm 1.' },
      { q: 'Thanh toán như thế nào?', a: 'Chuyển khoản bằng VietQR, sau khi bạn nhận bản tóm tắt bằng văn bản. Câu lạc bộ không nhận thanh toán bằng thẻ.' },
    ],
  },
  closing: {
    heading: 'Mỗi nhóm chỉ có tối đa 6 bạn nhỏ.',
    body: 'Nhắn tin cho thầy Jay kèm tuổi của con để đăng ký giữ chỗ.',
    cta: 'Đăng ký giữ chỗ qua Zalo',
  },
};

export const storyClubContent: Record<Locale, StoryClubCopy> = { en, vi };

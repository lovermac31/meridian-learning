/**
 * /story-club — "Story Club with Mr. Jay": a small weekly story group for ages 5–8.
 *
 * 4 Nov 2026 (Jay, final): the page leads with a FREE 30-minute Story Time for new families (postponed, new date to be announced) and
 * registration on Zalo; the paid round (4 weeks, 590.000₫, from Sat 21 Nov) comes after, with the refund rule stated.
 * The try-it and refund facts are shared with /story-club/reserve in storyClubTryIt.ts. Payment is by bank transfer
 * (VietQR) on the reserve page, after its written summary. Policies restate the site's existing rules (under-18 sessions
 * are never recorded; Google Meet; GMT+7). The Vietnamese is AI-written and awaits Jay's read.
 */
import type { Locale } from '../locales';
import { storyClubOfferLine, storyClubScheduleLine } from '../../config/storyClubOffer';

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
  price: { heading: string; amount: string; unit: string; note: string; seats: string; schedule: string; starts: string; tryFree: string };
  week: { heading: string; steps: Step[] };
  parents: { heading: string; items: string[] };
  forWho: { heading: string; yes: string[]; no: string[]; yesLabel: string; noLabel: string; link: string };
  older: { heading: string; body: string; oneToOne: string; ask: string };
  join: { heading: string; steps: Step[]; cta: string; ctaNote: string; registerCta: string };
  faq: { heading: string; items: Faq[] };
  closing: { heading: string; body: string; cta: string };
};

const en: StoryClubCopy = {
  eyebrow: 'Ages 5–8 · Small group · Online',
  title: 'Story Club with Mr. Jay',
  lead:
    'Try a free 30-minute Story Time first, on Google Meet, for new families. The date is postponed and will be announced soon. Then, if you like it, a small group of children meets Mr. Jay once a week for an original Jurassic English story, and Mr. Jay replies personally to one small piece of work from your child. Paid sessions run on Saturdays at 13:00 Vietnam time (dates and prices below); you can also ask Mr. Jay on Zalo first.',
  price: {
    heading: 'The paid round',
    amount: '590.000₫',
    unit: 'for 4 weeks',
    note: 'Pay by bank transfer (VietQR) on the reserve page, after you have read the written summary there.',
    seats: 'Up to 6 children per group',
    // Funnel audit fix 6 (2 Nov 2026): the day, time, length, place and the no-recording rule, from the product data.
    schedule: 'Saturdays at 13:00 Vietnam time · 30 minutes on Google Meet · never recorded',
    starts: `${storyClubScheduleLine('en')} ${storyClubOfferLine('en')}`,
    tryFree: 'Or read a free story at home first',
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
      { title: '1. Register for the free Story Time on Zalo', body: 'Message Mr. Jay on Zalo with your child’s age and you will hear the new date first. The free try-it is postponed because Mr. Jay is unwell, and we send the Google Meet link to registered parents on the morning of the session.' },
      { title: '2. Try it with your child', body: 'A parent sits beside the child for 30 minutes. Nothing is recorded and nothing is paid.' },
      { title: '3. Decide, then reserve', body: 'If you want the paid 4-week round, the reserve page shows the written summary first, then the VietQR code. Full refund on request before the first paid session, within 24 hours of paying.' },
    ],
    cta: 'Message Mr. Jay on Zalo',
    ctaNote: 'Zalo / phone: +84 396 085 076',
    registerCta: 'Register for the free Story Time on Zalo',
  },
  faq: {
    heading: 'Questions parents ask',
    items: [
      { q: 'What if my child misses a session?', a: 'The story and the task are sent on Zalo the same day, so your child can still do the task and get a reply.' },
      { q: 'Does my child need to speak English well?', a: 'No. Some words and simple sentences are enough. Mr. Jay keeps the language simple and uses pictures.' },
      { q: 'Is this the same as a 1-to-1 lesson?', a: 'No. Story Club is a small group with a personal reply each week. For a full lesson with only your child, see the 1-to-1 options.' },
      { q: 'Is Story Club free to try?', a: 'The free Story Time (new date coming soon) is free for new families: 30 minutes on Google Meet, with a parent beside the child. The paid round is separate: it meets on Saturdays at 13:00 Vietnam time (dates and prices are above).' },
      { q: 'What if fewer than 2 children register?', a: 'Then the try-it waits until enough children have registered. We message every registered parent on Zalo.' },
      { q: 'Can I get my money back?', a: 'Yes. You can ask for a full refund before the first paid session, within 24 hours of paying. If Mr. Jay cancels a session, we make it up or return a quarter of what you paid for that session.' },
      { q: 'How do I pay?', a: 'By bank transfer with VietQR on the reserve page, after the written summary there. There is no card payment for Story Club.' },
    ],
  },
  closing: {
    heading: 'Places are limited to 6 children per group.',
    body: 'Message Mr. Jay on Zalo to hear the new date of the free Story Time first. We do not promise exam scores or results.',
    cta: 'Register for the free Story Time on Zalo',
  },
};

const vi: StoryClubCopy = {
  eyebrow: '5–8 tuổi · Nhóm nhỏ · Trực tuyến',
  title: 'Câu lạc bộ Truyện cùng thầy Jay',
  lead:
    'Hãy cho bé học thử giờ kể chuyện miễn phí 30 phút trước, qua Google Meet, dành cho gia đình mới. Buổi học thử tạm hoãn và sẽ báo ngày mới sớm. Sau đó, nếu bé thích, một nhóm nhỏ gặp thầy Jay mỗi tuần để cùng đọc một câu chuyện do Jurassic English sáng tác, và thầy Jay phản hồi riêng cho một bài nhỏ của bé. Các buổi có phí diễn ra vào thứ Bảy lúc 13:00 giờ Việt Nam (ngày và giá ở bên dưới); bạn cũng có thể hỏi thầy Jay qua Zalo trước.',
  price: {
    heading: 'Vòng học có phí',
    amount: '590.000₫',
    unit: 'cho 4 tuần',
    note: 'Thanh toán bằng chuyển khoản (VietQR) trên trang đặt chỗ, sau khi bạn đọc bản tóm tắt bằng văn bản ở đó.',
    seats: 'Tối đa 6 bạn nhỏ mỗi nhóm',
    schedule: 'Thứ Bảy lúc 13:00 giờ Việt Nam · 30 phút qua Google Meet · không bao giờ được ghi âm, ghi hình',
    starts: `${storyClubScheduleLine('vi')} ${storyClubOfferLine('vi')}`,
    tryFree: 'Hoặc đọc thử một truyện miễn phí ở nhà trước',
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
      { title: '1. Đăng ký giờ kể chuyện miễn phí qua Zalo', body: 'Nhắn thầy Jay qua Zalo kèm tuổi của bé để được báo ngày mới đầu tiên. Buổi học thử miễn phí tạm hoãn vì thầy Jay đang không khỏe, và chúng tôi gửi đường dẫn Google Meet cho phụ huynh đã đăng ký vào sáng ngày học.' },
      { title: '2. Cho bé học thử', body: 'Phụ huynh ngồi cạnh bé trong 30 phút. Không ghi âm, ghi hình và không mất phí.' },
      { title: '3. Quyết định, rồi đặt chỗ', body: 'Nếu muốn tham gia vòng học có phí 4 tuần, trang đặt chỗ hiển thị bản tóm tắt bằng văn bản trước, sau đó mới đến mã VietQR. Hoàn tiền đầy đủ nếu bạn yêu cầu trước buổi học có phí đầu tiên, trong vòng 24 giờ kể từ khi thanh toán.' },
    ],
    cta: 'Nhắn tin cho thầy Jay qua Zalo',
    ctaNote: 'Zalo / điện thoại: +84 396 085 076',
    registerCta: 'Đăng ký giờ kể chuyện miễn phí qua Zalo',
  },
  faq: {
    heading: 'Câu hỏi phụ huynh thường hỏi',
    items: [
      { q: 'Nếu con vắng một buổi thì sao?', a: 'Câu chuyện và bài nhỏ được gửi qua Zalo ngay trong ngày, nên con vẫn làm bài và nhận phản hồi.' },
      { q: 'Con có cần nói tiếng Anh giỏi không?', a: 'Không. Biết một số từ và câu đơn giản là đủ. Thầy Jay dùng ngôn ngữ đơn giản và nhiều tranh minh hoạ.' },
      { q: 'Câu lạc bộ có giống học 1 kèm 1 không?', a: 'Không. Câu lạc bộ là nhóm nhỏ, mỗi tuần con có phản hồi riêng. Nếu muốn buổi học chỉ riêng con, hãy xem các lựa chọn học 1 kèm 1.' },
      { q: 'Học thử có miễn phí không?', a: 'Giờ kể chuyện miễn phí (ngày mới sẽ báo sớm) dành cho gia đình mới: 30 phút qua Google Meet, có phụ huynh ngồi cạnh bé. Vòng học có phí là phần riêng: học vào thứ Bảy lúc 13:00 giờ Việt Nam (ngày và giá ở phía trên).' },
      { q: 'Nếu có ít hơn 2 bé đăng ký thì sao?', a: 'Khi đó buổi học thử sẽ chờ đến khi đủ bé đăng ký. Chúng tôi sẽ nhắn từng phụ huynh đã đăng ký qua Zalo.' },
      { q: 'Tôi có được hoàn tiền không?', a: 'Có. Bạn có thể yêu cầu hoàn tiền đầy đủ trước buổi học có phí đầu tiên, trong vòng 24 giờ kể từ khi thanh toán. Nếu thầy Jay hủy một buổi, buổi đó sẽ được học bù hoặc hoàn lại một phần tư số tiền bạn đã trả cho buổi đó.' },
      { q: 'Thanh toán như thế nào?', a: 'Chuyển khoản bằng VietQR trên trang đặt chỗ, sau bản tóm tắt bằng văn bản ở đó. Câu lạc bộ không nhận thanh toán bằng thẻ.' },
    ],
  },
  closing: {
    heading: 'Mỗi nhóm chỉ có tối đa 6 bạn nhỏ.',
    body: 'Nhắn thầy Jay qua Zalo để được báo ngày mới của giờ kể chuyện miễn phí. Chúng tôi không hứa trước điểm thi hay kết quả.',
    cta: 'Đăng ký giờ kể chuyện miễn phí qua Zalo',
  },
};

export const storyClubContent: Record<Locale, StoryClubCopy> = { en, vi };

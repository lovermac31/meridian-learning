/**
 * Human-centered overhaul (Oct 2026, revised post-audit spec) — copy for the
 * header, footer and 6-section homepage, EN + VI in one place so the two stay
 * in lockstep.
 *
 * Rules this copy follows (spec §0.1):
 * - Prices are the live VND prices, unchanged. USD figures are approximate,
 *   at the checkout rate 1 USD ≈ 25.897₫ (VND_PER_USD in src/lib/paypal.ts), rounded up.
 * - Under-18 sessions are never recorded; no recorded portfolios are promised.
 * - AI Speaking scope is stated beside the offer (typed mode live, no
 *   pronunciation; spoken mode limited beta; sample audio is synthetic).
 * - The Maya lesson comparison is an illustrative teaching example, badged.
 * - Images are illustrations; only Mr. Jay's portrait is a real photo.
 *
 * Vietnamese: machine-assisted translation, pending native-speaker review.
 */
import type { Locale } from '../locales';

export const STORY_QUEST_URL = 'https://worldwise-story-quest.vercel.app/#home';
export const WORLDWISE_URL = 'https://www.worldwiselearning.app/';
export const CONTACT_EMAIL = 'info@jurassicenglish.com';
export const ZALO_URL = 'https://zalo.me/84396085076';
export const IMG = '/images/overhaul';
export const UNDER_18_POLICY_EN = 'Sessions with learners under 18 are never recorded.';

const en = {
  nav: {
    items: [
      // Header symmetry (Oct 2026): short age labels on screen; `desc` names the door (accessible name + mobile drawer).
      { key: 'reading', label: 'Kids Academy (5–12)', desc: 'Reading & Story Adventures', href: '/student-academy', kind: 'route' },
      { key: 'speaking', label: 'Ages 9–18', desc: 'Speaking Confidence & Teen IELTS', href: '/young-learners-speaking/', kind: 'native' },
      { key: 'writing', label: 'IELTS Writing', desc: 'IELTS Writing Task 2: introduction & demo', href: '/ai-speaking/writing', kind: 'native' },
      { key: 'adults', label: 'AI Speaking Mocks', desc: 'Adult IELTS Speaking practice (18+)', href: '/ai-speaking', kind: 'native' },
      { key: 'jay', label: 'Pricing', desc: 'Mr. Jay, plans and pricing', href: '/#pricing-options', kind: 'native' },
    ],
    // Small badge after the IELTS Writing link (owner, Oct 2026).
    newBadge: 'New',
    cta: 'Book Baseline · 690k₫',
    ctaMobile: 'Baseline · 690k₫',
    ctaHref: '/ai-speaking/baseline',
  },
  footer: {
    navLabel: 'Footer',
    links: [
      { label: 'Reading & Story Adventures', href: '/student-academy' },
      { label: 'Story Club (ages 5–8)', href: '/story-club' },
      { label: 'Speaking & Teen IELTS', href: '/young-learners-speaking/' },
      { label: 'Adult IELTS Practice', href: '/ai-speaking' },
      { label: 'IELTS Coaching by Country', href: '/ielts-speaking-online' },
      { label: 'IELTS Band Score Calculator', href: '/tools/ielts-band-score-calculator' },
      { label: 'IELTS Writing Task 2 (Coming Soon)', href: '/ai-speaking/writing' },
      { label: 'Live Speaking Baseline', href: '/ai-speaking/baseline' },
      { label: 'Academic Framework', href: '/framework' },
      { label: 'Products', href: '/products' },
      { label: 'Privacy', href: '/legal/privacy' },
      { label: 'Terms', href: '/legal/terms' },
      { label: 'Contact', href: '/get-started' },
    ],
    // Crawlable entry points to the school & curriculum pages (SEO internal links, Oct 2026).
    schools: {
      label: 'For schools',
      links: [
        { label: 'Knowledge Hub', href: '/knowledge' },
        { label: 'Curriculum Series', href: '/series/compare' },
        { label: 'Thinking Cycle', href: '/thinking-cycle/compare' },
        { label: 'School Framework', href: '/school-framework' },
        { label: 'Digital Reasoning Engine', href: '/digital-reasoning-engine' },
        { label: 'For Companies', href: '/companies' },
      ],
    },
    legalLabel: 'Legal & privacy requests:',
    institutionalLead: 'Looking for university AI governance, Circular 54 readiness, or school curriculum licensing? Visit',
    institutionalName: 'WorldWise Learning',
    notice:
      'Jurassic English™ is an independent education provider operated by WorldWise Learning in Hanoi, Vietnam (info@jurassicenglish.com, Zalo/Phone +84 396 085 076) and is not affiliated with or endorsed by IELTS, IDP, the British Council, or Cambridge. Band figures are coaching estimates, never guaranteed official exam scores.',
  },
  home: {
    hero: {
      eyebrow: 'Story-led English, speaking confidence & IELTS · Hanoi & live online (GMT+3 to GMT+8)',
      title: 'English your child can use—not just memorise.',
      body: 'Story-led lessons that help children and teens explain ideas using details from real books, speak confidently out loud, and write clearly—plus evidence-based IELTS practice for older teens and adults.',
      primary: 'Explore Learning Paths',
      secondary: 'Try the Free 2-Min Story Quest Activity (Ages 6–12)',
      imageAlt: 'Storybook illustration: Professor Rex and young explorers gathered around an illustrated map of story worlds',
      artLabel: 'Illustration',
      rexAlt: 'Illustration of Professor Rex, the Jurassic English storybook guide',
    },
    paths: {
      heading: "Choose the path that fits your learner's goal",
      helper:
        'Not sure whether to start with Reading or Speaking for a 9–14 year old? Choose Path 1 (Reading & Story Adventures) if your child needs richer vocabulary, reading comprehension and structured paragraph writing. Choose Path 2 (Speaking Confidence & Teen IELTS) if your child already reads well on paper but hesitates to speak out loud.',
      bestFor: 'Best for',
      purpose: 'Clear purpose',
      cards: [
        {
          key: 'reading',
          label: 'Path 1',
          title: 'Reading & Story Adventures',
          bestFor: 'Ages 6–14, placed by readiness across Levels 1–5 (free Story Quest app for ages 6–12)',
          purpose: 'Enjoy real storybooks and learn to explain “why” using details from the text—out loud and in writing.',
          noteTitle: 'Guided by Professor Rex',
          note: 'Four illustrated Story Worlds:',
          worlds: ['Mistwood Harbor', 'Whispering Woods', 'Grand Archive', 'Cloudpeak Observatory'],
          primary: { label: 'Explore Student Academy', href: '/student-academy', kind: 'route' },
          secondary: { label: 'Try Free Story Quest', href: STORY_QUEST_URL, kind: 'external' },
        },
        {
          key: 'speaking',
          label: 'Path 2',
          title: 'Speaking Confidence & Teen IELTS',
          bestFor: 'Ages 9–18, grouped by stage: 9–11, 11–14 and 15–18',
          purpose: 'Help learners who are strong on paper speak more confidently out loud, and prepare for IELTS when appropriate.',
          noteTitle: 'Child-safety note',
          note: 'Live sessions with learners under 18 are never recorded; parents receive written teacher observation notes and priority plans.',
          worlds: [],
          primary: { label: 'Explore Speaking & Teen IELTS', href: '/young-learners-speaking/', kind: 'native' },
          secondary: { label: 'Book 15–20 Min Live Baseline (690.000₫)', href: '/ai-speaking/baseline', kind: 'native' },
        },
        {
          key: 'adults',
          label: 'Path 3',
          title: 'Adult IELTS Practice & Coaching',
          bestFor: 'Adults 18+: university applicants, graduates & professionals',
          purpose: 'Independent IELTS Speaking practice reports and optional 1-to-1 coaching with clear criterion feedback.',
          noteTitle: 'Product scope notice',
          note: 'Typed practice mode is live now and does not assess pronunciation; spoken audio mode is in limited beta. The sample audio on the AI Speaking page is a synthetic demonstration. The Live Speaking Baseline (690.000₫) is a separate, human-assessed Google Meet session.',
          worlds: [],
          primary: { label: 'Explore Adult IELTS Practice', href: '/ai-speaking', kind: 'native' },
          secondary: { label: 'See Credit Packs (from 79.000₫)', href: '/ai-speaking/pricing', kind: 'native' },
        },
      ],
    },
    lesson: {
      badge: 'Illustrative Teaching Example · How we teach students to explain an idea',
      heading: 'How we move learners from a one-line opinion to a supported explanation',
      excerptLabel: 'Short story excerpt (sample prompt)',
      excerpt:
        '“As the storm rose, Maya looked at her last dry flare. She could save it to signal the rescue boat for herself, or fire it now so the lost fishing crew could see the reef.”',
      questionLabel: 'Teacher question',
      question: '“Did Maya make a wise choice when she fired the flare for the crew? Explain your answer using a detail from the story.”',
      colBefore: 'Typical uncoached answer',
      colAfter: 'How we coach the answer (Point + Proof + Explain)',
      before: '“Yes, I think Maya made a good choice because she is very brave and kind to other people.”',
      steps: [
        { tag: '1. Point', hint: 'Your answer', text: '“I think Maya made the right choice...”' },
        { tag: '2. Proof', hint: 'Detail from the story', text: '“...because she fires her last dry flare to warn the lost fishing crew about the reef...”' },
        { tag: '3. Explain', hint: 'Why that detail matters', text: '“...which shows she values saving several lives right now over keeping a backup for herself.”' },
      ],
      stallTitle: 'Why it stalls',
      stall: 'It uses general adjectives (brave, kind) without pointing to what actually happened in the text.',
      progressTitle: 'How parents see progress, without recording under-18s',
      progress: "Teachers share your child's written paragraph drafts, Word Fossil vocabulary notes and spoken sentences noted live during the lesson, in a written parent update.",
    },
    jay: {
      eyebrow: 'Meet your teacher',
      title: 'Mr. Jay Adams — Founder & Lead Teacher',
      portraitAlt: 'Mr. Jay Adams, founder and lead teacher of Jurassic English (photo)',
      credentials: 'M.S. in IT Management, WGU · International PGCE, University of Warwick (completing 2026) · Advanced TEFL',
      intro:
        'Hi, I’m Mr. Jay. Over the past decade teaching in international classrooms in Asia and here in Hanoi, I kept meeting students who could pass grammar worksheets on paper, yet froze when asked to explain an opinion out loud or write a clear paragraph from scratch.',
      expectTitle: 'What you can expect when working with me:',
      expect: [
        { title: 'We start from your learner’s actual work.', body: 'Every placement or baseline begins with how your child (or you) actually reads, speaks or writes today.' },
        { title: 'One clear priority at a time.', body: 'Instead of twenty corrections at once, each session focuses on the single highest-impact habit to practise next.' },
        { title: 'Honest feedback and privacy-first teaching.', body: 'Band references are coaching estimates based on public descriptors, never guaranteed official exam scores—and live sessions with learners under 18 are never recorded.' },
      ],
    },
    pricing: {
      heading: 'Clear starting options & transparent pricing',
      disclosure:
        'All VietQR and online-checkout payments are billed in Vietnamese Đồng (VND ₫). Approximate US Dollar (~$) figures use 1 USD ≈ 25.897₫ for international reference; families outside Vietnam can also pay set US$ amounts by PayPal on the Speaking page. Live online sessions run across GMT+3 to GMT+8 (Hanoi is GMT+7).',
      entryLabel: 'Start here',
      ongoingLabel: 'Ongoing options & full commitment totals',
      rows: [
        {
          key: 'reading',
          title: '1. Reading & Story Adventures',
          ages: 'Ages 6–14',
          entry: [
            { name: 'Free Story Quest activity (ages 6–12)', price: '0₫', note: '' },
            { name: '45-min Reading & Thinking Placement Consultation', price: '', note: 'Request by email or Zalo: we review a short reading & writing sample and send a written Level 1–5 placement note.' },
          ],
          ongoing: [
            { name: 'Small-group & 1-to-1 Student Academy tuition', price: '', note: 'Placed by readiness (Levels 1–5) after your placement consultation.' },
          ],
          cta: { label: 'Request a Reading Placement Consultation', href: '/student-academy#diagnostic' },
        },
        {
          key: 'speaking',
          title: '2. Speaking Confidence & Teen IELTS',
          ages: 'Ages 9–18',
          entry: [
            { name: '15–20 min human-assessed Live Speaking Baseline (Google Meet)', price: '690.000₫ (~$27)', note: 'Written 4-criterion band estimate (fluency, vocabulary, grammar, pronunciation), overall band estimate and your #1 next lesson priority. Under-18 sessions are never recorded.' },
          ],
          ongoing: [
            { name: 'Small-Group Speaking Lab (ages 9–14, max 6, 6 weeks)', price: '2.900.000₫ total (~$112)', note: '' },
            { name: 'Self-Study Speaking Toolkit', price: '990.000₫ (~$39)', note: '' },
            { name: '1-to-1 coaching, 60 min · single lesson, pay as you go', price: '800.000₫ (~$31)', note: '' },
            { name: '8-lesson package · one payment, used within 35 days · 700.000₫/lesson', price: '5.600.000₫ total (~$217)', note: '' },
            { name: '6-month plan · 48 lessons · 625.000₫/lesson · schedule agreed in writing', price: '30.000.000₫ total (~$1,159)', note: '' },
            { name: 'Annual plan · 96 lessons · 575.000₫/lesson · schedule agreed in writing', price: '55.200.000₫ total (~$2,132)', note: '' },
          ],
          cta: { label: 'Book Live Speaking Baseline (690.000₫)', href: '/ai-speaking/baseline' },
        },
        {
          key: 'adults',
          title: '3. Adult IELTS AI Practice',
          ages: 'Ages 18+',
          entry: [
            { name: '1-credit Starter Practice Report', price: '79.000₫ · US$4 by PayPal', note: '1 Basic Practice Report quoting your response and naming your #1 priority fix. Typed mode is live now (does not assess pronunciation); spoken audio mode is in limited beta.' },
          ],
          ongoing: [
            { name: '3-credit Diagnostic Pack', price: '199.000₫ total · US$8 by PayPal', note: '~66.300₫/credit: 1 Advanced Report with a 4-week study plan, or 3 Basic reports.' },
            { name: '10-credit Practice Pack', price: '549.000₫ total · US$22 by PayPal', note: '~54.900₫/credit, valid 12 months.' },
          ],
          cta: { label: 'Explore Adult AI Speaking & Limitations', href: '/ai-speaking' },
        },
      ],
    },
    faq: {
      heading: 'Questions families and learners ask',
      items: [
        { q: 'Are live sessions with children recorded?', a: 'No. Sessions with learners under 18 are never recorded. Parents receive written teacher observation notes, spoken examples noted live during the lesson, and annotated writing drafts.' },
        { q: 'Does the Adult AI Speaking tool score pronunciation right now?', a: 'Typed practice mode is available today and evaluates the flow of ideas, vocabulary and grammar; it does not assess pronunciation. Spoken audio mode is in limited beta, and the audio player on the AI Speaking page is a synthetic demonstration. For a full 4-criterion assessment including pronunciation today, book the human-assessed 15–20 minute Live Speaking Baseline (690.000₫) on Google Meet.' },
        { q: 'Which currency do I pay in?', a: 'VietQR and online checkout are billed in Vietnamese Đồng (VND ₫). Approximate USD figures are listed for reference; families outside Vietnam can pay set US$ amounts by PayPal for the Baseline and 1-to-1 lessons.' },
      ],
    },
  },
};

type OverhaulContent = typeof en;

const vi: OverhaulContent = {
  nav: {
    items: [
      { key: 'reading', label: 'Học viện Thiếu nhi (5–12 tuổi)', desc: 'Đọc sách & Phiêu lưu truyện', href: '/student-academy', kind: 'route' },
      { key: 'speaking', label: '9–18 tuổi', desc: 'Tự tin nói & IELTS cho teen', href: '/young-learners-speaking/', kind: 'native' },
      { key: 'writing', label: 'IELTS Writing', desc: 'IELTS Writing Task 2: giới thiệu & bản demo', href: '/ai-speaking/writing', kind: 'native' },
      { key: 'adults', label: 'Thi thử Nói AI', desc: 'Luyện Nói IELTS cho người lớn (18+)', href: '/ai-speaking', kind: 'native' },
      { key: 'jay', label: 'Học phí', desc: 'Thầy Jay, gói học và học phí', href: '/#pricing-options', kind: 'native' },
    ],
    newBadge: 'Mới',
    cta: 'Đặt Đánh giá · 690k₫',
    ctaMobile: 'Đánh giá · 690k₫',
    ctaHref: '/ai-speaking/baseline',
  },
  footer: {
    navLabel: 'Chân trang',
    links: [
      { label: 'Đọc sách & Phiêu lưu truyện', href: '/student-academy' },
      { label: 'Câu lạc bộ Truyện (5–8 tuổi)', href: '/story-club' },
      { label: 'Luyện nói & IELTS cho teen', href: '/young-learners-speaking/' },
      { label: 'Luyện IELTS cho người lớn', href: '/ai-speaking' },
      { label: 'Hướng dẫn IELTS theo quốc gia', href: '/ielts-speaking-online' },
      { label: 'Công cụ tính điểm IELTS', href: '/tools/ielts-band-score-calculator' },
      { label: 'IELTS Writing Task 2 (Sắp ra mắt)', href: '/ai-speaking/writing' },
      { label: 'Đánh giá Nói trực tiếp', href: '/ai-speaking/baseline' },
      { label: 'Khung học thuật', href: '/framework' },
      { label: 'Sản phẩm', href: '/products' },
      { label: 'Quyền riêng tư', href: '/legal/privacy' },
      { label: 'Điều khoản', href: '/legal/terms' },
      { label: 'Liên hệ', href: '/get-started' },
    ],
    schools: {
      label: 'Dành cho trường học',
      links: [
        { label: 'Trung tâm kiến thức', href: '/knowledge' },
        { label: 'Bộ giáo trình', href: '/series/compare' },
        { label: 'Thinking Cycle', href: '/thinking-cycle/compare' },
        { label: 'Khung chương trình cho trường', href: '/school-framework' },
        { label: 'Digital Reasoning Engine', href: '/digital-reasoning-engine' },
        { label: 'Cho doanh nghiệp', href: '/companies' },
      ],
    },
    legalLabel: 'Yêu cầu pháp lý & quyền riêng tư:',
    institutionalLead: 'Bạn đang tìm giải pháp quản trị AI cho trường đại học, chuẩn bị theo Thông tư 54 hay cấp phép chương trình cho trường học? Mời bạn ghé',
    institutionalName: 'WorldWise Learning',
    notice:
      'Jurassic English™ là đơn vị giáo dục độc lập do WorldWise Learning vận hành tại Hà Nội, Việt Nam (info@jurassicenglish.com, Zalo/Điện thoại +84 396 085 076), không liên kết và không được IELTS, IDP, British Council hay Cambridge xác nhận. Các mức band là ước tính trong quá trình học, không bao giờ là điểm thi chính thức được bảo đảm.',
  },
  home: {
    hero: {
      eyebrow: 'Tiếng Anh qua câu chuyện, tự tin giao tiếp & IELTS · Hà Nội & học trực tuyến (GMT+3 đến GMT+8)',
      title: 'Tiếng Anh con dùng được—không chỉ học thuộc.',
      body: 'Những bài học xoay quanh câu chuyện giúp trẻ em và tuổi teen giải thích ý tưởng bằng chi tiết từ sách thật, tự tin nói thành lời và viết mạch lạc—cùng phần luyện IELTS dựa trên bằng chứng cho học sinh lớn và người lớn.',
      primary: 'Xem các lộ trình học',
      secondary: 'Chơi thử Story Quest 2 phút miễn phí (6–12 tuổi)',
      imageAlt: 'Tranh minh hoạ truyện: Giáo sư Rex và các nhà thám hiểm nhỏ quây quanh tấm bản đồ các thế giới truyện',
      artLabel: 'Tranh minh hoạ',
      rexAlt: 'Tranh minh hoạ Giáo sư Rex, người dẫn đường trong truyện của Jurassic English',
    },
    paths: {
      heading: 'Chọn lộ trình phù hợp với mục tiêu của người học',
      helper:
        'Chưa biết nên cho con 9–14 tuổi bắt đầu với Đọc hay Nói? Hãy chọn Lộ trình 1 (Đọc sách & Phiêu lưu truyện) nếu con cần vốn từ phong phú hơn, đọc hiểu tốt hơn và viết đoạn văn có cấu trúc. Hãy chọn Lộ trình 2 (Tự tin nói & IELTS cho teen) nếu con đã đọc tốt trên giấy nhưng còn ngại nói thành lời.',
      bestFor: 'Phù hợp nhất',
      purpose: 'Mục tiêu rõ ràng',
      cards: [
        {
          key: 'reading',
          label: 'Lộ trình 1',
          title: 'Đọc sách & Phiêu lưu truyện',
          bestFor: '6–14 tuổi, xếp lớp theo mức độ sẵn sàng qua Cấp 1–5 (ứng dụng Story Quest miễn phí cho 6–12 tuổi)',
          purpose: 'Yêu thích những cuốn truyện thật và học cách giải thích “vì sao” bằng chi tiết trong bài—cả khi nói lẫn khi viết.',
          noteTitle: 'Đồng hành cùng Giáo sư Rex',
          note: 'Bốn Thế giới truyện minh hoạ:',
          worlds: ['Mistwood Harbor', 'Whispering Woods', 'Grand Archive', 'Cloudpeak Observatory'],
          primary: { label: 'Xem Học viện Học sinh', href: '/student-academy', kind: 'route' },
          secondary: { label: 'Chơi thử Story Quest miễn phí', href: STORY_QUEST_URL, kind: 'external' },
        },
        {
          key: 'speaking',
          label: 'Lộ trình 2',
          title: 'Tự tin nói & IELTS cho teen',
          bestFor: '9–18 tuổi, chia theo giai đoạn: 9–11, 11–14 và 15–18',
          purpose: 'Giúp các con học tốt trên giấy tự tin nói thành lời hơn, và chuẩn bị IELTS khi đến lúc phù hợp.',
          noteTitle: 'Lưu ý an toàn cho trẻ',
          note: 'Các buổi học trực tiếp với học viên dưới 18 tuổi không bao giờ được ghi âm, ghi hình; phụ huynh nhận nhận xét quan sát bằng văn bản của giáo viên và kế hoạch ưu tiên.',
          worlds: [],
          primary: { label: 'Xem chương trình Nói & IELTS cho teen', href: '/young-learners-speaking/', kind: 'native' },
          secondary: { label: 'Đặt buổi Đánh giá trực tiếp 15–20 phút (690.000₫)', href: '/ai-speaking/baseline', kind: 'native' },
        },
        {
          key: 'adults',
          label: 'Lộ trình 3',
          title: 'Luyện IELTS & Huấn luyện cho người lớn',
          bestFor: 'Người lớn 18+: người chuẩn bị vào đại học, sinh viên tốt nghiệp & người đi làm',
          purpose: 'Báo cáo luyện IELTS Speaking tự học và tuỳ chọn huấn luyện 1 kèm 1 với nhận xét rõ ràng theo từng tiêu chí.',
          noteTitle: 'Phạm vi sản phẩm',
          note: 'Chế độ luyện bằng cách đánh máy đã hoạt động và không đánh giá phát âm; chế độ nói bằng giọng đang ở giai đoạn beta giới hạn. Đoạn âm thanh mẫu trên trang AI Speaking là bản minh hoạ bằng giọng tổng hợp. Buổi Đánh giá Nói trực tiếp (690.000₫) là buổi riêng qua Google Meet do giáo viên đánh giá.',
          worlds: [],
          primary: { label: 'Xem chương trình luyện IELTS cho người lớn', href: '/ai-speaking', kind: 'native' },
          secondary: { label: 'Xem gói lượt (từ 79.000₫)', href: '/ai-speaking/pricing', kind: 'native' },
        },
      ],
    },
    lesson: {
      badge: 'Ví dụ giảng dạy minh hoạ · Cách chúng tôi dạy học sinh giải thích một ý tưởng',
      heading: 'Cách chúng tôi đưa người học từ một câu ý kiến đến một lời giải thích có dẫn chứng',
      excerptLabel: 'Trích đoạn truyện ngắn (đề bài mẫu)',
      excerpt:
        '“As the storm rose, Maya looked at her last dry flare. She could save it to signal the rescue boat for herself, or fire it now so the lost fishing crew could see the reef.”',
      questionLabel: 'Câu hỏi của giáo viên',
      question: '“Did Maya make a wise choice when she fired the flare for the crew? Explain your answer using a detail from the story.”',
      colBefore: 'Câu trả lời thường gặp khi chưa được hướng dẫn',
      colAfter: 'Cách chúng tôi hướng dẫn (Luận điểm + Dẫn chứng + Giải thích)',
      before: '“Yes, I think Maya made a good choice because she is very brave and kind to other people.”',
      steps: [
        { tag: '1. Luận điểm (Point)', hint: 'Câu trả lời của con', text: '“I think Maya made the right choice...”' },
        { tag: '2. Dẫn chứng (Proof)', hint: 'Chi tiết trong truyện', text: '“...because she fires her last dry flare to warn the lost fishing crew about the reef...”' },
        { tag: '3. Giải thích (Explain)', hint: 'Vì sao chi tiết đó quan trọng', text: '“...which shows she values saving several lives right now over keeping a backup for herself.”' },
      ],
      stallTitle: 'Vì sao câu trả lời dừng lại',
      stall: 'Con dùng tính từ chung chung (brave, kind) mà không chỉ ra điều thực sự đã xảy ra trong truyện.',
      progressTitle: 'Phụ huynh thấy tiến bộ thế nào, mà không cần ghi âm trẻ dưới 18 tuổi',
      progress: 'Giáo viên gửi bản nháp đoạn văn của con, ghi chú từ vựng Word Fossil và những câu con nói được ghi lại trực tiếp trong buổi học, trong một bản cập nhật bằng văn bản cho phụ huynh.',
    },
    jay: {
      eyebrow: 'Gặp giáo viên của bạn',
      title: 'Thầy Jay Adams — Người sáng lập & Giáo viên chính',
      portraitAlt: 'Ảnh thầy Jay Adams, người sáng lập và giáo viên chính của Jurassic English',
      credentials: 'Thạc sĩ Quản lý CNTT, WGU · International PGCE, University of Warwick (hoàn thành năm 2026) · Advanced TEFL',
      intro:
        'Chào bạn, tôi là thầy Jay. Hơn mười năm dạy học trong các lớp học quốc tế ở châu Á và tại Hà Nội, tôi gặp rất nhiều học sinh làm tốt bài ngữ pháp trên giấy, nhưng lại lúng túng khi phải nói ra một ý kiến hoặc tự viết một đoạn văn rõ ràng.',
      expectTitle: 'Khi học cùng tôi, bạn có thể yên tâm:',
      expect: [
        { title: 'Bắt đầu từ chính bài làm của người học.', body: 'Mỗi buổi xếp lớp hay đánh giá đều bắt đầu từ cách con (hoặc bạn) đọc, nói, viết hôm nay.' },
        { title: 'Mỗi lần một ưu tiên rõ ràng.', body: 'Thay vì hai mươi lỗi sửa cùng lúc, mỗi buổi tập trung vào một thói quen có tác động lớn nhất để luyện tiếp.' },
        { title: 'Nhận xét thật lòng, đặt quyền riêng tư lên đầu.', body: 'Các mức band là ước tính dựa trên mô tả công khai, không bao giờ là điểm thi chính thức được bảo đảm—và các buổi học trực tiếp với học viên dưới 18 tuổi không bao giờ được ghi âm, ghi hình.' },
      ],
    },
    pricing: {
      heading: 'Lựa chọn bắt đầu rõ ràng & học phí minh bạch',
      disclosure:
        'Mọi khoản thanh toán qua VietQR và thanh toán trực tuyến đều tính bằng Việt Nam Đồng (VND ₫). Giá USD (~$) chỉ để tham khảo, quy đổi theo 1 USD ≈ 25.897₫; gia đình ở nước ngoài cũng có thể trả các khoản USD cố định qua PayPal trên trang Luyện nói. Các buổi học trực tuyến diễn ra trong khung GMT+3 đến GMT+8 (Hà Nội là GMT+7).',
      entryLabel: 'Bắt đầu tại đây',
      ongoingLabel: 'Lựa chọn tiếp theo & tổng chi phí cam kết',
      rows: [
        {
          key: 'reading',
          title: '1. Đọc sách & Phiêu lưu truyện',
          ages: '6–14 tuổi',
          entry: [
            { name: 'Hoạt động Story Quest miễn phí (6–12 tuổi)', price: '0₫', note: '' },
            { name: 'Buổi tư vấn xếp lớp Đọc & Tư duy 45 phút', price: '', note: 'Gửi yêu cầu qua email hoặc Zalo: chúng tôi xem một bài đọc & viết ngắn của con và gửi nhận xét xếp lớp Cấp 1–5 bằng văn bản.' },
          ],
          ongoing: [
            { name: 'Học phí Học viện nhóm nhỏ & 1 kèm 1', price: '', note: 'Xếp lớp theo mức độ sẵn sàng (Cấp 1–5) sau buổi tư vấn xếp lớp.' },
          ],
          cta: { label: 'Gửi yêu cầu tư vấn xếp lớp Đọc', href: '/student-academy#diagnostic' },
        },
        {
          key: 'speaking',
          title: '2. Tự tin nói & IELTS cho teen',
          ages: '9–18 tuổi',
          entry: [
            { name: 'Buổi Đánh giá Nói trực tiếp 15–20 phút do giáo viên chấm (Google Meet)', price: '690.000₫ (~$27)', note: 'Ước tính band theo 4 tiêu chí bằng văn bản (trôi chảy, từ vựng, ngữ pháp, phát âm), band tổng và ưu tiên số 1 cho buổi tiếp theo. Buổi học với học viên dưới 18 tuổi không bao giờ được ghi âm, ghi hình.' },
          ],
          ongoing: [
            { name: 'Lớp Luyện nói nhóm nhỏ (9–14 tuổi, tối đa 6 bạn, 6 tuần)', price: 'Tổng 2.900.000₫ (~$112)', note: '' },
            { name: 'Bộ công cụ tự học Nói', price: '990.000₫ (~$39)', note: '' },
            { name: 'Học 1 kèm 1, 60 phút · buổi lẻ, trả theo buổi', price: '800.000₫ (~$31)', note: '' },
            { name: 'Gói 8 buổi · thanh toán một lần, dùng trong 35 ngày · 700.000₫/buổi', price: 'Tổng 5.600.000₫ (~$217)', note: '' },
            { name: 'Gói 6 tháng · 48 buổi · 625.000₫/buổi · lịch thanh toán thống nhất bằng văn bản', price: 'Tổng 30.000.000₫ (~$1,159)', note: '' },
            { name: 'Gói 1 năm · 96 buổi · 575.000₫/buổi · lịch thanh toán thống nhất bằng văn bản', price: 'Tổng 55.200.000₫ (~$2,132)', note: '' },
          ],
          cta: { label: 'Đặt buổi Đánh giá Nói (690.000₫)', href: '/ai-speaking/baseline' },
        },
        {
          key: 'adults',
          title: '3. Luyện IELTS với AI cho người lớn',
          ages: '18+ tuổi',
          entry: [
            { name: 'Báo cáo luyện tập khởi đầu (1 lượt)', price: '79.000₫ · US$4 qua PayPal', note: '1 Báo cáo cơ bản trích nguyên văn câu trả lời của bạn và chỉ ra ưu tiên số 1 cần sửa. Chế độ đánh máy đã hoạt động (không đánh giá phát âm); chế độ nói bằng giọng đang ở giai đoạn beta giới hạn.' },
          ],
          ongoing: [
            { name: 'Gói Chẩn đoán 3 lượt', price: 'Tổng 199.000₫ · US$8 qua PayPal', note: '~66.300₫/lượt: 1 Báo cáo nâng cao kèm kế hoạch học 4 tuần, hoặc 3 Báo cáo cơ bản.' },
            { name: 'Gói Luyện tập 10 lượt', price: 'Tổng 549.000₫ · US$22 qua PayPal', note: '~54.900₫/lượt, dùng trong 12 tháng.' },
          ],
          cta: { label: 'Xem AI Speaking & giới hạn của sản phẩm', href: '/ai-speaking' },
        },
      ],
    },
    faq: {
      heading: 'Câu hỏi phụ huynh và người học thường hỏi',
      items: [
        { q: 'Các buổi học trực tiếp với trẻ có được ghi âm không?', a: 'Không. Các buổi học với học viên dưới 18 tuổi không bao giờ được ghi âm, ghi hình. Phụ huynh nhận nhận xét quan sát bằng văn bản của giáo viên, các câu con nói được ghi lại trực tiếp trong buổi học và bản viết có chú thích.' },
        { q: 'Công cụ AI Speaking cho người lớn hiện có chấm phát âm không?', a: 'Chế độ đánh máy đã có và đánh giá mạch ý, từ vựng, ngữ pháp; chế độ này không đánh giá phát âm. Chế độ nói bằng giọng đang ở giai đoạn beta giới hạn, và đoạn âm thanh trên trang AI Speaking là bản minh hoạ bằng giọng tổng hợp. Nếu bạn cần đánh giá đủ 4 tiêu chí, kể cả phát âm, ngay hôm nay, hãy đặt buổi Đánh giá Nói trực tiếp 15–20 phút (690.000₫) qua Google Meet.' },
        { q: 'Tôi thanh toán bằng loại tiền nào?', a: 'VietQR và thanh toán trực tuyến tính bằng Việt Nam Đồng (VND ₫). Giá USD chỉ để tham khảo; gia đình ở nước ngoài có thể trả các khoản USD cố định qua PayPal cho buổi Đánh giá và các buổi 1 kèm 1.' },
      ],
    },
  },
};

export function getOverhaulContent(locale: Locale): OverhaulContent {
  return locale === 'vi' ? vi : en;
}

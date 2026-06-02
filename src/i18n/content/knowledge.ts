import type { Locale } from '../locales';

/**
 * Knowledge Hub content — P0 SHELL.
 *
 * Audience-grouped accordion entries with STABLE anchor ids. The Schools-group
 * anchors are the eventual 301 targets for the dense legacy pages (see
 * docs/p0-homepage-knowledge-build-plan-2026-06.md §6): #framework,
 * #methodology, #cefr-alignment, #teacher-standards, #thinking-cycle.
 * DO NOT rename these ids without updating the redirect plan.
 *
 * P0 = short summaries + "read the full page" links to the still-live legacy
 * routes + an "ask the assistant" affordance. Full content migration is P1.
 */
export type KnowledgeEntry = {
  /** Stable anchor id — load-bearing (301 target). */
  id: string;
  question: string;
  summary: string;
  /** Optional link to the still-live detailed page (P0 keeps legacy pages live). */
  readMorePath?: string;
};

export type KnowledgeGroup = {
  eyebrow: string;
  entries: KnowledgeEntry[];
};

export type KnowledgeContent = {
  eyebrow: string;
  title: string;
  intro: string;
  askPrompt: string;
  readMoreLabel: string;
  groups: {
    schools: KnowledgeGroup;
    parents: KnowledgeGroup;
  };
};

const enKnowledge: KnowledgeContent = {
  eyebrow: 'Ask / Knowledge Hub',
  title: 'Find the depth on demand.',
  intro:
    'Everything that used to sprawl across many pages, in one place. Expand only what you need — or ask the assistant a direct question.',
  askPrompt: 'Ask the assistant',
  readMoreLabel: 'Read the full page',
  groups: {
    schools: {
      eyebrow: 'For schools & curriculum leaders',
      entries: [
        {
          id: 'framework',
          question: 'What is the Jurassic English™ framework?',
          summary:
            'A literature-based curriculum that integrates the Jurassic Thinking Cycle™, CEFR progression, and structured academic writing into one coherent, research-informed school programme from Pre-A1 to C1.',
          readMorePath: '/framework',
        },
        {
          id: 'methodology',
          question: 'How does the methodology work in the classroom?',
          summary:
            'A sequenced model that connects reading, regulated thinking, evidence-based writing, and visible reasoning — so what students produce can be observed, not assumed.',
          readMorePath: '/methodology',
        },
        {
          id: 'cefr-alignment',
          question: 'How does CEFR alignment work?',
          summary:
            'Each level maps to an internationally recognised CEFR range and aligns to standards-based progression, so leaders can place the programme against the frameworks they already report on.',
          readMorePath: '/cefr-alignment',
        },
        {
          id: 'teacher-standards',
          question: 'How are teachers prepared and held to standard?',
          summary:
            'Teacher quality is treated as structural, not personality-dependent — qualification standards plus Jurassic Thinking Cycle™ preparation and delivery governance that make classroom consistency possible at scale.',
          readMorePath: '/teacher-standards',
        },
        {
          id: 'thinking-cycle',
          question: 'What is the Jurassic Thinking Cycle™?',
          summary:
            'The signature reasoning method — Analyze, Evaluate, Justify, Reflect — applied in every lesson so structured thinking develops cumulatively across the curriculum.',
          readMorePath: '/thinking-cycle/compare',
        },
      ],
    },
    parents: {
      eyebrow: 'For parents & students',
      entries: [
        {
          id: 'what-my-child-reads',
          question: 'What will my child read?',
          summary:
            'Authentic literature matched to your child’s level — from first stories to full novels — chosen to build reading, reasoning, and academic writing rather than worksheets.',
          readMorePath: '/student-academy',
        },
        {
          id: 'what-a-diagnostic-involves',
          question: 'What happens in a diagnostic?',
          summary:
            'A short literature-and-reasoning task your child completes; a teacher reviews the work; you receive a clear report and one recommended next step. No score, no fail.',
          readMorePath: '/book-diagnostic',
        },
        {
          id: 'how-progress-is-shown',
          question: 'How do you show my child’s progress?',
          summary:
            'Through visible artifacts and portfolio work you can actually see — evidence of how your child reads, reasons, explains, and writes over time.',
          readMorePath: '/evidence',
        },
      ],
    },
  },
};

const viKnowledge: KnowledgeContent = {
  eyebrow: 'Hỏi / Trung tâm Kiến thức',
  title: 'Tìm chiều sâu khi bạn cần.',
  intro:
    'Tất cả nội dung từng trải rộng trên nhiều trang, nay gộp về một nơi. Chỉ mở phần bạn cần — hoặc đặt câu hỏi trực tiếp cho trợ lý.',
  askPrompt: 'Hỏi trợ lý',
  readMoreLabel: 'Đọc trang đầy đủ',
  groups: {
    schools: {
      eyebrow: 'Cho nhà trường & lãnh đạo chương trình',
      entries: [
        {
          id: 'framework',
          question: 'Khung Jurassic English™ là gì?',
          summary:
            'Chương trình dựa trên văn học, tích hợp Jurassic Thinking Cycle™, tiến trình CEFR và viết học thuật có cấu trúc thành một chương trình mạch lạc từ Pre-A1 đến C1.',
          readMorePath: '/framework',
        },
        {
          id: 'methodology',
          question: 'Phương pháp vận hành trong lớp học như thế nào?',
          summary:
            'Một mô hình tuần tự kết nối đọc, tư duy có điều tiết, viết dựa trên bằng chứng và lập luận hiển thị — để những gì học sinh tạo ra có thể quan sát được.',
          readMorePath: '/methodology',
        },
        {
          id: 'cefr-alignment',
          question: 'Việc căn chỉnh CEFR hoạt động ra sao?',
          summary:
            'Mỗi cấp độ tương ứng với một dải CEFR được công nhận quốc tế và bám theo tiến trình dựa trên chuẩn, giúp lãnh đạo đối chiếu chương trình với các khung họ đang báo cáo.',
          readMorePath: '/cefr-alignment',
        },
        {
          id: 'teacher-standards',
          question: 'Giáo viên được chuẩn bị và bảo đảm chất lượng thế nào?',
          summary:
            'Chất lượng giáo viên mang tính cấu trúc, không phụ thuộc cá nhân — chuẩn trình độ cùng việc chuẩn bị Jurassic Thinking Cycle™ và quản trị giảng dạy giúp duy trì tính nhất quán ở quy mô lớn.',
          readMorePath: '/teacher-standards',
        },
        {
          id: 'thinking-cycle',
          question: 'Jurassic Thinking Cycle™ là gì?',
          summary:
            'Phương pháp lập luận đặc trưng — Analyze, Evaluate, Justify, Reflect — áp dụng trong mỗi bài học để tư duy có cấu trúc phát triển tích lũy qua chương trình.',
          readMorePath: '/thinking-cycle/compare',
        },
      ],
    },
    parents: {
      eyebrow: 'Cho phụ huynh & học sinh',
      entries: [
        {
          id: 'what-my-child-reads',
          question: 'Con tôi sẽ đọc gì?',
          summary:
            'Văn học đích thực phù hợp với cấp độ của con — từ những câu chuyện đầu tiên đến tiểu thuyết — được chọn để phát triển đọc, lập luận và viết học thuật.',
          readMorePath: '/student-academy',
        },
        {
          id: 'what-a-diagnostic-involves',
          question: 'Buổi đánh giá diễn ra thế nào?',
          summary:
            'Con hoàn thành một bài đọc-và-lập-luận ngắn; giáo viên xem xét bài làm; bạn nhận một báo cáo rõ ràng và một bước tiếp theo được đề xuất. Không điểm số, không đỗ-trượt.',
          readMorePath: '/book-diagnostic',
        },
        {
          id: 'how-progress-is-shown',
          question: 'Bạn thể hiện tiến bộ của con tôi ra sao?',
          summary:
            'Qua các sản phẩm hiển thị và hồ sơ học tập bạn thực sự nhìn thấy được — bằng chứng về cách con đọc, lập luận, giải thích và viết theo thời gian.',
          readMorePath: '/evidence',
        },
      ],
    },
  },
};

export function getKnowledgeContent(locale: Locale): KnowledgeContent {
  return locale === 'vi' ? viKnowledge : enKnowledge;
}

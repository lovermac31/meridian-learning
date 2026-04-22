import {
  getThinkingCycleStageByPath,
  thinkingCycleStages,
  type ThinkingCycleStageDetail,
} from '../../lib/thinkingCycleContent';
import type { Locale } from '../locales';
import type { DeepWiden } from './types';

export { thinkingCycleStages, getThinkingCycleStageByPath };

export type ThinkingCycleContentModule = {
  thinkingCycleStages: typeof thinkingCycleStages;
  getThinkingCycleStageByPath: typeof getThinkingCycleStageByPath;
};

const thinkingCycleContentByLocale: Partial<Record<Locale, ThinkingCycleContentModule>> = {
  en: {
    thinkingCycleStages,
    getThinkingCycleStageByPath,
  },
};

export function getThinkingCycleContent(locale: Locale) {
  return thinkingCycleContentByLocale[locale] ?? null;
}

const enThinkingCycleComparisonContent = {
  hero: {
    backCta: 'Back to homepage',
    eyebrow: 'Stage Comparison',
    title: 'Compare all four Thinking Cycle stages',
    body:
      'This view is designed for school leaders, curriculum reviewers, and adult decision-makers who need a fast comparison of the lesson architecture across Analyze, Evaluate, Justify, and Reflect.',
  },
  overview: {
    eyebrow: 'Cross-Stage View',
    title: 'One comparison card per stage',
  },
  labels: {
    stage: 'Stage',
    cognitiveOperation: 'Cognitive Operation',
    bloomLevel: 'Bloom Level',
    primaryTarget: 'Primary Target',
    lessonSlot: 'Lesson Slot',
    primaryActivity: 'Primary Activity',
    assessmentType: 'Assessment Type',
    crossStageRole: 'Cross-Stage Role',
  },
  actions: {
    viewStageDetails: 'View Stage Details',
    studentManual: 'Student Manual',
    teacherManual: 'Teacher Manual',
  },
} as const;

const viThinkingCycleComparisonContent = {
  hero: {
    backCta: 'Quay lại trang chủ',
    eyebrow: 'So sánh các giai đoạn',
    title: 'So sánh toàn bộ bốn giai đoạn của Thinking Cycle',
    body:
      'Trang này dành cho lãnh đạo nhà trường, người rà soát chương trình và người ra quyết định cần một góc nhìn nhanh về kiến trúc bài học của Analyze, Evaluate, Justify và Reflect.',
  },
  overview: {
    eyebrow: 'Góc nhìn xuyên giai đoạn',
    title: 'Một thẻ so sánh cho mỗi giai đoạn',
  },
  labels: {
    stage: 'Giai đoạn',
    cognitiveOperation: 'Thao tác nhận thức',
    bloomLevel: 'Bậc Bloom',
    primaryTarget: 'Mục tiêu chính',
    lessonSlot: 'Vị trí trong bài học',
    primaryActivity: 'Hoạt động trọng tâm',
    assessmentType: 'Loại đánh giá',
    crossStageRole: 'Vai trò trong toàn chu trình',
  },
  actions: {
    viewStageDetails: 'Xem chi tiết giai đoạn',
    studentManual: 'Sổ tay học sinh',
    teacherManual: 'Sổ tay giáo viên',
  },
} as const;

type ThinkingCycleComparisonContent = DeepWiden<typeof enThinkingCycleComparisonContent>;

const comparisonContentByLocale: Record<Locale, ThinkingCycleComparisonContent> = {
  en: enThinkingCycleComparisonContent,
  vi: viThinkingCycleComparisonContent,
};

const enThinkingCycleDetailPageContent = {
  hero: {
    backCta: 'Back to homepage',
    eyebrow: 'Thinking Cycle Stage Detail',
    studentManual: 'Student Manual',
    teacherManual: 'Teacher Manual',
    compareAllStages: 'Compare All Stages',
  },
  glance: {
    eyebrow: 'At A Glance',
    title: 'Stage architecture',
    labels: {
      cognitiveOperation: 'Cognitive Operation',
      bloomLevel: 'Bloom Level',
      primaryTarget: 'Primary Target',
      lessonSlot: 'Lesson Slot',
    },
  },
  studentExpectations: {
    eyebrow: 'Student Expectations',
    title: 'What students are expected to do',
  },
  promptBank: {
    eyebrow: 'Prompt Bank Summary',
    title: 'Prompt types used at this stage',
  },
  languageBank: {
    eyebrow: 'Academic Language Bank',
    title: 'Sentence frames used at this stage',
  },
  practicePrompts: {
    eyebrow: 'Practice Prompts by Level',
    title: 'One stage, different level bands',
  },
  assessment: {
    eyebrow: 'Assessment Snapshot',
    title: 'How this stage is checked in the lesson',
    label: 'Assessment',
  },
  architecture: {
    eyebrow: 'Instructional Architecture',
    primaryActivity: 'Primary Activity',
    teacherAction: 'Teacher Action',
  },
  eco: {
    eyebrow: 'Eco Extension / Cross-Stage Connection',
  },
} as const;

const viThinkingCycleDetailPageContent = {
  hero: {
    backCta: 'Quay lại trang chủ',
    eyebrow: 'Chi tiết giai đoạn Thinking Cycle',
    studentManual: 'Sổ tay học sinh',
    teacherManual: 'Sổ tay giáo viên',
    compareAllStages: 'So sánh toàn bộ các giai đoạn',
  },
  glance: {
    eyebrow: 'Tổng quan nhanh',
    title: 'Kiến trúc của giai đoạn',
    labels: {
      cognitiveOperation: 'Thao tác nhận thức',
      bloomLevel: 'Bậc Bloom',
      primaryTarget: 'Mục tiêu chính',
      lessonSlot: 'Vị trí trong bài học',
    },
  },
  studentExpectations: {
    eyebrow: 'Kỳ vọng với học sinh',
    title: 'Những gì học sinh được kỳ vọng thực hiện',
  },
  promptBank: {
    eyebrow: 'Tóm lược ngân hàng câu hỏi',
    title: 'Các loại câu hỏi dùng ở giai đoạn này',
  },
  languageBank: {
    eyebrow: 'Ngân hàng ngôn ngữ học thuật',
    title: 'Các khung câu dùng ở giai đoạn này',
  },
  practicePrompts: {
    eyebrow: 'Câu hỏi thực hành theo cấp độ',
    title: 'Một giai đoạn, các dải cấp độ khác nhau',
  },
  assessment: {
    eyebrow: 'Tổng quan đánh giá',
    title: 'Giai đoạn này được kiểm tra trong bài học như thế nào',
    label: 'Đánh giá',
  },
  architecture: {
    eyebrow: 'Kiến trúc giảng dạy',
    primaryActivity: 'Hoạt động trọng tâm',
    teacherAction: 'Hành động của giáo viên',
  },
  eco: {
    eyebrow: 'Mở rộng sinh thái / Liên kết toàn chu trình',
  },
} as const;

type ThinkingCycleDetailPageContent = DeepWiden<typeof enThinkingCycleDetailPageContent>;

const detailPageContentByLocale: Record<Locale, ThinkingCycleDetailPageContent> = {
  en: enThinkingCycleDetailPageContent,
  vi: viThinkingCycleDetailPageContent,
};

type ThinkingCycleStageTranslation = Pick<
  ThinkingCycleStageDetail,
  | 'title'
  | 'line'
  | 'cognitiveOperation'
  | 'bloomLevel'
  | 'primaryTarget'
  | 'lessonSlot'
  | 'intro'
  | 'studentExpectations'
  | 'promptBank'
  | 'languageBank'
  | 'practicePrompts'
  | 'assessmentSnapshot'
  | 'teacherAction'
  | 'primaryActivity'
  | 'ecoExtension'
  | 'crossStageConnection'
>;

const viThinkingCycleStageTranslations: Record<string, ThinkingCycleStageTranslation> = {
  analyze: {
    title: 'PHÂN TÍCH',
    line: 'Tách văn bản ra. Tìm bằng chứng. Xác lập điều thật sự hiện diện trong văn bản.',
    cognitiveOperation:
      'Phân rã các yếu tố văn bản để thiết lập sự hiểu biết khách quan.',
    bloomLevel: '3 (Phân tích)',
    primaryTarget: 'Phân rã',
    lessonSlot: '5–15 phút',
    intro: [
      'Giai đoạn 1: PHÂN TÍCH cung cấp toàn bộ kiến trúc giảng dạy để tháo gỡ một văn bản trước khi đưa ra bất kỳ phán đoán hay lập luận nào.',
      'Giai đoạn này xác lập điều gì được nêu rõ ràng, điều gì có thể suy ra, và những chi tiết văn bản nào sẽ về sau hỗ trợ cho đánh giá và lập luận.',
    ],
    studentExpectations: [
      'Xác định nhân vật, bối cảnh và sự kiện cốt truyện với điểm tựa văn bản.',
      'Phân biệt thông tin được nêu trực tiếp với suy luận ngầm.',
      'Nhận ra điểm nhìn trần thuật và những lựa chọn thủ pháp của tác giả.',
      'Nhận diện trạng thái cảm xúc và tâm lý của nhân vật bằng bằng chứng.',
      'Xác định các chi tiết sinh thái và môi trường được cài trong bối cảnh.',
    ],
    promptBank: [
      { type: 'Gợi mở', summary: 'Thiết lập hiểu biết nền: “Điều gì đang diễn ra trong cảnh này?”' },
      { type: 'Làm rõ', summary: 'Phân biệt quan sát với suy luận: “Bằng chứng nào cho thấy nhân vật đang sợ?”' },
      { type: 'Cấu trúc', summary: 'Làm lộ ra thủ pháp và ý đồ của tác giả: “Tác giả tổ chức thông tin này như thế nào?”' },
      { type: 'Sinh thái', summary: 'Làm hiện lên các chiều kích sinh thái và môi trường trong bối cảnh.' },
    ],
    languageBank: [
      { function: 'Phân tích', frame: '"Trong cảnh này, ___ đang diễn ra."' },
      { function: 'Bằng chứng', frame: '"Văn bản nêu / cho thấy / mô tả ___."' },
      { function: 'Suy luận', frame: '"Điều này gợi ra / hàm ý rằng ___."' },
      { function: 'Thủ pháp', frame: '"Tác giả dùng ___ để cho thấy ___."' },
      { function: 'Sinh thái', frame: '"Bối cảnh cho thấy mối quan hệ giữa ___ và môi trường bằng cách ___."' },
    ],
    practicePrompts: [
      {
        levelBand: 'Nền tảng / Phát triển (Pre-A1 đến A2)',
        prompt:
          'Xác định ba dữ kiện về nhân vật chính trực tiếp từ văn bản. Nhân vật làm gì trong cảnh này? Những từ ngữ nào cho biết nhân vật đang cảm thấy gì?',
      },
      {
        levelBand: 'Mở rộng / Làm chủ (A2 đến B2)',
        prompt:
          'Bằng chứng nào cho thấy động cơ của nhân vật? Tác giả dùng ngôn ngữ như thế nào để bộc lộ xung đột nội tâm? Bối cảnh góp gì vào không khí của văn bản?',
      },
      {
        levelBand: 'Nâng cao (B2 đến C1)',
        prompt:
          'Phân tích điểm nhìn trần thuật và tác động của nó lên cách người đọc diễn giải. Thủ pháp chủ đạo của tác giả trong đoạn này là gì? Bối cảnh sinh thái vận hành như thế nào vượt lên khỏi vai trò phông nền?',
      },
    ],
    assessmentSnapshot: [
      'Loại đánh giá: Quan sát.',
      'Hình thức đánh giá: Di chuyển quanh lớp; ghi nhận học sinh nào phân biệt được thông tin hiển ngôn và hàm ngôn.',
      'Chuỗi hỗ trợ hình thành trong giai đoạn Phân tích: gợi mở hoặc điều hướng lại bằng các câu hỏi làm rõ.',
      'Chuẩn portfolio bao gồm phản tư lập luận sinh thái mỗi học phần từ Cấp độ 3 trở lên và tự đánh giá CEFR mỗi học kỳ.',
    ],
    teacherAction: 'Gợi mở hoặc điều hướng lại bằng các câu hỏi làm rõ.',
    primaryActivity: 'Đọc gần có hướng dẫn; giáo viên làm mẫu bằng think-aloud.',
    ecoExtension:
      'Thêm một câu hỏi Phân tích sinh thái trong mọi bài học. Từ Cấp độ 3 trở lên, quan sát thiên nhiên được ghi lại, và tối thiểu một câu hỏi phản tư sinh thái mỗi học phần là bắt buộc.',
    crossStageConnection:
      'Chất lượng của phần Phân tích quyết định trực tiếp chất lượng các phán đoán ở giai đoạn Đánh giá. Phân tích là nền móng của toàn bộ lập luận về sau.',
  },
  evaluate: {
    title: 'ĐÁNH GIÁ',
    line: 'Đưa ra phán đoán. Áp dụng tiêu chuẩn. Bảo vệ phán đoán đó bằng lý lẽ.',
    cognitiveOperation:
      'Đánh giá chất lượng, hiệu quả hoặc đạo đức dựa trên các tiêu chí đã xác lập.',
    bloomLevel: '4 (Đánh giá)',
    primaryTarget: 'Phán đoán',
    lessonSlot: '15–25 phút',
    intro: [
      'Giai đoạn 2: ĐÁNH GIÁ là thời điểm sự hiểu biết chuyển thành phán đoán.',
      'Học sinh nêu tiêu chí, đánh giá chất lượng hoặc đạo đức dựa trên tiêu chí ấy, và bắt đầu diễn đạt lập luận sẽ về sau trở thành phần biện minh chính thức.',
    ],
    studentExpectations: [
      'Xác định tiêu chí rõ ràng trước khi đưa ra bất kỳ phán đoán nào.',
      'Đánh giá chất lượng, tính công bằng hoặc chiều kích đạo đức của các quyết định và sự kiện trong văn bản.',
      'So sánh các hướng hành động hoặc cách diễn giải thay thế.',
      'Dự đoán hệ quả của lựa chọn nhân vật bằng lập luận logic.',
      'Nhận ra các hệ quả sinh thái và hệ thống lâu dài khi phù hợp.',
    ],
    promptBank: [
      { type: 'Đánh giá', summary: 'Gợi ra phán đoán với một tiêu chuẩn rõ ràng: “Đây có phải là một quyết định tốt không? Theo tiêu chuẩn nào?”' },
      { type: 'Hệ quả', summary: 'Phát triển lập luận dự đoán và nhân quả về điều có thể xảy ra tiếp theo.' },
      { type: 'Phương án thay thế', summary: 'Nuôi dưỡng giải quyết vấn đề sáng tạo và phản biện thông qua các cách làm khác.' },
      { type: 'So sánh', summary: 'Đưa vào lăng kính công bằng và đa góc nhìn bằng cách hỏi ai được lợi và ai chịu thiệt.' },
      { type: 'Sinh thái', summary: 'Đánh giá hệ quả dài hạn với môi trường hoặc hệ sinh thái.' },
    ],
    languageBank: [
      { function: 'Phán đoán', frame: '"Quyết định này là ___ vì ___."' },
      { function: 'Tiêu chí', frame: '"Em đang đánh giá điều này theo tiêu chuẩn ___, và dựa trên đó ___."' },
      { function: 'Phương án thay thế', frame: '"Một phương án tốt hơn có thể là ___ vì ___."' },
      { function: 'Công bằng', frame: '"Điều này công bằng / không công bằng vì ___. Người bị ảnh hưởng nhiều nhất là ___."' },
      { function: 'Sinh thái', frame: '"Tác động dài hạn lên môi trường sẽ là ___ vì ___."' },
    ],
    practicePrompts: [
      {
        levelBand: 'Nền tảng / Phát triển (Pre-A1 đến A2)',
        prompt:
          'Lựa chọn của nhân vật có phải là một lựa chọn tốt không? Hãy nói với bạn bên cạnh một lý do. Điều đó có công bằng không? Ai được giúp và ai bị tổn thương?',
      },
      {
        levelBand: 'Mở rộng / Làm chủ (A2 đến B2)',
        prompt:
          'Đánh giá lựa chọn của nhân vật bằng hai tiêu chí. Có một phương án tốt hơn không? Ai phải trả giá cho lựa chọn này? Hãy dùng lăng kính công bằng để bảo vệ phán đoán của em.',
      },
      {
        levelBand: 'Nâng cao (B2 đến C1)',
        prompt:
          'Đánh giá khung đạo đức ngầm trong văn bản của tác giả. Câu chuyện ưu tiên tiêu chí nào? Những góc nhìn nào bị làm mờ hoặc bị gạt ra ngoài? Hệ quả sinh thái dài hạn của thế giới được miêu tả là gì?',
      },
    ],
    assessmentSnapshot: [
      'Loại đánh giá: Thảo luận theo cặp.',
      'Hình thức đánh giá: Lắng nghe học sinh dùng tiêu chí đánh giá trong phần pair-share.',
      'Chuỗi hỗ trợ hình thành trong giai đoạn Đánh giá: nêu bật các nhận định mạnh trước lớp — “Đó là một đánh giá vì em đã dùng một tiêu chí.”',
      'Chuẩn portfolio bao gồm đoạn văn lập luận tốt nhất mỗi học phần, phản tư lập luận sinh thái mỗi học phần từ Cấp độ 3 trở lên, và tự đánh giá CEFR mỗi học kỳ.',
    ],
    teacherAction:
      'Nêu bật các nhận định mạnh trước lớp: “Đó là một đánh giá vì em đã dùng một tiêu chí.”',
    primaryActivity: 'Thảo luận theo cặp; accountable talk cả lớp.',
    ecoExtension:
      'Đánh giá sinh thái yêu cầu học sinh cân nhắc quyết định theo tác động của nó với thế giới không phải con người. Từ Cấp độ 2 trở lên, đưa vào Thử thách Stewardship; từ Cấp độ 4 trở lên, thêm Temporal Extension và Indigenous Perspective.',
    crossStageConnection:
      'Đánh giá là điểm xoay giữa hiểu và lập luận. Tiêu chí được nêu ở Giai đoạn 2 trở thành xương sống logic của đoạn biện minh ở Giai đoạn 3.',
  },
  justify: {
    title: 'LẬP LUẬN',
    line: 'Nêu luận điểm. Trích bằng chứng. Giải thích mối nối. Chỉ ra tác động.',
    cognitiveOperation:
      'Hỗ trợ các luận điểm bằng bằng chứng văn bản và lập luận logic chặt chẽ.',
    bloomLevel: '5 (Tổng hợp / Biện minh)',
    primaryTarget: 'Kiến tạo',
    lessonSlot: '25–35 phút',
    intro: [
      'Giai đoạn 3: LẬP LUẬN là bài viết hoặc phát biểu lập luận hoàn chỉnh được xây dựng từ các giai đoạn trước.',
      'Học sinh kiến tạo phản hồi CEIW bằng cách nêu luận điểm, chọn bằng chứng, giải thích warrant và mở rộng ý nghĩa của lập luận.',
    ],
    studentExpectations: [
      'Nêu một luận điểm rõ ràng và có thể tranh luận.',
      'Chọn bằng chứng văn bản có chủ đích, trực tiếp hỗ trợ luận điểm.',
      'Viết warrant giải thích vì sao bằng chứng chứng minh được luận điểm.',
      'Mở rộng sang Impact: ý nghĩa hoặc hàm ý rộng hơn của lập luận.',
      'Dự liệu và đáp lại phản biện ở cấp độ Nâng cao.',
    ],
    promptBank: [
      { type: 'CEIW đầy đủ', summary: 'Chống đỡ toàn bộ cấu trúc bốn phần: “Viết một đoạn: Claim + Evidence + Warrant + Impact.”' },
      { type: 'Tách riêng luận điểm', summary: 'Xây luận điểm trước khi dựng toàn bộ lập luận.' },
      { type: 'Chỉ bằng chứng', summary: 'Rèn việc chọn bằng chứng có chủ đích với trích dẫn chính xác.' },
      { type: 'Warrant', summary: 'Nhắm vào thành phần thường bị thiếu nhất bằng câu hỏi vì sao trích dẫn này chứng minh được luận điểm.' },
      { type: 'Phản biện', summary: 'Giới thiệu lập luận mang tính đối biện ở cấp độ cao.' },
    ],
    languageBank: [
      { function: 'Luận điểm', frame: '"Em cho rằng / lập luận rằng ___ vì ___."' },
      { function: 'Bằng chứng', frame: '"Văn bản nêu rằng: [trích dẫn chính xác]."' },
      { function: 'Warrant', frame: '"Điều này cho thấy / bộc lộ / chứng minh rằng ___, từ đó chứng tỏ ___ vì ___."' },
      { function: 'Impact', frame: '"Điều này quan trọng vì ___ / Mẫu hình này gợi ra rằng ___."' },
      { function: 'Phản biện', frame: '"Dù có người có thể cho rằng ___, văn bản thực sự cho thấy ___."' },
      { function: 'Lập luận sinh thái', frame: '"Văn bản cho thấy con người có trách nhiệm ___ vì bằng chứng cho thấy ___."' },
    ],
    practicePrompts: [
      {
        levelBand: 'Nền tảng / Phát triển (Pre-A1 đến A2)',
        prompt:
          'Hoàn thành khung câu: “___ cảm thấy ___ vì văn bản nói ___.” Hãy khoanh tròn bằng chứng trong văn bản của em.',
      },
      {
        levelBand: 'Mở rộng / Làm chủ (A2 đến B2)',
        prompt:
          'Viết một đoạn Claim + Evidence + Warrant. Luận điểm của em phải có thể tranh luận, và warrant phải giải thích VÌ SAO bằng chứng chứng minh được luận điểm.',
      },
      {
        levelBand: 'Nâng cao (B2 đến C1)',
        prompt:
          'Viết một đoạn CEIW đầy đủ bao gồm câu Impact và một phản biện. Dùng hai mẩu bằng chứng và biện minh cho việc em đã chọn chúng.',
      },
    ],
    assessmentSnapshot: [
      'Loại đánh giá: Bài viết lập luận.',
      'Hình thức đánh giá: Thu đoạn CEIW và chấm theo Four-Level Rubric.',
      'Chuỗi hỗ trợ hình thành trong giai đoạn Lập luận: phản hồi bằng văn bản trong vòng 24 giờ và chỉ rõ thành phần CEIW nào đang thiếu hoặc còn yếu.',
      'Chuẩn portfolio bao gồm đoạn văn lập luận tốt nhất mỗi học phần, phản tư lập luận sinh thái mỗi học phần từ Cấp độ 3 trở lên, và tự đánh giá CEFR mỗi học kỳ.',
    ],
    teacherAction:
      'Phản hồi bằng văn bản trong vòng 24 giờ; chỉ rõ thành phần CEIW nào đang thiếu hoặc còn yếu.',
    primaryActivity:
      'Viết lập luận CEIW độc lập; tín hiệu im lặng; cung cấp khung câu cho học sinh ở mức Emerging.',
    ecoExtension:
      'Lập luận sinh thái yêu cầu học sinh xây dựng lập luận về trách nhiệm của con người với thế giới tự nhiên. Từ Cấp độ 3 trở lên, đoạn lập luận sinh thái đủ điều kiện trở thành đoạn portfolio tốt nhất của học phần sinh thái.',
    crossStageConnection:
      'Lập luận phụ thuộc hoàn toàn vào bằng chứng ở Giai đoạn 1 và phán đoán ở Giai đoạn 2. Rút ngắn hoặc bỏ qua các giai đoạn trước sẽ làm yếu đi bài viết cuối cùng.',
  },
  reflect: {
    title: 'PHẢN TƯ',
    line: 'Kết nối. Chuyển hóa. Đưa suy nghĩ của em vượt ra ngoài văn bản.',
    cognitiveOperation:
      'Kết nối chủ đề văn bản với trải nghiệm cá nhân, bối cảnh rộng hơn, nguyên tắc đạo đức và thế giới sống.',
    bloomLevel: '6 (Sáng tạo / Siêu nhận thức)',
    primaryTarget: 'Chuyển giao',
    lessonSlot: '35–40 phút',
    intro: [
      'Giai đoạn 4: PHẢN TƯ là nơi suy nghĩ được chuyển từ văn bản sang đời sống, đạo đức và thế giới sống.',
      'Giai đoạn này yêu cầu học sinh khái quát hóa, nhận ra sự dịch chuyển trong tư duy của chính mình, và nêu một trách nhiệm hay cam kết cụ thể khi phù hợp.',
    ],
    studentExpectations: [
      'Kết nối chủ đề của văn bản với trải nghiệm sống của bản thân một cách cụ thể.',
      'Khái quát một bài học từ văn bản cho cộng đồng con người rộng hơn.',
      'Vận dụng lập luận đạo đức vào những câu hỏi mà văn bản đặt ra.',
      'Xem xét việc đọc văn bản đã thay đổi tư duy của chính mình như thế nào.',
      'Nêu một trách nhiệm với thế giới sống mà văn bản gợi ra từ Cấp độ 3 trở lên.',
    ],
    promptBank: [
      { type: 'Cá nhân', summary: 'Xây dựng tự nhận thức và kết nối cá nhân.' },
      { type: 'Phổ quát', summary: 'Khái quát vượt khỏi văn bản tới cộng đồng con người rộng hơn.' },
      { type: 'Đạo đức', summary: 'Vận dụng lập luận đạo đức vào cách chúng ta sống.' },
      { type: 'Siêu nhận thức', summary: 'Nhận ra một sự dịch chuyển trong suy nghĩ hoặc thế giới quan.' },
      { type: 'Sinh thái', summary: 'Hỏi văn bản tạo ra trách nhiệm nào với thế giới tự nhiên.' },
    ],
    languageBank: [
      { function: 'Cá nhân', frame: '"Điều này kết nối với cuộc sống của em vì ___."' },
      { function: 'Phổ quát', frame: '"Một bài học mà mọi người có thể học từ điều này là ___ vì ___."' },
      { function: 'Đạo đức', frame: '"Điều này quan trọng đối với cách chúng ta sống vì ___."' },
      { function: 'Siêu nhận thức', frame: '"Trước khi đọc văn bản này, em nghĩ ___. Bây giờ em nghĩ ___ vì ___."' },
      { function: 'Sinh thái', frame: '"Câu chuyện này cho thấy con người và thế giới tự nhiên ___. Điều này quan trọng vì ___."' },
      { function: 'Tăng trưởng', frame: '"Lập luận của em phát triển khi em ___ vì ___."' },
    ],
    practicePrompts: [
      {
        levelBand: 'Nền tảng / Phát triển (Pre-A1 đến A2)',
        prompt:
          'Hoàn thành: “Câu chuyện này khiến em nghĩ về ___.” Viết một câu về điều em học được. Nói với bạn bên cạnh: “Em sẽ / sẽ không làm như vậy vì ___.”',
      },
      {
        levelBand: 'Mở rộng / Làm chủ (A2 đến B2)',
        prompt:
          'Viết một đoạn phản tư nối chủ đề của câu chuyện với một tình huống đời thực mà em biết. Hãy nêu điều em thấy trong văn bản, điều này khiến em nghĩ gì về cuộc sống, và vì sao điều đó quan trọng. Thêm phản tư sinh thái nếu phù hợp.',
      },
      {
        levelBand: 'Nâng cao (B2 đến C1)',
        prompt:
          'Viết một đoạn phản tư siêu nhận thức: văn bản này đã làm dịch chuyển tư duy của em như thế nào? Trước đây em giữ giả định nào? Sau văn bản này, trách nhiệm của em là gì? Hãy đưa thêm chiều kích đạo đức sinh thái.',
      },
    ],
    assessmentSnapshot: [
      'Loại đánh giá: Phiếu thoát cuối giờ.',
      'Hình thức đánh giá: Một câu hỏi Reflect; tối thiểu một câu hoàn chỉnh.',
      'Chuỗi hỗ trợ hình thành trong 5 phút cuối giờ: phân loại phản hồi thành Sẵn sàng / Gần đạt / Chưa đạt và dùng chúng làm dữ liệu chuẩn bị cho buổi học tiếp theo.',
      'Chuẩn portfolio bao gồm phản tư lập luận sinh thái mỗi học phần từ Cấp độ 3 trở lên và tự đánh giá CEFR mỗi học kỳ.',
    ],
    teacherAction:
      'Phân loại phản hồi thành 3 nhóm: Sẵn sàng / Gần đạt / Chưa đạt. Dùng kết quả như dữ liệu lên kế hoạch cho buổi học kế tiếp.',
    primaryActivity:
      'Phiếu thoát cuối giờ: một câu hỏi phản tư; có thể thêm câu hỏi phản tư sinh thái (từ Cấp độ 3 trở lên).',
    ecoExtension:
      'Phiên bản 3.0 bổ sung câu hỏi Phản tư sinh thái như miền phản tư thứ năm. Đầu ra mục tiêu là một phát biểu cam kết stewardship, được ghi vào Nature Journal và gắn với thành phần portfolio lập luận sinh thái.',
    crossStageConnection:
      'Phản tư không phải hoạt động hạ nhiệt cuối giờ. Một bài học kết thúc trước Phản tư sẽ dừng ở mức hiểu; mục tiêu của Jurassic English là sự chuyển hóa, không chỉ là sự lĩnh hội.',
  },
};

function mergeLocalizedStage(
  baseStage: ThinkingCycleStageDetail,
  overlay: ThinkingCycleStageTranslation,
): ThinkingCycleStageDetail {
  return {
    ...baseStage,
    title: overlay.title,
    line: overlay.line,
    cognitiveOperation: overlay.cognitiveOperation,
    bloomLevel: overlay.bloomLevel,
    primaryTarget: overlay.primaryTarget,
    lessonSlot: overlay.lessonSlot,
    intro: overlay.intro,
    studentExpectations: overlay.studentExpectations,
    promptBank: overlay.promptBank,
    languageBank: overlay.languageBank,
    practicePrompts: overlay.practicePrompts,
    assessmentSnapshot: overlay.assessmentSnapshot,
    teacherAction: overlay.teacherAction,
    primaryActivity: overlay.primaryActivity,
    ecoExtension: overlay.ecoExtension,
    crossStageConnection: overlay.crossStageConnection,
  };
}

export function getThinkingCycleComparisonContent(locale: Locale) {
  return comparisonContentByLocale[locale];
}

export function getThinkingCycleDetailPageContent(locale: Locale) {
  return detailPageContentByLocale[locale];
}

export function getLocalizedThinkingCycleStages(locale: Locale) {
  if (locale === 'en') {
    return thinkingCycleStages;
  }

  return thinkingCycleStages.map((stage) => {
    const overlay = viThinkingCycleStageTranslations[stage.slug];
    return overlay ? mergeLocalizedStage(stage, overlay) : stage;
  });
}

export function getLocalizedThinkingCycleStageByPath(pathname: string, locale: Locale) {
  const baseStage = getThinkingCycleStageByPath(pathname);

  if (!baseStage) {
    return null;
  }

  if (locale === 'en') {
    return baseStage;
  }

  const overlay = viThinkingCycleStageTranslations[baseStage.slug];
  return overlay ? mergeLocalizedStage(baseStage, overlay) : baseStage;
}

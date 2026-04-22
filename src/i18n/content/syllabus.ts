import {
  getSyllabusByRoutePath,
  syllabusData,
  type AssessmentMethod,
  type CoreText,
  type SyllabusData,
  type TermBlock,
} from '../../lib/syllabusContent';
import type { Locale } from '../locales';
import type { DeepWiden } from './types';

export { syllabusData, getSyllabusByRoutePath };

export type SyllabusContentModule = {
  syllabusData: typeof syllabusData;
  getSyllabusByRoutePath: typeof getSyllabusByRoutePath;
};

const syllabusContentByLocale: Partial<Record<Locale, SyllabusContentModule>> = {
  en: {
    syllabusData,
    getSyllabusByRoutePath,
  },
};

export function getSyllabusContent(locale: Locale) {
  return syllabusContentByLocale[locale] ?? null;
}

const enSyllabusPageContent = {
  hero: {
    backCta: 'Back',
    eyebrow: 'Curriculum Syllabus · Academic Year 2025–26',
    viewLevelDetails: 'View Level Details',
  },
  glance: {
    eyebrow: 'Level at a Glance',
    title: 'Everything you need to know at a glance',
    labels: {
      ageRange: 'Age Range',
      cefrRange: 'CEFR Range',
      totalLessons: 'Total Lessons',
      lessonDuration: 'Lesson Duration',
      cefrProgression: 'CEFR Progression',
      cognitiveFocus: 'Cognitive Focus',
      textComplexity: 'Text Complexity',
      ecoStrand: 'Eco-Reasoning Strand',
    },
  },
  coreTexts: {
    eyebrow: 'Core Texts',
    title: 'Literature selected to develop real thinking',
    body:
      'Every text is chosen because it raises questions that do not have easy answers. 10 core texts per year; 4 structured lessons per text.',
    ecoBadge: 'Eco',
    additionalTextsLabel: 'Additional texts:',
  },
  academicYear: {
    eyebrow: 'Academic Year',
    title: 'Term-by-term curriculum map',
  },
  assessment: {
    eyebrow: 'Assessment',
    title: 'Assessment tracks the quality of reasoning.',
    body: 'All written justification tasks are assessed using the WWL Four-Level Reasoning Rubric.',
    rubricEyebrow: 'WWL Four-Level Reasoning Rubric',
    rubricTitle: 'The standard applied to all written work',
  },
  eco: {
    eyebrow: 'Eco-Learning Thread',
  },
  support: {
    title: 'Supporting Learning at Home',
  },
  progression: {
    eyebrow: 'Programme Progression',
    title: 'Where this level fits',
    comingFrom: 'Coming from',
    leadingTo: 'Leading to',
    readiness: 'Readiness for the next stage',
  },
  cta: {
    title: 'Enquire about this level',
    body:
      'Interested in introducing {{levelTitle}} at your school? Contact us to discuss teacher training, school licensing, and curriculum review.',
    published:
      'Published by World Wise Learning · Jurassic English™ Version 3.0 · Academic Year 2025–2026',
    viewFullLevel: 'View full Level {{order}} detail page',
  },
} as const;

const viSyllabusPageContent = {
  hero: {
    backCta: 'Quay lại',
    eyebrow: 'Đề cương chương trình · Năm học 2025–26',
    viewLevelDetails: 'Xem chi tiết cấp độ',
  },
  glance: {
    eyebrow: 'Tổng quan cấp độ',
    title: 'Những điểm cốt lõi cần nắm trong một góc nhìn',
    labels: {
      ageRange: 'Độ tuổi',
      cefrRange: 'Dải CEFR',
      totalLessons: 'Tổng số bài học',
      lessonDuration: 'Thời lượng mỗi bài',
      cefrProgression: 'Tiến trình CEFR',
      cognitiveFocus: 'Trọng tâm tư duy',
      textComplexity: 'Độ phức tạp văn bản',
      ecoStrand: 'Mạch tư duy sinh thái',
    },
  },
  coreTexts: {
    eyebrow: 'Văn bản cốt lõi',
    title: 'Văn học được tuyển chọn để nuôi dưỡng tư duy thực chất',
    body:
      'Mỗi văn bản đều được chọn vì nó đặt ra những câu hỏi không có câu trả lời đơn giản. 10 văn bản cốt lõi mỗi năm; 4 bài học có cấu trúc cho mỗi văn bản.',
    ecoBadge: 'Sinh thái',
    additionalTextsLabel: 'Các văn bản bổ sung:',
  },
  academicYear: {
    eyebrow: 'Năm học',
    title: 'Bản đồ chương trình theo từng học kỳ',
  },
  assessment: {
    eyebrow: 'Đánh giá',
    title: 'Đánh giá theo dõi chất lượng của lập luận.',
    body: 'Tất cả các nhiệm vụ viết lập luận đều được đánh giá bằng WWL Four-Level Reasoning Rubric.',
    rubricEyebrow: 'WWL Four-Level Reasoning Rubric',
    rubricTitle: 'Chuẩn đánh giá áp dụng cho mọi bài viết',
  },
  eco: {
    eyebrow: 'Mạch học tập sinh thái',
  },
  support: {
    title: 'Hỗ trợ việc học tại nhà',
  },
  progression: {
    eyebrow: 'Tiến trình chương trình',
    title: 'Vị trí của cấp độ này trong toàn bộ lộ trình',
    comingFrom: 'Đi lên từ',
    leadingTo: 'Dẫn tới',
    readiness: 'Sẵn sàng cho giai đoạn tiếp theo',
  },
  cta: {
    title: 'Tìm hiểu về cấp độ này',
    body:
      'Nếu quý trường muốn triển khai {{levelTitle}}, hãy liên hệ với chúng tôi để trao đổi về đào tạo giáo viên, cấp phép cho trường và rà soát chương trình.',
    published: 'Được phát hành bởi World Wise Learning · Jurassic English™ Phiên bản 3.0 · Năm học 2025–2026',
    viewFullLevel: 'Xem trang chi tiết đầy đủ của Cấp độ {{order}}',
  },
} as const;

type SyllabusPageContent = DeepWiden<typeof enSyllabusPageContent>;

const syllabusPageContentByLocale: Record<Locale, SyllabusPageContent> = {
  en: enSyllabusPageContent,
  vi: viSyllabusPageContent,
};

type SyllabusOverlay = Pick<
  SyllabusData,
  | 'welcomeText'
  | 'levelAtAGlance'
  | 'coreTextNote'
  | 'reasoningRubric'
  | 'ecoThreadSummary'
  | 'ecoStrandLabel'
  | 'progressionFrom'
  | 'progressionTo'
  | 'readinessStatement'
  | 'homeSupportTips'
> & {
  coreTexts: Array<Pick<CoreText, 'theme'>>;
  termBreakdown: Array<Pick<TermBlock, 'term' | 'lessonRange' | 'units' | 'focusPoints'>>;
  assessmentMethods: Array<Pick<AssessmentMethod, 'method' | 'frequency' | 'detail'>>;
};

const viSharedRubric = [
  {
    level: '1',
    label: 'Mới hình thành',
    description:
      'Nêu quan điểm nhưng chưa có hỗ trợ. Chỉ có ý kiến, chưa có lập luận. Không trích dẫn bằng chứng từ văn bản.',
  },
  {
    level: '2',
    label: 'Đang phát triển',
    description:
      'Có dẫn bằng chứng nhưng chưa nối rõ với quan điểm. Bằng chứng có mặt nhưng warrant còn thiếu hoặc chưa rõ.',
  },
  {
    level: '3',
    label: 'Thành thạo',
    description:
      'Kết nối bằng chứng với luận điểm bằng lập luận rõ ràng. Có đầy đủ Claim + Evidence + Warrant. Bằng chứng được chọn có chủ đích.',
  },
  {
    level: '4',
    label: 'Nâng cao',
    description:
      'Dự liệu phản biện và mở rộng sang hàm ý rộng hơn. Có CEIW đầy đủ với nhiều điểm bằng chứng.',
  },
] as const;

const viSyllabusOverlays: Record<string, SyllabusOverlay> = {
  'level-1-foundation': {
    welcomeText: [
      'Chào mừng đến với Cấp độ 1: Nền tảng — khởi đầu của một hành trình tư duy thật đặc biệt.',
      'Ở cấp độ này, con bạn khám phá thế giới qua những sách tranh và truyện ngắn được tuyển chọn cẩn thận. Nhưng đây không phải những giờ kể chuyện thông thường. Mỗi cuốn sách trong chương trình Jurassic English™ đều được chọn vì nó đặt ra một câu hỏi thật: về công bằng, cảm xúc, cộng đồng, hay vị trí của con người trong thế giới tự nhiên.',
      'Ngay từ những buổi học đầu tiên, con sẽ được mời suy nghĩ thành lời, chia sẻ quan điểm, và dùng chính ngôn ngữ của văn bản để giải thích điều mình tin là đúng. Đến cuối năm, con không chỉ đọc truyện. Con sẽ phân tích, đánh giá lựa chọn của nhân vật, và viết những ý kiến có lý lẽ đầu tiên của mình.',
    ],
    levelAtAGlance: {
      ageRange: '6–8 tuổi',
      cefrRange: 'Pre-A1 → A1',
      cefrProgression: 'Pre-A1 → A1 (khoảng 90–100 giờ học có hướng dẫn)',
      cognitiveFocus: 'BICS — ngữ âm, từ vựng tần suất cao, ngôn ngữ gắn với ngữ cảnh',
      textComplexity: 'Sách tranh và truyện có cấu trúc dự đoán được',
      totalLessons: '40 bài học có cấu trúc mỗi năm học',
      lessonDuration: '40–60 phút mỗi bài học',
      ecoStrand: 'Thiên nhiên gần gũi, mùa trong năm và mối quan hệ giữa các loài vật',
    },
    coreTexts: [
      { theme: 'Trí tưởng tượng, lòng can đảm và giải quyết vấn đề' },
      { theme: 'Bản sắc, tên gọi và cảm giác thuộc về một nền văn hóa' },
      { theme: 'Sự bền bỉ của gia đình, cộng đồng và lòng hào hiệp' },
      { theme: 'Sự kỳ diệu của thế giới tự nhiên; kiên nhẫn và hiện diện' },
    ],
    coreTextNote:
      '6 nhan đề bổ sung được tuyển chọn theo bộ tiêu chí văn bản của WWL, phối hợp cùng cộng đồng nhà trường. Tất cả văn bản được chọn đều đáp ứng chuẩn năm tiêu chí về đa dạng văn hóa và chiều sâu sinh thái.',
    termBreakdown: [
      {
        term: 'Học kỳ 1',
        lessonRange: 'Bài 1–13',
        units: 'Học phần 1–3',
        focusPoints: [
          'Giới thiệu Jurassic Thinking Cycle™',
          'Phân tích có hướng dẫn — “Chúng ta nhận ra điều gì?” với trao đổi theo cặp và khung câu',
          'Đánh giá bằng lời nói đầu tiên: “Đó là một lựa chọn tốt hay xấu?”',
          'Khởi động sinh thái: quan sát ngoài trời 2 phút trước mỗi buổi học',
        ],
      },
      {
        term: 'Học kỳ 2',
        lessonRange: 'Bài 14–27',
        units: 'Học phần 4–7',
        focusPoints: [
          'Những câu lập luận viết đầu tiên (Claim + Evidence)',
          'Giới thiệu câu hỏi Reflect mang tính cá nhân: “Điều này kết nối với cuộc sống của em vì…”',
          'Mạch sinh thái được kích hoạt: bắt đầu ghi chép quan sát thiên nhiên không chính thức',
          'Câu hỏi sinh thái: “Ta gọi tên các sự vật trong tự nhiên như thế nào? Vì sao việc gọi tên lại quan trọng?”',
        ],
      },
      {
        term: 'Học kỳ 3',
        lessonRange: 'Bài 28–40',
        units: 'Học phần 8–10',
        focusPoints: [
          'Vận dụng toàn bộ Thinking Cycle qua bốn giai đoạn với mức hỗ trợ nhẹ',
          'Giới thiệu portfolio: học sinh chọn câu lập luận tốt nhất của mình',
          'Tự đánh giá CEFR trên bảng mô tả Pre-A1 / A1',
          'Hoạt động tôn vinh đọc hiểu — học sinh chia sẻ hành trình lập luận của mình',
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Quan sát trong giờ học',
        frequency: 'Mỗi bài học',
        detail:
          'Giáo viên ghi nhận học sinh nào đưa ra bằng chứng thay vì chỉ nêu ý kiến. Giáo viên gợi mở và điều chỉnh bằng các câu hỏi làm rõ.',
      },
      {
        method: 'Bài viết lập luận',
        frequency: '2–3 lần mỗi tuần',
        detail:
          'Phản hồi Claim + Evidence trong một câu. Phản hồi được trả trong vòng 24 giờ. Có khung câu hỗ trợ.',
      },
      {
        method: 'Phiếu thoát cuối giờ',
        frequency: 'Cuối mỗi bài học',
        detail:
          'Một câu hỏi Reflect; trả lời bằng một câu. Giáo viên phân loại thành Sẵn sàng / Gần đạt / Chưa đạt để lên kế hoạch cho buổi học tiếp theo.',
      },
      {
        method: 'Portfolio',
        frequency: 'Mỗi học phần × 10',
        detail:
          'Học sinh chọn câu lập luận tốt nhất của mình và chú thích: “Điều này cho thấy tư duy tốt nhất của em vì…”',
      },
      {
        method: 'Tự đánh giá CEFR',
        frequency: 'Mỗi học kỳ',
        detail:
          'Học sinh đánh dấu mức hiện tại trên bảng mô tả Pre-A1 / A1. Giáo viên xác nhận hoặc tranh luận lại trong buổi trao đổi.',
      },
      {
        method: 'Tường thuật tăng trưởng cuối năm',
        frequency: 'Cuối năm học',
        detail:
          '“Hành trình lập luận của em trong năm nay…” — giáo viên đọc tổng thể để hỗ trợ quyết định xếp lớp lên Cấp độ 2.',
      },
    ],
    reasoningRubric: [...viSharedRubric],
    ecoThreadSummary:
      'Ở cấp độ Nền tảng, học tập sinh thái bắt đầu bằng sự kinh ngạc. Những cuốn sách như Owl Moon mời trẻ chậm lại, quan sát thế giới sống và cảm nhận mối liên hệ cũng như trách nhiệm của mình. Trẻ bắt đầu một sổ tay thiên nhiên không chính thức — vẽ và ghi nhãn điều mình quan sát. Câu hỏi Phản tư sinh thái ở cấp độ này là: “Ta gọi tên các sự vật trong tự nhiên như thế nào? Vì sao việc gọi tên lại quan trọng?”',
    ecoStrandLabel: 'Thiên nhiên gần gũi, mùa trong năm và mối quan hệ giữa các loài vật',
    progressionFrom: 'Điểm bắt đầu của chương trình',
    progressionTo: 'Cấp độ 2: Phát triển',
    readinessStatement:
      'Học sinh sẵn sàng lên Cấp độ 2 khi có thể duy trì một cuộc trao đổi tập trung bằng cách dùng bằng chứng từ văn bản, viết độc lập một câu Claim + Evidence, và tạo được kết nối cá nhân trong phần Reflect. Mức sẵn sàng A1 được xác nhận qua rà soát portfolio cuối năm và đánh giá của giáo viên. Việc xếp lớp không bao giờ dựa trên một bài kiểm tra đơn lẻ.',
    homeSupportTips: [
      'Đọc to cùng con 15 phút mỗi ngày — giọng đọc của người lớn giúp làm mẫu cho nhịp điệu, ngữ điệu và xây dựng khả năng nghe hiểu.',
      'Sau khi đọc, hãy hỏi: “Vì sao nhân vật lại làm như vậy?” chứ không chỉ “Điều gì đã xảy ra?”. Câu hỏi này nuôi dưỡng lập luận thay vì ghi nhớ.',
      'Thử một “cuộc dạo quan sát” 5 phút ngoài trời. Hỏi con gọi tên 3 sự sống xung quanh và mô tả một mối quan hệ giữa chúng.',
      'Trưng bày câu lập luận tốt nhất của con ở nơi dễ thấy — niềm tự hào hiển hiện sẽ củng cố thói quen lập luận.',
      'Để con “dạy lại” cho bạn điều con đã thảo luận trong giờ học. Việc giải thích cho người khác sẽ làm sâu thêm sự hiểu.',
    ],
  },
  'level-2-development': {
    welcomeText: [
      'Chào mừng đến với Cấp độ 2: Phát triển — nơi tư duy trở thành một thói quen có kỷ luật.',
      'Ở cấp độ này, con bạn chuyển từ sách tranh sang truyện chương hồi: dài hơn, phong phú hơn và đầy những câu hỏi đạo đức không có đáp án đơn giản. Liệu có đúng khi im lặng khi ai đó bị đối xử bất công? Chúng ta có trách nhiệm gì với động vật và môi trường?',
      'Con sẽ học cách dùng bằng chứng văn bản để bảo vệ quan điểm, cấu trúc lập luận trong viết, và lắng nghe cẩn trọng các lập luận của bạn cùng lớp. Đến cuối năm, con sẽ viết được các đoạn văn lập luận hoàn chỉnh, dẫn dắt một cuộc thảo luận có cấu trúc, và kết nối văn học với đời sống của chính mình cũng như với thế giới sống quanh mình.',
    ],
    levelAtAGlance: {
      ageRange: '8–10 tuổi',
      cefrRange: 'A1 → A2',
      cefrProgression: 'A1 → A2 (khoảng 180–200 giờ học có hướng dẫn)',
      cognitiveFocus: 'Học tập gắn ngữ cảnh — học sinh mô tả thế giới của mình và bắt đầu đánh giá nó',
      textComplexity: 'Truyện chương hồi đầu cấp với các tình huống đạo đức rõ ràng',
      totalLessons: '40 bài học có cấu trúc mỗi năm học',
      lessonDuration: '40–60 phút mỗi bài học',
      ecoStrand: 'Hệ quả môi trường, môi trường sống và chuỗi thức ăn',
    },
    coreTexts: [
      { theme: 'Tình bạn, vòng đời và trách nhiệm ta dành cho những sinh vật khác' },
      { theme: 'Bắt nạt, can đảm đạo đức và cái giá của sự im lặng' },
      { theme: 'Di cư, bản sắc, phẩm giá và sức bền' },
      { theme: 'Hệ quả môi trường, lòng tham doanh nghiệp và đạo đức gìn giữ sinh thái' },
    ],
    coreTextNote:
      '6 nhan đề bổ sung được tuyển chọn theo bộ tiêu chí văn bản của WWL, phối hợp cùng cộng đồng nhà trường. Tất cả các văn bản được chọn đều đáp ứng chuẩn năm tiêu chí.',
    termBreakdown: [
      {
        term: 'Học kỳ 1',
        lessonRange: 'Bài 1–13',
        units: 'Học phần 1–3',
        focusPoints: [
          'Củng cố giai đoạn Analyze với văn bản dài hơn — chú giải có hướng dẫn, chỉ trực tiếp vào bằng chứng',
          'Giới thiệu Evaluate một cách chính thức: thảo luận theo cặp với tiêu chí (“Điều này có công bằng không? Dựa trên chuẩn nào?”)',
          'Mạch sinh thái: Charlotte’s Web — chuỗi thức ăn, trí tuệ động vật và trách nhiệm ta dành cho sinh vật không phải con người',
          'Thiết lập các giao thức hội thoại có trách nhiệm cho thảo luận cả lớp',
        ],
      },
      {
        term: 'Học kỳ 2',
        lessonRange: 'Bài 14–27',
        units: 'Học phần 4–7',
        focusPoints: [
          'Giai đoạn Justify đầy đủ: các đoạn văn Claim + Evidence + Warrant',
          'Thiết lập giao thức thảo luận Socratic',
          'Học phần lập luận sinh thái với The Lorax: “Doanh nghiệp có trách nhiệm gì với môi trường?”',
          'Giới thiệu Thử thách Stewardship: “Một thành viên có trách nhiệm của hệ sinh thái này sẽ hành động như thế nào?”',
        ],
      },
      {
        term: 'Học kỳ 3',
        lessonRange: 'Bài 28–40',
        units: 'Học phần 8–10',
        focusPoints: [
          'Hoàn thành Thinking Cycle một cách độc lập qua cả bốn giai đoạn',
          'Giai đoạn Reflect: câu hỏi đạo đức (“Vì sao điều này quan trọng đối với cách chúng ta sống?”)',
          'Lắp ghép portfolio: học sinh chọn 10 đoạn văn lập luận tốt nhất của mình',
          'Tự đánh giá CEFR A2 và rà soát mức sẵn sàng',
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Quan sát trong giờ học',
        frequency: 'Mỗi bài học',
        detail:
          'Giáo viên ghi nhận học sinh nào phân biệt được thông tin hiển ngôn và hàm ngôn. Giáo viên thúc đẩy bằng các câu hỏi làm rõ.',
      },
      {
        method: 'Thảo luận theo cặp',
        frequency: 'Mỗi bài học',
        detail:
          'Giáo viên lắng nghe việc sử dụng tiêu chí đánh giá. Những nhận xét đánh giá tốt được nêu bật công khai: “Đó là một đánh giá — em đã dùng một tiêu chí.”',
      },
      {
        method: 'Bài viết lập luận',
        frequency: '2–3 lần mỗi tuần',
        detail:
          'Đoạn văn Claim + Evidence + Warrant. Phản hồi trong vòng 24 giờ. Có khung câu cho người viết đang phát triển.',
      },
      {
        method: 'Phiếu thoát cuối giờ',
        frequency: 'Cuối mỗi bài học',
        detail:
          'Một câu hỏi Reflect mang tính cá nhân hoặc sinh thái. Giáo viên phân loại thành Sẵn sàng / Gần đạt / Chưa đạt.',
      },
      {
        method: 'Portfolio',
        frequency: 'Mỗi học phần × 10',
        detail:
          'Đoạn văn lập luận tốt nhất của mỗi học phần. Học sinh chú thích vì sao đoạn này thể hiện tư duy tốt nhất của mình.',
      },
      {
        method: 'Tự đánh giá CEFR',
        frequency: 'Mỗi học kỳ',
        detail:
          'Học sinh đánh dấu trên bảng mô tả A1 / A2. Giáo viên xác nhận trong buổi trao đổi; kết quả định hướng mức độ phân hóa của Học kỳ 2.',
      },
    ],
    reasoningRubric: [...viSharedRubric],
    ecoThreadSummary:
      'Cấp độ 2 là nơi lập luận sinh thái trở nên rõ ràng và có cấu trúc. Charlotte’s Web mời học sinh hỏi: “Chúng ta nợ gì đối với những sự sống không phải con người?” The Lorax buộc học sinh đánh giá quyết định của doanh nghiệp dưới góc nhìn hệ quả sinh thái. Câu hỏi Stewardship — “Một thành viên có trách nhiệm của hệ sinh thái này sẽ làm gì?” — được giới thiệu như một lời mời đối thoại chính thức. Học sinh cũng bắt đầu nhật ký quan sát thiên nhiên có cấu trúc.',
    ecoStrandLabel: 'Hệ quả môi trường, môi trường sống và chuỗi thức ăn',
    progressionFrom: 'Cấp độ 1: Nền tảng (hoặc điểm vào chương trình)',
    progressionTo: 'Cấp độ 3: Mở rộng',
    readinessStatement:
      'Học sinh sẵn sàng lên Cấp độ 3 khi có thể tự viết một đoạn văn Claim + Evidence + Warrant hoàn chỉnh, duy trì 5 phút thảo luận Socratic bằng bằng chứng văn bản, và viết phản tư cá nhân vượt khỏi mức tóm tắt để chạm tới đánh giá hoặc kết nối đạo đức. Mức sẵn sàng A2 được xác nhận qua rà soát portfolio và đánh giá của giáo viên.',
    homeSupportTips: [
      'Khuyến khích con đọc độc lập một chương sách mỗi tuần rồi kể lại quyết định thú vị nhất của nhân vật — không chỉ điều gì đã xảy ra, mà là nhân vật đã chọn gì.',
      'Hãy hỏi: “Đó có phải là một quyết định công bằng không?” rồi tiếp tục: “Bằng chứng nào trong truyện ủng hộ quan điểm của con?”',
      'Cùng xem một phim tài liệu về thiên nhiên và trao đổi: “Con người có trách nhiệm bảo vệ loài vật này không?”',
      'Yêu cầu con đọc to đoạn văn lập luận tốt nhất của mình rồi hỏi: “Warrant là gì — mối nối giữa bằng chứng và kết luận của con nằm ở đâu?”',
      'Xem lại bảng tự đánh giá CEFR mỗi học kỳ cùng con và ghi nhận tiến bộ trên thang mô tả.',
    ],
  },
  'level-3-expansion': {
    welcomeText: [
      'Chào mừng đến với Cấp độ 3: Mở rộng — năm học mà văn học trở thành một lăng kính để nhìn thế giới.',
      'Các nhà nghiên cứu gọi giai đoạn chuyển từ A2 sang B1 là “Literacy Pivot”: thời điểm tiếng Anh chuyển từ việc mô tả thế giới gần gũi sang năng lực lập luận về các ý niệm trừu tượng — công lý, ký ức, trách nhiệm tập thể, sự sống còn sinh thái. Đây là một trong những bước ngoặt quan trọng nhất trong sự phát triển trí tuệ của người học trẻ, và đó chính là công việc của Cấp độ 3.',
      'Ở cấp độ này, học sinh được kỳ vọng giữ đồng thời nhiều cách diễn giải cạnh tranh trong đầu — để có thể nói một cách trung thực về học thuật rằng: “Cả hai cách hiểu này đều có thể đúng, và đây là cách em cân nhắc chúng.” Chào mừng đến với Literacy Pivot.',
    ],
    levelAtAGlance: {
      ageRange: '10–12 tuổi',
      cefrRange: 'A2 → B1',
      cefrProgression: 'A2 → B1 (khoảng 350–400 giờ học có hướng dẫn — Literacy Pivot)',
      cognitiveFocus:
        'Literacy Pivot (Cummins): tiếng Anh chuyển từ giao tiếp xã hội sang phương tiện của lập luận học thuật',
      textComplexity: 'Truyện chương hồi với kết thúc đa nghĩa',
      totalLessons: '40 bài học có cấu trúc mỗi năm học',
      lessonDuration: '40–60 phút mỗi bài học',
      ecoStrand: 'Tuyệt chủng, bảo tồn và xung đột giữa con người với tự nhiên',
    },
    coreTexts: [
      { theme: 'Ký ức, tự do và cái giá của một xã hội bị kiểm soát' },
      { theme: 'Can đảm đạo đức, bổn phận và trách nhiệm của những con người bình thường' },
      { theme: 'Bất công chủng tộc, phẩm giá và chính trị của đất đai cùng tiếng nói' },
      { theme: 'Sinh tồn, cô lập và đạo đức của mối quan hệ giữa con người và tự nhiên' },
    ],
    coreTextNote:
      '6 nhan đề bổ sung được tuyển chọn theo bộ tiêu chí văn bản của WWL, phối hợp cùng cộng đồng nhà trường. Tối thiểu 2 học phần tích hợp sinh thái mỗi năm theo yêu cầu UNESCO ESD.',
    termBreakdown: [
      {
        term: 'Học kỳ 1',
        lessonRange: 'Bài 1–13',
        units: 'Học phần 1–3',
        focusPoints: [
          'Chuyển sang văn bản dài hơn với kết thúc đa nghĩa',
          'Giới thiệu cách diễn giải có tranh luận — nhiều cách đọc đều có thể bảo vệ được',
          'Cấu trúc đoạn văn CEIW đầy đủ (thêm Impact so với cấp độ trước)',
          'Học phần sinh thái đầu tiên: Island of the Blue Dolphins — “Hòn đảo nợ con người điều gì? Con người nợ hòn đảo điều gì?”',
        ],
      },
      {
        term: 'Học kỳ 2',
        lessonRange: 'Bài 14–27',
        units: 'Học phần 4–7',
        focusPoints: [
          'Seminar Socratic có cấu trúc với học sinh dẫn dắt thảo luận',
          'Câu hỏi lập luận sinh thái theo Systems Thinking: “Nếu ta thay đổi một yếu tố trong câu chuyện, còn điều gì khác sẽ thay đổi?”',
          'Lồng ghép quan sát ngoài trời theo địa điểm như hoạt động khởi động',
          'Tranh luận viết: chọn một lập trường, bảo vệ lập trường đó và dự liệu phản biện',
        ],
      },
      {
        term: 'Học kỳ 3',
        lessonRange: 'Bài 28–40',
        units: 'Học phần 8–10',
        focusPoints: [
          'Bài luận phân tích mở rộng: nhiều đoạn văn, duy trì cấu trúc CEIW xuyên suốt',
          'Bài portfolio phản tư sinh thái: “Tư duy sinh thái của em phát triển khi…”',
          'Tự đánh giá CEFR B1 — cột mốc chính thức của Literacy Pivot',
          'Bản nháp đầu tiên của growth narrative: “Hành trình lập luận của em cho đến lúc này”',
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Quan sát trong giờ học',
        frequency: 'Mỗi bài học',
        detail:
          'Giáo viên ghi nhận học sinh nào nhận ra các cách diễn giải cạnh tranh. Kỹ thuật Socratic pressing và revoicing được dùng để làm sâu lập luận.',
      },
      {
        method: 'Seminar Socratic',
        frequency: 'Mỗi học phần',
        detail:
          'Thảo luận do học sinh điều phối. Đánh giá theo: cách sử dụng bằng chứng, khả năng đáp lại bạn học, tiêu chí đánh giá, và phần mở rộng sinh thái trong các học phần sinh thái.',
      },
      {
        method: 'Đoạn văn CEIW',
        frequency: '2–3 lần mỗi tuần',
        detail:
          'Cấu trúc Claim–Evidence–Warrant–Impact đầy đủ. Phản hồi trong vòng 24 giờ. Người viết đang phát triển nhận khung đoạn văn từng phần.',
      },
      {
        method: 'Phản tư lập luận sinh thái',
        frequency: 'Mỗi học phần sinh thái',
        detail:
          'Bài viết: “Tư duy sinh thái của em phát triển khi em…” Giáo viên kiểm tra mức độ tham gia sinh thái thực chất chứ không chỉ nhắc tới bề mặt.',
      },
      {
        method: 'Portfolio',
        frequency: 'Mỗi học phần × 10',
        detail:
          'Đoạn văn CEIW tốt nhất cộng với phản tư sinh thái ở mỗi học phần sinh thái được chỉ định. Học sinh chú thích bằng chứng tăng trưởng.',
      },
      {
        method: 'Tự đánh giá CEFR',
        frequency: 'Mỗi học kỳ',
        detail:
          'Học sinh đánh dấu trên bảng mô tả A2 / B1. Cột mốc Literacy Pivot (B1) được xác nhận chính thức tại đây — một bước ngoặt quan trọng.',
      },
    ],
    reasoningRubric: [...viSharedRubric],
    ecoThreadSummary:
      'Cấp độ 3 giới thiệu khung lập luận sinh thái đầy đủ như một thành tố chính thức của chương trình. Tối thiểu hai học phần mỗi năm có kế hoạch bài học tích hợp sinh thái với một Câu hỏi Neo sinh thái. Học sinh vận dụng Jurassic Thinking Cycle™ vào các vấn đề tuyệt chủng, bảo tồn và xung đột giữa con người với tự nhiên. Câu hỏi Systems Thinking — “Nếu thay đổi điều này, còn điều gì khác sẽ đổi theo?” — mô hình hóa tư duy liên đới.',
    ecoStrandLabel: 'Tuyệt chủng, bảo tồn và xung đột giữa con người với tự nhiên',
    progressionFrom: 'Cấp độ 2: Phát triển',
    progressionTo: 'Cấp độ 4: Làm chủ',
    readinessStatement:
      'Học sinh sẵn sàng lên Cấp độ 4 khi có thể độc lập viết một đoạn văn phân tích CEIW đầy đủ, dẫn dắt và duy trì tranh luận có cấu trúc bằng bằng chứng văn bản, và tạo ra một phản tư sinh thái cho thấy sự dấn thân đạo đức thật sự. Mức sẵn sàng B1 — Literacy Pivot chính thức — được xác nhận qua điều phối portfolio, đánh giá của giáo viên và tự đánh giá CEFR.',
    homeSupportTips: [
      'Trao đổi với con về những bất công trong đời sống thật — học sinh Cấp độ 3 đã sẵn sàng nối văn học với tin tức, lịch sử và các sự kiện cộng đồng.',
      'Hãy hỏi: “Có thể còn một cách diễn giải khác về lựa chọn của nhân vật không?” — luyện tập việc giữ hai ý tưởng đối lập nhưng hợp lý trong cùng một lúc.',
      'Khuyến khích con duy trì nhật ký thiên nhiên hàng tuần: 5 phút quan sát ngoài trời với 3 ghi chép viết và một phác họa.',
      'Đọc một đoạn văn CEIW của con và hỏi: “Impact là gì — lập luận của con quan trọng vượt ra ngoài câu chuyện như thế nào?”',
      'Cùng xem lại mô tả B1 CEFR và ghi nhận cột mốc Literacy Pivot — đó là một thành tựu học thuật thực sự.',
    ],
  },
  'level-4-mastery': {
    welcomeText: [
      'Chào mừng đến với Cấp độ 4: Làm chủ — trung tâm của chương trình Jurassic English™.',
      'Đây là năm học của những tiểu thuyết trọn vẹn, những cách diễn giải có tranh luận, và kiểu lập luận đạo đức chuẩn bị cho học sinh bước vào đời sống học thuật ở mức cao nhất. Giai đoạn chuyển B1–B2 — B2 Plateau — là chặng đòi hỏi nhận thức nhiều nhất trong sự phát triển ngôn ngữ. Khái niệm trừu tượng, hàm ý, mỉa mai và phân tích đa góc nhìn đều được làm sắc nét ở đây.',
      'Ở Cấp độ 4, học sinh chuyển từ hiểu sang tranh luận. Các em xây dựng lập luận dựa trên bằng chứng, dự liệu phản biện, và viết bằng độ chính xác của diễn ngôn học thuật. Trong mạch lập luận sinh thái, các em đi vào công lý khí hậu, hệ tri thức bản địa, và đạo đức của stewardship.',
    ],
    levelAtAGlance: {
      ageRange: '12–14 tuổi',
      cefrRange: 'B1 → B2',
      cefrProgression: 'B1 → B2 (khoảng 500–600 giờ học có hướng dẫn — B2 Plateau)',
      cognitiveFocus: 'B2 Plateau: khái niệm trừu tượng, hàm ý, mỉa mai và phân tích đa góc nhìn',
      textComplexity: 'Tiểu thuyết trọn vẹn với nhiều cách diễn giải có thể tranh luận',
      totalLessons: '40 bài học có cấu trúc mỗi năm học',
      lessonDuration: '40–60 phút mỗi bài học',
      ecoStrand: 'Công lý khí hậu, tri thức bản địa và đạo đức stewardship',
    },
    coreTexts: [
      { theme: 'Công lý chủng tộc, can đảm đạo đức, pháp luật và ai phải trả giá' },
      { theme: 'Giới, tiếng nói, bản sắc đô thị, khát vọng và bất bình đẳng cấu trúc' },
      { theme: 'Chấn thương, ký ức và mệnh lệnh đạo đức của việc làm chứng' },
      { theme: 'Sinh tồn, tự lực và những đòi hỏi của thế giới tự nhiên' },
    ],
    coreTextNote:
      '6 nhan đề bổ sung được tuyển chọn theo bộ tiêu chí văn bản của WWL, phối hợp cùng cộng đồng nhà trường. Tối thiểu 2 học phần tích hợp sinh thái mỗi năm theo yêu cầu UNESCO ESD.',
    termBreakdown: [
      {
        term: 'Học kỳ 1',
        lessonRange: 'Bài 1–13',
        units: 'Học phần 1–3',
        focusPoints: [
          'Phân tích tiểu thuyết trọn vẹn qua các chuỗi 4 bài học kéo dài',
          'Diễn giải có tranh luận: học sinh xác định và bảo vệ nhiều cách đọc đều có thể đứng vững',
          'Bài luận CEIW mở rộng có phản biện và bác bỏ phản biện',
          'Khởi động mạch sinh thái: cộng đồng như một hệ sinh thái — bất công như sự suy thoái môi trường của kết cấu xã hội',
        ],
      },
      {
        term: 'Học kỳ 2',
        lessonRange: 'Bài 14–27',
        units: 'Học phần 4–7',
        focusPoints: [
          'Cấu trúc tranh biện chính thức — hai phía, bằng chứng văn bản, ngôn ngữ học thuật',
          'Câu hỏi sinh thái Temporal Extension: “Nếu quyết định này được giữ nguyên, nơi này sẽ trông như thế nào sau 100 năm?”',
          'Đối thoại theo góc nhìn bản địa được giới thiệu chính thức',
          'Công lý khí hậu được khung hóa như một vấn đề triết học đạo đức, không chỉ là vấn đề khoa học',
        ],
      },
      {
        term: 'Học kỳ 3',
        lessonRange: 'Bài 28–40',
        units: 'Học phần 8–10',
        focusPoints: [
          'Bài luận tổng hợp nhiều văn bản: “Hai tiểu thuyết soi sáng cùng một câu hỏi đạo đức từ những góc nhìn nào?”',
          'Tường thuật tăng trưởng trong portfolio: “Hành trình lập luận của em trong năm nay”',
          'Rà soát mức sẵn sàng B2 CEFR',
          'Chuẩn bị cho yêu cầu học thuật của Cấp độ 5 và các bối cảnh thi quốc tế',
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Quan sát trong giờ học',
        frequency: 'Mỗi bài học',
        detail:
          'Giáo viên đánh giá lập luận đa góc nhìn. Các động tác đối thoại pressing và eco-pressing được dùng để đẩy phân tích sâu hơn vị trí ban đầu.',
      },
      {
        method: 'Tranh biện chính thức',
        frequency: 'Mỗi học kỳ',
        detail:
          'Tranh biện có cấu trúc với yêu cầu về ngôn ngữ học thuật. Được đánh giá dựa trên: sức mạnh bằng chứng, chất lượng phản biện, và phần mở rộng sinh thái khi phù hợp.',
      },
      {
        method: 'Bài luận nhiều đoạn',
        frequency: 'Mỗi học phần',
        detail:
          'Cấu trúc CEIW có phản biện và bác bỏ phản biện. Phản hồi trong vòng 24 giờ. Người viết đang phát triển nhận khung bài luận với gợi mở mở.',
      },
      {
        method: 'Portfolio lập luận sinh thái',
        frequency: 'Mỗi học phần sinh thái',
        detail:
          'Phản tư theo Temporal Extension hoặc Indigenous Perspective. Giáo viên đánh giá chiều sâu triết học và mức dấn thân sinh thái thực chất.',
      },
      {
        method: 'Portfolio',
        frequency: 'Mỗi học phần × 10',
        detail:
          'Đoạn bài luận tốt nhất cộng với phản tư sinh thái trong mỗi học phần. Cuối năm: tường thuật tăng trưởng “Hành trình lập luận của em trong năm nay.”',
      },
      {
        method: 'Tự đánh giá CEFR',
        frequency: 'Mỗi học kỳ',
        detail:
          'Học sinh đánh dấu trên bảng mô tả B1 / B2. B2 — Plateau — là giai đoạn chuyển CEFR khó nhất và có thể cần 1,5–2 năm nỗ lực bền bỉ.',
      },
    ],
    reasoningRubric: [...viSharedRubric],
    ecoThreadSummary:
      'Cấp độ 4 tích hợp mạch lập luận sinh thái đòi hỏi cao nhất trong chương trình trung cấp. Công lý khí hậu được khung hóa như một vấn đề triết học đạo đức. Các hệ tri thức bản địa được giới thiệu như những khung sinh thái hợp lệ và nghiêm cẩn. Câu hỏi Temporal Extension — “Nơi này sẽ trông như thế nào sau 100 năm?” — là yêu cầu chính thức của ít nhất hai bài học tích hợp sinh thái.',
    ecoStrandLabel: 'Công lý khí hậu, tri thức bản địa và đạo đức stewardship',
    progressionFrom: 'Cấp độ 3: Mở rộng',
    progressionTo: 'Cấp độ 5: Nâng cao',
    readinessStatement:
      'Học sinh sẵn sàng lên Cấp độ 5 khi thể hiện được bài viết phân tích nhiều đoạn ở trình độ cao với phản biện và tổng hợp, có thể so sánh liên văn bản giữa hai hay nhiều tiểu thuyết, và độc lập vận dụng lập luận sinh thái — bao gồm Indigenous Perspective và Temporal Extension. Mức sẵn sàng B2 được xác nhận qua điều phối portfolio, đánh giá của giáo viên và tự đánh giá CEFR.',
    homeSupportTips: [
      'Hãy đối thoại với con như một người đồng hành trí tuệ — chia sẻ quan điểm của chính bạn về công lý, ký ức và trách nhiệm môi trường, đồng thời thật sự sẵn sàng bị thách thức.',
      'Cùng trao đổi về thời sự và hỏi: “Điều này kết nối thế nào với cuốn tiểu thuyết con vừa học?”',
      'Khuyến khích con xác định phản biện cho bất kỳ lập trường nào mình đưa ra: “Nếu ai đó không đồng ý thì họ sẽ nói gì, và con sẽ đáp lại thế nào?”',
      'Yêu cầu con giải thích câu hỏi Temporal Extension từ buổi học gần nhất. Khả năng nghĩ xa 100 năm là một năng lực chuyển giao quý giá cho mọi bối cảnh ra quyết định.',
      'Cùng xem lại WWL Four-Level Reasoning Rubric — học sinh ở giai đoạn này cần có thể tự định vị bài viết của mình một cách trung thực.',
    ],
  },
  'level-5-advanced': {
    welcomeText: [
      'Chào mừng đến với Cấp độ 5: Nâng cao — đỉnh cao của hành trình Jurassic English™.',
      'Đây là cấp độ của năng lực ngôn ngữ học thuật đầy đủ (CALP): ngôn ngữ của tạp chí học thuật, bài luận đại học, lập luận pháp lý và tranh biện trí tuệ. Ở Cấp độ 5, học sinh đi vào phân tích liên văn bản — so sánh cách các tác giả, thể loại và truyền thống văn hóa khác nhau tiếp cận cùng một câu hỏi triết học.',
      'Năm học này chuẩn bị trực tiếp cho học sinh bước vào các kỳ thi quốc tế — IB English, Cambridge Advanced, AP Literature — cũng như những yêu cầu của bài viết học thuật ở bậc đại học. Với những học sinh bắt đầu từ Cấp độ 1, đây cũng là sự hoàn tất của một hành trình phi thường: từ câu chuyện đầu tiên tới tiếng nói học thuật trọn vẹn.',
    ],
    levelAtAGlance: {
      ageRange: '14+ tuổi',
      cefrRange: 'B2 → C1',
      cefrProgression: 'B2 → C1 (khoảng 700–800+ giờ học có hướng dẫn — CALP đầy đủ)',
      cognitiveFocus: 'CALP đầy đủ: sắc thái, hàm ý, tổng hợp học thuật và chuẩn diễn ngôn của IB HL / Cambridge Advanced',
      textComplexity: 'Đa thể loại — hồi ký, châm biếm, tiểu thuyết hậu thuộc địa, tiểu luận khoa học',
      totalLessons: '40 bài học có cấu trúc mỗi năm học',
      lessonDuration: '40–60 phút mỗi bài học',
      ecoStrand: 'Tư duy hệ thống, triết học sinh thái và phê bình chính sách',
    },
    coreTexts: [
      { theme: 'Chủ nghĩa thực dân, bản sắc văn hóa và cái giá của sự thay đổi bị áp đặt' },
      { theme: 'Quyền lực, giám sát, ngôn ngữ như công cụ kiểm soát và khả năng của chân lý' },
      { theme: 'Ký ức, chấn thương, di sản của chế độ nô lệ và đạo đức của việc làm chứng' },
      { theme: 'Sự phụ thuộc lẫn nhau giữa con người và cây, nỗi đau sinh thái và đạo đức của hành động' },
      { theme: 'Tri thức sinh thái bản địa, tính có đi có lại và “ngữ pháp của sinh mệnh”' },
    ],
    coreTextNote:
      '5 nhan đề bổ sung được tuyển chọn theo bộ tiêu chí văn bản của WWL nhằm bảo đảm đa dạng thể loại, phân tích liên văn bản và chiều sâu triết học sinh thái. Tối thiểu 2 học phần tích hợp sinh thái mỗi năm theo yêu cầu UNESCO ESD.',
    termBreakdown: [
      {
        term: 'Học kỳ 1',
        lessonRange: 'Bài 1–13',
        units: 'Học phần 1–3',
        focusPoints: [
          'Phân tích liên văn bản: so sánh khung hậu thuộc địa và phản địa đàng',
          'Bài luận học thuật đầy đủ — phản biện, tổng hợp và trích dẫn chính thức',
          'Mạch sinh thái: The Overstory — nỗi đau sinh thái và đạo đức hành động như những lập trường triết học',
          'Câu hỏi Neo sinh thái: “Con người nợ cây điều gì — và vì sao?”',
        ],
      },
      {
        term: 'Học kỳ 2',
        lessonRange: 'Bài 14–27',
        units: 'Học phần 4–7',
        focusPoints: [
          'Đa dạng thể loại: hồi ký và tiểu luận khoa học-văn học như những hình thức văn chương chính thức',
          'Lập luận sinh thái kiểu phê bình chính sách: “Khủng hoảng sinh thái này đòi hỏi thay đổi hệ thống nào, và ai phải trả giá?”',
          'Câu hỏi Systems Thinking ở độ sâu triết học đầy đủ',
          'Các hệ tri thức bản địa được đánh giá trên chính hệ quy chiếu của chúng',
        ],
      },
      {
        term: 'Học kỳ 3',
        lessonRange: 'Bài 28–40',
        units: 'Học phần 8–10',
        focusPoints: [
          'Bài luận nghiên cứu mở rộng: tổng hợp chủ đề qua nhiều văn bản với trích dẫn chính thức',
          'Tường thuật tăng trưởng cuối cùng trong portfolio: “Hành trình lập luận của em qua mọi cấp độ của Jurassic English™”',
          'Tự đánh giá CEFR C1',
          'Chuẩn bị cho các kỳ thi quốc tế — IB, Cambridge Advanced, AP Literature',
        ],
      },
    ],
    assessmentMethods: [
      {
        method: 'Quan sát trong giờ học',
        frequency: 'Mỗi bài học',
        detail:
          'Giáo viên đánh giá năng lực lập luận liên văn bản, thẩm định nguồn và định vị triết học. Câu hỏi eco-pressing: “Điều này có ý nghĩa gì với thế giới sống ngoài câu chuyện?”',
      },
      {
        method: 'Bài luận học thuật',
        frequency: 'Mỗi học phần',
        detail:
          'Bài viết nhiều đoạn có phản biện, tổng hợp và trích dẫn. Phản hồi trong vòng 24 giờ. Căn chỉnh với tiêu chí đánh giá của IB/Cambridge.',
      },
      {
        method: 'Phản tư phê bình chính sách',
        frequency: 'Mỗi học phần sinh thái',
        detail:
          'Lập luận viết chính thức: “Khủng hoảng này đòi hỏi những thay đổi hệ thống nào?” Được đánh giá dựa trên chiều sâu triết học, chất lượng bằng chứng và năng lực lập luận hệ thống.',
      },
      {
        method: 'Bài luận nghiên cứu',
        frequency: 'Học kỳ 2 và 3',
        detail:
          'Tổng hợp chủ đề qua nhiều văn bản với trích dẫn chính thức. Chuẩn bị cho extended essay hoặc commentary trong các kỳ thi quốc tế.',
      },
      {
        method: 'Portfolio',
        frequency: 'Mỗi học phần × 10',
        detail:
          'Đoạn bài luận tốt nhất cộng với phản tư sinh thái cho từng học phần. Cuối năm: growth narrative tổng hợp toàn bộ hành trình Jurassic English™.',
      },
      {
        method: 'Tự đánh giá CEFR',
        frequency: 'Mỗi học kỳ',
        detail:
          'Học sinh đánh dấu trên bảng mô tả B2 / C1. Mức sẵn sàng C1 được xác nhận qua điều phối portfolio, kết quả thi và đánh giá của giáo viên.',
      },
    ],
    reasoningRubric: [...viSharedRubric],
    ecoThreadSummary:
      'Ở Cấp độ 5, lập luận sinh thái đạt tới phạm vi triết học đầy đủ. The Overstory buộc người học hình dung lại mối quan hệ giữa ý thức con người và thế giới sống. Braiding Sweetgrass được tiếp cận như một mô hình lập luận khoa học và đạo đức bản địa, vừa thách thức vừa mở rộng truyền thống phân tích phương Tây. Phê bình chính sách trở thành một nhiệm vụ đánh giá chính thức: “Khủng hoảng sinh thái này đòi hỏi những thay đổi hệ thống nào, và ai phải gánh chịu chi phí?”',
    ecoStrandLabel: 'Tư duy hệ thống, triết học sinh thái và phê bình chính sách',
    progressionFrom: 'Cấp độ 4: Làm chủ',
    progressionTo: 'Đại học / Các kỳ thi quốc tế (IB HL, Cambridge C1 Advanced, AP Literature)',
    readinessStatement:
      'Những học sinh hoàn tất Cấp độ 5 với portfolio ở trình độ Nâng cao và năng lực CEFR C1 được chứng minh sẽ sẵn sàng đầy đủ cho các kỳ thi tiếng Anh quốc tế. WWL Growth Narrative portfolio cũng cung cấp bằng chứng về sự phát triển lập luận bền vững cho hồ sơ đại học và học bổng.',
    homeSupportTips: [
      'Hãy đối thoại với thanh thiếu niên như một người trưởng thành trí tuệ — chia sẻ bài báo, tin tức quốc tế và phim tài liệu có kết nối trực tiếp với các văn bản các em đang học.',
      'Trao đổi về triết học sinh thái tại nhà: “Con có nghĩ rừng cũng có quyền không? Kimmerer sẽ trả lời thế nào?”',
      'Khuyến khích việc đọc tiếng Anh từ nhiều nguồn tin quốc tế — lập luận ở Cấp độ 5 đòi hỏi năng lực đọc hiểu thông tin đa góc nhìn.',
      'Yêu cầu con chia sẻ và thực sự bảo vệ một phản biện mà mình đã viết — hãy đáp lại như thể bạn là phía đối lập trong một cuộc tranh biện chính thức.',
      'Nếu con đã đi cùng Jurassic English™ từ Cấp độ 1, hãy dành thời gian ghi nhận một hành trình trí tuệ phi thường — từ những câu đầu tiên tới các bài luận học thuật.',
    ],
  },
};

function mergeLocalizedSyllabus(base: SyllabusData, overlay: SyllabusOverlay): SyllabusData {
  return {
    ...base,
    welcomeText: overlay.welcomeText,
    levelAtAGlance: overlay.levelAtAGlance,
    coreTexts: base.coreTexts.map((text, index) => ({
      ...text,
      theme: overlay.coreTexts[index]?.theme ?? text.theme,
    })),
    coreTextNote: overlay.coreTextNote,
    termBreakdown: base.termBreakdown.map((term, index) => ({
      ...term,
      term: overlay.termBreakdown[index]?.term ?? term.term,
      lessonRange: overlay.termBreakdown[index]?.lessonRange ?? term.lessonRange,
      units: overlay.termBreakdown[index]?.units ?? term.units,
      focusPoints: overlay.termBreakdown[index]?.focusPoints ?? term.focusPoints,
    })),
    assessmentMethods: base.assessmentMethods.map((method, index) => ({
      ...method,
      method: overlay.assessmentMethods[index]?.method ?? method.method,
      frequency: overlay.assessmentMethods[index]?.frequency ?? method.frequency,
      detail: overlay.assessmentMethods[index]?.detail ?? method.detail,
    })),
    reasoningRubric: base.reasoningRubric.map((row, index) => ({
      ...row,
      label: overlay.reasoningRubric[index]?.label ?? row.label,
      description: overlay.reasoningRubric[index]?.description ?? row.description,
    })),
    ecoThreadSummary: overlay.ecoThreadSummary,
    ecoStrandLabel: overlay.ecoStrandLabel,
    progressionFrom: overlay.progressionFrom,
    progressionTo: overlay.progressionTo,
    readinessStatement: overlay.readinessStatement,
    homeSupportTips: overlay.homeSupportTips,
  };
}

export function getSyllabusPageContent(locale: Locale) {
  return syllabusPageContentByLocale[locale];
}

export function getLocalizedSyllabusByRoutePath(pathname: string, locale: Locale): SyllabusData | null {
  const syllabus = getSyllabusByRoutePath(pathname);

  if (!syllabus) {
    return null;
  }

  if (locale === 'en') {
    return syllabus;
  }

  const overlay = viSyllabusOverlays[syllabus.slug];

  if (!overlay) {
    return syllabus;
  }

  return mergeLocalizedSyllabus(syllabus, overlay);
}

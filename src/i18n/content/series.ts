import {
  getSeriesLevelByPath,
  seriesLevels,
  type SeriesLevelDetail,
} from '../../lib/seriesContent';
import type { Locale } from '../locales';
import type { DeepWiden } from './types';

export { seriesLevels, getSeriesLevelByPath };

export type SeriesContentModule = {
  seriesLevels: typeof seriesLevels;
  getSeriesLevelByPath: typeof getSeriesLevelByPath;
};

const seriesContentByLocale: Partial<Record<Locale, SeriesContentModule>> = {
  en: {
    seriesLevels,
    getSeriesLevelByPath,
  },
};

const enSeriesComparisonContent = {
  hero: {
    backCta: 'Back to homepage',
    eyebrow: 'Series Comparison',
    title: 'Compare all five Jurassic English™ levels',
    body:
      'This view is designed for school leaders, curriculum reviewers, and adult decision-makers who need a clear progression map across ages, CEFR, text complexity, and academic focus.',
  },
  overview: {
    eyebrow: 'Cross-Level View',
    title: 'One comparison card per level',
  },
  labels: {
    level: 'Level',
    ages: 'Ages',
    cefrRange: 'CEFR Range',
    lessonsPerYear: 'Lessons / Year',
    coreTexts: 'Core Texts',
    textComplexity: 'Text Complexity',
    cognitiveFocus: 'Cognitive / Reading Focus',
    leadsTo: 'Leads To',
  },
  actions: {
    viewLevelDetails: 'View Level Details',
    demoMaterial: 'Demo Material',
    viewSyllabus: 'View Syllabus',
  },
} as const;

const viSeriesComparisonContent = {
  hero: {
    backCta: 'Quay lại trang chủ',
    eyebrow: 'So sánh chuỗi cấp độ',
    title: 'So sánh cả năm cấp độ Jurassic English™',
    body:
      'Trang này dành cho lãnh đạo nhà trường, người rà soát chương trình và người ra quyết định cần một bản đồ tiến trình rõ ràng theo độ tuổi, CEFR, độ phức tạp văn bản và trọng tâm học thuật.',
  },
  overview: {
    eyebrow: 'Góc nhìn xuyên cấp độ',
    title: 'Một thẻ so sánh cho mỗi cấp độ',
  },
  labels: {
    level: 'Cấp độ',
    ages: 'Độ tuổi',
    cefrRange: 'Dải CEFR',
    lessonsPerYear: 'Bài học / năm',
    coreTexts: 'Văn bản cốt lõi',
    textComplexity: 'Độ phức tạp văn bản',
    cognitiveFocus: 'Trọng tâm tư duy / đọc hiểu',
    leadsTo: 'Dẫn tới',
  },
  actions: {
    viewLevelDetails: 'Xem chi tiết cấp độ',
    demoMaterial: 'Tài liệu mẫu',
    viewSyllabus: 'Xem đề cương',
  },
} as const;

type SeriesComparisonContent = DeepWiden<typeof enSeriesComparisonContent>;

const seriesComparisonContentByLocale: Record<Locale, SeriesComparisonContent> = {
  en: enSeriesComparisonContent,
  vi: viSeriesComparisonContent,
};

export function getSeriesContent(locale: Locale) {
  return seriesContentByLocale[locale] ?? null;
}

export function getSeriesComparisonContent(locale: Locale) {
  return seriesComparisonContentByLocale[locale];
}

const enSeriesDetailPageContent = {
  hero: {
    backCta: 'Back to homepage',
    eyebrow: 'Series Level Detail',
    demoMaterial: 'Demo Material',
    viewSyllabus: 'View Syllabus',
    compareLevels: 'Compare All Levels',
  },
  sections: {
    glance: {
      eyebrow: 'At A Glance',
      title: 'Core level profile',
      labels: {
        ageBand: 'Age Band',
        cefrRange: 'CEFR Range',
        lessonsPerYear: 'Lessons / Year',
        coreTexts: 'Core Texts',
      },
    },
    cognitiveFocus: {
      label: 'Cognitive Focus',
    },
    textComplexity: {
      label: 'Text Complexity',
      body: 'This is the reading focus named in the syllabus for {{title}}.',
    },
    competencies: {
      eyebrow: 'Competency Focus',
      title: 'Four competencies define the work at this level.',
    },
    assessment: {
      eyebrow: 'Assessment Snapshot',
      title: 'Assessment tracks the quality of reasoning.',
    },
    progression: {
      eyebrow: 'Progression',
      title: 'What this level builds toward',
      thisLevel: 'This level develops',
      nextStage: 'Next stage',
    },
  },
} as const;

const viSeriesDetailPageContent = {
  hero: {
    backCta: 'Quay lại trang chủ',
    eyebrow: 'Chi tiết cấp độ',
    demoMaterial: 'Tài liệu mẫu',
    viewSyllabus: 'Xem đề cương',
    compareLevels: 'So sánh tất cả cấp độ',
  },
  sections: {
    glance: {
      eyebrow: 'Tổng quan nhanh',
      title: 'Hồ sơ cốt lõi của cấp độ',
      labels: {
        ageBand: 'Độ tuổi',
        cefrRange: 'Dải CEFR',
        lessonsPerYear: 'Bài học / năm',
        coreTexts: 'Văn bản cốt lõi',
      },
    },
    cognitiveFocus: {
      label: 'Trọng tâm tư duy',
    },
    textComplexity: {
      label: 'Độ phức tạp văn bản',
      body: 'Đây là trọng tâm đọc hiểu được nêu trong đề cương của {{title}}.',
    },
    competencies: {
      eyebrow: 'Trọng tâm năng lực',
      title: 'Bốn năng lực định hình công việc ở cấp độ này.',
    },
    assessment: {
      eyebrow: 'Tổng quan đánh giá',
      title: 'Đánh giá theo dõi chất lượng lập luận.',
    },
    progression: {
      eyebrow: 'Tiến trình',
      title: 'Cấp độ này xây dựng hướng tới điều gì',
      thisLevel: 'Cấp độ này phát triển',
      nextStage: 'Giai đoạn tiếp theo',
    },
  },
} as const;

type SeriesDetailPageContent = DeepWiden<typeof enSeriesDetailPageContent>;

const seriesDetailPageContentByLocale: Record<Locale, SeriesDetailPageContent> = {
  en: enSeriesDetailPageContent,
  vi: viSeriesDetailPageContent,
};

type SeriesLevelTranslation = Pick<
  SeriesLevelDetail,
  | 'title'
  | 'levelName'
  | 'tagline'
  | 'lessonsPerYear'
  | 'coreTexts'
  | 'cefrProgression'
  | 'cognitiveFocus'
  | 'textComplexity'
  | 'intro'
  | 'competencies'
  | 'assessmentSnapshot'
  | 'assessmentNote'
  | 'progression'
>;

const viSeriesLevelTranslations: Record<string, SeriesLevelTranslation> = {
  'level-1-foundation': {
    title: 'Cấp độ 1: Nền tảng',
    levelName: 'Nền tảng',
    tagline: 'Những câu chuyện đầu tiên. Những suy nghĩ đầu tiên.',
    lessonsPerYear: '40 bài học có cấu trúc mỗi năm học',
    coreTexts: '10 văn bản cốt lõi (4 bài học cho mỗi văn bản)',
    cefrProgression: 'Pre-A1 → A1 (khoảng 90–100 giờ học có hướng dẫn)',
    cognitiveFocus: 'BICS — ngữ âm, từ vựng tần suất cao, ngôn ngữ gắn với ngữ cảnh',
    textComplexity: 'Sách tranh và truyện có cấu trúc dự đoán được',
    intro: [
      'Chào mừng đến với Cấp độ 1: Nền tảng — điểm khởi đầu của một hành trình tư duy đặc biệt.',
      'Ở cấp độ này, trẻ sẽ khám phá thế giới qua những sách tranh và truyện ngắn được tuyển chọn cẩn thận. Ngay từ bài học đầu tiên, trẻ sẽ được mời suy nghĩ thành lời, chia sẻ quan điểm và dùng chính ngôn ngữ của văn bản để giải thích điều mình tin là đúng.',
    ],
    competencies: [
      {
        title: 'Tư duy phản biện',
        description:
          'Học sinh bắt đầu nhận ra điều gì đang diễn ra trong câu chuyện và phân biệt điều các em quan sát được với điều các em suy luận ra.',
      },
      {
        title: 'Tư duy luân lý',
        description:
          'Học sinh cân nhắc việc lựa chọn của nhân vật là đúng hay sai, và giải thích bằng một lý do đơn giản.',
      },
      {
        title: 'Phản tư có cấu trúc',
        description:
          'Học sinh kết nối chủ đề của câu chuyện với cuộc sống của chính mình: “Điều này gợi cho em nhớ đến…”.',
      },
      {
        title: 'Diễn đạt học thuật',
        description:
          'Học sinh dùng khung câu để nêu ý kiến bằng lời và viết những câu lập luận đầu tiên của mình.',
      },
    ],
    assessmentSnapshot: [
      'Quan sát bài học trong từng buổi: giáo viên ghi nhận học sinh nào đưa ra bằng chứng thay vì chỉ nêu ý kiến.',
      'Bài viết lập luận 2–3 lần mỗi tuần: một câu Claim + Evidence với phản hồi được trả trong vòng 24 giờ.',
      'Phiếu thoát cuối mỗi buổi học: một câu hỏi Reflect; học sinh trả lời bằng một câu.',
      'Tự đánh giá CEFR mỗi học kỳ trên bảng mô tả Pre-A1 / A1.',
    ],
    assessmentNote:
      'Tất cả các bài viết lập luận đều được đánh giá bằng WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        'Đến cuối năm học này, học sinh có thể phân tích câu chuyện, đánh giá lựa chọn của nhân vật và viết những ý kiến có lý lẽ đầu tiên.',
      nextStageTitle: 'Dẫn tới Cấp độ 2: Phát triển',
      nextStageSummary:
        'Ở Cấp độ 2, học sinh chuyển từ sách tranh sang truyện chương hồi và bắt đầu viết các đoạn văn lập luận hoàn chỉnh.',
    },
  },
  'level-2-development': {
    title: 'Cấp độ 2: Phát triển',
    levelName: 'Phát triển',
    tagline: 'Người học lớn lên. Tư duy trưởng thành.',
    lessonsPerYear: '40 bài học có cấu trúc mỗi năm học',
    coreTexts: '10 văn bản cốt lõi (4 bài học cho mỗi văn bản)',
    cefrProgression: 'A1 → A2 (khoảng 180–200 giờ học có hướng dẫn, 6–10 tháng ở cường độ cao)',
    cognitiveFocus: 'Học tập gắn ngữ cảnh — học sinh mô tả thế giới của mình và bắt đầu đánh giá nó',
    textComplexity: 'Truyện chương hồi đầu cấp với các tình huống đạo đức rõ ràng',
    intro: [
      'Chào mừng đến với Cấp độ 2: Phát triển — nơi tư duy trở thành một thói quen có kỷ luật.',
      'Ở cấp độ này, trẻ chuyển từ sách tranh sang truyện chương hồi: dài hơn, phong phú hơn và chứa đựng những câu hỏi đạo đức không có đáp án dễ dàng. Trẻ học cách dùng bằng chứng văn bản để bảo vệ quan điểm, cấu trúc lập luận trong viết, và lắng nghe kỹ lập luận của bạn cùng lớp.',
    ],
    competencies: [
      {
        title: 'Tư duy phản biện',
        description:
          'Học sinh phân biệt thông tin hiển ngôn và hàm ngôn, nhận ra góc nhìn trần thuật và chú ý đến các lựa chọn nghệ thuật của tác giả.',
      },
      {
        title: 'Tư duy luân lý',
        description:
          'Học sinh đánh giá quyết định của nhân vật dựa trên tiêu chí rõ ràng: công bằng, hệ quả, ai được giúp, ai bị ảnh hưởng.',
      },
      {
        title: 'Phản tư có cấu trúc',
        description:
          'Học sinh kết nối chủ đề văn bản với trải nghiệm cá nhân, với cộng đồng rộng hơn và lần đầu tiên với thế giới tự nhiên.',
      },
      {
        title: 'Diễn đạt học thuật',
        description:
          'Học sinh viết đoạn văn Claim + Evidence và duy trì các cuộc trao đổi có trách nhiệm trong cặp đôi và toàn lớp.',
      },
    ],
    assessmentSnapshot: [
      'Quan sát bài học trong từng buổi: giáo viên ghi nhận học sinh nào phân biệt được thông tin hiển ngôn và hàm ngôn.',
      'Thảo luận theo cặp trong từng buổi: giáo viên lắng nghe cách dùng tiêu chí đánh giá và nêu bật các đánh giá mạnh.',
      'Bài viết lập luận 2–3 lần mỗi tuần: đoạn văn Claim + Evidence + Warrant với phản hồi trong vòng 24 giờ.',
      'Tự đánh giá CEFR mỗi học kỳ trên bảng mô tả A1 / A2.',
    ],
    assessmentNote:
      'Tất cả các bài viết lập luận đều được đánh giá bằng WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        'Đến cuối năm học này, học sinh có thể viết đoạn văn lập luận hoàn chỉnh, dẫn dắt một cuộc thảo luận có cấu trúc và kết nối văn học với cuộc sống của mình cũng như với thế giới sinh thái.',
      nextStageTitle: 'Dẫn tới Cấp độ 3: Mở rộng',
      nextStageSummary:
        'Cấp độ 3 là Literacy Pivot: tiếng Anh chuyển từ mô tả thế giới gần gũi sang lập luận về các ý tưởng trừu tượng ở nhiều môn học.',
    },
  },
  'level-3-expansion': {
    title: 'Cấp độ 3: Mở rộng',
    levelName: 'Mở rộng',
    tagline: 'Văn bản phức hợp. Tư duy sâu hơn.',
    lessonsPerYear: '40 bài học có cấu trúc mỗi năm học',
    coreTexts: '10 văn bản cốt lõi (4 bài học cho mỗi văn bản)',
    cefrProgression: 'A2 → B1 (khoảng 350–400 giờ học có hướng dẫn — Literacy Pivot)',
    cognitiveFocus:
      'Literacy Pivot (Cummins): tiếng Anh chuyển từ giao tiếp xã hội sang phương tiện lập luận học thuật xuyên môn',
    textComplexity: 'Truyện chương hồi với kết thúc đa nghĩa',
    intro: [
      'Chào mừng đến với Cấp độ 3: Mở rộng — năm học mà văn học trở thành một lăng kính để nhìn thế giới.',
      'Các nhà nghiên cứu gọi bước chuyển từ A2 lên B1 là “Literacy Pivot”: thời điểm tiếng Anh không còn chỉ dùng để mô tả thế giới trước mắt mà trở thành công cụ lập luận về những ý tưởng trừu tượng. Ở cấp độ này, học sinh được kỳ vọng giữ nhiều cách diễn giải có thể đúng cùng một lúc và giải thích cách mình cân nhắc giữa chúng.',
    ],
    competencies: [
      {
        title: 'Tư duy phản biện',
        description:
          'Học sinh phân tích tự sự ở nhiều tầng: cốt truyện, động cơ nhân vật, thủ pháp tác giả và các giả định văn hóa. Các em giữ cùng lúc nhiều cách diễn giải có thể bảo vệ được.',
      },
      {
        title: 'Tư duy luân lý',
        description:
          'Học sinh xử lý các tình huống đạo đức không có một đáp án duy nhất, dùng các khung đạo đức để xây dựng và bảo vệ quan điểm.',
      },
      {
        title: 'Phản tư có cấu trúc',
        description:
          'Học sinh dịch chuyển giữa phản tư cá nhân, phổ quát, đạo đức, siêu nhận thức và sinh thái, rồi chọn lăng kính hiệu quả nhất cho từng văn bản.',
      },
      {
        title: 'Diễn đạt học thuật',
        description:
          'Học sinh viết đoạn phân tích CEIW hoàn chỉnh và dẫn dắt các seminar Socratic có cấu trúc.',
      },
    ],
    assessmentSnapshot: [
      'Quan sát bài học trong từng buổi: giáo viên ghi nhận học sinh nào nhận ra các cách diễn giải cạnh tranh và dùng Socratic pressing/revoicing để đào sâu lập luận.',
      'Socratic seminar theo từng đơn vị: được đánh giá dựa trên cách dùng bằng chứng, phản hồi với bạn học, tiêu chí đánh giá và mở rộng sinh thái trong các đơn vị eco.',
      'Đoạn văn CEIW 2–3 lần mỗi tuần: cấu trúc Claim–Evidence–Warrant–Impact hoàn chỉnh với phản hồi trong vòng 24 giờ.',
      'Tự đánh giá CEFR mỗi học kỳ trên bảng mô tả A2 / B1; mốc Literacy Pivot (B1) được xác nhận chính thức tại đây.',
    ],
    assessmentNote:
      'Tất cả các bài viết lập luận đều được đánh giá bằng WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        'Ở cấp độ này, học sinh có thể xử lý những văn bản có kết thúc thật sự đa nghĩa mà không tìm kiếm một đáp án “đúng” duy nhất.',
      nextStageTitle: 'Dẫn tới Cấp độ 4: Thành thạo',
      nextStageSummary:
        'Cấp độ 4 chuyển sang các tiểu thuyết hoàn chỉnh, các cách diễn giải tranh luận được và bước chuyển B1–B2 được gọi là B2 Plateau.',
    },
  },
  'level-4-mastery': {
    title: 'Cấp độ 4: Thành thạo',
    levelName: 'Thành thạo',
    tagline: 'Tiểu thuyết. Sự tinh tế. Những vấn đề thật.',
    lessonsPerYear: '40 bài học có cấu trúc mỗi năm học',
    coreTexts: '10 văn bản cốt lõi (4 bài học cho mỗi văn bản)',
    cefrProgression: 'B1 → B2 (khoảng 500–600 giờ học có hướng dẫn — B2 Plateau)',
    cognitiveFocus:
      'B2 Plateau: khái niệm trừu tượng, ẩn ý, mỉa mai và phân tích đa góc nhìn. Văn học chất lượng cao là phương tiện hiệu quả nhất cho bước chuyển này.',
    textComplexity: 'Tiểu thuyết hoàn chỉnh với các cách diễn giải có thể tranh luận',
    intro: [
      'Chào mừng đến với Cấp độ 4: Thành thạo — trái tim của chương trình Jurassic English™.',
      'Đây là năm học của tiểu thuyết trọn vẹn, của những cách diễn giải có thể tranh luận và của kiểu lập luận đạo đức chuẩn bị cho đời sống học thuật ở mức cao nhất. Ở Cấp độ 4, học sinh chuyển từ hiểu sang tranh luận: các em xây dựng lập luận dựa trên bằng chứng, dự liệu phản biện và viết với độ chính xác của diễn ngôn học thuật.',
    ],
    competencies: [
      {
        title: 'Tư duy phản biện',
        description:
          'Học sinh tạo ra phân tích liên văn bản ở mức nâng cao — so sánh cách các tác giả khác nhau xử lý cùng một câu hỏi đạo đức trong các bối cảnh văn hóa và lịch sử khác nhau.',
      },
      {
        title: 'Tư duy luân lý',
        description:
          'Học sinh xây dựng các lập luận đạo đức chính thức bằng những khung đạo đức đã xác lập, dự liệu phản biện và viết với cấu trúc của lập luận học thuật.',
      },
      {
        title: 'Phản tư có cấu trúc',
        description:
          'Học sinh áp dụng phản tư sinh thái ở chiều sâu — bao gồm mở rộng theo thời gian (“100 năm nữa”) và góc nhìn bản địa như những lăng kính lập luận chính thức.',
      },
      {
        title: 'Diễn đạt học thuật',
        description:
          'Học sinh viết bài luận phân tích nhiều đoạn với phản biện và bác bỏ phản biện, đồng thời tham gia tranh biện chính thức với độ chính xác học thuật.',
      },
    ],
    assessmentSnapshot: [
      'Quan sát bài học trong từng buổi: giáo viên đánh giá lập luận đa góc nhìn. Các động tác đối thoại pressing và eco-pressing được dùng để đào sâu phân tích vượt qua lập trường ban đầu.',
      'Tranh biện chính thức theo từng học kỳ: có yêu cầu ngôn ngữ học thuật. Được đánh giá theo độ mạnh của bằng chứng, chất lượng phản biện và mở rộng sinh thái khi phù hợp.',
      'Bài luận nhiều đoạn theo từng đơn vị: cấu trúc CEIW với phản biện và bác bỏ phản biện. Phản hồi trong vòng 24 giờ.',
      'Hồ sơ eco-reasoning theo từng đơn vị eco: phản tư Temporal Extension hoặc Indigenous Perspective. Giáo viên đánh giá chiều sâu triết học và mức độ gắn kết sinh thái thực chất.',
      'Tự đánh giá CEFR mỗi học kỳ trên bảng mô tả B1 / B2; B2 Plateau là bước chuyển khó nhất và có thể cần 1.5–2 năm nỗ lực bền bỉ.',
    ],
    assessmentNote:
      'Tất cả các bài viết lập luận đều được đánh giá bằng WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        'Cấp độ này chuẩn bị cho học sinh bước vào Cấp độ 5 với khả năng viết phân tích nhiều đoạn, tranh biện chính thức và so sánh liên văn bản ở trình độ cao.',
      nextStageTitle: 'Dẫn tới Cấp độ 5: Nâng cao',
      nextStageSummary:
        'Cấp độ 5 hướng tới CALP đầy đủ, phân tích liên văn bản tinh vi và chuẩn bị trực tiếp cho các bối cảnh thi cử quốc tế.',
    },
  },
  'level-5-advanced': {
    title: 'Cấp độ 5: Nâng cao',
    levelName: 'Nâng cao',
    tagline: 'Giọng điệu học thuật đầy đủ. Tư duy ở đẳng cấp cao.',
    lessonsPerYear: '40 bài học có cấu trúc mỗi năm học',
    coreTexts: '10 văn bản cốt lõi (4 bài học cho mỗi văn bản)',
    cefrProgression: 'B2 → C1 (khoảng 700–800+ giờ học có hướng dẫn — CALP đầy đủ)',
    cognitiveFocus:
      'CALP đầy đủ: sắc thái nghĩa, hàm ý, tổng hợp học thuật và thanh giọng của IB HL / Cambridge Advanced',
    textComplexity: 'Văn bản phức tạp, đa lớp, có chiều sâu liên văn bản',
    intro: [
      'Chào mừng đến với Cấp độ 5: Nâng cao — điểm hoàn tất của hành trình Jurassic English™.',
      'Đây là cấp độ của Cognitive Academic Language Proficiency (CALP) hoàn chỉnh: thanh giọng của bài luận đại học, tranh luận học thuật và tổng hợp tri thức nghiêm ngặt. Ở Cấp độ 5, học sinh phân tích liên văn bản, so sánh cách các tác giả, thể loại và truyền thống văn hóa khác nhau tiếp cận cùng một câu hỏi triết học.',
    ],
    competencies: [
      {
        title: 'Tư duy phản biện',
        description:
          'Học sinh tạo ra các phân tích liên văn bản, triết học và tu từ ở trình độ cao, đối thoại với nhiều nguồn và nhiều lập trường cùng lúc.',
      },
      {
        title: 'Tư duy luân lý',
        description:
          'Học sinh xây dựng lập luận tinh vi về nghĩa vụ, công lý, ký ức, quyền lực và trách nhiệm sinh thái bằng hệ quy chiếu đạo đức rõ ràng.',
      },
      {
        title: 'Phản tư có cấu trúc',
        description:
          'Học sinh thực hiện phản tư ở cấp độ cá nhân, xã hội, lịch sử và sinh thái với mức độ chín muồi đủ cho bối cảnh học thuật quốc tế.',
      },
      {
        title: 'Diễn đạt học thuật',
        description:
          'Học sinh viết bài luận nghiên cứu, bài tổng hợp liên văn bản và các phản hồi phân tích ở mức độ tương thích với IB / Cambridge Advanced.',
      },
    ],
    assessmentSnapshot: [
      'Quan sát bài học trong từng buổi: giáo viên đánh giá lập luận liên văn bản, năng lực thẩm định nguồn và định vị triết học.',
      'Bài luận học thuật theo từng đơn vị: nhiều đoạn, có phản biện, tổng hợp và trích dẫn, phù hợp với tiêu chí đánh giá IB/Cambridge.',
      'Bài nghiên cứu ở Học kỳ 2 và 3: tổng hợp chủ đề từ nhiều văn bản với trích dẫn chính thức.',
      'Tự đánh giá CEFR mỗi học kỳ trên bảng mô tả B2 / C1; mức sẵn sàng C1 được xác nhận thông qua điều tiết hồ sơ, kết quả kiểm tra và đánh giá giáo viên.',
    ],
    assessmentNote:
      'Tất cả các bài viết lập luận đều được đánh giá bằng WWL Four-Level Reasoning Rubric.',
    progression: {
      thisLevel:
        'Năm học này chuẩn bị trực tiếp cho học sinh bước vào các kỳ thi quốc tế và yêu cầu của viết học thuật bậc đại học.',
      nextStageTitle: 'Kết quả của toàn bộ chuỗi',
      nextStageSummary:
        'Với học sinh bắt đầu từ Cấp độ 1, đây là điểm hoàn tất hành trình từ câu chuyện đầu tiên đến một giọng điệu học thuật trưởng thành.',
    },
  },
};

function mergeSeriesLevel(
  baseLevel: SeriesLevelDetail,
  locale: Locale,
): SeriesLevelDetail {
  if (locale === 'en') {
    return baseLevel;
  }

  const translation = viSeriesLevelTranslations[baseLevel.slug];

  if (!translation) {
    return baseLevel;
  }

  return {
    ...baseLevel,
    ...translation,
    competencies: translation.competencies,
    intro: translation.intro,
    assessmentSnapshot: translation.assessmentSnapshot,
    progression: translation.progression,
  };
}

export function getLocalizedSeriesLevels(locale: Locale) {
  return seriesLevels.map((level) => mergeSeriesLevel(level, locale));
}

export function getLocalizedSeriesLevelByPath(pathname: string, locale: Locale) {
  const baseLevel = getSeriesLevelByPath(pathname);

  if (!baseLevel) {
    return null;
  }

  return mergeSeriesLevel(baseLevel, locale);
}

export function getSeriesDetailPageContent(locale: Locale) {
  return seriesDetailPageContentByLocale[locale];
}

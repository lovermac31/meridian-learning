import * as enFrameworkContent from '../../lib/frameworkContent';
import type { Locale } from '../locales';

export type FrameworkContentModule = typeof enFrameworkContent;

const viFrameworkContent: FrameworkContentModule = {
  frameworkResearchDomains: [
    {
      title: 'Tư duy phản biện',
      description:
        'Khung học thuật tích hợp trực tiếp các yếu tố của tư duy và các chuẩn mực trí tuệ vào hệ thống câu hỏi, đối thoại và lập luận viết.',
    },
    {
      title: 'Phát triển đạo đức',
      description:
        'Tư duy luân lý được xem là một năng lực phát triển theo giai đoạn, hình thành qua phân tích tình huống tiến thoái lưỡng nan và phán đoán có biện minh.',
    },
    {
      title: 'Năng lực đọc viết chuyên biệt',
      description:
        'Văn học được sử dụng như một công cụ của tư duy chuyên môn, chứ không chỉ là nguồn luyện tập ngôn ngữ.',
    },
    {
      title: 'Học nghề nhận thức',
      description:
        'Mô hình hóa của giáo viên, giàn giáo và chuyển giao dần dần hỗ trợ học sinh tiến tới năng lực lập luận độc lập.',
    },
    {
      title: 'Sư phạm duy trì văn hóa',
      description:
        'Tính đáp ứng văn hóa được xem là một nguồn lực trí tuệ, giúp tăng chiều sâu cho diễn giải, đối thoại và phán đoán.',
    },
    {
      title: 'Tiến trình SLA và CEFR',
      description:
        'Sự phát triển ngôn ngữ được lập kế hoạch song song với yêu cầu nhận thức, bao gồm hỗ trợ phát triển bền vững hướng tới ngưỡng B2.',
    },
    {
      title: 'Giáo dục sinh thái trọng tâm',
      description:
        'Năng lực đọc hiểu sinh thái, việc lựa chọn văn bản gắn với địa điểm và mối quan hệ giữa con người với tự nhiên trở thành những miền khảo cứu hợp lệ.',
    },
    {
      title: 'Giáo dục vì phát triển bền vững',
      description:
        'Tư duy phản biện, tư duy hệ thống và tư duy dự báo mở rộng khung học thuật vào trách nhiệm sinh thái và công dân.',
    },
  ],
  frameworkEvidenceBase: [
    'Giáo dục đạo đức dựa trên văn học củng cố khả năng đồng cảm với nhân vật, tiếp nhận nhiều góc nhìn và diễn giải đạo đức.',
    'Đối thoại lớp học có cấu trúc nâng cao chất lượng lập luận, thảo luận và phát ngôn có trách nhiệm.',
    'Viết biện minh giúp sử dụng bằng chứng tốt hơn và tăng tính kỷ luật trong diễn đạt học thuật.',
    'Phân tích văn bản xuyên văn hóa đào sâu diễn giải và mở rộng khả năng tiếp nhận góc nhìn.',
    'Các văn bản gắn với tự nhiên và sinh thái hỗ trợ sự đồng cảm sinh thái và nhận thức môi trường.',
    'Giáo dục gắn địa điểm nâng cao động lực học tập bằng cách neo việc học vào bối cảnh địa phương và sinh thái.',
    'CLIL và dạy học tích hợp nội dung hỗ trợ phát triển ngôn ngữ thông qua sự tham gia có ý nghĩa vào tri thức.',
  ],
  frameworkConceptualModel: [
    {
      layer: 'Nhận thức luận',
      question: 'Làm thế nào để biết điều gì là đúng?',
      locus: 'Tiêu chí chọn văn bản và thiết kế tình huống đạo đức',
    },
    {
      layer: 'Sư phạm',
      question: 'Làm thế nào để dạy lập luận?',
      locus: 'Jurassic Thinking Cycle™, thứ bậc câu hỏi và đối thoại có trách nhiệm',
    },
    {
      layer: 'Vận hành',
      question: 'Giáo viên và học sinh thực sự làm gì?',
      locus: 'Mẫu kế hoạch bài học, mô hình 40/60 phút và hệ thống rubric',
    },
  ],
  frameworkInstructionalStandards: [
    {
      title: 'Đa dạng hóa sự tham gia',
      description:
        'Học sinh được tiếp cận sự lựa chọn có ý nghĩa về hình thức phản hồi và bối cảnh, trong khi vẫn ở trong cùng một khung lập luận.',
    },
    {
      title: 'Đa dạng hóa cách tiếp cận nội dung',
      description:
        'Văn bản có thể được tiếp cận qua các kênh trực quan, thính giác và vận động mà không làm giảm yêu cầu nhận thức.',
    },
    {
      title: 'Đa dạng hóa hành động và diễn đạt',
      description:
        'Học sinh thể hiện lập luận qua bài viết, tranh biện, phản hồi nghệ thuật, kể chuyện số và quan sát sinh thái.',
    },
    {
      title: 'Phân hóa theo ngôn ngữ và lập luận',
      description:
        'Hỗ trợ trải dài từ bảng thuật ngữ và khung câu cho tới điều tra độc lập và chuyển giao siêu nhận thức.',
    },
    {
      title: 'Tiếp cận có tính điều hòa',
      description:
        'Vận động, chuyển tiếp cảm giác và các nhịp điều chỉnh chú ý được xem là điều kiện bảo toàn khả năng học, chứ không phải sự gián đoạn.',
    },
  ],
  frameworkEcocentricExtension: {
    intro:
      'Phiên bản 3.0 mở rộng khung học thuật thông qua lập luận sinh thái trọng tâm. Thế giới sống trở thành một miền khảo cứu đạo đức và trí tuệ hợp lệ, chứ không còn là một chủ đề trang trí.',
    metaphor:
      'Ẩn dụ Jurassic được sử dụng có chủ đích: ngôn ngữ là hồ sơ hóa thạch của tư duy, câu chuyện là các tầng địa chất nơi giá trị được bảo tồn, và học sinh trở thành những nhà cổ sinh vật học của ý nghĩa.',
    reflectionRule:
      'Từ Cấp độ 3 trở lên, giáo viên được kỳ vọng đưa ít nhất một câu hỏi phản tư sinh thái vào mỗi học phần.',
    reflectionTypes: [
      'Phản tư cá nhân kết nối văn bản với trải nghiệm sống.',
      'Phản tư phổ quát rút ra bài học cho cộng đồng con người rộng hơn.',
      'Phản tư đạo đức đặt câu hỏi câu chuyện này có ý nghĩa gì với cách chúng ta sống.',
      'Phản tư siêu nhận thức theo dõi cách tư duy thay đổi.',
      'Phản tư sinh thái đặt câu hỏi câu chuyện tạo ra trách nhiệm gì đối với thế giới sống.',
    ],
    textCriteria: [
      'Mối quan hệ có ý nghĩa giữa con người và tự nhiên',
      'Hệ quả môi trường',
      'Đạo đức gìn giữ',
      'Tư duy hệ thống sinh thái',
      'Tri thức sinh thái bản địa khi phù hợp',
    ],
  },
  frameworkGovernance: [
    {
      title: 'Rà soát kế hoạch bài học',
      cadence: 'Mỗi học kỳ',
      description:
        'Một mẫu kế hoạch bài học được xem xét để xác nhận mức độ trung thành với kiến trúc lập luận của khung học thuật.',
    },
    {
      title: 'Quan sát lớp học',
      cadence: 'Hằng năm',
      description:
        'Các bài dạy được quan sát hoặc ghi hình sẽ được rà soát theo một rubric triển khai chung ở các mức mở rộng cao hơn.',
    },
    {
      title: 'Kiểm định portfolio học sinh',
      cadence: 'Hằng năm',
      description:
        'Hoạt động kiểm định liên lớp giúp hiệu chuẩn bài làm của học sinh theo các chuẩn lập luận của khung học thuật.',
    },
    {
      title: 'Rà soát dữ liệu',
      cadence: 'Hằng năm',
      description:
        'Lãnh đạo chương trình xem xét xu hướng phân loại và minh chứng đánh giá để nhận diện điểm mạnh và khoảng trống.',
    },
    {
      title: 'Gia hạn chương trình',
      cadence: 'Mỗi 3 năm',
      description:
        'Nội dung chương trình và nền tảng nghiên cứu được rà soát chính thức thay vì để tự trôi dạt.',
    },
  ],
  frameworkScalability: [
    {
      title: 'Bảo toàn chất lượng khi mở rộng',
      description:
        'Khung học thuật xem mở rộng mà không giữ được độ trung thành là sự pha loãng. Tăng trưởng chỉ hợp lệ khi kiến trúc trí tuệ cốt lõi vẫn được giữ nguyên.',
    },
    {
      title: 'Bậc 1: Khởi động ở một lớp học',
      description:
        'Giáo viên bắt đầu bằng việc nghiên cứu khung học thuật, dạy bài đầu tiên, hoàn thành một học phần trọn vẹn và nộp minh chứng phản tư.',
    },
    {
      title: 'Bậc 2: Triển khai theo tổ bộ môn hoặc khối lớp',
      description:
        'Một nhóm giáo viên cùng lập kế hoạch, tham gia chu kỳ quan sát và hiệu chuẩn đánh giá thông qua kiểm định.',
    },
    {
      title: 'Mô hình hợp tác theo tầng',
      description:
        'Việc triển khai được hỗ trợ bằng chứng nhận, quy trình chung và hạ tầng bảo đảm chất lượng, chứ không dựa trên áp dụng không chính thức.',
    },
  ],
};

const enFrameworkPageContent = {
  hero: {
    backCta: 'Back to homepage',
    eyebrow: 'Framework Deep Dive',
    title: 'The deeper architecture behind Jurassic English™',
    body:
      'This is the detailed view for curriculum leaders, academic reviewers, and institutional decision-makers who need to understand the framework’s research base, instructional standards, ecological extension, governance, and implementation logic.',
    highlights: [
      'Research-informed and literature-centered',
      'Instructionally disciplined and standards-aware',
      'Governed for fidelity, scalability, and long-term implementation',
    ],
  },
  sections: {
    coreModel: {
      eyebrow: 'Core Model',
      title: 'Three levels hold the framework together.',
      body:
        'The guidebook frames Jurassic English™ at three linked levels: what counts as sound judgment, how reasoning is taught, and what teachers and students actually do in the lesson.',
    },
    researchBase: {
      eyebrow: 'Research Base',
      title: 'The framework stands on a clear research spine.',
      body:
        'The v3.0 guidebook grounds the framework in critical thinking, moral development, disciplinary literacy, cognitive apprenticeship, culturally sustaining pedagogy, language progression, ecocentric education, and Education for Sustainable Development.',
      practiceTitle: 'Evidence in Practice',
      practiceBody: 'The guidebook’s empirical base translated into classroom relevance',
    },
    instructionalStandards: {
      eyebrow: 'Instructional Design Standards',
      title: 'Access varies. Cognitive challenge does not.',
      body:
        'The framework combines UDL, differentiation, and self-regulation principles so students can reach the same reasoning architecture through different access pathways.',
    },
    ecocentricExtension: {
      eyebrow: 'Ecocentric Reasoning Extension',
      title: 'Version 3.0 expands the framework without replacing it.',
      practiceTitle: 'What changes in practice',
      criteriaLabel: 'Ecocentric Text Selection Criteria',
    },
    governance: {
      eyebrow: 'Governance and Fidelity',
      title: 'The framework is governed, audited, and versioned.',
      body:
        'The guidebook positions quality assurance as a formal part of implementation, not an optional add-on. Review, moderation, and renewal are built into the model.',
    },
    scalability: {
      eyebrow: 'Scalability and Implementation',
      title: 'Growth is only valid when fidelity stays intact.',
      body:
        'The v3.0 guidebook frames expansion as a tiered implementation pathway supported by shared protocols, certification, and quality assurance.',
    },
    nextStep: {
      eyebrow: 'Next Step',
      title: 'Explore implementation with the full framework in view.',
      body:
        'If you are reviewing Jurassic English™ for school adoption, training, licensing, or curriculum design, the next conversation should begin from both pedagogy and implementation.',
      primaryCta: 'Get Started',
      secondaryCta: 'Return to homepage',
    },
  },
} as const;

const viFrameworkPageContent = {
  hero: {
    backCta: 'Quay lại trang chủ',
    eyebrow: 'Khám phá sâu khung học thuật',
    title: 'Kiến trúc sâu hơn phía sau Jurassic English™',
    body:
      'Đây là góc nhìn chi tiết dành cho lãnh đạo chương trình, người rà soát học thuật và người ra quyết định trong tổ chức cần hiểu rõ nền tảng nghiên cứu, chuẩn thiết kế giảng dạy, mở rộng sinh thái, cơ chế quản trị và logic triển khai của khung học thuật.',
    highlights: [
      'Dựa trên nghiên cứu và đặt văn học ở trung tâm',
      'Kỷ luật trong giảng dạy và có đối sánh chuẩn',
      'Được quản trị để giữ vững độ trung thành, khả năng mở rộng và triển khai dài hạn',
    ],
  },
  sections: {
    coreModel: {
      eyebrow: 'Mô hình cốt lõi',
      title: 'Ba tầng gắn kết toàn bộ khung học thuật.',
      body:
        'Sổ tay hướng dẫn đặt Jurassic English™ trên ba tầng liên kết: điều gì được xem là phán đoán đúng đắn, cách lập luận được giảng dạy, và giáo viên cùng học sinh thực sự làm gì trong bài học.',
    },
    researchBase: {
      eyebrow: 'Nền tảng nghiên cứu',
      title: 'Khung học thuật đứng trên một trục nghiên cứu rõ ràng.',
      body:
        'Sổ tay phiên bản 3.0 đặt nền móng khung học thuật trên tư duy phản biện, phát triển đạo đức, năng lực đọc viết chuyên biệt, học nghề nhận thức, sư phạm duy trì văn hóa, tiến trình ngôn ngữ, giáo dục sinh thái trọng tâm và Giáo dục vì Phát triển Bền vững.',
      practiceTitle: 'Bằng chứng trong thực hành',
      practiceBody: 'Nền tảng thực nghiệm của sổ tay được chuyển hóa thành ý nghĩa lớp học',
    },
    instructionalStandards: {
      eyebrow: 'Chuẩn thiết kế giảng dạy',
      title: 'Lối tiếp cận có thể khác nhau. Thách thức nhận thức thì không.',
      body:
        'Khung học thuật kết hợp UDL, phân hóa và các nguyên tắc tự điều hòa để học sinh đi tới cùng một kiến trúc lập luận qua những lộ trình tiếp cận khác nhau.',
    },
    ecocentricExtension: {
      eyebrow: 'Mở rộng lập luận sinh thái trọng tâm',
      title: 'Phiên bản 3.0 mở rộng khung học thuật mà không thay thế nó.',
      practiceTitle: 'Điều gì thay đổi trong thực hành',
      criteriaLabel: 'Tiêu chí chọn văn bản sinh thái trọng tâm',
    },
    governance: {
      eyebrow: 'Quản trị và độ trung thành',
      title: 'Khung học thuật được quản trị, kiểm định và quản lý phiên bản.',
      body:
        'Sổ tay định vị bảo đảm chất lượng như một phần chính thức của quá trình triển khai, không phải một phần bổ sung tùy chọn. Rà soát, kiểm định và gia hạn đều được tích hợp vào mô hình.',
    },
    scalability: {
      eyebrow: 'Khả năng mở rộng và triển khai',
      title: 'Tăng trưởng chỉ hợp lệ khi độ trung thành vẫn nguyên vẹn.',
      body:
        'Sổ tay phiên bản 3.0 xây dựng việc mở rộng như một lộ trình triển khai theo tầng, được hỗ trợ bởi quy trình chung, chứng nhận và bảo đảm chất lượng.',
    },
    nextStep: {
      eyebrow: 'Bước tiếp theo',
      title: 'Khám phá triển khai với cái nhìn đầy đủ về toàn bộ khung học thuật.',
      body:
        'Nếu bạn đang rà soát Jurassic English™ cho việc áp dụng trong nhà trường, đào tạo, cấp phép hoặc thiết kế chương trình, cuộc trao đổi tiếp theo nên bắt đầu từ cả phương diện sư phạm lẫn triển khai.',
      primaryCta: 'Bắt đầu',
      secondaryCta: 'Quay lại trang chủ',
    },
  },
} as const;

const frameworkContentByLocale: Partial<Record<Locale, FrameworkContentModule>> = {
  en: enFrameworkContent,
  vi: viFrameworkContent,
};

const frameworkPageContentByLocale: Record<Locale, typeof enFrameworkPageContent> = {
  en: enFrameworkPageContent,
  vi: viFrameworkPageContent,
};

export function getFrameworkContent(locale: Locale) {
  return frameworkContentByLocale[locale] ?? null;
}

export function getFrameworkPageContent(locale: Locale) {
  return frameworkPageContentByLocale[locale];
}

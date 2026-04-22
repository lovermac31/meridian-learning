import type { Locale } from '../locales';
import type { DeepWiden } from './types';

const enHomeContent = {
  hero: {
    eyebrow: 'For schools, academies, and curriculum leaders',
    titleLineOne: 'A literature-based',
    titleHighlight: 'English curriculum',
    titleLineThree: 'for critical thinking.',
    institutionalTagline: '',
    body:
      'Jurassic English helps institutions build structured reasoning, moral judgment, and academic expression through complete literature, CEFR-aware progression, and teacher-ready implementation support.',
    primaryCta: 'Request an Audit Sprint',
    secondaryCta: 'Book a Discovery Call',
    overviewCta: 'Request a Curriculum Overview',
    publishedBy: 'Published by',
    publisher: 'World Wise Learning',
    audienceRowLabel: 'For parents & students:',
    audienceCurriculumCta: 'Explore the Curriculum',
    audienceCompareCta: 'Compare Levels',
  },
  decisionSnapshot: {
    eyebrow: 'Institutional Decision Snapshot',
    headline: 'Know in 60 seconds whether Jurassic English fits your institution.',
    subheadline:
      'A structured literature-based English framework for schools that need clearer reasoning outcomes, CEFR-aware progression, and implementation support.',
    cards: [
      {
        title: 'What it is',
        body: 'Literature-based English curriculum for critical thinking and moral reasoning.',
      },
      {
        title: 'Who it fits',
        body: 'Schools, academies, centres, and programme leaders reviewing English provision.',
      },
      {
        title: 'What you receive',
        body: 'Level structure, lesson architecture, syllabus maps, training, licensing, and review support.',
      },
      {
        title: 'How to start',
        body: 'Audit Sprint, Discovery Call, or Curriculum Overview.',
      },
    ],
    primaryCta: 'Request an Audit Sprint',
    secondaryCta: 'Book a Discovery Call',
    overviewCta: 'Request a Curriculum Overview',
  },
  about: {
    eyebrow: 'Institutional Positioning',
    title: 'What is Jurassic English™?',
    paragraphs: [
      'Jurassic English™ is a literature-centered framework for English, reasoning, and structured intellectual development. It is designed for implementation in real school contexts, and for review, alignment, and scale across programmes, teams, and institutional settings.',
      'Like the fossil record, language preserves layers of human thought, values, and imagination. Jurassic English™ uses literary study to help students examine evidence, develop reasoned judgment, and express their thinking with disciplined clarity and confidence.',
    ],
    quote: '"Language is the fossil record of thought."',
    quoteAttribution: 'World Wise Learning',
    proofSignals: [
      'Literature-centered reasoning framework',
      'Four-stage instructional architecture',
      'Governed for fidelity, review, and scale',
      'CEFR / IB / Cambridge / UNESCO ESD aware',
    ],
    buyerFitTitle: 'Buyer Fit',
    buyerFitBody:
      'Built for schools, curriculum leaders, academic reviewers, and institutional partners.',
    positioningQuote:
      '"This is not traditional English instruction. This is English as an intellectual discipline."',
    imageAlt:
      'Jurassic English curated book collection with paleontology field notes and amber fossil',
  },
  frameworkFoundations: {
    eyebrow: 'Framework Foundations',
    title: 'Mission, structure, and non-negotiables.',
    intro: [
      'Jurassic English™ is a structured instructional system designed to cultivate four interconnected competencies through literature-based English education: critical thinking, moral reasoning, structured reflection, and academic expression.',
      'The framework treats literature as primary evidence to be excavated, examined, and understood in depth. English functions as the medium of reasoning development, not merely the object of study.',
    ],
    pedagogicalTitle: 'Pedagogical Positioning',
    pedagogicalBody: 'How the framework differs from conventional ELT',
    traditionalElt: 'Traditional ELT',
    coreCompetenciesTitle: 'Core Competencies',
    coreCompetencies: [
      'Critical Thinking: systematic analysis that leads to reasoned judgment',
      'Moral Reasoning: ethical decision-making supported by justification',
      'Structured Reflection: metacognitive connection across personal, social, and ecological contexts',
      'Academic Expression: disciplined evidence-based oral and written argument',
    ],
    pillarsEyebrow: 'Five Structural Pillars',
    pillarsTitle: 'The framework is rigorous by design.',
    pillarsBody:
      'These pillars define how Jurassic English™ is planned, taught, and protected at scale.',
    prohibitedEyebrow: 'Prohibited Practices',
    prohibitedTitle: 'What the framework does not allow',
    prohibitedBody:
      'These practices are excluded because they reduce reasoning demand, weaken evidence use, or lower the intellectual expectations of the lesson.',
    avoidLabel: 'Avoid',
    replaceLabel: 'Replace with',
    exploreCta: 'Explore the full framework',
    methodologyCta: 'See methodology',
    worldwiseCta: 'View publisher context',
    pillars: [
      {
        title: 'Literature as the Intellectual Anchor',
        description:
          'Each unit is anchored to authentic, complete literature selected for moral depth, narrative clarity, cultural richness, language development potential, and ecological richness.',
      },
      {
        title: 'Standards-Native Planning',
        description:
          'Planning begins from standards and reasoning outcomes, so alignment shapes instruction from the outset rather than being added after the fact.',
      },
      {
        title: 'Backward Design Discipline',
        description:
          'Teachers begin with the reasoning outcome, define evidence of mastery, and then build the instructional pathway that develops that capability.',
      },
      {
        title: 'Structured Output',
        description:
          'Student thinking is made visible through planned oral, written, visual, and ecological outputs rather than informal discussion alone.',
      },
      {
        title: 'Governance and Scalability',
        description:
          'The framework uses fixed lesson architecture to preserve institutional integrity across classrooms, campuses, and wider implementation.',
      },
    ],
    contrasts: [
      { legacy: 'Language as skill', current: 'Language as a reasoning tool' },
      { legacy: 'Text as linguistic input', current: 'Text as an intellectual fossil record' },
      { legacy: 'Comprehension as the goal', current: 'Justification as the goal' },
      { legacy: 'Teacher as facilitator', current: 'Teacher as intellectual excavator' },
    ],
    prohibitedPractices: [
      {
        title: 'Skill-drill worksheets without reasoning context',
        replacement: 'Embedded skill instruction within literature analysis',
      },
      {
        title: 'Unstructured sharing without evidence requirements',
        replacement: 'Accountable talk supported by sentence frames',
      },
      {
        title: 'Simplified retellings in place of original texts',
        replacement: 'Scaffolded access to complete texts',
      },
      {
        title: 'Single-correct-answer comprehension questioning',
        replacement: 'Open-ended evaluative prompts',
      },
      {
        title: 'Accepting “I do not know” without pressing or revoicing',
        replacement: 'Pressing for one possible reason, backed by text',
      },
    ],
  },
  thinkingCycle: {
    eyebrow: 'Operational Framework',
    title: 'The Jurassic Thinking Cycle™',
    body:
      'The Jurassic Thinking Cycle™ is the operational engine of every lesson. It is a recursive cognitive architecture, not a linear checklist. No stage may be skipped, and no lesson is complete without all four.',
    labels: {
      cognitiveOperation: 'Cognitive Operation',
      bloomLevel: 'Bloom Level',
      primaryTarget: 'Primary Target',
      lessonSlot: 'Lesson Slot',
    },
    stageNote: 'Four stages. Every lesson. No stage may be skipped.',
    exploreStageCta: 'Explore Stage',
    footerLine:
      'Analyze. Evaluate. Justify. Reflect. Every lesson. No stage may be skipped.',
    compareAllCta: 'Compare All Stages',
  },
  series: {
    eyebrow: 'Curriculum Map',
    title: 'The Jurassic English™ Series',
    body:
      'A complete, vertically aligned curriculum — from first stories to full novels. Each syllabus includes 40 structured lessons per academic year and 10 core texts (4 lessons each).',
    compareAllCta: 'Compare All Levels',
    stats: {
      lessonsValue: '40',
      lessonsLabel: 'Lessons / Year',
      textsValue: '10',
      textsLabel: 'Core Texts',
    },
    labels: {
      age: 'Age',
      viewLevelDetails: 'View Level Details',
      demoMaterial: 'Demo Material',
    },
  },
  creativeStudio: {
    eyebrow: 'Creative Studio',
    title: 'Excavate Your Imagination',
    body:
      'Visualize literary themes and moral dilemmas using our AI-powered Creative Studio. Generate evocative illustrations to anchor your reasoning.',
    unreleasedNotice:
      'Creative Studio is being prepared for a later public release. Image generation is not available on the live site yet.',
    promptAriaLabel: 'Creative Studio prompt',
    promptPlaceholder:
      "Describe a literary scene... (e.g., 'A child standing at a crossroads of ancient stone paths')",
    promptTooLong: 'Prompt must be {{limit}} characters or fewer.',
    noImageReturned: 'No image was returned. Please try a different prompt.',
    generateError: 'Failed to generate image. Please try again.',
    generatingLabel: 'Excavating...',
    comingSoonLabel: 'Studio Coming Soon',
    generateLabel: 'Generate Illustration',
    generatedImageAlt: 'Generated Illustration',
    placeholderReady: 'Your excavated imagination will appear here.',
    placeholderUnreleased:
      'Creative Studio visuals will appear here when the feature is released.',
    processingLabel: 'Processing Neural Strata...',
    unavailableOnPublicSite: 'Creative Studio is not available on the public site yet.',
  },
  neuroinclusive: {
    eyebrow: 'Accessibility & Inclusion',
    title: 'Built for Every Learner',
    body:
      'Jurassic English™ Version 2.1 introduces the most comprehensive neuroinclusive layer in any literature-based English framework.',
    principleTitle: 'The Regulation-Before-Reasoning Principle',
    principleQuote:
      '"Cognitive performance is state-dependent. A learner who is physiologically dysregulated does not have access to higher-order reasoning. We address the state before demanding the task."',
    cards: [
      {
        title: 'For ADHD Learners',
        items: [
          'Movement & sensory supports',
          'Visual countdown timers',
          'Oral rehearsal before writing',
          'Writing-sprint protocol',
        ],
      },
      {
        title: 'For Anxiety-Sensitive Learners',
        items: [
          'Private reflection options',
          'No cold-calling protocols',
          'Predictable task architecture',
          'Inclusive choice boards',
        ],
      },
      {
        title: 'For All Learners',
        items: [
          '30–90s regulation resets',
          'Visual agendas',
          'Accommodated reasoning',
          'Sensory-load adjustments',
        ],
      },
    ],
  },
  services: {
    eyebrow: 'Services & Partnerships',
    title: 'Choose the right implementation path.',
    body:
      'Jurassic English™ supports institutions at different stages of adoption, from teacher preparation and curriculum review to licensing, consulting, and long-term partnership.',
    quote:
      '"Implementation quality depends on teacher quality, programme clarity, and support at the right scale."',
    cards: [
      {
        title: 'Teacher Training',
        audience: 'For licensed educators, coordinators, and school teams',
        desc:
          'Professional training and certification in the Jurassic Thinking Cycle™, lesson architecture, questioning routines, and rubric-based implementation.',
        outcome:
          'Supports confident classroom delivery and implementation fidelity.',
      },
      {
        title: 'School Licensing',
        audience: 'For schools, academies, and institutional programmes',
        desc:
          'Programme licensing for institutions adopting Jurassic English™ as a structured literature-based English framework with quality assurance and update pathways.',
        outcome:
          'Supports consistent rollout, governance, and long-term programme continuity.',
      },
      {
        title: 'Curriculum Review',
        audience: 'For leaders reviewing a current English programme',
        desc:
          'Academic review of curriculum structure, standards alignment, text selection, assessment architecture, and progression across levels.',
        outcome:
          'Supports sharper sequencing, stronger reasoning demand, and clearer standards fit.',
      },
      {
        title: 'Academic Consulting',
        audience: 'For implementation planning and programme design',
        desc:
          'Consultancy for CEFR crosswalks, scope and sequence planning, rollout design, and regulation-aware implementation across classrooms or departments.',
        outcome:
          'Supports practical decision-making before launch, pilot, or expansion.',
      },
      {
        title: 'Institutional Partnerships',
        audience: 'For school groups, networks, and system-level partners',
        desc:
          'Long-term partnership pathways for whole-school implementation, multi-school rollout, and formal collaboration with governance, moderation, and review structures.',
        outcome:
          'Supports scale without dilution through tiered implementation support.',
      },
    ],
  },
  contact: {
    eyebrow: 'Inquiries & Partnerships',
    title: 'Choose the right next step.',
    body:
      'Whether you need teacher training, school licensing, curriculum review, academic consulting, or a longer-term institutional partnership, we can route your enquiry to the right conversation.',
    emailLabel: 'Email Enquiries',
    websiteLabel: 'Official Website',
    pathwaysTitle: 'Offer Pathways',
    pathways: [
      {
        title: 'Teacher Training',
        desc: 'Certification, lesson design, questioning practice, and implementation training',
      },
      {
        title: 'School Licensing',
        desc: 'Licensing pathways for schools, academies, and institutional programmes',
      },
      {
        title: 'Curriculum Review',
        desc: 'Review of progression, standards fit, text selection, and assessment architecture',
      },
      {
        title: 'Academic Consulting',
        desc: 'Support for rollout planning, CEFR mapping, and programme design decisions',
      },
      {
        title: 'Institutional Partnerships',
        desc: 'Long-term implementation, moderation, and scale support for networks and system-level partners',
      },
    ],
  },
} as const;

const viHomeContent = {
  hero: {
    eyebrow: 'Giáo dục dựa trên văn học đẳng cấp quốc tế',
    titleLineOne: 'TƯ DUY PHẢN BIỆN',
    titleHighlight: 'TƯ DUY LOGIC',
    titleLineThree: 'THÔNG QUA LÝ LUẬN HỌC THUẬT',
    institutionalTagline:
      'Jurassic English™ và WorldWise Learning hỗ trợ nhà trường, trung tâm đào tạo và các tổ chức giáo dục với khung chương trình phát triển năng lực tư duy thực chất — vượt xa thành tích thi cử.',
    body:
      'Jurassic English™ đặt ngôn ngữ và tư duy ở vị trí trung tâm, với các lộ trình dành cho đào tạo giáo viên, cấp phép nhà trường, rà soát chương trình, tư vấn học thuật và hợp tác tổ chức.',
    primaryCta: 'Yêu cầu Kiểm toán Chương trình',
    secondaryCta: 'Đặt lịch Tư vấn',
    overviewCta: 'Yêu cầu tổng quan chương trình',
    publishedBy: 'Được phát hành bởi',
    publisher: 'World Wise Learning',
    audienceRowLabel: 'Dành cho phụ huynh & học sinh:',
    audienceCurriculumCta: 'Khám phá chương trình học',
    audienceCompareCta: 'So sánh cấp độ',
  },
  decisionSnapshot: {
    eyebrow: 'Tóm tắt quyết định cho tổ chức',
    headline: 'Biết trong 60 giây liệu Jurassic English có phù hợp với tổ chức của bạn hay không.',
    subheadline:
      'Một khung tiếng Anh dựa trên văn học có cấu trúc dành cho nhà trường cần kết quả lập luận rõ hơn, tiến trình có đối sánh CEFR và hỗ trợ triển khai.',
    cards: [
      {
        title: 'Đây là gì',
        body: 'Chương trình tiếng Anh dựa trên văn học để phát triển tư duy phản biện và lập luận đạo đức.',
      },
      {
        title: 'Phù hợp với ai',
        body: 'Nhà trường, học viện, trung tâm và lãnh đạo chương trình đang rà soát việc dạy tiếng Anh.',
      },
      {
        title: 'Bạn nhận được gì',
        body: 'Cấu trúc cấp độ, kiến trúc bài học, bản đồ giáo trình, đào tạo, cấp phép và hỗ trợ rà soát.',
      },
      {
        title: 'Bắt đầu thế nào',
        body: 'Kiểm toán Chương trình, cuộc gọi tư vấn hoặc tổng quan chương trình.',
      },
    ],
    primaryCta: 'Yêu cầu Kiểm toán Chương trình',
    secondaryCta: 'Đặt lịch Tư vấn',
    overviewCta: 'Yêu cầu tổng quan chương trình',
  },
  about: {
    eyebrow: 'Định vị tổ chức',
    title: 'Jurassic English™ là gì?',
    paragraphs: [
      'Jurassic English™ là một khung học thuật lấy văn học làm trung tâm để phát triển tiếng Anh, lập luận và năng lực tư duy có cấu trúc. Hệ thống được thiết kế để triển khai trong bối cảnh trường học thực tế, đồng thời hỗ trợ rà soát, chuẩn hóa và mở rộng trên quy mô chương trình, đội ngũ và tổ chức.',
      'Giống như hồ sơ hóa thạch, ngôn ngữ lưu giữ nhiều lớp của tư duy, giá trị và trí tưởng tượng của con người. Jurassic English™ dùng việc học văn học để giúp học sinh xem xét bằng chứng, hình thành phán đoán có cơ sở và diễn đạt suy nghĩ của mình với sự rõ ràng, kỷ luật và tự tin.',
    ],
    quote: '"Ngôn ngữ là hồ sơ hóa thạch của tư duy."',
    quoteAttribution: 'World Wise Learning',
    proofSignals: [
      'Khung lập luận lấy văn học làm trung tâm',
      'Kiến trúc giảng dạy bốn giai đoạn',
      'Được quản trị để bảo toàn chất lượng, rà soát và mở rộng',
      'Có đối sánh với CEFR / IB / Cambridge / UNESCO ESD',
    ],
    buyerFitTitle: 'Phù hợp với ai',
    buyerFitBody:
      'Dành cho nhà trường, lãnh đạo chương trình, người rà soát học thuật và đối tác tổ chức.',
    positioningQuote:
      '"Đây không phải là cách dạy tiếng Anh truyền thống. Đây là tiếng Anh như một bộ môn trí tuệ."',
    imageAlt:
      'Bộ sưu tập sách của Jurassic English cùng ghi chép thực địa cổ sinh vật học và hóa thạch hổ phách',
  },
  frameworkFoundations: {
    eyebrow: 'Nền tảng khung học thuật',
    title: 'Sứ mệnh, cấu trúc và những nguyên tắc không thể thỏa hiệp.',
    intro: [
      'Jurassic English™ là một hệ thống giảng dạy có cấu trúc, được thiết kế để phát triển bốn năng lực liên kết chặt chẽ thông qua giáo dục tiếng Anh dựa trên văn học: tư duy phản biện, tư duy luân lý, phản tư có cấu trúc và diễn đạt học thuật.',
      'Khung học thuật xem văn học là bằng chứng cốt lõi cần được khai mở, phân tích và hiểu sâu. Tiếng Anh hoạt động như phương tiện phát triển tư duy, chứ không chỉ là đối tượng được học.',
    ],
    pedagogicalTitle: 'Định vị sư phạm',
    pedagogicalBody: 'Khung học thuật này khác gì so với ELT thông thường',
    traditionalElt: 'ELT truyền thống',
    coreCompetenciesTitle: 'Năng lực cốt lõi',
    coreCompetencies: [
      'Tư duy phản biện: phân tích có hệ thống để đi tới phán đoán có cơ sở',
      'Tư duy luân lý: đưa ra quyết định đạo đức dựa trên biện minh',
      'Phản tư có cấu trúc: kết nối siêu nhận thức qua bối cảnh cá nhân, xã hội và sinh thái',
      'Diễn đạt học thuật: lập luận nói và viết có kỷ luật, dựa trên bằng chứng',
    ],
    pillarsEyebrow: 'Năm trụ cột cấu trúc',
    pillarsTitle: 'Khung học thuật được thiết kế chặt chẽ ngay từ đầu.',
    pillarsBody:
      'Những trụ cột này định hình cách Jurassic English™ được lập kế hoạch, giảng dạy và bảo vệ ở quy mô lớn.',
    prohibitedEyebrow: 'Các thực hành bị loại trừ',
    prohibitedTitle: 'Khung học thuật không chấp nhận điều gì',
    prohibitedBody:
      'Những thực hành này bị loại bỏ vì chúng làm giảm yêu cầu lập luận, làm yếu việc sử dụng bằng chứng hoặc hạ thấp kỳ vọng trí tuệ của bài học.',
    avoidLabel: 'Tránh',
    replaceLabel: 'Thay bằng',
    exploreCta: 'Khám phá toàn bộ khung học thuật',
    methodologyCta: 'Xem phương pháp luận',
    worldwiseCta: 'Xem bối cảnh nhà phát hành',
    pillars: [
      {
        title: 'Văn học là trục neo trí tuệ',
        description:
          'Mỗi học phần được xây trên những tác phẩm văn học trọn vẹn, xác thực, được chọn theo chiều sâu đạo đức, độ rõ của cốt truyện, sự phong phú văn hóa, tiềm năng phát triển ngôn ngữ và chiều sâu sinh thái.',
      },
      {
        title: 'Lập kế hoạch xuất phát từ chuẩn',
        description:
          'Việc lập kế hoạch bắt đầu từ chuẩn đầu ra và kết quả lập luận, để sự đối sánh định hình giảng dạy ngay từ đầu chứ không được thêm vào sau cùng.',
      },
      {
        title: 'Kỷ luật thiết kế ngược',
        description:
          'Giáo viên bắt đầu từ kết quả lập luận mong muốn, xác định bằng chứng thành thạo, rồi mới xây dựng lộ trình giảng dạy phát triển năng lực đó.',
      },
      {
        title: 'Đầu ra có cấu trúc',
        description:
          'Tư duy của học sinh được làm hiển lộ qua các sản phẩm nói, viết, trực quan và sinh thái đã được lên kế hoạch, thay vì chỉ dừng ở thảo luận tự do.',
      },
      {
        title: 'Quản trị và khả năng mở rộng',
        description:
          'Khung học thuật dùng kiến trúc bài học cố định để bảo toàn tính toàn vẹn của tổ chức giữa các lớp học, cơ sở và quy mô triển khai rộng hơn.',
      },
    ],
    contrasts: [
      { legacy: 'Ngôn ngữ như kỹ năng', current: 'Ngôn ngữ như công cụ lập luận' },
      { legacy: 'Văn bản như đầu vào ngôn ngữ', current: 'Văn bản như hồ sơ hóa thạch trí tuệ' },
      { legacy: 'Đọc hiểu là đích đến', current: 'Biện minh là đích đến' },
      { legacy: 'Giáo viên là người hỗ trợ', current: 'Giáo viên là người khai quật trí tuệ' },
    ],
    prohibitedPractices: [
      {
        title: 'Phiếu bài tập kỹ năng rời rạc, không có bối cảnh lập luận',
        replacement: 'Dạy kỹ năng lồng ghép trong phân tích văn học',
      },
      {
        title: 'Chia sẻ tự do không yêu cầu bằng chứng',
        replacement: 'Đối thoại có trách nhiệm với khung câu hỗ trợ',
      },
      {
        title: 'Dùng bản kể giản lược thay cho nguyên tác',
        replacement: 'Tiếp cận có giàn giáo với văn bản trọn vẹn',
      },
      {
        title: 'Câu hỏi đọc hiểu một đáp án đúng',
        replacement: 'Câu hỏi mở mang tính đánh giá',
      },
      {
        title: 'Chấp nhận “em không biết” mà không gợi mở hay tái diễn đạt',
        replacement: 'Khuyến khích nêu một khả năng có căn cứ từ văn bản',
      },
    ],
  },
  thinkingCycle: {
    eyebrow: 'Khung vận hành',
    title: 'Jurassic Thinking Cycle™',
    body:
      'Jurassic Thinking Cycle™ là động cơ vận hành của mọi bài học. Đây là một kiến trúc nhận thức có tính lặp lại, không phải một danh sách tuyến tính. Không giai đoạn nào được bỏ qua, và không bài học nào hoàn chỉnh nếu thiếu một trong bốn giai đoạn.',
    labels: {
      cognitiveOperation: 'Thao tác nhận thức',
      bloomLevel: 'Bậc Bloom',
      primaryTarget: 'Mục tiêu chính',
      lessonSlot: 'Vị trí trong bài học',
    },
    stageNote: 'Bốn giai đoạn. Mọi bài học. Không giai đoạn nào được bỏ qua.',
    exploreStageCta: 'Khám phá giai đoạn',
    footerLine:
      'Phân tích. Đánh giá. Biện minh. Phản tư. Mọi bài học. Không giai đoạn nào được bỏ qua.',
    compareAllCta: 'So sánh tất cả các giai đoạn',
  },
  series: {
    eyebrow: 'Bản đồ chương trình',
    title: 'Chuỗi Jurassic English™',
    body:
      'Một chương trình hoàn chỉnh, phát triển dọc từ những câu chuyện đầu tiên đến tiểu thuyết trọn vẹn. Mỗi đề cương gồm 40 bài học có cấu trúc cho mỗi năm học và 10 văn bản cốt lõi (4 bài học cho mỗi văn bản).',
    compareAllCta: 'So sánh tất cả cấp độ',
    stats: {
      lessonsValue: '40',
      lessonsLabel: 'Bài học / năm',
      textsValue: '10',
      textsLabel: 'Văn bản cốt lõi',
    },
    labels: {
      age: 'Độ tuổi',
      viewLevelDetails: 'Xem chi tiết cấp độ',
      demoMaterial: 'Tài liệu mẫu',
    },
  },
  creativeStudio: {
    eyebrow: 'Creative Studio',
    title: 'Khai mở trí tưởng tượng của bạn',
    body:
      'Hình dung các chủ đề văn học và tình huống tiến thoái lưỡng nan đạo đức bằng Creative Studio hỗ trợ AI. Tạo ra những hình minh họa gợi hình để neo giữ lập luận của bạn.',
    unreleasedNotice:
      'Creative Studio đang được chuẩn bị cho một đợt phát hành công khai sau này. Tính năng tạo hình ảnh hiện chưa khả dụng trên trang web.',
    promptAriaLabel: 'Ô nhập gợi ý cho Creative Studio',
    promptPlaceholder:
      "Mô tả một khung cảnh văn học... (ví dụ: 'Một đứa trẻ đứng ở ngã rẽ của những lối đá cổ xưa')",
    promptTooLong: 'Gợi ý phải có tối đa {{limit}} ký tự.',
    noImageReturned: 'Không có hình ảnh nào được trả về. Vui lòng thử một gợi ý khác.',
    generateError: 'Không thể tạo hình ảnh. Vui lòng thử lại.',
    generatingLabel: 'Đang khai mở...',
    comingSoonLabel: 'Studio sắp ra mắt',
    generateLabel: 'Tạo minh họa',
    generatedImageAlt: 'Hình minh họa được tạo',
    placeholderReady: 'Hình ảnh do trí tưởng tượng của bạn khai mở sẽ xuất hiện tại đây.',
    placeholderUnreleased:
      'Hình ảnh Creative Studio sẽ xuất hiện tại đây khi tính năng được phát hành.',
    processingLabel: 'Đang xử lý các tầng thần kinh...',
    unavailableOnPublicSite: 'Creative Studio hiện chưa khả dụng trên trang công khai.',
  },
  neuroinclusive: {
    eyebrow: 'Khả năng tiếp cận & hòa nhập',
    title: 'Được thiết kế cho mọi người học',
    body:
      'Jurassic English™ Phiên bản 2.1 giới thiệu lớp hỗ trợ thần kinh bao trùm toàn diện nhất trong bất kỳ khung tiếng Anh dựa trên văn học nào.',
    principleTitle: 'Nguyên tắc điều hòa trước lập luận',
    principleQuote:
      '"Hiệu suất nhận thức phụ thuộc vào trạng thái. Một người học đang mất điều hòa về mặt sinh lý sẽ không thể tiếp cận lập luận bậc cao. Chúng tôi điều chỉnh trạng thái trước khi yêu cầu nhiệm vụ."',
    cards: [
      {
        title: 'Dành cho người học ADHD',
        items: [
          'Hỗ trợ vận động và cảm giác',
          'Bộ đếm ngược trực quan',
          'Luyện nói trước khi viết',
          'Quy trình viết theo chặng ngắn',
        ],
      },
      {
        title: 'Dành cho người học nhạy cảm với lo âu',
        items: [
          'Lựa chọn phản tư riêng tư',
          'Không gọi bất ngờ',
          'Kiến trúc nhiệm vụ dễ dự đoán',
          'Bảng lựa chọn hòa nhập',
        ],
      },
      {
        title: 'Dành cho mọi người học',
        items: [
          'Các khoảng điều hòa 30–90 giây',
          'Lịch trình trực quan',
          'Lập luận có điều chỉnh hỗ trợ',
          'Điều chỉnh tải cảm giác',
        ],
      },
    ],
  },
  services: {
    eyebrow: 'Dịch vụ & hợp tác',
    title: 'Chọn lộ trình triển khai phù hợp.',
    body:
      'Jurassic English™ hỗ trợ các tổ chức ở nhiều giai đoạn áp dụng khác nhau, từ chuẩn bị giáo viên và rà soát chương trình đến cấp phép, tư vấn và hợp tác dài hạn.',
    quote:
      '"Chất lượng triển khai phụ thuộc vào chất lượng giáo viên, độ rõ của chương trình và mức hỗ trợ phù hợp với quy mô."',
    cards: [
      {
        title: 'Đào tạo giáo viên',
        audience: 'Dành cho giáo viên được cấp phép, điều phối viên và đội ngũ nhà trường',
        desc:
          'Đào tạo và chứng nhận chuyên môn về Jurassic Thinking Cycle™, kiến trúc bài học, quy trình đặt câu hỏi và triển khai theo rubric.',
        outcome:
          'Hỗ trợ việc triển khai lớp học một cách tự tin và giữ vững chất lượng thực thi.',
      },
      {
        title: 'Cấp phép nhà trường',
        audience: 'Dành cho trường học, học viện và các chương trình tổ chức',
        desc:
          'Cấp phép chương trình cho các tổ chức áp dụng Jurassic English™ như một khung tiếng Anh dựa trên văn học có cấu trúc, đi kèm bảo đảm chất lượng và lộ trình cập nhật.',
        outcome:
          'Hỗ trợ triển khai đồng bộ, quản trị rõ ràng và tính liên tục lâu dài của chương trình.',
      },
      {
        title: 'Rà soát chương trình',
        audience: 'Dành cho lãnh đạo đang rà soát chương trình tiếng Anh hiện có',
        desc:
          'Rà soát học thuật về cấu trúc chương trình, đối sánh chuẩn, lựa chọn văn bản, kiến trúc đánh giá và tiến trình giữa các cấp độ.',
        outcome:
          'Hỗ trợ trình tự sắc nét hơn, yêu cầu lập luận mạnh hơn và mức phù hợp chuẩn rõ ràng hơn.',
      },
      {
        title: 'Tư vấn học thuật',
        audience: 'Dành cho lập kế hoạch triển khai và thiết kế chương trình',
        desc:
          'Tư vấn về đối sánh CEFR, thiết kế phạm vi và trình tự, mô hình triển khai và vận hành phù hợp với điều kiện lớp học hoặc khoa bộ môn.',
        outcome:
          'Hỗ trợ ra quyết định thực tế trước khi khởi động, thí điểm hoặc mở rộng.',
      },
      {
        title: 'Hợp tác tổ chức',
        audience: 'Dành cho cụm trường, mạng lưới và đối tác cấp hệ thống',
        desc:
          'Các lộ trình hợp tác dài hạn cho triển khai toàn trường, mở rộng đa trường và hợp tác chính thức với cấu trúc quản trị, kiểm định và rà soát.',
        outcome:
          'Hỗ trợ mở rộng mà không pha loãng chất lượng, nhờ hệ thống triển khai theo tầng.',
      },
    ],
  },
  contact: {
    eyebrow: 'Trao đổi & hợp tác',
    title: 'Chọn bước tiếp theo phù hợp.',
    body:
      'Dù bạn cần đào tạo giáo viên, cấp phép nhà trường, rà soát chương trình, tư vấn học thuật hay một mối hợp tác tổ chức dài hạn hơn, chúng tôi sẽ định tuyến yêu cầu của bạn tới đúng cuộc trao đổi.',
    emailLabel: 'Email liên hệ',
    websiteLabel: 'Trang web chính thức',
    pathwaysTitle: 'Các lộ trình dịch vụ',
    pathways: [
      {
        title: 'Đào tạo giáo viên',
        desc: 'Chứng nhận, thiết kế bài học, thực hành đặt câu hỏi và đào tạo triển khai',
      },
      {
        title: 'Cấp phép nhà trường',
        desc: 'Các lộ trình cấp phép cho trường học, học viện và chương trình tổ chức',
      },
      {
        title: 'Rà soát chương trình',
        desc: 'Rà soát tiến trình, mức phù hợp chuẩn, lựa chọn văn bản và kiến trúc đánh giá',
      },
      {
        title: 'Tư vấn học thuật',
        desc: 'Hỗ trợ lập kế hoạch triển khai, đối sánh CEFR và quyết định thiết kế chương trình',
      },
      {
        title: 'Hợp tác tổ chức',
        desc: 'Hỗ trợ dài hạn về triển khai, kiểm định và mở rộng cho mạng lưới và đối tác cấp hệ thống',
      },
    ],
  },
} as const;

type HomeContent = DeepWiden<typeof enHomeContent>;

const homeContentByLocale: Partial<Record<Locale, HomeContent>> = {
  en: enHomeContent,
  vi: viHomeContent,
};

export function getHomeContent(locale: Locale) {
  return homeContentByLocale[locale] ?? null;
}

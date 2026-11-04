/**
 * Chinese previews of the IELTS band calculator explainer (China Option A, 4 Nov 2026).
 *
 * NOT public: both pages are noindex, out of the sitemap and linked from nowhere. Copy was machine-drafted and only
 * round-tripped through Google Translate (Jay's call); it has had no native-reader review. Rules: adults 18+, practice not an
 * official score, no band promises, no affiliation claims, Mr. Jay is the only teacher, no prices.
 * Source of truth: World Wide Learning/.regen/command/SEO-SPRINT/CHINA-OPTION-A/ZH-PAGES-DRAFT-FOR-NATIVE-REVIEW.md
 */
export type ZhScript = 'zh-Hans' | 'zh-Hant';

export type ZhPreviewPage = {
  path: string;
  script: ZhScript;
  title: string;
  description: string;
  h1: string;
  intro: string;
  estimate: string;
  roundingTitle: string;
  roundingIntro: string;
  rounding: ReadonlyArray<readonly [string, string]>;
  example: string;
  planner: string;
  toolLabel: string;
  practiceTitle: string;
  practice: string;
  affiliation: string;
  teacher: string;
  practiceLabel: string;
  averageHeading: string;
  overallHeading: string;
};

export const ZH_ENGLISH_TOOL_PATH = '/tools/ielts-band-score-calculator';
export const ZH_PRACTICE_URL = 'https://ielts.jurassicenglish.com/?utm_source=site&utm_medium=zh-preview&utm_campaign=zh-calculator';
export const ZH_HANS_PATH = '/zh-hans/tools/ielts-band-score-calculator';
export const ZH_HANT_PATH = '/zh-hant/tools/ielts-band-score-calculator';

const rows = [['6.000', '6.0'], ['6.125', '6.0'], ['6.250', '6.5'], ['6.375', '6.5'], ['6.500', '6.5'], ['6.625', '6.5'], ['6.750', '7.0'], ['6.875', '7.0']] as const;

export const zhPreviewPages: readonly ZhPreviewPage[] = [
  {
    path: ZH_HANS_PATH,
    script: 'zh-Hans',
    title: '雅思总分计算器：四科分数算出 Overall',
    description: '输入听力、阅读、写作、口语四科分数，免费算出雅思总分。.25 进位到 .5，.75 进位到 1.0。',
    h1: '雅思总分计算器',
    intro: '把你已有的四科成绩相加、除以四，再按雅思公布的取整规则，就得到总分。计算器在英文页面上使用，你输入的内容只留在本浏览器中，不会发送给我们。',
    estimate: '这是估算，不是雅思官方成绩。',
    roundingTitle: '取整规则',
    roundingIntro: '四科平均分的小数部分是 .125 或更低时向下取整；.25 到 .625 取 .5；.75 及以上向上取整到下一个整数分。例如平均 6.25 → 6.5，6.75 → 7.0，6.125 → 6.0。',
    rounding: rows,
    example: '举例：听力 7.0、阅读 6.5、写作 6.0、口语 6.5，合计 26.0，除以 4 得 6.5，所以总分是 6.5。',
    planner: '想知道某一科至少要考多少？在计算器页面使用“目标规划”：填入已有的三科分数和目标总分，就能看到剩下一科的最低要求。',
    toolLabel: '打开计算器（英文页面）',
    practiceTitle: '免费雅思口语练习（仅限 18 岁及以上）',
    practice: '对着 AI 考官大声回答一道口语题，免费 2 次。报告会引用你自己说过的话，并指出下一步最值得改的一件事。这是练习，不是官方成绩。',
    affiliation: '本站与雅思（IELTS）、剑桥、英国文化协会、IDP 无任何关联。',
    teacher: '由 Jay Adams 老师（Mr. Jay）一对一授课。',
    practiceLabel: '免费试用（英文界面）',
    averageHeading: '四科平均分',
    overallHeading: '总分',
  },
  {
    path: ZH_HANT_PATH,
    script: 'zh-Hant',
    title: '雅思總分計算機：四科成績算出 Overall',
    description: '輸入聽力、閱讀、寫作、口說四科成績，免費算出雅思總分。.25 進位到 .5，.75 進位到 1.0。',
    h1: '雅思總分計算機',
    intro: '把你已有的四科成績相加、除以四，再依雅思公布的進位規則，就得到總分。計算機在英文頁面上使用，你輸入的內容只留在本瀏覽器中，不會傳送給我們。',
    estimate: '這是估算，不是雅思官方成績。',
    roundingTitle: '進位規則',
    roundingIntro: '四科平均的小數部分為 .125 或以下時無條件捨去；.25 至 .625 取 .5；.75 以上進位到下一個整數分。例如平均 6.25 → 6.5，6.75 → 7.0，6.125 → 6.0。',
    rounding: rows,
    example: '舉例：聽力 7.0、閱讀 6.5、寫作 6.0、口說 6.5，合計 26.0，除以 4 得 6.5，所以總分是 6.5。',
    planner: '想知道某一科至少要考多少？在計算機頁面使用「目標規劃」：填入已有的三科成績與目標總分，就能看到剩下一科的最低要求。',
    toolLabel: '開啟計算機（英文頁面）',
    practiceTitle: '免費雅思口說練習（限 18 歲以上）',
    practice: '對著 AI 考官大聲回答一道口說題，免費 2 次。報告會引用你自己說過的話，並指出下一步最值得改的一件事。這是練習，不是官方成績。',
    affiliation: '本站與雅思（IELTS）、劍橋、英國文化協會、IDP 並無任何關聯。',
    teacher: '由 Jay Adams 老師（Mr. Jay）一對一授課。',
    practiceLabel: '免費試用（英文介面）',
    averageHeading: '四科平均',
    overallHeading: '總分',
  },
];

export const zhPreviewPaths: readonly string[] = zhPreviewPages.map((page) => page.path);
export const getZhPreviewPage = (pathname: string): ZhPreviewPage | undefined =>
  zhPreviewPages.find((page) => page.path === pathname.replace(/\/+$/, ''));

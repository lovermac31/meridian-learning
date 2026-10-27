import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '../i18n/locales';
import { AVERAGE_FRACTIONS, calculateOverallBand, isValidBand, minimumBandForTarget, roundAverage } from '../lib/ieltsBand';
import { ieltsCalculatorFaqs } from '../lib/ieltsToolsFaq';

const source = 'https://ielts.org/take-a-test/your-results/ielts-scoring-in-detail';
const calculatorEn = '/tools/ielts-band-score-calculator';
const calculatorVi = '/vi/cong-cu/tinh-diem-ielts';
const timerEn = '/tools/ielts-speaking-part-2-timer';
const timerVi = '/vi/cong-cu/dong-ho-ielts-speaking-part-2';

const copy = {
  en: {
    calculator: 'IELTS Band Score Calculator', timer: 'IELTS Speaking Part 2 Timer',
    keyFacts: 'Key facts', overall: 'Overall band', calculate: 'Calculate overall band',
    invalid: 'Enter a band from 0 to 9 in steps of 0.5 for every skill.',
    notOfficial: 'This is an estimate, not an official IELTS score.',
    independent: 'Jurassic English is independent of IELTS, the British Council, IDP and Cambridge.',
    source: 'IELTS scoring rules (official source)',
    intro: 'Enter your four reported skill bands. The calculator adds them, divides by four and applies the published IELTS rounding rule. Your entries stay in this browser session and are not sent to us.',
    how: 'How the IELTS overall band is worked out',
    paragraphs: [
      'An IELTS Test Report Form shows a band for each of four skills: Listening, Reading, Writing and Speaking. The overall band is the arithmetic mean of those four bands, rounded to the nearest half or whole band. Each skill has equal weight in this calculation. The overall band is therefore a summary of the reported skill bands, not a fifth assessment with separate marking criteria.',
      'To calculate it yourself, add the four bands and divide by four. For example, Listening 7.0, Reading 6.5, Writing 6.0 and Speaking 6.5 total 26.0. Dividing by four gives 6.5, so the overall band is 6.5. You can change any input above to see how a different skill band changes the average. This is useful for planning practice, but it cannot predict what an examiner will award.',
      'IELTS rounds an average ending in .25 up to the next half band and one ending in .75 up to the next whole band. Thus 6.25 becomes 6.5, and 6.75 becomes 7.0. An average below a quarter is rounded to the preceding whole band; an average between a half and three quarters is rounded to the preceding half band. The calculator uses integer half-band units internally so that decimal arithmetic cannot shift a boundary.',
      'Only use bands that appear on a genuine Test Report Form if you want to reproduce an official overall band. A practice-test band, teacher estimate or online score may be helpful for learning, but its accuracy depends on the quality of that assessment. In particular, Writing and Speaking require human evaluation against published criteria; entering a hoped-for band here does not make it an attained result.',
      'Listening and Reading are marked from correct answers, but their conversion to bands varies by test version. We do not include a raw-score conversion table because a generic table could imply a level of precision the official material does not guarantee. Use the four reported bands instead. For Writing and Speaking, focus on the criteria and on feedback that identifies specific next steps rather than on the overall number alone.',
      'A higher band in one skill can offset a lower band in another for the overall calculation, but institutions may set minimum bands for individual skills. Check the current requirements of your university, employer or visa authority directly. The overall result is not a substitute for those separate requirements. Read the official IELTS explanation linked below before making a high-stakes decision.',
    ],
    speakingHeading: 'Speaking is where Vietnamese test-takers lose most',
    speakingData: 'IELTS 2024–25 data lists a 5.61 Speaking mean against a 6.20 overall mean for Vietnamese test-takers. Use this as population context, not a prediction of your band.',
    baseline: 'Book a measured Speaking Baseline',
    faqTitle: 'Frequently asked questions',
    plannerTitle: 'What band do I need? Target planner',
    plannerIntro: 'Enter the three bands you already have or expect, choose the skill that is still open, and pick your target overall. The planner shows the lowest band in that skill that reaches the target.',
    missingSkill: 'Skill to plan for', target: 'Target overall',
    plannerResult: (skill: string, band: string, target: string) => `You need at least ${band} in ${skill} for ${target} overall.`,
    plannerImpossible: (skill: string, target: string) => `Even 9.0 in ${skill} would not reach ${target} overall with these bands.`,
    roundingTitle: 'IELTS overall rounding table',
    roundingIntro: 'Four half-band skills always give an average that ends in one of eight fractions. This is how each one rounds, shown for averages from 6.0 to 6.875; the same rule applies at every band.',
    averageCol: 'Average of four skills', roundsCol: 'Overall band',
    examplesTitle: 'Worked examples',
    examplesCols: ['Listening', 'Reading', 'Writing', 'Speaking', 'Average', 'Overall'],
    timerIntro: 'Practice with one minute to plan and two minutes to speak. These original cue cards are practice prompts, not live test questions.',
    chooseTopic: 'Practice topic', plan: 'Planning', speak: 'Speaking', ready: 'Ready', done: 'Finished',
    start: 'Start practice', reset: 'Reset timer', next: 'Next topic',
    structure: 'Answer → reason → example → extend',
    structureText: 'Begin with a direct answer. Explain why it matters, give a specific example, then extend the story or reflect on its impact. Use the planning minute for keywords, not a full script.',
    record: 'Record yourself', stop: 'Stop recording', recording: 'Recording on this device',
    playback: 'Play your recording', micError: 'Microphone access is unavailable or was denied. You can still use the timer.',
    privacy: 'Recording is optional. Audio stays on this device, is held only in this browser tab, and is never uploaded or saved by Jurassic English. Reset or leave the page to discard it.',
    practice: 'Explore AI Speaking practice for adults', measured: 'Book a measured Speaking Baseline',
    sound: 'A gentle tone marks the change from planning to speaking and the end of speaking.',
    timerNotOfficial: 'Practice only: this timer does not score your answer and is not an official IELTS score.',
  },
  vi: {
    calculator: 'Tính điểm IELTS Overall và cách làm tròn', timer: 'Đồng hồ IELTS Speaking Part 2',
    keyFacts: 'Thông tin chính', overall: 'Điểm overall', calculate: 'Tính điểm overall',
    invalid: 'Nhập điểm từ 0 đến 9, theo bước 0,5 cho cả bốn kỹ năng.',
    notOfficial: 'Đây là kết quả ước tính, không phải điểm IELTS chính thức.',
    independent: 'Jurassic English hoạt động độc lập với IELTS, British Council, IDP và Cambridge.',
    source: 'Quy tắc tính điểm IELTS (nguồn chính thức)',
    intro: 'Nhập điểm của bốn kỹ năng. Công cụ cộng các điểm, chia cho bốn và áp dụng quy tắc làm tròn của IELTS. Dữ liệu nhập chỉ ở trong phiên trình duyệt này và không được gửi cho chúng tôi.',
    how: 'Cách tính điểm IELTS overall',
    paragraphs: [
      'Bảng điểm IELTS thể hiện điểm của bốn kỹ năng: Listening, Reading, Writing và Speaking. Điểm overall là trung bình cộng của bốn điểm này, được làm tròn tới band nguyên hoặc nửa band gần nhất. Mỗi kỹ năng có trọng số như nhau. Vì vậy, overall là bản tóm tắt các điểm kỹ năng, không phải một bài đánh giá thứ năm có tiêu chí chấm riêng.',
      'Để tự tính, hãy cộng bốn điểm và chia cho bốn. Ví dụ: Listening 7,0; Reading 6,5; Writing 6,0; Speaking 6,5. Tổng là 26,0 và trung bình là 6,5, nên điểm overall là 6,5. Bạn có thể thay đổi từng ô ở trên để xem một điểm kỹ năng khác tác động đến trung bình như thế nào. Kết quả giúp lập kế hoạch luyện tập, nhưng không dự đoán điểm giám khảo sẽ chấm.',
      'Theo IELTS, trung bình kết thúc bằng ,25 được làm tròn lên nửa band tiếp theo; trung bình kết thúc bằng ,75 được làm tròn lên band nguyên tiếp theo. Do đó 6,25 thành 6,5 và 6,75 thành 7,0. Nếu phần thập phân thấp hơn ,25 thì làm tròn về band nguyên trước đó; nếu nằm từ ,5 đến dưới ,75 thì làm tròn về nửa band trước đó. Công cụ tính bằng đơn vị nửa band nguyên để tránh sai số thập phân tại ranh giới.',
      'Nếu muốn kiểm tra lại điểm overall chính thức, hãy nhập đúng bốn điểm trên bảng điểm IELTS thật. Điểm bài thi thử, ước tính của giáo viên hoặc công cụ trực tuyến có thể hỗ trợ học tập, nhưng độ chính xác phụ thuộc vào cách đánh giá. Riêng Writing và Speaking cần được đánh giá theo tiêu chí công khai; nhập điểm mong muốn không biến điểm đó thành kết quả đã đạt.',
      'Listening và Reading dựa trên số câu trả lời đúng, nhưng việc quy đổi sang band có thể thay đổi theo đề. Chúng tôi không đưa bảng quy đổi số câu đúng chung vì bảng đó có thể tạo cảm giác chính xác sai lệch. Hãy dùng bốn điểm kỹ năng đã được báo cáo. Với Writing và Speaking, nên tập trung vào tiêu chí và phản hồi chỉ rõ bước cải thiện tiếp theo, thay vì chỉ nhìn vào overall.',
      'Một kỹ năng cao hơn có thể bù cho kỹ năng thấp hơn trong phép tính overall. Tuy nhiên, trường học, nhà tuyển dụng hoặc cơ quan cấp thị thực có thể yêu cầu điểm tối thiểu riêng cho từng kỹ năng. Hãy kiểm tra yêu cầu hiện hành trực tiếp với nơi nhận hồ sơ. Điểm overall không thay thế các yêu cầu riêng đó. Trước quyết định quan trọng, hãy đọc giải thích chính thức của IELTS ở liên kết bên dưới.',
    ],
    speakingHeading: 'Speaking là kỹ năng thí sinh Việt Nam thường đạt điểm thấp nhất',
    speakingData: 'Dữ liệu IELTS 2024–25 ghi nhận điểm Speaking trung bình 5,61 so với overall trung bình 6,20 của thí sinh Việt Nam. Đây là số liệu nhóm, không dự đoán điểm cá nhân.',
    baseline: 'Đặt lịch Speaking Baseline để được đánh giá',
    faqTitle: 'Câu hỏi thường gặp',
    plannerTitle: 'Cần bao nhiêu điểm? Công cụ tính điểm mục tiêu',
    plannerIntro: 'Nhập ba điểm bạn đã có hoặc dự kiến, chọn kỹ năng còn lại và chọn overall mục tiêu. Công cụ cho biết điểm thấp nhất cần đạt ở kỹ năng đó.',
    missingSkill: 'Kỹ năng cần tính', target: 'Overall mục tiêu',
    plannerResult: (skill: string, band: string, target: string) => `Bạn cần tối thiểu ${band} ở ${skill} để đạt overall ${target}.`,
    plannerImpossible: (skill: string, target: string) => `Với các điểm này, kể cả 9,0 ở ${skill} cũng không đạt overall ${target}.`,
    roundingTitle: 'Bảng làm tròn điểm IELTS overall',
    roundingIntro: 'Bốn kỹ năng tính theo nửa band luôn cho trung bình kết thúc bằng một trong tám phần thập phân. Bảng dưới cho thấy cách làm tròn từng trường hợp, ví dụ từ 6,0 đến 6,875; quy tắc giống nhau ở mọi band.',
    averageCol: 'Trung bình bốn kỹ năng', roundsCol: 'Điểm overall',
    examplesTitle: 'Ví dụ tính điểm',
    examplesCols: ['Listening', 'Reading', 'Writing', 'Speaking', 'Trung bình', 'Overall'],
    timerIntro: 'Luyện tập với một phút chuẩn bị và hai phút nói. Các thẻ chủ đề do chúng tôi tự viết để luyện tập, không phải câu hỏi của đề thi thật.',
    chooseTopic: 'Chủ đề luyện tập', plan: 'Chuẩn bị', speak: 'Nói', ready: 'Sẵn sàng', done: 'Hoàn thành',
    start: 'Bắt đầu', reset: 'Đặt lại đồng hồ', next: 'Chủ đề tiếp theo',
    structure: 'Trả lời → lý do → ví dụ → mở rộng',
    structureText: 'Bắt đầu bằng câu trả lời trực tiếp. Giải thích lý do, đưa ví dụ cụ thể, rồi phát triển câu chuyện hoặc nêu tác động. Trong phút chuẩn bị, hãy ghi từ khóa thay vì viết cả bài.',
    record: 'Ghi âm', stop: 'Dừng ghi âm', recording: 'Đang ghi âm trên thiết bị này',
    playback: 'Nghe lại bản ghi', micError: 'Không thể truy cập micro hoặc quyền đã bị từ chối. Bạn vẫn có thể dùng đồng hồ.',
    privacy: 'Ghi âm là tùy chọn. Âm thanh chỉ ở trên thiết bị này, chỉ được giữ trong tab trình duyệt và không bao giờ được Jurassic English tải lên hoặc lưu trữ. Đặt lại hoặc rời trang để xóa bản ghi.',
    practice: 'Khám phá AI Speaking dành cho người lớn', measured: 'Đặt lịch Speaking Baseline để được đánh giá',
    sound: 'Âm báo nhẹ đánh dấu lúc chuyển sang phần nói và khi kết thúc.',
    timerNotOfficial: 'Chỉ để luyện tập: đồng hồ không chấm câu trả lời của bạn và không phải điểm IELTS chính thức.',
  },
} as const;

const topics = [
  ['a place where you like to think', 'một nơi bạn thích suy nghĩ'],
  ['a person who taught you a useful skill', 'một người đã dạy bạn kỹ năng hữu ích'],
  ['a journey that changed your view', 'một chuyến đi thay đổi góc nhìn của bạn'],
  ['an object you repaired or reused', 'một đồ vật bạn đã sửa hoặc tái sử dụng'],
  ['a book that started a conversation', 'một cuốn sách gợi ra cuộc trò chuyện'],
  ['a local tradition you value', 'một truyền thống địa phương bạn trân trọng'],
  ['a difficult choice you made', 'một quyết định khó khăn bạn đã đưa ra'],
  ['a quiet place in your community', 'một nơi yên tĩnh trong cộng đồng của bạn'],
  ['a time you helped someone learn', 'một lần bạn giúp ai đó học điều mới'],
  ['a goal you changed and why', 'một mục tiêu bạn đã thay đổi và lý do'],
] as const;

const pageClass = 'insights-page ielts-tools-page min-h-screen';
const cardClass = 'ielts-tool-card rounded-2xl bg-white p-6 shadow-sm';
const buttonClass = 'ielts-tool-button-primary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 font-bold disabled:opacity-50';
const secondaryButtonClass = 'ielts-tool-button-secondary inline-flex min-h-12 items-center justify-center rounded-full px-6 py-3 font-bold';
const inputClass = 'ielts-tool-input mt-2 block min-h-12 w-full rounded-xl border p-3';

export function ToolHero({ locale, title, lead, eyebrow, counterpart, children }: { locale: Locale; title: string; lead: string; eyebrow: string; counterpart: string; children?: ReactNode }) {
  return <header className="insights-hero">
    <picture className="insights-compass" aria-hidden="true"><source media="(max-width: 640px)" srcSet="/images/hero-compass-bg-640.webp" /><img src="/images/hero-compass-bg-960.webp" width="960" height="960" alt="" fetchPriority="high" /></picture>
    <div className="insights-hero-inner"><div>
      <p className="insights-eyebrow">{eyebrow}</p><h1 className={`insights-title ${locale === 'vi' ? 'insights-title-native' : 'font-display'}`}>{title}</h1><p className="insights-lead">{lead}</p>
      {children}
      <div className="insights-language" role="group" aria-label={locale === 'vi' ? 'Ngôn ngữ' : 'Language'}>
        <a className={locale === 'en' ? 'current' : ''} aria-current={locale === 'en' ? 'page' : undefined} href={locale === 'en' ? undefined : counterpart} lang="en">English</a>
        <a className={locale === 'vi' ? 'current' : ''} aria-current={locale === 'vi' ? 'page' : undefined} href={locale === 'vi' ? undefined : counterpart} lang="vi">Tiếng Việt</a>
      </div>
    </div></div>
  </header>;
}


const SKILLS = ['Listening', 'Reading', 'Writing', 'Speaking'] as const;
const fmt = (locale: Locale, value: number, digits = 1) => value.toFixed(digits).replace('.', locale === 'vi' ? ',' : '.');
const BAND_OPTIONS = Array.from({ length: 19 }, (_, i) => i / 2);
const EXAMPLES: ReadonlyArray<readonly [number, number, number, number]> = [
  [7, 6.5, 6, 6.5], [6.5, 6.5, 6, 5.5], [7.5, 7, 6, 6.5], [6, 6, 5.5, 5.5], [8, 7.5, 6.5, 6], [6.5, 6, 6, 6],
];

function TargetPlanner({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [missing, setMissing] = useState(3);
  const [known, setKnown] = useState([7, 6.5, 6, 6]);
  const [target, setTarget] = useState(6.5);
  const others = known.filter((_, index) => index !== missing);
  const needed = minimumBandForTarget(others, target);
  return <section className={cardClass} aria-labelledby="planner-title">
    <h2 id="planner-title" className="mb-3 text-2xl font-bold">{c.plannerTitle}</h2><p className="mb-4">{c.plannerIntro}</p>
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="block font-semibold">{c.missingSkill}<select className={inputClass} value={missing} onChange={(event) => setMissing(Number(event.target.value))}>{SKILLS.map((skill, index) => <option key={skill} value={index}>{skill}</option>)}</select></label>
      <label className="block font-semibold">{c.target}<select className={inputClass} value={target} onChange={(event) => setTarget(Number(event.target.value))}>{BAND_OPTIONS.filter((b) => b >= 4).map((b) => <option key={b} value={b}>{fmt(locale, b)}</option>)}</select></label>
      {SKILLS.map((skill, index) => index === missing ? null : <label key={skill} className="block font-semibold">{skill}<select className={inputClass} value={known[index]} onChange={(event) => { const next = [...known]; next[index] = Number(event.target.value); setKnown(next); }}>{BAND_OPTIONS.map((b) => <option key={b} value={b}>{fmt(locale, b)}</option>)}</select></label>)}
    </div>
    <p role="status" className="mt-5 text-xl font-bold">{needed === null ? c.plannerImpossible(SKILLS[missing], fmt(locale, target)) : c.plannerResult(SKILLS[missing], fmt(locale, needed), fmt(locale, target))}</p>
  </section>;
}

function RoundingTable({ locale }: { locale: Locale }) {
  const c = copy[locale];
  return <section className={cardClass} aria-labelledby="rounding-title">
    <h2 id="rounding-title" className="mb-3 text-2xl font-bold">{c.roundingTitle}</h2><p className="mb-4">{c.roundingIntro}</p>
    <table className="w-full border-collapse text-left"><thead><tr><th scope="col" className="border-b p-2">{c.averageCol}</th><th scope="col" className="border-b p-2">{c.roundsCol}</th></tr></thead>
      <tbody>{AVERAGE_FRACTIONS.map((fraction) => <tr key={fraction}><td className="border-b p-2 tabular-nums">{fmt(locale, 6 + fraction, 3)}</td><td className="border-b p-2 font-semibold tabular-nums">{fmt(locale, roundAverage(6 + fraction))}</td></tr>)}</tbody></table>
    <h3 className="mt-6 mb-3 text-xl font-bold">{c.examplesTitle}</h3>
    <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={c.examplesTitle}><table className="w-full min-w-[32rem] border-collapse text-left"><thead><tr>{c.examplesCols.map((col) => <th key={col} scope="col" className="border-b p-2">{col}</th>)}</tr></thead>
      <tbody>{EXAMPLES.map((row) => { const average = row.reduce((a, b) => a + b, 0) / 4; return <tr key={row.join('-')}>{row.map((band, i) => <td key={i} className="border-b p-2 tabular-nums">{fmt(locale, band)}</td>)}<td className="border-b p-2 tabular-nums">{fmt(locale, average, 3)}</td><td className="border-b p-2 font-semibold tabular-nums">{fmt(locale, calculateOverallBand([...row]))}</td></tr>; })}</tbody></table></div>
  </section>;
}

export function IeltsBandCalculatorPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [bands, setBands] = useState(['6', '6', '6', '6']);
  const [result, setResult] = useState<number | null>(null);
  const valid = bands.every((value) => isValidBand(Number(value)) && value.trim() !== '');
  const skills = ['Listening', 'Reading', 'Writing', 'Speaking'];
  return <main id="main-content" tabIndex={-1} className={pageClass}>
    <ToolHero locale={locale} title={c.calculator} lead={c.intro} eyebrow={locale === 'vi' ? 'Công cụ luyện IELTS' : 'IELTS practice tool'} counterpart={locale === 'vi' ? calculatorEn : calculatorVi} />
    <div className="ielts-tool-content mx-auto max-w-3xl space-y-8 px-5 py-14">
      <section className={cardClass} aria-label={c.keyFacts}><h2 className="mb-3 text-xl font-semibold">{c.keyFacts}</h2><p className="font-semibold">{c.notOfficial}</p></section>
      <section className={cardClass} aria-label={c.calculator}>
        <div className="grid gap-4 sm:grid-cols-2">{skills.map((skill, index) => <label key={skill} className="block font-semibold">{skill}
          <input className={inputClass} type="number" inputMode="decimal" min="0" max="9" step="0.5" value={bands[index]} onChange={(event) => { const next = [...bands]; next[index] = event.target.value; setBands(next); setResult(null); }} aria-invalid={bands[index] !== '' && !isValidBand(Number(bands[index]))} />
        </label>)}</div>
        {!valid && <p role="alert" className="mt-3 text-red-800">{c.invalid}</p>}
        <button type="button" className={`${buttonClass} mt-5`} disabled={!valid} onClick={() => setResult(calculateOverallBand(bands.map(Number)))}>{c.calculate}</button>
        {result !== null && <p role="status" className="mt-5 text-2xl font-bold">{c.overall}: {result.toFixed(1)}</p>}
      </section>
      <TargetPlanner locale={locale} />
      <RoundingTable locale={locale} />
      <article className="space-y-5 leading-7"><h2 className="text-2xl font-bold">{c.how}</h2>{c.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<a className="underline" href={source}>{c.source}</a></article>
      <section className={cardClass}><h2 className="mb-3 text-2xl font-bold">{c.speakingHeading}</h2>
        {/* Verified 14 Oct 2026: ielts.org test-taker-performance-data-2024-2025.xlsx, Academic by nationality, Vietnam Speaking 5.61 vs Overall 6.20 (widest gap of 40). */}
        <p>{c.speakingData}</p><a className="mt-4 inline-block font-semibold underline" href={locale === 'vi' ? '/ai-speaking/vi/baseline' : '/ai-speaking/baseline'}>{c.baseline}</a>
      </section>
      <section className={cardClass}><h2 className="mb-4 text-2xl font-bold">{c.faqTitle}</h2>{ieltsCalculatorFaqs[locale].map(([question, answer]) => <div key={question} className="mb-4"><h3 className="font-semibold">{question}</h3><p>{answer}</p></div>)}</section>
      <p className="text-sm">{c.independent}</p>
    </div>
    <div className="insights-closing"><div><p>{c.baseline}</p><div className="insights-closing-actions"><a className="insights-button-primary" href={locale === 'vi' ? '/ai-speaking/vi/baseline' : '/ai-speaking/baseline'}>{c.baseline}</a></div></div></div>
  </main>;
}

export function IeltsSpeakingTimerPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [topic, setTopic] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'plan' | 'speak' | 'done'>('ready');
  const [seconds, setSeconds] = useState(60);
  const [recording, setRecording] = useState(false);
  const [playback, setPlayback] = useState<string | null>(null);
  const [micError, setMicError] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audioContext = useRef<AudioContext | null>(null);
  const playbackRef = useRef<string | null>(null);
  const recordRequest = useRef(0);
  const chime = () => {
    const context = audioContext.current;
    if (!context) return;
    void context.resume().then(() => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine'; oscillator.frequency.value = 660;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.4);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(); oscillator.stop(context.currentTime + 0.42);
    }).catch(() => {});
  };
  useEffect(() => {
    if (phase !== 'plan' && phase !== 'speak') return;
    const deadline = Date.now() + (phase === 'plan' ? 60_000 : 120_000);
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        window.clearInterval(id);
        chime();
        if (phase === 'plan') { setPhase('speak'); setSeconds(120); }
        else setPhase('done');
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [phase]);
  useEffect(() => () => {
    recordRequest.current += 1;
    if (recorder.current?.state === 'recording') { recorder.current.onstop = null; recorder.current.stop(); }
    stream.current?.getTracks().forEach((track) => track.stop());
    if (playbackRef.current) URL.revokeObjectURL(playbackRef.current);
    void audioContext.current?.close();
  }, []);
  const discard = () => { if (playbackRef.current) URL.revokeObjectURL(playbackRef.current); playbackRef.current = null; setPlayback(null); };
  const stopRecording = () => { if (recorder.current?.state === 'recording') recorder.current.stop(); stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; setRecording(false); };
  const reset = () => { recordRequest.current += 1; if (recorder.current) recorder.current.onstop = null; stopRecording(); discard(); setPhase('ready'); setSeconds(60); setMicError(false); };
  const startRecording = async () => {
    setMicError(false);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setMicError(true); return; }
    const request = ++recordRequest.current;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (request !== recordRequest.current) { media.getTracks().forEach((track) => track.stop()); return; }
      stream.current = media;
      const chunks: BlobPart[] = [];
      const active = new MediaRecorder(media);
      recorder.current = active;
      active.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      active.onstop = () => { if (playbackRef.current) URL.revokeObjectURL(playbackRef.current); const url = URL.createObjectURL(new Blob(chunks, { type: active.mimeType || 'audio/webm' })); playbackRef.current = url; setPlayback(url); };
      discard(); active.start(); setRecording(true);
    } catch { stream.current?.getTracks().forEach((track) => track.stop()); stream.current = null; setMicError(true); }
  };
  return <main id="main-content" tabIndex={-1} className={pageClass}><ToolHero locale={locale} title={c.timer} lead={c.timerIntro} eyebrow={locale === 'vi' ? 'Công cụ luyện IELTS' : 'IELTS practice tool'} counterpart={locale === 'vi' ? timerEn : timerVi} /><div className="ielts-tool-content mx-auto max-w-3xl space-y-7 px-5 py-14">
    <section className={cardClass}><label className="font-semibold" htmlFor="timer-topic">{c.chooseTopic}</label><select id="timer-topic" className={inputClass} value={topic} onChange={(event) => { reset(); setTopic(Number(event.target.value)); }}>{topics.map((pair, index) => <option key={pair[0]} value={index}>{pair[locale === 'vi' ? 1 : 0]}</option>)}</select>
      <p className="mt-5 text-xl font-semibold">{locale === 'vi' ? `Hãy kể về ${topics[topic][1]}. Bạn nên nói đó là gì, vì sao bạn nhớ và điều bạn học được.` : `Describe ${topics[topic][0]}. Say what it is, why you remember it, and what you learned.`}</p>
      <p role="timer" aria-live="off" className="mt-6 text-center text-5xl font-bold tabular-nums">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p><p role="status" aria-live="polite" className="mt-2 text-center font-semibold">{c[phase]}</p>
      <div className="mt-6 flex flex-wrap gap-3"><button type="button" className={buttonClass} disabled={phase === 'plan' || phase === 'speak'} onClick={() => { reset(); const Ctor = window.AudioContext; if (Ctor) { void audioContext.current?.close(); audioContext.current = new Ctor(); void audioContext.current.resume(); } setPhase('plan'); setSeconds(60); }}>{c.start}</button><button type="button" className={secondaryButtonClass} onClick={reset}>{c.reset}</button><button type="button" className={secondaryButtonClass} onClick={() => { reset(); setTopic((topic + 1) % topics.length); }}>{c.next}</button></div><p className="mt-4 text-sm">{c.sound}</p>
    </section>
    <section className={cardClass}><h2 className="text-2xl font-bold">{c.structure}</h2><p className="mt-3">{c.structureText}</p></section>
    <section className={cardClass}><h2 className="text-xl font-bold">{c.record}</h2><p className="my-3">{c.privacy}</p><button type="button" className={buttonClass} onClick={recording ? stopRecording : () => void startRecording()}>{recording ? c.stop : c.record}</button>{recording && <p role="status" className="mt-3">{c.recording}</p>}{micError && <p role="alert" className="mt-3 text-red-800">{c.micError}</p>}{playback && <div className="mt-4"><label className="block" htmlFor="timer-playback">{c.playback}</label><audio id="timer-playback" controls src={playback} /></div>}</section>
    <div className="flex flex-wrap gap-6"><a className="font-semibold underline" href={locale === 'vi' ? '/ai-speaking/vi' : '/ai-speaking'}>{c.practice}</a><a className="font-semibold underline" href={locale === 'vi' ? '/ai-speaking/vi/baseline' : '/ai-speaking/baseline'}>{c.measured}</a></div>
    <p className="text-sm">{c.timerNotOfficial} {c.independent}</p>
  </div><div className="insights-closing"><div><p>{c.measured}</p><div className="insights-closing-actions"><a className="insights-button-primary" href={locale === 'vi' ? '/ai-speaking/vi/baseline' : '/ai-speaking/baseline'}>{c.measured}</a></div></div></div></main>;
}

export { copy as ieltsToolsCopy, calculatorEn, calculatorVi, timerEn, timerVi };

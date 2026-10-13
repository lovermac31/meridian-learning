import { useEffect, useRef, useState } from 'react';
import type { Locale } from '../i18n/locales';
import { calculateOverallBand, isValidBand } from '../lib/ieltsBand';

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
    faqs: [
      ['How is my IELTS overall band calculated?', 'Add Listening, Reading, Writing and Speaking bands, divide by four, then round to the nearest half or whole band using IELTS rules.'],
      ['Does 6.25 round to 6.5?', 'Yes. IELTS rounds an average ending in .25 to the next half band. An average ending in .75 rounds to the next whole band.'],
      ['Is this an official IELTS result?', 'No. Only an authorised IELTS test can issue an official score. This tool calculates an estimate from the bands you enter.'],
    ],
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
  },
  vi: {
    calculator: 'Tính điểm IELTS overall', timer: 'Đồng hồ IELTS Speaking Part 2',
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
    faqs: [
      ['Điểm IELTS overall được tính thế nào?', 'Cộng điểm Listening, Reading, Writing và Speaking, chia cho bốn, rồi làm tròn theo quy tắc IELTS.'],
      ['6,25 có được làm tròn thành 6,5 không?', 'Có. IELTS làm tròn trung bình kết thúc bằng ,25 lên nửa band tiếp theo; ,75 lên band nguyên tiếp theo.'],
      ['Đây có phải điểm IELTS chính thức không?', 'Không. Chỉ kỳ thi IELTS được ủy quyền mới cấp điểm chính thức. Công cụ này ước tính từ điểm bạn nhập.'],
    ],
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

const pageClass = 'min-h-screen bg-[#f8f6f1] px-5 pb-20 pt-32 text-[#182923]';
const cardClass = 'rounded-2xl border border-[#d7ded4] bg-white p-6 shadow-sm';
const buttonClass = 'rounded-lg bg-[#174739] px-5 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#174739] disabled:opacity-50';

export function IeltsBandCalculatorPage({ locale }: { locale: Locale }) {
  const c = copy[locale];
  const [bands, setBands] = useState(['6', '6', '6', '6']);
  const [result, setResult] = useState<number | null>(null);
  const valid = bands.every((value) => isValidBand(Number(value)) && value.trim() !== '');
  const skills = ['Listening', 'Reading', 'Writing', 'Speaking'];
  return <main id="main-content" tabIndex={-1} className={pageClass}>
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-4xl font-bold">{c.calculator}</h1>
      <section className={cardClass} aria-label={c.keyFacts}><h2 className="mb-3 text-xl font-semibold">{c.keyFacts}</h2><p>{c.intro}</p><p className="mt-3 font-semibold">{c.notOfficial}</p></section>
      <section className={cardClass} aria-label={c.calculator}>
        <div className="grid gap-4 sm:grid-cols-2">{skills.map((skill, index) => <label key={skill} className="block font-semibold">{skill}
          <input className="mt-2 block w-full rounded-lg border border-[#536a60] p-3" type="number" inputMode="decimal" min="0" max="9" step="0.5" value={bands[index]} onChange={(event) => { const next = [...bands]; next[index] = event.target.value; setBands(next); setResult(null); }} aria-invalid={bands[index] !== '' && !isValidBand(Number(bands[index]))} />
        </label>)}</div>
        {!valid && <p role="alert" className="mt-3 text-red-800">{c.invalid}</p>}
        <button type="button" className={`${buttonClass} mt-5`} disabled={!valid} onClick={() => setResult(calculateOverallBand(bands.map(Number)))}>{c.calculate}</button>
        {result !== null && <p role="status" className="mt-5 text-2xl font-bold">{c.overall}: {result.toFixed(1)}</p>}
      </section>
      <article className="space-y-5 leading-7"><h2 className="text-2xl font-bold">{c.how}</h2>{c.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}<a className="underline" href={source}>{c.source}</a></article>
      <section className={cardClass}><h2 className="mb-3 text-2xl font-bold">{c.speakingHeading}</h2>
        {/* Verified 14 Oct 2026: ielts.org test-taker-performance-data-2024-2025.xlsx, Academic by nationality, Vietnam Speaking 5.61 vs Overall 6.20 (widest gap of 40). */}
        <p>{c.speakingData}</p><a className="mt-4 inline-block font-semibold underline" href={locale === 'vi' ? '/ai-speaking/vi/baseline' : '/ai-speaking/baseline'}>{c.baseline}</a>
      </section>
      <section className={cardClass}><h2 className="mb-4 text-2xl font-bold">{c.faqTitle}</h2>{c.faqs.map(([question, answer]) => <div key={question} className="mb-4"><h3 className="font-semibold">{question}</h3><p>{answer}</p></div>)}</section>
      <p className="text-sm">{c.independent}</p>
    </div>
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
  return <main id="main-content" tabIndex={-1} className={pageClass}><div className="mx-auto max-w-3xl space-y-7">
    <h1 className="text-4xl font-bold">{c.timer}</h1><p>{c.timerIntro}</p>
    <section className={cardClass}><label className="font-semibold" htmlFor="timer-topic">{c.chooseTopic}</label><select id="timer-topic" className="mt-2 block w-full rounded-lg border border-[#536a60] p-3" value={topic} onChange={(event) => { reset(); setTopic(Number(event.target.value)); }}>{topics.map((pair, index) => <option key={pair[0]} value={index}>{pair[locale === 'vi' ? 1 : 0]}</option>)}</select>
      <p className="mt-5 text-xl font-semibold">{locale === 'vi' ? `Hãy kể về ${topics[topic][1]}. Bạn nên nói đó là gì, vì sao bạn nhớ và điều bạn học được.` : `Describe ${topics[topic][0]}. Say what it is, why you remember it, and what you learned.`}</p>
      <p role="timer" aria-live="off" className="mt-6 text-center text-5xl font-bold tabular-nums">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</p><p role="status" aria-live="polite" className="mt-2 text-center font-semibold">{c[phase]}</p>
      <div className="mt-6 flex flex-wrap gap-3"><button type="button" className={buttonClass} disabled={phase === 'plan' || phase === 'speak'} onClick={() => { reset(); const Ctor = window.AudioContext; if (Ctor) { void audioContext.current?.close(); audioContext.current = new Ctor(); void audioContext.current.resume(); } setPhase('plan'); setSeconds(60); }}>{c.start}</button><button type="button" className={buttonClass} onClick={reset}>{c.reset}</button><button type="button" className={buttonClass} onClick={() => { reset(); setTopic((topic + 1) % topics.length); }}>{c.next}</button></div><p className="mt-4 text-sm">{c.sound}</p>
    </section>
    <section className={cardClass}><h2 className="text-2xl font-bold">{c.structure}</h2><p className="mt-3">{c.structureText}</p></section>
    <section className={cardClass}><h2 className="text-xl font-bold">{c.record}</h2><p className="my-3">{c.privacy}</p><button type="button" className={buttonClass} onClick={recording ? stopRecording : () => void startRecording()}>{recording ? c.stop : c.record}</button>{recording && <p role="status" className="mt-3">{c.recording}</p>}{micError && <p role="alert" className="mt-3 text-red-800">{c.micError}</p>}{playback && <div className="mt-4"><label className="block" htmlFor="timer-playback">{c.playback}</label><audio id="timer-playback" controls src={playback} /></div>}</section>
    <div className="flex flex-wrap gap-6"><a className="font-semibold underline" href={locale === 'vi' ? '/ai-speaking/vi' : '/ai-speaking'}>{c.practice}</a><a className="font-semibold underline" href={locale === 'vi' ? '/ai-speaking/vi/baseline' : '/ai-speaking/baseline'}>{c.measured}</a></div>
    <p className="text-sm">{c.independent}</p>
  </div></main>;
}

export { copy as ieltsToolsCopy, calculatorEn, calculatorVi, timerEn, timerVi };

import { useEffect } from 'react';
import { getPublishedInsightArticles, getInsightArticleBySlug, INSIGHTS_BASE_PATH } from '../lib/insightsContent';
import { OneChangeInvitation } from './OneChangeInvitation';
import { getSeoPage, seoPages, isInternationalMarketPath } from '../lib/seoPages';
import type { SeoPage } from '../lib/seoPages';
import { FounderFilmLink } from './FounderFilmLink';

// The founder film card sits right after the key-facts box on Mr. Jay's own page (EN + VI).
const FOUNDER_PAGES = new Set(['/about/nathaniel-jay-adams', '/vi/ve-thay-jay-adams']);
import marketPricing from '../content/marketPricing.json';
import { PAYPAL_LOGO, PAYPAL_PAYEE_NAME } from '../lib/paypal';

const sources = <ul className="list-disc pl-6"><li><a href="https://ielts.org/take-a-test/test-types/ielts-academic-test/ielts-academic-format-speaking" rel="noopener noreferrer">IELTS Academic Speaking test format</a></li><li><a href="https://ielts.org/cdn/ielts-guides/ielts-speaking-key-assessment-criteria.pdf" rel="noopener noreferrer">IELTS Speaking key assessment criteria</a></li></ul>;

function AdultCoachingGuide() {
  return <>
    <h2>Who this guide is for</h2>
    <p>This English-language guide is for adults aged 18+ considering online IELTS Speaking coaching, initially in Vietnam. It is not the young-learner programme or a parent enquiry page. Adults overseas can use the practice guidance, but should confirm adult session eligibility, payment support and timezone compatibility in the booking flow before paying.</p>
    <h2>1. Start with free independent practice</h2>
    <p>Use a small task to see whether you can apply a useful change yourself. The One Change challenge uses an illustrative written answer: choose an improvement, explore why it helps, then try a fresh topic in your own words. Speak your attempt aloud and note one question you would like a coach to review.</p>
    <p><a href="/challenges/one-change">Try the free One Change practice challenge</a>. This is independent practice, not a free personalised speaking assessment or an IELTS band score. You do not need to buy a session to use the challenge.</p>
    <h2>2. Consider a paid live speaking baseline</h2>
    <p>If you need feedback on how you actually speak, review the paid live baseline as a possible next step. Bring your exam goal, target date, recent practice difficulties and questions about feedback. Confirm adult suitability and what is included before booking; this guide does not promise a session length, report or available slot.</p>
    <p>A live spoken sample can give a coach evidence of delivery, intelligibility, hesitation, wording and how you respond to follow-up questions. It can help identify a practice priority for the performance observed. Ask which speaking tasks and criteria the session covers, and how the coach will explain the evidence behind any practice estimate.</p>
    <p><a href="/ai-speaking/baseline">Review the paid live Speaking Baseline and booking details</a>.</p>
    <h2>Live speaking and typed practice are different evidence</h2>
    <p>Typed practice can show word choice, grammar and visible organization. It cannot establish pronunciation, spoken pace, hesitation or real-time interaction. A polished written answer is not evidence of equivalent spoken performance. AI feedback may be wrong and should be checked where it matters.</p>
    <p>The official IELTS Speaking test has three parts: familiar-topic questions, an individual long turn and a wider discussion. The public criteria cover fluency and coherence, lexical resource, grammatical range and accuracy, and pronunciation. These criteria explain why spoken evidence matters; they do not make a coaching session an official test.</p>
    <h2>What one session cannot establish</h2>
    <p>A baseline is a limited practice sample, not an official IELTS result, a complete measure of ability across every topic or a prediction of your exam score. Connection quality, unfamiliar topics and nerves can affect the sample. Any practice band estimate is provisional. One session cannot establish lasting improvement; that requires later independent attempts and review over time.</p>
    <p>There are no score guarantees, guaranteed band increases or promised exam outcomes. Practice estimates are not an official IELTS score. Jurassic English is independent of British Council, IDP IELTS and Cambridge University Press &amp; Assessment, the joint owners of IELTS, and its preparation does not imply IELTS endorsement.</p>
    <h2>3. Decide whether one-to-one coaching fits</h2>
    <p>Consider paid 1:1 coaching when you want guided spoken practice and feedback on a specific priority. A useful lesson plan should connect an observed difficulty to a strategy, a guided attempt, a fresh independent attempt and a manageable follow-up. Ask how the coach would compare attempts rather than simply provide a memorized answer.</p>
    <p>Continuing independently is also a reasonable choice if you can identify and practise your next step. A baseline does not oblige you to buy further lessons.</p>
    <p><a href="/ai-speaking/solutions">Review one-to-one coaching options and booking details</a>.</p>
    <h2>Before paying: confirm the practical details</h2>
    <ul>
      <li>Adult eligibility and whether the session fits your goal and exam timeline.</li>
      <li>Current price, currency, accepted payment methods and any applicable fees in the booking flow.</li>
      <li>Available dates, the displayed timezone and the corresponding local time where you will attend, including daylight-saving changes overseas.</li>
      <li>Session duration, online meeting platform, technical requirements and the feedback or follow-up included.</li>
      <li>Cancellation, rescheduling and refund terms, and the coach&apos;s relevant experience or credentials if those matter to your decision.</li>
    </ul>
    <p>If adult eligibility, payment or scheduling is unclear, seek confirmation through booking before paying. No payment method, qualification, availability, price or result is promised here.</p>
    <h2>Official IELTS references</h2>
    {sources}
  </>;
}

// Every article owns its body. Unknown slugs must never inherit another guide.
const articleBodies: Record<string, React.ReactNode> = {
  'online-ielts-speaking-coaching': <AdultCoachingGuide />,
  'what-to-fix-first-in-ielts-speaking': <><h2>Start with evidence, not a general impression</h2><p>Read or listen to one answer and identify a specific moment that affects clarity or development. For example, in this illustrative answer, “I like the city because it is good and has many things,” the learner gives a preference but does not explain it with a concrete reason.</p><h2>Choose one next priority</h2><p>A useful coaching priority could be: add one relevant reason and a specific example before adding more advanced vocabulary. This is a practice choice, not an official band score or a prediction of an exam result.</p><h2>Try an independent attempt</h2><p>Answer the same question again in your own words. Check whether the reason and example make the point clearer. A teacher can then compare both attempts and choose the next step.</p><h2>What this does not establish</h2><p>A short sample cannot reliably predict a test result. IELTS Speaking assessment uses published criteria across a spoken performance; feedback should describe the evidence available and its limits.</p>{sources}<p><a href="/ai-speaking">Explore Jurassic AI Speaking practice</a> or <a href="/ai-speaking/solutions">review one-to-one session options</a>.</p></>,
  'what-typed-speaking-practice-can-assess': <><h2>What text can show</h2><p>A typed response can be reviewed for visible wording, vocabulary choices, grammar and how ideas are organized. It can support reflection and help a learner plan a clearer answer.</p><h2>What text cannot show</h2><p>Typed text does not contain pronunciation, intelligibility, pace, hesitation or spoken interaction. Those require audio or a live spoken performance. A text-based result must not be presented as a complete IELTS Speaking assessment.</p><h2>Use the result as a practice aid</h2><p>Use written feedback to choose a small revision, then practise speaking aloud and, where appropriate, seek human feedback on delivery. AI feedback is formative and may be wrong; check important advice against a teacher and the public criteria.</p>{sources}<p><a href="/ai-speaking">See the available typed practice</a>.</p></>,
  'from-speaking-diagnostic-to-one-to-one-lesson': <><h2>1. Review the evidence</h2><p>Begin with one answer and identify a concrete strength and a priority for improvement. Keep observations tied to what the learner actually said.</p><h2>2. Practise with guidance</h2><p>A one-to-one lesson can model a strategy, practise it with a related prompt and give the learner a chance to explain their choices. The session should build understanding rather than simply supply a memorized response.</p><h2>3. Try again independently</h2><p>The learner attempts a fresh or repeated task without copying a model. Compare the attempt with the original and note what changed.</p><h2>4. Agree a follow-up</h2><p>Choose one manageable practice action. Current session availability and payable options are shown only in the booking flow; this article does not promise a slot or a score outcome.</p><p><a href="/ai-speaking/solutions">See current one-to-one session options</a>.</p></>,
};

const languageLabels: Record<string, string> = {
  en: 'English', vi: 'Tiếng Việt', es: 'Español', 'pt-BR': 'Português',
  id: 'Bahasa Indonesia', ms: 'Bahasa Melayu', th: 'ไทย',
  ar: 'العربية', ur: 'اردو', bn: 'বাংলা',
};

const chrome: Record<string, { resources: string; language: string; scroll: string; closing: string; baseline: string; book?: string; lesson: string; from: string; minutes: string; note: string; ai: string; tools: string; hubNote?: string }> = {
  en: { resources: 'Learning resources', language: 'Language', scroll: 'Scroll to see more →', closing: 'Ready to practise with a teacher?', baseline: 'Request a Speaking Baseline', book: 'Book a Speaking Baseline', lesson: 'Request a one-to-one lesson', from: 'from', minutes: 'min', note: 'Requests go to info@jurassicenglish.com. USD card payment is not live yet.', hubNote: 'Requests go to info@jurassicenglish.com. PayPal (USD) is available on most country pages.', ai: 'See how AI Speaking practice works (18+)', tools: 'Free IELTS band score calculator' },
  vi: { resources: 'Tài liệu học tập', language: 'Ngôn ngữ', scroll: 'Vuốt để xem thêm →', closing: 'Sẵn sàng luyện tập cùng giáo viên?', baseline: 'Gửi yêu cầu đánh giá Speaking', lesson: 'Gửi yêu cầu học một kèm một', from: 'từ', minutes: 'phút', note: 'Yêu cầu được gửi tới info@jurassicenglish.com. Thanh toán thẻ bằng USD chưa được mở.', ai: 'Xem cách luyện Speaking với AI (18+)', tools: 'Công cụ tính điểm IELTS miễn phí' },
  es: { resources: 'Recursos de aprendizaje', language: 'Idioma', scroll: 'Desliza para ver más →', closing: '¿Listo para practicar con un profesor?', baseline: 'Solicita una evaluación inicial de Speaking', lesson: 'Solicita una clase individual', from: 'desde', minutes: 'min', note: 'Las solicitudes llegan a info@jurassicenglish.com. El pago con tarjeta en USD aún no está activo.', hubNote: 'Las solicitudes llegan a info@jurassicenglish.com. PayPal (USD) está disponible en la mayoría de las páginas de país.', ai: 'Cómo funciona la práctica de Speaking con IA (18+, en inglés)', tools: 'Calculadora gratuita de banda IELTS (en inglés)' },
  'pt-BR': { resources: 'Recursos de aprendizagem', language: 'Idioma', scroll: 'Deslize para ver mais →', closing: 'Pronto para praticar com um professor?', baseline: 'Solicite uma avaliação inicial de Speaking', lesson: 'Solicite uma aula individual', from: 'a partir de', minutes: 'min', note: 'As solicitações vão para info@jurassicenglish.com. O pagamento com cartão em USD ainda não está ativo.', hubNote: 'As solicitações vão para info@jurassicenglish.com. O PayPal (USD) está disponível na maioria das páginas de país.', ai: 'Como funciona a prática de Speaking com IA (18+, em inglês)', tools: 'Calculadora gratuita de banda IELTS (em inglês)' },
  id: { resources: 'Sumber belajar', language: 'Bahasa', scroll: 'Geser untuk melihat selengkapnya →', closing: 'Siap berlatih bersama pengajar?', baseline: 'Ajukan asesmen awal Speaking', lesson: 'Ajukan les privat', from: 'mulai', minutes: 'menit', note: 'Permintaan dikirim ke info@jurassicenglish.com. Pembayaran kartu dalam USD belum aktif.', ai: 'Cara kerja latihan Speaking dengan AI (18+, bahasa Inggris)', tools: 'Kalkulator band IELTS gratis (bahasa Inggris)' },
  ms: { resources: 'Sumber pembelajaran', language: 'Bahasa', scroll: 'Leret untuk lihat lagi →', closing: 'Sedia berlatih dengan guru?', baseline: 'Mohon penilaian awal Speaking', lesson: 'Mohon kelas individu', from: 'bermula', minutes: 'minit', note: 'Permohonan dihantar ke info@jurassicenglish.com. Bayaran kad dalam USD belum aktif.', ai: 'Cara latihan Speaking AI berfungsi (18+, bahasa Inggeris)', tools: 'Kalkulator band IELTS percuma (bahasa Inggeris)' },
  th: { resources: 'แหล่งเรียนรู้', language: 'ภาษา', scroll: 'เลื่อนเพื่อดูเพิ่มเติม →', closing: 'พร้อมฝึกกับครูแล้วหรือยัง?', baseline: 'ขอรับการประเมิน Speaking เบื้องต้น', lesson: 'ขอเรียนตัวต่อตัว', from: 'เริ่มต้นที่', minutes: 'นาที', note: 'คำขอจะส่งไปที่ info@jurassicenglish.com ระบบชำระเงินด้วยบัตรเป็น USD ยังไม่เปิดใช้งาน', ai: 'ดูวิธีฝึก Speaking กับ AI (18+, ภาษาอังกฤษ)', tools: 'เครื่องคำนวณคะแนน IELTS ฟรี (ภาษาอังกฤษ)' },
  ar: { resources: 'مصادر التعلّم', language: 'اللغة', scroll: 'مرّر لرؤية المزيد ←', closing: 'هل أنت مستعد للتدرّب مع معلّم؟', baseline: 'اطلب التقييم الأولي للمحادثة', lesson: 'اطلب درسًا فرديًا', from: 'ابتداءً من', minutes: 'دقيقة', note: 'تصل الطلبات إلى info@jurassicenglish.com. الدفع بالبطاقة بالدولار الأمريكي غير متاح بعد.', ai: 'تعرّف على التدريب على المحادثة بالذكاء الاصطناعي (18+) — بالإنجليزية', tools: 'حاسبة درجات ايلتس مجانية (بالإنجليزية)' },
  ur: { resources: 'تعلیمی وسائل', language: 'زبان', scroll: 'مزید دیکھنے کے لیے اسکرول کریں ←', closing: 'استاد کے ساتھ مشق کے لیے تیار ہیں؟', baseline: 'ابتدائی اسپیکنگ جائزے کی درخواست کریں', lesson: 'انفرادی سبق کی درخواست کریں', from: 'سے', minutes: 'منٹ', note: 'درخواستیں info@jurassicenglish.com پر جاتی ہیں۔ امریکی ڈالر میں کارڈ ادائیگی ابھی دستیاب نہیں۔', ai: 'AI Speaking مشق کیسے کام کرتی ہے (18+) — انگریزی میں', tools: 'مفت IELTS بینڈ کیلکولیٹر (انگریزی میں)' },
  bn: { resources: 'শেখার উপকরণ', language: 'ভাষা', scroll: 'আরও দেখতে স্ক্রল করুন →', closing: 'শিক্ষকের সঙ্গে অনুশীলনে প্রস্তুত?', baseline: 'প্রাথমিক Speaking মূল্যায়নের অনুরোধ করুন', lesson: 'একান্ত পাঠের অনুরোধ করুন', from: 'শুরু', minutes: 'মিনিট', note: 'অনুরোধ যায় info@jurassicenglish.com-এ। USD-তে কার্ড পেমেন্ট এখনও চালু হয়নি।', ai: 'AI দিয়ে Speaking অনুশীলন কীভাবে কাজ করে (18+, ইংরেজিতে)', tools: 'বিনামূল্যে IELTS ব্যান্ড ক্যালকুলেটর (ইংরেজিতে)' },
};

const countryNames: Record<string, Record<string, string>> = {
  en: { india: 'India', philippines: 'Philippines', indonesia: 'Indonesia', malaysia: 'Malaysia', singapore: 'Singapore', thailand: 'Thailand', uae: 'UAE', 'saudi-arabia': 'Saudi Arabia', pakistan: 'Pakistan', bangladesh: 'Bangladesh', nigeria: 'Nigeria', egypt: 'Egypt', colombia: 'Colombia', peru: 'Peru', chile: 'Chile', argentina: 'Argentina', brazil: 'Brazil' },
  es: { colombia: 'Colombia', peru: 'Perú', chile: 'Chile', argentina: 'Argentina' },
  'pt-BR': { brazil: 'Brasil' }, id: { indonesia: 'Indonesia' }, ms: { malaysia: 'Malaysia' }, th: { thailand: 'ประเทศไทย' },
  ar: { uae: 'الإمارات', 'saudi-arabia': 'السعودية', egypt: 'مصر' }, ur: { pakistan: 'پاکستان' }, bn: { bangladesh: 'বাংলাদেশ' },
};

const marketFromPath = (path: string) => {
  const slug = path.split('/').filter(Boolean).at(-1);
  return slug === 'ielts-speaking-online' ? undefined : slug === 'brasil' ? 'brazil' : slug;
};

// Market CTAs (website assessment, 27 Oct 2026, fix 7): on a PayPal market the buttons open the live order-first
// checkout at the country's US$ price (the PayPal panel's own links), never an email. Pakistan and Bangladesh (PayPal
// is not available to residents) and the hubs (no single country price) keep the email booking request.
function marketCtas(path: string, locale: string) {
  const market = marketFromPath(path);
  const tier = market ? marketPricing.markets[market as keyof typeof marketPricing.markets] : 1;
  const prices = marketPricing.tiers[String(tier) as keyof typeof marketPricing.tiers];
  const copy = chrome[locale] ?? chrome.en;
  const prefix = market ? '' : `${copy.from} `;
  const baselinePrice = `${prefix}US$${prices.baseline_usd}`;
  const lessonPrice = `${prefix}US$${prices.lesson_usd}`;
  const where = market ? countryNames.en[market] ?? market : 'International';
  const request = (offer: string, price: string) => `mailto:info@jurassicenglish.com?subject=${encodeURIComponent(`${offer} request - ${where} (${price})`)}`;
  if (market && paypalMarket(path, locale)) {
    return [
      { href: checkoutHref('baseline', market), label: `${copy.book ?? copy.baseline} · ${baselinePrice}` },
      { href: checkoutHref('lesson', market), label: `${copy.lesson} · ${lessonPrice} / 60 ${copy.minutes}` },
    ];
  }
  return [
    { href: request('Speaking Baseline', baselinePrice), label: `${copy.baseline} · ${baselinePrice}` },
    { href: request('One-to-one lesson', `${lessonPrice} / 60 min`), label: `${copy.lesson} · ${lessonPrice} / 60 ${copy.minutes}` },
  ];
}

const latinRun = /\(?[A-Za-z0-9$+](?:[A-Za-z0-9$+.,:/–-]|\s+(?=[A-Za-z0-9$+(])|\((?=[A-Za-z0-9])|\))*/g;
// Sentence punctuation after a Latin run stays outside the LTR isolate so it lands at the RTL line end.
function isolateRun(run: string) {
  const trailing = run.match(/[.,:]+$/)?.[0] ?? '';
  const core = run.slice(0, run.length - trailing.length);
  return core ? `<bdi dir="ltr">${core}</bdi>${trailing}` : run;
}
function isolateRtlText(source: string) {
  return source.split(/(<[^>]+>|&(?:#\d+|#x[\da-f]+|[A-Za-z]+);)/gi).map(part => part.startsWith('<') || part.startsWith('&') ? part : part.replace(latinRun, isolateRun)).join('');
}

// Country pages fold their research sections (website assessment, 27 Oct 2026, fix 8): the first sections after the key
// facts, which cite universities and IELTS statistics, sit in a <details> whose summary is the first section's own
// heading (already in the page language). Three sections where the requirements section has a table (they end with the
// Speaking statistics), otherwise two. The prerendered HTML keeps every word.
export function foldResearch(html: string) {
  const factsEnd = html.indexOf('</aside>');
  const starts = [...html.matchAll(/<h2\b/g)].map((match) => match.index!).filter((index) => index > factsEnd);
  if (starts.length < 4) return html;
  const count = html.slice(starts[1], starts[2]).includes('<table') ? 3 : 2;
  const firstHeadingEnd = html.indexOf('</h2>', starts[0]) + '</h2>'.length;
  return `${html.slice(0, starts[0])}<details class="insights-fold"><summary>${html.slice(starts[0], firstHeadingEnd)}</summary>${html.slice(firstHeadingEnd, starts[count])}</details>${html.slice(starts[count])}`;
}

// The source HTML remains authoritative: move its existing heading and first
// paragraph into the hero, and preserve all following copy in the article.
export function prepareSeoContent(page: SeoPage) {
  let html = page.html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '');
  let intro = '';
  html = html.replace(/^<p>([\s\S]*?)<\/p>\s*/i, (_match, body: string) => {
    intro = body;
    return '';
  });
  html = html.replace(/(<aside\b[^>]*?) class="[^"]*"/g, '$1');
  const hint = (chrome[page.locale] ?? chrome.en).scroll;
  html = html.replace(/(<table\b[\s\S]*?<\/table>)/g, `<div class="insights-table-wrap"><p class="insights-table-hint">${hint}</p><div class="insights-table-scroll" tabindex="0" role="region" aria-label="${hint}">$1</div></div>`);
  if (isInternationalMarketPath(page.path) && marketFromPath(page.path)) html = foldResearch(html);
  if (page.locale === 'ar' || page.locale === 'ur') {
    html = isolateRtlText(html);
    intro = isolateRtlText(intro);
  }
  return { html, intro };
}

function CtaNote({ locale, paypal, hub }: { locale: string; paypal?: boolean; hub?: boolean }) {
  if (paypal) {
    // The buttons are the checkout itself, so the note says how it works (the PayPal panel's own note).
    const copy = payCopy[locale];
    const rtl = locale === 'ar' || locale === 'ur';
    return <p className="insights-cta-note">{rtl ? <span dangerouslySetInnerHTML={{ __html: rtlSafe(copy.note) }} /> : copy.note}</p>;
  }
  // Hubs list every market, and most of them take PayPal, so they don't say USD payment is unavailable.
  const c = chrome[locale] ?? chrome.en;
  const note = hub && c.hubNote ? c.hubNote : c.note;
  // In RTL text the address is isolated whole; the Latin-run rule would split it at the @.
  const email = 'info@jurassicenglish.com';
  const rtlNote = note.split(email).map(isolateRtlText).join(`<bdi dir="ltr">${email}</bdi>`);
  return <p className="insights-cta-note">{locale === 'ar' || locale === 'ur' ? <span dangerouslySetInnerHTML={{ __html: rtlNote }} /> : note}</p>;
}

// PayPal (the Jurassic English business account, shown on PayPal as WorldWiseLearning) takes USD from
// the market countries. PayPal is not available to residents of Pakistan or Bangladesh, so those pages
// keep the email request only.
const noPaypalMarkets = new Set(['pakistan', 'bangladesh']);
const payCopy: Record<string, { title: string; baseline: string; lesson: string; pack: string; note: string; hero: string; link: string }> = {
  en: { title: 'Pay in US dollars with PayPal', baseline: 'Live Speaking Baseline', lesson: 'One-to-one lesson, 60 min', pack: 'Pack of 8 lessons', note: 'Choose an option to open our checkout, then pay on paypal.com: you pay the US$ price shown here, to Jurassic English (WorldWiseLearning). Payment is confirmed automatically.', hero: 'Requests go to info@jurassicenglish.com.', link: 'Or pay in USD with PayPal' },
  es: { title: 'Paga en dólares estadounidenses con PayPal', baseline: 'Evaluación inicial de Speaking', lesson: 'Clase individual, 60 min', pack: 'Paquete de 8 clases', note: 'Elige una opción para abrir nuestra página de pago y paga en paypal.com: pagas el precio en US$ que ves aquí, a Jurassic English (WorldWiseLearning). El pago se confirma automáticamente.', hero: 'Las solicitudes llegan a info@jurassicenglish.com.', link: 'O paga en USD con PayPal' },
  'pt-BR': { title: 'Pague em dólares americanos com PayPal', baseline: 'Avaliação inicial de Speaking', lesson: 'Aula individual, 60 min', pack: 'Pacote de 8 aulas', note: 'Escolha uma opção para abrir nosso checkout e pague em paypal.com: você paga o preço em US$ mostrado aqui, para a Jurassic English (WorldWiseLearning). O pagamento é confirmado automaticamente.', hero: 'As solicitações vão para info@jurassicenglish.com.', link: 'Ou pague em USD com PayPal' },
  id: { title: 'Bayar dalam dolar AS dengan PayPal', baseline: 'Asesmen awal Speaking', lesson: 'Les privat, 60 menit', pack: 'Paket 8 les', note: 'Pilih salah satu opsi untuk membuka halaman pembayaran kami, lalu bayar di paypal.com: Anda membayar harga US$ yang tertera di sini kepada Jurassic English (WorldWiseLearning). Pembayaran dikonfirmasi secara otomatis.', hero: 'Permintaan dikirim ke info@jurassicenglish.com.', link: 'Atau bayar dalam USD dengan PayPal' },
  ms: { title: 'Bayar dalam dolar AS dengan PayPal', baseline: 'Penilaian awal Speaking', lesson: 'Kelas individu, 60 minit', pack: 'Pakej 8 kelas', note: 'Pilih satu pilihan untuk membuka halaman pembayaran kami, kemudian bayar di paypal.com: anda membayar harga US$ yang dipaparkan di sini kepada Jurassic English (WorldWiseLearning). Bayaran disahkan secara automatik.', hero: 'Permohonan dihantar ke info@jurassicenglish.com.', link: 'Atau bayar dalam USD dengan PayPal' },
  th: { title: 'ชำระเป็นดอลลาร์สหรัฐผ่าน PayPal', baseline: 'การประเมิน Speaking เบื้องต้น', lesson: 'เรียนตัวต่อตัว 60 นาที', pack: 'แพ็กเกจเรียน 8 ครั้ง', note: 'เลือกตัวเลือกเพื่อเปิดหน้าชำระเงินของเรา แล้วชำระที่ paypal.com ตามราคา US$ ที่แสดงไว้ที่นี่ ให้กับ Jurassic English (WorldWiseLearning) การชำระเงินจะได้รับการยืนยันโดยอัตโนมัติ', hero: 'คำขอจะส่งไปที่ info@jurassicenglish.com', link: 'หรือชำระเป็น USD ผ่าน PayPal' },
  ar: { title: 'ادفع بالدولار الأمريكي عبر PayPal', baseline: 'التقييم الأولي للمحادثة', lesson: 'درس فردي، 60 دقيقة', pack: 'باقة من 8 دروس', note: 'اختر خيارًا لفتح صفحة الدفع لدينا، ثم ادفع على paypal.com: تدفع السعر بالدولار الأمريكي (US$) المعروض هنا إلى Jurassic English (WorldWiseLearning). يتم تأكيد الدفع تلقائيًا.', hero: 'تصل الطلبات إلى info@jurassicenglish.com.', link: 'أو ادفع بالدولار الأمريكي عبر PayPal' },
};

// S2 + S3 (master, 27 Oct 2026): every country page links the Baseline sample report on /products, tagged
// utm_source=market-<country> before the #anchor so orders from market pages show in the weekly measure. /products
// is in English, so other languages say so, like the page's other English-only links.
export const marketSampleHref = (market: string) => `/products?utm_source=market-${market}#baseline-sample`;
const sampleCopy: Record<string, string> = {
  en: 'See a sample report first',
  es: 'Mira primero un informe de muestra (en inglés)',
  'pt-BR': 'Veja primeiro um relatório de exemplo (em inglês)',
  id: 'Lihat contoh laporan dulu (bahasa Inggris)',
  ms: 'Lihat contoh laporan dahulu (bahasa Inggeris)',
  th: 'ดูตัวอย่างรายงานก่อน (ภาษาอังกฤษ)',
  ar: 'اطّلع أولًا على نموذج تقرير (بالإنجليزية)',
  ur: 'پہلے نمونہ رپورٹ دیکھیں (انگریزی میں)',
  bn: 'আগে একটি নমুনা রিপোর্ট দেখুন (ইংরেজিতে)',
};

function SampleLink({ market, locale }: { market: string; locale: string }) {
  const text = sampleCopy[locale] ?? sampleCopy.en;
  const rtl = locale === 'ar' || locale === 'ur';
  return <p className="insights-sample-link"><a href={marketSampleHref(market)} data-link="market-sample">{rtl ? <span dangerouslySetInnerHTML={{ __html: isolateRtlText(text) }} /> : text} {rtl ? '←' : '→'}</a></p>;
}

function paypalMarket(path: string, locale: string) {
  const market = marketFromPath(path);
  return market && !noPaypalMarkets.has(market) && payCopy[locale] ? market : undefined;
}

// The options open the order-first checkout in the AI Speaking app (automated PayPal, 21 Oct 2026). ?market= makes the
// checkout show and charge this country's listed US$ price (jurassic-ai-speaking lib/market-pricing.ts, a checked copy of
// src/content/marketPricing.json; terms LT-2026-10-24). The server prices from its table, never from this link.
function checkoutHref(item: 'baseline' | 'lesson' | 'pack', market: string) {
  const m = encodeURIComponent(market);
  return item === 'baseline' ? `/ai-speaking/baseline?market=${m}` : `/ai-speaking/lessons?pack=${item === 'lesson' ? 'lesson_single' : 'lesson_month'}&market=${m}`;
}

// Isolates Latin runs for RTL, keeping the contact email (the Latin-run rule splits it at the @) and the
// PayPal payee name whole.
function rtlSafe(text: string) {
  const keep = (part: string, token: string, next: (p: string) => string) => part.split(token).map(next).join(`<bdi dir="ltr">${token}</bdi>`);
  return keep(text, 'info@jurassicenglish.com', part => keep(part, PAYPAL_PAYEE_NAME, isolateRtlText));
}

function PayPalPanel({ market, locale }: { market: string; locale: string }) {
  const copy = payCopy[locale];
  const prices = marketPricing.tiers[String(marketPricing.markets[market as keyof typeof marketPricing.markets]) as keyof typeof marketPricing.tiers];
  const rtl = locale === 'ar' || locale === 'ur';
  const items = [
    { label: copy.baseline, item: 'baseline' as const, amount: prices.baseline_usd },
    { label: copy.lesson, item: 'lesson' as const, amount: prices.lesson_usd },
    { label: copy.pack, item: 'pack' as const, amount: prices.pack8_usd },
  ];
  const text = (value: string) => rtl ? <span dangerouslySetInnerHTML={{ __html: rtlSafe(value) }} /> : value;
  return <section id="pay" className="insights-paypal" aria-labelledby="pay-title">
    <div className="insights-paypal-head"><h2 id="pay-title">{text(copy.title)}</h2><img src={PAYPAL_LOGO} width="101" height="32" alt="PayPal" loading="lazy" /></div>
    <div className="insights-paypal-options">{items.map(entry => <a key={entry.item} className="insights-paypal-option" href={checkoutHref(entry.item, market)}>
      <span>{text(entry.label)}</span><strong><bdi dir="ltr">US${entry.amount}</bdi></strong>
    </a>)}</div>
    <SampleLink market={market} locale={locale} />
    <p className="insights-paypal-note">{text(copy.note)}</p>
  </section>;
}

// Closing band: the booking request again for readers who reach the end, plus the two
// routes that need no payment today (the AI Speaking explainer and a free tool).
function ClosingBand({ locale, ctas, paypal, hub }: { locale: string; ctas: Array<{ href: string; label: string }>; paypal?: boolean; hub?: boolean }) {
  const copy = chrome[locale] ?? chrome.en;
  const rtl = locale === 'ar' || locale === 'ur';
  const links = [
    { ...ctas[0], className: 'insights-button-primary' },
    { href: '/ai-speaking', label: copy.ai, className: 'insights-button-secondary' },
    { href: locale === 'vi' ? '/vi/cong-cu/tinh-diem-ielts' : '/tools/ielts-band-score-calculator', label: copy.tools, className: 'insights-button-secondary' },
  ];
  return <div className="insights-closing" dir={rtl ? 'rtl' : 'ltr'}><div>
    <p>{copy.closing}</p>
    <div className="insights-closing-actions">{links.map(link => <a key={link.href} className={link.className} href={link.href}>{rtl ? <span dangerouslySetInnerHTML={{ __html: isolateRtlText(link.label) }} /> : link.label}</a>)}</div>
    <CtaNote locale={locale} paypal={paypal} hub={hub} />
  </div></div>;
}

function HeroBand({ eyebrow, title, intro, locale, alternate, market, ctas, paypal, hub, sampleMarket }: {
  eyebrow: string; title: string; intro: string; locale: string;
  alternate?: { path: string; locale: string }; market?: boolean;
  ctas?: Array<{ href: string; label: string }>; paypal?: boolean; hub?: boolean; sampleMarket?: string;
}) {
  const rtl = locale === 'ar' || locale === 'ur';
  return <header className="insights-hero" dir={rtl ? 'rtl' : 'ltr'}>
    <picture className="insights-compass" aria-hidden="true"><source media="(max-width: 640px)" srcSet="/images/hero-compass-bg-640.webp" /><img src="/images/hero-compass-bg-960.webp" width="960" height="960" alt="" fetchPriority="high" /></picture>
    <div className="insights-hero-inner">
      <div className="min-w-0">
        <p className="insights-eyebrow">{eyebrow}</p>
        <h1 className={`insights-title ${['ar', 'ur', 'bn', 'th', 'vi'].includes(locale) ? 'insights-title-native' : 'font-display'}`}>{rtl ? <span dangerouslySetInnerHTML={{ __html: isolateRtlText(title) }} /> : title}</h1>
        {intro && <div className="insights-lead" dangerouslySetInnerHTML={{ __html: intro }} />}
        {alternate && <div className="insights-language" role="group" aria-label={(chrome[locale] ?? chrome.en).language}>
          {[{ path: '', locale }, alternate].map((option, index) => <a key={option.locale} href={index === 0 ? undefined : option.path} aria-current={index === 0 ? 'true' : undefined} lang={option.locale} className={index === 0 ? 'current' : ''}>{languageLabels[option.locale] ?? option.locale}</a>)}
        </div>}
      </div>
      {market && <div className="insights-teacher">
        <div className="insights-teacher-row"><img src="/images/mr-jay-portrait.webp" width="76" height="76" alt="Mr. Jay Adams" /><div><span className="insights-badge">CELTA</span><strong>Mr. Jay Adams</strong></div></div>
        {ctas?.map((cta, index) => <a key={cta.href} className={index === 0 ? 'insights-button-primary' : 'insights-button-secondary'} href={cta.href}>{rtl ? <span dangerouslySetInnerHTML={{ __html: isolateRtlText(cta.label) }} /> : cta.label}</a>)}
        {ctas?.length ? <CtaNote locale={locale} paypal={paypal} hub={hub} /> : null}
        {sampleMarket ? <SampleLink market={sampleMarket} locale={locale} /> : null}
      </div>}
    </div>
  </header>;
}

export function SearchInsightsPage({ pathname, onNavigate }: { pathname: string; onNavigate: (path: string) => void }) {
  const seoPage = getSeoPage(pathname);
  useEffect(() => {
    if (seoPage?.locale === 'ar') void import('../fonts/ar');
    if (seoPage?.locale === 'ur') void import('../fonts/ur');
    if (seoPage?.locale === 'th') void import('../fonts/th');
    if (seoPage?.locale === 'bn') void import('../fonts/bn');
  }, [seoPage?.locale]);
  if (seoPage) {
    const { html, intro } = prepareSeoContent(seoPage);
    const market = isInternationalMarketPath(seoPage.path);
    const counterpart = seoPage.alternatePath !== seoPage.path && getSeoPage(seoPage.alternatePath);
    const alternate = counterpart ? { path: counterpart.path, locale: counterpart.locale } : undefined;
    const ctas = market ? marketCtas(seoPage.path, seoPage.locale) : [];
    const payMarket = market ? paypalMarket(seoPage.path, seoPage.locale) : undefined;
    // The PayPal panel sits right after the key-facts box, where the payment line is.
    const factsEnd = payMarket ? html.indexOf('</aside>') + '</aside>'.length : -1;
    const founderFactsEnd = FOUNDER_PAGES.has(seoPage.path) ? html.indexOf('</blockquote>') + '</blockquote>'.length : -1;
    const marketKey = marketFromPath(seoPage.path);
    const eyebrow = market ? (marketKey ? (countryNames[seoPage.locale] ?? countryNames.en)[marketKey] ?? countryNames.en[marketKey] : (chrome[seoPage.locale] ?? chrome.en).resources) : (seoPage.path.includes('/insights/') ? (chrome[seoPage.locale] ?? chrome.en).resources : 'Jurassic English · People');
    return <main id="main-content" className="insights-page" lang={seoPage.locale} dir={['ar', 'ur'].includes(seoPage.locale) ? 'rtl' : 'ltr'}>
      <HeroBand eyebrow={eyebrow} title={seoPage.h1} intro={intro} locale={seoPage.locale} alternate={alternate} market={market} ctas={ctas} paypal={!!payMarket} hub={market && !marketKey} sampleMarket={market && marketKey && !payMarket ? marketKey : undefined} />
      <div className="insights-content"><nav aria-label="Breadcrumb"><a href={seoPage.locale === 'vi' ? '/vi/insights' : '/insights'}>{(chrome[seoPage.locale] ?? chrome.en).resources}</a></nav>{founderFactsEnd > 0 ? <article><div dangerouslySetInnerHTML={{ __html: html.slice(0, founderFactsEnd) }} /><FounderFilmLink locale={seoPage.locale === 'vi' ? 'vi' : 'en'} variant="card" /><div dangerouslySetInnerHTML={{ __html: html.slice(founderFactsEnd) }} /></article> : payMarket && factsEnd > 0 ? <article><div dangerouslySetInnerHTML={{ __html: html.slice(0, factsEnd) }} /><PayPalPanel market={payMarket} locale={seoPage.locale} /><div dangerouslySetInnerHTML={{ __html: html.slice(factsEnd) }} /></article> : <article dangerouslySetInnerHTML={{ __html: html }} />}</div>
      {market && <ClosingBand locale={seoPage.locale} ctas={ctas} paypal={!!payMarket} hub={!marketKey} />}
    </main>;
  }
  if (pathname === '/vi/insights') return <div className="insights-page"><HeroBand eyebrow="Tài liệu học tập" title="Tài liệu luyện IELTS Speaking" intro="Các bài hướng dẫn này giúp bạn xem lại câu trả lời Speaking của chính mình, hiểu một nhận xét dựa trên bằng chứng nào và chọn một việc để luyện tiếp. Bạn có thể đọc theo mục tiêu hiện tại: tìm điểm nghẽn giữa band 6 và band 7, luyện với các nhóm chủ đề forecast, tự kiểm tra tại nhà, hoặc hiểu giới hạn của phản hồi từ AI." locale="vi" /><main id="main-content" lang="vi" className="insights-content"><p className="mt-4">Mỗi bài phân biệt giữa việc luyện tập và kết quả thi IELTS. Các ví dụ dùng để minh họa cách suy nghĩ, không phải kết quả của học viên hay lời hứa tăng band. Nếu bạn muốn đánh giá cách mình thực sự nói, hãy ghi âm một câu trả lời, nghe lại theo bốn tiêu chí công khai và tìm phản hồi từ một người có thể nghe bạn trực tiếp.</p><div className="mt-8 space-y-6">{seoPages.filter(page => page.locale === 'vi' && page.path.startsWith('/vi/insights/')).map(page => <article key={page.path} className="rounded-lg border p-5"><h2 className="text-xl font-semibold"><a className="text-emerald-800 underline" href={page.path}>{page.h1}</a></h2><p className="mt-2">{page.description}</p></article>)}</div><p className="mt-8">Jurassic English™ là đơn vị độc lập, không liên kết với British Council, IDP hay Cambridge University Press &amp; Assessment. Điểm ước tính khi luyện tập không phải điểm IELTS chính thức. Hãy dùng những bài viết này để chọn câu hỏi mới, thử cách trả lời của riêng bạn và so sánh hai lần luyện trước khi quyết định bước tiếp theo.</p></main></div>;
  if (pathname === '/about/nathaniel-jay-adams') return <main id="main-content" className="mx-auto max-w-3xl px-6 py-16"><p className="text-sm font-bold uppercase tracking-widest text-orange-700">Jurassic English · People</p><h1 className="mt-3 text-4xl font-bold">Nathaniel Jay Adams</h1><p className="mt-2 text-xl text-slate-700">Publicly known to learners as Mr. Jay Adams.</p><p className="mt-8">The public pages of Jurassic English and WorldWise Learning describe two distinct areas of work. Jurassic English identifies Nathaniel Jay Adams as its Founder and Lead Coach. WorldWise Learning identifies him as Founder and AI Systems Architect. These descriptions are attributed to each organization’s own public site.</p><h2 className="mt-8 text-2xl font-semibold">Jurassic English</h2><p>Jurassic English supports learners with academic English, critical thinking and IELTS-style Speaking practice. Its practice guidance connects evidence from a learner’s response with one focused next step. Typed feedback does not assess pronunciation, and practice estimates are not official IELTS scores.</p><p><a href="/ai-speaking">Explore Jurassic AI Speaking</a> · <a href="/insights">Read IELTS Speaking learning resources</a> · <a href="https://jurassicenglish.com/">Visit Jurassic English</a></p><h2 className="mt-8 text-2xl font-semibold">WorldWise Learning</h2><p>WorldWise Learning is the institutional practice. It describes consulting, faculty development and education technology work, including bounded AI learning pilots that are scoped with each institution. Its public site describes proposed work and a demonstration; it does not claim a deployment at a named university.</p><p><a href="https://www.worldwiselearning.app/">Visit WorldWise Learning</a></p><h2 className="mt-8 text-2xl font-semibold">Working approach and availability</h2><p>The learner-facing work emphasizes response evidence, guided practice, an independent attempt and a practical follow-up. University projects begin with requirements, governance and security review; scope and deliverables are agreed individually. Current online lesson options and availability appear in the booking flow.</p><p className="mt-8"><a href="/get-started">Contact Jurassic English</a> · <a href="https://www.worldwiselearning.app/#contact">Contact WorldWise Learning</a></p></main>;
  const slug = pathname.replace(/^\/insights\/?/, '');
  const article = slug ? getInsightArticleBySlug(slug) : undefined;
  const articles = getPublishedInsightArticles();
  const link = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => { e.preventDefault(); onNavigate(path); };
  if (!article) return <div className="insights-page"><HeroBand eyebrow="Jurassic English · Learning resources" title="Practical answers for better English learning" intro="Evidence-led guidance on IELTS Speaking practice, useful feedback and one-to-one learning. Examples are illustrative and are not learner results." locale="en" /><main id="main-content" className="insights-content"><p className="mt-4 max-w-3xl">Use these short guides to distinguish what a practice response actually shows from what still needs spoken or teacher review. Each article links observations to a clear next step and identifies the limits of the evidence.</p><p className="mt-4"><a className="text-emerald-800 underline" href="/ielts-speaking-online">IELTS Speaking online (outside Vietnam)</a></p><div className="mt-10 grid gap-5 md:grid-cols-2">{articles.map((item) => <article key={item.slug} className="min-w-0 rounded-lg border p-5 sm:p-6"><p className="text-sm font-semibold text-orange-700">{item.section}</p><h2 className="mt-2 text-xl font-semibold leading-snug"><a className="break-words text-emerald-800 underline underline-offset-4 hover:text-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" href={`${INSIGHTS_BASE_PATH}/${item.slug}`} onClick={(e) => link(e, `${INSIGHTS_BASE_PATH}/${item.slug}`)}>{item.title}</a></h2><p className="mt-3">{item.deck}</p></article>)}</div><p className="mt-8 text-sm">The guidance refers to the public IELTS Speaking format and assessment criteria. It is independent preparation material and does not represent IELTS endorsement.</p></main></div>;
  const related = articles.filter((item) => item.slug !== article.slug);
  return <div className="insights-page"><HeroBand eyebrow={article.section} title={article.title} intro={article.deck} locale="en" /><main id="main-content" className="insights-content"><nav aria-label="Breadcrumb" className="text-sm"><a href="/insights" onClick={(e) => link(e, '/insights')}>Learning resources</a> / {article.section}</nav><article className="mt-8"><p className="mt-4 text-sm text-slate-600">Published {article.datePublished} · Jurassic English™ editorial team</p>
    <div className="mt-8 max-w-none text-base leading-7 sm:mt-10 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-snug sm:[&_h2]:text-2xl [&_p]:my-4 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-2 [&_a]:text-emerald-800 [&_a]:underline [&_a]:underline-offset-4 [&_a]:break-words [&_a:hover]:text-emerald-950 [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4">
      {Object.hasOwn(articleBodies, article.slug) ? articleBodies[article.slug] : <p>This article body is not available.</p>}
    </div>
    {article.slug !== 'online-ielts-speaking-coaching' && <OneChangeInvitation placement="insights" />}
    <aside className="mt-10 border-t pt-6"><h2 className="text-xl font-semibold">Related guidance</h2><ul className="mt-3 list-disc space-y-3 pl-6">{related.map((item) => <li key={item.slug}><a className="break-words text-emerald-800 hover:text-emerald-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4" href={`/insights/${item.slug}`} onClick={(e) => link(e, `/insights/${item.slug}`)}>{item.title}</a></li>)}</ul></aside>
  </article></main></div>;
}

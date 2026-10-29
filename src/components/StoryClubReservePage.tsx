import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Locale } from '../i18n/locales';
import { normalizeVietnamesePhone } from '../i18n/content/samplePack';
import { recordClientEvent } from '../lib/tracker';
import { validateStoryClubReserve } from '../lib/storyClubReserve';
import { STORY_CLUB_GROUPS, STORY_CLUB_NEXT_GROUP, STORY_CLUB_PRICE_VND, STORY_CLUB_QR_PATH, STORY_CLUB_SAMPLE_URL } from '../config/storyClubReserve';
import { ToolHero } from './IeltsToolsPage';

const copy = {
  en: {
    title: 'Reserve a Story Club seat', intro: 'A small, friendly English story group with Mr. Jay.', sample: 'Read a free Story 1 first', sampleTitle: 'Mina and the Midnight Drum · Level 1', price: 'Story Club with Mr. Jay', amount: '590,000₫ · 4 weeks', details: 'Online on Google Meet · Ages 5–8 · Up to 6 children', groupDetails: 'The group meets weekly for four weeks. Mr. Jay reads an original Jurassic English story, leads a short discussion, and gives children one small follow-up task.', next: 'Next group:', form: 'Ask for a place', formDetails: 'This form does not charge a card. After sending your request, you will see the bank-transfer instructions and a short payment memo.', name: 'Parent name', phone: 'Zalo number', age: "Child's age", group: 'Preferred group', consent: 'I agree that Jurassic English may use my details to reply to this Story Club request. See the privacy notice.', submit: 'Reserve a seat', invalid: 'Please check your name, Vietnamese Zalo number, child age (5–8), and preferred group.', failed: 'We could not send your request. Please try again or message Mr. Jay on Zalo.', thanks: 'Thank you. Your request has been received.', pay: 'Payment instructions', transfer: 'Transfer memo', qrFallback: 'Mr. Jay will send the payment QR on Zalo within the day', zalo: 'Ask Mr. Jay on Zalo', privacy: 'Privacy notice', required: 'Please agree before sending your request.',
  },
  vi: {
    title: 'Đặt chỗ Câu lạc bộ Truyện', intro: 'Nhóm tiếng Anh qua truyện nhỏ, thân thiện cùng thầy Jay.', sample: 'Đọc thử Truyện 1 miễn phí trước', sampleTitle: 'Mina và chiếc trống lúc nửa đêm · Cấp độ 1', price: 'Câu lạc bộ Truyện cùng thầy Jay', amount: '590.000₫ · 4 tuần', details: 'Học trực tuyến qua Google Meet · Bé 5–8 tuổi · Tối đa 6 bé', groupDetails: 'Nhóm gặp nhau mỗi tuần trong bốn tuần. Thầy Jay đọc truyện gốc của Jurassic English, cùng các bé trò chuyện và giao một hoạt động nhỏ sau buổi học.', next: 'Nhóm tiếp theo:', form: 'Đăng ký chỗ', formDetails: 'Biểu mẫu này không thu tiền qua thẻ. Sau khi gửi yêu cầu, bạn sẽ thấy hướng dẫn chuyển khoản và mã nội dung thanh toán.', name: 'Tên phụ huynh', phone: 'Số Zalo', age: 'Tuổi của bé', group: 'Nhóm mong muốn', consent: 'Tôi đồng ý để Jurassic English sử dụng thông tin của mình để phản hồi yêu cầu về Câu lạc bộ Truyện. Xem thông báo quyền riêng tư.', submit: 'Đặt chỗ', invalid: 'Vui lòng kiểm tra họ tên, số Zalo Việt Nam, tuổi của bé (5–8) và nhóm mong muốn.', failed: 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc nhắn thầy Jay qua Zalo.', thanks: 'Cảm ơn bạn. Chúng tôi đã nhận được yêu cầu.', pay: 'Hướng dẫn thanh toán', transfer: 'Nội dung chuyển khoản', qrFallback: 'Thầy Jay sẽ gửi mã QR thanh toán qua Zalo trong ngày hôm nay', zalo: 'Hỏi thầy Jay qua Zalo', privacy: 'Thông báo quyền riêng tư', required: 'Vui lòng đồng ý trước khi gửi yêu cầu.',
  },
} as const;

type Confirmation = { memo: string };
const FIELD = 'mt-1 block min-h-11 w-full rounded-xl border border-sb-border bg-white px-3 py-2 text-base text-sb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber';

export function StoryClubReservePage({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());
  const submissionKey = useRef<string | null>(null);
  const submitting = useRef(false);
  const trackedView = useRef(false);
  const trackedPay = useRef(false);

  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;
    recordClientEvent({ event: 'reserve_view', product_id: 'story-club', locale });
  }, [locale]);

  useEffect(() => {
    if (!confirmation || trackedPay.current) return;
    trackedPay.current = true;
    recordClientEvent({ event: 'pay_instructions_shown', product_id: 'story-club', locale });
  }, [confirmation, locale]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = new FormData(event.currentTarget);
    const values = {
      name: String(form.get('name') ?? ''), phone: String(form.get('phone') ?? ''),
      childAge: String(form.get('childAge') ?? ''), group: String(form.get('group') ?? ''),
    };
    const invalid = validateStoryClubReserve(values);
    if (invalid) { setError(t.invalid); return; }
    if (form.get('consent') !== 'on') { setError(t.required); return; }
    setError('');
    submitting.current = true;
    setSending(true);
    const params = new URLSearchParams(window.location.search);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch('/api/sample-pack', {
        method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(), phone: normalizeVietnamesePhone(values.phone), email: '', childAge: values.childAge,
          teacher: false, consent: true, locale, placement: 'home', source: params.get('utm_source') || 'reserve',
          submissionKey: submissionKey.current ??= window.crypto.randomUUID(),
          utm_source: params.get('utm_source') || 'reserve', utm_content: params.get('utm_content') || 'story-club-reserve',
          utm_medium: params.get('utm_medium') || '', utm_campaign: params.get('utm_campaign') || '', utm_term: params.get('utm_term') || '',
          product: 'story-club', group: values.group, website: String(form.get('website') ?? ''), startedAt,
        }),
      });
      if (!response.ok) throw new Error('Request failed');
      const result = await response.json() as { memo?: unknown; submissionId?: string };
      if (typeof result.memo !== 'string' || !/^SC-[A-Z0-9]{6}$/.test(result.memo)) throw new Error('Missing canonical reserve memo');
      setConfirmation({ memo: result.memo });
      recordClientEvent({ event: 'reserve_submit', product_id: 'story-club', locale });
    } catch {
      setError(t.failed);
    } finally {
      clearTimeout(timer);
      submitting.current = false;
      setSending(false);
    }
  };

  return (
    <main id="main-content" tabIndex={-1} lang={locale} className="insights-page ielts-tools-page story-club-page min-h-screen" data-story-club-reserve>
      <ToolHero locale={locale} title={t.title} lead={t.intro} eyebrow="Jurassic English · Story Club" counterpart={locale === 'vi' ? '/en/story-club/reserve' : '/story-club/reserve'} />
      <div className="ielts-tool-content mx-auto max-w-3xl space-y-8 px-5 py-10">
        <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="reserve-sample">
          <h2 id="reserve-sample" className="text-2xl font-bold">{t.sample}</h2>
          <p className="mt-2">{t.sampleTitle}</p>
          <a className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-sb-border px-4 py-2 font-semibold underline underline-offset-4" href={STORY_CLUB_SAMPLE_URL} target="_blank" rel="noopener noreferrer" data-reserve-sample>{t.sample}</a>
        </section>

        <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="reserve-offer">
          <h2 id="reserve-offer" className="text-2xl font-bold">{t.price}</h2>
          <p className="mt-2 text-3xl font-extrabold" data-reserve-price>{t.amount}</p>
          <p className="mt-2">{t.details}</p>
          <p className="mt-3">{t.groupDetails}</p>
          <p className="mt-2 font-semibold">{t.next} {STORY_CLUB_NEXT_GROUP[locale]}</p>
        </section>

        {confirmation ? (
          <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="reserve-confirmation" data-payment-instructions role="status">
            <h2 id="reserve-confirmation" className="text-2xl font-bold">{t.thanks}</h2>
            <h3 className="mt-5 text-xl font-bold">{t.pay}</h3>
            <p className="mt-2">{t.amount}</p>
            <p className="mt-2">{t.transfer}: <strong data-transfer-memo>{confirmation.memo}</strong></p>
            <img src={STORY_CLUB_QR_PATH} alt="Story Club VietQR payment" className="mt-4 max-h-72 w-auto" onError={(event) => { event.currentTarget.hidden = true; const fallback = document.getElementById('reserve-qr-fallback'); if (fallback) fallback.hidden = false; }} />
            <p id="reserve-qr-fallback" className="mt-3" hidden>{t.qrFallback}</p>
            <a className="insights-button-primary mt-5" href="/go/zalo?utm_source=reserve&utm_content=after-submit" data-after-submit-zalo>{t.zalo}</a>
          </section>
        ) : (
          <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="reserve-form-heading">
            <h2 id="reserve-form-heading" className="text-2xl font-bold">{t.form}</h2>
            <p className="mt-2">{t.formDetails}</p>
            <form className="mt-4 space-y-4" method="post" onSubmit={onSubmit} noValidate data-reserve-form>
              <label className="block font-semibold">{t.name}<input className={FIELD} name="name" autoComplete="name" maxLength={120} required /></label>
              <label className="block font-semibold">{t.phone}<input className={FIELD} name="phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={32} required aria-describedby={error ? 'reserve-error' : undefined} /></label>
              <label className="block font-semibold">{t.age}<select className={FIELD} name="childAge" defaultValue="" required><option value="" disabled>—</option>{[5, 6, 7, 8].map(age => <option key={age} value={age}>{age}</option>)}</select></label>
              <label className="block font-semibold">{t.group}<select className={FIELD} name="group" defaultValue="sat-0900">{STORY_CLUB_GROUPS.map(group => <option key={group.id} value={group.id}>{group.label[locale]}</option>)}</select></label>
              <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="consent" className="mt-1 h-5 w-5" required /><span>{t.consent} <a className="underline" href={locale === 'vi' ? '/vi/legal/privacy' : '/legal/privacy'}>{t.privacy}</a></span></label>
              {error ? <p id="reserve-error" role="alert" className="font-semibold text-red-700">{error}</p> : null}
              <button className="insights-button-primary" type="submit" disabled={sending}>{sending ? '…' : t.submit}</button>
            </form>
          </section>
        )}
      </div>
    </main>
  );
}

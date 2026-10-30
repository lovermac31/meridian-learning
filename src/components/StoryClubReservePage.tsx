import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Locale } from '../i18n/locales';
import { normalizeVietnamesePhone } from '../i18n/content/samplePack';
import { recordClientEvent } from '../lib/tracker';
import { validateStoryClubReserve } from '../lib/storyClubReserve';
import { STORY_CLUB_GROUPS, STORY_CLUB_NEXT_GROUP, STORY_CLUB_SAMPLE_URL } from '../config/storyClubReserve';
import { PayStep } from './PayStep';
import { paidOffer, paymentAmount, paymentHref } from '../config/payment';
import { ToolHero } from './IeltsToolsPage';
import { PhoneNumberField } from './PhoneNumberField';
import { CountryLocationField } from './CountryLocationField';

const copy = {
  en: {
    title: 'Reserve a Story Club seat', intro: 'A small, friendly English story group with Mr. Jay.', sample: 'Read a free Story 1 first', sampleTitle: 'Mina and the Midnight Drum · Level 1', price: 'Story Club with Mr. Jay', amount: '590,000₫ · 4 weeks', details: 'Online on Google Meet · Ages 5–8 · Up to 6 children', groupDetails: 'The group meets weekly for four weeks. Mr. Jay reads an original Jurassic English story, leads a short discussion, and gives children one small follow-up task.', next: 'Next group:', form: 'Ask for a place', formDetails: 'Pay with the QR first. Then enter your contact details so we can confirm and deliver your order.', name: 'Parent name', email: 'Email address for your order', location: 'Country or location', phone: 'Phone / Zalo number', phoneHint: 'Choose your country, then enter your phone number.', age: "Child's age", group: 'Preferred group', consent: 'I agree Jurassic English may use these details to confirm and deliver this purchase. See the privacy notice.', submit: 'Send my details', invalid: 'Please check your name, email address, location and phone number. Age and group are optional.', failed: 'We could not send your request. Please try again or message Mr. Jay on Zalo.', thanks: 'Thank you. Your request has been received.', pay: 'Pay now', transfer: 'Transfer memo', qrFallback: 'Mr. Jay will send the payment QR on Zalo within the day', zalo: 'Ask Mr. Jay on Zalo', privacy: 'Privacy notice', required: 'Please agree before sending your request.', paymentPending: 'We’re checking your payment. This can take a moment.', paymentReceived: 'Payment received. Please send your contact details below to confirm your place.', ivePaid: 'I’ve paid — enter my details', question: 'Have a question before paying? Ask on Zalo',
  },
  vi: {
    title: 'Đặt chỗ Câu lạc bộ Truyện', intro: 'Nhóm tiếng Anh qua truyện nhỏ, thân thiện cùng thầy Jay.', sample: 'Đọc thử Truyện 1 miễn phí trước', sampleTitle: 'Mina và chiếc trống lúc nửa đêm · Cấp độ 1', price: 'Câu lạc bộ Truyện cùng thầy Jay', amount: '590.000₫ · 4 tuần', details: 'Học trực tuyến qua Google Meet · Bé 5–8 tuổi · Tối đa 6 bé', groupDetails: 'Nhóm gặp nhau mỗi tuần trong bốn tuần. Thầy Jay đọc truyện gốc của Jurassic English, cùng các bé trò chuyện và giao một hoạt động nhỏ sau buổi học.', next: 'Nhóm tiếp theo:', form: 'Đăng ký chỗ', formDetails: 'Quét mã QR để thanh toán trước. Sau đó nhập thông tin liên hệ để chúng tôi xác nhận và giao sản phẩm.', name: 'Tên phụ huynh', email: 'Địa chỉ email nhận đơn hàng', location: 'Quốc gia hoặc khu vực', phone: 'Số điện thoại / Zalo', phoneHint: 'Chọn quốc gia, sau đó nhập số điện thoại.', age: 'Tuổi của bé', group: 'Nhóm mong muốn', consent: 'Tôi đồng ý để Jurassic English sử dụng thông tin này để xác nhận và giao đơn hàng. Xem thông báo quyền riêng tư.', submit: 'Gửi thông tin của tôi', invalid: 'Vui lòng kiểm tra họ tên, email, khu vực và số điện thoại. Tuổi và nhóm không bắt buộc.', failed: 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc nhắn thầy Jay qua Zalo.', thanks: 'Cảm ơn bạn. Chúng tôi đã nhận được yêu cầu.', pay: 'Thanh toán ngay', transfer: 'Nội dung chuyển khoản', qrFallback: 'Thầy Jay sẽ gửi mã QR thanh toán qua Zalo trong ngày hôm nay', zalo: 'Hỏi thầy Jay qua Zalo', privacy: 'Thông báo quyền riêng tư', required: 'Vui lòng đồng ý trước khi gửi yêu cầu.', paymentPending: 'Đang kiểm tra thanh toán. Vui lòng chờ trong giây lát.', paymentReceived: 'Đã nhận thanh toán. Vui lòng gửi thông tin liên hệ bên dưới để xác nhận chỗ.', ivePaid: 'Tôi đã thanh toán — nhập thông tin', question: 'Có câu hỏi trước khi thanh toán? Hỏi qua Zalo',
  },
} as const;

type Confirmation = { memo: string };
const FIELD = 'mt-1 block min-h-11 w-full rounded-xl border border-sb-border bg-white px-3 py-2 text-base text-sb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber';

export function StoryClubReservePage({ locale, productId = 'story-club' }: { locale: Locale; productId?: string }) {
  const offer = paidOffer(productId);
  const isStory = productId === 'story-club';
  const t = copy[locale];
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState('');
  const [contactSent, setContactSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());
  const submissionKey = useRef<string | null>(null);
  const submitting = useRef(false);
  const trackedView = useRef(false);
  const trackedPay = useRef(false);
  const confirmationRef = useRef<HTMLElement | null>(null);

  const preparePayment = async () => {
    if (!offer || confirmation || preparing) return;
    setPreparing(true);
    setPrepareError('');
    const key = submissionKey.current ??= window.crypto.randomUUID();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch('/api/sample-pack', {
        method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'prepare_payment', product: productId, submissionKey: key, startedAt, website: '' }),
      });
      if (!response.ok) throw new Error('Could not prepare payment');
      const result = await response.json() as { memo?: unknown };
      if (typeof result.memo !== 'string' || !new RegExp(`^${offer.prefix}-[A-Z0-9]{6}$`).test(result.memo)) throw new Error('Invalid payment reference');
      setConfirmation({ memo: result.memo });
      setPaymentReceived(false);
    } catch {
      setPrepareError(locale === 'vi' ? 'Chưa tạo được mã thanh toán. Vui lòng thử lại.' : 'We could not prepare the payment code. Please try again.');
    } finally {
      clearTimeout(timer);
      setPreparing(false);
    }
  };

  useEffect(() => {
    if (!offer) return;
    const timer = window.setTimeout(() => { void preparePayment(); }, 2_000);
    return () => window.clearTimeout(timer);
  }, [productId]);

  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;
    recordClientEvent({ event: 'reserve_view', product_id: productId, locale });
  }, [locale, productId]);

  useEffect(() => {
    if (!confirmation || trackedPay.current) return;
    trackedPay.current = true;
    recordClientEvent({ event: 'pay_instructions_shown', product_id: productId, locale });
    confirmationRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [confirmation, locale, productId]);

  useEffect(() => {
    if (!confirmation || !isStory) return;
    let stopped = false;
    let inFlight = false;
    let interval = 0;
    const poll = async () => {
      if (stopped || inFlight) return;
      inFlight = true;
      try {
        const response = await fetch(`/api/story-club/status?memo=${encodeURIComponent(confirmation.memo)}`, {
          method: 'GET', cache: 'no-store', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(5_000),
        });
        if (!response.ok) return;
        const result = await response.json() as { paid?: unknown };
        if (result.paid === true && !stopped) {
          stopped = true;
          window.clearInterval(interval);
          setPaymentReceived(true);
          setContactFormOpen(true);
        }
      } catch {
        // Transient polling failures are quiet; the bounded interval keeps retrying.
      } finally {
        inFlight = false;
      }
    };
    interval = window.setInterval(() => { void poll(); }, 20_000);
    const expiry = window.setTimeout(() => { stopped = true; window.clearInterval(interval); }, 15 * 60_000);
    return () => { stopped = true; window.clearInterval(interval); window.clearTimeout(expiry); };
  }, [confirmation]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const form = new FormData(event.currentTarget);
    const values = {
      name: String(form.get('name') ?? ''), phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''), location: String(form.get('location') ?? ''),
      childAge: String(form.get('childAge') ?? ''), group: String(form.get('group') ?? ''),
    };
    const invalid = validateStoryClubReserve(values);
    if (invalid) { setError(t.invalid); return; }
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
          name: values.name.trim(), phone: normalizeVietnamesePhone(values.phone, { assumeVietnameseCountryCode: true }), email: values.email.trim(), location: values.location, childAge: values.childAge,
          teacher: false, consent: form.get('consent') === 'on', locale, placement: 'home', source: params.get('utm_source') || 'reserve',
          submissionKey: submissionKey.current ??= window.crypto.randomUUID(),
          utm_source: params.get('utm_source') || 'reserve', utm_content: params.get('utm_content') || 'story-club-reserve',
          utm_medium: params.get('utm_medium') || '', utm_campaign: params.get('utm_campaign') || '', utm_term: params.get('utm_term') || '',
          product: productId, group: values.group, website: String(form.get('website') ?? ''), startedAt,
        }),
      });
      if (!response.ok) throw new Error('Request failed');
      const result = await response.json() as { memo?: unknown; submissionId?: string };
      if (!offer || typeof result.memo !== 'string' || !new RegExp(`^${offer.prefix}-[A-Z0-9]{6}$`).test(result.memo)) throw new Error('Missing canonical reserve memo');
      if (typeof result.memo !== 'string' || result.memo !== confirmation?.memo) throw new Error('Order reference mismatch');
      setContactSent(true);
      recordClientEvent({ event: 'reserve_submit', product_id: productId, locale });
    } catch {
      setError(t.failed);
    } finally {
      clearTimeout(timer);
      submitting.current = false;
      setSending(false);
    }
  };

  if (!offer) return <main id="main-content"><h1>{locale === 'vi' ? 'Không tìm thấy sản phẩm' : 'Product not found'}</h1><a href="/products">Products</a></main>;
  return (
    <main id="main-content" tabIndex={-1} lang={locale} className="insights-page ielts-tools-page story-club-page min-h-screen" data-story-club-reserve>
      <ToolHero locale={locale} title={isStory ? t.title : `${locale === 'vi' ? 'Đặt ngay' : 'Buy now'} · ${offer!.title[locale].title}`} lead={isStory ? t.intro : ''} eyebrow="Jurassic English" counterpart={paymentHref(productId, locale === 'vi' ? 'en' : 'vi')} />
      <div className="ielts-tool-content mx-auto max-w-3xl space-y-8 px-5 py-10">
        <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="reserve-offer">
          <h2 id="reserve-offer" className="text-2xl font-bold">{offer?.title[locale].title}</h2>
          <p className="mt-2 text-3xl font-extrabold" data-reserve-price>{paymentAmount(offer!.amount, locale)}{productId === 'one-to-one' ? (locale === 'vi' ? ' · 8 buổi' : ' · 8 lessons') : ''}</p>
          {isStory && <><p className="mt-2">{t.details}</p><p className="mt-2 font-semibold">{t.next} {STORY_CLUB_NEXT_GROUP[locale]}</p></>}
        </section>

        {confirmation ? (
          <section ref={confirmationRef} className="ielts-tool-card scroll-mt-28 rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="reserve-confirmation" data-payment-instructions>
            <h2 id="reserve-confirmation" className="text-2xl font-bold">{t.pay}</h2>
            <PayStep key={confirmation.memo} locale={locale} amount={offer!.amount} memo={confirmation.memo} productId={productId} />
            {isStory && <p className="mt-3 font-semibold" data-payment-status>{paymentReceived ? t.paymentReceived : t.paymentPending}</p>}
            <p className="mt-4">{locale === 'vi' ? 'Quét mã bằng ứng dụng ngân hàng và kiểm tra đúng số tiền trước khi xác nhận. Thông tin cá nhân chỉ cần nhập sau khi thanh toán.' : 'Scan with your banking app and verify the exact amount before confirming. You only need to enter personal details after paying.'}</p>
            <a className="mt-3 inline-block underline" href={`/go/zalo?utm_source=checkout&utm_content=${encodeURIComponent(productId)}-prepayment-question`}>{t.question}</a>
            {!contactFormOpen && <button type="button" className="insights-button-primary mt-5 block" onClick={() => setContactFormOpen(true)} data-open-contact-form>{t.ivePaid}</button>}
          </section>
        ) : (
          <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-live="polite" data-payment-preparing>
            <h2 className="text-2xl font-bold">{locale === 'vi' ? 'Đang chuẩn bị mã thanh toán' : 'Preparing your payment QR'}</h2>
            {preparing ? <p className="mt-2">{locale === 'vi' ? 'Vui lòng chờ trong giây lát…' : 'Please wait a moment…'}</p> : null}
            <p className="mt-2">{locale === 'vi' ? 'Mã QR sẽ điền sẵn đúng số tiền và nội dung chuyển khoản riêng cho sản phẩm này. Hãy quét bằng ứng dụng ngân hàng, kiểm tra số tiền và thông tin tài khoản trước khi xác nhận. Sau khi thanh toán, gửi thông tin liên hệ bên dưới để chúng tôi xác nhận đơn hàng. Trang này không yêu cầu thông tin thẻ.' : 'The QR will contain the exact price and a unique transfer memo for this product. Scan it with your banking app and check the amount and account details before confirming. After paying, send your contact details below so we can identify and fulfil your order. This page never asks for card details.'}</p>
            {prepareError ? <><p role="alert" className="mt-2 text-red-700">{prepareError}</p><button className="insights-button-primary mt-4" type="button" onClick={() => void preparePayment()}>{locale === 'vi' ? 'Thử lại' : 'Try again'}</button></> : null}
          </section>
        )}

        {confirmation && contactFormOpen && !contactSent ? (
          <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="reserve-form-heading">
            <h2 id="reserve-form-heading" className="text-2xl font-bold">{locale === 'vi' ? 'Thông tin liên hệ của bạn' : 'Your contact details'}</h2>
            <p className="mt-2">{t.formDetails}</p>
            <form className="mt-4 space-y-4" aria-labelledby="reserve-form-heading" method="post" onSubmit={onSubmit} noValidate data-reserve-form>
              <label htmlFor="reserve-name" className="block font-semibold">{t.name}<input className={FIELD} id="reserve-name" name="name" autoComplete="name" maxLength={120} required /></label>
              <label htmlFor="reserve-email" className="block font-semibold">{t.email}<input className={FIELD} id="reserve-email" name="email" type="email" autoComplete="email" maxLength={254} required /></label>
              <CountryLocationField id="reserve-location" name="location" label={t.location} locale={locale} required />
              <div className="block font-semibold"><span>{t.phone}</span><PhoneNumberField id="reserve-phone" name="phone" label={t.phone} locale={locale} className="mt-1" placeholder={locale === 'vi' ? 'Nhập số điện thoại' : 'Enter phone number'} required describedBy={error ? 'reserve-phone-hint reserve-error' : 'reserve-phone-hint'} /></div>
              <p id="reserve-phone-hint" className="-mt-2 text-sm text-sb-muted">{t.phoneHint}</p>
              {isStory && <><label htmlFor="reserve-childAge" className="block font-semibold">{t.age} ({locale === 'vi' ? 'không bắt buộc' : 'optional'})<select className={FIELD} id="reserve-childAge" name="childAge" defaultValue=""><option value="">—</option>{[5, 6, 7, 8].map(age => <option key={age} value={age}>{age}</option>)}</select></label>
              <label htmlFor="reserve-group" className="block font-semibold">{t.group} ({locale === 'vi' ? 'không bắt buộc' : 'optional'})<select className={FIELD} id="reserve-group" name="group" defaultValue=""><option value="">—</option>{STORY_CLUB_GROUPS.map(group => <option key={group.id} value={group.id}>{group.label[locale]}</option>)}</select></label></>}
              <input name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" name="consent" required /><span>{t.consent} <a className="underline" href={locale === 'vi' ? '/vi/legal/privacy' : '/legal/privacy'}>{t.privacy}</a></span></label>
              {error ? <p id="reserve-error" role="alert" className="font-semibold text-red-700">{error}</p> : null}
              <button className="insights-button-primary" type="submit" disabled={sending} aria-busy={sending}>{t.submit}</button>
            </form>
          </section>
        ) : contactSent ? <p role="status" className="ielts-tool-card rounded-2xl bg-white p-6 font-semibold">{t.thanks}</p> : null}
        {isStory && <p className="text-sm">{t.groupDetails} {locale === 'vi' ? 'Sau khi gửi thông tin, hãy kiểm tra số tiền và mã chuyển khoản trước khi thanh toán. Thầy Jay sẽ liên hệ qua Zalo để xác nhận chỗ học của bé.' : 'After sending your details, check the amount and transfer memo before paying. Mr. Jay will contact you on Zalo to confirm your child’s place in the group.'}</p>}
        {isStory && <a className="block text-sm underline underline-offset-4" href={STORY_CLUB_SAMPLE_URL} data-reserve-sample>{t.sample}</a>}
      </div>
    </main>
  );
}

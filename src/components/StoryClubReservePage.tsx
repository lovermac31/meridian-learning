import { readFirstTouch, useFirstTouch, withFirstTouch } from '../lib/utmFirstTouch';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import type { Locale } from '../i18n/locales';
import { normalizeVietnamesePhone } from '../i18n/content/samplePack';
import { recordClientEvent } from '../lib/tracker';
import { validateStoryClubReserve } from '../lib/storyClubReserve';
import { STORY_CLUB_GROUPS, STORY_CLUB_SAMPLE_URL } from '../config/storyClubReserve';
import { storyClubTryItContent, STORY_CLUB_TRY_IT_ZALO_HREF_RESERVE } from '../i18n/content/storyClubTryIt';
import { StoryClubPaidRound, StoryClubRefund, StoryClubTryIt } from './StoryClubSummary';
import { PayStep } from './PayStep';
import { storyClubPriceAt, storyClubTierForAmount, STORY_CLUB_GRACE_MINUTES, STORY_CLUB_TIME_ZONE_LABEL } from '../config/storyClubOffer';
import { StoryClubLiveLine, useNow } from './StoryClubLiveLine';
import { paidOffer, paymentAmount, paymentHref } from '../config/payment';
import { ToolHero } from './IeltsToolsPage';
import { FIXED_ORDER_CODES, ORDER_CODE_COPY, checkoutZaloHref } from '../lib/productsSource';
import { PhoneNumberField } from './PhoneNumberField';
import { CountryLocationField } from './CountryLocationField';

const copy = {
  en: {
    title: 'Reserve a Story Club seat', intro: 'A small, friendly English story group with Mr. Jay. Paid sessions run on Saturdays at 13:00 Vietnam time. The free Story Time is postponed (new date coming soon); you can ask Mr. Jay on Zalo before paying.', sample: 'Read a free Story 1 first', sampleTitle: 'Mina and the Midnight Drum · Level 1', price: 'Story Club with Mr. Jay', amount: '590,000₫ · 4 weeks', details: 'Online on Google Meet · Ages 5–8 · Up to 6 children', groupDetails: 'The group meets weekly for four weeks. Mr. Jay reads an original Jurassic English story, leads a short discussion, and gives children one small follow-up task.', next: 'Next group:', form: 'Ask for a place', formDetails: 'Pay with the QR first. Then enter your contact details so we can confirm and deliver your order.', name: 'Your name', email: 'Email address for your order', location: 'Country or location', phone: 'Phone / Zalo number', phoneHint: 'Choose your country, then enter your phone number.', age: "Child's age", group: 'Preferred group', consent: 'I agree Jurassic English may use these details to confirm and deliver this purchase. See the privacy notice.', submit: 'Send my details', invalid: 'Please check your name, email address, location and phone number. Age and group are optional.', failed: 'We could not send your request. Please try again or message Mr. Jay on Zalo.', thanks: 'Thank you. Your request has been received.', pay: 'Pay now', transfer: 'Transfer memo', qrFallback: 'Mr. Jay will send the payment QR on Zalo within the day', zalo: 'Ask Mr. Jay on Zalo', privacy: 'Privacy notice', required: 'Please agree before sending your request.', paymentPending: 'We’re checking your payment. This can take a moment.', paymentReceived: 'Payment received. Please send your contact details below to confirm your place.', ivePaid: 'I’ve paid — enter my details', question: 'Have a question before paying? Ask on Zalo',
    getCodeHeading: 'Get your payment code', getCodeText: 'When you have read the summary above and want to join the paid round, press the button. We then create your payment QR with the exact amount and a unique transfer memo. Pressing it does not charge you, and this page never asks for card details.', getCode: 'Get my payment code', getCodePreparing: 'Preparing your code…',
    getCodeTextProduct: 'Press the button when you are ready to buy. We then create your payment QR with the exact amount and a unique transfer memo. Pressing it does not charge you, and this page never asks for card details.',
  },
  vi: {
    title: 'Đặt chỗ Câu lạc bộ Truyện', intro: 'Nhóm tiếng Anh qua truyện nhỏ, thân thiện cùng thầy Jay. Các buổi có phí diễn ra vào thứ Bảy lúc 13:00 giờ Việt Nam. Giờ kể chuyện miễn phí tạm hoãn (sẽ báo ngày mới sớm); bạn có thể hỏi thầy Jay qua Zalo trước khi thanh toán.', sample: 'Đọc thử Truyện 1 miễn phí trước', sampleTitle: 'Mina và chiếc trống lúc nửa đêm · Cấp độ 1', price: 'Câu lạc bộ Truyện cùng thầy Jay', amount: '590.000₫ · 4 tuần', details: 'Học trực tuyến qua Google Meet · Bé 5–8 tuổi · Tối đa 6 bé', groupDetails: 'Nhóm gặp nhau mỗi tuần trong bốn tuần. Thầy Jay đọc truyện gốc của Jurassic English, cùng các bé trò chuyện và giao một hoạt động nhỏ sau buổi học.', next: 'Nhóm tiếp theo:', form: 'Đăng ký chỗ', formDetails: 'Quét mã QR để thanh toán trước. Sau đó nhập thông tin liên hệ để chúng tôi xác nhận và giao sản phẩm.', name: 'Họ tên', email: 'Địa chỉ email nhận đơn hàng', location: 'Quốc gia hoặc khu vực', phone: 'Số điện thoại / Zalo', phoneHint: 'Chọn quốc gia, sau đó nhập số điện thoại.', age: 'Tuổi của bé', group: 'Nhóm mong muốn', consent: 'Tôi đồng ý để Jurassic English sử dụng thông tin này để xác nhận và giao đơn hàng. Xem thông báo quyền riêng tư.', submit: 'Gửi thông tin của tôi', invalid: 'Vui lòng kiểm tra họ tên, email, khu vực và số điện thoại. Tuổi và nhóm không bắt buộc.', failed: 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc nhắn thầy Jay qua Zalo.', thanks: 'Cảm ơn bạn. Chúng tôi đã nhận được yêu cầu.', pay: 'Thanh toán ngay', transfer: 'Nội dung chuyển khoản', qrFallback: 'Thầy Jay sẽ gửi mã QR thanh toán qua Zalo trong ngày hôm nay', zalo: 'Hỏi thầy Jay qua Zalo', privacy: 'Thông báo quyền riêng tư', required: 'Vui lòng đồng ý trước khi gửi yêu cầu.', paymentPending: 'Đang kiểm tra thanh toán. Vui lòng chờ trong giây lát.', paymentReceived: 'Đã nhận thanh toán. Vui lòng gửi thông tin liên hệ bên dưới để xác nhận chỗ.', ivePaid: 'Tôi đã thanh toán — nhập thông tin', question: 'Có câu hỏi trước khi thanh toán? Hỏi qua Zalo',
    getCodeHeading: 'Lấy mã thanh toán', getCodeText: 'Khi bạn đã đọc bản tóm tắt ở trên và muốn tham gia vòng học có phí, hãy bấm nút bên dưới. Chúng tôi sẽ tạo mã QR thanh toán với đúng số tiền và nội dung chuyển khoản riêng. Bấm nút không bị trừ tiền, và trang này không bao giờ yêu cầu thông tin thẻ.', getCode: 'Lấy mã thanh toán của tôi', getCodePreparing: 'Đang chuẩn bị mã…',
    getCodeTextProduct: 'Bấm nút khi bạn sẵn sàng mua. Chúng tôi sẽ tạo mã QR thanh toán với đúng số tiền và nội dung chuyển khoản riêng. Bấm nút không bị trừ tiền, và trang này không bao giờ yêu cầu thông tin thẻ.',
  },
} as const;

type Confirmation = { memo: string; amount: number };
const FIELD = 'mt-1 block min-h-11 w-full rounded-xl border border-sb-border bg-white px-3 py-2 text-base text-sb-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sb-amber';

/** `initialMemo` is a test seam: server-rendered tests start in the payment-ready state. The live page never passes it. */
export function StoryClubReservePage({ locale, productId = 'story-club', intro, initialMemo }: { locale: Locale; productId?: string; intro?: ReactNode; initialMemo?: string }) {
  const offer = paidOffer(productId);
  const isStory = productId === 'story-club';
  const now = useNow();
  // After load, the headline shows the price due now, with the list price as "usually" (review fix 5). Prerendered, it is the list price.
  const due = isStory && now ? storyClubPriceAt(now) : null;
  const t = copy[locale];
  const { summary, tryIt } = storyClubTryItContent[locale];
  const [confirmation, setConfirmation] = useState<Confirmation | null>(initialMemo ? { memo: initialMemo, amount: offer?.amount ?? 0 } : null);
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const firstTouch = useFirstTouch();
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
      const result = await response.json() as { memo?: unknown; amount?: unknown };
      if (typeof result.memo !== 'string' || !new RegExp(`^${offer.prefix}-[A-Z0-9]{6}$`).test(result.memo)) throw new Error('Invalid payment reference');
      // Story Club: the server returns the dated launch-offer amount (storyClubOffer.ts); a missing value falls back to the same function here.
      const amount = typeof result.amount === 'number' && Number.isSafeInteger(result.amount) && result.amount > 0 ? result.amount : isStory ? storyClubPriceAt(new Date()).priceVnd : offer.amount;
      setConfirmation({ memo: result.memo, amount });
      setPaymentReceived(false);
    } catch {
      setPrepareError(locale === 'vi' ? 'Chưa tạo được mã thanh toán. Vui lòng thử lại.' : 'We could not prepare the payment code. Please try again.');
    } finally {
      clearTimeout(timer);
      setPreparing(false);
    }
  };

  // Every product prepares its payment only after an explicit click on "Get my payment code" (audit fix 6, 11 Nov 2026;
  // Story Club since 4 Nov), so page loads by bots, crawlers and audits create no payment memo and no Notion lead.

  useEffect(() => {
    if (trackedView.current) return;
    trackedView.current = true;
    recordClientEvent({ event: 'reserve_view', product_id: productId, locale });
  }, [locale, productId]);

  useEffect(() => {
    if (!confirmation || trackedPay.current) return;
    trackedPay.current = true;
    recordClientEvent({ event: 'pay_instructions_shown', product_id: productId, locale });
    // Story Club: stay where the parent is reading. Jumping to the payment section skipped the written summary above it.
    if (!isStory) confirmationRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
  }, [confirmation, locale, productId, isStory]);

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
    if (form.get('consent') !== 'on') { setError(t.required); return; }
    const invalid = validateStoryClubReserve(values);
    if (invalid) { setError(t.invalid); return; }
    setError('');
    submitting.current = true;
    setSending(true);
    const params = new URLSearchParams(window.location.search);
    // The visit's first utm_* set fills in whatever the reserve URL itself does not carry (funnel audit fix 2).
    for (const [key, value] of Object.entries(readFirstTouch(window.sessionStorage))) if (!params.get(key)) params.set(key, value);
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
          <p className="mt-2 text-3xl font-extrabold" data-reserve-price>{paymentAmount(due ? due.priceVnd : offer!.amount, locale)}{due?.tier ? <span className="ms-2 text-base font-semibold" data-reserve-list-price>{locale === 'vi' ? 'thường' : 'usually'} {paymentAmount(due.listPriceVnd, locale)}</span> : null}{productId === 'one-to-one' ? (locale === 'vi' ? ' · 8 buổi' : ' · 8 lessons') : ''}</p>
          {intro}
          {isStory && <p className="mt-2">{t.details}</p>}
          {isStory && <p className="mt-2 font-semibold" data-reserve-first-session><StoryClubLiveLine locale={locale} kind="schedule" /></p>}
          {isStory && <p className="mt-1" data-reserve-offer><StoryClubLiveLine locale={locale} kind="offer" /></p>}
        </section>

        {isStory && (
          // The written summary comes before any payment instruction (4 Nov 2026 defect: "Pay now" came first and no date or refund rule was shown).
          <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="reserve-summary-heading" data-reserve-summary>
            <h2 id="reserve-summary-heading" className="text-2xl font-bold">{summary.heading}</h2>
            <p className="mt-2">{summary.intro}</p>
            <p className="mt-2 font-semibold">{summary.readFirst}</p>
            <p className="mt-2">{t.groupDetails}</p>
            <div className="mt-6 space-y-6">
              <StoryClubTryIt locale={locale} as="h3" id="reserve-try-it">
                <a className="insights-button-primary mt-4 max-w-md" href={withFirstTouch(STORY_CLUB_TRY_IT_ZALO_HREF_RESERVE, firstTouch)} target="_blank" rel="noopener noreferrer nofollow" data-cta="story-club-try-it-zalo">{tryIt.cta}</a>
                <p className="mt-2 text-sm">{tryIt.note}</p>
              </StoryClubTryIt>
              <StoryClubPaidRound locale={locale} as="h3" id="reserve-paid-round" />
              <StoryClubRefund locale={locale} as="h3" id="reserve-refund" />
            </div>
          </section>
        )}

        {confirmation ? (
          <section ref={confirmationRef} className="ielts-tool-card scroll-mt-28 rounded-2xl bg-white p-6 shadow-sm" aria-labelledby="reserve-confirmation" data-payment-instructions>
            <h2 id="reserve-confirmation" className="text-2xl font-bold">{t.pay}</h2>
            {isStory && <p className="mt-2 font-semibold" data-pay-rules>{summary.beforePaying} {storyClubTryItContent[locale].refund.points[0]}</p>}
            <PayStep key={confirmation.memo} locale={locale} amount={confirmation.amount} memo={confirmation.memo} productId={productId} />
            {isStory && storyClubTierForAmount(confirmation.amount) ? <p className="mt-3 font-semibold" data-payment-valid-until>{locale === 'vi'
              ? `Số tiền này có hiệu lực đến ${storyClubTierForAmount(confirmation.amount)!.untilLabel.vi} ${STORY_CLUB_TIME_ZONE_LABEL.vi}. Khoản chuyển đến muộn tối đa ${STORY_CLUB_GRACE_MINUTES} phút vẫn được chấp nhận; muộn hơn sẽ được thầy Jay kiểm tra thủ công qua Zalo.`
              : `This amount is valid until ${storyClubTierForAmount(confirmation.amount)!.untilLabel.en} ${STORY_CLUB_TIME_ZONE_LABEL.en}. A payment that arrives up to ${STORY_CLUB_GRACE_MINUTES} minutes later is still accepted; after that Mr. Jay checks it by hand on Zalo.`}</p> : null}
            {isStory && <p className="mt-3 font-semibold" data-payment-status>{paymentReceived ? t.paymentReceived : t.paymentPending}</p>}
            <p className="mt-4">{locale === 'vi' ? 'Quét mã bằng ứng dụng ngân hàng và kiểm tra đúng số tiền trước khi xác nhận. Thông tin cá nhân chỉ cần nhập sau khi thanh toán.' : 'Scan with your banking app and verify the exact amount before confirming. You only need to enter personal details after paying.'}</p>
            <a rel="nofollow" className="mt-3 inline-block underline" href={withFirstTouch(checkoutZaloHref(productId, 'checkout', 'prepayment-question'), firstTouch)}>{t.question}</a>
            {!contactFormOpen && <button type="button" className="insights-button-primary mt-5 block" onClick={() => setContactFormOpen(true)} data-open-contact-form>{t.ivePaid}</button>}
          </section>
        ) : (
          <section className="ielts-tool-card rounded-2xl bg-white p-6 shadow-sm" aria-live="polite" data-payment-preparing data-payment-gate>
            <h2 className="text-2xl font-bold">{t.getCodeHeading}</h2>
            <p className="mt-2">{isStory ? t.getCodeText : t.getCodeTextProduct}</p>
            <button type="button" className="insights-button-primary mt-4 w-full max-w-md" onClick={() => void preparePayment()} disabled={preparing} aria-busy={preparing} data-get-payment-code>{preparing ? t.getCodePreparing : t.getCode}</button>
            {prepareError ? <><p role="alert" className="mt-3 font-semibold text-red-700">{prepareError}</p><p className="mt-3" data-prepare-fallback>{t.qrFallback}: <a rel="nofollow" className="underline" href={withFirstTouch(checkoutZaloHref(productId, 'checkout', 'prepare-failed'), firstTouch)}>{t.zalo}</a></p></> : null}
            {FIXED_ORDER_CODES[productId] ? <p className="mt-3 text-sm" data-checkout-order-code={productId}>{ORDER_CODE_COPY[locale].before} <strong>{FIXED_ORDER_CODES[productId]}</strong>{ORDER_CODE_COPY[locale].after}</p> : null}
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
        {isStory && <p className="text-sm">{locale === 'vi' ? 'Sau khi bạn thanh toán và gửi thông tin liên hệ, thầy Jay sẽ liên hệ qua Zalo để xác nhận chỗ học của bé.' : 'After you pay and send your contact details, Mr. Jay will contact you on Zalo to confirm your child’s place in the group.'}</p>}
        {isStory && <a className="block text-sm underline underline-offset-4" href={STORY_CLUB_SAMPLE_URL} data-reserve-sample>{t.sample}</a>}
      </div>
    </main>
  );
}

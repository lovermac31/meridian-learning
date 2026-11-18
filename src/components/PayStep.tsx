import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '../i18n/locales';
import { BANK_CONFIG, paymentAmount, paymentQrUrl } from '../config/payment';
import { FIXED_ORDER_CODES, ORDER_CODE_COPY, checkoutZaloHref } from '../lib/productsSource';
import { isFinalPayState, payStatusSource, watchPayment, type PayState } from '../lib/payStatus';

// P5c (15 Nov 2026): the live payment status after the memo and QR. Same EN/VI wording as the JurassicIELTS pay step (P5b).
type ZaloLine = { readonly before: string; readonly link: readonly [string, string] };
export const PAY_STATUS_COPY = {
  en: {
    waiting: 'Waiting for your transfer… This page updates by itself. Keep it open.',
    received: 'Payment received. Thank you!',
    manual: 'We confirm 1-to-1 payments by hand. We’ll message you on Zalo after we check it.',
    // The delivery step each page already promises. With a contact already sent we deliver there; without one, Zalo with the code.
    next: {
      product: { sent: 'Next step: we’ll send your order to the email address you gave us.', zalo: { before: '', link: ['Message us on Zalo with your code ', ' to receive your files.'] } },
      'live-check': { sent: 'Next step: we’ll message you on Zalo to confirm your time.', zalo: { before: '', link: ['Message us on Zalo with your code ', ' to book your time.'] } },
      'story-club': { sent: 'Next step: we’ll message you on Zalo to confirm your child’s place.', zalo: null, form: 'Next step: please send your contact details below to confirm your place.' },
    },
    underpaid: { before: 'We received less than the price. ', link: ['Message us on Zalo with your code ', ' and we’ll sort it out.'] },
    overpaid: { before: 'We received more than the price. ', link: ['Message us on Zalo with your code ', ' for a refund of the difference.'] },
    expired: { before: 'Already paid? ', link: ['Message us on Zalo with your code ', '.'] },
  },
  vi: {
    waiting: 'Đang chờ bạn chuyển khoản… Trang sẽ tự cập nhật, vui lòng giữ trang mở.',
    received: 'Đã nhận thanh toán. Cảm ơn bạn!',
    manual: 'Chúng tôi xác nhận thanh toán gói 1-1 thủ công. Chúng tôi sẽ nhắn bạn qua Zalo sau khi kiểm tra.',
    next: {
      product: { sent: 'Bước tiếp theo: chúng tôi sẽ gửi đơn hàng đến địa chỉ email bạn đã cung cấp.', zalo: { before: '', link: ['Nhắn Zalo cho chúng tôi kèm mã ', ' để nhận tài liệu.'] } },
      'live-check': { sent: 'Bước tiếp theo: chúng tôi sẽ nhắn bạn qua Zalo để xác nhận giờ học.', zalo: { before: '', link: ['Nhắn Zalo cho chúng tôi kèm mã ', ' để đặt giờ học.'] } },
      'story-club': { sent: 'Bước tiếp theo: chúng tôi sẽ nhắn bạn qua Zalo để xác nhận chỗ học của bé.', zalo: null, form: 'Bước tiếp theo: vui lòng gửi thông tin liên hệ bên dưới để xác nhận chỗ.' },
    },
    underpaid: { before: 'Số tiền chúng tôi nhận được thấp hơn giá sản phẩm. ', link: ['Nhắn Zalo cho chúng tôi kèm mã ', ', chúng tôi sẽ hỗ trợ bạn.'] },
    overpaid: { before: 'Số tiền chúng tôi nhận được cao hơn giá sản phẩm. ', link: ['Nhắn Zalo cho chúng tôi kèm mã ', ' để được hoàn lại phần chênh lệch.'] },
    expired: { before: 'Bạn đã chuyển khoản rồi? ', link: ['Nhắn Zalo cho chúng tôi kèm mã ', '.'] },
  },
} as const;

/** Polls the code's status source after the memo shows. `null` while there is nothing to poll (1T, BL, before hydration). */
function usePayState(memo: string, onPayState?: (state: PayState) => void): PayState | null {
  const [state, setState] = useState<PayState | null>(null);
  const callback = useRef(onPayState);
  callback.current = onPayState;
  useEffect(() => {
    const source = payStatusSource(memo);
    if (source.kind !== 'auto') return;
    return watchPayment({ url: source.url, onState: next => { setState(next); callback.current?.(next); } });
  }, [memo]);
  return state;
}

export function PayStep({ locale, amount, memo, productId, contactSent = false, onPayState }: {
  locale: Locale; amount: number; memo: string; productId: string;
  /** The buyer already sent contact details on this checkout, so the thank-you can say where delivery goes. */
  contactSent?: boolean;
  onPayState?: (state: PayState) => void;
}) {
  const dynamic = paymentQrUrl(amount, memo);
  const [qrUnavailable, setQrUnavailable] = useState(!dynamic);
  const [copied, setCopied] = useState('');
  const vi = locale === 'vi';
  const source = payStatusSource(memo);
  const state = usePayState(memo, onPayState);
  const final = isFinalPayState(state);
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(vi ? 'Đã sao chép' : 'Copied'); }
    catch { setCopied(vi ? 'Vui lòng chọn và sao chép thông tin bên trên.' : 'Please select and copy the details above.'); }
  };
  const t = PAY_STATUS_COPY[locale];
  const zaloLine = (line: ZaloLine, key: string): ReactNode => {
    const [before, after] = line.link;
    return <>{line.before}<a rel="nofollow" className="underline" href={checkoutZaloHref(productId, 'checkout', `pay-${key}`)} data-pay-zalo-line>{before}<strong data-pay-code>{memo}</strong>{after}</a></>;
  };
  let statusLine: ReactNode = null;
  if (source.kind === 'manual') statusLine = <span data-pay-manual>{t.manual}</span>;
  else if (source.kind === 'auto' && state === 'waiting') statusLine = <span data-pay-waiting>{t.waiting}</span>;
  else if (source.kind === 'auto' && state === 'received') {
    const next = t.next[source.family];
    const step = contactSent ? next.sent : next.zalo ? zaloLine(next.zalo, 'received') : 'form' in next ? next.form : null;
    statusLine = <><span data-pay-thanks>{t.received}</span> <span data-pay-next>{step}</span></>;
  } else if (state === 'underpaid' || state === 'overpaid' || state === 'expired') statusLine = zaloLine(t[state], state);

  return <div data-pay-step={productId} data-pay-state={state ?? undefined}>
    <h3 className="mt-5 text-xl font-bold">{vi ? 'Hướng dẫn thanh toán' : 'Payment instructions'}</h3>
    <p className="mt-2 text-2xl font-bold" data-payment-amount>{paymentAmount(amount, locale)}</p>
    <p className="mt-2">{vi ? 'Nội dung chuyển khoản' : 'Transfer memo'}: <strong data-transfer-memo>{memo}</strong></p>
    {/* A generic account QR has no order amount or memo; never substitute it for a priced checkout. On a final state the QR and
        every second-pay control go: the thank-you (or the Zalo step) replaces them. */}
    {final ? null : dynamic && !qrUnavailable ? (
      <div data-payment-bank-transfer>
        <p className="mt-2">{BANK_CONFIG.bank} · {BANK_CONFIG.name} · <strong>{BANK_CONFIG.account}</strong></p>
        <p className="mt-3">{vi ? 'Quét bằng ứng dụng ngân hàng bất kỳ → kiểm tra số tiền và nội dung chuyển khoản.' : 'Scan in any banking app → check the amount and transfer note.'}</p>
        <img data-payment-qr src={dynamic} alt={vi ? 'Mã VietQR thanh toán' : 'VietQR payment code'} width={320} height={320} referrerPolicy="no-referrer" className="mt-4 max-h-72 w-auto max-w-full object-contain" onError={() => setQrUnavailable(true)} />
        <p className="mt-3 text-sm">{vi ? 'Dùng điện thoại: lưu mã QR, mở ứng dụng ngân hàng, chọn Quét QR → Chọn ảnh / Thư viện.' : 'On your phone: save the QR, open your banking app, then Scan QR → From Gallery / Album.'}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="insights-button-secondary" href={dynamic} download="jurassic-english-payment-qr.png" target="_blank" rel="noopener noreferrer">{vi ? 'Tải mã QR' : 'Download QR'}</a>
          <button type="button" className="insights-button-secondary" onClick={() => void copy(BANK_CONFIG.account)}>{vi ? 'Sao chép số tài khoản' : 'Copy account number'}</button>
          <button type="button" className="insights-button-secondary" onClick={() => void copy(memo)}>{vi ? 'Sao chép mã' : 'Copy code'}</button>
        </div>
      </div>
    ) : (
      <p id="payment-qr-unavailable" data-payment-qr-error role="alert" className="mt-3">
        {vi
          ? 'Không tải được mã QR thanh toán tự động. Vui lòng tải lại trang hoặc liên hệ thầy Jay qua Zalo. Không quét mã khác hoặc tự nhập số tiền.'
          : 'The automatic payment QR could not be loaded. Please reload or contact Mr. Jay on Zalo. Do not use a different QR or enter the amount manually.'}
      </p>
    )}
    {/* The one polite live region of this pay step: the payment status line, plus the copy-button feedback. */}
    <p role="status" aria-live="polite" className={`mt-4 ${final ? 'text-lg font-bold' : 'font-semibold'}`} data-pay-status>
      {statusLine ? <span data-pay-status-line>{statusLine}</span> : null}
      {copied && !final ? <span className={statusLine ? 'ms-2 font-normal' : 'font-normal'} data-copy-feedback>{copied}</span> : null}
    </p>
    <a rel="nofollow" className="insights-button-primary mt-5" href={checkoutZaloHref(productId, 'reserve', 'after-submit')} data-after-submit-zalo>{vi ? 'Hỏi thầy Jay qua Zalo' : 'Ask Mr. Jay on Zalo'}</a>
    {FIXED_ORDER_CODES[productId] ? <p className="mt-2 text-sm" data-checkout-order-code={productId}>{ORDER_CODE_COPY[locale].before} <strong>{FIXED_ORDER_CODES[productId]}</strong>{ORDER_CODE_COPY[locale].after}</p> : null}
  </div>;
}

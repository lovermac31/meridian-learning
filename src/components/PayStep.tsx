import { useState } from 'react';
import type { Locale } from '../i18n/locales';
import { BANK_CONFIG, STATIC_QR, paymentAmount, paymentQrUrl } from '../config/payment';

export function PayStep({ locale, amount, memo, productId }: { locale: Locale; amount: number; memo: string; productId: string }) {
  const dynamic = paymentQrUrl(amount, memo);
  const [stage, setStage] = useState(dynamic ? 'dynamic' : 'static');
  const [copied, setCopied] = useState('');
  const vi = locale === 'vi';
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(vi ? 'Đã sao chép' : 'Copied'); }
    catch { setCopied(vi ? 'Vui lòng chọn và sao chép thông tin bên trên.' : 'Please select and copy the details above.'); }
  };
  return <div data-pay-step={productId}>
    <h3 className="mt-5 text-xl font-bold">{vi ? 'Hướng dẫn thanh toán' : 'Payment instructions'}</h3>
    <p className="mt-2 text-2xl font-bold" data-payment-amount>{paymentAmount(amount, locale)}</p>
    <p className="mt-2">{vi ? 'Nội dung chuyển khoản' : 'Transfer memo'}: <strong data-transfer-memo>{memo}</strong></p>
    <p className="mt-2">{BANK_CONFIG.bank} · {BANK_CONFIG.name} · <strong>{BANK_CONFIG.account}</strong></p>
    <p className="mt-3">{vi ? 'Quét bằng ứng dụng ngân hàng bất kỳ → kiểm tra số tiền và nội dung chuyển khoản.' : 'Scan in any banking app → check the amount and transfer note.'}</p>
    {stage !== 'failed' && <img data-payment-qr src={stage === 'dynamic' ? dynamic! : STATIC_QR} alt={vi ? 'Mã VietQR thanh toán' : 'VietQR payment code'} width={320} height={320} referrerPolicy="no-referrer" className="mt-4 max-h-72 w-auto max-w-full object-contain" onError={() => setStage(stage === 'dynamic' ? 'static' : 'failed')} />}
    {stage !== 'dynamic' && <p id="reserve-qr-fallback" className="mt-3">{vi ? 'Nhập số tiền và mã ở trên làm nội dung chuyển khoản. Nếu cần, thầy Jay sẽ gửi QR qua Zalo.' : 'Enter the amount and code above as the transfer note. Mr. Jay can send the QR on Zalo if needed.'}</p>}
    <div className="mt-4 flex flex-wrap gap-3">
      <button type="button" className="insights-button-secondary" onClick={() => void copy(BANK_CONFIG.account)}>{vi ? 'Sao chép số tài khoản' : 'Copy account number'}</button>
      <button type="button" className="insights-button-secondary" onClick={() => void copy(memo)}>{vi ? 'Sao chép mã' : 'Copy code'}</button>
    </div>
    <p aria-live="polite">{copied}</p>
    <a className="insights-button-primary mt-5" href={`/go/zalo?utm_source=reserve&utm_content=${encodeURIComponent(productId)}-after-submit`} data-after-submit-zalo>{vi ? 'Hỏi thầy Jay qua Zalo' : 'Ask Mr. Jay on Zalo'}</a>
  </div>;
}

import { useState } from 'react';
import type { Locale } from '../i18n/locales';
import { BANK_CONFIG, paymentAmount, paymentQrUrl } from '../config/payment';

export function PayStep({ locale, amount, memo, productId }: { locale: Locale; amount: number; memo: string; productId: string }) {
  const dynamic = paymentQrUrl(amount, memo);
  const [qrUnavailable, setQrUnavailable] = useState(!dynamic);
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
    {/* A generic account QR has no order amount or memo; never substitute it for a priced checkout. */}
    {dynamic && !qrUnavailable ? (
      <>
        <p className="mt-2">{BANK_CONFIG.bank} · {BANK_CONFIG.name} · <strong>{BANK_CONFIG.account}</strong></p>
        <p className="mt-3">{vi ? 'Quét bằng ứng dụng ngân hàng bất kỳ → kiểm tra số tiền và nội dung chuyển khoản.' : 'Scan in any banking app → check the amount and transfer note.'}</p>
        <img data-payment-qr src={dynamic} alt={vi ? 'Mã VietQR thanh toán' : 'VietQR payment code'} width={320} height={320} referrerPolicy="no-referrer" className="mt-4 max-h-72 w-auto max-w-full object-contain" onError={() => setQrUnavailable(true)} />
        <p className="mt-3 text-sm">{vi ? 'Dùng điện thoại: lưu mã QR, mở ứng dụng ngân hàng, chọn Quét QR → Chọn ảnh / Thư viện.' : 'On your phone: save the QR, open your banking app, then Scan QR → From Gallery / Album.'}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <a className="insights-button-secondary" href={dynamic} download="jurassic-english-payment-qr.png" target="_blank" rel="noopener noreferrer">{vi ? 'Tải mã QR' : 'Download QR'}</a>
          <button type="button" className="insights-button-secondary" onClick={() => void copy(BANK_CONFIG.account)}>{vi ? 'Sao chép số tài khoản' : 'Copy account number'}</button>
          <button type="button" className="insights-button-secondary" onClick={() => void copy(memo)}>{vi ? 'Sao chép mã' : 'Copy code'}</button>
        </div>
        <p aria-live="polite">{copied}</p>
      </>
    ) : (
      <p id="payment-qr-unavailable" data-payment-qr-error role="alert" className="mt-3">
        {vi
          ? 'Không tải được mã QR thanh toán tự động. Vui lòng tải lại trang hoặc liên hệ thầy Jay qua Zalo. Không quét mã khác hoặc tự nhập số tiền.'
          : 'The automatic payment QR could not be loaded. Please reload or contact Mr. Jay on Zalo. Do not use a different QR or enter the amount manually.'}
      </p>
    )}
    <a className="insights-button-primary mt-5" href={`/go/zalo?utm_source=reserve&utm_content=${encodeURIComponent(productId)}-after-submit`} data-after-submit-zalo>{vi ? 'Hỏi thầy Jay qua Zalo' : 'Ask Mr. Jay on Zalo'}</a>
  </div>;
}

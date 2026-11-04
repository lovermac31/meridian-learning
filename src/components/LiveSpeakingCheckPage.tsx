import { useState } from 'react';
import type { Locale } from '../i18n/locales';
import { LIVE_CHECK_OFFER } from '../config/payment';
import { paypalHref, paypalItemName, usdFromVnd } from '../lib/paypal';
import { StoryClubReservePage } from './StoryClubReservePage';

// Unlisted page (noindex, not in the sitemap, not linked): the 30-minute Live Speaking Check. It reuses the products
// checkout (prepared memo + VietQR + contact form) and the product PayPal helper; it adds only this page's terms.
const COPY: Record<Locale, { lead: string; points: string[]; paypal: string }> = {
  en: {
    lead: 'A 30-minute one-to-one speaking check on Google Meet with Mr. Jay, then a short written summary. For adults aged 18 and over. It is a practice check, not an official IELTS score.',
    points: [
      'Credited in full toward the Live Speaking Baseline (690,000₫) or an 8-lesson pack if you book within 14 days.',
      'Limited to 5 bookings a week, mornings only (Vietnam time, UTC+7). Mr. Jay confirms your time on Zalo after payment.',
      'Full refund if Mr. Jay cancels or cannot offer a time within 7 days. Please give 12 hours’ notice to move your time.',
    ],
    paypal: 'Outside Vietnam? Pay US$10 by PayPal',
  },
  vi: {
    lead: 'Buổi kiểm tra nói 30 phút 1-1 trên Google Meet với thầy Jay, kèm bản tóm tắt ngắn bằng văn bản. Dành cho người từ 18 tuổi. Đây là buổi kiểm tra luyện tập, không phải điểm IELTS chính thức.',
    points: [
      'Được trừ toàn bộ vào Đánh giá Nói trực tiếp (690.000₫) hoặc gói 8 buổi nếu bạn đăng ký trong 14 ngày.',
      'Giới hạn 5 lượt mỗi tuần, chỉ buổi sáng (giờ Việt Nam, UTC+7). Thầy Jay xác nhận giờ qua Zalo sau khi thanh toán.',
      'Hoàn tiền đầy đủ nếu thầy Jay hủy hoặc không sắp xếp được lịch trong 7 ngày. Vui lòng báo trước 12 giờ nếu cần đổi lịch.',
    ],
    paypal: 'Ở ngoài Việt Nam? Thanh toán US$10 qua PayPal',
  },
};

export function LiveSpeakingCheckPage() {
  const [locale] = useState<Locale>(() => (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('lang') === 'vi' ? 'vi' : 'en'));
  const c = COPY[locale];
  const paypal = paypalHref(paypalItemName(LIVE_CHECK_OFFER.title.en.title, 'Jurassic English'), usdFromVnd(LIVE_CHECK_OFFER.amount), LIVE_CHECK_OFFER.id);
  return <StoryClubReservePage locale={locale} productId={LIVE_CHECK_OFFER.id} intro={<div data-live-check-terms>
    <p className="mt-2">{c.lead}</p>
    <ul className="mt-3 list-disc space-y-1 pl-5">{c.points.map((point) => <li key={point}>{point}</li>)}</ul>
    <p className="mt-3 text-sm"><a href={paypal} target="_blank" rel="noopener noreferrer" className="font-bold underline underline-offset-4" data-paypal-link={LIVE_CHECK_OFFER.id}>{c.paypal}</a></p>
  </div>} />;
}

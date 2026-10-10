import { getCurrentLocale } from '../i18n/routing';
import { trackCtaClick } from '../lib/analytics';

/** Free written-example practice, not a free personalised speaking assessment. */
export function OneChangeInvitation({ placement = 'homepage' }: { placement?: 'homepage' | 'insights' }) {
  const vi = getCurrentLocale() === 'vi';
  const href = `/challenges/one-change?lang=${vi ? 'vi' : 'en'}&utm_source=${placement}&utm_medium=internal&utm_campaign=one_change_pilot`;
  return <section aria-label={vi ? 'Bài luyện tập Speaking miễn phí' : 'Free Speaking practice sample'} className="bg-jurassic-soft px-6 py-10">
    <div className="mx-auto max-w-5xl rounded-2xl border border-jurassic-gold/40 bg-white p-6 sm:p-9">
      <p className="text-xs font-bold uppercase tracking-widest text-jurassic-accent">{vi ? 'Bài luyện tập miễn phí · Không cần tài khoản' : 'Free practice sample · No account needed'}</p>
      <h2 className="mt-3 font-display text-3xl leading-tight text-jurassic-dark sm:text-4xl">{vi ? 'Chưa biết nên cải thiện điều gì trước?' : 'Not sure what to improve first?'}</h2>
      <p className="mt-4 max-w-2xl leading-relaxed text-jurassic-dark/75">{vi ? 'Chọn một thay đổi hữu ích trong câu trả lời mẫu, xem lý do, rồi áp dụng vào chủ đề mới bằng lời của bạn.' : 'Choose one useful change in an example answer, explore the reasoning, then try the strategy on a new topic in your own words.'}</p>
      <a href={href} onClick={() => { try { trackCtaClick({ label: `one_change_sample_${placement}`, type: 'secondary', segment: 'unknown' }); } catch { /* Measurement must not block navigation. */ } }} className="mt-6 inline-flex min-h-12 items-center rounded-full bg-jurassic-dark px-6 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jurassic-accent focus-visible:ring-offset-2">{vi ? 'Thử bài luyện tập miễn phí →' : 'Try the free Speaking challenge →'}</a>
      <p className="mt-3 text-xs leading-relaxed text-jurassic-dark/65">{vi ? 'Dành cho người học từ 18 tuổi. Bài luyện tập minh họa, không phải đánh giá cá nhân hoặc chấm điểm IELTS.' : 'For adults 18+. Illustrative practice—not a personalised assessment or an IELTS band score.'}</p>
    </div>
  </section>;
}

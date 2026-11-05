/**
 * Story Club: the free try-it and the paid round, as one set of facts shared by /story-club and /story-club/reserve.
 *
 * Decided by Jay on 4 Nov 2026 (final): Saturday 7 Nov 2026, 9:00 Hanoi time, is a FREE 30-minute Story Time for new
 * families. Registration is a Zalo message before Friday 6 Nov, 20:00. With fewer than 2 children registered, the try-it
 * moves to Saturday 14 Nov. The paid round is 4 weekly sessions at 590.000 VND from Saturday 14 Nov; parents decide after
 * trying. No promised scores or results.
 *
 * THE DATES BELOW ARE TIME-BOUND. After the first paid round starts, replace them with the next cohort's dates
 * (or remove the try-it block). The Vietnamese is AI-written and waits for Jay's read.
 */
import type { Locale } from '../locales';
import { STORY_CLUB_PRICE_VND } from '../../config/storyClubReserve';
import { paymentAmount } from '../../config/payment';

export const STORY_CLUB_SESSIONS = 4;
export const STORY_CLUB_SESSION_VND = STORY_CLUB_PRICE_VND / STORY_CLUB_SESSIONS; // 147.500 VND, the per-session make-up/return amount
export const STORY_CLUB_MAX_CHILDREN = 6;
export const STORY_CLUB_MIN_CHILDREN_FOR_TRY_IT = 2;

/** The existing Zalo link mechanism (api/go/zalo.ts counts the click as `zalo_click`); only the utm_content is new. */
export const STORY_CLUB_TRY_IT_ZALO_HREF = '/go/zalo?utm_source=story-club&utm_content=try-it-register';
export const STORY_CLUB_TRY_IT_ZALO_HREF_RESERVE = '/go/zalo?utm_source=reserve&utm_content=try-it-register';

type Fact = { label: string; value: string };

export type StoryClubTryItCopy = {
  /** One line for the hero of /story-club. */
  heroLine: string;
  tryIt: { heading: string; facts: Fact[]; cta: string; note: string };
  paid: { heading: string; facts: Fact[] };
  refund: { heading: string; points: string[] };
  /** Reserve page only: the written summary that comes before any payment instruction. */
  summary: { heading: string; intro: string; readFirst: string; beforePaying: string };
};

const sessionVnd = (locale: Locale) => paymentAmount(STORY_CLUB_SESSION_VND, locale);
const priceVnd = (locale: Locale) => paymentAmount(STORY_CLUB_PRICE_VND, locale);

export const storyClubTryItContent: Record<Locale, StoryClubTryItCopy> = {
  en: {
    heroLine: 'Free try-it: Saturday 7 November, 9:00 Hanoi time · 30 minutes · Google Meet · never recorded',
    tryIt: {
      heading: 'Try it first: a free Story Time for new families',
      facts: [
        { label: 'When', value: 'Saturday 7 November, 9:00 Hanoi time (GMT+7)' },
        { label: 'How long', value: '30 minutes. Free.' },
        { label: 'Where', value: 'Google Meet. We send the link to registered parents at 8:00 that morning.' },
        { label: 'Who', value: `Children aged 5–8, at most ${STORY_CLUB_MAX_CHILDREN} children. A parent sits beside the child.` },
        { label: 'Rules', value: 'The session is not recorded.' },
        { label: 'Register', value: 'Message Mr. Jay on Zalo before Friday 6 November, 20:00.' },
        { label: 'If few register', value: `If fewer than ${STORY_CLUB_MIN_CHILDREN_FOR_TRY_IT} children register, the try-it moves to Saturday 14 November.` },
      ],
      cta: 'Register for the free Story Time on Zalo',
      note: 'Registering on Zalo is free and you do not pay anything for the try-it.',
    },
    paid: {
      heading: 'The paid round: 4 weeks',
      facts: [
        { label: 'Price', value: `${priceVnd('en')} for ${STORY_CLUB_SESSIONS} weekly sessions (${sessionVnd('en')} a session).` },
        { label: 'When', value: 'Saturdays at 9:00 Hanoi time, 30 minutes on Google Meet, starting Saturday 14 November.' },
        { label: 'Who', value: `Children aged 5–8, up to ${STORY_CLUB_MAX_CHILDREN} children per group.` },
        { label: 'You decide after trying', value: 'Parents choose whether to join the paid round after the try-it. There is no pressure to pay.' },
        { label: 'What it is', value: 'Story time, speaking practice and a personal reply from Mr. Jay. We do not promise exam scores or results.' },
      ],
    },
    refund: {
      heading: 'Refunds and cancelled sessions',
      points: [
        'Full refund on request before the first paid session, within 24 hours of paying.',
        `If Mr. Jay cancels a session, we make it up or return ${sessionVnd('en')} for that session.`,
      ],
    },
    summary: {
      heading: 'Summary: read this before you pay',
      intro: 'Here is what Story Club is, when it meets, who it is for, the rules and the refund rule. The payment details come after this summary.',
      readFirst: 'Please try the free Story Time first. You do not have to pay to try Story Club.',
      beforePaying: 'By paying you accept the rules and the refund rule in this summary.',
    },
  },
  vi: {
    heroLine: 'Học thử miễn phí: thứ Bảy 7/11, 9:00 giờ Hà Nội · 30 phút · Google Meet · không bao giờ ghi âm, ghi hình',
    tryIt: {
      heading: 'Học thử trước: giờ kể chuyện miễn phí cho gia đình mới',
      facts: [
        { label: 'Khi nào', value: 'Thứ Bảy 7/11, 9:00 giờ Hà Nội (GMT+7)' },
        { label: 'Thời lượng', value: '30 phút. Miễn phí.' },
        { label: 'Ở đâu', value: 'Google Meet. Chúng tôi gửi đường dẫn cho phụ huynh đã đăng ký lúc 8:00 sáng hôm đó.' },
        { label: 'Dành cho ai', value: `Bé 5–8 tuổi, tối đa ${STORY_CLUB_MAX_CHILDREN} bé. Phụ huynh ngồi cạnh bé.` },
        { label: 'Quy định', value: 'Buổi học không được ghi âm, ghi hình.' },
        { label: 'Đăng ký', value: 'Nhắn thầy Jay qua Zalo trước 20:00 thứ Sáu 6/11.' },
        { label: 'Nếu ít bé đăng ký', value: `Nếu có ít hơn ${STORY_CLUB_MIN_CHILDREN_FOR_TRY_IT} bé đăng ký, buổi học thử sẽ dời sang thứ Bảy 14/11.` },
      ],
      cta: 'Đăng ký giờ kể chuyện miễn phí qua Zalo',
      note: 'Đăng ký qua Zalo là miễn phí và bạn không phải trả gì cho buổi học thử.',
    },
    paid: {
      heading: 'Vòng học có phí: 4 tuần',
      facts: [
        { label: 'Học phí', value: `${priceVnd('vi')} cho ${STORY_CLUB_SESSIONS} buổi hằng tuần (${sessionVnd('vi')} mỗi buổi).` },
        { label: 'Khi nào', value: 'Sáng thứ Bảy 9:00 giờ Hà Nội, 30 phút qua Google Meet, bắt đầu từ thứ Bảy 14/11.' },
        { label: 'Dành cho ai', value: `Bé 5–8 tuổi, tối đa ${STORY_CLUB_MAX_CHILDREN} bé mỗi nhóm.` },
        { label: 'Quyết định sau khi học thử', value: 'Phụ huynh chọn có tham gia vòng học có phí hay không sau buổi học thử. Không có áp lực phải thanh toán.' },
        { label: 'Nội dung', value: 'Nghe kể chuyện, thực hành nói và phản hồi riêng từ thầy Jay. Chúng tôi không hứa trước điểm thi hay kết quả.' },
      ],
    },
    refund: {
      heading: 'Hoàn tiền và buổi học bị hủy',
      points: [
        'Hoàn tiền đầy đủ nếu bạn yêu cầu trước buổi học có phí đầu tiên, trong vòng 24 giờ kể từ khi thanh toán.',
        `Nếu thầy Jay hủy một buổi, buổi đó sẽ được học bù hoặc hoàn lại ${sessionVnd('vi')} cho buổi đó.`,
      ],
    },
    summary: {
      heading: 'Tóm tắt: vui lòng đọc trước khi thanh toán',
      intro: 'Dưới đây là Câu lạc bộ Truyện là gì, học khi nào, dành cho ai, các quy định và quy định hoàn tiền. Thông tin thanh toán nằm sau bản tóm tắt này.',
      readFirst: 'Vui lòng cho bé học thử giờ kể chuyện miễn phí trước. Bạn không cần trả tiền để thử Câu lạc bộ Truyện.',
      beforePaying: 'Khi thanh toán, bạn đồng ý với các quy định và quy định hoàn tiền trong bản tóm tắt này.',
    },
  },
};

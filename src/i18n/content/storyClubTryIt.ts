/**
 * Story Club: the free try-it and the paid round, as one set of facts shared by /story-club and /story-club/reserve.
 *
 * Decided by Jay on 4 Nov 2026 (final): Saturday 7 Nov 2026, 9:00 Hanoi time, is a FREE 30-minute Story Time for new
 * families. Registration is a Zalo message before Friday 6 Nov, 20:00. With fewer than 2 children registered, the try-it
 * moves to Saturday 14 Nov. The paid round is 4 weekly sessions at 590.000 VND from Saturday 21 Nov; parents decide after
 * trying. No promised scores or results.
 *
 * UPDATE 8 Nov 2026 (Jay unwell): the try-it was postponed; no new date is set. Copy says "postponed, new date soon" until Jay
 * names a date, then restore a dated When/Register/If-few set (see git history for the 7 Nov wording).
 *
 * THE DATES BELOW ARE TIME-BOUND. After the first paid round starts, replace them with the next cohort's dates
 * (or remove the try-it block). The Vietnamese is AI-written and waits for Jay's read.
 */
import type { Locale } from '../locales';
import { STORY_CLUB_PRICE_VND } from '../../config/storyClubReserve';
import { storyClubOfferLine, storyClubScheduleLine } from '../../config/storyClubOffer';

export const STORY_CLUB_SESSIONS = 4;
export const STORY_CLUB_SESSION_VND = STORY_CLUB_PRICE_VND / STORY_CLUB_SESSIONS; // 147.500 VND, the per-session make-up/return amount
export const STORY_CLUB_MAX_CHILDREN = 6;
export const STORY_CLUB_MIN_CHILDREN_FOR_TRY_IT = 2;

/** The existing Zalo link mechanism (api/go/zalo.ts counts the click as `zalo_click`); only the utm_content is new. */
export const STORY_CLUB_TRY_IT_ZALO_HREF = '/go/zalo?utm_source=story-club&utm_content=try-it-register';
export const STORY_CLUB_TRY_IT_ZALO_HREF_RESERVE = '/go/zalo?utm_source=reserve&utm_content=try-it-register';

/** `live` facts re-render in the browser without the dates that have passed (StoryClubLiveLine); `suffix` follows the live text. */
type Fact = { label: string; value: string; live?: 'offer' | 'schedule'; suffix?: string };

export type StoryClubTryItCopy = {
  /** One line for the hero of /story-club. */
  heroLine: string;
  tryIt: { heading: string; facts: Fact[]; cta: string; note: string };
  paid: { heading: string; facts: Fact[] };
  refund: { heading: string; points: string[] };
  /** Reserve page only: the written summary that comes before any payment instruction. */
  summary: { heading: string; intro: string; readFirst: string; beforePaying: string };
};


export const storyClubTryItContent: Record<Locale, StoryClubTryItCopy> = {
  en: {
    heroLine: 'Free try-it postponed, new date coming soon · 30 minutes · Google Meet · never recorded',
    tryIt: {
      heading: 'Try it first: a free Story Time for new families',
      facts: [
        { label: 'When', value: 'Postponed because Mr. Jay is unwell. The new date will be announced soon.' },
        { label: 'How long', value: '30 minutes. Free.' },
        { label: 'Where', value: 'Google Meet. We send the link to registered parents on the morning of the session.' },
        { label: 'Who', value: `Children aged 5–8, at most ${STORY_CLUB_MAX_CHILDREN} children. A parent sits beside the child.` },
        { label: 'Rules', value: 'The session is not recorded.' },
        { label: 'Register', value: 'Message Mr. Jay on Zalo and you will hear the new date first.' },
        { label: 'If few register', value: `The try-it runs once at least ${STORY_CLUB_MIN_CHILDREN_FOR_TRY_IT} children have registered.` },
      ],
      cta: 'Message Mr. Jay on Zalo to hear the new date first',
      note: 'Registering on Zalo is free and you do not pay anything for the try-it.',
    },
    paid: {
      heading: 'The paid round: 4 weeks',
      facts: [
        { label: 'Price', value: storyClubOfferLine('en'), live: 'offer' },
        { label: 'When', value: `${storyClubScheduleLine('en')} 30 minutes on Google Meet.`, live: 'schedule', suffix: ' 30 minutes on Google Meet.' },
        { label: 'Who', value: `Children aged 5–8, up to ${STORY_CLUB_MAX_CHILDREN} children per group.` },
        { label: 'The free Story Time', value: 'It is postponed (new date coming soon). You can join the paid round now, or ask Mr. Jay on Zalo first. There is no pressure to pay.' },
        { label: 'What it is', value: 'Story time, speaking practice and a personal reply from Mr. Jay. We do not promise exam scores or results.' },
      ],
    },
    refund: {
      heading: 'Refunds and cancelled sessions',
      points: [
        'Full refund on request before the first paid session, within 24 hours of paying.',
        'If Mr. Jay cancels a session, we make it up or return a quarter of what you paid for that session.',
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
    heroLine: 'Học thử miễn phí tạm hoãn, sẽ báo ngày mới sớm · 30 phút · Google Meet · không bao giờ ghi âm, ghi hình',
    tryIt: {
      heading: 'Học thử trước: giờ kể chuyện miễn phí cho gia đình mới',
      facts: [
        { label: 'Khi nào', value: 'Tạm hoãn vì thầy Jay đang không khỏe. Ngày mới sẽ được thông báo sớm.' },
        { label: 'Thời lượng', value: '30 phút. Miễn phí.' },
        { label: 'Ở đâu', value: 'Google Meet. Chúng tôi gửi đường dẫn cho phụ huynh đã đăng ký vào sáng ngày học.' },
        { label: 'Dành cho ai', value: `Bé 5–8 tuổi, tối đa ${STORY_CLUB_MAX_CHILDREN} bé. Phụ huynh ngồi cạnh bé.` },
        { label: 'Quy định', value: 'Buổi học không được ghi âm, ghi hình.' },
        { label: 'Đăng ký', value: 'Nhắn thầy Jay qua Zalo để được báo ngày mới đầu tiên.' },
        { label: 'Nếu ít bé đăng ký', value: `Buổi học thử diễn ra khi có ít nhất ${STORY_CLUB_MIN_CHILDREN_FOR_TRY_IT} bé đã đăng ký.` },
      ],
      cta: 'Nhắn thầy Jay qua Zalo để được báo ngày mới',
      note: 'Đăng ký qua Zalo là miễn phí và bạn không phải trả gì cho buổi học thử.',
    },
    paid: {
      heading: 'Vòng học có phí: 4 tuần',
      facts: [
        { label: 'Học phí', value: storyClubOfferLine('vi'), live: 'offer' },
        { label: 'Khi nào', value: `${storyClubScheduleLine('vi')} 30 phút qua Google Meet.`, live: 'schedule', suffix: ' 30 phút qua Google Meet.' },
        { label: 'Dành cho ai', value: `Bé 5–8 tuổi, tối đa ${STORY_CLUB_MAX_CHILDREN} bé mỗi nhóm.` },
        { label: 'Giờ kể chuyện miễn phí', value: 'Buổi này tạm hoãn (sẽ báo ngày mới sớm). Bạn có thể tham gia vòng học có phí ngay, hoặc hỏi thầy Jay qua Zalo trước. Không có áp lực phải thanh toán.' },
        { label: 'Nội dung', value: 'Nghe kể chuyện, thực hành nói và phản hồi riêng từ thầy Jay. Chúng tôi không hứa trước điểm thi hay kết quả.' },
      ],
    },
    refund: {
      heading: 'Hoàn tiền và buổi học bị hủy',
      points: [
        'Hoàn tiền đầy đủ nếu bạn yêu cầu trước buổi học có phí đầu tiên, trong vòng 24 giờ kể từ khi thanh toán.',
        'Nếu thầy Jay hủy một buổi, buổi đó sẽ được học bù hoặc hoàn lại một phần tư số tiền bạn đã trả cho buổi đó.',
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

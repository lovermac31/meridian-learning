import type { Locale } from '../locales';

// The one lead capture (website assessment, 27 Oct 2026, lead-capture spec): a free sample pack for a Zalo number or an
// email. The offer and consent lines are the assessment's validated EN/VI copy; the form chrome is short and plain.
// The pack is the existing view-only samples on /products (no PDF): a storybook (Story Club), an activity page
// (Printable Pack) and a lesson plan (Level 1 Teacher Pack).
export type SamplePackCopy = {
  heading: string;
  name: string;
  contact: string;
  childAge: string;
  consent: string;
  privacy: string;
  privacyLink: string;
  submit: string;
  sending: string;
  errors: { contact: string; consent: string; failed: string };
  thanks: { heading: string; items: { id: string; label: string }[]; next: string };
};

const en: SamplePackCopy = {
  heading: 'Free sample pack: one storybook, one activity page and one lesson plan.',
  name: 'Your name (optional)',
  contact: 'Zalo number or email',
  childAge: 'Child’s age (optional)',
  consent: 'Send me the sample and occasional updates. Unsubscribe any time.',
  privacy: 'We keep your contact only to send the sample and these updates.',
  privacyLink: 'Privacy notice',
  submit: 'Send me the sample pack',
  sending: 'Sending…',
  errors: {
    contact: 'Enter a Zalo number or an email.',
    consent: 'Tick the box so we can send the sample.',
    failed: 'That didn’t send. Please try again, or message Mr. Jay on Zalo.',
  },
  thanks: {
    heading: 'Thank you. Here is your sample pack:',
    items: [
      { id: 'story-club', label: 'Storybook' },
      { id: 'printable-pack', label: 'Activity page' },
      { id: 'teacher-pack-l1', label: 'Lesson plan' },
    ],
    next: 'Book Story Club on Zalo',
  },
};

const vi: SamplePackCopy = {
  heading: 'Bộ mẫu miễn phí: 1 truyện, 1 trang bài tập và 1 giáo án.',
  name: 'Tên của bạn (không bắt buộc)',
  contact: 'Số Zalo hoặc email',
  childAge: 'Tuổi của con (không bắt buộc)',
  consent: 'Gửi cho tôi bộ mẫu và thỉnh thoảng cập nhật. Có thể hủy bất cứ lúc nào.',
  privacy: 'Chúng tôi chỉ giữ thông tin liên hệ để gửi bộ mẫu và các cập nhật này.',
  privacyLink: 'Chính sách quyền riêng tư',
  submit: 'Gửi bộ mẫu cho tôi',
  sending: 'Đang gửi…',
  errors: {
    contact: 'Vui lòng nhập số Zalo hoặc email.',
    consent: 'Vui lòng đánh dấu ô đồng ý để chúng tôi gửi bộ mẫu.',
    failed: 'Chưa gửi được. Vui lòng thử lại, hoặc nhắn thầy Jay qua Zalo.',
  },
  thanks: {
    heading: 'Cảm ơn bạn. Đây là bộ mẫu của bạn:',
    items: [
      { id: 'story-club', label: 'Truyện' },
      { id: 'printable-pack', label: 'Trang bài tập' },
      { id: 'teacher-pack-l1', label: 'Giáo án' },
    ],
    next: 'Đăng ký giữ chỗ qua Zalo',
  },
};

export const samplePackContent: Record<Locale, SamplePackCopy> = { en, vi };

// A Zalo number (Vietnamese mobile, 9–11 digits with an optional +84) or an email. Shared with /api/sample-pack.
export function contactKind(value: string): 'email' | 'zalo' | null {
  const v = value.trim();
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length <= 254) return 'email';
  const digits = v.replace(/[\s().-]/g, '');
  if (/^\+?\d{9,15}$/.test(digits)) return 'zalo';
  return null;
}

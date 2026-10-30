import type { Locale } from '../locales';
import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';

// The one lead capture (website assessment, 27 Oct 2026, lead-capture spec): a free sample pack for a Zalo number or an
// email. The offer and consent lines are the assessment's validated EN/VI copy; the form chrome is short and plain.
// The pack is the existing view-only samples on /products (no PDF): a storybook (Story Club), an activity page
// (Printable Pack) and a lesson plan (Level 1 Teacher Pack), plus the Live Speaking Baseline's sample report (master).
export type SamplePackCopy = {
  heading: string;
  name: string;
  phone: string;
  email: string;
  contactConsent: string;
  childAge: string;
  teacher: string;
  consent: string;
  privacy: string;
  privacyLink: string;
  submit: string;
  sending: string;
  errors: { contact: string; phone: string; email: string; consent: string; failed: string };
  thanks: { heading: string; items: { id: string; label: string }[]; next: string };
};

const en: SamplePackCopy = {
  heading: 'Free sample pack: one storybook, one activity page and one lesson plan.',
  name: 'Your name (optional)',
  phone: 'Zalo or phone number',
  email: 'Email (alternative)',
  contactConsent: 'Mr. Jay will contact you on Zalo or email about this request.',
  childAge: 'Child’s age (optional)',
  teacher: 'I’m a teacher',
  consent: 'Send me the sample and occasional updates. Unsubscribe any time.',
  privacy: 'We keep your contact only to send the sample and these updates.',
  privacyLink: 'Privacy notice',
  submit: 'Send me the sample pack',
  sending: 'Sending…',
  errors: {
    contact: 'Enter a Zalo number or an email.',
    phone: 'Enter a valid phone number for the selected country.',
    email: 'Enter a valid email address.',
    consent: 'Tick the box so we can send the sample.',
    failed: 'That didn’t send. Please try again, or message Mr. Jay on Zalo.',
  },
  thanks: {
    heading: 'Thank you. Here is your sample pack:',
    items: [
      { id: 'story-club', label: 'Storybook' },
      { id: 'printable-pack', label: 'Activity page' },
      { id: 'teacher-pack-l1', label: 'Lesson plan' },
      { id: 'baseline', label: 'Sample speaking report' },
    ],
    next: 'Book Story Club on Zalo',
  },
};

const vi: SamplePackCopy = {
  heading: 'Bộ mẫu miễn phí: 1 truyện, 1 trang bài tập và 1 giáo án.',
  name: 'Tên của bạn (không bắt buộc)',
  phone: 'Số Zalo / điện thoại',
  email: 'Email (phương án thay thế)',
  contactConsent: 'Thầy Jay sẽ liên hệ qua Zalo hoặc email về yêu cầu này.',
  childAge: 'Tuổi của con (không bắt buộc)',
  teacher: 'Tôi là giáo viên',
  consent: 'Gửi cho tôi bộ mẫu và thỉnh thoảng cập nhật. Có thể hủy bất cứ lúc nào.',
  privacy: 'Chúng tôi chỉ giữ thông tin liên hệ để gửi bộ mẫu và các cập nhật này.',
  privacyLink: 'Chính sách quyền riêng tư',
  submit: 'Gửi bộ mẫu cho tôi',
  sending: 'Đang gửi…',
  errors: {
    contact: 'Vui lòng nhập số Zalo hoặc email.',
    phone: 'Vui lòng nhập số điện thoại hợp lệ theo quốc gia đã chọn.',
    email: 'Vui lòng nhập địa chỉ email hợp lệ.',
    consent: 'Vui lòng đánh dấu ô đồng ý để chúng tôi gửi bộ mẫu.',
    failed: 'Chưa gửi được. Vui lòng thử lại, hoặc nhắn thầy Jay qua Zalo.',
  },
  thanks: {
    heading: 'Cảm ơn bạn. Đây là bộ mẫu của bạn:',
    items: [
      { id: 'story-club', label: 'Truyện' },
      { id: 'printable-pack', label: 'Trang bài tập' },
      { id: 'teacher-pack-l1', label: 'Giáo án' },
      { id: 'baseline', label: 'Báo cáo Nói mẫu' },
    ],
    next: 'Đăng ký giữ chỗ qua Zalo',
  },
};

export const samplePackContent: Record<Locale, SamplePackCopy> = { en, vi };

// Accept a valid number entered for the selected country; persist only canonical E.164.
export function normalizePhoneNumber(value: string, country: CountryCode = 'VN'): string | null {
  const parsed = value.trim().startsWith('+')
    ? parsePhoneNumberFromString(value)
    : parsePhoneNumberFromString(value, country);
  return parsed?.isValid() ? parsed.number : null;
}

/** Backwards-compatible Vietnam default used by existing forms and server validation. */
export function normalizeVietnamesePhone(value: string, options: { assumeVietnameseCountryCode?: boolean } = {}): string | null {
  void options;
  return normalizePhoneNumber(value, 'VN');
}

export function isValidContactEmail(value: string): boolean {
  const email = value.trim();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function sampleContactError(phone: string, email: string): 'contact' | 'phone' | 'email' | null {
  const hasPhone = phone.trim().length > 0;
  const hasEmail = email.trim().length > 0;
  if (!hasPhone && !hasEmail) return 'contact';
  if (hasPhone && !normalizePhoneNumber(phone)) return 'phone';
  if (hasEmail && !isValidContactEmail(email)) return 'email';
  return null;
}

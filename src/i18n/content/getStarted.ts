import type { Locale } from '../locales';

const enGetStartedContent = {
  badge: 'Get Started',
  title: 'Start the Jurassic English conversation.',
  intro:
    'This intake form helps us route your enquiry to the right pathway for teacher training, school licensing, curriculum review, academic consulting, or institutional partnership discussions.',
  audienceCards: [
    'For schools, academies, educators, and institutional partners',
    'Takes around 3 minutes to complete',
    'Choose the path that best matches your implementation goal',
    'Reviewed by the Jurassic English team for the next best response',
  ],
  professionalIntakeTitle: 'Professional intake only',
  professionalIntakeBody:
    'We collect only the information needed to respond to your enquiry and recommend the most appropriate offer path for your institution or team.',
  successTitle: 'Enquiry received',
  successBody:
    'Thank you. We’ve received your {{interest}} enquiry and will review it shortly.',
  submissionReference: 'Submission reference',
  urgentContact: 'If your request is urgent, you can also contact',
  formTitle: 'Institutional intake form',
  formIntro:
    'Select the offer path that best fits your current goal, then add the context we need to respond accurately.',
} as const;

const viGetStartedContent = {
  badge: 'Bắt đầu',
  title: 'Bắt đầu cuộc trao đổi cùng Jurassic English.',
  intro:
    'Biểu mẫu này giúp chúng tôi chuyển yêu cầu của bạn đến đúng lộ trình cho đào tạo giáo viên, cấp phép cho trường, rà soát chương trình, tư vấn học thuật hoặc thảo luận hợp tác tổ chức.',
  audienceCards: [
    'Dành cho trường học, học viện, nhà giáo dục và đối tác tổ chức',
    'Mất khoảng 3 phút để hoàn thành',
    'Chọn lộ trình phù hợp nhất với mục tiêu triển khai của bạn',
    'Được đội ngũ Jurassic English xem xét để đưa ra phản hồi phù hợp nhất',
  ],
  professionalIntakeTitle: 'Biểu mẫu tiếp nhận chuyên nghiệp',
  professionalIntakeBody:
    'Chúng tôi chỉ thu thập thông tin cần thiết để phản hồi yêu cầu của bạn và đề xuất lộ trình phù hợp nhất cho tổ chức hoặc đội ngũ của bạn.',
  successTitle: 'Đã nhận yêu cầu',
  successBody:
    'Cảm ơn bạn. Chúng tôi đã nhận yêu cầu {{interest}} của bạn và sẽ sớm xem xét.',
  submissionReference: 'Mã tham chiếu',
  urgentContact: 'Nếu yêu cầu của bạn khẩn cấp, bạn cũng có thể liên hệ',
  formTitle: 'Biểu mẫu tiếp nhận cho tổ chức',
  formIntro:
    'Hãy chọn lộ trình phù hợp nhất với mục tiêu hiện tại của bạn, sau đó bổ sung bối cảnh cần thiết để chúng tôi phản hồi chính xác.',
} as const;

const getStartedContentByLocale: Record<Locale, typeof enGetStartedContent> = {
  en: enGetStartedContent,
  vi: viGetStartedContent,
};

export function getGetStartedContent(locale: Locale) {
  return getStartedContentByLocale[locale];
}

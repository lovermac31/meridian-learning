import type { Locale } from '../locales';
import type { DeepWiden } from './types';

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
  pilotAccess: {
    title: 'Pilot access request',
    intro:
      'Use this version of Get Started to request the full pilot pack, a reporting sample, a readiness checklist, or a pilot consultation. The public pilot page remains open; this step helps us route sensitive implementation materials to the right institutional contact.',
    panelTitle: 'What can be sent after review',
    panelItems: [
      'Full pilot overview pack',
      'Implementation scope overview',
      'Reporting sample / executive summary sample',
      'Pilot readiness checklist',
      'Detailed institutional programme pack',
    ],
    accessTypeLabel: 'Desired access type',
    accessTypePlaceholder: 'Select the materials or next step you want',
    challengeLabel: 'Current curriculum challenge',
    successLabel: 'Primary pilot goal / KPI priority',
    notesLabel: 'Additional access context',
    submitLabel: 'Request Pilot Access',
    successBody:
      'Thank you. We’ve received your pilot access request and will review the institutional context before sending the appropriate next-step materials or consultation details.',
  },
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
  pilotAccess: {
    title: 'Yêu cầu truy cập thí điểm',
    intro:
      'Dùng phiên bản này của Get Started để yêu cầu bộ tài liệu thí điểm đầy đủ, mẫu báo cáo, danh sách kiểm tra sẵn sàng hoặc tư vấn thí điểm.',
    panelTitle: 'Tài liệu có thể được gửi sau khi xem xét',
    panelItems: [
      'Bộ tài liệu tổng quan thí điểm đầy đủ',
      'Tổng quan phạm vi triển khai',
      'Mẫu báo cáo / mẫu tóm tắt điều hành',
      'Danh sách kiểm tra sẵn sàng thí điểm',
      'Bộ tài liệu chương trình dành cho tổ chức',
    ],
    accessTypeLabel: 'Loại truy cập mong muốn',
    accessTypePlaceholder: 'Chọn tài liệu hoặc bước tiếp theo bạn muốn',
    challengeLabel: 'Thách thức chương trình hiện tại',
    successLabel: 'Mục tiêu thí điểm / ưu tiên KPI chính',
    notesLabel: 'Bối cảnh truy cập bổ sung',
    submitLabel: 'Yêu cầu truy cập thí điểm',
    successBody:
      'Cảm ơn bạn. Chúng tôi đã nhận yêu cầu truy cập thí điểm và sẽ xem xét bối cảnh tổ chức trước khi gửi tài liệu hoặc thông tin tư vấn phù hợp.',
  },
} as const;

type GetStartedContent = DeepWiden<typeof enGetStartedContent>;

const getStartedContentByLocale: Record<Locale, GetStartedContent> = {
  en: enGetStartedContent,
  vi: viGetStartedContent,
};

export function getGetStartedContent(locale: Locale) {
  return getStartedContentByLocale[locale];
}

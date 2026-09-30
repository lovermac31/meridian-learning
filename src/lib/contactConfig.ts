/**
 * WorldWise Learning contact configuration.
 *
 * IMPORTANT — before releasing any /vi/ institutional page:
 * Replace WORLDWISE_ZALO_NUMBER with the confirmed Vietnam mobile number.
 * Format: digits only, no + prefix (e.g. '84901234567' for +84 90 123 4567).
 */
export const WORLDWISE_ZALO_NUMBER = '0000000000'; // PLACEHOLDER — confirm before release

export const WORLDWISE_ZALO_HREF = `https://zalo.me/${WORLDWISE_ZALO_NUMBER}`;

/**
 * Canonical WorldWise Learning website. `www` is the canonical host (the apex
 * redirects to it). Every outbound link to the parent organisation uses this
 * constant — never hard-code the URL at a call site.
 */
export const WORLDWISE_SITE_URL = 'https://www.worldwiselearning.app';

/**
 * Public website-feedback form (Google Forms, EN + VI, no sign-in). This is the
 * responder URL only — never put the form's edit link or the response Sheet here.
 */
export const WEBSITE_FEEDBACK_FORM_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScuegS45WpBqWABRUpDTFQ1CgMpVulr0f0vNnRgbBOBnHAFUw/viewform';

/**
 * Vietnamese institutional CTA copy.
 * Authored for institutional decision-makers and procurement leads.
 */
export const VI_CTA = {
  /** Primary enquiry action — replaces "Book a Discovery Call" in Vietnamese pages. */
  primaryEnquiry: 'Gửi yêu cầu tư vấn',

  /** Primary audit action — replaces "Request an Audit Sprint" in Vietnamese pages. */
  primaryAudit: 'Yêu cầu Kiểm toán Chương trình',

  /** Zalo secondary CTA — sits below the primary button on all Vietnamese institutional pages. */
  zaloLabel: 'Liên hệ qua Zalo',

  /** Tertiary text-link CTA — replaces "Request a Curriculum Overview". */
  curriculumOverview: 'Xem tổng quan chương trình',

  /**
   * Note displayed below the CTA block.
   * Addresses the committee-review expectation of Vietnamese institutional buyers.
   */
  enquiryNote:
    'Mọi yêu cầu tư vấn đều được đội ngũ học thuật của WorldWise Learning xem xét và phản hồi trong vòng hai ngày làm việc.',
} as const;

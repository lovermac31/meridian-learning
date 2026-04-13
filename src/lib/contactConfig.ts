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

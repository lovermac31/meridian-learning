import type { NormalizedGetStartedSubmission } from '../src/lib/getStartedSchema';

type NotificationResult =
  | { status: 'sent' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

function formatSubmissionBody(submission: NormalizedGetStartedSubmission) {
  const lines = [
    `Submission ID: ${submission.submissionId}`,
    `Submitted At: ${submission.submittedAt}`,
    `Primary Interest: ${submission.primaryInterest}`,
    `Organization Name: ${submission.organizationName}`,
    `Organization Type: ${submission.organizationType}`,
    `Full Name: ${submission.fullName}`,
    `Work Email: ${submission.workEmail}`,
    `Contact Consent: ${submission.contactConsent ? 'Yes' : 'No'}`,
    `Newsletter Opt-In: ${submission.newsletterOptIn ? 'Yes' : 'No'}`,
    `Role / Title: ${submission.roleTitle || 'Not provided'}`,
    `Country / Region: ${submission.countryRegion || 'Not provided'}`,
    `Age Range: ${submission.ageRange || 'Not provided'}`,
    `Learner Count: ${submission.learnerCount || 'Not provided'}`,
    `Standards Context: ${submission.standardsContext || 'Not provided'}`,
    `Timeline: ${submission.timeline || 'Not provided'}`,
    `Decision Stage: ${submission.decisionStage || 'Not provided'}`,
    '',
    'Challenge:',
    submission.challenge,
    '',
    'Success Definition:',
    submission.successDefinition || 'Not provided',
    '',
    'Additional Notes:',
    submission.notes || 'Not provided',
  ];

  return lines.join('\n');
}

export async function sendGetStartedNotification(
  submission: NormalizedGetStartedSubmission
): Promise<NotificationResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail = process.env.GET_STARTED_NOTIFY_EMAIL;
  const fromEmail = process.env.GET_STARTED_FROM_EMAIL || 'Jurassic English <onboarding@jurassicenglish.com>';

  if (!resendApiKey || !notifyEmail) {
    return {
      status: 'skipped',
      reason: 'Notification transport is not configured.',
    };
  }

  const subject = `[Get Started] ${submission.primaryInterest} · ${submission.organizationName}`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notifyEmail],
        reply_to: submission.workEmail,
        subject,
        text: formatSubmissionBody(submission),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: 'failed',
        reason: `Resend request failed: ${response.status} ${errorText}`,
      };
    }

    return { status: 'sent' };
  } catch (error: any) {
    return {
      status: 'failed',
      reason: error?.message || 'Unknown notification transport error.',
    };
  }
}

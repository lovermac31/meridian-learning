import type { NormalizedPricingRegistration } from '../src/lib/pricingRegistrationSchema';

type NotificationResult =
  | { status: 'sent' }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };

function formatRegistrationBody(registration: NormalizedPricingRegistration) {
  const lines = [
    'Form Type: Plans & Pricing pre-launch registration',
    `Registration ID: ${registration.submissionId}`,
    `Submitted At: ${registration.submittedAt}`,
    '',
    `Full Name: ${registration.fullName}`,
    `Work Email: ${registration.workEmail}`,
    `Role / Title: ${registration.roleTitle}`,
    `Organisation / School / Company: ${registration.organizationName}`,
    `Country / Region: ${registration.countryRegion}`,
    `Buyer Type: ${registration.buyerType}`,
    `Main Area of Interest: ${registration.interestArea}`,
    `Organisation Size / Learner Range: ${registration.organizationSize || 'Not provided'}`,
    `Phone / WhatsApp: ${registration.phoneWhatsapp || 'Not provided'}`,
    `Preferred Contact Method: ${registration.preferredContactMethod || 'Not provided'}`,
    `Timeline / Implementation Horizon: ${registration.timeline || 'Not provided'}`,
    '',
    'Message / Notes:',
    registration.message || 'Not provided',
  ];

  return lines.join('\n');
}

export async function sendPricingRegistrationNotification(
  registration: NormalizedPricingRegistration
): Promise<NotificationResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const notifyEmail =
    process.env.PRICING_NOTIFY_EMAIL ||
    process.env.GET_STARTED_NOTIFY_EMAIL ||
    'info@jurassicenglish.com';
  const fromEmail =
    process.env.PRICING_FROM_EMAIL ||
    process.env.GET_STARTED_FROM_EMAIL ||
    'Jurassic English <onboarding@jurassicenglish.com>';

  if (!resendApiKey) {
    return {
      status: 'skipped',
      reason: 'Notification transport is not configured.',
    };
  }

  const subject = `Jurassic English — Plans & Pricing Pre-Launch Registration · ${registration.organizationName}`;

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
        reply_to: registration.workEmail,
        subject,
        text: formatRegistrationBody(registration),
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

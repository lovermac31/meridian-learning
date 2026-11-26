export const GO_CAMPAIGNS = ['gulf-ielts-test-1'] as const;

export const GO_DESTINATIONS = {
  kofi: 'https://ko-fi.com/s/a65482a4e9',
  calendly: 'https://calendly.com/jay71adams/ielts-speaking-baseline-20-min-paid-us-27',
} as const;

export const GO_UTM = { source: 'gulf', medium: 'paid_social' } as const;

// Only known public hosts may enter logs; arbitrary subdomains can contain PII.
export const GO_REF_HOSTS = [
  'jurassicenglish.com', 'www.jurassicenglish.com',
  'facebook.com', 'www.facebook.com', 'm.facebook.com', 'l.facebook.com', 'lm.facebook.com',
  'instagram.com', 'www.instagram.com', 'l.instagram.com',
  't.co', 'linkedin.com', 'www.linkedin.com', 'google.com', 'www.google.com',
] as const;

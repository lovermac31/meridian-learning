export const GO_CAMPAIGNS = ['gulf-ielts-test-1'] as const;

export const GO_DESTINATIONS = {
  kofi: 'https://ko-fi.com/s/a65482a4e9',
  calendly: 'https://calendly.com/jay71adams/ielts-speaking-baseline-20-min-paid-us-27',
} as const;

// Where the link was shared. Anything else is stored as "direct".
// "test" is for our own smoke checks and is excluded from counts.
export const GO_SOURCES = ['linkedin', 'facebook', 'wechat', 'dm', 'email', 'poster', 'test'] as const;

// The Gulf posts are organic, not paid ads.
export const GO_MEDIUM = 'social';

// Product ids stored with each click, so Gulf clicks never mix with product-card checkout_start events.
export const GO_PRODUCT_IDS = {
  kofi: 'gulf-baseline-kofi',
  calendly: 'gulf-baseline-calendly',
} as const;

// Only known public hosts may enter logs; arbitrary subdomains can contain PII.
export const GO_REF_HOSTS = [
  'jurassicenglish.com', 'www.jurassicenglish.com',
  'facebook.com', 'www.facebook.com', 'm.facebook.com', 'l.facebook.com', 'lm.facebook.com',
  'instagram.com', 'www.instagram.com', 'l.instagram.com',
  't.co', 'linkedin.com', 'www.linkedin.com', 'google.com', 'www.google.com',
] as const;

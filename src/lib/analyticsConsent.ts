/** Optional telemetry is off until an explicit, current first-party choice. */
export const CONSENT_KEY = 'je-analytics-consent-v1';
export const CONSENT_EVENT = 'je:analytics-consent';
export type AnalyticsConsent = 'accepted' | 'rejected' | null;
const MAX_AGE = 180 * 24 * 60 * 60 * 1000;
let sessionChoice: AnalyticsConsent = null;
export function readAnalyticsConsent(): AnalyticsConsent {
  if (typeof window === 'undefined') return null;
  if (sessionChoice !== null) return sessionChoice;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return sessionChoice;
    const saved = JSON.parse(raw);
    const age = Date.now() - saved.at;
    return saved.version === 1 && Number.isFinite(age) && age >= 0 && age < MAX_AGE &&
      (saved.choice === 'accepted' || saved.choice === 'rejected') ? saved.choice : null;
  } catch { return sessionChoice; }
}
export function analyticsAllowed(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return readAnalyticsConsent() === 'accepted' && navigator.doNotTrack !== '1' &&
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl !== true;
}
export function saveAnalyticsConsent(choice: Exclude<AnalyticsConsent, null>): void {
  if (typeof window === 'undefined' || !['accepted', 'rejected'].includes(choice)) return;
  sessionChoice = choice;
  try { window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: 1, choice, at: Date.now() })); sessionChoice = null; }
  catch { /* Explicit choice applies to this page only if storage is unavailable. */ }
  window.dispatchEvent(new Event(CONSENT_EVENT));
}
/**
 * Cookie-free, anonymous counting (Vercel Analytics, Speed Insights and the click events sent through them): on by default,
 * with no banner. It sets no cookies, stores no identifier and sends no personal data. It stays off for Do Not Track, Global
 * Privacy Control and for anyone who already chose "Reject analytics" in the earlier banner. Cookie-based Google Analytics
 * still needs the explicit opt-in above (analyticsAllowed) and is no longer offered, so it stays off.
 */
export function countingAllowed(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  return readAnalyticsConsent() !== 'rejected' && navigator.doNotTrack !== '1' &&
    (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl !== true;
}
/** SDK middleware is evaluated at send time, including after a withdrawal. */
export function consentBeforeSend<T>(event: T): T | null {
  return countingAllowed() ? event : null;
}

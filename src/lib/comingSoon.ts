/**
 * Site-wide "Coming soon" toast trigger. Any option that is announced but not available yet calls
 * showComingSoon(label) instead of navigating, disabling, or opening a page — one small, temporary,
 * consistent message everywhere. Rendered by <ComingSoonToast/> (mounted once in App).
 */
export const COMING_SOON_EVENT = 'je:coming-soon';

export function showComingSoon(label?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(COMING_SOON_EVENT, { detail: { label } }));
}

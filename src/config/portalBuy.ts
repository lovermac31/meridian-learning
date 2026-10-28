/**
 * Portal Buy Feature Flags & URL Generator
 * ─────────────────────────────────────────────────────────────────────────────
 * Step 11 of the Portal Go-Live Runbook.
 * Per-product flag map that enables direct checkout on https://my.jurassicenglish.com/buy
 * Defaults to false for EVERY product so existing Zalo ordering is untouched.
 */

export const PORTAL_BUY_FLAGS: Record<string, boolean> = {
  'story-club': false,
  'baseline': false,
  'one-to-one': false,
  'printable-pack': false,
  'parent-pack-l1': false,
  'parent-pack-l2': false,
  'parent-pack-l3': false,
  'holiday-reading-challenge': false,
  'teacher-pack-l1': false,
  'teacher-pack-l2': false,
  'teacher-pack-l3': false,
  'teacher-pack-l4': false,
  'teacher-pack-l5': false,
  'teacher-bundle': false,
  'student-workbook-l1': false,
  'student-workbook-l2': false,
  'student-workbook-l3': false,
  'student-workbook-l4': false,
  'student-workbook-l5': false,
  'word-fossil-flashcards-l1': false,
  'thinking-cycle-set': false,
  'thinking-cycle-posters': false,
  'reasoning-assessment-kit': false,
  'centre-licence': false,
  'teacher-training-course': false,
  'pilot-class-kit': false,
  'curriculum-overview': false,
  'ielts-speaking-ladder': false,
  'ielts-one-to-one-starter': false,
  'ielts-cue-card-bank': false,
  'writing-baseline': false,
  'ielts-writing-ladder-task2': false,
  'ielts-writing-task1-method': false,
  'ielts-essay-bank-task2': false,
  'ielts-writing-teacher-pack': false,
};

export function isPortalBuyEnabled(productId: string): boolean {
  return Boolean(PORTAL_BUY_FLAGS[productId]);
}

export function setPortalBuyEnabled(productId: string, enabled: boolean): void {
  PORTAL_BUY_FLAGS[productId] = enabled;
}

export function getPortalBuyUrl(productId: string, lang: 'vi' | 'en' | string): string {
  const normalizedLang = lang === 'vi' ? 'vi' : 'en';
  return `https://my.jurassicenglish.com/buy?sku=${encodeURIComponent(productId)}&lang=${normalizedLang}&ref=site`;
}

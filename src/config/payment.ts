import { PRODUCTS } from '../i18n/content/products';
import type { Locale } from '../i18n/locales';

const PRODUCT_MEMO_CODES: Record<string, string> = {
  'printable-pack': 'PR03',
  'parent-pack-l1': 'PR04',
  'parent-pack-l2': 'PR05',
  'parent-pack-l3': 'PR06',
  'holiday-reading-challenge': 'PR07',
  'teacher-pack-l1': 'PR08',
  'teacher-pack-l2': 'PR09',
  'teacher-pack-l3': 'PR0A',
  'teacher-pack-l4': 'PR0B',
  'teacher-pack-l5': 'PR0C',
  'teacher-bundle': 'PR0D',
  'student-workbook-l1': 'PR0E',
  'student-workbook-l2': 'PR0F',
  'student-workbook-l3': 'PR0G',
  'student-workbook-l4': 'PR0H',
  'student-workbook-l5': 'PR0I',
  'word-fossil-flashcards-l1': 'PR0J',
  'thinking-cycle-set': 'PR0K',
  'thinking-cycle-posters': 'PR0L',
  'reasoning-assessment-kit': 'PR0M',
  'centre-licence': 'PR0N',
  'teacher-training-course': 'PR0O',
  'pilot-class-kit': 'PR0P',
  'curriculum-overview': 'PR0Q',
  'ielts-speaking-ladder': 'PR0R',
  'ielts-one-to-one-starter': 'PR0S',
  'ielts-cue-card-bank': 'PR0T',
  'writing-baseline': 'PR0U',
  'ielts-writing-ladder-task2': 'PR0V',
  'ielts-writing-task1-method': 'PR0W',
  'ielts-essay-bank-task2': 'PR0X',
  'ielts-writing-teacher-pack': 'PR0Y',
};

// The pack total is already published in the catalogue; keep it tied to that copy.
export const PAID_OFFERS = PRODUCTS.map(product => ({
  id: product.id,
  amount: Number((product.id === 'one-to-one'
    ? product.en.unit.match(/8 lessons ([\d.]+)₫/)![1]
    : product.price).replace(/[^0-9]/g, '')),
  prefix: product.id === 'story-club' ? 'SC' : product.id === 'baseline' ? 'BL' : product.id === 'one-to-one' ? '1T'
    : PRODUCT_MEMO_CODES[product.id],
  title: product,
}));
export type PaidOffer = typeof PAID_OFFERS[number];
export const paidOffer = (id: string) => PAID_OFFERS.find(offer => offer.id === id);
export const paymentHref = (id: string, locale: Locale) => id === 'story-club' ? `${locale === 'en' ? '/en' : ''}/story-club/reserve` : `${locale === 'vi' ? '/vi' : ''}/products/${encodeURIComponent(id)}?checkout=1`;
export const paymentAmount = (amount: number, locale: Locale) => `${new Intl.NumberFormat(locale === 'vi' ? 'vi-VN' : 'en-US').format(amount)}₫`;
export const reserveCta = (locale: Locale) => locale === 'vi' ? 'Đặt chỗ Story Club · 590.000₫' : 'Reserve Story Club · 590,000₫';
export const buyCta = (id: string, locale: Locale) => id === 'story-club' ? reserveCta(locale) : `${locale === 'vi' ? 'Đặt ngay' : 'Buy now'} · ${paymentAmount(paidOffer(id)!.amount, locale)}${id === 'one-to-one' ? (locale === 'vi' ? ' · 8 buổi' : ' · 8 lessons') : ''}`;

// Public receiving details, never credentials. Explicit empty config disables the dynamic QR.
const env = (import.meta as ImportMeta & { env?: Record<string, string> }).env ?? {};
export const BANK_CONFIG = {
  bank: env.VITE_VIETQR_BANK ?? 'MBBank',
  account: env.VITE_VIETQR_ACCOUNT_NO ?? '0269494315526',
  name: env.VITE_VIETQR_ACCOUNT_NAME ?? 'ADAMS NATHANIEL JAY',
};
export const STATIC_QR = '/assets/pay/vietqr-story-club.png';
export function paymentQrUrl(amount: number, memo: string, config = BANK_CONFIG): string | null {
  if (!/^[A-Za-z0-9]+$/.test(config.bank) || !/^\d{6,20}$/.test(config.account) || !config.name.trim()) return null;
  if (!Number.isSafeInteger(amount) || amount <= 0 || !/^(SC|BL|1T|PR[A-Z0-9]{2})-[A-Z0-9]{6}$/.test(memo)) throw new Error('Invalid payment instructions');
  return `https://qr.sepay.vn/img?${new URLSearchParams({ acc: config.account, bank: config.bank, amount: String(amount), des: memo })}`;
}

export function canonicalPaymentMemo(content: unknown): string | null {
  if (typeof content !== 'string' || content.length > 2000) return null;
  const prefixes = PAID_OFFERS.map(offer => offer.prefix).join('|');
  const match = new RegExp(`(?:^|[^A-Z0-9])(${prefixes})[-\\s]?([A-Z0-9]{6})(?![A-Z0-9])`, 'i').exec(content);
  return match ? `${match[1].toUpperCase()}-${match[2].toUpperCase()}` : null;
}

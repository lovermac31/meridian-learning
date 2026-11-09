import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { _setLemonSqueezyCheckouts, anyLemonSqueezy, isLemonSqueezyEnabled, lemonSqueezyHref, parseLemonSqueezyCheckouts } from '../src/config/lemonSqueezy';
import { ProductsPage } from '../src/components/ProductsPage';
import { ProductPage } from '../src/components/ProductPage';
import { Footer } from '../src/components/Footer';
import { PRODUCTS } from '../src/i18n/content/products';
import { setServerLocation } from '../src/lib/ssrLocation';
import handler, { _resetLemonSqueezyWebhook, summarizeLemonSqueezyEvent, verifyLemonSqueezySignature } from '../api/lemonsqueezy-webhook.js';
import { _resetPaymentAlerts } from '../api/_lib/paymentAlert.js';

// Lemon Squeezy card / Alipay / WeChat payments (Jay + CEO, 2 Nov 2026). Phase 1: a hosted-checkout link on English
// digital product pages, hidden unless the product's URL is configured, order reference and first-touch utm in the
// checkout custom data. Phase 2: a signed webhook that never crashes on load, is idempotent and alerts the owner.
// Mocks only: no real checkout, webhook or email.

const CUE = 'https://jurassicenglish.lemonsqueezy.com/checkout/buy/11111111-2222-3333-4444-555555555555';
const amp = (s: string) => s.replaceAll('&amp;', '&');

test('config: only https lemonsqueezy.com URLs for digital products survive; services never get a checkout', () => {
  const raw = JSON.stringify({
    'ielts-cue-card-bank': CUE, 'story-club': CUE, baseline: CUE, 'one-to-one': CUE, 'writing-baseline': CUE, 'centre-licence': CUE,
    'teacher-pack-l1': 'http://jurassicenglish.lemonsqueezy.com/x', 'parent-pack-l1': 'https://evil.example/checkout', 'thinking-cycle-set': 42,
  });
  assert.deepEqual(parseLemonSqueezyCheckouts(raw), { 'ielts-cue-card-bank': CUE });
  assert.deepEqual(parseLemonSqueezyCheckouts('not json'), {});
  assert.deepEqual(parseLemonSqueezyCheckouts(undefined), {});
  // Every eligible product is a digital download with PayPal already; the five services are excluded by data.
  const eligible = PRODUCTS.filter((p) => p.paypal).map((p) => p.id);
  assert.equal(eligible.length, 41); // 30, the five Story Workbooks, the IELTS Reading and Listening packs (3 Nov 2026) and the three IELTS bundles (5 Nov 2026)
  for (const id of ['story-club', 'baseline', 'one-to-one', 'writing-baseline', 'centre-licence']) assert.ok(!eligible.includes(id), id);
});

test('config: the checkout link carries order_ref, product id, first-touch utm and an optional prefilled email', () => {
  const href = new URL(lemonSqueezyHref('ielts-cue-card-bank', CUE, { source: 'fb-teachers', touch: { utm_source: 'facebook', utm_medium: 'group', utm_campaign: 'vn-groups-2026-11', utm_content: 'mon-g1' }, email: 'buyer@example.test' }));
  assert.equal(href.origin + href.pathname, CUE);
  assert.equal(href.searchParams.get('checkout[custom][order_ref]'), 'ielts-cue-card-bank|FBT');
  assert.equal(href.searchParams.get('checkout[custom][product_id]'), 'ielts-cue-card-bank');
  assert.equal(href.searchParams.get('checkout[custom][utm_source]'), 'facebook');
  assert.equal(href.searchParams.get('checkout[custom][utm_campaign]'), 'vn-groups-2026-11');
  assert.equal(href.searchParams.get('checkout[custom][utm_content]'), 'mon-g1');
  assert.equal(href.searchParams.get('checkout[email]'), 'buyer@example.test');
  const plain = new URL(lemonSqueezyHref('ielts-cue-card-bank', CUE, { source: null, touch: null, email: 'not an email' }));
  assert.equal(plain.searchParams.get('checkout[custom][order_ref]'), 'ielts-cue-card-bank|IELTS-CUE-CARD-BANK');
  assert.equal(plain.searchParams.get('checkout[email]'), null);
  assert.equal(plain.searchParams.get('checkout[custom][utm_source]'), null);
});

test('pages: no button and no footer line until a URL is configured; then EN pages only, digital cards only, one order CTA still', () => {
  try {
    _setLemonSqueezyCheckouts({});
    assert.equal(anyLemonSqueezy(), false);
    for (const locale of ['en', 'vi'] as const) {
      setServerLocation(locale === 'vi' ? '/vi/products' : '/products');
      assert.doesNotMatch(renderToStaticMarkup(createElement(ProductsPage, { locale })), /lemonsqueezy/i, `${locale}: hidden by default`);
      assert.doesNotMatch(renderToStaticMarkup(createElement(Footer, { onNavigate: () => {} })), /Lemon Squeezy/, `${locale}: no footer line by default`);
    }
    _setLemonSqueezyCheckouts({ 'ielts-cue-card-bank': CUE });
    assert.equal(isLemonSqueezyEnabled('ielts-cue-card-bank'), true);
    setServerLocation('/products');
    const en = amp(renderToStaticMarkup(createElement(ProductsPage, { locale: 'en' })));
    const card = en.slice(en.indexOf('id="ielts-cue-card-bank"'), en.indexOf('</li>', en.indexOf('id="ielts-cue-card-bank"')));
    assert.match(card, /data-lemonsqueezy="ielts-cue-card-bank"/);
    assert.match(card, new RegExp(`<a href="${CUE.replace(/[.]/g, '\\.')}\\?checkout%5Bcustom%5D%5Border_ref%5D=ielts-cue-card-bank%7CIELTS-CUE-CARD-BANK[^"]*" target="_blank" rel="noopener noreferrer"[^>]*data-lemonsqueezy-link="ielts-cue-card-bank">Pay US\\$8 by card, Alipay or WeChat</a>`));
    assert.equal([...card.matchAll(/data-cta="/g)].length, 1, 'still one order CTA');
    assert.ok(card.indexOf('data-paypal="ielts-cue-card-bank"') < card.indexOf('data-lemonsqueezy="ielts-cue-card-bank"'), 'VietQR first, PayPal, then card');
    assert.doesNotMatch(en.slice(en.indexOf('id="ielts-speaking-ladder"'), en.indexOf('</li>', en.indexOf('id="ielts-speaking-ladder"'))), /lemonsqueezy/, 'a product without a URL shows nothing');
    const page = amp(renderToStaticMarkup(createElement(ProductPage, { product: PRODUCTS.find((p) => p.id === 'ielts-cue-card-bank')!, locale: 'en' })));
    assert.match(page, /data-lemonsqueezy="ielts-cue-card-bank"/);
    assert.match(page, /Processed by Lemon Squeezy, which emails your download link\./);
    assert.match(renderToStaticMarkup(createElement(Footer, { onNavigate: () => {} })), /data-lemonsqueezy-footer="">Card payments processed by Lemon Squeezy\.</);
    setServerLocation('/vi/products');
    assert.doesNotMatch(renderToStaticMarkup(createElement(ProductsPage, { locale: 'vi' })), /data-lemonsqueezy=/, 'VI pages keep VietQR + PayPal only');
    assert.match(renderToStaticMarkup(createElement(Footer, { onNavigate: () => {} })), /Thanh toán thẻ do Lemon Squeezy xử lý\./);
    // Claims: the LS markup promises nothing beyond what LS does (the page-wide sweep is tests/claims-safety.test.ts).
    assert.doesNotMatch(card.slice(card.indexOf('data-lemonsqueezy=')), /guarantee|instant access|lifetime/i);
  } finally {
    _setLemonSqueezyCheckouts({});
    setServerLocation('/');
  }
});

type Reply = { status: number; headers: Record<string, string> };
async function deliver(options: { method?: string; body?: string; signature?: string | null; secret?: string | null; notify?: boolean; resend?: 'ok' | 'fail' }) {
  const envNames = ['LEMONSQUEEZY_WEBHOOK_SECRET', 'SUPABASE_URL', 'SUPABASE_WRITE_KEY', 'RESEND_API_KEY', 'ORDER_NOTIFY_EMAIL', 'GET_STARTED_NOTIFY_EMAIL', 'GET_STARTED_FROM_EMAIL'] as const;
  const oldEnv = Object.fromEntries(envNames.map((n) => [n, process.env[n]]));
  const originalFetch = globalThis.fetch;
  const originalInfo = console.info;
  const originalWarn = console.warn;
  const emails: Array<Record<string, unknown>> = [];
  const rpcs: Array<Record<string, unknown>> = [];
  const logs: string[] = [];
  for (const n of envNames) delete process.env[n];
  if (options.secret !== null) process.env.LEMONSQUEEZY_WEBHOOK_SECRET = options.secret ?? 'synthetic-ls-signing-secret';
  Object.assign(process.env, { SUPABASE_URL: 'http://127.0.0.1:55421', SUPABASE_WRITE_KEY: 'sb_secret_synthetic', RESEND_API_KEY: 're_synthetic', GET_STARTED_FROM_EMAIL: 'alerts@example.test' });
  if (options.notify !== false) process.env.ORDER_NOTIFY_EMAIL = 'owner@example.test';
  globalThis.fetch = (async (input, init) => {
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
    if (String(input).startsWith('https://api.resend.com/')) { emails.push(body); return new Response('{}', { status: options.resend === 'fail' ? 500 : 200 }); }
    rpcs.push(body);
    return new Response('', { status: 200 });
  }) as typeof fetch;
  console.info = ((...args: unknown[]) => logs.push(JSON.stringify(args))) as typeof console.info;
  console.warn = ((...args: unknown[]) => logs.push(JSON.stringify(args))) as typeof console.warn;
  const reply: Reply = { status: 0, headers: {} };
  const res = { setHeader(k: string, v: string) { reply.headers[k] = v; return this; }, status(c: number) { reply.status = c; return this; }, json() { return this; } };
  const body = options.body ?? '';
  const signature = options.signature === undefined ? createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET ?? '').update(body).digest('hex') : options.signature;
  try {
    await handler({ method: options.method ?? 'POST', headers: signature === null ? {} : { 'x-signature': signature }, body, query: {} } as never, res as never);
    return { reply, emails, rpcs, logs };
  } finally {
    globalThis.fetch = originalFetch;
    console.info = originalInfo;
    console.warn = originalWarn;
    for (const n of envNames) oldEnv[n] === undefined ? delete process.env[n] : process.env[n] = oldEnv[n]!;
  }
}
const BUYER = 'SYNTHETIC-BUYER-MUST-NOT-APPEAR';
const order = (id: string, extra: Record<string, unknown> = {}, event = 'order_created') => JSON.stringify({
  meta: { event_name: event, custom_data: { order_ref: 'ielts-cue-card-bank|FBT', product_id: 'ielts-cue-card-bank', utm_source: 'facebook', utm_medium: 'group', utm_campaign: 'vn-groups-2026-11', utm_content: 'mon-g1' } },
  data: { type: 'orders', id, attributes: { order_number: 1042, status: 'paid', total: 1200, currency: 'USD', test_mode: true, user_name: BUYER, user_email: `${BUYER}@example.test`, ...extra } },
});

test.beforeEach(() => { _resetLemonSqueezyWebhook(); _resetPaymentAlerts(); });

test('webhook: GET answers 405 (probe-safe), no secret answers 503, a bad or missing signature answers 401, bad JSON 400', async () => {
  const get = await deliver({ method: 'GET', signature: null });
  assert.equal(get.reply.status, 405);
  assert.equal(get.reply.headers.Allow, 'POST');
  assert.equal((await deliver({ secret: null, body: order('1') })).reply.status, 503);
  assert.equal((await deliver({ body: order('1'), signature: 'deadbeef' })).reply.status, 401);
  assert.equal((await deliver({ body: order('1'), signature: null })).reply.status, 401);
  assert.equal((await deliver({ body: order('1'), signature: createHmac('sha256', 'other-secret').update(order('1')).digest('hex') })).reply.status, 401);
  assert.equal((await deliver({ body: '{not json' })).reply.status, 400);
  assert.equal(verifyLemonSqueezySignature('x', createHmac('sha256', 's').update('x').digest('hex'), 's'), true);
  assert.equal(verifyLemonSqueezySignature('x', 'zz', 's'), false);
});

test('webhook: a signed paid order answers 200, records one ls_order event, alerts the owner once with no buyer data, and ignores a re-delivery', async () => {
  const first = await deliver({ body: order('9001') });
  assert.equal(first.reply.status, 200);
  assert.equal(first.rpcs.length, 1);
  assert.equal(first.rpcs[0].p_event, 'ls_order');
  assert.equal(first.rpcs[0].p_product_id, 'ielts-cue-card-bank');
  assert.equal(first.rpcs[0].p_utm_campaign, 'vn-groups-2026-11');
  assert.equal(first.emails.length, 1);
  assert.equal(first.emails[0].subject, '[Payments] Lemon Squeezy paid: ielts-cue-card-bank|FBT (US$12.00)');
  assert.deepEqual(first.emails[0].to, ['owner@example.test']);
  assert.ok(String(first.emails[0].text).includes('Transaction: 9001'));
  assert.ok(!JSON.stringify(first.emails).includes(BUYER), 'no buyer name or email in the alert');
  assert.ok(!first.logs.join('\n').includes(BUYER), 'no buyer name or email in the logs');
  const again = await deliver({ body: order('9001') });
  assert.equal(again.reply.status, 200);
  assert.deepEqual(again.rpcs, [], 'duplicate: no second record');
  assert.deepEqual(again.emails, [], 'duplicate: no second email');
  // A pending (unpaid) order and a refund go to the owner as needs-review; an unknown event is ignored.
  const pending = await deliver({ body: order('9002', { status: 'pending' }) });
  assert.equal(pending.emails[0].subject, '[Payments] Lemon Squeezy needs review: ielts-cue-card-bank|FBT (US$12.00)');
  const refund = await deliver({ body: order('9001', {}, 'order_refunded') });
  assert.equal(refund.emails.length, 1);
  assert.deepEqual((await deliver({ body: order('9003', {}, 'subscription_created') })).emails, []);
  // Alert failure never changes the answer.
  const failed = await deliver({ body: order('9004'), resend: 'fail' });
  assert.equal(failed.reply.status, 200);
  const off = await deliver({ body: order('9005'), notify: false });
  assert.equal(off.reply.status, 200);
  assert.deepEqual(off.emails, []);
});

test('webhook: summary reads only order facts; the handler imports no src/ module; env names are documented, no secret values', () => {
  const s = summarizeLemonSqueezyEvent(JSON.parse(order('7')));
  assert.deepEqual([s.event, s.orderId, s.orderRef, s.productId, s.amount, s.status, s.testMode], ['order_created', '7', 'ielts-cue-card-bank|FBT', 'ielts-cue-card-bank', 'US$12.00', 'paid', true]);
  assert.ok(!JSON.stringify(s).includes(BUYER));
  const src = readFileSync('api/lemonsqueezy-webhook.ts', 'utf8');
  assert.doesNotMatch(src, /from '\.\.\/src\//);
  assert.match(src, /bodyParser: false/);
  const env = readFileSync('.env.example', 'utf8');
  assert.match(env, /^VITE_LEMONSQUEEZY_CHECKOUTS=/m);
  assert.match(env, /^LEMONSQUEEZY_WEBHOOK_SECRET="replace-me"/m);
  assert.match(readFileSync('.github/workflows/ai-speaking-health.yml', 'utf8'), /api\/lemonsqueezy-webhook/);
});

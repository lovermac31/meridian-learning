import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

// P5c (15 Nov 2026), muted (playwright.story-club-status.config.ts launches chromium with --mute-audio) and offline: every
// request that is not this dev server is aborted; sample-pack, the QR image and both status endpoints are intercepted.
// The init script shortens the 5 s poll delay (15 s is also the prepare-payment fetch timeout, so it is left alone).
const SCREENS = process.env.P5C_SCREENS_DIR ? resolve(process.env.P5C_SCREENS_DIR) : resolve('test-results/p5c-screens');
const FIXTURES = resolve('docs/qa/pay-everywhere/qr-fixtures');

type Status = 'waiting' | 'received' | 'underpaid' | 'overpaid';
async function setup(page: Page, options: { memo: string; product: string; ais: () => Status; sc?: () => 'waiting' | 'received' }) {
  const seen = { ais: [] as string[], sc: [] as string[] };
  await page.addInitScript(() => {
    const originalSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
      originalSetTimeout(handler, timeout === 5_000 ? 150 : timeout, ...args)) as typeof window.setTimeout;
  });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    // No real network: anything off this dev server (the QR host is fulfilled below), and every API call not mocked here.
    if (url.hostname !== '127.0.0.1' && url.hostname !== 'qr.sepay.vn') return route.abort();
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/go/') || url.pathname.startsWith('/ai-speaking/')) return route.abort();
    return route.fallback();
  });
  await page.route('**/api/event', route => route.fulfill({ status: 204 }));
  await page.route('**/api/sample-pack', route => {
    const body = route.request().postDataJSON();
    expect(body.product).toBe(options.product);
    return route.fulfill({ json: { ok: true, submissionId: `JE-X-${body.submissionKey}`, memo: options.memo } });
  });
  await page.route('https://qr.sepay.vn/img?**', route => {
    expect(new URL(route.request().url()).searchParams.get('des')).toBe(options.memo);
    return route.fulfill({ path: resolve(FIXTURES, 'printable-pack.png'), contentType: 'image/png' });
  });
  await page.route('**/ai-speaking/api/pay/status?**', route => {
    const url = new URL(route.request().url());
    expect(route.request().method()).toBe('GET');
    expect(url.origin).toBe('http://127.0.0.1:4175'); // same-origin proxy, never the AI Speaking host directly
    seen.ais.push(url.searchParams.get('code')!);
    return route.fulfill({ json: { status: options.ais() }, headers: { 'Cache-Control': 'no-store' } });
  });
  await page.route('**/api/story-club/status?**', route => {
    const url = new URL(route.request().url());
    seen.sc.push(url.searchParams.get('code')!);
    return route.fulfill({ json: { status: options.sc?.() ?? 'waiting' } });
  });
  return seen;
}

async function open(page: Page, path: string) {
  await page.goto(path);
  const reject = page.getByRole('button', { name: /reject analytics|từ chối phân tích/i });
  if (await reject.isVisible().catch(() => false)) await reject.click();
  await page.locator('[data-get-payment-code]').click();
}

const politeRegions = (page: Page) => page.locator('[data-payment-instructions] [aria-live="polite"]');
const COPY = {
  en: { waiting: 'Waiting for your transfer… This page updates by itself. Keep it open.', thanks: 'Payment received. Thank you!', zalo: (m: string) => `Message us on Zalo with your code ${m} to receive your files.` },
  vi: { waiting: 'Đang chờ bạn chuyển khoản… Trang sẽ tự cập nhật, vui lòng giữ trang mở.', thanks: 'Đã nhận thanh toán. Cảm ơn bạn!', zalo: (m: string) => `Nhắn Zalo cho chúng tôi kèm mã ${m} để nhận tài liệu.` },
} as const;

test.beforeAll(async () => { await mkdir(SCREENS, { recursive: true }); });

for (const locale of ['en', 'vi'] as const) for (const width of [390, 1440]) {
  test(`/products checkout ${locale} ${width}: waiting, then received replaces the QR`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const memo = 'PR03-AB12CD';
    let paid = false;
    const seen = await setup(page, { memo, product: 'printable-pack', ais: () => paid ? 'received' : 'waiting' });
    await open(page, `${locale === 'vi' ? '/vi' : ''}/products/printable-pack?checkout=1`);
    const status = page.locator('[data-pay-status]');
    await expect(page.locator('[data-payment-qr]')).toBeVisible();
    await expect(status).toHaveText(COPY[locale].waiting);
    await expect(politeRegions(page)).toHaveCount(1);
    await expect(politeRegions(page).first()).toBeVisible();
    await expect.poll(() => seen.ais.length, { timeout: 5_000 }).toBeGreaterThan(0);
    expect(new Set(seen.ais)).toEqual(new Set([memo]));
    expect(seen.sc).toEqual([]);
    await page.locator('[data-transfer-memo]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(SCREENS, `products-${locale}-${width}-waiting.png`) });

    paid = true;
    await expect(page.locator('[data-pay-thanks]')).toHaveText(COPY[locale].thanks);
    await expect(page.locator('[data-payment-qr]')).toHaveCount(0);
    await expect(page.locator('[data-payment-bank-transfer]')).toHaveCount(0); // no second-pay controls on a final state
    await expect(page.locator('[data-pay-next]')).toHaveText(COPY[locale].zalo(memo)); // no contact sent: Zalo with the code
    await expect(page.locator('[data-pay-next] a')).toHaveAttribute('href', /^\/go\/zalo\?/);
    await expect(page.locator('[data-pay-step]')).toHaveAttribute('data-pay-state', 'received');
    await expect(politeRegions(page)).toHaveCount(1);
    const calls = seen.ais.length;
    await page.waitForTimeout(600);
    expect(seen.ais.length, 'polling stops after received').toBe(calls);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.locator('[data-transfer-memo]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(SCREENS, `products-${locale}-${width}-received.png`) });
  });
}

test('/products checkout: a contact already sent turns the next step into email delivery', async ({ page }) => {
  const memo = 'PR03-AB12CD';
  let paid = false;
  await setup(page, { memo, product: 'printable-pack', ais: () => paid ? 'received' : 'waiting' });
  await open(page, '/products/printable-pack?checkout=1');
  await expect(page.locator('[data-pay-status]')).toHaveText(COPY.en.waiting);
  await page.locator('[data-open-contact-form]').click();
  const form = page.locator('[data-reserve-form]');
  await form.locator('[name="name"]').fill('Synthetic Parent');
  await form.locator('[name="email"]').fill('parent@example.test');
  await form.locator('#reserve-phone').fill('396085076');
  await form.locator('[name="consent"]').check();
  await form.locator('[type="submit"]').click();
  await expect(page.getByText('Thank you. Your request has been received.')).toBeVisible();
  paid = true;
  await expect(page.locator('[data-pay-next]')).toHaveText('Next step: we’ll send your order to the email address you gave us.');
  await expect(page.locator('[data-pay-status]')).not.toContainText('parent@example.test'); // never echo payer data
});

for (const [word, text] of [['underpaid', 'We received less than the price. Message us on Zalo with your code PR03-AB12CD and we’ll sort it out.'], ['overpaid', 'We received more than the price. Message us on Zalo with your code PR03-AB12CD for a refund of the difference.']] as const) {
  test(`/products checkout: ${word} shows the Zalo step with the code`, async ({ page }) => {
    let n = 0;
    await setup(page, { memo: 'PR03-AB12CD', product: 'printable-pack', ais: () => (++n > 1 ? word : 'waiting') });
    await open(page, '/products/printable-pack?checkout=1');
    await expect(page.locator('[data-pay-status]')).toHaveText(text);
    await expect(page.locator('[data-payment-qr]')).toHaveCount(0);
    await expect(politeRegions(page)).toHaveCount(1);
  });
}

test('/live-speaking-check: PayPal stays during waiting and goes once the transfer is received', async ({ page }) => {
  let paid = false;
  const seen = await setup(page, { memo: 'LC-AB12CD', product: 'live-speaking-check', ais: () => paid ? 'received' : 'waiting' });
  await open(page, '/live-speaking-check');
  await expect(page.locator('[data-pay-status]')).toHaveText(COPY.en.waiting);
  await expect(page.locator('[data-paypal-link="live-speaking-check"]')).toBeVisible();
  await expect.poll(() => seen.ais.length, { timeout: 5_000 }).toBeGreaterThan(0);
  paid = true;
  await expect(page.locator('[data-pay-status]')).toHaveText('Payment received. Thank you! Message us on Zalo with your code LC-AB12CD to book your time.');
  await expect(page.locator('[data-paypal-link]')).toHaveCount(0);
  await expect(page.locator('[data-payment-qr]')).toHaveCount(0);
});

for (const locale of ['vi', 'en'] as const) for (const width of [390, 1440]) {
  test(`/story-club/reserve ${locale} ${width}: SC polls JE's own status route, never AI Speaking`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    let paid = false;
    const seen = await setup(page, { memo: 'SC-AB12CD', product: 'story-club', ais: () => 'waiting', sc: () => paid ? 'received' : 'waiting' });
    await open(page, locale === 'vi' ? '/story-club/reserve' : '/en/story-club/reserve');
    await expect(page.locator('[data-pay-status]')).toHaveText(COPY[locale].waiting);
    await expect(politeRegions(page)).toHaveCount(1);
    await expect.poll(() => seen.sc.length, { timeout: 5_000 }).toBeGreaterThan(0);
    await page.locator('[data-transfer-memo]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(SCREENS, `story-club-${locale}-${width}-waiting.png`) });
    paid = true;
    await expect(page.locator('[data-pay-thanks]')).toHaveText(COPY[locale].thanks);
    await expect(page.locator('[data-payment-qr]')).toHaveCount(0);
    await expect(page.locator('[data-reserve-form]')).toBeVisible();
    await expect(politeRegions(page)).toHaveCount(1);
    expect(seen.ais).toEqual([]);
    expect(new Set(seen.sc)).toEqual(new Set(['SC-AB12CD']));
    await page.locator('[data-transfer-memo]').scrollIntoViewIfNeeded();
    await page.screenshot({ path: resolve(SCREENS, `story-club-${locale}-${width}-received.png`) });
  });
}

test('/products/one-to-one checkout: no polling, the by-hand line after the QR', async ({ page }) => {
  const seen = await setup(page, { memo: '1T-AB12CD', product: 'one-to-one', ais: () => 'received' });
  await open(page, '/products/one-to-one?checkout=1');
  await expect(page.locator('[data-pay-status]')).toHaveText('We confirm 1-to-1 payments by hand. We’ll message you on Zalo after we check it.');
  await expect(politeRegions(page)).toHaveCount(1);
  await page.waitForTimeout(800);
  expect(seen.ais).toEqual([]);
  expect(seen.sc).toEqual([]);
  await expect(page.locator('[data-payment-qr]')).toBeVisible();
});

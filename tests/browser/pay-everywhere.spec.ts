import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAID_OFFERS, paymentAmount, paymentHref, reserveCta } from '../../src/config/payment';
import { pausedCopy, PRODUCTS } from '../../src/i18n/content/products';
import { HOME_PRIMARY_OPTION, getOverhaulContent } from '../../src/i18n/content/overhaul';

// Paused for sale (audit fix 4, 11 Nov 2026): no checkout at all; covered by their own test below.
const PAUSED = new Set(PRODUCTS.filter(p => p.paused).map(p => p.id));

const shots = resolve('docs/qa/pay-everywhere');
test.beforeEach(async ({ page, baseURL }) => {
  await mkdir(shots, { recursive: true });
  await page.addInitScript(() => window.addEventListener('je:hydrated', () => { document.documentElement.dataset.qaHydrated = 'true'; }, { once: true }));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL!).origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/go/')) return route.abort();
    return route.fallback();
  });
});

for (const locale of ['vi', 'en'] as const) for (const width of [375, 1440]) for (const offer of PAID_OFFERS.filter(o => !PAUSED.has(o.id))) {
  test(`${offer.id} ${locale} ${width}: checkout QR first → contact details → exact payment instructions`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    const events: string[] = [];
    const memo = `${offer.prefix}-AB12CD`;
    await page.route('**/api/event', route => {
      const body = route.request().postDataJSON();
      if (['reserve_view', 'reserve_submit', 'pay_instructions_shown'].includes(body.event)) { expect(body.product_id).toBe(offer.id); events.push(body.event); }
      return route.fulfill({ status: 204 });
    });
    let submissions = 0;
    await page.route('**/api/sample-pack', route => {
      submissions++;
      const body = route.request().postDataJSON();
      expect(body.product).toBe(offer.id);
      if (body.intent === 'prepare_payment') {
        expect(body).not.toHaveProperty('phone');
        expect(body).not.toHaveProperty('name');
        return route.fulfill({ json: { ok: true, submissionId: `JE-${offer.prefix}-${body.submissionKey}`, memo } });
      }
      expect(body.name).toBe('Synthetic Parent');
      expect(body.phone).toBe('+84396085076');
      expect(body.email).toBe('parent@example.test');
      expect(body.location).toBe('VN');
      expect(body.childAge).toBe('');
      expect(body.group).toBe('');
      expect(body.consent).toBe(true);
      expect(body.submissionKey).toMatch(/^[a-f0-9-]{36}$/);
      return route.fulfill({ json: { ok: true, memo } });
    });
    await page.route('https://qr.sepay.vn/img?**', route => {
      const url = new URL(route.request().url());
      expect(url.searchParams.get('amount')).toBe(String(offer.amount));
      expect(url.searchParams.get('des')).toBe(memo);
      expect(url.searchParams.get('bank')).toBe('MBBank');
      expect(url.searchParams.get('acc')).toBe('0269494315526');
      return route.fulfill({ path: resolve(shots, 'qr-fixtures', `${offer.id}.png`), contentType: 'image/png' });
    });
    await page.goto(`${locale === 'vi' ? '/vi' : ''}/products/${offer.id}`);
    const reject = page.getByRole('button', { name: /reject analytics|từ chối phân tích/i });
    if (await reject.isVisible()) await reject.click();
    await page.locator(`[data-buy-now="${offer.id}"]`).click();
    await expect(page).toHaveURL(new RegExp(paymentHref(offer.id, locale).replace(/[?]/g, '\\?') + '$'));
    // Every product prepares the payment only after an explicit click (audit fix 6, 11 Nov 2026; Story Club since 5 Nov).
    await expect(page.locator('[data-get-payment-code]')).toBeVisible();
    expect(submissions, 'no payment code before the click').toBe(0);
    await page.locator('[data-get-payment-code]').click();
    await expect(page.locator('[data-payment-qr]')).toBeVisible();
    const form = page.locator('[data-reserve-form]');
    await expect(form).toHaveCount(0);
    await expect(page.locator('[data-open-contact-form]')).toBeVisible();
    await page.locator('[data-open-contact-form]').click();
    await expect(form).toBeVisible();
    await expect(form.locator('[required]')).toHaveCount(5);
    await expect(form.locator('[name="phone"]')).toHaveValue('');
    if (offer.id === 'story-club') {
      const sampleY = (await page.locator('[data-reserve-sample]').boundingBox())!.y;
      const formY = (await form.boundingBox())!.y;
      expect(sampleY).toBeGreaterThan(formY);
    }
    await form.locator('[type="submit"]').click();
    await expect(page.getByRole('alert')).toBeVisible();
    expect(submissions).toBe(1);
    await form.locator('[name="name"]').fill('Synthetic Parent');
    await form.locator('[name="email"]').fill('parent@example.test');
    await expect(form.locator('[name="location"]')).toHaveValue('VN');
    await form.locator('#reserve-phone').fill('396085076');
    await expect(form.locator('[name="phone"]')).toHaveValue('+84396085076');
    await form.locator('[name="consent"]').check();
    await form.locator('[type="submit"]').click();
    await expect(page.locator('[data-payment-instructions]')).toBeVisible();
    await expect(page.locator('[data-payment-amount]')).toHaveText(paymentAmount(offer.amount, locale));
    await expect(page.locator('[data-transfer-memo]')).toHaveText(memo);
    const qr = page.locator('[data-payment-qr]');
    await expect(qr).toHaveAttribute('src', /https:\/\/qr.sepay.vn\/img\?/);
    await expect.poll(() => qr.evaluate(img => (img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    expect(submissions).toBe(2);
    await expect.poll(() => events).toEqual(['reserve_view', 'pay_instructions_shown', 'reserve_submit']);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (offer.id !== 'story-club') await expect(page.locator('[data-payment-status]')).toHaveCount(0);
    // A fast pre-hydration navigation may leave the optional analytics banner unchosen.
    // Dismiss it through the real control before capturing the payment QR.
    const remainingReject = page.getByRole('button', { name: /reject analytics|từ chối phân tích/i });
    if (await remainingReject.isVisible()) { await remainingReject.click(); await expect(remainingReject).toBeHidden(); }
    await page.screenshot({ path: resolve(shots, `${offer.id}-${locale}-${width}.png`), fullPage: false });
    if (offer.id === 'story-club') {
      const axe = await new AxeBuilder({ page }).withRules(['label', 'image-alt', 'button-name', 'link-name', 'select-name', 'color-contrast']).analyze();
      expect(axe.violations).toEqual([]);
    }
  });
}

test('reserve checkout accepts a selected non-Vietnam country and submits E.164', async ({ page }) => {
  let submittedPhone = '';
  await page.route('**/api/sample-pack', async route => {
    const body = route.request().postDataJSON();
    if (body.intent === 'prepare_payment') return route.fulfill({ json: { ok: true, memo: 'SC-AB12CD' } });
    submittedPhone = body.phone;
    return route.fulfill({ json: { ok: true, memo: 'SC-AB12CD' } });
  });
  await page.route('https://qr.sepay.vn/img?**', route => route.fulfill({ path: resolve(shots, 'qr-fixtures', 'story-club.png'), contentType: 'image/png' }));
  await page.goto('/story-club/reserve');
  const reject = page.getByRole('button', { name: /reject analytics|từ chối phân tích/i });
  if (await reject.isVisible()) await reject.click();
  await page.locator('[data-get-payment-code]').click();
  await expect(page.locator('[data-payment-qr]')).toBeVisible();
  await expect(page.locator('[data-reserve-form]')).toHaveCount(0);
  await page.locator('[data-open-contact-form]').click();
  await page.locator('#reserve-phone-country').selectOption('US');
  await page.locator('#reserve-phone').fill('4155552671');
  await expect(page.locator('[name="phone"]')).toHaveValue('+14155552671');
  await page.locator('[name="name"]').fill('Synthetic Parent');
  await page.locator('[name="email"]').fill('parent@example.test');
  await page.locator('[name="consent"]').check();
  await page.locator('[data-reserve-form] [type="submit"]').click();
  await expect(page.locator('[data-transfer-memo]')).toHaveText('SC-AB12CD');
  expect(submittedPhone).toBe('+14155552671');
});

for (const locale of ['vi', 'en'] as const) for (const width of [375, 1440]) {
  test(`hero CTA ${locale} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    // Home (audit fix 2, 11 Nov 2026): the main button leads with what can be bought today, not the Story Club reserve.
    const option = getOverhaulContent(locale).home.hero.primaryOptions[HOME_PRIMARY_OPTION];
    for (const path of locale === 'vi' ? ['/vi'] : ['/', '/en/']) {
      await page.goto(path);
      const main = page.getByRole('link', { name: option.label, exact: true }).filter({ visible: true }).first();
      await expect(main, `home main button on ${path}`).toBeVisible();
      await expect(main).toHaveAttribute('href', locale === 'vi' ? `/vi${option.href}` : option.href);
      const box = (await main.boundingBox())!;
      expect(box.y + box.height).toBeLessThanOrEqual(900);
      await expect(page.locator('main').getByRole('link', { name: reserveCta(locale), exact: true })).toHaveCount(0);
      await page.screenshot({ path: resolve(shots, `hero-${path.replace(/\//g, '_') || 'root'}-${width}.png`), fullPage: false });
    }
    for (const path of locale === 'vi' ? ['/vi/story-club', '/vi/products/story-club'] : ['/story-club', '/products/story-club']) {
      await page.goto(path);
      const cta = page.getByRole('link', { name: reserveCta(locale), exact: true }).filter({ visible: true }).first();
      await expect(cta).toHaveAttribute('href', paymentHref('story-club', locale));
      await expect(cta, `visible Story Club CTA on ${path} at ${width}px`).toBeVisible();
      const box = await cta.boundingBox();
      expect(box, `Story Club CTA must have a rendered box on ${path} at ${width}px`).not.toBeNull();
      if (!box) continue;
      expect(box.y + box.height).toBeLessThanOrEqual(900);
      expect(box.x).toBeGreaterThanOrEqual(0);
      await page.screenshot({ path: resolve(shots, `hero-${path.replace(/\//g, '_') || 'root'}-${width}.png`), fullPage: false });
    }
  });
  test(`QR failure never falls back to a non-prefilled code ${locale} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.route('https://qr.sepay.vn/**', route => route.abort());
    let failedRequests = 0;
    await page.route('**/api/sample-pack', route => {
      const body = route.request().postDataJSON();
      if (body.intent === 'prepare_payment') return route.fulfill({ json: { ok: true, memo: 'BL-AB12CD' } });
      failedRequests++;
      return route.fulfill({ status: 503, json: { error: 'internal_secret_do_not_show' } });
    });
    await page.goto(paymentHref('baseline', locale));
    await page.waitForFunction(() => document.documentElement.dataset.qaHydrated === 'true');
    const reject = page.getByRole('button', { name: /reject analytics|từ chối phân tích/i });
    if (await reject.isVisible()) await reject.click();
    await page.locator('[data-get-payment-code]').click();
    await expect(page.locator('[data-payment-qr-error]')).toBeVisible();
    await expect(page.locator('[data-reserve-form]')).toHaveCount(0);
    await page.locator('[data-open-contact-form]').click();
    await expect(page.locator('[data-reserve-form]')).toBeVisible();
    await page.locator('[name="email"]').fill('parent@example.test');
    await expect(page.locator('[name="location"]')).toHaveValue('VN');
    await page.locator('[name="name"]').fill('Synthetic Parent');
    await page.locator('#reserve-phone').fill('0396085076');
    await page.locator('[name="consent"]').check();
    const [failedResponse] = await Promise.all([
      page.waitForResponse(response => response.url().endsWith('/api/sample-pack') && response.request().method() === 'POST'),
      page.locator('[type="submit"]').click(),
    ]);
    expect(failedResponse.status()).toBe(503);
    await expect(page.locator('#reserve-error')).toHaveText(locale === 'vi'
      ? 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc nhắn thầy Jay qua Zalo.'
      : 'We could not send your request. Please try again or message Mr. Jay on Zalo.');
    await expect(page.locator('#reserve-error')).not.toContainText('internal_secret');
    expect(failedRequests).toBe(1);
    await expect(page.locator('[name="name"]')).toHaveValue('Synthetic Parent');
    await expect(page.locator('[name="phone"]')).toHaveValue('+84396085076');
    await expect(page.locator('[data-payment-qr]')).toHaveCount(0);
    let staticQrRequests = 0;
    page.on('request', request => { if (request.url().includes('vietqr-story-club.png')) staticQrRequests++; });
    await page.route('**/api/sample-pack', route => route.fulfill({ json: { ok: true, memo: 'BL-AB12CD' } }));
    await page.locator('[type="submit"]').click();
    await expect(page.locator('[data-payment-qr-error]')).toBeVisible();
    await expect(page.locator('[data-payment-qr]')).toHaveCount(0);
    await expect(page.locator('#payment-qr-unavailable')).toContainText(locale === 'vi' ? 'Không tải được mã QR' : 'automatic payment QR could not be loaded');
    await expect(page.locator('#payment-qr-unavailable')).toContainText(locale === 'vi' ? 'Không quét mã khác hoặc tự nhập số tiền' : 'Do not use a different QR or enter the amount manually');
    await expect(page.locator('[data-transfer-memo]')).toHaveText('BL-AB12CD');
    await expect(page.locator('[data-after-submit-zalo]')).toBeVisible();
    await expect.poll(() => staticQrRequests).toBe(0);
    await page.screenshot({ path: resolve(shots, `qr-unavailable-${locale}-${width}.png`), fullPage: false });
    await expect(page.locator('[data-after-submit-zalo]')).toBeVisible();
  });
}

// Audit fix 6 (11 Nov 2026): loading a checkout creates no payment code and no CRM lead; only the click does.
for (const id of ['mango-l2', 'story-workbooks-l1', 'baseline']) test(`${id}: no prepare_payment call before "Get my payment code" is pressed`, async ({ page }) => {
  const calls: string[] = [];
  await page.route('**/api/sample-pack', route => { calls.push(route.request().postDataJSON().intent ?? 'form'); return route.fulfill({ json: { ok: true, memo: `${PAID_OFFERS.find(o => o.id === id)!.prefix}-AB12CD` } }); });
  await page.route('https://qr.sepay.vn/img?**', route => route.fulfill({ path: resolve(shots, 'qr-fixtures', `${id}.png`), contentType: 'image/png' }));
  await page.goto(paymentHref(id, 'en'));
  await page.waitForFunction(() => document.documentElement.dataset.qaHydrated === 'true');
  await page.waitForTimeout(3_000);
  expect(calls, 'no call on load (the old flow fired after 2 s)').toEqual([]);
  await expect(page.locator('[data-payment-qr]')).toHaveCount(0);
  await page.locator('[data-get-payment-code]').click();
  await expect(page.locator('[data-payment-qr]')).toBeVisible();
  expect(calls).toEqual(['prepare_payment']);
});

// Audit fix 4 (11 Nov 2026): a paused product's page stays, but even an old ?checkout=1 link opens no checkout.
for (const id of PAUSED) for (const locale of ['en', 'vi'] as const) test(`${id} ${locale}: paused, waitlist instead of any checkout`, async ({ page }) => {
  let calls = 0;
  await page.route('**/api/sample-pack', route => { calls++; return route.fulfill({ status: 400, json: { ok: false } }); });
  await page.goto(`${locale === 'vi' ? '/vi' : ''}/products/${id}?checkout=1`);
  await page.waitForFunction(() => document.documentElement.dataset.qaHydrated === 'true');
  // A held pack (11 Nov 2026) shows the neutral notice; a product being rewritten shows the waitlist note.
  await expect(page.locator(`[data-paused-waitlist="${id}"]`)).toContainText(pausedCopy(PRODUCTS.find(p => p.id === id)?.paused, locale).note);
  await expect(page.locator(`[data-buy-now="${id}"], [data-get-payment-code], [data-payment-qr], [data-paypal-link="${id}"]`)).toHaveCount(0);
  expect(calls).toBe(0);
});

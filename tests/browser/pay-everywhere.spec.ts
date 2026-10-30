import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PAID_OFFERS, paymentAmount, paymentHref, reserveCta } from '../../src/config/payment';

const shots = resolve('docs/qa/pay-everywhere');
test.beforeEach(async ({ page, baseURL }) => {
  await mkdir(shots, { recursive: true });
  await page.addInitScript(() => window.addEventListener('je:hydrated', () => { document.documentElement.dataset.qaHydrated = 'true'; }, { once: true }));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL!).origin || url.pathname.startsWith('/api/')) return route.abort();
    return route.fallback();
  });
});

for (const locale of ['vi', 'en'] as const) for (const width of [375, 1440]) for (const offer of PAID_OFFERS) {
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
    await expect(page.locator('[data-payment-qr]')).toBeVisible();
    const form = page.locator('[data-reserve-form]');
    await expect(form.locator('[required]')).toHaveCount(2);
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
    await form.locator('#reserve-phone').fill('396085076');
    await expect(form.locator('[name="phone"]')).toHaveValue('+84396085076');
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
  await expect(page.locator('[data-payment-qr]')).toBeVisible();
  await page.locator('#reserve-phone-country').selectOption('US');
  await page.locator('#reserve-phone').fill('4155552671');
  await expect(page.locator('[name="phone"]')).toHaveValue('+14155552671');
  await page.locator('[name="name"]').fill('Synthetic Parent');
  await page.locator('[data-reserve-form] [type="submit"]').click();
  await expect(page.locator('[data-transfer-memo]')).toHaveText('SC-AB12CD');
  expect(submittedPhone).toBe('+14155552671');
});

for (const locale of ['vi', 'en'] as const) for (const width of [375, 1440]) {
  test(`hero CTA ${locale} ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of locale === 'vi' ? ['/vi', '/vi/story-club', '/vi/products/story-club'] : ['/', '/en/', '/story-club', '/products/story-club']) {
      await page.goto(path);
      const cta = page.getByRole('link', { name: reserveCta(locale), exact: true }).first();
      await expect(cta).toHaveAttribute('href', paymentHref('story-club', locale));
      const box = (await cta.boundingBox())!;
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
    await expect(page.locator('[data-payment-qr-error]')).toBeVisible();
    await expect(page.locator('[data-reserve-form]')).toBeVisible();
    await page.locator('[name="name"]').fill('Synthetic Parent');
    await page.locator('#reserve-phone').fill('0396085076');
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

import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Synthetic form responses below override this guard; every other API or
// third-party request is blocked, even if a local backend happens to be running.
test.beforeEach(async ({ page, baseURL }) => {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== new URL(baseURL!).origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/go/')) return route.abort();
    return route.fallback();
  });
});

async function checkAccessibility(page: import('@playwright/test').Page) {
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withRules(['color-contrast', 'label', 'image-alt', 'button-name', 'link-name', 'select-name']).analyze();
  expect(result.violations).toEqual([]);
}


test('products keep named controls, labelled sample forms and a contained mobile sample dialog', async ({ page }) => {
  test.setTimeout(90_000); // four viewport/locale passes with accessibility scans; the 30 s default is too tight on the CI runner (3 Nov 2026)
  for (const locale of ['en', 'vi']) for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(locale === 'vi' ? '/vi/products' : '/products');
    await expect(page.locator('[data-category-tile="families"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('.products-page li[id]')).toHaveCount(45); // 35 plus the five Story Workbooks, IELTS Reading and Listening (3 Nov 2026) and the three IELTS bundles (5 Nov 2026)
    await checkAccessibility(page);
    if (width === 375) {
      await mkdir(resolve('docs/qa/site-quality'), { recursive: true });
      await page.screenshot({ path: resolve('docs/qa/site-quality', `375-products-${locale}.png`), fullPage: true });
    }
    // The segment filter narrows the catalogue to one section and the count line follows; pressing again shows all.
    await page.locator('[data-category-tile="teachers"]').click();
    await expect(page.locator('[data-category-tile="teachers"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#families')).toBeHidden();
    await expect(page.locator('#teachers li[id]')).toHaveCount(15);
    await expect(page.locator('[data-products-count]')).toHaveAttribute('data-products-count', '15');
    await page.locator('[data-products-show-all]').click();
    await expect(page.locator('#families')).toBeVisible();
    await checkAccessibility(page);
    const opener = page.locator('[data-sample-open="story-club"]');
    await opener.click();
    await expect(page.locator('[data-sample-viewer="story-club"]')).toBeVisible();
    await checkAccessibility(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-sample-viewer]')).toHaveCount(0);
    await expect(opener).toBeFocused();
  }
});

// 5 Nov 2026: the reserve page shows the written summary (what, when, who, rules, refund) before "Pay now", in both
// languages, and the amount stays 590000. The payment is prepared ONLY after a click on "Get my payment code", which sits
// after the summary: a page load alone sends no non-GET request. Every network call is a synthetic fixture; nothing is
// sent to production.
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
for (const [locale, path, payNow, refundWord, getCode] of [
  ['en', '/en/story-club/reserve', 'Pay now', 'within 24 hours of paying', 'Get my payment code'],
  ['vi', '/story-club/reserve', 'Thanh toán ngay', 'trong vòng 24 giờ', 'Lấy mã thanh toán của tôi'],
] as const) {
  test(`reserve page ${locale}: no request on load, payment prepared only after the click, summary precedes Pay now, amount stays 590000`, async ({ page }) => {
    let qrAmount = '';
    const nonGet: string[] = [];
    const prepareBodies: Array<Record<string, unknown>> = [];
    // POST /api/event is the existing anonymous reserve_view analytics beacon, unchanged by this PR; it is the only allowed non-GET on load.
    page.on('request', request => { const call = `${request.method()} ${new URL(request.url()).pathname}`; if (request.method() !== 'GET' && call !== 'POST /api/event') nonGet.push(call); });
    await page.route('**/api/sample-pack', route => { prepareBodies.push(route.request().postDataJSON()); return route.fulfill({ json: { ok: true, memo: 'SC-AB12CD' } }); });
    await page.route('**/api/event', route => route.fulfill({ status: 204 }));
    await page.route('https://qr.sepay.vn/img?**', route => { qrAmount = new URL(route.request().url()).searchParams.get('amount') ?? ''; return route.fulfill({ body: TINY_PNG, contentType: 'image/png' }); });
    for (const width of [375, 1440]) {
      nonGet.length = 0; prepareBodies.length = 0; qrAmount = '';
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      const button = page.getByRole('button', { name: getCode });
      await expect(button).toBeVisible();
      // The old page POSTed prepare_payment about 2 s after load. Wait past that: nothing may be sent without a click.
      await page.waitForTimeout(3_500);
      expect(nonGet, `${locale} ${width}: no non-GET request on page load (other than the analytics beacon)`).toEqual([]);
      expect(prepareBodies).toEqual([]);
      await expect(page.locator('[data-payment-instructions]')).toHaveCount(0);
      // Order: summary, then the button, then (after the click) Pay now.
      const gate = await page.evaluate(() => {
        const summaryEl = document.querySelector('[data-reserve-summary]')!;
        const buttonEl = document.querySelector('[data-get-payment-code]')!;
        return !!(summaryEl.compareDocumentPosition(buttonEl) & Node.DOCUMENT_POSITION_FOLLOWING);
      });
      expect(gate, `${locale} ${width}: the button comes after the written summary`).toBe(true);
      await expect(page.locator('[data-reserve-summary]')).toContainText(refundWord);
      await button.click();
      await expect(page.locator('[data-payment-instructions]')).toBeVisible({ timeout: 15_000 });
      expect(prepareBodies.length, `${locale} ${width}: exactly one request after the click`).toBe(1);
      expect(prepareBodies[0]).toMatchObject({ intent: 'prepare_payment', product: 'story-club', website: '' });
      expect(prepareBodies[0].submissionKey).toMatch(/^[a-f0-9-]{36}$/);
      expect(nonGet).toEqual(['POST /api/sample-pack']);
      const order = await page.evaluate((label) => {
        const summaryEl = document.querySelector('[data-reserve-summary]')!;
        const payHeading = [...document.querySelectorAll('h2')].find(h => h.textContent?.trim() === label)!;
        return { before: !!(summaryEl.compareDocumentPosition(payHeading) & Node.DOCUMENT_POSITION_FOLLOWING), summaryBottom: summaryEl.getBoundingClientRect().bottom + scrollY, payTop: payHeading.getBoundingClientRect().top + scrollY };
      }, payNow);
      expect(order.before, `${locale} ${width}: summary is before the Pay now heading in the DOM`).toBe(true);
      expect(order.summaryBottom, `${locale} ${width}: and above it on the page`).toBeLessThanOrEqual(order.payTop);
      await expect(page.locator('[data-payment-amount]')).toHaveText(locale === 'vi' ? '590.000₫' : '590,000₫');
      await expect.poll(() => qrAmount).toBe('590000');
      await checkAccessibility(page);
    }
  });
}

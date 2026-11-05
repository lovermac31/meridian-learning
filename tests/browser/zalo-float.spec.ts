import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { paidOffer } from '../../src/config/payment';

/**
 * Floating Zalo button acceptance (owner brief, 1 Nov 2026). Runs against the built site in a muted browser; every
 * API and third-party request is blocked, and the tracked redirect /go/zalo is stubbed so no click ever leaves
 * the machine. Screenshots land in docs/qa/zalo-float/.
 */
const shots = resolve('docs/qa/zalo-float');
const TRACKED = /\/go\/zalo\?utm_source=float&utm_content=zalo-float&locale=(en|vi)$/;
const entry = (locale: 'en' | 'vi') => (locale === 'vi' ? '/vi/products' : '/');
const copy = {
  en: { launcher: 'Chat on Zalo with Mr. Jay', pill: 'Chat on Zalo', scan: 'Scan to message Mr. Jay on Zalo', open: 'Open Zalo', close: 'Close', reject: /reject analytics/i, settings: /privacy settings/i },
  vi: { launcher: 'Nhắn Zalo cho Mr. Jay', pill: 'Nhắn Zalo', scan: 'Quét để nhắn Zalo cho Mr. Jay', open: 'Mở Zalo', close: 'Đóng', reject: /từ chối phân tích/i, settings: /cài đặt quyền riêng tư/i },
} as const;
const TINY_PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

test.beforeEach(async ({ context, baseURL }) => {
  await mkdir(shots, { recursive: true });
  await context.addInitScript(() => window.addEventListener('je:hydrated', () => { document.documentElement.dataset.qaHydrated = 'true'; }, { once: true }));
  await context.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/go/zalo') return route.fulfill({ status: 200, contentType: 'text/html', body: '<!doctype html><title>zalo redirect stub</title>' });
    if (url.origin !== new URL(baseURL!).origin || url.pathname.startsWith('/api/')) return route.abort();
    return route.fallback();
  });
});

async function open(page: Page, path: string, width: number) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(path);
  await page.waitForFunction(() => document.documentElement.dataset.qaHydrated === 'true');
}

async function rect(locator: Locator) {
  const box = await locator.boundingBox();
  expect(box, 'element has a layout box').not.toBeNull();
  return box!;
}

type Box = { x: number; y: number; width: number; height: number };
const overlaps = (a: Box, b: Box) => a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

/** The launcher sits inside the viewport and clear of every other fixed bottom control (settles within a second). */
async function expectClearOfBottomUi(page: Page) {
  const collisions = async () => {
    const me = await rect(page.locator('[data-zalo-float-launcher]'));
    const viewport = page.viewportSize()!;
    const found: string[] = [];
    if (me.x + me.width > viewport.width || me.y + me.height > viewport.height) found.push('viewport edge');
    for (const selector of ['[data-privacy-controls]', '[data-contact-panel]', '.je-botui-shell button']) {
      for (const other of await page.locator(selector).all()) {
        if (!(await other.isVisible())) continue;
        const box = await other.boundingBox();
        if (box && overlaps(me, box)) found.push(selector);
      }
    }
    return found;
  };
  await expect.poll(collisions, { timeout: 1500, message: 'the Zalo float must stay clear of the other bottom controls' }).toEqual([]);
}

for (const locale of ['en', 'vi'] as const) {
  const t = copy[locale];

  test(`${locale} 1440: halo launcher opens an accessible QR card; Escape, outside click and X close it; only Open Zalo is tracked`, async ({ page, context }) => {
    const zaloHits: string[] = [];
    context.on('request', request => { if (request.url().includes('/go/zalo')) zaloHits.push(request.url()); });
    await open(page, entry(locale), 1440);
    const launcher = page.locator('[data-zalo-float-launcher]');
    await expect(launcher).toBeVisible();
    await expect(launcher).toHaveAttribute('aria-label', t.launcher);
    await expect(launcher).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(launcher).toHaveAttribute('aria-expanded', 'false');
    await expect(launcher.locator('.zf-p')).toHaveText(t.pill);
    expect(await launcher.locator('.zf-r').evaluateAll(rings => rings.map(ring => getComputedStyle(ring).animationName))).toEqual(['zf-pulse', 'zf-pulse']);
    await expectClearOfBottomUi(page);
    await page.screenshot({ path: resolve(shots, `1440-${locale}-closed.png`) });

    await launcher.click();
    const card = page.locator('[data-zalo-float-card]');
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute('role', 'dialog');
    await expect(card).toHaveAttribute('aria-modal', 'true');
    await expect(launcher).toHaveAttribute('aria-expanded', 'true');
    await expect(card.getByText('Zalo · Mr. Jay')).toBeVisible();
    await expect(card.getByText(t.scan)).toBeVisible();
    await expect(card.getByText('0396 085 076')).toBeVisible();
    const qr = card.locator('img');
    await expect(qr).toHaveAttribute('src', '/images/zalo-qr.svg');
    expect(await qr.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const openLink = card.locator('[data-zalo-float-open]');
    await expect(openLink).toHaveText(t.open);
    await expect(openLink).toHaveAttribute('href', `/go/zalo?utm_source=float&utm_content=zalo-float&locale=${locale}`);
    await expect(openLink).toHaveAttribute('target', '_blank');
    const close = card.getByRole('button', { name: t.close });
    await expect(close).toBeFocused();
    const cardBox = await rect(card);
    const viewport = page.viewportSize()!;
    expect(cardBox.x).toBeGreaterThanOrEqual(0);
    expect(cardBox.y).toBeGreaterThanOrEqual(0);
    expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(viewport.width);
    expect(cardBox.y + cardBox.height).toBeLessThanOrEqual(viewport.height);
    const axe = await new AxeBuilder({ page }).include('[data-zalo-float]').withRules(['color-contrast', 'button-name', 'link-name', 'image-alt', 'aria-allowed-attr', 'aria-dialog-name', 'aria-valid-attr-value']).analyze();
    expect(axe.violations).toEqual([]);
    await page.screenshot({ path: resolve(shots, `1440-${locale}-open.png`) });

    // Focus trap: Tab cycles between the close button and Open Zalo.
    await page.keyboard.press('Tab');
    await expect(openLink).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(close).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(openLink).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(card).toHaveCount(0);
    await expect(launcher).toBeFocused();
    await expect(launcher).toHaveAttribute('aria-expanded', 'false');

    await launcher.click();
    await expect(card).toBeVisible();
    await page.mouse.click(300, 300);
    await expect(card).toHaveCount(0);

    await launcher.click();
    await expect(card).toBeVisible();
    await close.click();
    await expect(card).toHaveCount(0);
    await expect(launcher).toBeFocused();
    expect(zaloHits, 'opening and closing the card logs nothing').toEqual([]);

    await launcher.click();
    const [popup] = await Promise.all([context.waitForEvent('page'), openLink.click()]);
    await popup.waitForLoadState();
    expect(popup.url()).toMatch(TRACKED);
    await popup.close();
    expect(zaloHits).toHaveLength(1);
  });

  test(`${locale} 375: the tap opens Zalo directly through the tracked redirect, no card; clear of the privacy banner before and after consent`, async ({ page, context }) => {
    await open(page, entry(locale), 375);
    const launcher = page.locator('[data-zalo-float-launcher]');
    await expect(launcher).toBeVisible();
    await expect(launcher).toHaveAttribute('aria-label', t.launcher);
    await expect(launcher).not.toHaveAttribute('aria-haspopup', /.+/);
    const banner = page.locator('[data-privacy-controls]');
    await expect(banner.getByRole('button', { name: t.reject })).toBeVisible();
    await expectClearOfBottomUi(page);
    await page.screenshot({ path: resolve(shots, `375-${locale}-consent-prompt.png`) });

    const [popup] = await Promise.all([context.waitForEvent('page'), launcher.click()]);
    await popup.waitForLoadState();
    expect(popup.url()).toMatch(TRACKED);
    await expect(page.locator('[data-zalo-float-card]')).toHaveCount(0);
    await page.screenshot({ path: resolve(shots, `375-${locale}-after-tap.png`) });
    await writeFile(resolve(shots, `375-${locale}-tap.json`), JSON.stringify({ viewport: 375, locale, openedInNewTab: new URL(popup.url()).pathname + new URL(popup.url()).search, cardRendered: false }, null, 2) + '\n');
    await popup.close();

    await banner.getByRole('button', { name: t.reject }).click();
    await expect(banner.getByRole('button', { name: t.settings })).toBeVisible();
    await expectClearOfBottomUi(page);
    await page.screenshot({ path: resolve(shots, `375-${locale}.png`) });
  });
}

test('en 1440: static halo under reduced motion; hidden while the assistant panel is open, back when it closes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await open(page, '/', 1440);
  const rings = page.locator('[data-zalo-float-launcher] .zf-r');
  expect(await rings.first().evaluate(ring => getComputedStyle(ring).animationName)).toBe('none');
  await expect(rings.first()).toBeVisible();
  await expect(rings.nth(1)).toBeHidden();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect(await rings.first().evaluate(ring => getComputedStyle(ring).animationName)).toBe('zf-pulse');

  // The assistant launcher appears bottom-right after the first screenful; the float lifts above it, then hides
  // while the panel is open and comes back when it closes.
  const float = page.locator('[data-zalo-float]');
  const before = await rect(page.locator('[data-zalo-float-launcher]'));
  await page.mouse.wheel(0, 600);
  const assistant = page.getByRole('button', { name: 'Open the Jurassic English assistant' });
  await expect(assistant).toBeVisible();
  await expect.poll(async () => (await rect(page.locator('[data-zalo-float-launcher]'))).y).toBeLessThan(before.y - 40);
  await expectClearOfBottomUi(page);
  await page.screenshot({ path: resolve(shots, '1440-en-above-assistant.png') });
  await assistant.click();
  await expect(page.locator('#je-botui-panel')).toBeVisible();
  await expect(float).toBeHidden();
  await page.getByRole('button', { name: 'Close the Jurassic English assistant' }).click();
  await expect(float).toBeVisible();
});

test('hidden on checkout pay steps and private portals; disappears when a product page enters checkout', async ({ page }) => {
  await page.route('**/api/sample-pack', route => {
    const product = route.request().postDataJSON().product as string;
    return route.fulfill({ json: { ok: true, submissionId: 'JE-QA-SYNTHETIC', memo: `${paidOffer(product)!.prefix}-QA12CD` } });
  });
  await page.route('**/api/event', route => route.fulfill({ status: 204 }));
  await page.route('https://qr.sepay.vn/img?**', route => route.fulfill({ body: TINY_PNG, contentType: 'image/png' }));
  const launcher = page.locator('[data-zalo-float-launcher]');
  const payStep = page.locator('[data-payment-qr], [data-payment-qr-error]');

  for (const [path, width, shot] of [
    ['/story-club/reserve', 1440, '1440-en-reserve-hidden.png'],
    ['/vi/story-club/reserve', 375, '375-vi-reserve-hidden.png'],
    ['/products/one-to-one?checkout=1', 1440, '1440-en-product-checkout-hidden.png'],
    ['/vi/products/one-to-one?checkout=1', 375, null],
  ] as const) {
    await open(page, path, width);
    if (path.includes('story-club/reserve')) await page.locator('[data-get-payment-code]').click(); // Story Club prepares the payment only after this click
    await expect(payStep.first()).toBeVisible();
    await expect(launcher).toHaveCount(0);
    if (shot) await page.screenshot({ path: resolve(shots, shot) });
  }

  for (const path of ['/internal/pilot-requests', '/external/pilot']) {
    await open(page, path, 1440);
    await expect(launcher).toHaveCount(0);
  }

  await open(page, '/products/one-to-one', 1440);
  await expect(launcher).toBeVisible();
  await page.locator('[data-buy-now="one-to-one"]').click();
  await expect(page).toHaveURL(/\/products\/one-to-one\?checkout=1$/);
  await expect(payStep.first()).toBeVisible();
  await expect(launcher).toHaveCount(0);
});

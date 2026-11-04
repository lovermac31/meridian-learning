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
    await expect(page.locator('.products-page li[id]')).toHaveCount(42); // 35 plus the five Story Workbooks plus IELTS Reading Ladder and Listening Profiler (3 Nov 2026)
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

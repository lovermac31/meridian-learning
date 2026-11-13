import { expect, test } from '@playwright/test';
import { SAMPLE_PAGE_COUNTS } from '../../src/i18n/content/samplePages';
import { PRODUCTS } from '../../src/i18n/content/products';

// AC3 (task WW-20261113-07): every Level 1-5 collection product page shows at least 3 real sample pages ABOVE the price, in
// English and Vietnamese, opens a view-only viewer with the full sample set, and links to no PDF.
const IDS = PRODUCTS.filter((p) => /^(story-workbooks|teacher-pack|student-workbook)-l[1-5]$/.test(p.id) || p.id === 'teacher-bundle').map((p) => p.id);
test('the collection products are the 16 expected ids', () => { expect(IDS).toHaveLength(16); });

for (const locale of ['en', 'vi'] as const) for (const width of [390, 1440]) for (const id of IDS) {
  test(`${id} ${locale} ${width}px: ≥3 sample pages above the price, viewer opens, no PDF`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 900 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`${locale === 'vi' ? '/vi' : ''}/products/${id}`);
    const product = PRODUCTS.find((p) => p.id === id)!;
    const stem = product.sample!;
    const sample = page.locator(`[data-sample="${id}"]`).first();
    await expect(sample).toBeVisible();
    const imgs = sample.locator('img');
    expect(await imgs.count()).toBeGreaterThanOrEqual(3);
    for (let i = 0; i < 3; i++) {
      const src = (await imgs.nth(i).getAttribute('src')) ?? '';
      expect(src).toContain(`/samples/${stem}-p${i + 1}.webp`);
      await imgs.nth(i).scrollIntoViewIfNeeded();
      await expect.poll(() => imgs.nth(i).evaluate((el: HTMLImageElement) => `${el.complete}:${el.naturalWidth}`), { timeout: 8000 }).toMatch(/^true:(?!0$)\d+/);
    }
    const sampleY = (await sample.boundingBox())!.y;
    const priceY = (await page.locator(`[data-price="${id}"]`).first().boundingBox())!.y;
    expect(sampleY, 'sample block sits above the price').toBeLessThan(priceY);
    expect(await page.locator('a[href$=".pdf"], a[href*=".pdf?"]').count(), 'no PDF link').toBe(0);
    await page.locator(`[data-sample-open="${id}"], [data-sample-link="${id}"]`).first().click();
    const viewer = page.locator(`[data-sample-viewer="${id}"]`);
    await expect(viewer).toBeVisible();
    await expect(viewer.locator('[data-viewer-counter]')).toContainText(String(SAMPLE_PAGE_COUNTS[stem]));
    const first = await viewer.locator('[data-viewer-page="1"] img, img[data-viewer-page="1"]').first().getAttribute('src');
    expect(first ?? '').toContain(`/samples/pages/${stem}-pg01.webp`);
    expect(errors).toEqual([]);
  });
}

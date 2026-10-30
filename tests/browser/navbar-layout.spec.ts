import { expect, test } from '@playwright/test';

const desktopWidths = [1600, 1700, 1920];

test('desktop navigation keeps Products clear of the language switcher in English and Vietnamese', async ({ page }) => {
  for (const width of desktopWidths) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/vi/']) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(route);
      const product = page.locator(`nav a[href="${route === '/' ? '/products' : '/vi/products'}"]`).first();
      const language = page.locator('nav [role="group"]').first();
      await expect(product).toBeVisible();
      await expect(language).toBeVisible();
      const positions = await page.evaluate((href) => {
        const productLink = document.querySelector<HTMLAnchorElement>(`nav a[href="${href}"]`);
        const languageGroup = document.querySelector<HTMLElement>('nav [role="group"]');
        const cta = document.querySelector<HTMLAnchorElement>('nav > div > div:last-child > a');
        if (!productLink || !languageGroup || !cta) return null;
        return {
          productRight: productLink.getBoundingClientRect().right,
          languageLeft: languageGroup.getBoundingClientRect().left,
          languageRight: languageGroup.getBoundingClientRect().right,
          ctaLeft: cta.getBoundingClientRect().left,
        };
      }, route === '/' ? '/products' : '/vi/products');
      expect(positions, `navigation geometry at ${width}px on ${route}`).not.toBeNull();
      expect(positions!.productRight, `Products overlaps language control at ${width}px on ${route}`).toBeLessThanOrEqual(positions!.languageLeft);
      expect(positions!.languageRight, `language control overlaps CTA at ${width}px on ${route}`).toBeLessThanOrEqual(positions!.ctaLeft);
    }
  }
});

test('navigation switches to a menu before the full row can become crowded', async ({ page }) => {
  for (const width of [1280, 1440, 1535, 1599]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('nav button[aria-controls="root-mobile-nav"]'), `${width}px uses the compact menu`).toBeVisible();
    await expect(page.locator('nav > div a[href="/products"]'), `${width}px does not render the crowded desktop row`).toBeHidden();
  }
});

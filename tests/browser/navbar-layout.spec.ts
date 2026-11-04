import { expect, test } from '@playwright/test';

const desktopWidths = [1536, 1565, 1600, 1700, 1920];

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
        const cta = document.querySelector<HTMLAnchorElement>('nav > div > div:last-child > a:not([data-testid="header-products-link"])');
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

test('navigation switches to a menu before the full row can become crowded, with one Products link kept in the header', async ({ page }) => {
  for (const width of [768, 1280, 1440, 1535]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator('nav button[aria-controls="root-mobile-nav"]'), `${width}px uses the compact menu`).toBeVisible();
    await expect(page.locator('nav > div a[href="/products"]:not([data-testid="header-products-link"])'), `${width}px does not render the crowded desktop row`).toBeHidden();
    await expect(page.getByTestId('header-products-link'), `${width}px keeps the standalone Products link (PR #283)`).toBeVisible();
  }
  await page.setViewportSize({ width: 1536, height: 900 });
  await page.goto('/');
  await expect(page.getByTestId('header-products-link'), 'the standalone Products link hands over to the full row from 2xl').toBeHidden();
});

// 4 Nov 2026 (owner: "click, click, sales"): Products is one tap away on every page at every width, on phones too.
const phoneWidths = [360, 375, 390, 414];
const allWidths = [...phoneWidths, 768, 1024, 1440, 1536];

for (const [locale, route, label, href] of [
  ['English', '/', 'Products', '/products'],
  ['Vietnamese', '/vi/', 'Sản phẩm', '/vi/products'],
] as const) {
  test(`header shows a Products link in ${locale} at phone, tablet and laptop widths without overflow`, async ({ page }) => {
    for (const width of allWidths) {
      await page.setViewportSize({ width, height: 812 });
      await page.goto(route);
      const rowLink = width >= 1536;
      const link = rowLink
        ? page.locator(`nav a[href="${href}"]`).first()
        : page.getByTestId('header-products-link');
      await expect(link, `${locale} Products link visible at ${width}px`).toBeVisible();
      await expect(link).toContainText(label);
      const geometry = await page.evaluate(() => {
        const nav = document.querySelector('nav')!;
        const rects = [...nav.querySelectorAll<HTMLElement>('nav > div > div:last-child > *, nav > div > div:first-child > button')]
          .filter((el) => el.getBoundingClientRect().width > 0)
          .map((el) => el.getBoundingClientRect());
        const products = document.querySelector<HTMLElement>('[data-testid="header-products-link"]');
        return {
          scrollWidth: document.documentElement.scrollWidth,
          navHeight: nav.getBoundingClientRect().height,
          rects: rects.map((r) => ({ left: r.left, right: r.right })),
          productsHeight: products ? products.getBoundingClientRect().height : 0,
          productsWidth: products ? products.getBoundingClientRect().width : 0,
        };
      });
      expect(geometry.scrollWidth, `no horizontal overflow at ${width}px`).toBeLessThanOrEqual(width);
      expect(geometry.navHeight, `header stays one 72px row at ${width}px`).toBeLessThanOrEqual(74);
      if (!rowLink) {
        expect(geometry.productsHeight, `Products touch target height at ${width}px`).toBeGreaterThanOrEqual(44);
        expect(geometry.productsWidth, `Products touch target width at ${width}px`).toBeGreaterThanOrEqual(44);
      }
      const ordered = [...geometry.rects].sort((a, b) => a.left - b.left);
      for (let i = 1; i < ordered.length; i++) {
        expect(ordered[i].left, `header items do not overlap at ${width}px (item ${i})`).toBeGreaterThanOrEqual(ordered[i - 1].right - 0.5);
      }
      expect(Math.max(...ordered.map((r) => r.right)), `header content stays inside the viewport at ${width}px`).toBeLessThanOrEqual(width);
    }
  });

  test(`Products link in the header leads to the products page in ${locale}`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(route);
    await page.getByTestId('header-products-link').click();
    await expect(page).toHaveURL(new RegExp(`${href}(\\?.*)?$`));
  });

  test(`phone home page shows product entry points above the fold in ${locale}`, async ({ page }) => {
    for (const width of [375, 390]) {
      await page.setViewportSize({ width, height: 812 });
      await page.goto(route);
      const top = page.locator('[data-home-top-products]');
      await expect(top, `${locale} product row visible at ${width}px`).toBeVisible();
      await expect(top.locator('[data-home-top-tile]')).toHaveCount(4);
      const all = page.locator('[data-home-top-all-products]');
      await expect(all).toBeVisible();
      const box = (await all.boundingBox())!;
      const lastTile = (await top.locator('[data-home-top-tile]').last().boundingBox())!;
      // The cookie banner covers roughly the bottom 40% of a phone: the row must end above it.
      expect(box.y + box.height, `See all products above the fold at ${width}px`).toBeLessThan(480);
      expect(lastTile.y + lastTile.height, `tiles above the fold at ${width}px`).toBeLessThan(480);
      expect(box.height, `See all products touch target at ${width}px`).toBeGreaterThanOrEqual(44);
      expect(lastTile.height, `tile touch target at ${width}px`).toBeGreaterThanOrEqual(44);
    }
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto(route);
    await expect(page.locator('[data-home-top-products]'), 'the phone-only row is hidden from 768px').toBeHidden();
  });
}

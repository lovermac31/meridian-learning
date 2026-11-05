import { expect, test, type Page } from '@playwright/test';

// Site audit, 5 Nov 2026. Needs the production build: `npm run build`, then
// `npx playwright test -c playwright.audit-fixes.config.ts`. Everything is served locally; external requests are aborted.
const widths = [375, 768, 1024, 1440];

// Pages served by this repo (the ecosystem-app pages are covered by tests/audit-fixes-2026-11-05.test.ts).
const pages = [
  { path: '/', href: '/products' },
  { path: '/vi', href: '/vi/products' },
  { path: '/products', href: '/products' },
  { path: '/vi/products', href: '/vi/products' },
  { path: '/young-learners-speaking/', href: '/products' },
  { path: '/vi/luyen-noi-ielts/', href: '/vi/products' },
  { path: '/challenges/one-change', href: '/products' },
  { path: '/site-map', href: '/products' },
  { path: '/vi/so-do-trang', href: '/vi/products' },
];

test.beforeEach(async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
});

// "In the header" means inside <header> or <nav>; "one tap" opens the page's own menu (button or <summary>).
async function productsReachable(page: Page, href: string) {
  const visibleInHeader = () => page.evaluate((target) => [...document.querySelectorAll<HTMLAnchorElement>(`a[href="${target}"]`)].some((a) => {
    if (!a.closest('header, nav')) return false;
    const box = a.getBoundingClientRect();
    const style = getComputedStyle(a);
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none' && box.right <= innerWidth + 1 && box.left >= -1;
  }), href);
  if (await visibleInHeader()) return 'header';
  const toggle = page.locator('header button[aria-expanded], nav button[aria-expanded], nav summary, header summary').first();
  await toggle.click();
  return (await visibleInHeader()) ? 'menu' : null;
}

for (const { path, href } of pages) {
  test(`Products (${href}) is reachable from the header at every width on ${path}`, async ({ page }) => {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      expect(await productsReachable(page, href), `${path} at ${width}px`).not.toBeNull();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      expect(overflow, `${path} overflows horizontally at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}

test('the Products link is visible in the bar itself (no tap) at every width on the pages this fix touched', async ({ page }) => {
  for (const path of ['/young-learners-speaking/', '/vi/luyen-noi-ielts/', '/challenges/one-change', '/site-map']) {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      expect(await productsReachable(page, path.startsWith('/vi') ? '/vi/products' : '/products'), `${path} at ${width}px`).toBe('header');
    }
  }
});

test('Young Learners language switch re-points Products to the Vietnamese catalogue', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/young-learners-speaking/?lang=vi');
  await expect(page.locator('a[data-products-link]').first()).toHaveAttribute('href', '/vi/products');
});

test('One Change challenge: Products link follows the page language', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto('/challenges/one-change');
  await expect(page.locator('#products-link')).toHaveAttribute('href', '/products');
  await page.selectOption('#language', 'vi');
  await expect(page.locator('#products-link')).toHaveAttribute('href', '/vi/products');
  await expect(page.locator('#products-link')).toHaveText('Sản phẩm');
});

// React error #418: prerendered markup and the first client render must match.
for (const path of ['/', '/vi', '/products', '/vi/products']) {
  test(`no hydration error on ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => { if (message.type() === 'error' && !/Failed to load resource/.test(message.text())) errors.push(message.text()); });
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path);
      // Hydration only runs when the page ships prerendered markup for exactly this URL.
      await expect(page.locator('#root')).toHaveAttribute('data-ssr-route', path === '/vi' ? '/vi' : path);
      await page.waitForFunction(() => document.getElementById('root')?.children.length, undefined, { timeout: 10_000 });
      await page.waitForTimeout(1500);
    }
    expect(errors, `console/page errors on ${path}`).toEqual([]);
  });
}

test('phone country list is filled in after hydration and keeps Vietnam selected', async ({ page }) => {
  await page.goto('/products');
  const select = page.locator('select[id$="-phone-country"]').first();
  await select.scrollIntoViewIfNeeded();
  await expect.poll(() => select.locator('option').count()).toBeGreaterThan(200);
  await expect(select).toHaveValue('VN');
});

test('One Change contrast: footer disclaimer, tagline and coach label are at least 5:1', async ({ page }) => {
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/challenges/one-change');
    const ratios = await page.evaluate(() => {
      const channel = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
      const lum = ([r, g, b]: number[]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      const rgb = (css: string) => (css.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const ratio = (a: number[], b: number[]) => { const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
      const probe = (selector: string, background: number[]) => { const el = document.querySelector(selector)!; return { selector, fontSize: getComputedStyle(el).fontSize, ratio: ratio(rgb(getComputedStyle(el).color), background) }; };
      // Backgrounds: cream page #f8f5ee, coach panel at its lightest gradient point #2c4b43.
      return [probe('.disclaimer', [248, 245, 238]), probe('.brand-text small', [248, 245, 238]), probe('.coach .label', [44, 75, 67])];
    });
    for (const item of ratios) expect(item.ratio, `${item.selector} (${item.fontSize}) at ${width}px`).toBeGreaterThanOrEqual(5);
  }
});

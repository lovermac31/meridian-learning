import { expect, test, type Page } from '@playwright/test';

// /api/event is answered locally (204) and every POST body is recorded; no request reaches a real backend.
async function collect(page: Page): Promise<Array<Record<string, string>>> {
  const events: Array<Record<string, string>> = [];
  await page.route('**/api/event', async route => {
    const raw = route.request().postData() ?? '{}';
    events.push(JSON.parse(raw));
    await route.fulfill({ status: 204 });
  });
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    return url.origin === 'http://127.0.0.1:4177' || url.pathname === '/api/event' ? route.fallback() : route.abort();
  });
  return events;
}

const UTM = 'utm_source=facebook&utm_medium=social&utm_campaign=story-club-14nov&utm_content=fb-en-01';

test('one page_view per load on /story-club and /vi/story-club, with utm fields and the referrer host', async ({ browser }) => {
  for (const [path, locale] of [['/story-club', 'en'], ['/vi/story-club', 'vi']]) {
    const context = await browser.newContext({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Version/17.5 Mobile/15E148 Safari/604.1' });
    // A real browser is not webdriver-flagged; Playwright sets navigator.webdriver, so the test hides it to act as a person.
    await context.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
    const page = await context.newPage();
    const events = await collect(page);
    await page.goto(`${path}?${UTM}`, { referer: 'https://l.facebook.com/' });
    await expect(page.locator('h1')).toHaveCount(1);
    await page.waitForTimeout(800);
    const views = events.filter(e => e.event === 'page_view');
    expect(views, `${path} page_view count`).toHaveLength(1);
    expect(views[0]).toMatchObject({ path, locale, utm_source: 'facebook', utm_medium: 'social', utm_campaign: 'story-club-14nov', utm_content: 'fb-en-01', referrer_host: 'l.facebook.com' });
    expect(Object.keys(views[0]).sort()).toEqual(['event', 'locale', 'path', 'referrer_host', 'utm_campaign', 'utm_content', 'utm_medium', 'utm_source']);
    await context.close();
  }
});

test('zero page_view events from a bot user agent and from an automated browser', async ({ browser }) => {
  for (const userAgent of ['Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', 'Mozilla/5.0 HeadlessChrome/120.0.0.0 Safari/537.36']) {
    const context = await browser.newContext({ userAgent });
    const page = await context.newPage();
    const events = await collect(page);
    await page.goto(`/story-club?${UTM}`);
    await expect(page.locator('h1')).toHaveCount(1);
    await page.waitForTimeout(800);
    expect(events.filter(e => e.event === 'page_view'), userAgent).toHaveLength(0);
    await context.close();
  }
  // Unmodified Playwright (navigator.webdriver true, default Chrome UA) is also not counted.
  const context = await browser.newContext();
  const page = await context.newPage();
  const events = await collect(page);
  await page.goto('/story-club');
  await page.waitForTimeout(800);
  expect(events.filter(e => e.event === 'page_view')).toHaveLength(0);
  await context.close();
});

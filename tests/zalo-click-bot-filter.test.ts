/**
 * Do not count automated requests as zalo_click (master brief, 1 Nov 2026). Real browsers — including Zalo's own
 * in-app browser — are counted; probes, headless browsers, crawlers, monitors, HTTP libraries and this repo's
 * browser tests are redirected but not counted. Historic rows are not touched by this change.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { AUTOMATION_HEADER, classifyRequest, isAutomatedRequest } from '../api/_lib/automation';
import zaloHandler, { ZALO_TARGET } from '../api/go/zalo';

const HUMAN_USER_AGENTS: Record<string, string> = {
  'Chrome 130 on Windows': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Chrome on Android': 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.102 Mobile Safari/537.36',
  'Safari on iPhone': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  'Safari on macOS': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  'Firefox on Windows': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:131.0) Gecko/20100101 Firefox/131.0',
  'Samsung Internet': 'Mozilla/5.0 (Linux; Android 13; SAMSUNG SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
  'Zalo in-app browser (Android)': 'Mozilla/5.0 (Linux; Android 13; V2120 Build/TP1A.220624.014; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.179 Mobile Safari/537.36 Zalo android/23110101 ZaloTheme/light ZaloLanguage/vi',
  'Zalo in-app browser (iOS)': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Zalo iOS/23.10.01 ZaloTheme/light ZaloLanguage/vi',
  'Facebook in-app browser': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0.0.29.106;FBBV/612345678;FBDV/iPhone15,2;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBID/phone;FBLC/vi_VN;FBOP/5]',
  'Edge on Windows': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.2849.56',
};

const AUTOMATED_USER_AGENTS: Record<string, string> = {
  'Playwright headless shell': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/141.0.0.0 Safari/537.36',
  'Puppeteer': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/129.0.0.0 Safari/537.36 Puppeteer',
  'Lighthouse': 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36 Chrome-Lighthouse',
  'PageSpeed': 'Mozilla/5.0 (compatible; Google Page Speed Insights) Chrome/130.0.0.0',
  'Googlebot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; Googlebot/2.1; +http://www.google.com/bot.html) Chrome/130.0.0.0 Safari/537.36',
  'GoogleOther': 'GoogleOther',
  'Bingbot': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
  'Generic crawler': 'SomethingCrawler/1.0 (+https://example.test)',
  'Spider': 'Mozilla/5.0 (compatible; AhrefsSiteAudit/6.1; +http://ahrefs.com/robot/site-audit) spider',
  'curl': 'curl/8.7.1',
  'wget': 'Wget/1.21.4',
  'python-requests': 'python-requests/2.32.3',
  'Node fetch (undici)': 'undici',
  'node-fetch': 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)',
  'Go http client': 'Go-http-client/2.0',
  'okhttp': 'okhttp/4.12.0',
  'Atlas page-health': 'AtlasHealth/1.0 (page-health)',
  'Vercel': 'Vercel Edge Functions',
  'Uptime monitor': 'UptimeRobot/2.0; http://www.uptimerobot.com/',
  'Monitor': 'Site24x7 monitor',
  'Selenium': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Selenium WebDriver',
  // Link-preview fetchers: every shared link gets a GET from these before any human taps it.
  'Facebook link preview': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'WhatsApp link preview': 'WhatsApp/2.23.20.0 A',
  'Telegram link preview': 'TelegramBot (like TwitterBot)',
  'Zalo link preview (bot token)': 'Mozilla/5.0 (compatible; Zalo-Bot/1.0; +https://zalo.me)',
};

test('real browsers, including the Zalo and Facebook in-app browsers, are counted', () => {
  for (const [name, ua] of Object.entries(HUMAN_USER_AGENTS)) {
    assert.equal(isAutomatedRequest({ 'user-agent': ua }, 'GET'), false, name);
  }
});

test('headless browsers, crawlers, monitors and HTTP libraries are not counted', () => {
  for (const [name, ua] of Object.entries(AUTOMATED_USER_AGENTS)) {
    assert.deepEqual(classifyRequest({ 'user-agent': ua }, 'GET'), { automated: true, reason: 'user-agent' }, name);
  }
});

test('probes without a browser are not counted: HEAD/OPTIONS, missing or blank User-Agent, header-array form', () => {
  const chrome = HUMAN_USER_AGENTS['Chrome 130 on Windows'];
  assert.deepEqual(classifyRequest({ 'user-agent': chrome }, 'HEAD'), { automated: true, reason: 'method' });
  assert.deepEqual(classifyRequest({ 'user-agent': chrome }, 'OPTIONS'), { automated: true, reason: 'method' });
  assert.deepEqual(classifyRequest({}, 'GET'), { automated: true, reason: 'no-user-agent' });
  assert.deepEqual(classifyRequest(undefined, 'GET'), { automated: true, reason: 'no-user-agent' });
  assert.deepEqual(classifyRequest({ 'user-agent': '   ' }, 'GET'), { automated: true, reason: 'no-user-agent' });
  assert.deepEqual(classifyRequest({ 'user-agent': ['curl/8.7.1'] }, 'GET'), { automated: true, reason: 'user-agent' });
  assert.deepEqual(classifyRequest({ 'user-agent': [chrome] }, 'get'), { automated: false });
});

test(`this repo's own browser tests declare themselves with ${AUTOMATION_HEADER} and are never counted`, () => {
  const chrome = HUMAN_USER_AGENTS['Chrome 130 on Windows'];
  assert.equal(AUTOMATION_HEADER, 'x-je-automation');
  assert.deepEqual(classifyRequest({ 'user-agent': chrome, 'x-je-automation': 'playwright' }, 'GET'), { automated: true, reason: 'header' });
  assert.deepEqual(classifyRequest({ 'user-agent': chrome, 'x-je-automation': '' }, 'GET'), { automated: true, reason: 'header' }, 'presence counts, not the value');
  for (const config of ['playwright.navbar.config.ts', 'playwright.pay-everywhere.config.ts', 'playwright.reserve.config.ts', 'playwright.story-club-status.config.ts']) {
    assert.match(readFileSync(new URL(`../${config}`, import.meta.url), 'utf8'), /extraHTTPHeaders: \{ 'x-je-automation': 'playwright' \}/, config);
  }
  for (const spec of ['tests/browser/story-club-reserve.spec.ts', 'tests/browser/pay-everywhere.spec.ts']) {
    assert.match(readFileSync(new URL(`../${spec}`, import.meta.url), 'utf8'), /url\.pathname\.startsWith\('\/go\/'\)\) return route\.abort\(\)/, `${spec} refuses the click redirects`);
  }
});

function mockRes() {
  const headers: Record<string, string> = {};
  let statusCode = 200;
  return {
    headers,
    get statusCode() { return statusCode; },
    status(code: number) { statusCode = code; return this; },
    setHeader(key: string, value: string) { headers[key.toLowerCase()] = value; return this; },
    json() { return this; },
    end() { return this; },
  };
}

test('the redirect itself is unchanged for automation; only the insert is skipped, and the response says so', async () => {
  const cases: Array<[string, Record<string, string>, string]> = [
    ['GET', { 'user-agent': AUTOMATED_USER_AGENTS['Playwright headless shell'] }, 'skipped:user-agent'],
    ['HEAD', { 'user-agent': HUMAN_USER_AGENTS['Safari on iPhone'] }, 'skipped:method'],
    ['GET', {}, 'skipped:no-user-agent'],
    ['GET', { 'user-agent': HUMAN_USER_AGENTS['Chrome on Android'], 'x-je-automation': 'playwright' }, 'skipped:header'],
    ['GET', { 'user-agent': HUMAN_USER_AGENTS['Zalo in-app browser (Android)'] }, 'recorded'],
  ];
  for (const [method, headers, expected] of cases) {
    const res = mockRes();
    await zaloHandler({ method, url: '/go/zalo?utm_source=products', query: { utm_source: 'products' }, headers } as any, res as any);
    assert.equal(res.statusCode, 302, expected);
    assert.equal(res.headers.location, ZALO_TARGET, expected);
    assert.equal(res.headers['x-je-click'], expected);
  }
});

test('the handler never writes to the database for automated requests (source guard)', () => {
  const source = readFileSync(new URL('../api/go/zalo.ts', import.meta.url), 'utf8');
  const skip = source.indexOf('if (verdict.automated)');
  const insert = source.indexOf('await recordServerEvent(');
  assert.ok(skip > 0 && insert > skip, 'recordServerEvent sits inside the non-automated branch');
  assert.doesNotMatch(source, /UPDATE|DELETE/i, 'historic rows are never altered');
});

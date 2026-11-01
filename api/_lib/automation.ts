/**
 * Automated-request detection for the click-logging redirects.
 *
 * Why (master, 1 Nov 2026, SQL on public.je_events): zalo_click rows were inflated by automation — on 29 Oct three
 * bursts of 32–33 rows, all utm_source=products, one per priced product page; on 30 Oct–1 Nov exactly 1, 1 and 3
 * clicks per day on each institutional page (a link walker). Human clicks are a small fraction of the total.
 *
 * A request is treated as automated when it is a HEAD/OPTIONS probe, carries no User-Agent, carries a known
 * headless-browser, crawler, monitor or HTTP-library User-Agent, or carries the `x-je-automation` header that this
 * repo's own browser tests send. The redirect still happens; only the event insert is skipped. Historic rows are
 * never touched.
 */

export const AUTOMATION_HEADER = 'x-je-automation';

/** Pure pattern test, exported for tests and for anything that classifies a stored UA later. */
export const AUTOMATED_USER_AGENT = /HeadlessChrome|Playwright|Puppeteer|Lighthouse|Page ?Speed|Chrome-Lighthouse|bot|crawler|spider|curl|wget|python-requests|python-urllib|aiohttp|node-fetch|undici|axios|Go-http-client|okhttp|java\/|libwww|AtlasHealth|GoogleOther|Vercel|uptime|monitor|HeadlessShell|PhantomJS|Selenium|WebDriver|scrapy|httpx/i;

type HeaderValue = string | string[] | undefined;
type Headers = Record<string, HeaderValue> | undefined;

function header(headers: Headers, name: string): string | undefined {
  const value = headers?.[name] ?? headers?.[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return typeof value === 'string' ? value : undefined;
}

export type AutomationVerdict =
  | { automated: false }
  | { automated: true; reason: 'method' | 'no-user-agent' | 'user-agent' | 'header' };

/** Why a request is or is not counted. Prefer `isAutomatedRequest` unless the reason is needed. */
export function classifyRequest(headers: Headers, method: string | undefined): AutomationVerdict {
  const verb = (method ?? 'GET').toUpperCase();
  if (verb === 'HEAD' || verb === 'OPTIONS') return { automated: true, reason: 'method' };
  if (header(headers, AUTOMATION_HEADER) !== undefined) return { automated: true, reason: 'header' };
  const userAgent = header(headers, 'user-agent')?.trim();
  if (!userAgent) return { automated: true, reason: 'no-user-agent' };
  if (AUTOMATED_USER_AGENT.test(userAgent)) return { automated: true, reason: 'user-agent' };
  return { automated: false };
}

/** True when the request must not be counted as a human click. */
export function isAutomatedRequest(headers: Headers, method: string | undefined): boolean {
  return classifyRequest(headers, method).automated;
}

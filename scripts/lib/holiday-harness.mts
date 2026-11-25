/**
 * LOCAL-ONLY harness for the holiday-set money path (used by scripts/probe-holiday-sets.mts and tests/holiday-sets.test.ts).
 *
 * It calls the real handlers in api/sample-pack.ts and api/sepay-webhook.ts in-process, with:
 *   - a fixed clock (the handlers read `new Date()`; `atTime` replaces Date for the call, so the window can be tested to the millisecond),
 *   - a mocked `fetch` that answers only the Notion calls the order writer makes and THROWS on any other URL (no production
 *     service, database, bank or email is ever reached),
 *   - synthetic environment values set for the call and restored after it (no real key is read or printed).
 * Nothing here talks to a network. Do not point it at production.
 */
import sampleHandler from '../../api/sample-pack.js';
import webhookHandler from '../../api/sepay-webhook.js';

const schema = {
  'Lead Name': { type: 'title' }, Email: { type: 'email' }, 'Contact (Zalo / Phone)': { type: 'phone_number' },
  'Preferred Channel': { type: 'select' }, Source: { type: 'select' }, 'UTM / Raw Source': { type: 'rich_text' },
  'Lifecycle Stage': { type: 'select' }, 'Next Action': { type: 'rich_text' },
};

/** Runs `fn` with `Date` frozen at `iso`. The real Date is restored even if `fn` throws. */
export async function atTime<T>(iso: string, fn: () => Promise<T>): Promise<T> {
  const RealDate = Date;
  const fixed = RealDate.parse(iso);
  if (!Number.isFinite(fixed)) throw new Error(`Bad probe time ${iso}`);
  class FrozenDate extends RealDate {
    constructor(...args: [] | [number | string | Date]) { super(args.length ? (args[0] as number) : fixed); }
    static override now() { return fixed; }
  }
  (globalThis as { Date: DateConstructor }).Date = FrozenDate as unknown as DateConstructor;
  try { return await fn(); } finally { (globalThis as { Date: DateConstructor }).Date = RealDate; }
}

type Restore = () => void;
function setEnv(values: Record<string, string | undefined>): Restore {
  const before: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(values)) { before[key] = process.env[key]; if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  return () => { for (const [key, value] of Object.entries(before)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } };
}

export type CallResult = { status: number; body: Record<string, unknown> | undefined; notionWrites: number; notionCalls: number; logs: string[] };

let ipCounter = 0;
const nextIp = () => `198.51.100.${(ipCounter++ % 250) + 1}`;
export const uuid4 = (n: number) => `0000${n.toString(16).padStart(4, '0')}-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;

/** POST /api/sample-pack in-process. `at` is the instant the server sees. */
export async function callSamplePack(body: Record<string, unknown>, at: string): Promise<CallResult> {
  const restoreEnv = setEnv({ NOTION_TOKEN: 'synthetic-local-token', NOTION_LEADS_DB_ID: undefined, RESEND_API_KEY: undefined, GET_STARTED_NOTIFY_EMAIL: undefined, SUPABASE_URL: undefined, SUPABASE_WRITE_KEY: undefined });
  const realFetch = globalThis.fetch;
  const realConsole = { info: console.info, warn: console.warn, error: console.error };
  const logs: string[] = [];
  let notionWrites = 0; let notionCalls = 0; let status = 0; let json: Record<string, unknown> | undefined;
  globalThis.fetch = (async (input: unknown, init?: { method?: string }) => {
    const url = String(input);
    if (!/^https:\/\/api\.notion\.com\//.test(url)) throw new Error(`BLOCKED network call in local probe: ${url}`);
    notionCalls += 1;
    if (url.endsWith('/query')) return new Response(JSON.stringify({ results: [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    if (url.endsWith('/pages') && init?.method === 'POST') { notionWrites += 1; return new Response(JSON.stringify({ id: 'mock-page' }), { status: 200, headers: { 'Content-Type': 'application/json' } }); }
    return new Response(JSON.stringify({ properties: schema }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }) as typeof fetch;
  for (const method of ['info', 'warn', 'error'] as const) console[method] = ((...args: unknown[]) => { logs.push(JSON.stringify(args)); }) as never;
  const res = { setHeader() { return res; }, status(code: number) { status = code; return res; }, json(value: unknown) { json = value as Record<string, unknown>; return res; } };
  try {
    await atTime(at, async () => {
      await sampleHandler({ method: 'POST', headers: { 'x-forwarded-for': nextIp(), 'content-type': 'application/json' }, body } as never, res as never);
      // The prepare step writes its Notion lead without waiting for it; let that promise settle before counting.
      await new Promise((resolve) => setTimeout(resolve, 20));
    });
    return { status, body: json, notionWrites, notionCalls, logs };
  } finally {
    globalThis.fetch = realFetch;
    for (const method of ['info', 'warn', 'error'] as const) console[method] = realConsole[method];
    restoreEnv();
  }
}

/** The prepare-payment request the checkout page sends when the buyer presses "Get my payment code". */
export const prepareBody = (product: string, n: number) => ({ intent: 'prepare_payment', product, submissionKey: uuid4(n), startedAt: '', website: '' });
/** The contact-form request the checkout page sends after the buyer has paid. `at` is only used to set a believable startedAt. */
export const formBody = (product: string, n: number, at: string) => ({
  name: 'Local Probe', phone: '0396085076', email: 'probe@example.invalid', location: 'VN', teacher: false, consent: true, locale: 'en',
  placement: 'home', source: 'probe', submissionKey: uuid4(n), utm_source: 'probe', utm_content: 'holiday-sets', product, group: '', website: '',
  startedAt: new Date(Date.parse(at) - 5_000).toISOString(),
});

export type WebhookResult = { status: number; body: unknown; outcome: string | null; memo: string | null };

/** POST /api/sepay-webhook in-process with a synthetic key; returns the answer and the logged outcome. */
export async function callWebhook(payload: Record<string, unknown>, at: string, auth = 'Apikey synthetic-local-webhook-key'): Promise<WebhookResult> {
  const restoreEnv = setEnv({ SEPAY_WEBHOOK_KEY: 'synthetic-local-webhook-key', SEPAY_AUTOCONFIRM: '1', RESEND_API_KEY: undefined, GET_STARTED_NOTIFY_EMAIL: undefined, ORDER_NOTIFY_EMAIL: undefined, SUPABASE_URL: undefined, SUPABASE_WRITE_KEY: undefined });
  const realFetch = globalThis.fetch;
  const realInfo = console.info;
  let outcome: string | null = null; let memo: string | null = null; let status = 0; let body: unknown;
  globalThis.fetch = (async (input: unknown) => { throw new Error(`BLOCKED network call in local probe: ${String(input)}`); }) as typeof fetch;
  console.info = ((channel: unknown, detail: unknown) => {
    if (typeof channel === 'string' && channel.startsWith('sepay_') && !channel.endsWith('_alert') && detail && typeof detail === 'object') {
      outcome = String((detail as { status?: unknown }).status ?? ''); memo = String((detail as { memo?: unknown }).memo ?? '');
    }
  }) as never;
  const res = { setHeader() { return res; }, status(code: number) { status = code; return res; }, json(value: unknown) { body = value; return res; } };
  try {
    await atTime(at, async () => {
      await webhookHandler({ method: 'POST', headers: { authorization: auth, 'content-length': '200' }, body: payload } as never, res as never);
    });
    return { status, body, outcome, memo };
  } finally {
    globalThis.fetch = realFetch; console.info = realInfo; restoreEnv();
  }
}

import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/sample-pack';

const schema = {
  'Lead Name': { type: 'title' },
  Email: { type: 'email' },
  'Contact (Zalo / Phone)': { type: 'phone_number' },
  'Preferred Channel': { type: 'select' },
  Source: { type: 'select' },
  'UTM / Raw Source': { type: 'rich_text' },
  'Lifecycle Stage': { type: 'select' },
  'Next Action': { type: 'rich_text' },
};

async function submit(body: Record<string, unknown>, ip: string) {
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    token: process.env.NOTION_TOKEN,
    dbId: process.env.NOTION_LEADS_DB_ID,
    resend: process.env.RESEND_API_KEY,
    notify: process.env.GET_STARTED_NOTIFY_EMAIL,
    from: process.env.GET_STARTED_FROM_EMAIL,
  };
  const originalConsole = { info: console.info, warn: console.warn, error: console.error };
  const logs: string[] = [];
  const writes: Record<string, unknown>[] = [];
  let statusCode = 200;
  let responseBody: unknown;
  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    if (url.includes('/databases/')) {
      return new Response(JSON.stringify({ properties: schema }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.endsWith('/pages') && init?.method === 'POST') {
      writes.push(JSON.parse(String(init.body)) as Record<string, unknown>);
      return new Response(JSON.stringify({ id: 'mock-notion-page' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    throw new Error('Unexpected network request in sample-pack handler test');
  }) as typeof fetch;
  process.env.NOTION_TOKEN = 'unit-test-token-do-not-log';
  delete process.env.NOTION_LEADS_DB_ID;
  delete process.env.RESEND_API_KEY;
  delete process.env.GET_STARTED_NOTIFY_EMAIL;
  delete process.env.GET_STARTED_FROM_EMAIL;
  for (const method of ['info', 'warn', 'error'] as const) {
    console[method] = ((...args: unknown[]) => { logs.push(JSON.stringify(args)); }) as typeof console[typeof method];
  }
  const res = {
    setHeader() { return this; },
    status(code: number) { statusCode = code; return this; },
    json(body: unknown) { responseBody = body; return this; },
  };
  try {
    await handler({
      method: 'POST',
      headers: { 'x-forwarded-for': ip, 'content-type': 'application/json' },
      body: { consent: true, locale: 'en', placement: 'home', startedAt: new Date(Date.now() - 31_000).toISOString(), ...body },
    } as never, res as never);
    return { statusCode, responseBody: responseBody as Record<string, unknown> | undefined, writes, logs };
  } finally {
    globalThis.fetch = originalFetch;
    for (const method of ['info', 'warn', 'error'] as const) console[method] = originalConsole[method];
    if (originalEnv.token === undefined) delete process.env.NOTION_TOKEN; else process.env.NOTION_TOKEN = originalEnv.token;
    if (originalEnv.dbId === undefined) delete process.env.NOTION_LEADS_DB_ID; else process.env.NOTION_LEADS_DB_ID = originalEnv.dbId;
    if (originalEnv.resend === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalEnv.resend;
    if (originalEnv.notify === undefined) delete process.env.GET_STARTED_NOTIFY_EMAIL; else process.env.GET_STARTED_NOTIFY_EMAIL = originalEnv.notify;
    if (originalEnv.from === undefined) delete process.env.GET_STARTED_FROM_EMAIL; else process.env.GET_STARTED_FROM_EMAIL = originalEnv.from;
  }
}

test('sample-pack API returns a localized 400 when both reply channels are missing', async () => {
  const result = await submit({ consent: true }, '198.51.100.41');
  assert.equal(result.statusCode, 400);
  assert.equal(result.responseBody?.error, 'contact');
  assert.equal(result.responseBody?.message, 'Enter a Zalo number or an email.');
  assert.equal(result.writes.length, 0);
});

test('sample-pack API accepts a phone-only lead and writes normalized +84 to the Notion phone property', async () => {
  const result = await submit({ phone: '0396 085.076' }, '198.51.100.42');
  assert.equal(result.statusCode, 200);
  const properties = result.writes[0].properties as Record<string, Record<string, unknown>>;
  assert.equal((properties['Contact (Zalo / Phone)'].phone_number), '+84396085076');
  assert.equal(properties.Email, undefined);
  assert.equal((properties['Preferred Channel'].select as { name: string }).name, 'Zalo');
});

test('sample-pack API accepts email-only submissions', async () => {
  const result = await submit({ email: 'Parent@Example.com' }, '198.51.100.43');
  assert.equal(result.statusCode, 200);
  const properties = result.writes[0].properties as Record<string, Record<string, unknown>>;
  assert.equal((properties.Email.email), 'parent@example.com');
  assert.equal(properties['Contact (Zalo / Phone)'], undefined);
  assert.equal((properties['Preferred Channel'].select as { name: string }).name, 'Email');
});

test('sample-pack API rejects an invalid Vietnam phone even when email is also supplied', async () => {
  const result = await submit({ phone: '090-1234-567', email: 'parent@example.com' }, '198.51.100.44');
  assert.equal(result.statusCode, 400);
  assert.equal(result.responseBody?.error, 'phone');
  assert.equal(result.responseBody?.message, 'Enter a Vietnamese number as 0xxxxxxxxx or +84xxxxxxxxx.');
  assert.equal(result.writes.length, 0);
});

test('sample-pack API retains the 30-second start-time guard and website honeypot', async () => {
  const tooFast = await submit({ phone: '0396085076', startedAt: new Date(Date.now() - 29_000).toISOString() }, '198.51.100.46');
  assert.equal(tooFast.statusCode, 400);
  assert.equal(tooFast.responseBody?.error, 'Submission could not be accepted.');
  assert.equal(tooFast.writes.length, 0);
  const honeypot = await submit({ phone: '0396085076', website: 'filled' }, '198.51.100.47');
  assert.equal(honeypot.statusCode, 400);
  assert.equal(honeypot.writes.length, 0);
});

test('sample-pack server logs never contain the submitted or normalized phone number', async () => {
  const result = await submit({ phone: '0396 085.076' }, '198.51.100.45');
  const output = result.logs.join('\n');
  assert.equal(output.includes('0396 085.076'), false);
  assert.equal(output.includes('+84396085076'), false);
});

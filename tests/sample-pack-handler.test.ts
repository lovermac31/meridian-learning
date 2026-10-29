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

type MockNotion = { ids: Set<string> };

async function submit(body: Record<string, unknown>, ip: string, options: { notion?: 'up' | 'down'; database?: MockNotion; email?: boolean; reservation?: 'up' | 'down' } = {}) {
  const originalFetch = globalThis.fetch;
  const originalEnv = {
    token: process.env.NOTION_TOKEN,
    dbId: process.env.NOTION_LEADS_DB_ID,
    resend: process.env.RESEND_API_KEY,
    notify: process.env.GET_STARTED_NOTIFY_EMAIL,
    from: process.env.GET_STARTED_FROM_EMAIL,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_WRITE_KEY,
  };
  const originalConsole = { info: console.info, warn: console.warn, error: console.error };
  const logs: string[] = [];
  const writes: Record<string, unknown>[] = [];
  let emailCalls = 0;
  let reservationCalls = 0;
  const database = options.database ?? { ids: new Set<string>() };
  let statusCode = 200;
  let responseBody: unknown;
  globalThis.fetch = (async (input, init) => {
    const url = String(input);
    if (url === 'https://api.resend.com/emails') {
      emailCalls++;
      return new Response(JSON.stringify({ id: 'mock-email' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.endsWith('/rpc/create_story_club_reservation')) {
      reservationCalls++;
      if (options.reservation === 'down') return new Response('Synthetic RPC outage', { status: 503 });
      const payload = JSON.parse(String(init?.body)) as { p_submission_id: string };
      const memo = `SC-${payload.p_submission_id.replace(/-/g, '').slice(-6).toUpperCase()}`;
      return new Response(JSON.stringify({ memo, created: reservationCalls === 1 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.includes('/databases/') && url.endsWith('/query')) {
      if (options.notion === 'down') return new Response('Synthetic Notion outage', { status: 503 });
      const payload = JSON.parse(String(init?.body)) as { filter?: { property?: string; rich_text?: { contains?: string } } };
      const id = payload.filter?.rich_text?.contains?.replace('registration_id: ', '') ?? '';
      return new Response(JSON.stringify({ results: database.ids.has(id) ? [{ id: 'mock-existing' }] : [] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.includes('/databases/')) {
      if (options.notion === 'down') return new Response('Synthetic Notion outage', { status: 503 });
      return new Response(JSON.stringify({ properties: schema }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    if (url.endsWith('/pages') && init?.method === 'POST') {
      if (options.notion === 'down') return new Response('Synthetic Notion outage', { status: 503 });
      writes.push(JSON.parse(String(init.body)) as Record<string, unknown>);
      const record = writes.at(-1) as { properties?: { 'UTM / Raw Source'?: { rich_text?: Array<{ text?: { content?: string } }> } } };
      const notes = record.properties?.['UTM / Raw Source']?.rich_text?.[0]?.text?.content ?? '';
      const match = notes.match(/registration_id: ([^ ·]+)/);
      if (match) database.ids.add(match[1]);
      return new Response(JSON.stringify({ id: 'mock-notion-page' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    throw new Error('Unexpected network request in sample-pack handler test');
  }) as typeof fetch;
  process.env.NOTION_TOKEN = 'unit-test-token-do-not-log';
  delete process.env.NOTION_LEADS_DB_ID;
  delete process.env.RESEND_API_KEY;
  delete process.env.GET_STARTED_NOTIFY_EMAIL;
  delete process.env.GET_STARTED_FROM_EMAIL;
  process.env.SUPABASE_URL = 'http://127.0.0.1:55421';
  process.env.SUPABASE_WRITE_KEY = 'sb_secret_synthetic-reservation-key';
  if (options.email) {
    process.env.RESEND_API_KEY = 'synthetic-resend-key';
    process.env.GET_STARTED_NOTIFY_EMAIL = 'synthetic-notify@example.invalid';
  }
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
    return { statusCode, responseBody: responseBody as Record<string, unknown> | undefined, writes, logs, database, emailCalls, reservationCalls };
  } finally {
    globalThis.fetch = originalFetch;
    for (const method of ['info', 'warn', 'error'] as const) console[method] = originalConsole[method];
    if (originalEnv.token === undefined) delete process.env.NOTION_TOKEN; else process.env.NOTION_TOKEN = originalEnv.token;
    if (originalEnv.dbId === undefined) delete process.env.NOTION_LEADS_DB_ID; else process.env.NOTION_LEADS_DB_ID = originalEnv.dbId;
    if (originalEnv.resend === undefined) delete process.env.RESEND_API_KEY; else process.env.RESEND_API_KEY = originalEnv.resend;
    if (originalEnv.notify === undefined) delete process.env.GET_STARTED_NOTIFY_EMAIL; else process.env.GET_STARTED_NOTIFY_EMAIL = originalEnv.notify;
    if (originalEnv.from === undefined) delete process.env.GET_STARTED_FROM_EMAIL; else process.env.GET_STARTED_FROM_EMAIL = originalEnv.from;
    if (originalEnv.supabaseUrl === undefined) delete process.env.SUPABASE_URL; else process.env.SUPABASE_URL = originalEnv.supabaseUrl;
    if (originalEnv.supabaseKey === undefined) delete process.env.SUPABASE_WRITE_KEY; else process.env.SUPABASE_WRITE_KEY = originalEnv.supabaseKey;
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

test('Story Club reserve accepts a valid short-form lead with product and UTM context', async () => {
  const result = await submit({
    name: 'Synthetic Parent', phone: '0396 085 076', childAge: '7', group: 'sat-0900', product: 'story-club',
    submissionKey: '123e4567-e89b-42d3-a456-426614174000',
    utm_source: 'reserve', utm_content: 'story-club-reserve', utm_medium: 'social', utm_campaign: 'autumn', utm_term: 'story time', startedAt: new Date(Date.now() - 2_000).toISOString(),
  }, '198.51.100.48');
  assert.equal(result.statusCode, 200);
  assert.match(String(result.responseBody?.memo), /^SC-[A-Z0-9]{6}$/);
  const properties = result.writes[0].properties as Record<string, Record<string, any>>;
  const notes = properties['UTM / Raw Source'].rich_text[0].text.content as string;
  assert.match(notes, /product: story-club/);
  assert.match(notes, /utm_source: reserve/);
  assert.match(notes, /utm_content: story-club-reserve/);
  assert.match(notes, /utm_medium: social/);
  assert.match(notes, /utm_campaign: autumn/);
  assert.match(notes, /utm_term: story time/);
  assert.match(notes, /preferred group: sat-0900/);
  assert.equal(result.logs.join('\n').includes('0396 085 076'), false);
});

test('Story Club accepts valid English and Vietnamese submissions through the mocked CRM writer', async () => {
  for (const [locale, ip] of [['en', '198.51.100.61'], ['vi', '198.51.100.62']] as const) {
    const result = await submit({
      locale, name: 'Synthetic Parent', phone: '0396 085 076', childAge: '7', group: 'sat-0900', product: 'story-club',
      submissionKey: locale === 'en' ? '223e4567-e89b-42d3-a456-426614174000' : '323e4567-e89b-42d3-a456-426614174000',
    }, ip);
    assert.equal(result.statusCode, 200, locale);
    assert.equal(result.responseBody?.ok, true, locale);
    assert.equal(result.writes.length, 1, locale);
  }
});

test('Story Club rejects an invalid Zalo number, a filled honeypot and a too-fast submission', async () => {
  const key = '423e4567-e89b-42d3-a456-426614174000';
  const base = { name: 'Synthetic Parent', childAge: '7', group: 'sat-0900', product: 'story-club', submissionKey: key };
  const badZalo = await submit({ ...base, phone: '12345' }, '198.51.100.63');
  assert.equal(badZalo.statusCode, 400);
  assert.equal(badZalo.responseBody?.error, 'phone');
  assert.equal(badZalo.writes.length, 0);

  const honeypot = await submit({ ...base, phone: '0396 085 076', website: 'Synthetic bot' }, '198.51.100.64');
  assert.equal(honeypot.statusCode, 400);
  assert.equal(honeypot.writes.length, 0);

  const tooFast = await submit({ ...base, phone: '0396 085 076', startedAt: new Date().toISOString() }, '198.51.100.65');
  assert.equal(tooFast.statusCode, 400);
  assert.equal(tooFast.responseBody?.error, 'Submission could not be accepted.');
  assert.equal(tooFast.writes.length, 0);
});

test('Notion outage keeps the reserve thank-you response when the mocked email fallback succeeds; logs omit PII', async () => {
  const result = await submit({
    name: 'Synthetic Private Parent', phone: '0396 085 076', childAge: '7', group: 'sat-0900', product: 'story-club',
    submissionKey: '523e4567-e89b-42d3-a456-426614174000',
  }, '198.51.100.66', { notion: 'down', email: true });
  assert.equal(result.statusCode, 200);
  assert.equal(result.responseBody?.ok, true);
  const logs = result.logs.join('\n');
  assert.match(logs, /"notionOk":false/);
  assert.equal(logs.includes('Synthetic Private Parent'), false);
  assert.equal(logs.includes('0396 085 076'), false);
  assert.equal(result.writes.length, 0);
});

test('Story Club duplicate submission reuses its key and does not create a second CRM page or email', async () => {
  const database = { ids: new Set<string>() };
  const body = {
    name: 'Synthetic Parent', phone: '0396 085 076', childAge: '7', group: 'sat-0900', product: 'story-club',
    submissionKey: '623e4567-e89b-42d3-a456-426614174000',
  };
  const first = await submit(body, '198.51.100.67', { database, email: true });
  const second = await submit(body, '198.51.100.67', { database, email: true });
  assert.equal(first.statusCode, 200);
  assert.equal(first.responseBody?.memo, second.responseBody?.memo);
  assert.equal(first.writes.length, 1);
  assert.equal(second.statusCode, 200);
  assert.equal(second.writes.length, 0);
  assert.equal(second.logs.join('\n').includes('duplicate_skipped'), true);
  assert.equal(first.emailCalls, 1);
  assert.equal(second.emailCalls, 0);
});

test('Story Club reservation persistence outage fails closed before CRM/email and exposes no memo', async () => {
  const result = await submit({
    name: 'Synthetic Parent', phone: '0396 085 076', childAge: '7', group: 'sat-0900', product: 'story-club',
    submissionKey: '723e4567-e89b-42d3-a456-426614174000',
  }, '198.51.100.68', { reservation: 'down', email: true });
  assert.equal(result.statusCode, 503);
  assert.equal(result.responseBody?.memo, undefined);
  assert.equal(result.writes.length, 0);
  assert.equal(result.emailCalls, 0);
  assert.equal(result.reservationCalls, 1);
});

test('Story Club reserve rejects invalid age, group and product at the existing endpoint', async () => {
  const base = { name: 'Synthetic Parent', phone: '0396 085 076', product: 'story-club', startedAt: new Date(Date.now() - 2_000).toISOString() };
  const invalidAge = await submit({ ...base, childAge: '9', group: 'sat-0900' }, '198.51.100.49');
  assert.equal(invalidAge.statusCode, 400);
  assert.equal(invalidAge.writes.length, 0);
  const invalidGroup = await submit({ ...base, childAge: '7', group: 'unknown' }, '198.51.100.50');
  assert.equal(invalidGroup.statusCode, 400);
  const invalidProduct = await submit({ product: 'other', phone: '0396 085 076' }, '198.51.100.51');
  assert.equal(invalidProduct.statusCode, 400);
});

test('sample-pack server logs never contain the submitted or normalized phone number', async () => {
  const result = await submit({ phone: '0396 085.076' }, '198.51.100.45');
  const output = result.logs.join('\n');
  assert.equal(output.includes('0396 085.076'), false);
  assert.equal(output.includes('+84396085076'), false);
});

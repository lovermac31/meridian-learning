import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { PRODUCTS } from '../src/i18n/content/products';
import { captureFirstTouch, readFirstTouch, utmFromSearch, withFirstTouch } from '../src/lib/utmFirstTouch';
import { validateEventPayload } from '../api/event';
import zaloHandler from '../api/go/zalo.js';
import { ZaloFloat } from '../src/components/ZaloFloat';
import { storyClubContent } from '../src/i18n/content/storyClub';
import { storyClubTryItContent } from '../src/i18n/content/storyClubTryIt';

// Funnel audit, 2 Nov 2026: fix 2 (first-touch utm_* carried to reserve and Zalo links; utm_medium and utm_campaign
// stored) and fix 6 (Story Club day, time, place, no recording). Fix 1 (the webhook crash) is PR #256.

const store = () => {
  const data = new Map<string, string>();
  return { getItem: (k: string) => data.get(k) ?? null, setItem: (k: string, v: string) => { data.set(k, v); }, data };
};
const FB = '?utm_source=facebook&utm_medium=group&utm_campaign=vn-groups-2026-11&utm_content=mon-g1';

test('fix 2: first touch wins, survives blocked storage, and rides on reserve and Zalo links with the post id kept', () => {
  const s = store();
  const first = captureFirstTouch(FB, s);
  assert.deepEqual(first, { utm_source: 'facebook', utm_medium: 'group', utm_campaign: 'vn-groups-2026-11', utm_content: 'mon-g1' });
  assert.deepEqual(captureFirstTouch('?utm_source=zalo-parent&utm_content=later', s), first, 'a later tagged view does not replace the first');
  assert.deepEqual(captureFirstTouch('', s), first, 'an untagged view keeps it');
  assert.deepEqual(readFirstTouch(s), first);
  assert.deepEqual(utmFromSearch('?utm_medium=group'), {}, 'no utm_source, no touch');
  assert.deepEqual(utmFromSearch('?utm_source=%3Cscript%3E&utm_campaign=x'), {}, 'unsafe values are dropped');
  const blocked = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert.deepEqual(captureFirstTouch(FB, blocked), first, 'the URL still applies when storage throws');
  assert.deepEqual(readFirstTouch(blocked), {});
  // Links.
  assert.equal(withFirstTouch('/go/zalo?utm_source=float&utm_content=zalo-float&locale=en', first),
    '/go/zalo?utm_source=facebook&utm_content=mon-g1&locale=en&utm_medium=group&utm_campaign=vn-groups-2026-11');
  assert.equal(withFirstTouch('/go/zalo?utm_source=story-club&utm_content=talk-to-jay', { utm_source: 'zalo-parent' }),
    '/go/zalo?utm_source=zalo-parent&utm_content=talk-to-jay', 'no post id on the landing: the placement tag stays');
  assert.equal(withFirstTouch('/en/story-club/reserve', first), '/en/story-club/reserve?utm_source=facebook&utm_medium=group&utm_campaign=vn-groups-2026-11&utm_content=mon-g1');
  assert.equal(withFirstTouch('/products?utm_source=products#baseline', first), '/products?utm_source=facebook&utm_medium=group&utm_campaign=vn-groups-2026-11&utm_content=mon-g1#baseline', 'the query stays before the anchor');
  assert.equal(withFirstTouch('/go/zalo?utm_source=float', null), '/go/zalo?utm_source=float', 'no touch: unchanged');
  assert.equal(withFirstTouch('/go/zalo?utm_source=float', {}), '/go/zalo?utm_source=float');
  // SSR markup is unchanged: the float and the Story Club page keep their placement tags until hydration.
  assert.match(renderToStaticMarkup(createElement(ZaloFloat, { locale: 'en' })), /href="\/go\/zalo\?utm_source=float&amp;utm_content=zalo-float&amp;locale=en"/);
});

test('fix 2: /go/zalo stores utm_medium and utm_campaign; /api/event accepts them; the writer falls back to six parameters on 404', async () => {
  const envNames = ['SUPABASE_URL', 'SUPABASE_WRITE_KEY'] as const;
  const oldEnv = Object.fromEntries(envNames.map((name) => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  const bodies: Array<Record<string, unknown>> = [];
  let firstStatus = 200;
  process.env.SUPABASE_URL = 'http://127.0.0.1:55421';
  process.env.SUPABASE_WRITE_KEY = 'sb_secret_synthetic-write-key';
  globalThis.fetch = (async (_input, init) => {
    bodies.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
    const status = bodies.length === 1 ? firstStatus : 200;
    return new Response(status === 200 ? '' : JSON.stringify({ code: 'PGRST202' }), { status });
  }) as typeof fetch;
  const run = async () => {
    const headers: Record<string, string> = {};
    let status = 0;
    const res = { setHeader: (k: string, v: string) => { headers[k] = v; return res; }, status: (c: number) => { status = c; return res; }, end: () => res, json: () => res };
    await zaloHandler({ method: 'GET', url: `/go/zalo${FB}&locale=vi`, query: {}, headers: { 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', accept: 'text/html,application/xhtml+xml' } } as never, res as never);
    return { status, headers };
  };
  try {
    const first = await run();
    assert.equal(first.status, 302);
    assert.equal(first.headers['X-JE-Click'], 'recorded');
    assert.equal(bodies.length, 1);
    assert.deepEqual(bodies[0], { p_event: 'zalo_click', p_path: '/go/zalo', p_product_id: null, p_utm_source: 'facebook', p_utm_content: 'mon-g1', p_locale: 'vi', p_utm_medium: 'group', p_utm_campaign: 'vn-groups-2026-11' });
    // Before the migration: PostgREST answers 404 for the eight-parameter call; the click is written with six.
    bodies.length = 0;
    firstStatus = 404;
    const second = await run();
    assert.equal(second.status, 302);
    assert.equal(bodies.length, 2, 'retried once');
    assert.deepEqual(Object.keys(bodies[1]).sort(), ['p_event', 'p_locale', 'p_path', 'p_product_id', 'p_utm_content', 'p_utm_source']);
  } finally {
    globalThis.fetch = originalFetch;
    for (const name of envNames) oldEnv[name] === undefined ? delete process.env[name] : process.env[name] = oldEnv[name]!;
  }
  const valid = validateEventPayload({ event: 'checkout_start', utm_source: 'facebook', utm_medium: 'group', utm_campaign: 'vn-groups-2026-11', utm_content: 'mon-g1' });
  assert.ok(valid.ok);
  if (valid.ok) assert.deepEqual([valid.data.utm_medium, valid.data.utm_campaign], ['group', 'vn-groups-2026-11']);
  const migration = readFileSync('supabase/migrations/20261102000001_je_events_utm_medium_campaign.sql', 'utf8');
  assert.match(migration, /add column if not exists utm_medium/);
  assert.match(migration, /p_utm_campaign text default null/);
  assert.match(migration, /drop function if exists public\.record_je_event\(text, text, text, text, text, text\)/, 'one overload only');
});

test('fix 6: /story-club and /vi/story-club state the day, time, length, Google Meet and never recorded, in the hero and by the price', async () => {
  const { renderRoute } = await import('../src/entry-server');
  for (const [route, line] of [
    ['/story-club', 'Saturdays at 13:00 Vietnam time · 30 minutes on Google Meet · never recorded'],
    ['/vi/story-club', 'Thứ Bảy lúc 13:00 giờ Việt Nam · 30 phút qua Google Meet · không bao giờ được ghi âm, ghi hình'],
  ] as const) {
    const html = (await renderRoute(route)).replaceAll('&#x27;', '’');
    assert.equal((html.match(/data-story-club-schedule/g) ?? []).length, 2, `${route}: hero and price card`);
    assert.ok(html.includes(line), `${route}: ${line}`);
    // 4 Nov 2026: the hero line now states the free try-it; the price card keeps the paid-round schedule line above.
    assert.ok(html.includes(storyClubTryItContent[route === '/vi/story-club' ? 'vi' : 'en'].heroLine), `${route}: hero states the free try-it`);
  }
  // The facts come from the Story Club product entry: Saturdays 13:00 (12 Nov 2026), 30 minutes, Google Meet, up to 6, ages 5–8.
  const storyClub = PRODUCTS.find((p) => p.id === 'story-club')!;
  assert.match(storyClub.en.forWho, /Saturdays 13:00/);
  assert.match(storyClub.en.inside, /30 minutes on Google Meet \(not recorded\)/);
  assert.equal(storyClubContent.en.price.schedule.includes('13:00'), true);
});

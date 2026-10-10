import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html = fs.readFileSync(new URL('../public/challenges/one-change/index.html', import.meta.url), 'utf8');
const code = html.match(/<script>([\s\S]*?)<\/script>/)![1];
function element() {
  return { value: '', textContent: '', hidden: false, disabled: false, tabIndex: 0, href: '',
    options: [] as any[], children: [] as any[], handlers: {} as Record<string, (...args: any[]) => any>,
    append(...items: any[]) { this.children.push(...items); }, replaceChildren() { this.children = []; },
    setAttribute(k: string, v: string) { (this as any)[k] = v; },
    addEventListener(k: string, fn: (...args: any[]) => any) { this.handlers[k] = fn; }, focus() {}, select() {}, click() {},
  };
}
function harness(search = '', privacy = false) {
  const elements = Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m => [m[1], element()]));
  elements.case.options = [element(), element(), element()];
  const events: any[] = [], scripts: any[] = [], delivered: any[] = [];
  const location = { protocol: 'https:', hostname: 'jurassicenglish.com', search, href: 'https://jurassicenglish.com/challenges/one-change' + search };
  const window = { va: (...args: any[]) => delivered.push(args), dispatchEvent: (event: any) => events.push(event.detail) };
  const context = vm.createContext({
    document: { getElementById: (id: string) => elements[id], createElement: () => ({ ...element(), dataset: {} }), documentElement: {}, head: { append: (script: any) => scripts.push(script) } },
    location, window, CustomEvent: class { detail: any; constructor(_name: string, options: any) { this.detail = options.detail; } },
    history: { replaceState() {} }, URL, URLSearchParams, navigator: { doNotTrack: privacy ? '1' : '0' },
    setTimeout, clearTimeout, Blob, console,
  });
  vm.runInContext(code, context);
  return { elements, events, scripts, delivered, run: (expression: string) => vm.runInContext(expression, context) };
}

test('all 18 challenge/language/choice paths reveal evidence, allow independent practice, and reset safely', () => {
  for (const language of ['en', 'vi']) for (let c = 0; c < 3; c++) for (let option = 0; option < 3; option++) {
    const h = harness(), e = h.elements;
    e.language.value = language; e.case.value = String(c); e.case.handlers.change();
    assert.equal(e.options.children.length, 3); assert.equal(e.reveal.disabled, true);
    e.options.children[option].handlers.click(); assert.equal(e.reveal.disabled, false);
    e.reveal.handlers.click(); assert.equal(e.feedback.hidden, false); assert.equal(e.practice.hidden, false);
    assert.ok(e.evidence.textContent.length > 0); assert.ok(e.reason.textContent.length > 0);
    e.attempt.value = ''; e.check.handlers.click(); assert.equal(e['next-step'].hidden, true);
    e.attempt.value = 'PRIVATE ANSWER NEVER COLLECT'; e.check.handlers.click();
    assert.equal(e['self-check'].hidden, false); assert.equal(e['next-step'].hidden, false);
    assert.ok(!h.run('shareText()').includes(e.attempt.value));
    assert.ok(!JSON.stringify(h.events).includes(e.attempt.value));
    e.case.handlers.change(); assert.equal(e.attempt.value, ''); assert.equal(e['self-check'].hidden, true); assert.equal(e['next-step'].hidden, true);
  }
});

test('campaign attribution survives URL state, shared links contain no arbitrary parameters', () => {
  const h = harness('?case=show-change&lang=vi&utm_source=facebook&utm_medium=social&utm_campaign=one_change_pilot&private=secret&email=someone');
  assert.equal(h.elements.case.value, '1'); assert.equal(h.elements.language.value, 'vi');
  const url = new URL(h.run('pageURL()'));
  assert.equal(url.searchParams.get('utm_source'), 'facebook'); assert.equal(url.searchParams.get('private'), null);
  assert.equal(url.searchParams.get('email'), null);
  assert.equal(new URL(h.run('shareURL()')).searchParams.get('utm_source'), 'learner_share');
  assert.equal(h.run('source'), 'facebook');
  const invalid = harness('?case=bad&lang=bad&utm_source=private-person');
  assert.equal(invalid.elements.case.value, '0'); assert.equal(invalid.elements.language.value, 'en'); assert.equal(invalid.run('source'), 'direct');
});

test('allowlisted privacy-safe events are deduplicated, analytics failure cannot block the exercise', () => {
  const h = harness('?utm_source=email'), e = h.elements;
  e.options.children[0].handlers.click(); e.options.children[0].handlers.click();
  assert.equal(h.events.filter(item => item.name === 'challenge_start').length, 1);
  h.run("emit('unapproved_event')"); assert.equal(h.events.length, 1);
  assert.deepEqual(Object.keys(h.events[0].data).sort(), ['case_id', 'language', 'source', 'version']);
  h.run("window.va=()=>{throw new Error('unavailable')}");
  assert.doesNotThrow(() => e.reveal.handlers.click()); assert.equal(e.feedback.hidden, false);
  const privateVisit = harness('', true);
  privateVisit.elements.options.children[0].handlers.click();
  assert.equal(privateVisit.scripts.length, 0); assert.equal(privateVisit.delivered.length, 0);
});

test('public route, metadata, website placement, enquiry links and safety boundaries are wired', () => {
  assert.match(html, /name="robots" content="index,follow"/);
  assert.match(html, /rel="canonical" href="https:\/\/jurassicenglish.com\/challenges\/one-change"/);
  assert.match(html, /social-preview.png/); assert.match(html, /https:\/\/zalo.me\/0396085076/);
  assert.match(html, /id="next-step" hidden/); assert.match(html, /<noscript>/);
  assert.match(html, /not sent or scored/);
  assert.ok(!/fetch\(|localStorage|sessionStorage/.test(code));
  const config = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(config.rewrites.some((r: any) => r.source === '/challenges/one-change' && r.destination === '/challenges/one-change/index.html'));
  assert.match(fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8'), /<OneChangeInvitation \/>/);
  assert.match(fs.readFileSync(new URL('../src/components/SearchInsightsPage.tsx', import.meta.url), 'utf8'), /<OneChangeInvitation placement="insights" \/>/);
  assert.match(fs.readFileSync(new URL('../scripts/generate-sitemap.mjs', import.meta.url), 'utf8'), /challenges\/one-change/);
});

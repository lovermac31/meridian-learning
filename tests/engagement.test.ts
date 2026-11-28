import test from 'node:test';
import assert from 'node:assert/strict';
import { createEngagementWatcher, startEngagementWatch, ENGAGED_SECONDS, ENGAGED_SENT_KEY } from '../src/lib/engagement.ts';
import { applyIgnoreParam, countingAllowed, ignoredVisitor, IGNORE_KEY, consentBeforeSend } from '../src/lib/analyticsConsent.ts';

test('the watcher fires once: scroll past the middle, 20 visible seconds, or a second page', () => {
  const scroll = createEngagementWatcher();
  assert.equal(scroll.scrolled(0.49), null);
  assert.equal(scroll.scrolled(Number.NaN), null);
  assert.equal(scroll.scrolled(0.5), 'scroll');
  assert.equal(scroll.scrolled(0.9), null, 'only the first trigger counts');
  assert.equal(scroll.tick(true), null);

  const time = createEngagementWatcher();
  for (let i = 0; i < ENGAGED_SECONDS - 1; i += 1) assert.equal(time.tick(true), null);
  for (let i = 0; i < 30; i += 1) time.tick(false);
  assert.equal(time.tick(true), 'time', 'hidden seconds do not count; the 20th visible second does');
  assert.equal(time.tick(true), null);

  const pages = createEngagementWatcher(['/']);
  assert.equal(pages.pathSeen('/'), null, 'the same page twice is still one page');
  assert.equal(pages.pathSeen('/products'), 'pages');
  assert.equal(pages.pathSeen('/vi'), null);
});

test('the ignore flag keeps a staff browser out of every count and is switched with a query string', () => {
  const previous = Object.fromEntries(['window', 'navigator'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const store = new Map<string, string>();
  const browser = Object.assign(new EventTarget(), {
    localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) },
  });
  Object.defineProperty(globalThis, 'window', { value: browser, configurable: true });
  Object.defineProperty(globalThis, 'navigator', { value: { doNotTrack: '0', globalPrivacyControl: false }, configurable: true });
  try {
    assert.equal(ignoredVisitor(), false);
    assert.equal(countingAllowed(), true);
    assert.equal(applyIgnoreParam(''), null, 'no parameter, no change');
    assert.equal(applyIgnoreParam('?ignore-analytics=maybe'), null, 'only 1 and 0 are accepted');
    assert.equal(applyIgnoreParam('?x=1&ignore-analytics=1'), true);
    assert.equal(store.get(IGNORE_KEY), '1');
    assert.equal(ignoredVisitor(), true);
    assert.equal(countingAllowed(), false);
    assert.equal(consentBeforeSend({ type: 'pageview' }), null, 'the SDK middleware drops events too');
    assert.equal(applyIgnoreParam('?ignore-analytics=0'), false);
    assert.equal(ignoredVisitor(), false);
    assert.equal(countingAllowed(), true);
    assert.deepEqual(consentBeforeSend({ type: 'pageview' }), { type: 'pageview' });
  } finally {
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete (globalThis as Record<string, unknown>)[key];
    }
  }
});

test('the browser watcher sends one event, remembers it for the tab and skips automated browsers', () => {
  const previous = Object.fromEntries(['window', 'document', 'navigator'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const session = new Map<string, string>();
  const listeners = new Map<string, () => void>();
  const timers: (() => void)[] = [];
  const realSetInterval = globalThis.setInterval;
  const realClearInterval = globalThis.clearInterval;
  const state = { scrollY: 0, innerHeight: 800 };
  const browser = {
    sessionStorage: { getItem: (key: string) => session.get(key) ?? null, setItem: (key: string, value: string) => session.set(key, value) },
    location: { pathname: '/' },
    get scrollY() { return state.scrollY; }, innerHeight: state.innerHeight,
    addEventListener: (name: string, fn: () => void) => listeners.set(name, fn),
    removeEventListener: (name: string) => listeners.delete(name),
  };
  const nav = { webdriver: false };
  Object.defineProperty(globalThis, 'window', { value: browser, configurable: true });
  Object.defineProperty(globalThis, 'navigator', { value: nav, configurable: true });
  Object.defineProperty(globalThis, 'document', { value: { visibilityState: 'visible', documentElement: { scrollHeight: 4000 } }, configurable: true });
  (globalThis as { setInterval: unknown }).setInterval = (fn: () => void) => { timers.push(fn); return timers.length; };
  (globalThis as { clearInterval: unknown }).clearInterval = () => { timers.length = 0; };
  try {
    nav.webdriver = true;
    const blocked: string[] = [];
    startEngagementWatch(t => blocked.push(t));
    assert.equal(listeners.size, 0, 'automated browsers never start a watcher');

    nav.webdriver = false;
    const sent: string[] = [];
    startEngagementWatch(t => sent.push(t));
    assert.equal(listeners.has('scroll'), true);
    state.scrollY = 1500; // (1500 + 800) / 4000 = 0.575
    listeners.get('scroll')!();
    assert.deepEqual(sent, ['scroll']);
    assert.equal(session.get(ENGAGED_SENT_KEY), '1');
    assert.equal(listeners.size, 0, 'listeners are removed after the event');

    const again: string[] = [];
    startEngagementWatch(t => again.push(t));
    assert.equal(listeners.size, 0);
    assert.deepEqual(again, [], 'a visit that was already counted sends nothing more');
  } finally {
    globalThis.setInterval = realSetInterval; globalThis.clearInterval = realClearInterval;
    for (const [key, descriptor] of Object.entries(previous)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete (globalThis as Record<string, unknown>)[key];
    }
  }
});

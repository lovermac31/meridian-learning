/**
 * Full-text prerender (server-rendered route bodies) — invariants that keep
 * the build-time render and the browser hydration in agreement.
 *
 * The end-to-end check (every prerendered sitemap route ships >= 150 visible
 * words, no outlined Suspense boundaries) runs against the real build in
 * scripts/validate-prerender-routes.mjs (CI: "Validate prerender routes").
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AudienceFork } from '../src/components/AudienceFork';
import { LanguageSwitcher } from '../src/components/LanguageSwitcher';
import { LegalPage } from '../src/components/LegalPage';
import { FrameworkExperience } from '../src/components/FrameworkExperience';
import { MethodologyPage } from '../src/components/MethodologyPage';
import { getCurrentLocale } from '../src/i18n/routing';
import { getCurrentPathname, setServerLocation } from '../src/lib/ssrLocation';
import {
  getClientOnlyRoutes,
  getExpectedPublicIndexableRoutes,
  getPrerenderRoutes,
  getPrivateOrNonIndexableRoutes,
} from '../src/lib/routeMetadata';
import {
  countMainContentWords,
  countVisibleWords,
  countWords,
  extractVisibleText,
} from '../scripts/lib/visible-text.mjs';

const noop = () => {};

test('client-only routes are private, prerendered and never public/indexable', () => {
  const privateRoutes = new Set(getPrivateOrNonIndexableRoutes());
  const publicRoutes = new Set(getExpectedPublicIndexableRoutes());
  const prerenderRoutes = new Set(getPrerenderRoutes());

  for (const route of getClientOnlyRoutes()) {
    assert.ok(privateRoutes.has(route), `${route} must be a private/noindex route`);
    assert.ok(!publicRoutes.has(route), `${route} must not be public/indexable`);
    assert.ok(prerenderRoutes.has(route), `${route} must still get a prerendered file`);
  }
});

test('ssrLocation drives render-time locale during the build-time prerender', () => {
  assert.equal(typeof window, 'undefined', 'node:test runs without a DOM');

  setServerLocation('/vi/framework');
  assert.equal(getCurrentPathname(), '/vi/framework');
  assert.equal(getCurrentLocale(), 'vi');

  setServerLocation('/framework');
  assert.equal(getCurrentLocale(), 'en');
});

test('LanguageSwitcher markup ignores query strings and hashes (server/client parity)', () => {
  const render = (currentRoute: string) =>
    renderToStaticMarkup(createElement(LanguageSwitcher, { currentRoute, onNavigate: noop }));

  const clean = render('/framework');
  assert.match(clean, /role="group"/, 'switcher renders on a localizable route');
  assert.equal(render('/framework?utm_source=zalo&utm_medium=social'), clean);
  assert.equal(render('/framework#core-model'), clean);
  assert.equal(render('/vi/framework?ref=x'), render('/vi/framework'));
  assert.equal(render('/plans-pricing-access?token=abc'), '', 'still hidden on private routes');
});

test('AudienceFork first render ignores browser-only traffic signals (hydration parity)', () => {
  // The build-time render has no query string or referrer. If the first
  // render read them, a Facebook visitor's hydrated tree would differ from the
  // server HTML and React would keep the server's attributes (door order lost).
  const render = () =>
    renderToStaticMarkup(createElement(AudienceFork, { onNavigate: noop }));
  setServerLocation('/');
  const serverMarkup = render();

  const globals = globalThis as unknown as { window?: unknown; document?: unknown };
  const saved = { window: globals.window, document: globals.document };
  globals.window = { location: { pathname: '/', search: '?utm_source=facebook&utm_medium=social', hash: '' } };
  globals.document = { referrer: 'https://www.facebook.com/' };
  try {
    const browserFirstRender = render();
    assert.doesNotMatch(browserFirstRender, /\border-[123]\b/, 'reorder must be applied after hydration');
    assert.equal(browserFirstRender, serverMarkup);
  } finally {
    globals.window = saved.window;
    globals.document = saved.document;
  }
});

test('page components render their full body on the server (no window at render time)', () => {
  setServerLocation('/methodology');
  const methodology = renderToStaticMarkup(
    createElement(MethodologyPage, { onBack: noop, onGetStarted: noop, onNavigate: noop }),
  );
  assert.ok(countWords(extractVisibleText(`<body>${methodology}</body>`)) > 1000);

  setServerLocation('/vi/framework');
  const framework = renderToStaticMarkup(
    createElement(FrameworkExperience, { onBack: noop, onGetStarted: noop }),
  );
  assert.match(framework, /Kiến trúc sâu hơn phía sau Jurassic English/);

  setServerLocation('/vi/legal/privacy');
  const privacy = renderToStaticMarkup(createElement(LegalPage, { onBack: noop }));
  assert.ok(countVisibleWords(`<body>${privacy}</body>`) > 1000);

  setServerLocation('/');
});

test('visible-text extraction counts body copy only', () => {
  const html = `<!doctype html><html><head><title>Ignored title words</title>
    <script type="application/ld+json">{"name":"ignored json"}</script></head>
    <body>
      <!-- ignored comment words -->
      <div id="root"><h1>Critical thinking</h1>
        <p>through literature &amp; evidence&nbsp;based writing.</p>
        <span class="sr-only">Skip to main content</span>
        <div hidden id="S:0"><p>outlined hidden segment</p></div>
        <template><p>template words</p></template>
        <svg viewBox="0 0 1 1"><title>icon title</title><path d="M0 0"/></svg>
        <style>.x{color:red}</style>
        <img src="/a.webp" alt="alt text is not visible text">
        <p>Tư duy phản biện — 2026</p>
      </div>
      <script>window.ignored = true;</script>
    </body></html>`;

  assert.equal(
    extractVisibleText(html),
    'Critical thinking through literature & evidence based writing. Skip to main content Tư duy phản biện — 2026',
  );
  // "—" carries no letter/digit and is not a word.
  assert.equal(countVisibleWords(html), 16);
});

test('a `hidden` class name is not the hidden attribute', () => {
  const html = '<body><div class="hidden xl:flex">Desktop nav</div><div hidden="">Collapsed</div><p data-state="hidden">Shown</p></body>';
  assert.equal(extractVisibleText(html), 'Desktop nav Shown');
  assert.equal(extractVisibleText(html, { includeHiddenAttribute: true }), 'Desktop nav Collapsed Shown');
});

test('<main> word count excludes chrome and includes collapsed panels', () => {
  const chrome = '<nav>' + 'Menu link '.repeat(100) + '</nav><footer>' + 'Footer link '.repeat(100) + '</footer>';
  const page = (main: string) => `<body><div id="root">${chrome}${main}</div></body>`;

  assert.deepEqual(countMainContentWords(page('')), { mainCount: 0, words: 0 });
  assert.deepEqual(countMainContentWords(page('<main class="x"></main>')), { mainCount: 1, words: 0 });
  assert.ok(countVisibleWords(page('<main></main>')) >= 150, 'chrome alone clears the body floor');
  assert.deepEqual(
    countMainContentWords(page('<main><h1>Answers</h1><div hidden="">Collapsed answer text</div></main>')),
    { mainCount: 1, words: 4 },
  );
});


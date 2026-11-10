/**
 * Floating Zalo button (src/components/ZaloFloat.tsx) — the pure decisions and the invariants the owner brief set
 * (1 Nov 2026): mobile opens Zalo directly, desktop shows the QR card; hidden on checkout pay steps and private
 * portals; both taps carry utm_content=zalo-float; CSS stays within 2 KB and respects reduced motion.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ZaloFloat, zaloFloatCopy } from '../src/components/ZaloFloat';
import {
  ZALO_FLOAT_DIRECT_MAX_WIDTH,
  ZALO_QR_IMAGE,
  ZALO_QR_TARGET,
  isZaloFloatHidden,
  opensZaloDirectly,
  zaloFloatHref,
} from '../src/lib/zaloFloat';

test('breakpoint: phones and touch devices open Zalo directly, desktop pointers get the QR card', () => {
  assert.equal(ZALO_FLOAT_DIRECT_MAX_WIDTH, 768);
  assert.equal(opensZaloDirectly({ viewportWidth: 375, coarsePointer: false }), true);
  assert.equal(opensZaloDirectly({ viewportWidth: 767, coarsePointer: false }), true);
  assert.equal(opensZaloDirectly({ viewportWidth: 768, coarsePointer: false }), false);
  assert.equal(opensZaloDirectly({ viewportWidth: 1440, coarsePointer: false }), false);
  assert.equal(opensZaloDirectly({ viewportWidth: 1024, coarsePointer: true }), true, 'a touch tablet cannot scan its own screen');
});

test('hidden exactly on checkout pay steps and private portals, in both locales', () => {
  for (const shown of ['/', '/vi', '/products', '/vi/products', '/products/one-to-one', '/story-club', '/vi/story-club', '/pilot/pilot-2026-05-30-b9b4492c', '/legal/privacy', '/insights']) {
    assert.equal(isZaloFloatHidden(shown), false, `${shown} should show the float`);
  }
  for (const hidden of ['/story-club/reserve', '/vi/story-club/reserve', '/en/story-club/reserve', '/internal/pilot-requests', '/external/pilot']) {
    assert.equal(isZaloFloatHidden(hidden), true, `${hidden} should hide the float`);
  }
  assert.equal(isZaloFloatHidden('/products/one-to-one', '?checkout=1'), true, 'product checkout renders the pay step');
  assert.equal(isZaloFloatHidden('/vi/products/one-to-one', '?checkout=1'), true);
  assert.equal(isZaloFloatHidden('/products/one-to-one', '?checkout=0'), false);
  assert.equal(isZaloFloatHidden('/products', '?checkout=1'), false, 'only product pages have the checkout step');
});

test('both taps go through the tracked redirect with the float utm', () => {
  for (const locale of ['en', 'vi'] as const) {
    const href = zaloFloatHref(locale);
    assert.ok(href.startsWith('/go/zalo?'), href);
    const params = new URL(href, 'https://jurassicenglish.com').searchParams;
    assert.equal(params.get('utm_source'), 'float');
    assert.equal(params.get('utm_content'), 'zalo-float');
    assert.equal(params.get('locale'), locale);
  }
});

test('copy: English and Vietnamese expose the same keys, Vietnamese reads as Vietnamese, visible labels sit inside accessible names', () => {
  assert.deepEqual(Object.keys(zaloFloatCopy.vi), Object.keys(zaloFloatCopy.en));
  assert.equal(zaloFloatCopy.en.pill, 'Chat on Zalo');
  assert.equal(zaloFloatCopy.vi.pill, 'Nhắn Zalo');
  assert.equal(zaloFloatCopy.vi.open, 'Mở Zalo');
  assert.equal(zaloFloatCopy.en.open, 'Open Zalo');
  assert.match(zaloFloatCopy.vi.scan, /^Quét để nhắn Zalo cho Mr\. Jay$/);
  assert.match(zaloFloatCopy.en.scan, /^Scan to message Mr\. Jay on Zalo$/);
  for (const locale of ['en', 'vi'] as const) {
    assert.ok(zaloFloatCopy[locale].launcher.startsWith(zaloFloatCopy[locale].pill), `${locale}: WCAG label-in-name`);
    assert.equal(zaloFloatCopy[locale].title, 'Zalo · Mr. Jay');
  }
});

test('QR asset: committed SVG generated from the qrcode library, encoding the tracked redirect so scans are counted', () => {
  assert.equal(ZALO_QR_TARGET, 'https://jurassicenglish.com/go/zalo?utm_source=float&utm_content=zalo-float-qr');
  const params = new URL(ZALO_QR_TARGET).searchParams;
  assert.equal(params.get('utm_source'), 'float');
  assert.equal(params.get('utm_content'), 'zalo-float-qr', 'scans are counted apart from Open Zalo clicks (zalo-float)');
  const svg = readFileSync(new URL(`../public${ZALO_QR_IMAGE}`, import.meta.url), 'utf8');
  assert.match(svg, /^<svg width="320" height="320" /);
  assert.match(svg, /shape-rendering="crispEdges"/, 'produced by scripts/generate-zalo-qr.mjs');
  assert.doesNotMatch(svg, /<script/i);
  assert.ok(readFileSync(new URL('../scripts/generate-zalo-qr.mjs', import.meta.url), 'utf8').includes(`'${ZALO_QR_TARGET}'`), 'generator encodes the same target');
});

test('stylesheet: at most 2 KB, CSS-only motion with a static ring under reduced motion, hidden while the assistant is open', () => {
  const path = new URL('../src/styles/zalo-float.css', import.meta.url);
  assert.ok(statSync(path).size <= 2048, `zalo-float.css is ${statSync(path).size} bytes`);
  const css = readFileSync(path, 'utf8');
  assert.match(css, /@keyframes zf-pulse/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.zf-r\{animation:none!important/);
  assert.match(css, /html\[data-je-assistant-open\] \.zf\{display:none\}/);
  assert.match(css, /\.zf\{[^}]*position:fixed/);
  assert.match(readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8'), /import '\.\/styles\/zalo-float\.css'/);
});

test('server markup: a real tracked link with an accessible name, no card and no analytics call until a click', () => {
  for (const locale of ['en', 'vi'] as const) {
    const html = renderToStaticMarkup(createElement(ZaloFloat, { locale }));
    assert.match(html, /<a [^>]*href="\/go\/zalo\?utm_source=float&amp;utm_content=zalo-float&amp;locale=/);
    assert.match(html, new RegExp(`aria-label="${zaloFloatCopy[locale].launcher}"`));
    assert.match(html, /aria-haspopup="dialog"/);
    assert.match(html, /rel="noopener noreferrer nofollow"/, 'the redirect link is nofollow');
    assert.doesNotMatch(html, /role="dialog"/, 'the card renders only after a desktop click');
    assert.doesNotMatch(html, /<script/);
    assert.doesNotMatch(html, /zalo\.me\//, 'the page never links zalo.me directly; the redirect logs the click');
  }
  assert.equal(renderToStaticMarkup(createElement(ZaloFloat, { locale: 'en', hidden: true })), '');
});

test('App mounts the float once, driven by the shared hidden predicate', () => {
  const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
  assert.equal(app.match(/<ZaloFloat/g)?.length, 1);
  assert.match(app, /hidden=\{isZaloFloatHidden\(routePathname, getCurrentLocation\(\)\.search\)\}/);
  assert.match(readFileSync(new URL('../src/components/BotUIChat.tsx', import.meta.url), 'utf8'), /toggleAttribute\('data-je-assistant-open', isOpen\)/);
});

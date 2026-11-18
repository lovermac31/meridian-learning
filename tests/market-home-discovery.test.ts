import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderRoute } from '../src/entry-server';
import { Footer } from '../src/components/Footer';
import { setServerLocation } from '../src/lib/ssrLocation';
import { seoPages } from '../src/lib/seoPages';

test('English and Vietnamese footers expose one crawlable IELTS door to JurassicIELTS', async () => {
  for (const [path, label] of [['/', 'IELTS → JurassicIELTS'], ['/vi', 'IELTS → JurassicIELTS']]) {
    setServerLocation(path);
    const html = renderToStaticMarkup(createElement(Footer));
    // IELTS migration P10: every IELTS page lives on jurassicielts.com; the footer has one door there (tagged footer), no redirect hop and no internal redirecting link.
    const hubHref = `https://jurassicielts.com/${path === '/' ? '' : 'vi/'}?utm_source=jurassicenglish&amp;utm_medium=footer&amp;utm_campaign=ielts-move`;
    assert.ok(html.includes(`href="${hubHref}"`), `${path} links to JurassicIELTS`);
    assert.doesNotMatch(html, /href="\/ielts-speaking-online"/, `${path} has no redirecting internal hub link`);
    assert.ok(html.includes(label), `${path} renders the localized navigation label`);
  }
});

test('the international hub links the priority country pages', () => {
  const hub = seoPages.find((page) => page.path === '/ielts-speaking-online');
  assert.ok(hub, 'international IELTS hub exists');
  for (const href of [
    '/ielts-speaking-online/india',
    '/ielts-speaking-online/singapore',
    '/ielts-speaking-online/malaysia',
    '/ielts-speaking-online/uae',
    '/ielts-speaking-online/saudi-arabia',
    '/ielts-speaking-online/egypt',
  ]) {
    assert.ok(hub.html.includes(`href="${href}"`), `hub links to ${href}`);
  }
});

// P4 (13 Nov 2026): the English pages (P0) and their Malay and Arabic counterparts (P4) both live on jurassicielts.com now,
// so no Jurassic English page may link to the old counterpart path (it would be a redirect hop).
test('English market pages never link to a counterpart that moved to jurassicielts.com', async () => {
  const counterparts = [
    ['/ielts-speaking-online/malaysia', '/ms/ielts-speaking-online/malaysia'],
    ['/ielts-speaking-online/uae', '/ar/ielts-speaking-online/uae'],
    ['/ielts-speaking-online/saudi-arabia', '/ar/ielts-speaking-online/saudi-arabia'],
    ['/ielts-speaking-online/egypt', '/ar/ielts-speaking-online/egypt'],
  ] as const;
  for (const [source, target] of counterparts) {
    const html = await renderRoute(source);
    assert.ok(!html.includes(`href="${target}"`), `${source} does not link to moved ${target}`);
  }
});

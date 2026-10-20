import test from 'node:test';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderRoute } from '../src/entry-server';
import { Footer } from '../src/components/Footer';
import { setServerLocation } from '../src/lib/ssrLocation';
import { seoPages } from '../src/lib/seoPages';

test('English and Vietnamese footers expose a crawlable entry to the international IELTS hub', async () => {
  for (const [path, label] of [['/', 'IELTS Coaching by Country'], ['/vi', 'Hướng dẫn IELTS theo quốc gia']]) {
    setServerLocation(path);
    const html = renderToStaticMarkup(createElement(Footer));
    assert.match(html, /<a\b[^>]*href="\/ielts-speaking-online"[^>]*>/, `${path} links to the market hub`);
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

test('English market pages link to their available Malay and Arabic counterparts', async () => {
  const counterparts = [
    ['/ielts-speaking-online/malaysia', '/ms/ielts-speaking-online/malaysia'],
    ['/ielts-speaking-online/uae', '/ar/ielts-speaking-online/uae'],
    ['/ielts-speaking-online/saudi-arabia', '/ar/ielts-speaking-online/saudi-arabia'],
    ['/ielts-speaking-online/egypt', '/ar/ielts-speaking-online/egypt'],
  ] as const;
  for (const [source, target] of counterparts) {
    const html = await renderRoute(source);
    assert.ok(html.includes(`href="${target}"`), `${source} links to ${target}`);
  }
});

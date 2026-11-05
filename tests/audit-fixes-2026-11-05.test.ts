import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { buildViPage } from '../scripts/prerender-yl-vi.mjs';
import { PhoneNumberField } from '../src/components/PhoneNumberField';
import { CountryLocationField } from '../src/components/CountryLocationField';
import { buildRegionOptions } from '../src/lib/regionOptions';

// The ecosystem app (Next.js, served behind /student-academy etc.) is a separate package without "type": "module",
// so tsx loads its modules as CommonJS: take the export from whichever shape the interop gives.
const productsModule: any = await import('../docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/components/headerProducts');
const getHeaderProducts = (productsModule.getHeaderProducts ?? productsModule.default?.getHeaderProducts) as (lang?: 'en' | 'vi') => { label: string; full: string; href: string };

// Site audit, 5 Nov 2026. Header: Products reachable on every page (visible in the header, and in the menu).
const read = (path: string) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const anchors = (html: string, href: string) => [...html.matchAll(new RegExp(`<a\\b[^>]*href="${href}"[^>]*>`, 'g'))].map((match) => match[0]);

test('ecosystem header (/student-academy, /school-framework, /digital-reasoning-engine, /vi/student-academy/stories): Products door, EN and VI', () => {
  assert.deepEqual(getHeaderProducts('en'), { label: 'Products', full: 'Products & prices', href: '/products' });
  assert.deepEqual(getHeaderProducts('vi'), { label: 'Sản phẩm', full: 'Sản phẩm & học phí', href: '/vi/products' });
  assert.equal(getHeaderProducts().href, '/products', 'default language is English (the (en) root layout)');
});

test('ecosystem header renders Products in the bar and in the menu, and the Vietnamese layout passes its language', () => {
  const header = read('docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/components/ProductionStyleHeader.tsx');
  const links = header.match(/<a\s[^>]*href=\{products\.href\}[\s\S]*?<\/a>/g) ?? [];
  assert.equal(links.length, 2, 'standalone link beside the CTA + a menu row');
  assert.match(links[0], /data-testid="header-products-link"/);
  assert.match(links[0], /aria-label=\{products\.full\}/);
  assert.match(links[0], /min-h-11 min-w-11/, '44px touch target');
  assert.match(links[0], /\{products\.label\}/);
  assert.match(links[1], /\{products\.full\}/);
  // The standalone link is outside the <details> menu; the second row is inside it.
  const [bar, menu] = header.split('<details');
  assert.ok(bar.includes('products.href') && menu.includes('products.href'));
  // The CTA wraps below 640px so Products keeps its place.
  assert.match(header, /max-\[639px\]:max-w-\[6\.5rem\]/);
  // Nothing else changed: the doors, the Baseline CTA and the language switch are still there.
  for (const href of ['/student-academy', '/young-learners-speaking/', '/ai-speaking/writing', '/ai-speaking', '/#pricing-options', '/vi']) assert.ok(header.includes(`"${href}"`), href);
  assert.ok(header.includes('CTA_HREF = "/ai-speaking/baseline"'));
  const shell = read('docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/components/RootShell.tsx');
  assert.match(shell, /<ProductionStyleHeader lang=\{lang\} \/>/);
  assert.match(read('docs/jurassic-english---b2b-evidence-showcase/ecosystem-landing/src/app/(vi)/layout.tsx'), /<RootShell lang="vi">/);
});

test('Young Learners page header: Products beside the CTA, in the link row and in the menu', () => {
  const html = read('young-learners-speaking/index.html');
  const nav = html.match(/<nav class="yl2-nav yl2-hdr"[\s\S]*?<\/nav>/)![0];
  assert.equal(anchors(nav, '/products').length, 3, 'right-hand cluster, link row, menu panel');
  assert.match(nav, /<div class="yl2-hdr-right">[\s\S]*?<a class="yl2-hdr-products" href="\/products" data-products-link[^>]*>Products<\/a>/);
  assert.match(html, /\.yl2-hdr-products\{display:inline-flex;[^}]*min-height:44px;min-width:44px/);
  // From 1280px the link row carries it and the standalone copy is hidden (no duplicate in the bar).
  assert.match(html, /@media\(min-width:1280px\)\{[^@]*\.yl2-hdr-right>\.yl2-hdr-products\{display:none\}/);
});

test('Vietnamese Young Learners page (/vi/luyen-noi-ielts/): Sản phẩm links to /vi/products', () => {
  const vi = buildViPage(read('young-learners-speaking/index.html')).html;
  const nav = vi.match(/<nav class="yl2-nav yl2-hdr"[\s\S]*?<\/nav>/)![0];
  assert.equal(anchors(nav, '/vi/products').length, 3);
  assert.equal(anchors(nav, '/products').length, 0);
  assert.match(nav, /data-products-link[^>]*>Sản phẩm<\/a>/);
  assert.match(nav, /aria-label="Sản phẩm &amp; học phí"/);
  assert.equal(anchors(vi, '/products').length, 0);
});

test('Young Learners runtime language switch re-points the Products links', () => {
  const runtime = read('src/yl/pageI18n.ts');
  assert.match(runtime, /a\[data-products-link\]/);
  assert.match(runtime, /lang === 'vi' \? '\/vi\/products' : '\/products'/);
  assert.match(runtime, /applyProductsLinks\(lang\);/);
});

test('One Change challenge: header Products link (EN and VI) and contrast of the three small texts', () => {
  const html = read('public/challenges/one-change/index.html');
  assert.match(html, /<header>[\s\S]*<a id="products-link" class="hdr-link" href="\/products">Products<\/a>[\s\S]*<\/header>/);
  assert.match(html, /\$\('products-link'\)\.textContent=l\?'Sản phẩm':'Products';\$\('products-link'\)\.href=l\?'\/vi\/products':'\/products';/);
  const channel = (hex: string) => { const v = parseInt(hex, 16) / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const luminance = (rgb: string) => 0.2126 * channel(rgb.slice(0, 2)) + 0.7152 * channel(rgb.slice(2, 4)) + 0.0722 * channel(rgb.slice(4, 6));
  const ratio = (a: string, b: string) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };
  // 12px footer disclaimer on the cream page; 10px brand tagline on the cream page; 11px gold label on the coach panel.
  assert.match(html, /\.disclaimer\{[^}]*color:#566058;font-size:12px/);
  assert.ok(ratio('566058', 'f8f5ee') >= 5, 'disclaimer');
  assert.match(html, /\.brand-text small\{[^}]*color:#5a5f4c/);
  assert.ok(ratio('5a5f4c', 'f8f5ee') >= 5, 'tagline');
  assert.match(html, /\.coach \.label\{color:#ecd7a8\}/);
  // Lightest point of the coach gradient is #2c4b43.
  assert.ok(ratio('ecd7a8', '2c4b43') >= 5, 'label on coach panel');
});

test('HTML site map header: Products link in the header, EN and VI', () => {
  const source = read('scripts/seo/build-html-sitemap.mjs');
  assert.match(source, /<header><nav aria-label="Main">[\s\S]*?href="\$\{lang === 'vi' \? '\/vi\/products' : '\/products'\}"[^>]*>\$\{lang === 'vi' \? 'Sản phẩm' : 'Products'\}<\/a>[\s\S]*?<\/nav><\/header>/);
});

// React error #418: the prerender (Node ICU) and the browser (its own CLDR) disagree on region names, so a country list
// built from Intl.DisplayNames must not be part of the markup that gets hydrated.
test('phone and country fields render a deterministic first pass (nothing ICU-dependent in the hydrated markup)', () => {
  for (const locale of ['en', 'vi']) {
    const phone = renderToString(createElement(PhoneNumberField, { id: 'p', label: 'Phone', locale }));
    assert.equal((phone.match(/<option\b/g) ?? []).length, 1, `${locale} phone select starts with the selected country only`);
    assert.match(phone, /<option value="VN"/);
    const country = renderToString(createElement(CountryLocationField, { id: 'c', name: 'c', label: 'Country', locale }));
    assert.equal((country.match(/<option\b/g) ?? []).length, 1, `${locale} country select starts with Vietnam only`);
  }
  const first = renderToString(createElement(PhoneNumberField, { id: 'p', label: 'Phone', locale: 'en' }));
  assert.match(first, /Vietnam/);
  assert.match(renderToString(createElement(PhoneNumberField, { id: 'p', label: 'Phone', locale: 'vi' })), /Việt Nam/);
});

test('after mount the full list is available, sorted by localised name', () => {
  const en = buildRegionOptions('en');
  assert.ok(en.length > 200);
  assert.deepEqual(en.map((option) => option.name), [...en.map((option) => option.name)].sort((a, b) => a.localeCompare(b, 'en')));
  assert.ok(en.some((option) => option.country === 'VN' && option.callingCode === '84'));
  assert.deepEqual(buildRegionOptions('en', ['VN']).map((option) => option.country), ['VN']);
});

test('no component builds a region list from Intl.DisplayNames inside render', () => {
  for (const file of ['src/components/PhoneNumberField.tsx', 'src/components/CountryLocationField.tsx']) {
    assert.ok(!read(file).includes('Intl.DisplayNames'), file);
  }
});

test('UAE market pages (EN and AR) no longer link the removed Ministry posting (404); the replacement is a live Ministry page', () => {
  const pages = JSON.parse(read('src/content/seoPages.json')) as Array<{ path: string; html: string }>;
  for (const path of ['/ielts-speaking-online/uae', '/ar/ielts-speaking-online/uae']) {
    const html = pages.find((page) => page.path === path)!.html;
    assert.ok(!html.includes('1100009294'), path);
    const ministry = [...html.matchAll(/href="(https:\/\/careers\.moe\.gov\.ae[^"]*)"/g)].map((match) => match[1]);
    // Verified 200 on 5 Nov 2026 (GET): the Abu Dhabi, Al Ain and Al Dhafra English-teacher posting, which lists IELTS 7 Academic / 7.5 General.
    assert.deepEqual(ministry, ['https://careers.moe.gov.ae/en/uae/jobs/english-teacher-abu-dhabi-al-ain-al-dhafra-1100017383/'], path);
  }
});

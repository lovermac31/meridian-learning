// Pakistan and Bangladesh have no PayPal route: the page body already takes an email request, so the header button must too
// (12 Nov 2026: the Urdu Pakistan header still linked to the Baseline checkout).
import test from 'node:test';
import assert from 'node:assert/strict';
import { headerCta } from '../src/lib/headerCta';

const copy = { cta: 'Book Baseline · 690k₫', ctaMobile: 'Baseline · 690k₫', ctaHref: '/ai-speaking/baseline', sampleCta: 'Free sample pack' };

test('header button on Pakistan and Bangladesh pages is an email request, never the checkout', () => {
  for (const [path, country] of [
    ['/ur/ielts-speaking-online/pakistan', 'Pakistan'],
    ['/ielts-speaking-online/pakistan', 'Pakistan'],
    ['/bn/ielts-speaking-online/bangladesh', 'Bangladesh'],
    ['/ielts-speaking-online/bangladesh', 'Bangladesh'],
  ] as const) {
    const cta = headerCta(path, 'en', copy);
    assert.match(cta.href, /^mailto:info@jurassicenglish\.com\?subject=/, path);
    assert.doesNotMatch(cta.href, /ai-speaking|market=/, `${path}: no checkout link`);
    assert.equal(decodeURIComponent(cta.href.split('subject=')[1]), `Speaking Baseline request - ${country} (US$29)`, path);
    assert.equal(cta.label, 'Request Baseline · US$29', path);
    assert.equal(cta.mobileLabel, 'Baseline · US$29', path);
  }
});

test('other country pages keep the checkout button at their own tier price', () => {
  const uae = headerCta('/ar/ielts-speaking-online/uae', 'en', copy);
  assert.deepEqual([uae.href, uae.label], ['/ai-speaking/baseline?market=uae', 'Book Baseline · US$59']);
  assert.equal(headerCta('/ielts-speaking-online/nigeria', 'en', copy).href, '/ai-speaking/baseline?market=nigeria');
});

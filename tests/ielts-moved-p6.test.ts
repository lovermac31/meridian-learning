import test from 'node:test';
import assert from 'node:assert/strict';
import vercel from '../vercel.json';
import { movedHref } from '../src/config/movedToJurassicielts';

type Redirect = { source: string; destination: string; has?: unknown[] };
const redirects = (vercel as { redirects: Redirect[] }).redirects;

// IELTS migration P6: the moved-link rewrite must give the plain (no `has`) destination, whatever the rule order.
// The ?lang=vi rule for /live-speaking-check sends Vietnamese visitors to the VI page; built links stay EN.
test('P6 moved links: EN and VI destinations do not depend on redirect rule order', () => {
  const plain = redirects.find((r) => r.source === '/live-speaking-check' && !r.has);
  const vi = redirects.find((r) => r.source === '/live-speaking-check' && r.has);
  assert.equal(plain?.destination, 'https://jurassicielts.com/solutions/live-speaking-check/');
  assert.equal(vi?.destination, 'https://jurassicielts.com/vi/solutions/live-speaking-check/');
  assert.ok(redirects.indexOf(vi!) < redirects.indexOf(plain!), 'the ?lang=vi rule comes before the plain rule');
  for (const href of ['/live-speaking-check', '/live-speaking-check/', 'https://jurassicenglish.com/live-speaking-check']) {
    assert.equal(movedHref(href), plain!.destination, href);
  }
  assert.equal(movedHref('/products/ielts-cue-card-bank'), 'https://jurassicielts.com/solutions/cue-card-bank/');
  assert.equal(movedHref('/vi/products/ielts-cue-card-bank/'), 'https://jurassicielts.com/vi/solutions/cue-card-bank/');
  assert.equal(movedHref('/vi/products/ielts-one-to-one-starter'), 'https://jurassicielts.com/vi/solutions/speaking-tutor-plan/');
  assert.equal(movedHref('/products/story-workbooks-l1'), '/products/story-workbooks-l1', 'a JE product is not moved');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const htmlPath = new URL('../young-learners-speaking/index.html', import.meta.url);
const promoPath = new URL('../src/yl/PromoVideoModal.tsx', import.meta.url);
const viPath = new URL('../src/yl/i18n.vi.json', import.meta.url);
const zhPath = new URL('../src/yl/i18n.zh-CN.json', import.meta.url);

test('Young Learners keeps the public evaluation flow and adds relevant internal paths', async () => {
  const html = await readFile(htmlPath, 'utf8');

  assert.match(html, /class="brand" href="\/" aria-label="Jurassic English home"/);
  assert.match(
    html,
    /href="\/student-academy" data-route-progression="student-academy"/,
  );
  assert.match(
    html,
    /href="\/book-diagnostic" data-route-progression="book-diagnostic"/,
  );
  assert.match(
    html,
    /data-form-href="https:\/\/script\.google\.com\/macros\/s\/AKfycbwwjjbCeArSzRvGfvu9dKlFdmtEDeiTD7jTvJgurUycpEAZpvNxeSizY4xhTL_KsR2e\/exec"/,
  );
  assert.match(html, /<div id="yl-promo-root"><\/div>/);
});

test('promo video requires an explicit visitor action and does not eager-load', async () => {
  const source = await readFile(promoPath, 'utf8');

  assert.match(source, /createPortal\(trigger, triggerTarget\)/);
  assert.match(source, /onClick=\{show\}/);
  assert.match(source, /const \[open, setOpen\] = useState\(false\)/);
  assert.match(source, /preload="none"/);
  assert.doesNotMatch(source, /requestIdleCallback/);
  assert.doesNotMatch(source, /sessionStorage/);
  assert.doesNotMatch(source, /autoPlay/);
});

test('new continuation and video controls are localized', async () => {
  const dictionaries = [
    JSON.parse(await readFile(viPath, 'utf8')) as Record<string, string>,
    JSON.parse(await readFile(zhPath, 'utf8')) as Record<string, string>,
  ];
  const requiredKeys = [
    'hero.academyPrompt',
    'hero.ctaAcademy',
    'book.diagnosticPrompt',
    'book.diagnosticCta',
    'promo.watch',
    'promo.title',
    'promo.play',
    'promo.sound',
    'promo.close',
  ];

  for (const dictionary of dictionaries) {
    for (const key of requiredKeys) {
      assert.equal(typeof dictionary[key], 'string', `${key} must be localized`);
      assert.ok(dictionary[key].trim().length > 0, `${key} must not be empty`);
    }
  }
});

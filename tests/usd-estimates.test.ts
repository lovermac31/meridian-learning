/**
 * Every "~$N" estimate shown next to a VND price must equal what PayPal charges
 * (usdFromVnd, the approved FX). The 15 Oct audit found the page saying ~$220
 * while checkout charged US$217; this keeps the two from drifting again.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { usdFromVnd } from '../src/lib/paypal.ts';

const ROOT = resolve(import.meta.dirname, '..');
const FILES = ['young-learners-speaking/index.html', 'src/yl/i18n.vi.json', 'src/i18n/content/overhaul.ts'];
// "5.600.000₫ total (~$217)", "Tổng 5.600.000₫ (~$217)", "800.000₫ (~$31)"
const ESTIMATE = /(\d{1,3}(?:\.\d{3})+)₫(?: total)? \(~\$([\d,]+)\)/g;

test('USD estimates next to VND prices match the PayPal amount', () => {
  let checked = 0;
  for (const file of FILES) {
    const text = readFileSync(resolve(ROOT, file), 'utf8');
    for (const m of text.matchAll(ESTIMATE)) {
      const vnd = Number(m[1].replaceAll('.', ''));
      const shown = Number(m[2].replaceAll(',', ''));
      assert.equal(shown, usdFromVnd(vnd), `${file}: ${m[0]} should show ~$${usdFromVnd(vnd)}`);
      checked++;
    }
  }
  assert.ok(checked >= 12, `expected at least 12 estimates, found ${checked}`);
});

test('the stated reference rate is the checkout rate', async () => {
  const { VND_PER_USD } = await import('../src/lib/paypal.ts');
  const shown = `1 USD ≈ ${VND_PER_USD.toLocaleString('de-DE')}₫`; // 25.897₫, Vietnamese thousands separator
  for (const file of FILES) {
    const text = readFileSync(resolve(ROOT, file), 'utf8');
    for (const m of text.matchAll(/1 USD ≈ [\d.,]+₫/g)) assert.equal(m[0], shown, `${file}: ${m[0]}`);
  }
});

/**
 * PayPal second payment option (owner decision, 14 Oct 2026): one shared link
 * builder, the FX from marketPricing.json, and the same link shape, logo and
 * account as the market-page panel (PR #128).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pricing from '../src/content/marketPricing.json';
import { PAYPAL_ACCOUNT, PAYPAL_LOGO, VND_PER_USD, paypalHref, paypalItemName, usdFromVnd } from '../src/lib/paypal.ts';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

test('FX is the one recorded with the approved prices', () => {
  const recorded = Number(pricing._approved.match(/USD 1 = VND ([\d,]+)/)?.[1].replaceAll(',', ''));
  assert.equal(VND_PER_USD, recorded);
});

test('VND prices convert to whole US dollars, rounded up', () => {
  assert.equal(usdFromVnd(690_000), 27);
  assert.equal(usdFromVnd(800_000), 31);
  assert.equal(usdFromVnd(5_600_000), 217);
  assert.equal(usdFromVnd(25_897), 1);
  assert.equal(usdFromVnd(25_898), 2);
});

test('checkout link is a fully encoded _xclick to the Jurassic English account', () => {
  const href = paypalHref(paypalItemName('Live Speaking Baseline', 'Young Learners'), 27);
  assert.equal(href, 'https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=info%40jurassicenglish.com&item_name=Live+Speaking+Baseline+-+Young+Learners+%28Jurassic+English%29&amount=27.00&currency_code=USD&no_shipping=1');
  const url = new URL(href);
  assert.equal(url.searchParams.get('business'), 'info@jurassicenglish.com');
  assert.equal(url.searchParams.get('item_name'), 'Live Speaking Baseline - Young Learners (Jurassic English)');
});

test('account and logo match the market-page panel (PR #128)', () => {
  const market = read('src/components/SearchInsightsPage.tsx');
  assert.ok(market.includes(`const PAYPAL_ACCOUNT = '${PAYPAL_ACCOUNT}'`));
  assert.ok(market.includes(`const PAYPAL_LOGO = '${PAYPAL_LOGO}'`));
  assert.ok(market.includes("cmd: '_xclick'") && market.includes('(Jurassic English)'));
});

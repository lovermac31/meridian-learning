/**
 * Money-path probe: for every sellable product, the price a buyer SEES must equal the price they are CHARGED everywhere.
 * Compares: the card price, the VietQR amount (PAID_OFFERS and paymentQrUrl), the server table that mints the memo
 * (api/sample-pack.ts), the JSON-LD Offer (VND and USD on the product page) and the PayPal US$ amount (ceil(VND / 25,897)).
 * A mismatch is a P0. Run: node --import tsx scripts/probe-price-consistency.mts   (exit 1 on any mismatch)
 */
import { readFileSync } from 'node:fs';
import { PRODUCTS } from '../src/i18n/content/products.js';
import { PAID_OFFERS, paymentQrUrl, LIVE_CHECK_OFFER } from '../src/config/payment.js';
import { createProductJsonLd } from '../src/lib/structuredData.js';
import { usdFromVnd } from '../src/lib/paypal.js';

const server = new Map<string, { prefix: string; amount: number }>();
for (const m of readFileSync('api/sample-pack.ts', 'utf8').matchAll(/'([a-z0-9-]+)': \{ prefix: '([A-Z0-9]+)', amount: (\d+) \}/g)) {
  server.set(m[1], { prefix: m[2], amount: Number(m[3]) });
}

const rows: string[] = [];
let bad = 0;
const fail = (id: string, why: string) => { bad++; rows.push(`MISMATCH ${id}: ${why}`); };
for (const p of PRODUCTS.filter((x) => x.live)) {
  const shown = Number(p.price.replace(/\D/g, ''));
  const offer = PAID_OFFERS.find((o) => o.id === p.id);
  const srv = server.get(p.id);
  if (p.id === 'one-to-one') { rows.push(`skip ${p.id} (priced per pack)`); continue; }
  if (!offer) { fail(p.id, 'no PAID_OFFER'); continue; }
  if (offer.amount !== shown) fail(p.id, `card ${shown} vs PAID_OFFER ${offer.amount}`);
  if (!srv) fail(p.id, 'not in server table');
  else {
    if (srv.amount !== shown) fail(p.id, `card ${shown} vs server ${srv.amount}`);
    if (srv.prefix !== offer.prefix) fail(p.id, `prefix ${offer.prefix} vs server ${srv.prefix}`);
  }
  const qr = new URL(paymentQrUrl(offer.amount, `${offer.prefix}-ABC123`)!);
  if (qr.searchParams.get('amount') !== String(shown)) fail(p.id, `QR amount ${qr.searchParams.get('amount')} vs ${shown}`);
  for (const locale of ['en', 'vi'] as const) {
    const ld = createProductJsonLd(p, locale) as { offers?: unknown };
    const offers = ([] as Array<{ price: string; priceCurrency: string }>).concat((ld.offers ?? []) as never);
    const vnd = offers.find((o) => o.priceCurrency === 'VND');
    if (!vnd || Number(vnd.price) !== shown) fail(p.id, `${locale} JSON-LD VND ${vnd?.price} vs ${shown}`);
    const usd = offers.find((o) => o.priceCurrency === 'USD');
    if (p.paypal && p.id.startsWith('ielts') && usd && Number(usd.price) !== usdFromVnd(shown)) {
      fail(p.id, `${locale} JSON-LD USD ${usd.price} vs ${usdFromVnd(shown)}`);
    }
  }
  rows.push(`ok ${p.id.padEnd(30)} ${String(shown).padStart(9)} VND  US$${usdFromVnd(shown)}  memo ${offer.prefix}`);
}
const lc = server.get(LIVE_CHECK_OFFER.id);
if (!lc || lc.amount !== LIVE_CHECK_OFFER.amount) fail(LIVE_CHECK_OFFER.id, `live check ${LIVE_CHECK_OFFER.amount} vs server ${lc?.amount}`);
else rows.push(`ok ${LIVE_CHECK_OFFER.id.padEnd(30)} ${String(lc.amount).padStart(9)} VND`);
console.log(rows.join('\n'));
console.log(bad ? `\nPROBE FAILED: ${bad} mismatch(es)` : `\nPROBE PASSED: ${rows.filter((r) => r.startsWith('ok')).length} products, displayed = QR = server = JSON-LD`);
process.exit(bad ? 1 : 0);

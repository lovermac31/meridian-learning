import { chromium } from 'playwright';
const base = process.argv[2], out = process.argv[3], tag = process.argv[4];
const b = await chromium.launch({ headless: true, args: ['--mute-audio'] });
let fails = 0;
for (const loc of ['', '/vi']) for (const [w, h] of [[375, 812], [768, 1024], [1024, 768], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.route('**/api/**', r => r.abort()); await p.route('**/_vercel/**', r => r.abort());
  await p.goto(base + loc + '/products?utm_source=home-tiles', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  const m = await p.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { t: r.top + scrollY, b: r.bottom + scrollY, l: r.left, r: r.right, h: r.height, w: r.width }; };
    const spread = a => a.length ? +(Math.max(...a) - Math.min(...a)).toFixed(1) : 0;
    const rowsOf = els => { const g = {}; els.forEach(e => { const k = Math.round(R(e).t); (g[k] ||= []).push(e); }); return Object.values(g); };
    const out = {};
    const cards = [...document.querySelectorAll('[data-audience-hero]')]; const cr = cards.map(R);
    const side = Math.abs(cr[0].t - cr[1].t) < 2;
    const q = (sel) => cards.map(c => c.querySelector(sel)).filter(Boolean).map(R);
    const cta = cards.map(c => c.querySelector('[data-audience-sample],[data-audience-section]')).map(R);
    out.audience = { sideBySide: side, cardTop: spread(cr.map(x => x.t)), cardBottom: spread(cr.map(x => x.b)), heading: spread(q('h2').map(x => x.t)), title: spread(q('[data-audience-lead]').map(x => x.t)),
      price: spread(cards.map(c => (c.querySelector('[data-audience-price]') || c.querySelector('[data-audience-ielts-app]').closest('p'))).map(R).map(x => x.t)), ctaTop: spread(cta.map(x => x.t)), ctaBottom: spread(cta.map(x => x.b)), ctaHeight: spread(cta.map(x => x.h)),
      ctaInsetL: spread(cta.map((x, i) => x.l - cr[i].l)), ctaInsetR: spread(cta.map((x, i) => cr[i].r - x.r)), ctaGapToBottom: spread(cta.map((x, i) => cr[i].b - x.b)), minGapAboveCta: Math.min(...cards.map((c, i) => { const prev = c.querySelector('.pa-cta, [data-audience-sample], [data-audience-section]'); const el = (prev.closest('.pa-cta') || prev).previousElementSibling; return +(cta[i].t - R(el).b).toFixed(1); })) };
    if (!side) for (const k of ['cardTop', 'cardBottom', 'heading', 'title', 'price', 'ctaTop', 'ctaBottom']) out.audience[k] = 'stacked';
    const grp = (name, sel, extra) => { const els = [...document.querySelectorAll(sel)].filter(e => e.getBoundingClientRect().height > 0); if (!els.length) return; const rows = rowsOf(els); out[name] = { n: els.length, rows: rows.length, top: Math.max(...rows.map(r => spread(r.map(e => R(e).t)))), height: Math.max(...rows.map(r => spread(r.map(e => R(e).h)))), ...(extra ? extra(rows) : {}) }; };
    grp('trust', '.products-trust > *');
    grp('tiles', '.products-overview ul > li');
    grp('picker', '.products-workbooks ul > li', rows => ({ lastLineBottom: Math.max(...rows.map(r => spread(r.map(e => R(e.querySelector('a > span:last-child')).b)))), titleTop: Math.max(...rows.map(r => spread(r.map(e => R(e.querySelector('strong')).t)))) }));
    const rowsEls = [...document.querySelectorAll('.products-page li.product-row')].filter(e => e.getBoundingClientRect().height > 0);
    out.productRows = { n: rowsEls.length, left: spread(rowsEls.map(e => R(e).l)), width: spread(rowsEls.map(e => R(e).w)) };
    out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    return out;
  });
  const a = m.audience, num = v => typeof v === 'number' ? v : 0;
  const bad = [a.cardTop, a.cardBottom, a.heading, a.title, a.price, a.ctaTop, a.ctaBottom, a.ctaHeight, a.ctaInsetL, a.ctaInsetR, a.ctaGapToBottom, m.trust?.top, m.trust?.height, m.tiles?.top, m.tiles?.height, m.picker?.top, m.picker?.height, m.picker?.lastLineBottom, m.picker?.titleTop, m.productRows.left, m.productRows.width].map(num).some(v => v > 0.6) || a.minGapAboveCta < 12 || m.overflow > 0;
  if (bad) fails++;
  console.log(`${tag} ${loc || '/en'} ${w} ${bad ? 'MISALIGNED' : 'ALIGNED'} audience=${JSON.stringify(a)} trust=${JSON.stringify(m.trust)} tiles=${JSON.stringify(m.tiles)} picker=${JSON.stringify(m.picker)} rows=${JSON.stringify(m.productRows)} overflow=${m.overflow}`);
  if (loc === '' || w === 1440) { const y = await p.evaluate(() => document.querySelector('[data-audience-heroes]').getBoundingClientRect().top + scrollY - 20); await p.evaluate(yy => scrollTo(0, yy), y); await p.waitForTimeout(150); await p.screenshot({ path: `${out}/${tag}${loc.replace('/', '-')}-${w}.png` }); }
  await p.close();
}
await b.close(); console.log(`${tag}: ${fails} of 8 views misaligned`);

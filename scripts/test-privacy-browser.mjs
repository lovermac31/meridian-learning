const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const preview = process.env.JE_PRIVACY_PREVIEW_URL || 'http://127.0.0.1:5203';
if (!/^http:\/\/(127\.0\.0\.1|localhost):[0-9]+$/.test(preview)) throw new Error('Only a local preview URL is allowed');
import assert from 'node:assert/strict';
const browser = await chromium.launch({ headless: true, args: ['--mute-audio'] });
const result = [];
try {
 for (const path of ['/products', '/vi/products', '/young-learners-speaking/']) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const requests = []; const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.route('**/*', async route => {
   const url = new URL(route.request().url());
   if (/googletagmanager|\/_vercel\/(insights|speed-insights)\//.test(url.href)) {
    requests.push(url.href);
    return route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* Local mock: no vendor network or data collection. */' });
   }
   if (url.hostname !== 'jurassicenglish.com') return route.abort();
   const response = await fetch(`${preview}${url.pathname}${url.search}`);
   return route.fulfill({ status: response.status, headers: Object.fromEntries(response.headers), body: Buffer.from(await response.arrayBuffer()) });
  });
  await page.goto(`https://jurassicenglish.com${path}`);
  const vi = path.startsWith('/vi');
  const reject = vi ? 'Từ chối phân tích' : 'Reject analytics';
  const accept = vi ? 'Đồng ý phân tích' : 'Accept analytics';
  const settings = vi ? 'Cài đặt quyền riêng tư' : 'Privacy settings';
  await page.getByRole('button', {name:reject, exact:true}).waitFor();
  await page.waitForTimeout(1800); assert.equal(requests.length,0,`default:${path}`);
  await page.getByRole('button',{name:reject,exact:true}).click();
  await page.reload(); await page.getByRole('button',{name:settings,exact:true}).waitFor();
  await page.waitForTimeout(1800); assert.equal(requests.length,0,`reject:${path}`);
  await page.getByRole('button',{name:settings,exact:true}).click();
  await page.getByRole('button',{name:reject,exact:true}).focus();
  await page.keyboard.press('Tab');
  assert.equal(await page.getByRole('button',{name:accept,exact:true}).evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !!document.getElementById('je-ga4'));
  await page.waitForTimeout(200); assert.equal(requests.length,3,`accept:${path}`);
  const allowed = await page.evaluate(() => [window.vaq.find(x=>x[0]==='beforeSend')[1]({type:'pageview',url:location.href}), window.siq.find(x=>x[0]==='beforeSend')[1]({type:'vital',url:location.href})]);
  assert.ok(allowed.every(Boolean));
  await page.getByRole('button',{name:settings,exact:true}).click();
  await page.getByRole('button',{name:reject,exact:true}).click();
  const blocked = await page.evaluate(() => [window.vaq.find(x=>x[0]==='beforeSend')[1]({type:'pageview',url:location.href}), window.siq.find(x=>x[0]==='beforeSend')[1]({type:'vital',url:location.href})]);
  assert.deepEqual(blocked,[null,null]);
  assert.equal(await page.evaluate(()=>window['ga-disable-G-H334PZMDYW']),true);
  await page.reload(); await page.getByRole('button',{name:settings,exact:true}).waitFor();
  await page.waitForTimeout(1800); assert.equal(requests.length,3,`withdraw-reload:${path}`);
  assert.equal(errors.length,0,errors.join('; '));
  if (path === '/products') {
   const category = await page.locator('[data-sample-link]').first().evaluate(el => el.closest('[data-category-panel]').getAttribute('data-category-panel'));
   const categoryToggle = page.locator(`[data-category-toggle="${category}"]`);
   if (await categoryToggle.getAttribute('aria-expanded') !== 'true') await categoryToggle.click();
   const productToggle = page.locator('[data-product-toggle="story-club"]');
   if (await productToggle.getAttribute('aria-expanded') !== 'true') await productToggle.click();
   await page.locator('[data-sample-link]').first().click();
   await page.getByRole('dialog').waitFor();
   const unobscured = await page.evaluate(() => { const aside=document.querySelector('aside[aria-label="Privacy choices"]'); const r=aside.getBoundingClientRect(); return !aside.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)); });
   assert.equal(unobscured,true);
   await page.keyboard.press('Tab');
   assert.equal(await page.getByRole('dialog').evaluate(el=>el.contains(document.activeElement)),true);
   await page.keyboard.press('Escape');
   await page.getByRole('dialog').waitFor({state:'hidden'});
  }
  result.push({path,keyboardAccept:true,sampleOverlay:path==='/products'?'unobscured; focus contained; Escape closes':'not applicable',defaultOptionalLoads:0,rejectedOptionalLoads:0,acceptedOptionalLoads:3,withdrawnMiddleware:'null/null',withdrawnReloadAdditionalLoads:0,pageErrors:errors});
  await context.close();
 }
 console.log(JSON.stringify({browser:'Chromium, muted',network:'All requests fulfilled locally or aborted; vendor scripts mocked',result},null,2));
} finally {await browser.close();}

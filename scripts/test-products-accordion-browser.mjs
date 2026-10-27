// Browser acceptance for the products accordion. Run against npm preview; Playwright/axe are optional external QA tools.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const tools=process.env.BROWSER_TOOLS;
const {chromium}=require(tools ? `${tools}/playwright` : 'playwright');
const AxeBuilder=require(tools ? `${tools}/@axe-core/playwright` : '@axe-core/playwright').default;
const dir=process.env.EVIDENCE_DIR||'.regen/runs/products-accordion';
await fs.mkdir(dir,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--mute-audio']});const report=[];
const base=process.env.BASE_URL||'http://127.0.0.1:5198';
try {
for(const width of [390,1440])for(const locale of ['en','vi']){
 const context=await browser.newContext({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{window.__perf={cls:0,lcp:0};new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__perf.cls+=e.value;}).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{for(const e of l.getEntries())window.__perf.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
 // Vite preview resolves the prerendered directory index with a trailing slash.
 const route=`/${locale==='vi'?'vi/':''}products/`;
 await page.goto(base+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const cat=id=>page.locator(`[data-category-toggle="${id}"]`);const tile=id=>page.locator(`[data-category-tile="${id}"]`);
 const row=id=>page.locator(`[data-product-toggle="${id}"]`);
 assert.equal(await cat('families').getAttribute('aria-expanded'),'true');
 for(const id of ['teachers','centres','ielts'])assert.equal(await cat(id).getAttribute('aria-expanded'),'false');
 const ids=await page.locator('.products-page li[id]').evaluateAll(es=>es.map(e=>e.id));assert.equal(ids.length,35);
 const initial=await page.evaluate(()=>({height:document.documentElement.scrollHeight,perf:window.__perf,overviewBottom:Math.max(...Array.from(document.querySelectorAll('[data-category-tile]')).map(e=>e.getBoundingClientRect().bottom)),thirdBottom:document.getElementById('one-to-one').getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth}));
 if(width===390){assert.ok(initial.overviewBottom<=844,`overview below first screen: ${initial.overviewBottom}`);assert.ok(initial.thirdBottom<=1266,`third family below1.5screens: ${initial.thirdBottom}`);}assert.equal(initial.overflow,false);
 const undersized=await page.locator('[data-category-tile], [data-category-toggle], [data-product-toggle], [data-sample-open], [data-watch], [data-cta^="product-"]').evaluateAll(es=>es.filter(e=>!e.closest('[inert]')).filter(e=>e.getBoundingClientRect().height<48||e.getBoundingClientRect().width<48).map(e=>e.outerHTML));assert.deepEqual(undersized,[]);
 const scans=[];async function capture(state){await page.screenshot({path:`${dir}/${locale}-${width}-${state}.png`});const axe=await new AxeBuilder({page}).analyze();scans.push({state,violations:axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});assert.equal(axe.violations.length,0,JSON.stringify(scans.at(-1)));}
 await capture('category-open');await cat('families').click();await page.evaluate(()=>scrollTo(0,0));const collapsedHeight=await page.evaluate(()=>document.documentElement.scrollHeight);await capture('collapsed');assert.equal(await page.locator('.products-page li[id]').count(),35);
 await tile('families').focus();await page.keyboard.press('Enter');assert.equal(await cat('families').getAttribute('aria-expanded'),'true');
 await cat('teachers').click();assert.equal(await cat('families').getAttribute('aria-expanded'),'true');assert.equal(await cat('teachers').getAttribute('aria-expanded'),'true');await cat('teachers').click();
 await row('story-club').click();assert.equal(await row('story-club').getAttribute('aria-expanded'),'true');await capture('product-expanded');
 await page.locator('[data-sample-open="story-club"]').click();await page.locator('[data-sample-viewer="story-club"]').waitFor();await capture('sample-modal');
 await page.keyboard.press('Escape');assert.equal(await page.locator('[data-sample-viewer]').count(),0);assert.equal(await page.locator('[data-sample-open="story-club"]').evaluate(e=>e===document.activeElement),true);
 for(const id of ['families','teachers','centres','ielts','ielts-speaking','ielts-writing',...ids,'teacher-pack']){
  await page.evaluate(id=>{location.hash=id;},id);
  const product=id==='teacher-pack'?'teacher-pack-l1':ids.includes(id)?id:null;
  if(product)await page.waitForFunction(id=>document.querySelector(`[data-product-toggle="${id}"]`)?.getAttribute('aria-expanded')==='true',product);
  else await page.waitForFunction(id=>document.querySelector(`[data-category-toggle="${id.startsWith('ielts-')?'ielts':id}"]`)?.getAttribute('aria-expanded')==='true',id);
  const target=page.locator(`[id="${product??id}"]`);assert.equal(await target.evaluate(e=>!!e.closest('[inert]')),false,id);
  await page.waitForFunction(id=>{const r=document.getElementById(id).getBoundingClientRect();return r.top>=70&&r.top<innerHeight;},product??id);

 }
 await page.goto(base+route+'#teachers',{waitUntil:'networkidle'});
 await page.evaluate(()=>{location.hash='ielts-speaking-ladder';});await page.waitForFunction(()=>document.querySelector('[data-product-toggle="ielts-speaking-ladder"]')?.getAttribute('aria-expanded')==='true');
 await page.goBack();await page.waitForFunction(()=>location.hash==='#teachers');assert.equal(await cat('teachers').getAttribute('aria-expanded'),'true');
 await page.goto(base+route+'?utm_source=fb-teachers#teacher-pack',{waitUntil:'networkidle'});await page.waitForFunction(()=>document.querySelector('[data-product-toggle="teacher-pack-l1"]')?.getAttribute('aria-expanded')==='true');assert.match(await page.locator('[data-order-code="teacher-pack-l1"]').innerText(),/FBT/);assert.match(await page.locator('[data-paypal-link="teacher-pack-l1"]').getAttribute('href'),/FBT/);
 await page.evaluate(()=>{location.hash='baseline-sample';});await page.locator('[data-sample-viewer="baseline"]').waitFor();await page.keyboard.press('Escape');assert.equal(new URL(page.url()).hash,'#baseline');
 await page.evaluate(()=>{location.hash='%broken';});await page.evaluate(()=>{location.hash='nonexistent-product';});
 assert.deepEqual(errors,[]);
 report.push({locale,width,initial,collapsedHeight,anchorCases:ids.length+7,scans,errors});await context.close();
}
} finally { await browser.close(); }
await fs.writeFile(`${dir}/browser-acceptance.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report.map(({scans,...r})=>({...r,axeScans:scans.length}))));

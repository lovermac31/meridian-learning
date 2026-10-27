// Local-only sample text/ARIA/axe regression. This is not a VoiceOver test.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
const require = createRequire(import.meta.url);
const tools = process.env.BROWSER_TOOLS;
const { chromium, webkit, firefox } = require(tools ? `${tools}/playwright` : 'playwright');
const AxeBuilder = require(tools ? `${tools}/@axe-core/playwright` : '@axe-core/playwright').default;
const base = process.env.BASE_URL || 'http://127.0.0.1:5211';
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base)) throw new Error('Only a local preview is permitted');
const dir = process.env.EVIDENCE_DIR || '.regen/runs/sample-text-browser';
await fs.mkdir(dir, { recursive: true });
const documents = Object.fromEntries(await Promise.all(['story-club', 'printable-pack', 'centre-licence', 'parent-pack-l3', 'parent-pack-l2', 'ielts-writing-teacher-pack'].map(async id => [id, JSON.parse(await fs.readFile(`public/samples/pages/${id}-text.json`, 'utf8'))])));
const results = []; const normalize = text => text.replace(/\s+/g, ' ').trim();
async function axe(page, label) {
  const scan = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(scan.violations.map(v => ({ id:v.id, impact:v.impact, targets:v.nodes.map(n => n.target) })), [], label);
  return { state: label, violations: 0 };
}
async function pageText(page, dialog, doc, index, engine, context) {
  const image = dialog.locator('[data-viewer-page]');
  const region = dialog.locator('[data-viewer-text-page]');
  await page.waitForFunction(({index,text}) => document.querySelector(`[data-viewer-text-page="${index + 1}"]`)?.textContent === text, {index, text:doc.pages[index].text});
  assert.equal(await image.getAttribute('aria-describedby'), await dialog.locator('[data-viewer-description]').getAttribute('id'));
  const snapshot = await dialog.ariaSnapshot();
  assert.ok(snapshot.includes('region'), 'accessible tree exposes the page-text region');
  let imageDescriptionVerified = false;
  if (engine === 'chromium') {
    const cdp = await context.newCDPSession(page);
    const tree = await cdp.send('Accessibility.getFullAXTree');
    const alt = await image.getAttribute('alt');
    const node = tree.nodes.find(n => n.role?.value === 'image' && n.name?.value === alt);
    assert.equal(normalize(node?.description?.value || ''), normalize(doc.pages[index].text), 'actual Chromium accessibility description matches current page text');
    await cdp.detach(); imageDescriptionVerified = true;
  }
  return { ariaDescriptionLinked: true, accessibilityRegionPresent: true, chromiumImageDescriptionVerified: imageDescriptionVerified };
}
for (const [engine, api] of Object.entries({chromium, webkit, firefox})) {
  if (process.env.BROWSER_ENGINES && !process.env.BROWSER_ENGINES.split(',').includes(engine)) continue;
  const browser = await api.launch({headless:true,args:engine === 'chromium' ? ['--mute-audio'] : [], ...(engine === 'firefox' ? {firefoxUserPrefs:{'media.volume_scale':'0.0'}} : {})});
  try {
    for (const width of [390,1440]) for (const locale of ['en','vi']) {
      const context = await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
      await context.addInitScript(() => { HTMLMediaElement.prototype.play = function(){ this.muted = true; return Promise.resolve(); }; });
      let textRequests=0,blocked=0; const errors=[];
      await context.route('**/*',route => { const req=route.request(); if(!req.url().startsWith(base + '/') || req.method()!=='GET'){blocked++;return route.abort();}if(req.url().endsWith('-text.json'))textRequests++;return route.continue(); });
      const page = await context.newPage(); page.on('pageerror', e => errors.push(e.name));
      await page.goto(`${base}/${locale==='vi'?'vi/':''}products/story-club/`,{waitUntil:'networkidle'});
      assert.equal(textRequests,0,'sample text is not loaded until viewer opens');
      const opener=page.locator('[data-sample-link="story-club"]');await opener.focus();await page.keyboard.press('Enter');
      const dialog=page.locator('[data-sample-viewer="story-club"]');await dialog.waitFor();
      const states=[];const described=[];
      described.push(await pageText(page,dialog,documents['story-club'],0,engine,context));states.push(await axe(page,'open image'));
      const region=dialog.locator('[data-viewer-text-page]');assert.ok((await region.getAttribute('class')).includes('sr-only'));
      await page.keyboard.press('ArrowRight');described.push(await pageText(page,dialog,documents['story-club'],1,engine,context));states.push(await axe(page,'paged image'));
      const toggle=dialog.locator('[data-viewer-text-toggle]');await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert.equal(await toggle.evaluate(el=>el===document.activeElement),true,'toggle does not steal focus');assert.ok(!(await region.getAttribute('class')).includes('sr-only'));states.push(await axe(page,'visible text'));
      await page.keyboard.press('Tab');assert.equal(await region.evaluate(el=>el===document.activeElement),true,'visible text participates in dialog keyboard cycle');await page.keyboard.press('ArrowRight');assert.equal(await dialog.locator('[data-viewer-page]').getAttribute('data-viewer-page'),'2','reading text with arrows does not flip pages');await dialog.locator('[data-viewer-next]').focus();
      for(let n=2;n<documents['story-club'].pageCount;n++)await page.keyboard.press('ArrowRight');
      described.push(await pageText(page,dialog,documents['story-club'],documents['story-club'].pageCount-1,engine,context));assert.equal(await dialog.locator('[data-viewer-order]').count(),1);states.push(await axe(page,'last page text and CTA'));
      assert.equal(await dialog.locator('a[download],a[href$=".pdf"]').count(),0);
      await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'false');await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});assert.equal(await opener.evaluate(el=>el===document.activeElement),true);
      assert.equal(textRequests,1);assert.deepEqual(errors,[]);
      results.push({engine,version:browser.version(),width,locale,textRequests,states,described,keyboardToggle:true,focusContained:true,escapeAndOpenerRestored:true,blockedExternalRequests:blocked,pageErrors:errors});
      console.log(`${engine}/${width}/${locale}: open/paged/toggled/last-page axe and ARIA pass`);
      await context.close();
    }
    if(engine==='chromium'){
      for(const [id,index]of[['printable-pack',4],['centre-licence',13]]){
        const context=await browser.newContext({viewport:{width:390,height:900}});await context.route('**/*',r=>r.request().url().startsWith(base+'/')&&r.request().method()==='GET'?r.continue():r.abort());const page=await context.newPage();await page.goto(`${base}/products/${id}/#${id}-sample`,{waitUntil:'networkidle'});const dialog=page.locator(`[data-sample-viewer="${id}"]`);await dialog.waitFor();for(let n=0;n<index;n++)await page.keyboard.press('ArrowRight');const described=await pageText(page,dialog,documents[id],index,engine,context);assert.equal(documents[id].pages[index].method,'pdf-text+reviewed-ocr');await dialog.locator('[data-viewer-text-toggle]').click();const state=await axe(page,'reviewed illustrated text');results.push({engine,width:390,product:id,page:index+1,reviewedOCR:true,described,states:[state]});await context.close();
      }
      {
        const context=await browser.newContext({viewport:{width:390,height:900}});await context.route('**/*',r=>r.request().url().startsWith(base+'/')&&r.request().method()==='GET'?r.continue():r.abort());const page=await context.newPage();await page.goto(`${base}/products/parent-pack-l3/#parent-pack-l3-sample`,{waitUntil:'networkidle'});const dialog=page.locator('[data-sample-viewer="parent-pack-l3"]');await dialog.waitFor();for(let n=0;n<3;n++)await page.keyboard.press('ArrowRight');await pageText(page,dialog,documents['parent-pack-l3'],3,engine,context);const toggle=dialog.locator('[data-viewer-text-toggle]');await toggle.focus();await page.keyboard.press('Enter');assert.equal(await toggle.evaluate(el=>el===document.activeElement),true);await page.keyboard.press('Tab');const region=dialog.locator('[data-viewer-text-page]');assert.equal(await region.evaluate(el=>el===document.activeElement),true);assert.equal(await region.evaluate(el=>el.scrollHeight>el.clientHeight),true);await page.keyboard.press('PageDown');await page.waitForFunction(()=>document.querySelector('[data-viewer-text-page]').scrollTop>0);await page.keyboard.press('ArrowDown');await page.keyboard.press('ArrowRight');assert.equal(await dialog.locator('[data-viewer-page]').getAttribute('data-viewer-page'),'4');results.push({engine,width:390,product:'parent-pack-l3',page:4,longTextKeyboardScrollable:true,readingKeysDoNotFlipPage:true});await context.close();
      }
      for(const id of ['parent-pack-l2','ielts-writing-teacher-pack']){
        const context=await browser.newContext({viewport:{width:390,height:900}});await context.route('**/*',r=>r.request().url().startsWith(base+'/')&&r.request().method()==='GET'?r.continue():r.abort());const page=await context.newPage();await page.goto(`${base}/products/${id}/#${id}-sample`,{waitUntil:'networkidle'});const dialog=page.locator(`[data-sample-viewer="${id}"]`);await dialog.waitFor();await pageText(page,dialog,documents[id],0,engine,context);const src=await dialog.locator('[data-viewer-page]').getAttribute('src');assert.match(src,/\?v=[0-9a-f]{12}$/);const response=await page.request.get(base+src);assert.equal(createHash('sha256').update(await response.body()).digest('hex'),documents[id].pages[0].imageSha256);results.push({engine,width:390,product:id,revisedImageCacheKey:true,fetchedImageMatchesTextProvenance:true});await context.close();
      }
      for(const mode of ['missing','malformed']){
        const context=await browser.newContext();await context.route('**/*',r=>{const u=r.request().url();if(!u.startsWith(base+'/'))return r.abort();if(u.endsWith('/story-club-text.json'))return r.fulfill({status:mode==='missing'?404:200,contentType:'application/json',body:mode==='missing'?'{}':'{"privateText":"not an approved sample"}'});return r.continue();});const page=await context.newPage();await page.goto(`${base}/products/story-club/#story-club-sample`,{waitUntil:'networkidle'});const dialog=page.locator('[data-sample-viewer="story-club"]');await dialog.waitFor();await page.waitForFunction(()=>document.querySelector('[data-viewer-text-page]')?.textContent?.includes('could not load'));assert.ok(!(await dialog.innerText()).includes('privateText'));await dialog.locator('[data-viewer-text-toggle]').click();await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});results.push({engine,mode,safeLocalizedError:true,closeWorks:true});await context.close();
      }
    }
  } finally {await browser.close();}
}
await fs.writeFile(`${dir}/results.json`,JSON.stringify({note:'ARIA tree and Chromium accessibility description smoke only; NOT VoiceOver/native screen-reader output.',results},null,2)+'\n');

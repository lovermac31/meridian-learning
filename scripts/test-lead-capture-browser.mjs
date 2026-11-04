// Local-only lead form smoke and screenshot capture. API routes are mocked; no Notion or external form writes occur.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const tools=process.env.BROWSER_TOOLS;
const {chromium}=require(tools?tools+'/playwright':'playwright');
const base=process.env.BASE_URL||'http://127.0.0.1:5214';
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base))throw Error('Only a local preview URL is allowed');
const out='docs/qa/lead-capture';
await fs.mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--mute-audio']});
const evidence=[];
try {
 for(const placement of ['home','products'])for(const locale of ['en','vi']){
  const context=await browser.newContext({viewport:{width:375,height:844},reducedMotion:'reduce'});
  await context.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){this.muted=true;return Promise.resolve();};});
  const page=await context.newPage();const eventPayloads=[];const submitBodies=[];
  await page.route('**/*',async route=>{
   const request=route.request(),url=request.url();
   if(url===base+'/api/sample-pack'&&request.method()==='POST'){
    submitBodies.push(JSON.parse(request.postData()||'{}'));
    return route.fulfill({status:200,contentType:'application/json',body:'{"ok":true,"submissionId":"mock-submit"}'});
   }
   if(url===base+'/api/event'&&request.method()==='POST'){
    eventPayloads.push(JSON.parse(request.postData()||'{}'));
    return route.fulfill({status:204,body:''});
   }
   if(url.startsWith(base+'/')&&request.method()==='GET')return route.continue();
   return route.abort();
  });
  const pathname=(locale==='vi'?'/vi':'')+(placement==='home'?'/':'/products');
  await page.goto(base+pathname,{waitUntil:'networkidle'});
  const form=page.locator('#free-sample-pack form');
  await form.waitFor();await form.scrollIntoViewIfNeeded();
  assert.equal(await form.locator('input[name="phone"]').count(),1);
  assert.equal(await form.locator('input[name="email"]').count(),1);
  assert.ok((await form.innerText()).includes(locale==='vi'?'Thầy Jay sẽ liên hệ qua Zalo hoặc email về yêu cầu này.':'Mr. Jay will contact you on Zalo or email about this request.'));
  assert.equal(await form.locator('a[href*="/legal/privacy"]').count(),1);
  await form.screenshot({path:path.join(out,`sample-pack-${placement}-${locale}-375.png`)});
  await form.locator('input[name="consent"]').check();
  await form.locator('button[type="submit"]').click();
  const inline=await form.getByRole('alert').innerText();
  assert.ok(inline.includes(locale==='vi'?'Vui lòng nhập số Zalo hoặc email.':'Enter a Zalo number or an email.'));
  await form.locator('input[name="phone"]').fill('0396 085.076');
  const nextEvent=page.waitForRequest(r=>r.url()===base+'/api/event'&&r.method()==='POST');
  await form.locator('button[type="submit"]').click();
  await nextEvent;
  await page.getByRole('status').filter({hasText:locale==='vi'?'Cảm ơn bạn':'Thank you'}).waitFor();
  assert.equal(submitBodies.length,1);
  assert.equal(submitBodies[0].phone,'0396 085.076');
  assert.equal(submitBodies[0].email,'');
  assert.equal(eventPayloads.length,1,'lead_submit fires once after a successful submit');
  assert.equal(eventPayloads[0].event,'lead_submit');
  assert.equal(eventPayloads[0].locale,locale);
  const eventText=JSON.stringify(eventPayloads[0]).toLowerCase();
  for(const forbidden of ['phone','email','name','0396','+84396'])assert.ok(!eventText.includes(forbidden),`event payload excludes ${forbidden}`);
  evidence.push({placement,locale,viewport:375,inlineNoContact:true,phoneOnlySuccess:true,leadSubmitEvents:eventPayloads.length,eventHasNoPersonalData:true,screenshot:path.join(out,`sample-pack-${placement}-${locale}-375.png`)});
  await context.close();
 }
} finally {await browser.close();}
await fs.writeFile(path.join(out,'browser-evidence.json'),JSON.stringify({note:'Local browser only; sample-pack and event APIs are mocked; no production or Notion writes.',cases:evidence},null,2)+'\n');
console.log(JSON.stringify({cases:evidence.length,screenshots:evidence.length,successfulLeadSubmitEvents:evidence.length,piiFreeEvents:true}));

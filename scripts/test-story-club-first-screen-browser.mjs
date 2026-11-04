import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const tools=process.env.BROWSER_TOOLS;
const {chromium,webkit,firefox}=require(tools?`${tools}/playwright`:'playwright');
const AxeBuilder=require(tools?`${tools}/@axe-core/playwright`:'@axe-core/playwright').default;
import assert from 'node:assert/strict';import {writeFileSync,mkdirSync} from 'node:fs';
const base=process.env.BASE_URL||'http://127.0.0.1:5212',rows=[];
if(!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(base))throw Error('Only a local preview URL is allowed');mkdirSync('.regen/runs/screens',{recursive:true});
for(const [engine,api] of Object.entries({chromium,webkit,firefox})){
 const browser=await api.launch({headless:true,args:engine==='chromium'?['--mute-audio']:[],...(engine==='firefox'?{firefoxUserPrefs:{'media.volume_scale':'0.0'}}:{})});
 try{for(const width of [390,1440])for(const locale of ['en','vi']){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});await context.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){this.muted=true;return Promise.resolve();};});
  await context.route('**/*',r=>r.request().url().startsWith(base+'/')&&r.request().method()==='GET'?r.continue():r.abort());
  const page=await context.newPage();await page.goto(base+(locale==='vi'?'/vi':'')+'/products/story-club/',{waitUntil:'networkidle'});
  const result=await page.evaluate(()=>{const price=document.querySelector('[data-price="story-club"]'),action=document.querySelector('[data-cta="product-page-story-club"]'),image=document.querySelector('[data-product="story-club"]>img'),lead=document.querySelector('.insights-lead'),schedule=document.querySelector('[data-story-club-schedule]');
   const rect=e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};};const a=rect(action);const hit=document.elementFromPoint(a.x+a.width/2,a.y+a.height/2);return{price:rect(price),action:a,image:rect(image),lead:lead.textContent,schedule:schedule.textContent,href:action.getAttribute('href'),ctaCount:document.querySelectorAll('[data-cta="product-page-story-club"]').length,actionUnobscured:action===hit||action.contains(hit),overflow:document.documentElement.scrollWidth>innerWidth+1};});
  assert.equal(result.ctaCount,1);assert.ok(result.price.bottom<=900&&result.action.bottom<=900);assert.ok(result.action.bottom<result.image.y);assert.equal(result.actionUnobscured,true);assert.equal(result.overflow,false);assert.ok(result.lead.includes('5–8'));assert.ok(result.schedule.includes('9:00')&&result.schedule.includes('Google Meet')&&result.schedule.includes('6'));
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();assert.deepEqual(axe.violations.map(v=>v.id),[]);
  if(engine==='chromium'&&width===390)await page.screenshot({path:'.regen/runs/screens/story-club-'+locale+'-390.png'});
  rows.push({engine,width,locale,...result,axeViolations:0});await context.close();
 }}finally{await browser.close();}
}
writeFileSync('.regen/runs/first-screen.json',JSON.stringify(rows,null,2));console.log(JSON.stringify({cases:rows.length,allAboveFold:true,allActionsUnobscured:true,axeViolations:0}));

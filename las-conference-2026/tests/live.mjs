import {chromium} from 'playwright';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {reports,programme} from '../data.js';
const base='https://sweemingxx.github.io/las-conference-2026/';
const digest=b=>createHash('sha256').update(b).digest('hex');
const files=['index.html','styles.css','theme.css','landing.css','favicon.svg','app.js','data.js',...new Set(reports.map(r=>'reports/'+r.file+'.md'))];
const result={url:base,testedAt:new Date().toISOString(),success:false,checks:[],assetHashes:{}};
await mkdir('verification',{recursive:true});
const browser=await chromium.launch();
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000}});const page=await context.newPage();
 let ready=false,lastMismatch=[];
 for(let attempt=0;attempt<24;attempt++){
  lastMismatch=[];
  for(const file of files){
   const expected=digest(await readFile(file));
   try{const response=await page.request.get(base+file+'?verify='+Date.now(),{timeout:20000});const actual=digest(await response.body());if(!response.ok()||expected!==actual)lastMismatch.push(file);else result.assetHashes[file]=actual;}catch{lastMismatch.push(file);}
  }
  if(!lastMismatch.length){ready=true;break;}await new Promise(r=>setTimeout(r,5000));
 }
 assert(ready,'Deployment has not converged: '+lastMismatch.join(', '));
 result.checks.push(`All ${files.length} runtime assets, including 13 complete report texts and the new landing design, match the tested repository bytes exactly.`);
 const response=await page.goto(base,{waitUntil:'networkidle'});assert.equal(response.status(),200);
 await page.waitForFunction(()=>document.querySelector('#search-status').textContent.includes('Full-text search is ready'));
 assert.equal(await page.locator('#archive-list .archive-item').count(),14);
 await page.locator('[data-programme="2"]').click();
 assert.equal(await page.locator('.programme-day .schedule-row, .programme-day .schedule-break').count(),12);
 const schedule=await page.locator('#programme-list').innerText();assert(schedule.includes('16:30 – 16:35'));assert(schedule.includes('16:35 – 17:00'));assert(!schedule.includes('Time not stated'));
 result.checks.push('Live official Day 2 programme has all 12 schedule rows, including separate closing and awards times, with no missing-time placeholders.');
 await page.goto(base+'#read/quotes');await page.waitForFunction(()=>document.querySelector('#report-content').getAttribute('aria-busy')==='false');assert.equal(await page.locator('#report-content blockquote').count(),33);
 result.checks.push('Live anthology renders all 33 quotations.');
 const mobile=await browser.newContext({viewport:{width:375,height:900},reducedMotion:'reduce'});const m=await mobile.newPage();
 await m.goto(base,{waitUntil:'networkidle'});await m.waitForFunction(()=>document.querySelector('#search-status').textContent.includes('Full-text search is ready'));
 const layout=await m.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,navBottom:document.querySelector('.topbar').getBoundingClientRect().bottom,contentTop:document.querySelector('.hero-top .eyebrow').getBoundingClientRect().top,scroll:scrollY}));
 assert.equal(layout.overflow,false);assert(layout.contentTop>layout.navBottom,'Fixed navigation overlaps the visible introduction');assert.equal(layout.scroll,0);
 await m.screenshot({path:'verification/mobile-live.png'});
 await m.goto(base+'#read/libraries-papers');await m.waitForFunction(()=>document.querySelector('#report-content table'));
 await m.locator('.reader-contents summary').click();await m.locator('#reader-toc button').nth(2).click();assert((await m.locator('#reader-scroll').evaluate(e=>e.scrollTop))>100);
 result.checks.push('Fresh 375px live load: no horizontal overflow or fixed-header overlap; mobile contents navigation works with reduced motion.');
 result.sourceEntries=reports.length;result.sourcePages=reports.reduce((n,r)=>n+r.pages,0);result.programmeRows=programme.length;result.httpStatus=200;result.success=true;
}catch(e){result.error=e.stack||String(e);console.error(`::error file=las-conference-2026/tests/live.mjs,line=1::${e.message.replace(/\n/g,' ')}`);process.exitCode=1;}
finally{await writeFile('verification/live-final.json',JSON.stringify(result,null,2));await browser.close();console.log(JSON.stringify(result,null,2));}

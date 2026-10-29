import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import assert from 'node:assert/strict';
import { reports, programme } from '../data.js';

const root = resolve(new URL('..',import.meta.url).pathname);
const evidence = resolve(root,'verification');
await mkdir(evidence,{recursive:true});
const result = {testedAt:new Date().toISOString(),commit:process.env.GITHUB_SHA || 'local',checks:[],errors:[],screenshots:[],live:null};
function pass(name,detail) { result.checks.push({name,status:'passed',detail}); console.log('PASS',name,detail || ''); }
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.md':'text/plain; charset=utf-8','.svg':'image/svg+xml'};
const server = createServer(async (req,res) => {
 try {
  const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = resolve(root,'.'+path+(path.endsWith('/')?'index.html':''));
  if (!file.startsWith(root+sep)) { res.writeHead(403); res.end(); return; }
  const bytes = await readFile(file); res.writeHead(200,{'Content-Type':mime[extname(file)] || 'application/octet-stream'}); res.end(bytes);
 } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(r => server.listen(4173,'127.0.0.1',r));
let browser;
try {
 assert.equal(reports.length,14); assert.equal(new Set(reports.map(r=>r.file)).size,13); assert.equal(reports.reduce((n,r)=>n+r.pages,0),57);
 assert.equal(reports.filter(r=>r.day===1).length,6); assert.equal(reports.filter(r=>r.day===2).length,6);
 for (const r of reports) { const text=await readFile(resolve(root,'reports',r.file+'.md'),'utf8'); assert(text.length>8000,r.id+' too short'); assert(text.startsWith('# ')); }
 assert.equal(programme.filter(p=>p.day===1).length,14); assert.equal(programme.filter(p=>p.day===2).length,12);
 for(const p of programme) for(const id of p.links||[]) assert(reports.some(r=>r.id===id),'broken report link '+id);
 pass('Source coverage','14 source entries, 13 full report texts, 57 source pages; 6 Day 1 and 6 Day 2 uploads indexed.');
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1000}});
 const page=await context.newPage();
 const jsErrors=[]; page.on('pageerror',e=>jsErrors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');
 await page.waitForFunction(()=>document.querySelector('#search-status').textContent.includes('Full-text search is ready'));
 assert.equal(await page.locator('#archive-list .archive-item').count(),14);
 assert.equal(await page.locator('#day1-cards .report-card').count(),6); assert.equal(await page.locator('#day2-cards .report-card').count(),6);
 pass('Initial load and full-text index','All report requests loaded successfully.');
 await page.screenshot({path:resolve(evidence,'desktop.png')}); result.screenshots.push('desktop.png');
 await page.locator('[data-programme="2"]').click(); assert.equal(await page.locator('.programme-day').count(),1);
 await page.locator('#expand-programme').click(); assert.equal(await page.locator('.schedule-row:not([open])').count(),0);
 await page.locator('[data-programme="all"]').click(); assert.equal(await page.locator('.programme-day').count(),2);
 pass('Programme','Both-day and single-day filters, expandable sessions and report link targets.');
 await page.locator('#search').fill('CLOAK'); await page.waitForTimeout(100); assert((await page.locator('#archive-list .archive-item').count())>=2);
 await page.locator('#search').fill('zzzznoresult987654'); assert(await page.locator('#empty-state').isVisible());
 await page.locator('#reset-search').click(); assert.equal(await page.locator('#archive-list .archive-item').count(),14);
 pass('Search and recovery','Full-text matches, empty state and reset tested.');
 for (const r of reports) {
  await page.evaluate(id=>{location.hash='#read/'+id},r.id);
  await page.waitForFunction(id=>document.querySelector('#reader-title').textContent===id.title && document.querySelector('#report-content').getAttribute('aria-busy')==='false',r);
  assert(await page.locator('#reader').isVisible());
  const text=await page.locator('#report-content').innerText(); assert(text.length>7800,r.id+' rendered text missing');
  assert((await page.locator('#report-content blockquote').count())>=5,r.id+' quotations missing');
  if(r.file!=='quotes') assert.equal(await page.locator('#report-content table').count(),1,r.id+' comparison table');
  assert((await page.locator('#reader-toc button').count())>=5,r.id+' contents missing');
 }
 pass('All report readers','Every one of 14 entries opens complete text, quotations, source notes and contents. All 12 distinct non-anthology reports render a comparison table.');
 await page.evaluate(()=>{location.hash='#read/libraries-papers'});
 await page.waitForFunction(()=>document.querySelector('#report-content').textContent.includes('278 Year 2'));
 await page.locator('#font-larger').click(); assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--reading-size').trim()),'19px');
 await page.locator('#font-smaller').click(); await page.locator('#save-report').click(); assert.equal(await page.locator('#save-report').getAttribute('aria-pressed'),'true');
 await page.locator('#reader-toc button').nth(2).click(); await page.waitForTimeout(700); assert((await page.locator('#reader-scroll').evaluate(e=>e.scrollTop))>100);
 await page.locator('#reader-scroll').evaluate(e=>e.scrollTo({top:0,behavior:'instant'})); await page.screenshot({path:resolve(evidence,'reader.png')}); result.screenshots.push('reader.png');
 await page.keyboard.press('Escape'); assert(!(await page.locator('#reader').isVisible()));
 await page.locator('[data-filter="saved"]').click(); assert.equal(await page.locator('#archive-list .archive-item').count(),1); await page.locator('[data-filter="all"]').click();
 pass('Reader interactions','Text resizing, section navigation, saved reports, Escape, and conference return.');
 await page.goto('http://127.0.0.1:4173/#read/quotes');
 await page.waitForFunction(()=>document.querySelector('#report-content').getAttribute('aria-busy')==='false');
 assert.equal(await page.locator('#report-content blockquote').count(),33);
 await page.addScriptTag({path:resolve(root,'node_modules/axe-core/axe.min.js')});
 let a11y=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)}));});
 result.readerAccessibility=a11y;
 assert.equal(a11y.filter(v=>['serious','critical'].includes(v.impact)).length,0,JSON.stringify(a11y));
 await page.emulateMedia({media:'print'}); const printOverflow=await page.locator('#reader-scroll').evaluate(e=>getComputedStyle(e).overflow); assert.equal(printOverflow,'visible'); await page.emulateMedia({media:'screen'});
 await page.locator('#close-reader').click();
 a11y=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>n.target)}));}); result.pageAccessibility=a11y;
 assert.equal(a11y.filter(v=>['serious','critical'].includes(v.impact)).length,0,JSON.stringify(a11y));
 pass('Accessibility and print','No serious/critical axe WCAG A/AA findings in the page or reader. Print CSS exposes full report. Direct anthology link renders all 33 quotations.');
 for(const width of [375,768,1024,1440]) {
  await page.setViewportSize({width,height:900}); await page.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await page.waitForTimeout(150);
  const sizes=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth})); assert(sizes.scroll<=sizes.client+1,JSON.stringify({width,...sizes}));
  if(width===375) { await page.screenshot({path:resolve(evidence,'mobile.png')}); result.screenshots.push('mobile.png'); }
 }
 pass('Responsive layouts','375px, 768px, 1024px and 1440px: no page-level horizontal overflow.');
 await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForFunction(()=>document.querySelector('#motion-toggle').textContent==='Motion: off'); assert.equal(await page.locator('#motion-toggle').textContent(),'Motion: off');
 await page.keyboard.press('/'); assert.equal(await page.locator('#search').evaluate(e=>e===document.activeElement),true);
 pass('Motion and keyboard','System reduced-motion preference respected; / shortcut focuses search.');
 const errorContext=await browser.newContext({viewport:{width:375,height:900}}); const errorPage=await errorContext.newPage();
 await errorPage.route('**/reports/technology-panel.md',route=>route.abort());
 await errorPage.goto('http://127.0.0.1:4173/#read/technology-panel'); await errorPage.locator('#retry-report').waitFor(); assert(await errorPage.locator('.reader-error').isVisible());
 await errorPage.unroute('**/reports/technology-panel.md'); await errorPage.locator('#retry-report').click(); await errorPage.waitForFunction(()=>document.querySelector('#report-content table'));
 const mobileReader=await errorPage.evaluate(()=>({width:document.querySelector('.reader-scroll').clientWidth,scroll:document.querySelector('.reader-scroll').scrollWidth})); assert(mobileReader.scroll<=mobileReader.width+1);
 pass('Network-error recovery','Clear error, working retry and no horizontal overflow in the 375px reader.'); await errorContext.close();
 assert.deepEqual(jsErrors,[]); pass('Runtime','No browser JavaScript exceptions.');
 try {
  const response=await page.request.get('https://las.org.sg/conference/',{timeout:45000});
  if(response.ok()) { const html=await response.text(); const clean=await page.evaluate(html=>{const d=new DOMParser().parseFromString(html,'text/html');d.querySelectorAll('script,style,nav,header,footer').forEach(n=>n.remove());return d.body.textContent.replace(/\n\s*\n/g,'\n').trim()},html); await writeFile(resolve(evidence,'official-programme.json'),JSON.stringify({url:response.url(),retrievedAt:new Date().toISOString(),text:clean.match(/Programme\s*\n([\s\S]*?)Conference Speakers/)?.[1] || 'Programme section could not be isolated.'},null,2)); }
 }catch(e){result.officialProgrammeRetrieval=e.message;}
 for(let attempt=0;attempt<12;attempt++) {
  try {const live=await page.request.get('https://sweemingxx.github.io/las-conference-2026/',{timeout:20000}); const html=await live.text(); if(live.ok()&&html.includes('Libraries for Tomorrow')&&html.includes('app.js')) {result.live={url:live.url(),status:live.status(),verifiedAt:new Date().toISOString()}; break;}}catch{}
  await new Promise(r=>setTimeout(r,10000));
 }
 assert(result.live,'Live GitHub Pages URL did not become ready');
 await page.goto(result.live.url,{waitUntil:'networkidle'}); await page.waitForFunction(()=>document.querySelector('#search-status').textContent.includes('Full-text search is ready'),{timeout:30000});
 assert.equal(await page.locator('#archive-list .archive-item').count(),14);
 await page.evaluate(()=>location.hash='#read/librarianship-papers'); await page.waitForFunction(()=>document.querySelector('#report-content').textContent.includes('358 unique Singapore'));
 pass('LIVE GitHub Pages','HTTPS 200, 14 report entries, all full texts indexed, and live full report navigation verified.');
 result.success=true;
} catch(e) { result.success=false; result.errors.push(e.stack || String(e)); console.error(e); process.exitCode=1; }
finally { await writeFile(resolve(evidence,'results.json'),JSON.stringify(result,null,2)); await browser?.close(); await new Promise(r=>server.close(r)); }

const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const url=process.argv[2];const mode=process.argv[3]||'local';
const out='second-serving-test-results';fs.mkdirSync(out,{recursive:true});
const report=[];function pass(text){report.push(text);console.log('PASS:',text)}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
if(mode==='live'){
  let ready=false;
  for(let attempt=0;attempt<50;attempt++){
    try{const r=await fetch(url+'?verify='+Date.now(),{signal:AbortSignal.timeout(20000)});const text=await r.text();if(r.ok&&text.includes('ss-1.0.0')){ready=true;pass('Published Pages URL responds HTTP '+r.status+' with expected app build');break}}catch(e){console.log('Waiting for Pages:',e.message)}
    await sleep(12000);
  }
  assert(ready,'GitHub Pages must publish the new app');
}
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});
let page;
try{
const context=await browser.newContext({viewport:{width:1440,height:1080},permissions:['camera','clipboard-write','clipboard-read']});
page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(url,{waitUntil:'networkidle',timeout:60000});await page.locator('#hero-title').waitFor();
assert.equal(await page.title(),'Second Serving — Good food. Better endings.');
assert.equal(await page.locator('#nav-count').textContent(),'0');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true);
await page.screenshot({path:`${out}/${mode}-desktop.png`,fullPage:true});pass('Desktop render, correct title, empty real-data state and no overflow');
await page.locator('#demo-btn').click();assert.equal(await page.locator('.result-row').count(),3);assert(await page.locator('#save-btn').isDisabled());assert.equal(await page.locator('#nav-count').textContent(),'0');assert((await page.locator('#recipe-intro').textContent()).includes('Sample'));pass('Clearly labelled demo matches recipes without polluting shelf or impact');
await page.locator('#manual-btn').click();await page.locator('[data-food="carrot"]').click();assert.equal(await page.locator('.result-row').count(),1);await page.locator('[data-grams="0"]').fill('240');await page.locator('[data-grams="0"]').press('Tab');await page.locator('#save-btn').click();assert.equal(await page.locator('#nav-count').textContent(),'1');assert.equal(await page.locator('.shelf-card-bottom input').inputValue(),'240');pass('Manual review replaces demo, accepts weight and persists a real shelf item');
await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#nav-count').textContent(),'1');assert.equal(await page.locator('.shelf-card-bottom input').inputValue(),'240');pass('Shelf survives reload');
await page.locator('.shelf-card-bottom input').fill('-4');await page.locator('.shelf-card-bottom input').press('Tab');assert.equal(await page.locator('.shelf-card-bottom input').inputValue(),'240');pass('Invalid weights rejected with recovery');
await page.locator('[data-used]').click();assert.equal(await page.locator('#saved-weight').textContent(),'240 g');assert.equal(await page.locator('#saved-items').textContent(),'1');assert.equal(await page.locator('#nav-count').textContent(),'0');await page.locator('#undo-btn').click();assert.equal(await page.locator('#saved-weight').textContent(),'0 g');assert.equal(await page.locator('#nav-count').textContent(),'1');pass('User-confirmed impact logging and undo restore correct totals');
await page.locator('[data-delete]').click();assert.equal(await page.locator('#saved-weight').textContent(),'0 g');await page.locator('#undo-btn').click();pass('Deleting is not counted as food used; removal is reversible');
await page.locator('[data-filter="quick"]').click();const times=await page.locator('.recipe-time').allTextContents();assert(times.every(x=>Number(x.match(/\d+/)[0])<=15));pass('Quick-meal filter returns only recipes at or below 15 minutes');
await page.locator('[data-filter="all"]').click();await page.locator('[data-recipe="fritters"]').click();assert(await page.locator('#recipe-dialog').isVisible());assert(await page.locator('#recipe-log-btn').isDisabled());await page.locator('#recipe-steps input').first().check();assert((await page.locator('#step-progress').textContent()).startsWith('1 of'));await page.locator('#shopping-btn').click();assert((await page.evaluate(()=>navigator.clipboard.readText())).includes('chickpea flour'));await page.locator('#recipe-log-options input').check();await page.locator('#recipe-log-btn').click();assert.equal(await page.locator('#saved-weight').textContent(),'240 g');await page.locator('#undo-btn').click();pass('Recipe match, cooking checklist, shopping list and explicit ingredient-use logging work');
await page.locator('#manual-btn').click();await page.locator('#custom-name').fill('<img src=x onerror=alert(1)>');await page.locator('#custom-form button').click();assert.equal(await page.locator('#results img').count(),0);await page.locator('#save-btn').click();assert.equal(await page.locator('#shelf-items img').count(),0);assert.equal(await page.locator('#nav-count').textContent(),'2');pass('Custom ingredient text is escaped in review and shelf');
await page.locator('#file-input').setInputFiles({name:'not-a-photo.txt',mimeType:'text/plain',buffer:Buffer.from('not an image')});assert((await page.locator('#status').textContent()).includes('Please choose'));pass('Unsupported file types have a constructive error');
await page.locator('#file-input').setInputFiles({name:'corrupt.png',mimeType:'image/png',buffer:Buffer.from('invalid PNG')});await page.waitForFunction(()=>document.querySelector('#status').classList.contains('error'));assert(await page.locator('#upload-btn').isEnabled());pass('Corrupt-image recovery re-enables scanning');
await page.locator('#how-btn').click();await page.keyboard.press('Escape');assert(!(await page.locator('#info-dialog').isVisible()));pass('Native dialogs support Escape and focus return');
if(mode==='live'){
  await page.locator('#camera-btn').click();await page.waitForFunction(()=>!document.querySelector('#capture-btn').disabled,{},{timeout:30000});assert(await page.locator('#camera-video').evaluate(v=>!!v.srcObject&&v.srcObject.active));await page.locator('#camera-dialog .dialog-close').click();assert(await page.locator('#camera-video').evaluate(v=>v.srcObject===null));pass('Real browser media API starts and stops camera tracks');
  const png=await page.evaluate(()=>{const c=document.createElement('canvas');c.width=320;c.height=240;const ctx=c.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,320,240);return c.toDataURL('image/png').split(',')[1]});
  await page.locator('#file-input').setInputFiles({name:'blank.png',mimeType:'image/png',buffer:Buffer.from(png,'base64')});
  await page.waitForFunction(()=>document.querySelector('#capture-scene').hidden===false,{},{timeout:15000});
  await page.waitForFunction(()=>document.querySelector('#studio').getAttribute('aria-busy')==='false',{},{timeout:190000});
  assert.equal(await page.locator('#status').evaluate(el=>el.classList.contains('error')),false,await page.locator('#status').textContent());
  assert((await page.locator('#status').textContent()).includes('No supported produce found'));
  assert(await page.evaluate(()=>!!window.tf&&!!window.cocoSsd));assert.equal(await page.locator('.result-row').count(),0);pass('Real TensorFlow.js/COCO-SSD model downloads and runs inference; blank photo produces no fabricated food detections');
  await page.locator('#clear-image').click();assert(await page.locator('#capture-scene').isHidden());assert.equal(await page.locator('#photo').evaluate(c=>c.width),1);pass('Photo reset clears image memory and restores illustration');
}
assert.deepEqual(errors,[]);pass('No uncaught JavaScript errors during desktop workflows');
await context.close();
for(const width of [390,320]){
const mobile=await browser.newContext({viewport:{width,height:844},isMobile:true,deviceScaleFactor:1});const p=await mobile.newPage();await p.goto(url,{waitUntil:'networkidle'});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`No horizontal overflow at ${width}px`);await p.locator('#manual-btn').click();await p.locator('[data-food="banana"]').click();await p.locator('#save-btn').click();assert.equal(await p.locator('#nav-count').textContent(),'1');await p.locator('[data-recipe="pancakes"]').click();assert(await p.locator('#recipe-dialog').isVisible());assert(await p.evaluate(()=>{const r=document.querySelector('#recipe-dialog').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth}));await p.keyboard.press('Escape');await p.screenshot({path:`${out}/${mode}-mobile-${width}.png`,fullPage:true});await mobile.close();pass(`Mobile ${width}px layout, touch-size controls, shelf and recipe dialog`)}
const broken=await browser.newContext();await broken.addInitScript(()=>{Storage.prototype.setItem=function(){throw Error('Storage blocked')}});const b=await broken.newPage();await b.goto(url,{waitUntil:'networkidle'});await b.locator('#manual-btn').click();await b.locator('[data-food="apple"]').click();await b.locator('#save-btn').click();assert(await b.locator('#storage-warning').isVisible());assert((await b.locator('#storage-warning').textContent()).includes('session only'));assert.equal(await b.locator('#nav-count').textContent(),'1');await broken.close();pass('Blocked storage falls back to session use with explicit warning');
console.log('ALL CHECKS PASSED:',mode,url);
} catch(e){if(page&&!page.isClosed())await page.screenshot({path:`${out}/${mode}-failure.png`,fullPage:true}).catch(()=>{});throw e}
finally{fs.writeFileSync(`${out}/${mode}-report.json`,JSON.stringify({url,mode,checks:report},null,2));await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});

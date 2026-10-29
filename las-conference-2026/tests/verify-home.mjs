import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base='https://sweemingxx.github.io/las-conference-2026/';
await mkdir('verification',{recursive:true});
const browser=await chromium.launch();
try {
  for(const width of [375,560,768,1024,1440]) {
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
    const errors=[]; page.on('pageerror',e=>errors.push(e.message));
    await page.goto(base,{waitUntil:'networkidle'});
    await page.waitForSelector('.hero-feature-copy .button');
    const state=await page.evaluate(()=>{
      const box=s=>document.querySelector(s).getBoundingClientRect();
      return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        heading:box('#hero-title').toJSON(),em:box('#hero-title em').toJSON(),
        intro:box('.hero-top .eyebrow').toJSON(),header:box('.topbar').toJSON(),
        cta:box('.hero-feature-copy .button').toJSON(),feature:box('.hero-feature').toJSON(),
        art:box('.folio').toJSON(),sheets:document.querySelectorAll('.folio-sheet').length,
        panelBackground:getComputedStyle(document.querySelector('.hero-feature')).backgroundImage,
        jumpLinks:[...document.querySelectorAll('.landing-jump a')].map(a=>a.getAttribute('href'))};
    });
    console.log(`LAYOUT ${width}px ${JSON.stringify(state)}`);
    assert(state.scrollWidth<=width+1,`Horizontal overflow at ${width}px: ${state.scrollWidth}`);
    assert(state.intro.top>=state.header.bottom-1,`Navigation overlaps introduction at ${width}px`);
    assert(state.heading.left>=-1&&state.em.right<=width+1,`Headline clipped at ${width}px`);
    assert(state.cta.left>=-1&&state.cta.right<=width+1,`Programme action clipped at ${width}px`);
    assert(state.feature.height>300&&state.art.height>180&&state.sheets===6,`Poster artwork missing at ${width}px`);
    assert(state.panelBackground.includes('gradient'),`Red feature background missing at ${width}px`);
    assert.deepEqual(state.jumpLinks,['#overview','#programme','#archive']);
    assert.deepEqual(errors,[],`Browser errors at ${width}px`);
    if(width===375||width===1440) await page.screenshot({path:`verification/landing-${width}.png`});
    await page.close();
    console.log(`PASS landing ${width}px — typography, graphic, actions, navigation`);
  }
} catch(error) {
  console.error(`::error file=las-conference-2026/tests/verify-home.mjs,line=1::${error.message.replace(/\n/g,' ')}`);
  process.exitCode=1;
} finally { await browser.close(); }

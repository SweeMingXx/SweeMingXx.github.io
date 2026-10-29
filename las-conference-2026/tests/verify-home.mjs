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
    await page.waitForFunction(()=>document.querySelector('.folio img')?.complete);
    const state=await page.evaluate(()=>{
      const box=s=>document.querySelector(s).getBoundingClientRect();
      const img=document.querySelector('.folio img');
      return {viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,
        heading:box('#hero-title').toJSON(),em:box('#hero-title em').toJSON(),
        copy:box('.hero-copy').toJSON(),cta:box('.hero-links .primary').toJSON(),
        header:box('.topbar').toJSON(),eyebrow:box('.hero-top .eyebrow').toJSON(),
        art:box('.folio').toJSON(),imageLoaded:img.naturalWidth>0,
        jumpLinks:[...document.querySelectorAll('.landing-jump a')].map(a=>a.getAttribute('href'))};
    });
    console.log(`LAYOUT ${width}px ${JSON.stringify(state)}`);
    assert(state.imageLoaded,`Hero art not loaded at ${width}px`);
    assert(state.scrollWidth<=width+1,`Horizontal page overflow at ${width}px: ${state.scrollWidth}`);
    assert(state.eyebrow.top>=state.header.bottom-1,`Header overlaps visible introduction at ${width}px`);
    assert(state.heading.left>=-1&&state.em.right<=width+1,`Heading clipped at ${width}px`);
    assert(state.cta.left>=-1&&state.cta.right<=width+1,`Primary action clipped at ${width}px`);
    assert(state.art.height>200,`Artwork missing at ${width}px`);
    assert.deepEqual(state.jumpLinks,['#overview','#programme','#archive']);
    assert.deepEqual(errors,[],`Browser errors at ${width}px`);
    if(width===375||width===1440) await page.screenshot({path:`verification/landing-${width}.png`});
    await page.close();
    console.log(`PASS landing ${width}px — heading, art, CTA, header and navigation`);
  }
} catch(error) {
  console.error(`::error file=las-conference-2026/tests/verify-home.mjs,line=1::${error.message.replace(/\n/g,' ')}`);
  process.exitCode=1;
} finally { await browser.close(); }

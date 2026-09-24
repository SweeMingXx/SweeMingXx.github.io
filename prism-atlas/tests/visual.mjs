import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const live='https://SweeMingXx.github.io/prism-atlas/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1,reducedMotion:'reduce'});
 await page.goto(live+'?visual='+Date.now());await page.locator('#artwork svg').waitFor();await page.waitForTimeout(500);
 await mkdir('results',{recursive:true});const shot=await page.screenshot({fullPage:true,type:'png',path:'results/live-visual-full.png'});
 const jpg=await page.evaluate(async src=>{const img=new Image();img.src='data:image/png;base64,'+src;await img.decode();const canvas=document.createElement('canvas');canvas.width=760;canvas.height=Math.round(img.height*760/img.width);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);let quality=.45,out=canvas.toDataURL('image/jpeg',quality);while(out.length>58000&&quality>.1){quality-=.05;out=canvas.toDataURL('image/jpeg',quality);}return out.split(',')[1];},shot.toString('base64'));
 await writeFile('results/live-visual-preview.jpg',Buffer.from(jpg,'base64'));
 console.log('::notice title=Prism Atlas visual preview::PRISM_PREVIEW_JPEG:'+jpg);
 console.log('Live design preview captured at '+new Date().toISOString());
} finally {await browser.close();}

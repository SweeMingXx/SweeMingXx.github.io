import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const live='https://SweeMingXx.github.io/prism-atlas/';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1080},deviceScaleFactor:1,reducedMotion:'reduce'});
 await page.goto(live+'?visual='+Date.now());await page.locator('#artwork svg').waitFor();await page.waitForTimeout(500);
 await mkdir('results',{recursive:true});const shot=await page.screenshot({fullPage:true,type:'png',path:'results/live-visual-full.png'});
 const preview=await page.evaluate(async src=>{const img=new Image();img.src='data:image/png;base64,'+src;await img.decode();const canvas=document.createElement('canvas');let width=820,quality=.55,out='';do{canvas.width=width;canvas.height=Math.round(img.height*width/img.width);canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);out=canvas.toDataURL('image/webp',quality).split(',')[1];if(out.length>33000){if(quality>.25)quality-=.1;else width=Math.round(width*.8);}}while(out.length>33000);return out;},shot.toString('base64'));
 await writeFile('results/live-visual-preview.webp',Buffer.from(preview,'base64'));
 const count=Math.ceil(preview.length/3800);
 for(let i=0;i<count;i++)console.log('::notice title=Prism visual part '+String(i).padStart(3,'0')+' of '+count+'::PRISM_WEBP_PART_'+String(i).padStart(3,'0')+':'+preview.slice(i*3800,(i+1)*3800));
 console.log('Live design preview captured at '+new Date().toISOString());
} finally {await browser.close();}

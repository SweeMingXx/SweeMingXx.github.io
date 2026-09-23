// Dependency-free browser verification using Chrome DevTools Protocol.
// Requires Node 22 and Google Chrome (both available on the CI runner).
import http from 'node:http';
import {readFile,mkdir,writeFile,mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';
const root=path.resolve('layer-form');
const server=http.createServer(async(req,res)=>{try{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const f=path.resolve(root,'.'+(relative.endsWith('/')?relative+'index.html':relative));if(!f.startsWith(root+path.sep)){res.writeHead(403);return res.end()}const data=await readFile(f);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css'})[path.extname(f)]||'application/octet-stream');res.end(data)}catch{res.writeHead(404);res.end('Not found')}});
await new Promise(r=>server.listen(8765,'127.0.0.1',r));
const profile=await mkdtemp(path.join(tmpdir(),'layer-form-chrome-'));
const chrome=spawn(process.env.CHROME_BIN||'google-chrome',['--headless=new','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--remote-debugging-port=9222',`--user-data-dir=${profile}`,'about:blank'],{stdio:['ignore','ignore','pipe']});
let startupError=null;chrome.on('error',e=>startupError=e);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let ws;const errors=[];
try{
 let tab;
 for(let i=0;i<80;i++){if(startupError)throw startupError;try{const r=await fetch('http://127.0.0.1:9222/json/new?about:blank',{method:'PUT'});tab=await r.json();break}catch{await sleep(250)}}
 assert(tab,'Chrome started');ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});
 let id=0;const pending=new Map();const listeners=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);if(p){pending.delete(m.id);m.error?p.reject(new Error(JSON.stringify(m.error))):p.resolve(m.result)}}else{for(const fn of listeners.get(m.method)||[])fn(m.params)}};
 function send(method,params={}){return new Promise((resolve,reject)=>{const key=++id;pending.set(key,{resolve,reject});ws.send(JSON.stringify({id:key,method,params}))})}
 function on(event,fn){listeners.set(event,[...(listeners.get(event)||[]),fn])}
 async function evaluate(expression){const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw new Error(r.exceptionDetails.text+': '+JSON.stringify(r.exceptionDetails.exception));return r.result.value}
 async function check(name,expression){assert(await evaluate(expression),name);console.log('PASS:',name)}
 async function screenshot(name){await mkdir('/tmp/layer-form-screenshots',{recursive:true});const r=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(`/tmp/layer-form-screenshots/${name}.png`,Buffer.from(r.data,'base64'))}
 await send('Page.enable');await send('Runtime.enable');on('Runtime.exceptionThrown',e=>errors.push(e.exceptionDetails));
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'http://127.0.0.1:8765/'});await sleep(2500);
 await check('Initial six projects',`document.querySelectorAll('.project-card').length===6`);
 await check('Canvas renders visible geometry',`(()=>{const c=document.querySelector('#hero-canvas');const p=c.getContext('2d').getImageData(c.width/2,c.height/2,1,1).data;return c.width>0&&p[3]>0})()`);
 await check('No document horizontal overflow at desktop',`document.documentElement.scrollWidth<=innerWidth`);
 await screenshot('desktop-hero');
 await evaluate(`document.querySelector('[data-filter="functional"]').click()`);await sleep(250);
 await check('Functional filter has three objects and announced count',`document.querySelectorAll('.project-card').length===3&&document.querySelector('#result-count').textContent==='3 objects'&&document.querySelector('[data-filter="functional"]').getAttribute('aria-pressed')==='true'`);
 await evaluate(`document.querySelector('[data-filter="sculptural"]').click()`);
 await check('Sculptural filter has three objects',`document.querySelectorAll('.project-card').length===3`);
 await evaluate(`document.querySelector('[data-filter="all"]').click();document.querySelector('.project-card button').focus();document.querySelector('.project-card button').click()`);await sleep(250);
 await check('Dialog opens with project details and focused close control',`document.querySelector('#project-dialog').open&&document.querySelector('#dialog-title').textContent==='Helix Vessel'&&document.activeElement.classList.contains('dialog-close')`);
 await screenshot('desktop-project');
 await evaluate(`document.querySelector('#next-project').click()`);await check('Next project navigation works',`document.querySelector('#dialog-title').textContent==='Orbit Study'`);
 await evaluate(`document.querySelector('#prev-project').click()`);await check('Previous project navigation works',`document.querySelector('#dialog-title').textContent==='Helix Vessel'`);
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});await sleep(150);
 await check('Escape closes dialog and restores original focus',`!document.querySelector('#project-dialog').open&&document.activeElement===document.querySelector('.project-card button')&&document.body.style.overflow===''`);
 await evaluate(`document.querySelector('[data-color="clay"]').click()`);await sleep(150);
 await check('Material swatch selection updates accessible state',`document.querySelector('[data-color="clay"]').getAttribute('aria-pressed')==='true'&&document.querySelector('#material-name').textContent==='Terracotta'`);
 await evaluate(`window.scrollTo({top:0,behavior:'instant'});document.querySelector('#hero-canvas').focus();window.canvasBefore=document.querySelector('#hero-canvas').toDataURL()`);
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'ArrowRight',code:'ArrowRight',windowsVirtualKeyCode:39});await sleep(150);
 await check('Keyboard rotation changes the model render',`window.canvasBefore!==document.querySelector('#hero-canvas').toDataURL()`);
 await evaluate(`document.querySelector('.motion-toggle').click()`);await check('Motion toggle pauses decorative animation',`document.body.classList.contains('motion-off')&&document.querySelector('.motion-toggle').getAttribute('aria-pressed')==='true'`);
 for(const width of [320,390,768,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:width<720});await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);await sleep(350);
  await check(`No horizontal overflow at ${width}px`,`document.documentElement.scrollWidth<=innerWidth`);
  if(width===390){await screenshot('mobile-hero');await evaluate(`document.querySelector('#work').scrollIntoView({behavior:'instant'})`);await sleep(200);await screenshot('mobile-gallery');await evaluate(`document.querySelector('#hero-details').click()`);await sleep(200);await check('Mobile dialog is within viewport',`(()=>{let r=document.querySelector('#project-dialog').getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height<=innerHeight})()`);await screenshot('mobile-dialog');await evaluate(`document.querySelector('.dialog-close').click()`)}
 }
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await sleep(100);
 await check('OS reduced motion preference respected',`document.body.classList.contains('motion-off')&&getComputedStyle(document.documentElement).scrollBehavior==='auto'`);
 await check('All internal navigation anchors resolve',`[...document.querySelectorAll('a[href^="#"]')].every(a=>a.hash===''||a.hash==='#'||!!document.getElementById(a.hash.slice(1)))`);
 await check('Every button has an accessible label',`[...document.querySelectorAll('button')].every(b=>b.getAttribute('aria-label')||b.textContent.trim())`);
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('PASS: No uncaught browser errors');
 console.log('All Layer / Form browser checks passed.');
}catch(e){console.error(e);process.exitCode=1}finally{ws?.close();chrome.kill('SIGTERM');server.close();await sleep(400);await rm(profile,{recursive:true,force:true}).catch(()=>{})}

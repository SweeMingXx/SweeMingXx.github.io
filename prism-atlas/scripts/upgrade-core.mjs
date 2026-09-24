/* Idempotent, narrowly scoped source migration for the 1.1 extension API. */
import { readFile, writeFile } from 'node:fs/promises';
const path='prism-atlas/app.js';let app=await readFile(path,'utf8');
if(!app.includes('window.PrismStudio=Object.freeze')){
 const marker='if(initMessages.length)setTimeout';if(app.split(marker).length!==2)throw Error('Unexpected app source; refusing an ambiguous migration.');
 const bridge=`// Narrow extension API: snapshots are copies; writes pass through validation and history.\nwindow.PrismStudio=Object.freeze({\n getState:()=>clone(state),\n commit:(next,message)=>commit(validateProject(next),message),\n renderSVG:(s,prefix,metadata)=>renderSVG(validateProject(s),prefix,metadata),\n describe:s=>describe(validateProject(s)),\n openDialog,closeDialog,toast,stopAudio,download,fileName,\n async makeReceipt(input){\n  const recipe=validateProject(input),canonical=JSON.stringify(recipe);\n  const hash=crypto.subtle?Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonical)))).map(x=>x.toString(16).padStart(2,'0')).join(''):null;\n  return {application:'Prism Atlas',engineVersion:'1.0.0',studioVersion:'1.1.0',exportedAt:new Date().toISOString(),recipe,description:describe(recipe),recipeSHA256:hash,note:'This checksum identifies this exact creative recipe. It does not prove copyright, originality, ownership, or data authenticity.'};\n }\n});\n`;
 app=app.replace(marker,bridge+marker);await writeFile(path,app);
}
let html=await readFile('prism-atlas/index.html','utf8');
if(!html.includes('href="advanced.css"'))html=html.replace('<link rel="stylesheet" href="usability.css">','<link rel="stylesheet" href="usability.css"><link rel="stylesheet" href="advanced.css">');
if(!html.includes('src="advanced.js"'))html=html.replace('<script src="ui-support.js" defer></script>','<script src="ui-support.js" defer></script><script src="advanced.js" defer></script>');
html=html.replace('name="prism-version" content="1.0.0"','name="prism-version" content="1.1.0"');
if(!html.includes('href="advanced.css"')||!html.includes('src="advanced.js"'))throw Error('Expected script and stylesheet anchors not found.');await writeFile('prism-atlas/index.html',html);
let tests=await readFile('prism-atlas/tests/check.mjs','utf8');tests=tests.replaceAll('version 1.0.0','version 1.1.0').replace('name="prism-version" content="1.0.0"','name="prism-version" content="1.1.0"');await writeFile('prism-atlas/tests/check.mjs',tests);
console.log('Prism Atlas 1.1 extension bridge and entrypoint verified.');

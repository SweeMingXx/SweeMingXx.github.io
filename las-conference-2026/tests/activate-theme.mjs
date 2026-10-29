import {readFile,writeFile} from 'node:fs/promises';

async function change(file,replace){const previous=await readFile(file,'utf8');const next=replace(previous);if(previous!==next)await writeFile(file,next);}

await change('index.html',html=>{
  html=html.replace('content="#092329"','content="#34101f"');
  html=html.replace('<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css">', '<link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="theme.css">');
  return html.replace('stop-color="#e3edb0"','stop-color="#ffe5d2"').replace('stop-color="#88cabc"','stop-color="#e1a6aa"').replace('stop-color="#c9a27e"','stop-color="#f4b98e"').replace('stop-color="#a6c79c"','stop-color="#e9a6a2"').replaceAll('fill="#e1b18a"','fill="#f4c198"').replaceAll('stroke="#e1b18a"','stroke="#f4c198"');
});
await change('favicon.svg',svg=>svg.replace('fill="#092329"','fill="#34101f"').replace('stroke="#d9ecaa"','stroke="#f2c5ae"'));
await change('tests/live.mjs',source=>source.replace("'index.html','styles.css','app.js'", "'index.html','styles.css','theme.css','app.js'").replace('All 17 runtime assets','All 18 runtime assets'));

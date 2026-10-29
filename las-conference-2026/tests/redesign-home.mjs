import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const path=new URL('index.html',root);
let html=await readFile(path,'utf8');
if(!html.includes('href="landing.css"')) html=html.replace('<link rel="stylesheet" href="theme.css">','<link rel="stylesheet" href="theme.css"><link rel="stylesheet" href="landing.css">');
html=html.replace('<meta name="theme-color" content="#34101f">','<meta name="theme-color" content="#a61b37">');
const start=html.indexOf('<section class="hero" id="home"');
const end=html.indexOf('<section class="overview section"',start);
if(start<0||end<0) throw Error('Expected homepage boundaries not found; refusing to alter the page.');
const hero=`<section class="hero" id="home" aria-labelledby="hero-title">
<div class="hero-top"><span class="eyebrow"><i></i> Library Association of Singapore</span><span class="edition">AN INDEPENDENT READING EDITION &nbsp;/&nbsp; 2026</span></div>
<div class="hero-content">
<div class="hero-copy"><p class="eyebrow hero-date">27–28 OCTOBER 2026 · SINGAPORE</p><h1 id="hero-title">Libraries for<br><em>tomorrow.</em></h1><p class="hero-theme">The Future is Now:<br>Adapting to Exponential Change.</p><p class="hero-description">Two days of ideas, perspectives and people shaping what libraries become next.</p><div class="hero-links"><a class="button primary" href="#programme">Explore the programme <span aria-hidden="true">↗</span></a><a class="text-link" href="#archive">Browse the reports <span aria-hidden="true">↗</span></a></div></div>
<div class="folio" aria-hidden="true"><img src="hero-art.svg" width="740" height="790" alt="" fetchpriority="high"><svg id="folio-art" style="display:none" viewBox="0 0 600 640"><g id="folio-lines"></g></svg></div>
</div>
<div class="hero-bottom"><a class="scroll-cue" href="#overview"><span aria-hidden="true">↓</span> Discover the story</a><span>University Cultural Centre<br>Singapore · SGT</span><span class="hero-source">Based on supplied conference reports.<br>Not an official LAS publication.</span></div>
</section>
<nav class="landing-jump" aria-label="Explore this edition">
<a href="#overview"><span class="jump-number">01</span><span class="jump-body"><strong>The big picture</strong><small>Start with the ideas that connect it all</small></span><span class="jump-arrow" aria-hidden="true">↗</span></a>
<a href="#programme"><span class="jump-number">02</span><span class="jump-body"><strong>The programme</strong><small>See what happened across both days</small></span><span class="jump-arrow" aria-hidden="true">↗</span></a>
<a href="#archive"><span class="jump-number">03</span><span class="jump-body"><strong>The reading room</strong><small>Explore all 14 indexed reports</small></span><span class="jump-arrow" aria-hidden="true">↗</span></a>
</nav>
`;
html=html.slice(0,start)+hero+html.slice(end);
await writeFile(path,html);
const livePath=new URL('tests/live.mjs',root);
let live=await readFile(livePath,'utf8');
live=live.replace("'theme.css','app.js'","'theme.css','landing.css','hero-art.svg','favicon.svg','app.js'");
live=live.replace("'All 18 runtime assets, including 13 complete report texts, match the tested repository bytes exactly.'","`All ${files.length} runtime assets, including 13 complete report texts and the new hero artwork, match the tested repository bytes exactly.`");
await writeFile(livePath,live);
console.log('Landing composition, stylesheet, artwork and live-asset checks prepared.');

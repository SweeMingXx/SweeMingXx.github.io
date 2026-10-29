import {readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const path=new URL('index.html',root);
let html=await readFile(path,'utf8');
const start=html.indexOf('<section class="hero" id="home"');
const end=html.indexOf('<section class="overview section"',start);
if(start<0||end<0) throw Error('Homepage boundaries were not found; refusing to modify other sections.');
const home=`<section class="hero" id="home" aria-labelledby="hero-title">
<div class="hero-top"><span class="eyebrow"><i></i> LIBRARY ASSOCIATION OF SINGAPORE</span><span class="edition">LAS CONFERENCE 2026 &nbsp;/&nbsp; READING EDITION</span></div>
<div class="hero-content">
<div class="hero-copy"><p class="eyebrow hero-date">27–28 OCTOBER 2026 &nbsp;·&nbsp; SINGAPORE</p><h1 id="hero-title">Libraries for<br><em>tomorrow.</em></h1><div class="hero-lede"><p>Ideas from two days of imagining what libraries can be—and the people who will lead them there.</p><a href="#archive">Explore the reports <span aria-hidden="true">↗</span></a></div></div>
<div class="hero-feature"><div class="hero-feature-copy"><p class="eyebrow">THE FUTURE IS NOW / CONFERENCE 2026</p><h2>Adapting to<br>exponential change.</h2><p>Follow the conversations, sessions and perspectives that shaped the conference.</p><a class="button" href="#programme">Explore the programme <span aria-hidden="true">↗</span></a></div><div class="folio" aria-hidden="true"><span class="folio-sheet"></span><span class="folio-sheet"></span><span class="folio-sheet"></span><span class="folio-sheet"></span><span class="folio-sheet"></span><span class="folio-sheet"></span><svg id="folio-art" style="display:none" viewBox="0 0 600 640"><g id="folio-lines"></g></svg></div></div>
</div>
<div class="hero-bottom"><span><strong>27–28 October 2026</strong>Two days · Singapore time (SGT)</span><span><strong>University Cultural Centre</strong>Singapore</span><span class="hero-source">An independent edition of the supplied reports.<br>Not an official LAS publication.</span><a href="#overview" class="scroll-cue"><span aria-hidden="true">↓</span> Discover more</a></div>
</section>
<nav class="landing-jump" aria-label="Explore this edition">
<a href="#overview"><span class="jump-top"><span class="jump-number">01 / DISCOVER</span><span class="jump-arrow" aria-hidden="true">↗</span></span><span class="jump-body"><strong>The big picture</strong><small>The ideas and questions behind the conference</small></span></a>
<a href="#programme"><span class="jump-top"><span class="jump-number">02 / FOLLOW</span><span class="jump-arrow" aria-hidden="true">↗</span></span><span class="jump-body"><strong>Two-day programme</strong><small>Every session, both days, at a glance</small></span></a>
<a href="#archive"><span class="jump-top"><span class="jump-number">03 / GO DEEPER</span><span class="jump-arrow" aria-hidden="true">↗</span></span><span class="jump-body"><strong>Report collection</strong><small>Search and read all 14 indexed reports</small></span></a>
</nav>
`;
html=html.slice(0,start)+home+html.slice(end);
await writeFile(path,html);
const livePath=new URL('tests/live.mjs',root);
let live=await readFile(livePath,'utf8');
live=live.replace("'landing.css','hero-art.svg','favicon.svg'","'landing.css','favicon.svg'");
live=live.replace('and the new hero artwork, match','and the new landing design, match');
await writeFile(livePath,live);
console.log('Poster-style home and live asset manifest updated.');

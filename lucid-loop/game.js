'use strict';
const $=s=>document.querySelector(s),canvas=$('#world'),ctx=canvas.getContext('2d');
const MODES={chill:{gap:236,speed:166,spacing:300,wave:13},flow:{gap:200,speed:207,spacing:325,wave:19},warp:{gap:175,speed:244,spacing:345,wave:22}};
const WORLDS=[{name:'ACID GARDEN',bg:'#160e23',deep:'#342044',a:'#d6f58c',b:'#e898d7',c:'#8970d8'},{name:'VIOLET OCEAN',bg:'#101329',deep:'#232b55',a:'#8bf2e3',b:'#bba3ff',c:'#657ed2'},{name:'SOLAR DREAM',bg:'#211125',deep:'#522d49',a:'#ffd58b',b:'#fd9ba5',c:'#ac79be'}];
const KEY='lucid-loop-v1';let saved={best:{chill:0,flow:0,warp:0},runs:0,total:0,perfects:0,streak:0,history:[],mode:'flow',sound:false,calm:matchMedia('(prefers-reduced-motion: reduce)').matches,palette:0};let storageOK=true;
try{const v=JSON.parse(localStorage.getItem(KEY));if(v&&typeof v==='object'){for(const m of Object.keys(MODES))saved.best[m]=clean(v.best?.[m]);for(const k of ['runs','total','perfects','streak'])saved[k]=clean(v[k]);if(MODES[v.mode])saved.mode=v.mode;for(const k of ['sound','calm'])if(typeof v[k]==='boolean')saved[k]=v[k];if([0,1,2].includes(v.palette))saved.palette=v.palette;if(Array.isArray(v.history))saved.history=v.history.filter(x=>x&&MODES[x.mode]&&Number.isFinite(x.score)&&Number.isFinite(x.perfects)&&Number.isFinite(x.at)).slice(0,6);}}catch{storageOK=false;}
function clean(n){return Math.min(1e9,Math.max(0,Math.floor(Number(n)||0)));}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(saved));}catch{if(storageOK)toast('Storage unavailable. Records will last for this visit only.');storageOK=false;}}
let width=1100,height=600,mode=saved.mode,state='ready',score=0,perfects=0,streak=0,maxStreak=0,focus=1,focusHeld=false,focusLocked=false,gates=[],mot es;

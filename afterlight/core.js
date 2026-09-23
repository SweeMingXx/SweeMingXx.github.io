/* AFTERLIGHT engine: fixed-timestep, dependency-free, DOM-free. */
(function(root){'use strict';
const W=360,H=480,STEP=1/60,LOOP=480,DURATION=3600;
function hash(s){let n=2166136261;for(const c of String(s)){n^=c.charCodeAt(0);n=Math.imul(n,16777619)}return n>>>0}
function random(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
class Game{
constructor(seed,mode='arcade'){this.seed=seed>>>0;this.mode=mode;this.rand=random(seed);this.tick=0;this.player={x:180,y:260};this.path=[];this.echoes=[];this.shards=[];this.shield=3;this.charge=0;this.protection=0;this.invulnerable=0;this.combo=0;this.lastCollect=-1000;this.points=0;this.collected=0;this.ended=false;this.events=[];this.spawn();this.spawn();this.spawn()}
get time(){return this.tick/60}get score(){return this.points+Math.floor(this.time)*10}get ghosts(){const i=this.tick%LOOP;return this.echoes.map(path=>path[Math.min(i,path.length-1)]).filter(Boolean)}
spawn(){if(this.shards.length>=8)return;let p;for(let i=0;i<20;i++){p={x:30+this.rand()*300,y:65+this.rand()*365};if(Math.hypot(p.x-this.player.x,p.y-this.player.y)>55)break}this.shards.push(p)}
pulse(){if(this.ended||this.charge<4)return false;this.charge=0;this.protection=120;this.events.push({type:'pulse',...this.player});return true}
step(input={x:0,y:0}){if(this.ended)return;this.events=[];const p=this.player,len=Math.hypot(input.x,input.y),speed=2.65;if(len){p.x=Math.max(15,Math.min(W-15,p.x+input.x/Math.max(1,len)*speed));p.y=Math.max(46,Math.min(H-18,p.y+input.y/Math.max(1,len)*speed))}this.path.push({x:p.x,y:p.y});this.tick++;if(this.protection>0)this.protection--;if(this.invulnerable>0)this.invulnerable--;
if(this.tick%75===0)this.spawn();if(this.tick-this.lastCollect>240)this.combo=0;
for(let i=this.shards.length-1;i>=0;i--){const s=this.shards[i];if(Math.hypot(p.x-s.x,p.y-s.y)<20){this.shards.splice(i,1);this.combo=Math.min(5,this.combo+1);this.lastCollect=this.tick;this.collected++;this.points+=100*this.combo;this.charge=Math.min(4,this.charge+1);this.events.push({type:'collect',x:s.x,y:s.y,points:100*this.combo})}}
if(this.tick%LOOP===0&&this.tick<DURATION){this.echoes.push(this.path);if(this.echoes.length>6)this.echoes.shift();this.path=[];this.events.push({type:'echo'})}
if(this.mode!=='zen'&&!this.protection&&!this.invulnerable&&this.tick%LOOP>60){for(const g of this.ghosts){if(Math.hypot(p.x-g.x,p.y-g.y)<17){this.shield--;this.invulnerable=110;this.combo=0;this.events.push({type:'hit',...p});if(this.shield<=0)this.ended=true;break}}}
if(this.tick>=DURATION)this.ended=true;
}
}
const api={Game,hash,random,W,H,STEP,LOOP,DURATION};if(typeof module!=='undefined')module.exports=api;else root.Afterlight=api;
})(typeof globalThis!=='undefined'?globalThis:this);

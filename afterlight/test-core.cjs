const assert=require('node:assert/strict');const {Game,hash,random}=require('./core.js');
assert.equal(hash('same'),hash('same'));assert.notEqual(hash('same'),hash('other'));const r1=random(3),r2=random(3);for(let i=0;i<100;i++)assert.equal(r1(),r2());
let a=new Game(42,'zen'),b=new Game(42,'zen');for(let i=0;i<3600;i++){const input={x:Math.sin(i/120),y:Math.cos(i/120)};a.step(input);b.step(input)}assert.equal(JSON.stringify(a),JSON.stringify(b));assert.equal(a.time,60);assert.equal(a.ended,true);assert.equal(a.echoes.length,6);assert.equal(a.shield,3);
let g=new Game(1);g.shards=[{...g.player}];g.step();assert.equal(g.collected,1);assert.equal(g.points,100);assert.equal(g.charge,1);g.shards=[{...g.player}];g.step();assert.equal(g.points,300);assert.equal(g.combo,2);assert.equal(g.pulse(),false);g.charge=4;assert.equal(g.pulse(),true);assert.equal(g.protection,120);assert.equal(g.charge,0);
g=new Game(9);for(let i=0;i<1000&&!g.ended;i++)g.step();assert.equal(g.echoes.length,1);assert.equal(g.ended,true);assert.equal(g.shield,0);
g=new Game(1,'zen');for(let i=0;i<600;i++)g.step({x:1,y:1});assert.equal(g.player.x,345);assert.equal(g.player.y,462);assert.ok(g.shards.length<=8);
g=new Game(1);g.combo=5;g.lastCollect=0;for(let i=0;i<241;i++)g.step();assert.equal(g.combo,0);
g=new Game(1);g.charge=4;g.pulse();g.echoes=[Array.from({length:480},()=>({...g.player}))];g.tick=70;g.step();assert.equal(g.shield,3);
console.log('PASS: deterministic replay, full run, echo cap, collection, combos, pulse, damage, bounds, spawn cap and timeout');

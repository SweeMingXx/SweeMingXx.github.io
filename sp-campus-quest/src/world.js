import { object as mesh } from './renderer.js';
export const LANDMARKS = [
 {id:'dover',name:'Dover MRT',tag:'YOUR FIRST STOP',x:0,z:26,color:'#639c80'},
 {id:'library',name:'Library & FabLab',tag:'IDEAS LIVE HERE',x:-23,z:3,color:'#cbad77'},
 {id:'food',name:'Food Court 5',tag:'A TASTE OF CAMPUS',x:23,z:14,color:'#dc866b'},
 {id:'garden',name:'Eco garden',tag:'GROW SOMETHING GOOD',x:-25,z:-22,color:'#739c69'},
 {id:'lab',name:'Innovation lab',tag:'MAKE WHAT’S NEXT',x:22,z:-23,color:'#74a2b5'},
 {id:'sports',name:'Sports Arena',tag:'FIND YOUR STRIDE',x:30,z:-3,color:'#7c94b9'},
 {id:'spectrum',name:'Spectrum',tag:'YOUR PEOPLE, YOUR PLACE',x:-7,z:-21,color:'#a587b7'},
 {id:'plaza',name:'Festival plaza',tag:'BETTER TOGETHER',x:0,z:3,color:'#d58a66'},
];
export const NPCS = [
 {id:'welcome',name:'Maya',role:'Festival coordinator',x:-3,z:24,color:'#df7f62'},
 {id:'library',name:'Jun',role:'Archive club',x:-23,z:3,color:'#c9a358'},
 {id:'food',name:'Auntie Lin',role:'Festival food crew',x:23,z:14,color:'#d17655'},
 {id:'green',name:'Farah',role:'Green club',x:-25,z:-22,color:'#6d9d69'},
 {id:'maker',name:'Dev',role:'Maker club',x:22,z:-23,color:'#578da6'},
 {id:'sport',name:'Kai',role:'Relay captain',x:30,z:-3,color:'#758bb8'},
 {id:'memory',name:'Izzie',role:'Story collector',x:-7,z:-21,color:'#a27daf'},
 {id:'festival',name:'Maya',role:'Festival coordinator',x:0,z:3,color:'#df7f62'},
];
export function avatar(x,z,color,angle=0,walk=0,y=0) {
 const a=[],part=(dx,dy,dz,w,h,d,c,type='box')=>{const co=Math.cos(angle),si=Math.sin(angle);a.push(mesh(type,x+dx*co+dz*si,y+dy,z-dx*si+dz*co,w,h,d,c,angle));};
 const step=Math.sin(walk)*.19;
 part(-.19,.33,step,.28,.58,.33,'#354a57');part(.19,.33,-step,.28,.58,.33,'#354a57');
 part(-.19,.1,step+.05,.3,.15,.45,'#f5edda');part(.19,.1,-step+.05,.3,.15,.45,'#f5edda');
 part(0,.96,0,.75,.74,.4,color);part(0,1.61,0,.51,.53,.49,'#d8ab87');part(0,1.89,-.04,.56,.15,.54,'#363c35');
 part(-.49,.92,-step,.19,.62,.23,'#d8ab87');part(.49,.92,step,.19,.62,.23,'#d8ab87');
 part(0,1,-.29,.5,.57,.22,'#dfb05f');part(-.12,1.65,.251,.06,.055,.025,'#363c35');part(.12,1.65,.251,.06,.055,.025,'#363c35');
 return a;
}
export function makeWorld() {
 const objects=[],obstacles=[];
 const add=(t,x,y,z,w,h,d,c,r=0)=>objects.push(mesh(t,x,y,z,w,h,d,c,r));
 const box=(x,y,z,w,h,d,c,r=0)=>add('box',x,y,z,w,h,d,c,r);
 const cylinder=(x,y,z,w,h,c)=>add('cylinder',x,y,z,w,h,w,c);
 const block=(x,z,w,d,h,c,roof)=>{
   obstacles.push({x,z,w,d});box(x,h/2,z,w,h,d,c);box(x,h+.18,z,w+.5,.36,d+.5,roof);
   box(x,.4,z,w+.6,.6,d+.6,'#d6d2ba');
   for(let floor=1.6;floor<h-.5;floor+=1.65)for(let q=-w/2+.85;q<w/2-.4;q+=1.5){box(x+q,floor,z+d/2+.02,.95,.86,.06,'#74989b');box(x+q,floor-.53,z+d/2+.12,1.2,.12,.4,'#f4edd9');}
   for(let q=-d/2+.8;q<d/2-.4;q+=1.6)for(let floor=1.6;floor<h-.5;floor+=1.65)box(x+w/2+.02,floor,z+q,.06,.86,1,'#79989a');
   for(let q=-w/2+1;q<w/2;q+=3)box(x+q,h+.45,z,w*.12,.35,d*.65,'#d6d3c1');
 };
 // Floating model base, lawns and connected pedestrian avenues.
 box(0,-1,0,92,1.8,82,'#879d78');box(0,-.19,0,90,.3,80,'#afc895');box(0,-1.8,0,88,.6,78,'#7b8e70');
 box(0,.015,0,7,.1,68,'#e4dcc3');box(0,.02,17,81,.12,5,'#e9dfc5');box(0,.025,-18,80,.13,5,'#e9dfc5');
 box(-18,.01,-1,5,.1,59,'#e4dcc3');box(19,.01,-1,5,.1,59,'#e4dcc3');box(0,.015,3,77,.1,5,'#e4dcc3');
 cylinder(0,.06,3,17,.15,'#d5caaa');cylinder(0,.15,3,13,.16,'#ebe2c7');cylinder(0,.26,3,5,.2,'#c3b78e');
 // Festival pavilion, bunting, stools.
 for(const x of [-6,6])box(x,2.6,1,.18,5.2,.18,'#7b6950');
 for(let i=0;i<13;i++)add('cone',-5.7+i*.94,4.65-Math.sin(i/12*Math.PI)*.8,1,.55,.6,.15,['#d67e64','#edc56e','#71989d'][i%3],Math.PI);
 box(0,.3,-2,7,.5,3,'#b99b72');box(0,1,-3,7,.95,.3,'#dfb969');
 // Dover station, viaduct, original train.
 box(0,3.7,32,88,.8,3.6,'#a6b3a6');box(0,4.2,32,88,.2,2.5,'#697a73');
 for(let x=-40;x<=40;x+=10)box(x,1.6,32,.7,3.3,1.6,'#b9c2af');
 box(0,4.6,29.8,15,.4,3,'#dddbca');box(0,7,29.6,17,.35,5,'#eee6d2');
 for(const x of [-6,-2,2,6])box(x,5.8,29.7,.18,2.4,.18,'#5f8074');
 for(let i=0;i<7;i++)box(8, i*.5,26+i*.43,2,.5,1.5,'#c9c9b4');
 // Distinct academic buildings; positions and scale intentionally fictionalised.
 block(-29,-3,12,8,7,'#eae0c5','#b5bb9f');block(-25,11,9,7,5,'#edddc0','#d7b879');
 box(-29,4.8,1.1,12,.6,.25,'#ceac68');box(-25,2.5,14.6,9,.5,.12,'#c89062');
 block(-8,-29,11,8,5.7,'#e2cdbd','#ba9b99');block(-29,-30,11,7,4,'#ddd6af','#8faa88');
 block(23,-30,15,8,6.2,'#d2dfd9','#8babb0');box(23,3,-25.9,14,4,.12,'#83a6b1');
 for(let i=0;i<5;i++)box(17+i*3,3,-25.8,.2,4,.2,'#e2e5d7');
 block(8,-30,7,9,8,'#e8d9bd','#97aaa0');block(-39,14,6,11,7,'#e6dbbf','#bab897');
 // Food court: striped canopy, stalls, outdoor tables.
 block(29,25,15,7,3.8,'#f0dfbc','#d48569');box(29,3.6,19.5,16,.28,4,'#f1e7cf');
 for(let i=0;i<8;i++)box(22+i*2,3.8,19.5,1,.12,4,'#cd856a');
 for(let i=0;i<4;i++){box(23+i*4,1.1,21.3,2.8,1.5,.2,['#b5c59c','#e2b56c','#89b4b0','#d3967b'][i]);box(23+i*4,.8,19.5,.18,1.6,.18,'#b39369');}
 for(const [x,z] of [[25,17],[32,17],[38,22],[38,16]]){cylinder(x,.8,z,1.9,.18,'#caa87b');cylinder(x,.4,z,.2,.8,'#796e59');for(const d of [-1.3,1.3])box(x+d,.4,z,.7,.7,.7,'#e1c693');}
 // Arena and playing field.
 block(36,-8,10,12,5,'#d9ddd0','#829caa');box(36,5.3,-8,9,.25,11,'#7191a0');
 box(29,.08,-12,9,.12,15,'#cb9273');box(29,.16,-12,7,.05,13,'#819f8e');
 for(const x of [25.5,32.5])box(x,.2,-12,.1,.03,13,'#f0e5c8');for(const z of [-18.5,-12,-5.5])box(29,.2,z,7,.03,.1,'#f0e5c8');
 // Garden beds and rooftop greenery.
 for(const [x,z] of [[-29,-23],[-34,-23],[-29,-17],[-34,-17]]){box(x,.4,z,3,.65,3,'#a79265');box(x,.75,z,2.6,.1,2.6,'#6f8156');for(let i=0;i<3;i++)add('cone',x-1+i,.95,z,1.1,1,1.1,'#83ac71');}
 // Tree clusters. Deterministic, no external assets.
 let seed=824;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 function tree(x,z,s=1){cylinder(x,1.2*s,z,.35*s,2.4*s,'#9a8966');add('cone',x,3*s,z,3.5*s,3.8*s,3.5*s,'#769566');add('cone',x,4*s,z,2.8*s,3.1*s,2.8*s,'#91ae77');cylinder(x,.04,z,3*s,.04,'#99b782');}
 for(let i=0;i<110;i++){const x=rand()*85-42.5,z=rand()*70-36;if((Math.abs(x)>40||z<-35|| (Math.abs(x)>6&&Math.abs(x+18)>4&&Math.abs(x-19)>4&&Math.abs(z-17)>4&&Math.abs(z+18)>4&&Math.abs(z-3)>4))&&!obstacles.some(o=>Math.abs(x-o.x)<o.w/2+2&&Math.abs(z-o.z)<o.d/2+2)&&Math.hypot(x,z-3)>10)tree(x,z,.7+rand()*.5);}
 for(const [x,z] of [[-10,17],[10,17],[-10,-18],[11,-18],[-18,8],[19,8],[-38,3]]){
   box(x,1.6,z,.12,3.2,.12,'#758572');box(x,3.25,z,.65,.25,.65,'#efe0a4');
   box(x+1.5,.55,z,2,.15,.8,'#ba9c70');box(x+1.5,.9,z-.35,2,.65,.1,'#ba9c70');
 }
 for(let i=0;i<6;i++)box(-14+i*5,.09,23,2.6,.12,.6,'#efe8d4');
 return {objects,obstacles};
}

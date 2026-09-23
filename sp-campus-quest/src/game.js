import { Renderer, object } from './renderer.js';
import { makeWorld, avatar, NPCS, LANDMARKS } from './world.js';
import { SAVE_KEY, ROLES, QUESTS, SPARKS, RECYCLE, RELAY, freshState, restore, level, finishQuest, questAvailable, collect, buySnack, eatSnack, canMove } from './state.js';
const $=id=>document.getElementById(id), escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let saved=null, storageAvailable=true;
try { const raw=localStorage.getItem(SAVE_KEY); saved=raw?restore(raw):null; if(raw&&!saved)setTimeout(()=>toast('That save could not be read. You can start a fresh adventure.'),1200); } catch {storageAvailable=false;}
let state=saved||freshState(), started=false, photo=false, nearest=null, currentModal='', relay=null, toastTimer, facing=0, walk=0, jump=0, audio=null, lastSave=0, clickPath=[], lastModalFocus=null;
const keys=new Set(), world=makeWorld();
let renderer;
try {renderer=new Renderer($('world'));} catch(error) {
 $('loading').hidden=true;const box=document.createElement('div');box.className='fatal';box.innerHTML=`<h1>Your campus needs a little more graphics power.</h1><p>${escape(error.message)}</p><p>Your saved progress has not been changed.</p><button class="button primary" onclick="location.reload()">Try again</button>`;document.body.append(box);throw error;
}
$('world').addEventListener('webglcontextlost',e=>{e.preventDefault();save();openModal('Graphics paused',`<h2 id="modal-title" class="modal-title">Let’s reconnect.</h2><p class="modal-copy">The graphics connection was interrupted. Your adventure has been saved if device storage is available. Reload to continue.</p><button id="reload" class="button primary wide">Reload adventure</button>`);$('reload').onclick=()=>location.reload();});
renderer.focus=[-15,0,0];renderer.zoom=70;renderer.yaw=-.2;
$('continue').hidden=!saved;
function toast(text){clearTimeout(toastTimer);$('toast').textContent=text;$('toast').hidden=false;toastTimer=setTimeout(()=>$('toast').hidden=true,4300);}
function chime(notes=[523,659,784]) {
 if(!state.settings.sound)return;
 try {audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();notes.forEach((frequency,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.1;o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.035,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.36);});}catch{state.settings.sound=false;toast('Sound is unavailable. You can keep playing without audio.');}
}
function save() {
 if(!started)return;
 try {localStorage.setItem(SAVE_KEY,JSON.stringify(state));saved=restore(state);storageAvailable=true;$('save-status').textContent='✓ Progress saved on this device';}
 catch{storageAvailable=false;$('save-status').textContent='Saving unavailable · export in Settings';}
}
function openModal(eyebrow,html,type='dialog') {
 keys.clear();clickPath=[];currentModal=type;$('modal-eyebrow').textContent=eyebrow;$('modal-body').innerHTML=html;
 if(!$('modal').open){lastModalFocus=document.activeElement;$('modal').showModal();}
 $('modal').scrollTop=0;
 const first=$('modal-body').querySelector('input,button,select');if(first)first.focus();
}
function closeModal(){ $('modal').close();currentModal='';if(started)$('world').focus();else lastModalFocus?.focus(); }
$('close-modal').onclick=closeModal;
$('modal').addEventListener('cancel',e=>{e.preventDefault();closeModal();});
$('modal').addEventListener('click',e=>{if(e.target===$('modal')){const r=$('modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeModal();}});
function setupCharacter() {
 let role='explorer',color=ROLES.explorer.color;
 openModal('A NEW CHAPTER',`<h2 id="modal-title" class="modal-title">Every story starts with you.</h2><p class="modal-copy">There’s a festival to put together, a campus to explore, and a place for you in all of it.</p><label class="field-label" for="name-input">WHAT SHOULD WE CALL YOU?</label><input id="name-input" class="text-input" maxlength="20" value="Freshie" autocomplete="off"><div class="field-label">CHOOSE YOUR CAMPUS SPIRIT</div><div class="roles">${Object.entries(ROLES).map(([id,r],i)=>`<button class="role" data-role="${id}" aria-pressed="${id===role}"><span class="role-icon">${['⚒','⌖','✧'][i]}</span><strong>${r.name}</strong><small>${r.description}</small></button>`).join('')}</div><div class="field-label">PICK YOUR COLOUR</div><div class="swatches">${['#558eaa','#ee765a','#a087bf','#789560','#c9a150'].map((c,i)=>`<button class="swatch" data-color="${c}" style="--swatch:${c}" aria-label="${['Ocean blue','Coral','Lilac','Leaf green','Golden yellow'][i]}" aria-pressed="${c===color}"></button>`).join('')}</div><button id="begin" class="button primary wide">My adventure starts here <span>↗</span></button><p class="credits">${saved?'Starting replaces your device save. Export it in Settings first if you want to keep it.':'Progress is saved automatically on this device. No sign-up. No tracking.'}</p>`,'setup');
 document.querySelectorAll('[data-role]').forEach(b=>b.onclick=()=>{role=b.dataset.role;document.querySelectorAll('[data-role]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.role===role));});
 document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{color=b.dataset.color;document.querySelectorAll('[data-color]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.color===color));});
 $('begin').onclick=()=>{state=freshState(role,$('name-input').value,color);state.settings.motion=!matchMedia('(prefers-reduced-motion: reduce)').matches;relay=null;start();toast('Welcome! Move with WASD / arrows, or tap the ground. Talk to Maya with E.');};
}
function start(){started=true;photo=false;closeModal();$('welcome').hidden=true;$('intro-bottom').hidden=true;$('hud').hidden=false;document.body.classList.remove('photo-mode');$('exit-photo').hidden=true;renderer.zoom=innerWidth<721?43:47;renderer.yaw=.08;renderer.focus=[state.x,0,state.z-4];if(!canMove(state.x,state.z,world.obstacles)){state.x=0;state.z=27;}save();updateHUD();$('world').focus();}
$('new-game').onclick=setupCharacter;$('continue').onclick=()=>{state=restore(saved)||freshState();start();};
function trackedNPC(){return NPCS.find(n=>n.id===state.tracked)||NPCS[0];}
function updateHUD(){
 $('player-name').textContent=state.name;$('player-role').textContent=ROLES[state.role].name;$('avatar-icon').textContent=state.name.slice(0,1).toUpperCase();$('avatar-icon').style.background=state.color;
 $('level').textContent=level(state);$('xp-fill').style.width=`${state.xp%160/160*100}%`;
 const q=QUESTS.find(q=>q.id===state.tracked)||QUESTS[0],done=state.completed.includes(q.id),n=trackedNPC();
 $('quest-kicker').textContent=`${String(QUESTS.indexOf(q)+1).padStart(2,'0')} / 08 · ${done?'COMPLETE':'MAIN STORY'}`;
 $('quest-title').textContent=done?'A campus, a community.':q.title;$('quest-text').textContent=done?'The festival is open! Keep exploring, take a photo, or enjoy a well-earned snack.':q.text;
 $('quest-location').textContent=q.place;$('quest-reward').textContent=done?'✦ Campus legend':`✧ ${q.xp+(state.role==='maker'?20:0)} XP · ◈ ${q.tokens} tokens`;
 $('quest-distance').textContent=done?'8 / 8':`${Math.round(Math.hypot(state.x-n.x,state.z-n.z))} steps`;
 $('spark-count').textContent=`${state.sparks.length} / 12`;$('green-count').textContent=`${state.recycle.length} / 6`;$('token-count').textContent=state.tokens;
 $('energy-fill').style.width=`${state.energy}%`;$('energy-value').textContent=Math.floor(state.energy);$('discovery').textContent=`${state.discovered.length} / 8 places`;
 const place=LANDMARKS.reduce((a,b)=>Math.hypot(state.x-a.x,state.z-a.z)<Math.hypot(state.x-b.x,state.z-b.z)?a:b);$('location-name').textContent=place.name;
 $('sound').textContent=state.settings.sound?'♫':'♪';$('sound').setAttribute('aria-label',state.settings.sound?'Mute sound':'Enable sound');
 renderer.quality=state.settings.quality;drawMap($('minimap'));
}
function complete(id){const before=level(state);if(finishQuest(state,id)){save();updateHUD();chime();closeModal();toast(`Quest complete: ${QUESTS.find(q=>q.id===id).title}${level(state)>before?` · Level ${level(state)}!`:''}`);if(id==='festival')setTimeout(showEnding,450);return true;}return false;}
function speak(n,text,choices){
 openModal('CAMPUS CONVERSATIONS',`<div class="dialog-person"><div class="avatar-icon" style="background:${n.color}">${n.name[0]}</div><div><h2 id="modal-title">${n.name}</h2><small>${n.role}</small></div></div><p class="dialog-speech">${escape(text)}</p><div class="choices">${choices.map((c,i)=>`<button class="choice" id="choice-${i}">${escape(c[0])}</button>`).join('')}</div><p class="credits">Fictional characters. Real campus spirit.</p>`);
 choices.forEach((c,i)=>$('choice-'+i).onclick=c[1]);
}
function talk(n){
 if(!questAvailable(state,n.id)) {speak(n,n.id==='festival'?`Almost there! We need everyone’s contribution. You’ve completed ${state.completed.length} of the 7 preparations.`:'Welcome to campus! Maya’s waiting by Dover MRT. Say hello to her first, then come back.', [['Got it. See you soon!',closeModal]]);return;}
 if(state.completed.includes(n.id)){
  const choices=[[n.id==='sport'?'Run the relay again':'See you around!',n.id==='sport'?startRelay:closeModal]];
  if(n.id==='food')choices.unshift(['Browse the snack counter',shop]);
  if(n.id==='festival')choices.unshift(['Relive our festival moment',showEnding]);
  speak(n,'Look at what we made together! Take your time. There’s always another little corner of campus to discover.',choices);return;
 }
 const handlers={
 welcome:()=>speak(n,`Hey, ${state.name}! First day? Perfect timing. We’re putting on a student festival, but the crew could use a hand. A story, a snack, a spark of an idea… everyone brings something. What will you bring?`,[['A curious mind. Show me where to start!',()=>{complete('welcome');toast('Maya: Jun is at the Library & FabLab. Or pick any quest from your journal!');}],['A helping hand. Let’s get the crew together.',()=>complete('welcome')],['Let me look around first.',closeModal]]),
 library:()=>speak(n,'Every great idea starts with a little curiosity. I’m sorting the festival archive, but two pattern labels have gone missing. Want to crack them together?',[['Let’s solve the archive puzzle.',()=>libraryPuzzle(0)],['I’ll be back in a bit.',closeModal]]),
 food:()=>speak(n,state.crate?'You found our delivery! The festival won’t be the same without a good meal. Here, a few tokens for your trouble. Don’t forget to take a break, okay?':'Hello! Our festival delivery is somewhere nearby — a little golden crate to the east of the stalls. Can you find it? You can also buy a snack to keep your energy up.',state.crate?[['Happy to help, Auntie!',()=>complete('food')],['Browse the snack counter',shop]]:[['I’ll look for the delivery.',()=>{state.tracked='food';closeModal();updateHUD();}],['Browse the snack counter',shop]]),
 green:()=>speak(n,state.recycle.length===6?'All six recyclables! Small things, done together, really do add up. We’ll turn these into planters for the festival.':`A greener campus starts with us. There are 6 little recyclables scattered along the paths. You’ve collected ${state.recycle.length}. Look for the teal boxes — walk near one and press E.`,state.recycle.length===6?[['Let’s give them a second life.',()=>complete('green')]]:[['Count me in.',()=>{state.tracked='green';closeModal();updateHUD();}]]),
 maker:()=>speak(n,'We’re nearly ready to light up the plaza. My little solar circuit just needs its components connected in the right order. Think you can help?',[['Let’s connect the circuit.',()=>circuitPuzzle([])],['I’ll come back with fresh eyes.',closeModal]]),
 sport:()=>speak(n,state.relayWon?'That was a great run! You kept going and found your rhythm. That’s exactly the spirit we need on the festival crew.':'Fancy a friendly relay? Run through 5 gold checkpoints in order, in 55 seconds. Hold Shift or RUN to sprint. Follow the gold marker — and take a breather whenever you need.',state.relayWon?[['That felt good!',()=>complete('sport')]]:[['Ready. Set. Let’s go!',startRelay],['Not just yet.',closeModal]]),
 memory:()=>speak(n,state.sparks.length===12?'Twelve little moments, one big campus story. We’ll put them all in our festival time capsule. Thanks for looking a little closer.':`I’m collecting the moments people walk past. There are 12 golden memory sparks around campus. You’ve found ${state.sparks.length}. Walk up to one and press E to save it.`,state.sparks.length===12?[['Here’s to the stories we’ll make.',()=>complete('memory')]]:[['I’ll keep my eyes open.',()=>{state.tracked='memory';closeModal();updateHUD();}]]),
 festival:()=>speak(n,`The stories, the food, the lights, the greener corners… look what everyone brought, ${state.name}. You didn’t just explore this campus. You became part of it. Ready to open our festival?`,[['Let’s make a little magic.',()=>complete('festival')],['One last walk first.',closeModal]]),
 };handlers[n.id]();
}
function libraryPuzzle(round){
 const questions=[{code:'2 → 4 → 8 → 16 → ?',options:[24,32,64],correct:32,hint:'Each number doubles. Multiply 16 by 2.'},{code:'1 → 3 → 6 → 10 → ?',options:[12,14,15],correct:15,hint:'The jumps are +2, +3, +4… the next jump is +5.'}],q=questions[round];
 openModal(`ARCHIVE PUZZLE · ${round+1} / 2`,`<h2 id="modal-title" class="modal-title">Find the missing page.</h2><p class="modal-copy">Jun’s archive uses number patterns. Which number completes this label?</p><div class="puzzle-code">${q.code}</div><div class="puzzle-options">${q.options.map(o=>`<button data-answer="${o}">${o}</button>`).join('')}</div><p id="puzzle-feedback" class="puzzle-feedback" role="status">Take your time. There’s no penalty for trying.</p><button class="text-button" id="hint">A little hint?</button>`);
 $('hint').onclick=()=>$('puzzle-feedback').textContent=q.hint;
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(Number(b.dataset.answer)===q.correct){chime([660,880]);if(round===0)libraryPuzzle(1);else complete('library');}else{$('puzzle-feedback').textContent=`Not quite — ${q.hint} Try again.`;b.disabled=true;}});
}
function circuitPuzzle(sequence){
 const order=['Solar panel','Battery','LED lights'];
 openModal('MAKER CHALLENGE',`<h2 id="modal-title" class="modal-title">A little light goes a long way.</h2><p class="modal-copy">Connect the components in order: first <b>collect</b> sunlight, then <b>store</b> energy, finally <b>light</b> the plaza.</p><div class="puzzle-code" style="font-size:16px;letter-spacing:0">${sequence.length?sequence.map(escape).join(' → '):'Collect → Store → Light'}</div><div class="choices">${['LED lights','Solar panel','Battery'].map((o,i)=>`<button class="choice" id="wire-${i}" ${sequence.includes(o)?'disabled':''}>${o} ${sequence.includes(o)?'✓':''}</button>`).join('')}</div><p id="puzzle-feedback" class="puzzle-feedback" role="status">${sequence.length} / 3 components connected</p>`);
 ['LED lights','Solar panel','Battery'].forEach((o,i)=>$('wire-'+i).onclick=()=>{if(o===order[sequence.length]){sequence.push(o);chime([520+sequence.length*110]);if(sequence.length===3)complete('maker');else circuitPuzzle(sequence);}else $('puzzle-feedback').textContent=`Not connected yet. ${['The solar panel collects sunlight.','A battery stores the energy.','The LED lights use the stored energy.'][sequence.length]}`;});
}
function startRelay(){relay={index:0,time:55};state.x=30;state.z=-3;state.energy=100;state.tracked='sport';closeModal();toast('Go! Follow the gold checkpoints. Pausing also pauses the timer.');}
function showEnding(){
 openModal('THE DOVER CHAPTER · COMPLETE',`<div class="celebration">✦</div><h2 id="modal-title" class="modal-title" style="text-align:center">Not just a campus.<br>A little part of you.</h2><p class="modal-copy" style="text-align:center">${escape(state.name)}, you brought the crew together. The lights are on, the stories are shared, and the festival is finally here. Some adventures don’t end. They become a place you belong.</p><div class="stats"><div class="stat"><strong>8 / 8</strong><span>QUESTS COMPLETED</span></div><div class="stat"><strong>${level(state)}</strong><span>CAMPUS LEVEL</span></div><div class="stat"><strong>${Math.floor(state.time/60)}</strong><span>MINUTES EXPLORING</span></div></div><button class="button primary wide" id="keep-exploring">There’s more to discover →</button><p class="credits" style="text-align:center">Thank you for playing SP Campus Quest. Made with a little curiosity and a lot of campus spirit.</p>`);
 $('keep-exploring').onclick=closeModal;
}
function showJournal(){
 openModal('YOUR STORY SO FAR',`<h2 id="modal-title" class="modal-title">Little quests. Lasting stories.</h2><p class="modal-copy">${state.completed.length} of 8 chapters complete. After meeting Maya, take the campus at your own pace.</p><div class="progress-line"><span style="width:${state.completed.length/8*100}%"></span></div>${QUESTS.map(q=>{const done=state.completed.includes(q.id),available=questAvailable(state,q.id);return `<article class="journal-entry"><div class="entry-top"><h3>${q.title}</h3><span class="badge ${done?'done':''}">${done?'✓ COMPLETE':available?'AVAILABLE':'LOCKED'}</span></div><p>${q.text}</p><div class="entry-top"><span class="credits" style="margin:0">${q.place} · ${q.xp+(state.role==='maker'?20:0)} XP · ${q.tokens} tokens</span>${!done&&available?`<button data-track="${q.id}">${state.tracked===q.id?'Tracking ✓':'Track quest →'}</button>`:''}</div></article>`;}).join('')}`,'journal');
 document.querySelectorAll('[data-track]').forEach(b=>b.onclick=()=>{state.tracked=b.dataset.track;save();updateHUD();closeModal();});
}
function showBag(){
 openModal('PACKED FOR POSSIBILITY',`<h2 id="modal-title" class="modal-title">Your little backpack.</h2><p class="modal-copy">A few essentials. A growing collection of stories.</p><div class="stats"><div class="stat"><strong>${state.tokens}</strong><span>FESTIVAL TOKENS</span></div><div class="stat"><strong>${state.xp}</strong><span>TOTAL XP</span></div><div class="stat"><strong>${Math.floor(state.energy)}%</strong><span>ENERGY</span></div></div><div class="inventory-item"><span>◒</span><div><h3>Campus snack × ${state.snacks}</h3><p>Restores 50 energy. Buy more from Auntie Lin.<br>Energy also recovers naturally when you stop sprinting.</p></div><button id="eat" ${!state.snacks||state.energy>=100?'disabled':''}>Enjoy</button></div><div class="inventory-item"><span>✧</span><div><h3>Memory sparks · ${state.sparks.length} / 12</h3><p>Little moments for Izzie’s festival time capsule.</p></div></div><div class="inventory-item"><span>♧</span><div><h3>Recyclables · ${state.recycle.length} / 6</h3><p>Give these a second life with Farah in the eco garden.</p></div></div><div class="inventory-item"><span>▣</span><div><h3>Festival delivery · ${state.crate?'Collected':'Not found yet'}</h3><p>A golden crate east of Food Court 5.</p></div></div>`,'bag');
 $('eat').onclick=()=>{if(eatSnack(state)){save();updateHUD();showBag();chime([440,660]);}};
}
function shop(){const cost=state.role==='connector'?2:3;openModal('AUNTIE LIN’S SNACK COUNTER',`<h2 id="modal-title" class="modal-title">Take a little break.</h2><p class="modal-copy">A campus snack restores 50 energy. You can carry up to 9. These are fictional game tokens, not real money.</p><div class="stats"><div class="stat"><strong>${state.tokens}</strong><span>YOUR TOKENS</span></div><div class="stat"><strong>${cost}</strong><span>TOKENS / SNACK</span></div><div class="stat"><strong>${state.snacks} / 9</strong><span>IN YOUR BAG</span></div></div><button id="buy" class="button primary wide" ${state.tokens<cost||state.snacks>=9?'disabled':''}>${state.snacks>=9?'Your backpack is full':state.tokens<cost?'Earn more tokens by completing quests':`Buy a snack · ${cost} tokens`}</button><button id="back-food" class="text-button">← Back to Auntie Lin</button>`);$('buy').onclick=()=>{if(buySnack(state)){save();updateHUD();chime([660]);shop();}};$('back-food').onclick=()=>talk(NPCS.find(n=>n.id==='food'));}
function drawMap(canvas){
 const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height,s=Math.min(w/96,h/86),px=x=>w/2+x*s,pz=z=>h/2+z*s;
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#e9eddc';ctx.fillRect(0,0,w,h);ctx.fillStyle='#d5dfc4';ctx.fillRect(px(-44),pz(-38),88*s,75*s);
 ctx.strokeStyle='#f6f0df';ctx.lineWidth=4*s;for(const x of [-18,0,19]){ctx.beginPath();ctx.moveTo(px(x),pz(-34));ctx.lineTo(px(x),pz(31));ctx.stroke();}for(const z of [-18,3,17]){ctx.beginPath();ctx.moveTo(px(-39),pz(z));ctx.lineTo(px(41),pz(z));ctx.stroke();}
 for(const o of world.obstacles){ctx.fillStyle='#afbea0';ctx.fillRect(px(o.x-o.w/2),pz(o.z-o.d/2),o.w*s,o.d*s);}
 ctx.fillStyle='#88a497';ctx.fillRect(px(-43),pz(31),86*s,2*s);
 const large=w>300;
 if(large){for(const [kind,points] of [['sparks',SPARKS],['recycle',RECYCLE]])points.forEach(([x,z],i)=>{if(state[kind].includes(i))return;ctx.fillStyle=kind==='sparks'?'#bf8e34':'#419b94';ctx.beginPath();ctx.arc(px(x),pz(z),2.5*s/2,0,Math.PI*2);ctx.fill();});}
 for(const p of LANDMARKS){ctx.fillStyle=state.discovered.includes(p.id)?p.color:'#b8c1a9';ctx.beginPath();ctx.arc(px(p.x),pz(p.z),large?4:2.6,0,Math.PI*2);ctx.fill();if(large){ctx.fillStyle='#526647';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(p.name,px(p.x),pz(p.z)-9);}}
 const target=relay?{x:RELAY[relay.index][0],z:RELAY[relay.index][1]}:trackedNPC();ctx.strokeStyle='#bb9555';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px(target.x),pz(target.z),6,0,Math.PI*2);ctx.stroke();
 ctx.fillStyle='#dc7654';ctx.strokeStyle='#fff8dc';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px(state.x),pz(state.z),large?5:4,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#788869';ctx.font='8px sans-serif';ctx.textAlign='left';ctx.fillText('N ↑',10,14);
}
function showMap(){
 openModal('TAKE THE SCENIC ROUTE',`<h2 id="modal-title" class="modal-title">Your little world.</h2><p class="modal-copy">Visit a landmark to unlock free fast travel. Gold dots are memory sparks; teal dots are recyclables. ${relay?'Fast travel is disabled during a relay.':'Choose a discovered place below to travel.'}</p><canvas class="large-map" id="large-map" width="600" height="480" aria-label="Campus map with landmarks, collectibles and your position"></canvas><div class="map-list">${LANDMARKS.map(p=>`<button data-travel="${p.id}" ${!state.discovered.includes(p.id)||relay?'disabled':''}>${p.name}<span>${state.discovered.includes(p.id)?'Travel ↗':'Undiscovered'}</span></button>`).join('')}</div><p class="credits">An imaginative, compressed campus — not a navigation map. Use SP’s official wayfinding map for real-world directions.</p>`,'map');
 drawMap($('large-map'));document.querySelectorAll('[data-travel]').forEach(b=>b.onclick=()=>{if(relay||!state.discovered.includes(b.dataset.travel))return;const p=LANDMARKS.find(p=>p.id===b.dataset.travel);state.x=p.x;state.z=p.z+1.8;save();closeModal();toast(`A little shortcut to ${p.name}.`);});
}
function help(){openModal('MAKE YOURSELF AT HOME',`<h2 id="modal-title" class="modal-title">A little guidance.</h2><p class="modal-copy">Help the crew open their festival. Meet Maya at Dover MRT, then complete the other stories in any order. Gold markers guide your tracked quest. Everything you need is in your journal.</p><div class="help-grid"><kbd>W A S D / ↑ ← ↓ →</kbd><span>Move around campus</span><kbd>Click / tap ground</kbd><span>Walk to a spot (routes around buildings)</span><kbd>Shift / RUN</kbd><span>Sprint while you have energy</span><kbd>E / Interact</kbd><span>Talk, collect a spark, pick up an item</span><kbd>Space</kbd><span>Hop for joy</span><kbd>J / B / M</kbd><span>Journal / Backpack / Campus map</span><kbd>Q / R</kbd><span>Rotate camera left / right</span><kbd>+ / − / scroll</kbd><span>Zoom in / out</span><kbd>P</kbd><span>Photo mode (use your device’s screenshot tool)</span><kbd>Esc</kbd><span>Close a panel or pause the game</span></div><p class="modal-copy">On a phone, use the on-screen arrows and RUN button. All menus work with Tab and Enter. Dialogs pause the world and relay timer. Energy regenerates naturally. There are no penalties for wrong puzzle answers.</p><div class="sources"><b class="field-label">CAMPUS INSPIRATION</b><a href="https://www.sp.edu.sg/staticfile/CampusMap/index.html" target="_blank" rel="noopener noreferrer">SP interactive campus map ↗</a><a href="https://www.sp.edu.sg/about-sp/campus-map-and-facilities" target="_blank" rel="noopener noreferrer">Campus map and facilities ↗</a><a href="https://www.sp.edu.sg/about-sp/campus-map-and-facilities/wayfinding-around-campus" target="_blank" rel="noopener noreferrer">Wayfinding around campus ↗</a></div><p class="credits">Independent, unofficial project. Landmark names are campus-inspired; geography, buildings, characters and activities are fictionalised. No SP logos, map imagery, or third-party artwork are reproduced. The 3D movement portion requires sight; text menus alone do not provide equivalent nonvisual gameplay.</p>`,'help');}
function settings(){
 openModal('A MOMENT TO BREATHE',`<h2 id="modal-title" class="modal-title">Adventure, at your pace.</h2><p class="modal-copy">${started?'Your adventure is paused, including the relay timer.':'Make yourself comfortable before you begin.'}</p><label class="setting">Gentle sound effects<input id="setting-sound" type="checkbox" ${state.settings.sound?'checked':''}></label><label class="setting">Animated scenery & camera easing<input id="setting-motion" type="checkbox" ${state.settings.motion?'checked':''}></label><label class="setting">Graphics quality<select id="setting-quality"><option value="high" ${state.settings.quality==='high'?'selected':''}>High</option><option value="low" ${state.settings.quality==='low'?'selected':''}>Battery saver</option></select></label><div class="button-row"><button id="resume" class="button primary">${started?'Back to campus →':'Back to the welcome screen'}</button><button id="controls" class="button secondary">Controls & help</button></div>${started?`<div class="button-row"><button class="button secondary" id="export">Export save</button><button class="button secondary" id="import">Import save</button></div><input type="file" id="save-file" accept="application/json,.json" hidden><button class="text-button" id="restart">Start a new adventure</button>${relay?'<button class="text-button" id="cancel-relay" style="margin-left:20px">Cancel relay</button>':''}`:''}<p class="credits">${storageAvailable?'Saves stay in your browser on this device. Export a backup before clearing browser data.':'Device storage is unavailable. Use Export save to keep a backup before closing.'} No analytics, accounts, or remote data collection.</p>`,'settings');
 $('setting-sound').onchange=e=>{state.settings.sound=e.target.checked;chime();save();updateHUD();};$('setting-motion').onchange=e=>{state.settings.motion=e.target.checked;save();};$('setting-quality').onchange=e=>{state.settings.quality=e.target.value;save();updateHUD();};$('resume').onclick=closeModal;$('controls').onclick=help;
 if(started){
  $('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(state,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='sp-campus-quest-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Save exported. Keep it somewhere safe.');};
  $('import').onclick=()=>$('save-file').click();$('save-file').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(file.size>100000){toast('That file is too large. Choose a Campus Quest save under 100 KB.');return;}let next;try{next=restore(await file.text());}catch{}if(!next){toast('This isn’t a valid Campus Quest save. Your current adventure is safe.');return;}openModal('REPLACE THIS ADVENTURE?',`<h2 id="modal-title" class="modal-title">Continue another story?</h2><p class="modal-copy">Import ${escape(next.name)}’s level ${level(next)} adventure? This replaces the save on this device.</p><div class="button-row"><button id="confirm-import" class="button primary">Import adventure</button><button id="cancel-import" class="button secondary">Keep my adventure</button></div>`);$('confirm-import').onclick=()=>{state=next;relay=null;start();toast('Your adventure has been restored.');};$('cancel-import').onclick=settings;};
  $('restart').onclick=()=>{openModal('A FRESH START',`<h2 id="modal-title" class="modal-title">Start a new story?</h2><p class="modal-copy">Your existing device save will be replaced only when you finish creating a new character. Export it first if you’d like to keep it.</p><div class="button-row"><button id="confirm-new" class="button primary">Create new character</button><button id="cancel-new" class="button secondary">Keep this story</button></div>`);$('confirm-new').onclick=setupCharacter;$('cancel-new').onclick=settings;};
  if(relay)$('cancel-relay').onclick=()=>{relay=null;$('relay-status').hidden=true;closeModal();toast('Relay cancelled. Talk to Kai when you’re ready to try again.');};
 }
}
$('journal').onclick=$('quests').onclick=showJournal;$('bag').onclick=showBag;$('map-button').onclick=$('open-map').onclick=showMap;$('help').onclick=help;$('pause').onclick=settings;$('home').onclick=e=>{e.preventDefault();settings();};
$('sound').onclick=()=>{state.settings.sound=!state.settings.sound;chime();save();updateHUD();toast(state.settings.sound?'Gentle sound effects on':'Sound effects off');};
function togglePhoto(){if(!started||$('modal').open)return;photo=!photo;$('hud').hidden=photo;$('exit-photo').hidden=!photo;document.body.classList.toggle('photo-mode',photo);keys.clear();if(photo)toast('Photo mode · use your device’s screenshot tool. P to return.');}
$('photo').onclick=$('exit-photo').onclick=togglePhoto;
$('rotate').onclick=()=>renderer.yaw+=Math.PI/4;$('zoom-in').onclick=()=>renderer.zoom=Math.max(25,renderer.zoom-5);$('zoom-out').onclick=()=>renderer.zoom=Math.min(95,renderer.zoom+5);
function updateNearest(){
 const candidates=[];
 for(const n of NPCS)if(!(n.id==='welcome'&&state.completed.includes('welcome'))&&!(n.id==='festival'&&!state.completed.includes('welcome')))candidates.push({...n,kind:'npc',label:`Talk to ${n.name}`});
 for(const [kind,points,label] of [['sparks',SPARKS,'Collect memory spark'],['recycle',RECYCLE,'Pick up recyclable']])points.forEach(([x,z],id)=>{if(!state[kind].includes(id))candidates.push({x,z,id,kind,label});});
 if(!state.crate)candidates.push({x:39,z:23,id:'crate',kind:'crate',label:'Pick up festival delivery'});
 nearest=candidates.map(o=>({...o,distance:Math.hypot(o.x-state.x,o.z-state.z)})).filter(o=>o.distance<3).sort((a,b)=>a.distance-b.distance)[0]||null;
 $('interaction').hidden=!nearest||photo||!!relay;if(nearest)$('interaction').querySelector('span').textContent=nearest.label;
}
function interact(){if(!nearest||!started||$('modal').open||relay)return;if(nearest.kind==='npc')talk(nearest);else if(nearest.kind==='crate'){state.crate=true;chime();toast('Festival delivery found! Bring the good news to Auntie Lin.');save();}else if(collect(state,nearest.kind,nearest.id)){chime([650,850]);toast(nearest.kind==='sparks'?`A little memory, yours to keep. ${state.sparks.length} / 12 sparks`:`One small action. ${state.recycle.length} / 6 recyclables`);save();}updateHUD();updateNearest();}
$('interact-button').onclick=interact;
const shortcuts={KeyE:interact,KeyJ:showJournal,KeyB:showBag,KeyM:showMap,KeyP:togglePhoto,KeyQ:()=>renderer.yaw-=Math.PI/4,KeyR:()=>renderer.yaw+=Math.PI/4,Equal:()=>renderer.zoom=Math.max(25,renderer.zoom-5),Minus:()=>renderer.zoom=Math.min(95,renderer.zoom+5),Space:()=>{if(jump<=0)jump=.65;}};
window.addEventListener('keydown',e=>{
 if($('modal').open)return;
 if(e.code==='Escape'){e.preventDefault();if(photo)togglePhoto();else settings();return;}
 if(!started)return;
 if(shortcuts[e.code]){e.preventDefault();if(!e.repeat)shortcuts[e.code]();return;}
 if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','ShiftLeft','ShiftRight'].includes(e.code)){e.preventDefault();keys.add(e.code);clickPath=[];}
});window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();save();});document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden){save();if(started&&!$('modal').open)settings();}});window.addEventListener('pagehide',save);
for(const b of document.querySelectorAll('[data-move],#mobile-sprint')){
 const code=b.dataset.move||'ShiftLeft';b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(code);clickPath=[];};for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(code));
}
$('world').addEventListener('wheel',e=>{if(!started||$('modal').open)return;e.preventDefault();renderer.zoom=Math.max(25,Math.min(95,renderer.zoom+e.deltaY*.025));},{passive:false});
function findPath(tx,tz){
 const grid=2,key=(x,z)=>`${x},${z}`,sx=Math.round(state.x/grid),sz=Math.round(state.z/grid),ex=Math.round(tx/grid),ez=Math.round(tz/grid);
 if(!canMove(ex*grid,ez*grid,world.obstacles))return [];
 const queue=[[sx,sz]],previous=new Map([[key(sx,sz),null]]);let head=0;
 while(head<queue.length){const [x,z]=queue[head++];if(x===ex&&z===ez){const path=[];let c=[x,z];while(c){path.push([c[0]*grid,c[1]*grid]);c=previous.get(key(...c));}path.reverse();path.shift();return path;}
 for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(!previous.has(k)&&canMove(nx*grid,nz*grid,world.obstacles)&&canMove((x+nx)*grid/2,(z+nz)*grid/2,world.obstacles)){previous.set(k,[x,z]);queue.push([nx,nz]);}}
 }return [];
}
$('world').addEventListener('pointerdown',e=>{if(!started||photo||$('modal').open||e.button!==0)return;const m=renderer.matrix,x=e.clientX/innerWidth*2-1-m[12],y=1-e.clientY/innerHeight*2-m[13],det=m[0]*m[9]-m[8]*m[1],wx=(x*m[9]-m[8]*y)/det,wz=(m[0]*y-x*m[1])/det;if(canMove(wx,wz,world.obstacles)){clickPath=findPath(wx,wz);if(!clickPath.length)toast('Try a nearby path, or use the movement keys.');}else toast('That spot is inside a building or off campus. Choose a path.');});
// Persistent DOM labels: no per-frame innerHTML churn.
const labels=LANDMARKS.map(p=>{const el=document.createElement('span');el.className='world-label';el.textContent=p.name;$('labels').append(el);return {...p,el};});
const targetLabel=document.createElement('span');targetLabel.className='world-label npc target';$('labels').append(targetLabel);
function animateLabels(){
 for(const p of labels){const [x,y]=renderer.project(p.x,1,p.z);p.el.style.left=`${x}px`;p.el.style.top=`${y}px`;p.el.hidden=photo||(started&&Math.hypot(p.x-state.x,p.z-state.z)>34);}
 if(started&&!photo&&!state.completed.includes('festival')){const n=relay?{x:RELAY[relay.index][0],z:RELAY[relay.index][1],name:`Checkpoint ${relay.index+1}`} : trackedNPC();const [x,y]=renderer.project(n.x,4,n.z);targetLabel.style.left=`${x}px`;targetLabel.style.top=`${y}px`;targetLabel.textContent=`◇ ${n.name}`;targetLabel.hidden=false;}else targetLabel.hidden=true;
}
function tick(dt,t){
 const paused=!started||$('modal').open||photo||document.hidden;
 if(!paused){
  state.time+=dt;
  let h=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0),v=(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(keys.has('KeyW')||keys.has('ArrowUp')?1:0);
  let dx=h*Math.cos(renderer.yaw)+v*Math.sin(renderer.yaw),dz=-h*Math.sin(renderer.yaw)+v*Math.cos(renderer.yaw);
  if(!h&&!v&&clickPath.length){const next=clickPath[0];dx=next[0]-state.x;dz=next[1]-state.z;if(Math.hypot(dx,dz)<.3){clickPath.shift();dx=0;dz=0;}}
  const moving=Math.hypot(dx,dz)>.05,sprinting=moving&&(keys.has('ShiftLeft')||keys.has('ShiftRight'))&&state.energy>1,speed=sprinting?9:5.3;
  state.energy=Math.max(0,Math.min(100,state.energy+(sprinting?-(state.role==='explorer'?9.1:14):9)*dt));
  if(moving){const l=Math.hypot(dx,dz);dx=dx/l*speed*dt;dz=dz/l*speed*dt;let moved=false;if(canMove(state.x+dx,state.z,world.obstacles)){state.x+=dx;moved=true;}if(canMove(state.x,state.z+dz,world.obstacles)){state.z+=dz;moved=true;}if(!moved&&clickPath.length)clickPath=[];facing=Math.atan2(dx,dz);walk+=dt*speed*1.6;}else walk=0;
  jump=Math.max(0,jump-dt*1.8);
  for(const p of LANDMARKS)if(!state.discovered.includes(p.id)&&Math.hypot(p.x-state.x,p.z-state.z)<6){state.discovered.push(p.id);state.xp+=15;toast(`Discovered ${p.name} · +15 XP · Fast travel unlocked`);chime([440,550]);save();}
  if(relay){relay.time-=dt;const target=RELAY[relay.index];if(Math.hypot(state.x-target[0],state.z-target[1])<2.2){relay.index++;chime([550+relay.index*70]);if(relay.index===RELAY.length){relay=null;state.relayWon=true;save();toast('Relay complete! Head back to Kai to claim your quest reward.');}}if(relay&&relay.time<=0){relay=null;toast('Time’s up — good effort! Talk to Kai to try again. No progress lost.');}}
  $('relay-status').hidden=!relay;if(relay)$('relay-status').textContent=`⚑ Checkpoint ${relay.index+1} / 5 · ${Math.ceil(relay.time)}s remaining`;
  const target=[state.x,0,state.z-4],ease=state.settings.motion?1-Math.exp(-dt*4):1;renderer.focus=renderer.focus.map((v,i)=>v+(target[i]-v)*ease);
  updateNearest();if(t-lastSave>12000){save();lastSave=t;}
 } else if(!started&&!$('modal').open&&state.settings.motion) renderer.yaw=-.2+Math.sin(t*.00004)*.12;
 const dynamic=[],motion=state.settings.motion&&!paused,tm=motion?t*.001:0;
 dynamic.push(...avatar(state.x,state.z,state.color,facing,walk,jump>0?Math.sin(jump/.65*Math.PI)*1.3:0));
 for(const n of NPCS){if(n.id==='welcome'&&state.completed.includes('welcome')||n.id==='festival'&&!state.completed.includes('welcome'))continue;dynamic.push(...avatar(n.x,n.z,n.color,Math.sin(n.x)*.7));if(!state.completed.includes(n.id))dynamic.push(object('gem',n.x,3.3+Math.sin(tm*2+n.x)*.15,n.z,.45,.6,.45,questAvailable(state,n.id)?'#eac472':'#c3cbb5',tm));}
 SPARKS.forEach(([x,z],i)=>{if(!state.sparks.includes(i)){dynamic.push(object('gem',x,1.25+Math.sin(tm*2+i)*.15,z,.6,.9,.6,'#e6bd5e',tm));dynamic.push(object('cylinder',x,.09,z,1.1,.08,1.1,'#d1ce99'));}});
 RECYCLE.forEach(([x,z],i)=>{if(!state.recycle.includes(i)){dynamic.push(object('box',x,.36,z,.6,.65,.6,'#5ba398'));dynamic.push(object('box',x,.72,z,.68,.12,.68,'#b8d0b5'));}});
 if(!state.crate){dynamic.push(object('box',39,.55,23,1,1,1,'#cb9d57'));dynamic.push(object('box',39,1.09,23,1.05,.13,.18,'#f1d99a'));}
 if(relay){const [x,z]=RELAY[relay.index];dynamic.push(object('cylinder',x,.12,z,4,.18,4,'#ecd291'));dynamic.push(object('gem',x,3,z,1.2,1.6,1.2,'#e8b855',tm));}
 if(clickPath.length){const [x,z]=clickPath[clickPath.length-1];dynamic.push(object('cylinder',x,.13,z,.8,.1,.8,'#df8f68'));}
 const trainX=state.settings.motion?(Math.sin(t*.00007)*55):12;
 for(let i=0;i<3;i++){const x=trainX+i*5.3;dynamic.push(object('box',x,5.05,32,5,1.4,2,'#eee8d6'));dynamic.push(object('box',x,4.8,33.02,4.9,.25,.05,'#82aa94'));for(let j=0;j<4;j++)dynamic.push(object('box',x-1.8+j*1.2,5.3,33.04,.8,.5,.05,'#68868a'));}
 if(state.completed.includes('festival'))for(let i=0;i<24;i++){const a=i*2.4,rad=3+i%6;dynamic.push(object('gem',Math.sin(a+tm*.1)*rad,3+Math.sin(tm+i)*.5+i%4,3+Math.cos(a+tm*.1)*rad,.18,.3,.18,['#e5b55e','#db7d69','#87b09c'][i%3],tm));}
 renderer.render([...world.objects,...dynamic]);animateLabels();
}
let last=performance.now(),uiTime=0;
function frame(t){const dt=Math.min((t-last)/1000,.05);last=t;try{tick(dt,t);if(t-uiTime>130){updateHUD();uiTime=t;}}catch(error){console.error(error);save();openModal('LET’S TRY AGAIN',`<h2 id="modal-title" class="modal-title">A little bump in the path.</h2><p class="modal-copy">The game encountered an unexpected problem. Reload to continue from your last saved position.</p><button class="button primary" id="recover">Reload adventure</button>`);$('recover').onclick=()=>location.reload();return;}requestAnimationFrame(frame);}
updateHUD();requestAnimationFrame(frame);$('loading').hidden=true;
// Opt-in, local-only smoke-test bridge. Never enabled on normal deployments.
if(location.hostname==='127.0.0.1'&&new URLSearchParams(location.search).has('test'))window.__campus={get state(){return state;},start:()=>{state=freshState();start();},interact:()=>{updateNearest();interact();},teleport:(x,z)=>{state.x=x;state.z=z;updateNearest();},get renderer(){return renderer;}};

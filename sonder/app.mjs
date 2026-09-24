import { MOODS, defaults, validate, hash, geometry, description, svgArt, notePlan, scheduleNote, wavFromBuffer, tempo } from './engine.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const STORE = 'sonder.collection.v1';
const DRAFT = 'sonder.draft.v1';
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const canvas = $('#art');
const ctx = canvas.getContext('2d');
let state = defaults(), history = [], future = [], collection = [];
let phase = 0, lastFrame = 0, dirty = true, paused = reduce.matches;
let savedTimer, toastTimer, deleted = null, storageWarning = false;
let ctxAudio = null, audioBus = null, audioTimer, soundOn = false;

function toast(text, undo = false) {
  clearTimeout(toastTimer);
  const notice = $('#toast');
  ($('dialog[open]') || document.body).append(notice);
  $('#toast span').textContent = text;
  $('#toast-undo').hidden = !undo;
  notice.hidden = false;
  if (!undo) toastTimer = setTimeout(() => { notice.hidden = true; }, 6000);
}
function read(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    storageWarning = true;
    console.warn('Sonder could not read browser storage:', error.name);
    return fallback;
  }
}
function write(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (error) { console.warn('Sonder could not save to browser storage:', error.name); return false; }
}
function clone(value = state) { return { ...value }; }
function remember(value = state) {
  history.push(clone(value));
  if (history.length > 60) history.shift();
  future = [];
  updateHistory();
}
function updateHistory() {
  $('#undo').disabled = !history.length;
  $('#redo').disabled = !future.length;
}
function persist() {
  clearTimeout(savedTimer);
  savedTimer = setTimeout(() => {
    if (!write(DRAFT, state)) toast('Browser storage is unavailable. Export a project to keep your work.');
  }, 400);
}
function commit(patch) {
  remember();
  state = { ...state, ...patch };
  phase = 0;
  dirty = true;
  sync();
  persist();
  if (soundOn) restartSound();
}
function sync() {
  const mood = MOODS[state.mood];
  for (const type of ['mood', 'form']) {
    $$('[data-' + type + ']').forEach(button => {
      const active = button.dataset[type] === state[type];
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  for (const id of ['energy', 'detail']) {
    const input = $('#' + id);
    input.value = state[id];
    $('#' + id + '-value').textContent = state[id];
    const progress = (state[id] - Number(input.min)) / (Number(input.max) - Number(input.min));
    input.style.setProperty('--progress', progress * 100 + '%');
  }
  if (document.activeElement !== $('#moment')) $('#moment').value = state.moment;
  $('#char-count').textContent = state.moment.length + ' / 160';
  $('#art-title').textContent = state.title;
  $('#art-edition').textContent = '01 — ' + mood.name.toUpperCase() + ' / ' + state.form.toUpperCase();
  $('#art-description').textContent = description(state);
  canvas.setAttribute('aria-label', state.title + '. ' + description(state));
  updateHistory();
  syncSoundLabel();
}
function loadCollection(value) {
  if (!Array.isArray(value)) { storageWarning = true; return []; }
  const clean = value.filter(item => item && typeof item.id === 'string' && validate(item.state)).slice(0, 24)
    .map(item => ({ id: item.id, date: typeof item.date === 'string' ? item.date : '', state: validate(item.state) }));
  if (clean.length !== value.length) storageWarning = true;
  return clean;
}
function init() {
  const rawDraft = read(DRAFT, null);
  const draft = validate(rawDraft);
  if (draft) state = draft;
  else if (rawDraft !== null) storageWarning = true;
  collection = loadCollection(read(STORE, []));
  if (storageWarning) toast('Some saved data could not be read. You can still create and export, or import a project backup.');
  if (location.hash.startsWith('#art=')) {
    try {
      const raw = location.hash.slice(5);
      if (raw.length > 3000) throw new Error('Oversized link');
      const shared = validate(JSON.parse(atob(raw)));
      if (!shared) throw new Error('Invalid recipe');
      state = shared;
      toast('A feeling, passed to you. Make this composition your own.');
    } catch (error) {
      console.warn('Sonder could not open this remix:', error.message);
      toast('This remix link could not be opened. Your previous work is still here.');
    }
  }
  $('#collection-count').textContent = collection.length;
  sync();
  setPaused(paused);
  resize();
  requestAnimationFrame(animate);
  if (!ctx) toast('Your browser cannot draw the canvas. Descriptions, sound, and SVG exports still work.');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(error => {
      console.warn('Sonder offline caching is unavailable:', error.name);
      $('#connection-status').textContent = 'Offline caching unavailable';
    });
  }
}
function resize() {
  const rect = canvas.getBoundingClientRect(), ratio = Math.min(devicePixelRatio || 1, 1.6);
  canvas.width = Math.max(1, Math.round(rect.width * ratio));
  canvas.height = Math.max(1, Math.round(rect.height * ratio));
  dirty = true;
}
function paint() {
  if (!ctx) return;
  const w = canvas.width, h = canvas.height;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const bg = ctx.createRadialGradient(w * .5, h * .46, 0, w * .5, h * .46, Math.max(w, h) * .7);
  bg.addColorStop(0, '#25362f'); bg.addColorStop(.58, '#17221d'); bg.addColorStop(1, '#111715');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
  const expanded = document.fullscreenElement || $('#canvas-wrap').classList.contains('expanded');
  const scale = expanded ? Math.min(w / 1000, h / 850) : Math.max(w / 1000, h / 850) * .94;
  ctx.translate(w / 2, h / 2); ctx.scale(scale, scale); ctx.translate(-500, -425);
  ctx.globalCompositeOperation = 'screen';
  for (const path of geometry(state, phase)) {
    ctx.strokeStyle = path.color; ctx.globalAlpha = path.alpha; ctx.lineWidth = path.width;
    ctx.stroke(new Path2D(path.d));
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function animate(now) {
  requestAnimationFrame(animate);
  if (document.hidden) return;
  if (dirty || (!paused && now - lastFrame > 80)) {
    if (!paused) phase += Math.min((now - lastFrame) / 1000, .12) * (.2 + state.energy * .004);
    paint(); lastFrame = now; dirty = false;
  }
}
function setPaused(value) {
  paused = value;
  $('#pause').setAttribute('aria-label', paused ? 'Resume animation' : 'Pause animation');
  $('#pause').title = paused ? 'Resume animation' : 'Pause animation';
  $('#pause use').setAttribute('href', paused ? '#i-play' : '#i-pause');
  $('#motion-state').textContent = paused ? 'STILL FRAME' : 'LIVING ART';
  dirty = true;
}
function restore(value) {
  state = clone(value); phase = 0; dirty = true;
  sync(); persist();
  if (soundOn) restartSound();
}
function undo() {
  if (!history.length) return;
  future.push(clone()); restore(history.pop()); toast('Last change undone.');
}
function redo() {
  if (!future.length) return;
  history.push(clone()); restore(future.pop()); toast('Change restored.');
}
$$('[data-mood]').forEach(button => button.addEventListener('click', () => {
  if (state.mood !== button.dataset.mood) commit({ mood: button.dataset.mood, title: MOODS[button.dataset.mood].title });
}));
$$('[data-form]').forEach(button => button.addEventListener('click', () => {
  if (state.form !== button.dataset.form) commit({ form: button.dataset.form });
}));
for (const id of ['energy', 'detail']) {
  const input = $('#' + id);
  let previous = null;
  input.addEventListener('focus', () => { previous = clone(); });
  input.addEventListener('pointerdown', () => { previous = clone(); });
  input.addEventListener('input', () => {
    if (!previous) previous = clone();
    state[id] = Number(input.value); dirty = true; sync();
  });
  input.addEventListener('change', () => {
    if (previous && previous[id] !== state[id]) {
      remember(previous); persist();
      if (soundOn) restartSound();
    }
    previous = clone();
  });
}
let typingBefore = null, typingTimer;
function finishTyping() {
  clearTimeout(typingTimer);
  if (typingBefore && typingBefore.moment !== state.moment) {
    remember(typingBefore); persist();
    if (soundOn) restartSound();
  }
  typingBefore = null;
}
$('#moment').addEventListener('input', event => {
  if (!typingBefore) typingBefore = clone();
  state.moment = event.target.value.slice(0, 160);
  state.seed = state.moment ? hash(state.moment) : 827391;
  dirty = true; sync(); clearTimeout(typingTimer);
  typingTimer = setTimeout(finishTyping, 600);
});
$('#moment').addEventListener('blur', finishTyping);
const prompts = ['Sunlight finding its way through the curtains.', 'The quiet after the rain.', 'A conversation I wish could last a little longer.', 'Walking somewhere new with nowhere to be.', 'The first deep breath after a long day.', 'A small kindness I did not expect.'];
let promptIndex = 0;
$('#inspire').addEventListener('click', () => {
  finishTyping(); const moment = prompts[promptIndex++ % prompts.length];
  commit({ moment, seed: hash(moment) }); toast('A starting point. Change these words to make them yours.');
});
$('#remix').addEventListener('click', () => {
  finishTyping(); const bytes = new Uint32Array(1); crypto.getRandomValues(bytes);
  commit({ seed: bytes[0] }); toast('A new possibility. Undo takes you back.');
});
$('#undo').addEventListener('click', undo);
$('#redo').addEventListener('click', redo);
$('#pause').addEventListener('click', () => setPaused(!paused));
reduce.addEventListener('change', event => { if (event.matches) setPaused(true); });
let expandedFocus = null;
async function expand() {
  const wrap = $('#canvas-wrap');
  if (document.fullscreenElement) {
    try { await document.exitFullscreen(); }
    catch (error) { console.warn('Could not leave fullscreen:', error.name); toast('Press Escape to leave fullscreen.'); }
    return;
  }
  if (wrap.classList.contains('expanded')) {
    wrap.classList.remove('expanded'); document.body.classList.remove('art-expanded');
    $('#fullscreen').setAttribute('aria-label', 'Expand artwork');
    $('#fullscreen use').setAttribute('href', '#i-expand'); resize(); expandedFocus?.focus(); return;
  }
  expandedFocus = document.activeElement;
  if (wrap.requestFullscreen) {
    try { await wrap.requestFullscreen(); return; }
    catch (error) { console.info('Native fullscreen unavailable; using the in-page view:', error.name); }
  }
  wrap.classList.add('expanded'); document.body.classList.add('art-expanded');
  $('#fullscreen').setAttribute('aria-label', 'Exit expanded artwork');
  $('#fullscreen use').setAttribute('href', '#i-close'); resize(); $('#fullscreen').focus();
}
$('#fullscreen').addEventListener('click', expand);
document.addEventListener('fullscreenchange', () => {
  $('#fullscreen').setAttribute('aria-label', document.fullscreenElement ? 'Exit expanded artwork' : 'Expand artwork');
  $('#fullscreen use').setAttribute('href', document.fullscreenElement ? '#i-close' : '#i-expand'); resize();
});
new ResizeObserver(resize).observe($('#canvas-wrap'));
function openDialog(id) {
  finishTyping(); const dialog = $('#' + id); dialog.showModal();
  if (!$('#toast').hidden) dialog.append($('#toast'));
  return dialog;
}
$$('[data-dialog]').forEach(button => button.addEventListener('click', () => openDialog(button.dataset.dialog)));
$$('.close-dialog').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
$$('dialog').forEach(dialog => {
  dialog.setAttribute('aria-labelledby', dialog.id + '-title');
  dialog.querySelector('h2').id = dialog.id + '-title';
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (dialog.contains($('#toast'))) document.body.append($('#toast'));
    if ('speechSynthesis' in window) { speechSynthesis.cancel(); $('#read-description span').textContent = 'Read aloud'; }
  });
});
$('#open-guide').addEventListener('click', () => openDialog('guide-dialog'));
$('#describe').setAttribute('aria-expanded', 'false');
$('#describe').setAttribute('aria-controls', 'description-panel');
$('#describe').addEventListener('click', () => {
  const panel = $('#description-panel'); panel.hidden = !panel.hidden;
  $('#describe').setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) panel.scrollIntoView({ block: 'nearest', behavior: reduce.matches ? 'instant' : 'smooth' });
});
$('#read-description').addEventListener('click', () => {
  if (!('speechSynthesis' in window)) { toast('Read-aloud is unavailable in this browser. The full description is shown here.'); return; }
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); $('#read-description span').textContent = 'Read aloud'; return; }
  const utterance = new SpeechSynthesisUtterance(description(state)); utterance.rate = .9;
  utterance.onend = () => { $('#read-description span').textContent = 'Read aloud'; };
  utterance.onerror = event => {
    $('#read-description span').textContent = 'Read aloud';
    if (!['canceled', 'interrupted'].includes(event.error)) toast('Your browser could not read aloud. The full description is available on screen.');
  };
  speechSynthesis.speak(utterance); $('#read-description span').textContent = 'Stop reading';
});
function syncSoundLabel() {
  $('#sound').setAttribute('aria-pressed', String(soundOn));
  $('#sound-label').textContent = soundOn ? 'You’re listening to ' + MOODS[state.mood].name.toLowerCase() + '.' : 'There’s a sound to this feeling.';
  $('#sound-subtitle').textContent = soundOn ? tempo(state) + ' BPM · generated from your artwork · tap to stop' : 'Put on your headphones. Tap to listen.';
}
async function startSound() {
  $('#sound').disabled = true;
  try {
    if (!ctxAudio) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('Audio is unsupported');
      ctxAudio = new AudioContext();
    }
    await ctxAudio.resume();
    if (ctxAudio.state !== 'running') throw new Error('Audio could not start');
    if (document.hidden) return;
    soundOn = true; queueSound(); syncSoundLabel();
  } catch (error) {
    console.warn('Sonder could not start sound:', error.message); stopSound();
    toast('Sound is unavailable. Try another browser, or explore the artwork description.');
  } finally { $('#sound').disabled = false; }
}
function queueSound() {
  if (!soundOn) return;
  if (audioBus) {
    const old = audioBus; old.gain.setTargetAtTime(0, ctxAudio.currentTime, .08);
    setTimeout(() => old.disconnect(), 500);
  }
  audioBus = ctxAudio.createGain(); audioBus.gain.value = .38; audioBus.connect(ctxAudio.destination);
  const start = ctxAudio.currentTime + .07;
  for (const note of notePlan(state, 12)) scheduleNote(ctxAudio, audioBus, note, start);
  audioTimer = setTimeout(queueSound, 12000);
}
function stopSound() {
  soundOn = false; clearTimeout(audioTimer);
  if (audioBus && ctxAudio) {
    audioBus.gain.setTargetAtTime(0, ctxAudio.currentTime, .06);
    const old = audioBus; setTimeout(() => old.disconnect(), 400); audioBus = null;
  }
  syncSoundLabel();
}
function restartSound() { clearTimeout(audioTimer); queueSound(); }
$('#sound').addEventListener('click', () => soundOn ? stopSound() : startSound());
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopSound(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  else { lastFrame = performance.now(); dirty = true; }
});
$('#save').addEventListener('click', () => {
  if (collection.length >= 24) { showCollection(); toast('Your collection has 24 moments. Export a backup, then remove one to make room.'); return; }
  $('#save-title').value = state.title; openDialog('save-dialog'); setTimeout(() => $('#save-title').select(), 50);
});
$('#save-form').addEventListener('submit', event => {
  event.preventDefault(); finishTyping();
  const title = $('#save-title').value.trim();
  if (!title) { $('#save-title').setCustomValidity('Give this moment a name.'); $('#save-title').reportValidity(); return; }
  $('#save-title').setCustomValidity('');
  if (collection.length >= 24) { toast('Your collection is full. Export a project, or remove a saved moment first.'); return; }
  const item = { id: crypto.randomUUID(), date: new Date().toISOString(), state: { ...state, title } };
  const next = [item, ...collection];
  if (!write(STORE, next)) { toast('This browser could not save your work. Export an editable project instead.'); return; }
  collection = next; state.title = title; sync(); persist();
  $('#collection-count').textContent = collection.length; $('#save-dialog').close(); toast('A little piece of you, kept in your collection.');
});
$('#save-title').addEventListener('input', () => $('#save-title').setCustomValidity(''));
function showCollection() { renderCollection(); openDialog('collection-dialog'); }
function make(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function renderCollection() {
  const grid = $('#collection-grid'); grid.replaceChildren();
  $('#collection-count').textContent = collection.length; $('#storage-count').textContent = collection.length + ' / 24 moments';
  if (!collection.length) {
    const empty = make('div', 'collection-empty');
    empty.innerHTML = '<svg aria-hidden="true"><use href="#i-save"/></svg><h3>Your first moment is waiting.</h3><p>Make something in the studio, then choose “Keep this moment”.</p>';
    grid.append(empty); return;
  }
  for (const item of collection) {
    const card = make('article', 'collection-card'), open = make('button', 'open-art'), image = make('img');
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgArt(item.state, { quality: .4 }));
    image.alt = description(item.state); image.loading = 'lazy';
    open.append(image, make('h3', '', item.state.title)); open.setAttribute('aria-label', 'Open ' + item.state.title);
    open.addEventListener('click', () => {
      remember(); restore(item.state); $('#collection-dialog').close(); toast('Moment reopened. Your previous composition is one Undo away.');
    });
    const meta = make('div', 'card-meta');
    meta.append(make('span', '', MOODS[item.state.mood].name.toUpperCase() + ' / ' + item.state.form.toUpperCase()));
    const remove = make('button', 'icon-btn'); remove.setAttribute('aria-label', 'Remove ' + item.state.title);
    remove.innerHTML = '<svg><use href="#i-trash"/></svg>';
    remove.addEventListener('click', () => {
      const index = collection.findIndex(saved => saved.id === item.id), next = collection.filter(saved => saved.id !== item.id);
      if (!write(STORE, next)) { toast('Could not update storage. This moment has not been removed.'); return; }
      deleted = { item, index }; collection = next; renderCollection(); toast('Moment removed. You can undo this.', true);
      $('#toast-undo').focus();
    });
    meta.append(remove); card.append(open, meta); grid.append(card);
  }
}
$('#collection-nav').addEventListener('click', showCollection);
$('#toast-undo').addEventListener('click', () => {
  if (!deleted) { toast('There is no removed moment to restore.'); return; }
  if (collection.length >= 24) { toast('Your collection is full. Remove a moment before restoring this one.'); return; }
  const next = [...collection]; next.splice(deleted.index, 0, deleted.item);
  if (!write(STORE, next)) { toast('Could not restore this moment. Browser storage is unavailable.'); return; }
  collection = next; deleted = null; renderCollection(); toast('Moment restored.');
  if ($('#collection-dialog').open) $('#collection-grid .open-art')?.focus();
});
$('#import').addEventListener('click', () => $('#import-file').click());
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 16384) throw new Error('Project exceeds size limit');
    const parsed = JSON.parse(await file.text());
    const clean = validate(parsed?.state || parsed);
    if (!clean) throw new Error('Invalid project recipe');
    remember(); restore(clean); $('#collection-dialog').close(); toast('Project opened. Choose “Keep this moment” to add it to your collection.');
  } catch (error) {
    console.warn('Sonder could not import this project:', error.message);
    toast('That file is not a valid Sonder project. Choose an exported JSON file under 16 KB.');
  } finally { event.target.value = ''; }
});
$('#export').addEventListener('click', () => openDialog('export-dialog'));
function download(data, name, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob), anchor = document.createElement('a');
  anchor.href = url; anchor.download = name;
  ($('dialog[open]') || document.body).append(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
function fileName(extension) { return 'sonder-' + state.mood + '-' + state.seed + '.' + extension; }
async function exportArt(type) {
  const buttons = $$('[data-export]'); buttons.forEach(button => { button.disabled = true; });
  $('#export-status').textContent = 'Preparing your ' + type.toUpperCase() + '…';
  try {
    if (type === 'svg') download(svgArt(state, { caption: true }), fileName('svg'), 'image/svg+xml');
    else if (type === 'json') download(JSON.stringify({ app: 'Sonder', version: 1, state, description: description(state) }, null, 2), fileName('json'), 'application/json');
    else if (type === 'png') {
      const url = URL.createObjectURL(new Blob([svgArt(state, { caption: true })], { type: 'image/svg+xml' }));
      try {
        const image = new Image(); image.src = url; await image.decode();
        const target = document.createElement('canvas'); target.width = 2400; target.height = 2040;
        const context = target.getContext('2d'); if (!context) throw new Error('Canvas is unavailable');
        context.drawImage(image, 0, 0, target.width, target.height);
        const blob = await new Promise(resolve => target.toBlob(resolve, 'image/png'));
        if (!blob) throw new Error('Image encoding failed');
        download(blob, fileName('png'), 'image/png');
      } finally { URL.revokeObjectURL(url); }
    } else if (type === 'wav') {
      const Offline = window.OfflineAudioContext || window.webkitOfflineAudioContext;
      if (!Offline) throw new Error('Offline audio is unavailable');
      const offline = new Offline(2, 44100 * 12, 44100), bus = offline.createGain();
      bus.gain.setValueAtTime(.6, 0); bus.gain.setValueAtTime(.6, 10.5); bus.gain.linearRampToValueAtTime(0, 12); bus.connect(offline.destination);
      for (const note of notePlan(state, 12)) scheduleNote(offline, bus, note, 0);
      download(wavFromBuffer(await offline.startRendering()), fileName('wav'), 'audio/wav');
    } else throw new Error('Unknown export type');
    $('#export-status').textContent = 'Your ' + type.toUpperCase() + ' is ready. Check your downloads.';
    toast('Your ' + type.toUpperCase() + ' is ready to keep.');
  } catch (error) {
    console.warn('Sonder export failed:', error.message);
    $('#export-status').textContent = 'This export did not complete. Try again, or choose an editable project to keep your work.';
  } finally { buttons.forEach(button => { button.disabled = false; }); }
}
$$('[data-export]').forEach(button => button.addEventListener('click', () => exportArt(button.dataset.export)));
$('#share').addEventListener('click', () => {
  const shared = { version: 1, mood: state.mood, form: state.form, energy: state.energy, detail: state.detail, seed: state.seed };
  const url = new URL(location.href); url.hash = 'art=' + btoa(JSON.stringify(shared));
  $('#share-url').value = url.href; $('#share-status').textContent = 'No account or public gallery. Just a link.'; openDialog('share-dialog');
});
$('#copy-link').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText($('#share-url').value);
    $('#share-status').textContent = 'Copied. Share it with someone who could use a creative moment.'; toast('Remix link copied. Your written moment is not included.');
  } catch (error) {
    console.info('Clipboard unavailable:', error.name);
    $('#share-url').focus(); $('#share-url').select(); $('#share-status').textContent = 'Copy is unavailable here. Select and copy the link above.';
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && $('#canvas-wrap').classList.contains('expanded')) { event.preventDefault(); expand(); }
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if (typing || $('dialog[open]')) return;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
  if ($('#canvas-wrap').classList.contains('expanded') && event.key === 'Tab') {
    const buttons = [$('#pause'), $('#fullscreen')];
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[1].focus(); }
    else if (!event.shiftKey && document.activeElement === buttons[1]) { event.preventDefault(); buttons[0].focus(); }
  }
});
function connectivity() { $('#connection-status').textContent = navigator.onLine ? 'Local-first by design' : 'Offline · keep creating'; }
window.addEventListener('online', connectivity);
window.addEventListener('offline', connectivity);
window.addEventListener('pagehide', () => { finishTyping(); clearTimeout(savedTimer); write(DRAFT, state); stopSound(); });
window.addEventListener('storage', event => {
  if (event.key === STORE) {
    collection = loadCollection(read(STORE, [])); renderCollection();
    toast('Your collection was updated in another tab.');
  }
});
init();
connectivity();

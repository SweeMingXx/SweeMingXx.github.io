import { reports, programme } from './data.js';

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId = new Map(reports.map(r => [r.id, r]));
const cache = new Map();
const texts = new Map();
let currentReport = null, filter = 'all', dayFilter = 'all', loadingIndex = false;
let requestId = 0, returnHash = '#archive', returnScroll = null, opener = null, statusTimer;
let readerSize = 18;
const stored = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
const store = (key, val) => { try { localStorage.setItem(key, val); return true; } catch { return false; } };
let saved;
try { const value = JSON.parse(stored('las2026-saved', '[]')); saved = new Set(Array.isArray(value) ? value.filter(id => byId.has(id)) : []); } catch { saved = new Set(); }
const dayLabel = r => r.day ? `Day ${r.day} · ${r.day === 1 ? '27' : '28'} October` : 'Both days';
const reportHref = id => `#read/${encodeURIComponent(id)}`;

async function loadReport(report) {
  if (!cache.has(report.file)) {
    const promise = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      try {
        const response = await fetch(`reports/${report.file}.md`, {signal:controller.signal});
        if (!response.ok) throw new Error(`Report request failed (${response.status})`);
        const text = await response.text();
        if (!text.startsWith('# ')) throw new Error('Unexpected report format');
        texts.set(report.file, text);
        return text;
      } finally { clearTimeout(timer); }
    })();
    cache.set(report.file, promise);
    promise.catch(() => cache.delete(report.file));
  }
  return cache.get(report.file);
}

function card(r) {
  return `<article class="report-card${r.kind === 'Companion copy' ? ' copy' : ''} reveal"><p class="report-tag">${esc(r.kind)}</p><h3><a href="${reportHref(r.id)}">${esc(r.title)}</a></h3><p class="report-desc">${esc(r.subtitle)}</p><div class="card-bottom"><span>${esc(r.time)} SGT · ${r.pages} source pages</span><span aria-hidden="true">↗</span></div></article>`;
}
$('#day1-cards').innerHTML = reports.filter(r => r.day === 1).map(card).join('');
$('#day2-cards').innerHTML = reports.filter(r => r.day === 2).map(card).join('');
$('#source-index').innerHTML = reports.map((r, i) => `<div class="source-record"><a href="${reportHref(r.id)}">${String(i + 1).padStart(2,'0')} · ${esc(r.title)}</a><code>${esc(r.source)}</code><p>${dayLabel(r)} · ${r.pages} source pages · Full text available.</p>${r.note ? `<p>${esc(r.note)}</p>` : ''}</div>`).join('');

function renderProgramme() {
  $('#programme-list').innerHTML = [1,2].filter(d => dayFilter === 'all' || dayFilter === String(d)).map(d => `<div class="programme-day"><h3>${d === 1 ? 'Tuesday, 27 October' : 'Wednesday, 28 October'} <span class="small">/ Day ${d}</span></h3>${programme.filter(p => p.day === d).map(p => p.type === 'break' ? `<div class="schedule-break"><span class="time">${esc(p.time)}</span><span>${esc(p.title)}</span></div>` : `<details class="schedule-row"><summary><span class="time">${esc(p.time)}</span><span class="session-title">${esc(p.title)}</span></summary><div class="schedule-content">${(p.detail || '').split('\n').map(t => `<p>${esc(t)}</p>`).join('')}${(p.links || []).map(id => `<a class="report-link" href="${reportHref(id)}">${byId.get(id).kind === 'Companion copy' ? 'View companion upload' : 'Read full report'} ↗</a>`).join('')}</div></details>`).join('')}</div>`).join('');
  $('#expand-programme').textContent = 'Expand all sessions';
}
renderProgramme();
document.querySelectorAll('[data-programme]').forEach(b => b.addEventListener('click', () => {
  dayFilter = b.dataset.programme;
  document.querySelectorAll('[data-programme]').forEach(x => { const active = x === b; x.classList.toggle('active', active); x.setAttribute('aria-pressed', String(active)); });
  renderProgramme();
}));
$('#expand-programme').addEventListener('click', () => {
  const rows = [...document.querySelectorAll('.schedule-row')];
  const expand = rows.some(r => !r.open);
  rows.forEach(r => { r.open = expand; });
  $('#expand-programme').textContent = expand ? 'Collapse all sessions' : 'Expand all sessions';
});

function normalize(text) { return text.normalize('NFKC').toLowerCase(); }
function renderArchive() {
  const query = $('#search').value.trim();
  const needle = normalize(query);
  const filtered = reports.filter(r => {
    const category = filter === 'all' || (filter === 'saved' ? saved.has(r.id) : String(r.day) === filter);
    return category && (!needle || normalize(`${r.title} ${r.subtitle} ${r.speakers} ${r.kind} ${r.time} ${texts.get(r.file) || ''}`).includes(needle));
  });
  $('#clear-search').hidden = !query;
  $('#empty-state').hidden = filtered.length !== 0;
  $('#archive-list').innerHTML = filtered.map(r => {
    let excerpt = '';
    if (needle && texts.has(r.file)) {
      const raw = texts.get(r.file).replace(/[#>|]/g,'').replace(/\s+/g,' ');
      const pos = normalize(raw).indexOf(needle);
      if (pos >= 0) excerpt = `${pos > 70 ? '…' : ''}${raw.slice(Math.max(0,pos-70),pos+160)}…`;
    }
    return `<a href="${reportHref(r.id)}" class="archive-item"><span class="item-info">${dayLabel(r)}<br>${esc(r.kind)}${saved.has(r.id) ? '<br>Saved on this device' : ''}</span><div><h3>${esc(r.title)}</h3><p>${esc(r.speakers)}</p>${excerpt ? `<p class="snippet">${esc(excerpt)}</p>` : ''}</div><span class="arrow" aria-hidden="true">↗</span></a>`;
  }).join('');
  const unavailable = new Set(reports.filter(r => !texts.has(r.file)).map(r => r.file)).size;
  $('#search-status').textContent = `${filtered.length} of ${reports.length} report entries${query ? ` matching “${query}”` : ''}.${loadingIndex ? ' Indexing full text…' : unavailable ? ` ${unavailable} distinct texts could not be loaded; results currently include titles and available text.` : ' Full-text search is ready.'}`;
  if (!loadingIndex && unavailable) {
    const retry = document.createElement('button'); retry.className = 'quiet-button'; retry.textContent = 'Retry loading'; retry.addEventListener('click', indexReports); $('#search-status').append(' ',retry);
  }
}
async function indexReports() {
  if (loadingIndex) return;
  loadingIndex = true; renderArchive();
  await Promise.allSettled(reports.map(loadReport));
  loadingIndex = false; renderArchive();
}
$('#search').addEventListener('input', renderArchive);
$('#clear-search').addEventListener('click', () => { $('#search').value = ''; renderArchive(); $('#search').focus(); });
document.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => {
  filter = b.dataset.filter;
  document.querySelectorAll('[data-filter]').forEach(x => { const active = x === b; x.classList.toggle('active', active); x.setAttribute('aria-pressed', String(active)); }); renderArchive();
}));
$('#reset-search').addEventListener('click', () => { $('#search').value = ''; document.querySelector('[data-filter="all"]').click(); $('#search').focus(); });

// All source content is escaped before formatting. Headings do not require a blank line.
function markdown(text) {
  const headings = [];
  let section = 0;
  const blocks = text.trim().replace(/^(#{1,3} [^\n]+)\n(?!\n)/gm, '$1\n\n').split(/\n\s*\n/);
  const html = blocks.map(block => {
    const match = block.match(/^(#{1,3}) (.*)$/);
    if (match) {
      const level = match[1].length, title = match[2];
      const id = `report-section-${++section}`;
      if (level === 2) headings.push({id, title});
      return `<${level === 3 ? 'h4' : 'h3'} id="${id}"${level === 1 ? ' class="document-title"' : ''}>${esc(title)}</${level === 3 ? 'h4' : 'h3'}>`;
    }
    if (block.startsWith('|')) {
      const rows = block.split('\n').filter(l => !/^\|[\s:|-]+\|$/.test(l)).map(l => l.trim().replace(/^\||\|$/g,'').split('|').map(v => v.trim()));
      const header = rows.shift() || [];
      return `<div class="table-wrap" role="region" tabindex="0" aria-label="Report comparison table; scroll horizontally if needed"><table><thead><tr>${header.map(c => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    }
    if (block.startsWith('>')) {
      const lines = block.split('\n').map(l => l.replace(/^>\s?/,''));
      const attribution = lines.length > 1 ? lines.pop() : '';
      return `<blockquote><p>${esc(lines.join(' '))}</p>${attribution ? `<footer>${esc(attribution)}</footer>` : ''}</blockquote>`;
    }
    if (block.startsWith('- ')) return `<ul>${block.split('\n').map(l => `<li>${esc(l.replace(/^- /,''))}</li>`).join('')}</ul>`;
    return `<p>${esc(block.replace(/\n/g,' '))}</p>`;
  }).join('\n');
  return {html, headings};
}

// Native disclosure keeps the full contents accessible on small screens, too.
const tocDisclosure = document.createElement('details');
tocDisclosure.className = 'reader-contents';
tocDisclosure.open = innerWidth > 800;
const tocSummary = document.createElement('summary');
tocSummary.textContent = 'Jump to a section';
tocSummary.style.cssText = 'font-size:12px;padding:12px 0;min-height:44px;';
const toc = $('#reader-toc');
toc.before(tocDisclosure); tocDisclosure.append(tocSummary,toc);
toc.style.display = 'grid';
const dialog = $('#reader');
function announce(message) { clearTimeout(statusTimer); $('#reader-status').textContent = message; statusTimer = setTimeout(() => { $('#reader-status').textContent = ''; }, 3500); }
function updateSave() {
  const isSaved = currentReport && saved.has(currentReport.id);
  $('#save-report').textContent = isSaved ? 'Saved ✓' : 'Save';
  $('#save-report').setAttribute('aria-pressed', String(!!isSaved));
}
function readerProgress() {
  const el = $('#reader-scroll'); const max = el.scrollHeight - el.clientHeight;
  $('#reading-progress').style.transform = `scaleX(${max > 0 ? Math.min(1,el.scrollTop/max) : 0})`;
}
async function openReport(id) {
  const report = byId.get(id);
  if (!report) { history.replaceState(null,'','#archive'); closeDialog(); return; }
  const token = ++requestId;
  currentReport = report;
  if (!dialog.open) { document.body.classList.add('reading'); dialog.showModal(); }
  tocDisclosure.open = innerWidth > 800;
  document.title = `${report.title} — LAS Conference 2026`;
  $('#reader-title').textContent = report.title;
  $('#reader-meta').textContent = `${dayLabel(report)} · ${report.time}${report.day ? ' SGT' : ''} · ${report.kind}`;
  $('#reader-speakers').textContent = report.speakers;
  $('#reader-source').innerHTML = `<code>${esc(report.source)}</code><p>${report.pages} source pages. Complete text reformatted for web reading; original PDF typography and running page furniture are not reproduced. Tables and diagram labels are retained as readable content.</p>${report.note ? `<p><strong>Editorial note:</strong> ${esc(report.note)}</p>` : '<p>Statements, figures and quotations follow the supplied conference report; they are not independent fact checks.</p>'}`;
  $('#reader-provenance').open = !!report.note;
  $('#download-report').href = `reports/${report.file}.md`;
  $('#download-report').download = `${report.file}-LAS-2026.md`;
  $('#report-content').innerHTML = '<p role="status">Loading the complete report…</p>';
  $('#report-content').setAttribute('aria-busy','true');
  $('#reader-toc').replaceChildren(); $('#reader-next').replaceChildren();
  $('#reader-scroll').scrollTo({top:0,behavior:'instant'}); readerProgress(); updateSave();
  $('#reader-title').focus({preventScroll:true});
  try {
    const text = await loadReport(report);
    if (token !== requestId || !dialog.open) return;
    const result = markdown(text);
    $('#report-content').innerHTML = result.html;
    $('#reader-toc').innerHTML = result.headings.map(h => `<button data-scroll="${h.id}">${esc(h.title)}</button>`).join('');
    $('#reader-toc').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
      if (innerWidth <= 800) tocDisclosure.open = false;
      document.getElementById(b.dataset.scroll).scrollIntoView({behavior: motionOff ? 'instant' : 'smooth',block:'start'});
    }));
    const position = reports.indexOf(report);
    $('#reader-next').innerHTML = `${position > 0 ? `<a href="${reportHref(reports[position-1].id)}">← Previous report<br>${esc(reports[position-1].title)}</a>` : '<span></span>'}${position < reports.length-1 ? `<a href="${reportHref(reports[position+1].id)}">Next report →<br>${esc(reports[position+1].title)}</a>` : '<a href="#archive" data-return>Return to the report library →</a>'}`;
  } catch {
    if (token !== requestId) return;
    $('#report-content').innerHTML = '<div class="reader-error"><h3>We couldn’t load this report.</h3><p>Your place is safe. Check your connection and try again, or return to the conference.</p><button class="button dark-button" id="retry-report">Try again</button></div>';
    $('#retry-report').addEventListener('click', () => openReport(report.id));
  } finally { if (token === requestId) { $('#report-content').setAttribute('aria-busy','false'); readerProgress(); } }
}
function closeDialog() {
  ++requestId;
  if (dialog.open) dialog.close();
  document.body.classList.remove('reading');
  document.title = 'Libraries for Tomorrow — LAS Conference 2026';
  currentReport = null;
  if (opener && opener.isConnected) opener.focus({preventScroll:true});
  else $('#search').focus({preventScroll:true});
}
function returnToConference() {
  history.pushState(null,'',returnHash);
  closeDialog();
  requestAnimationFrame(() => { if (returnScroll !== null) window.scrollTo({top:returnScroll,behavior:'instant'}); else $('#archive').scrollIntoView(); });
}
function route() {
  if (location.hash.startsWith('#read/')) {
    let id; try { id = decodeURIComponent(location.hash.slice(6)); } catch { id = ''; }
    openReport(id);
  } else if (dialog.open) closeDialog();
}
document.addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  const href = link.getAttribute('href');
  if (href?.startsWith('#read/')) {
    event.preventDefault();
    if (!dialog.open) { returnHash = location.hash && !location.hash.startsWith('#read/') ? location.hash : '#archive'; returnScroll = scrollY; opener = link; }
    history.pushState(null,'',href); route();
  } else if (link.hasAttribute('data-return')) { event.preventDefault(); returnHash = '#archive'; returnScroll = null; returnToConference(); }
});
window.addEventListener('hashchange', route);
window.addEventListener('popstate', route);
$('#close-reader').addEventListener('click', returnToConference);
dialog.addEventListener('cancel', e => { e.preventDefault(); returnToConference(); });
$('#reader-scroll').addEventListener('scroll', readerProgress, {passive:true});
$('#save-report').addEventListener('click', () => {
  if (!currentReport) return;
  const id = currentReport.id;
  if (saved.has(id)) saved.delete(id); else saved.add(id);
  const persisted = store('las2026-saved',JSON.stringify([...saved]));
  updateSave(); renderArchive(); announce(persisted ? (saved.has(id) ? 'Saved for later on this device.' : 'Removed from saved reports.') : 'Updated for this visit. Browser storage is unavailable.');
});
function resizeReader(delta) {
  readerSize = Math.min(24,Math.max(16,readerSize+delta));
  document.documentElement.style.setProperty('--reading-size',`${readerSize}px`);
  $('#font-smaller').disabled = readerSize === 16; $('#font-larger').disabled = readerSize === 24;
  announce(`Report text size: ${readerSize} pixels.`); readerProgress();
}
$('#font-smaller').addEventListener('click', () => resizeReader(-1));
$('#font-larger').addEventListener('click', () => resizeReader(1));
$('#print-report').addEventListener('click', () => window.print());
document.addEventListener('keydown', e => {
  if (e.key === '/' && !dialog.open && !e.ctrlKey && !e.metaKey && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) { e.preventDefault(); $('#archive').scrollIntoView({behavior:'instant'}); $('#search').focus({preventScroll:true}); }
});

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motionOff = stored('las2026-motion','') === 'off' || reducedMotion.matches;
function setMotion(off) {
  motionOff = off;
  document.documentElement.classList.toggle('no-motion',off);
  document.body.classList.toggle('js-motion',!off);
  $('#motion-toggle').textContent = `Motion: ${off ? 'off' : 'on'}`;
  $('#motion-toggle').setAttribute('aria-pressed',String(off));
  $('#motion-toggle').title = off ? 'Enable decorative motion' : 'Turn off decorative motion';
}
$('#motion-toggle').addEventListener('click', () => { setMotion(!motionOff); store('las2026-motion',motionOff ? 'off' : 'on'); });
reducedMotion.addEventListener('change', e => { if (e.matches) setMotion(true); });
setMotion(motionOff);
const lines = [];
for (let i=0;i<53;i++) {
  const t=i/52;
  const x=150+t*245, y=85+t*70;
  lines.push(`<path d="M ${300+t*22} 560 C ${70+t*55} ${460-t*75}, ${80+t*24} ${175+t*35}, ${x} ${y} C ${440+t*62} ${-10+t*90}, ${555-t*2} ${280+t*55}, ${330+t*1} 560" stroke="url(#pageInk)" stroke-opacity="${.24+Math.sin(t*Math.PI)*.6}" stroke-width="${i%7 === 0 ? 1.3 : .7}"/>`);
}
$('#folio-lines').innerHTML = lines.join('');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),{threshold:.08});
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  const activeObserver = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) document.querySelectorAll('.topbar nav a').forEach(a => a.classList.toggle('active',a.getAttribute('href') === `#${e.target.id}`)); }),{rootMargin:'-20% 0px -60% 0px'});
  document.querySelectorAll('main section[id]').forEach(el => activeObserver.observe(el));
} else document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
let ticking = false;
function pageScroll() {
  const max = document.documentElement.scrollHeight - innerHeight;
  $('#page-progress').style.transform = `scaleX(${max > 0 ? Math.min(1,scrollY/max) : 0})`;
  if (!motionOff && scrollY < innerHeight*1.3 && innerWidth > 560) $('.folio').style.transform = `translateY(${scrollY*.1}px) rotate(${scrollY*.004}deg)`;
  ticking = false;
}
window.addEventListener('scroll', () => { if(!ticking) { requestAnimationFrame(pageScroll); ticking=true; } },{passive:true});
window.addEventListener('resize', () => { pageScroll(); readerProgress(); });
pageScroll();
indexReports();
route();

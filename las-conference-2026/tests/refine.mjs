import {readFile,writeFile} from 'node:fs/promises';
import {reports,programme} from '../data.js';
// Idempotent migration: source fidelity, accessible reading and verified official schedule.
async function refine(file,transform){const original=await readFile(file,'utf8');const revised=transform(original);if(revised!==original)await writeFile(file,revised);}
await refine('reports/technology-panel.md',s=>s.replace('qualify inspiration and serendipitous discovery within the AI box.','qualify inspiration and serendipity within the AI box.'));
await refine('styles.css',s=>{s=s.replace('color:#9caa8c;letter-spacing:-10px','color:#6a7d5d;letter-spacing:-10px');return s.includes('.prose{max-width:72ch;')?s:s.replace('.prose{font-size:','.prose{max-width:72ch;font-size:');});
await refine('app.js',s=>{s=s.replace("$('#reader-scroll').scrollTop = 0;", "$('#reader-scroll').scrollTo({top:0,behavior:'instant'});");if(!s.includes("else $('#search').focus({preventScroll:true});"))s=s.replace("if (opener && opener.isConnected) opener.focus({preventScroll:true});", "if (opener && opener.isConnected) opener.focus({preventScroll:true});\n  else $('#search').focus({preventScroll:true});");return s;});
await refine('tests/verify.mjs',s=>s.replace("await page.emulateMedia({reducedMotion:'reduce'}); assert.equal", "await page.emulateMedia({reducedMotion:'reduce'}); await page.waitForFunction(()=>document.querySelector('#motion-toggle').textContent==='Motion: off'); assert.equal").replace('await page.evaluate(()=>scrollTo(0,0))', "await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}))").replace("evaluate(e=>e.scrollTop=0)", "evaluate(e=>e.scrollTo({top:0,behavior:'instant'}))").replace('programme.filter(p=>p.day===2).length,11','programme.filter(p=>p.day===2).length,12').replace('text:clean}',"text:clean.match(/Programme\\s*\\n([\\s\\S]*?)Conference Speakers/)?.[1] || 'Programme section could not be isolated.'}"));
const d2=programme.filter(p=>p.day===2);
d2.find(p=>p.title==='Registration').time='08:30 – 09:15';
const teas=d2.filter(p=>p.title==='Tea Break');teas[0].time='10:15 – 10:45';teas[1].time='15:00 – 15:30';
d2.find(p=>p.title==='Lunch').time='12:00 – 13:30';
d2.find(p=>p.title==='Report on Facilitated Table Discussion on IFLA Trend Report').time='14:45 – 15:00';
d2.find(p=>p.title==='End of Conference').time='17:00';
const technical=d2.find(p=>p.title==='Future of Technology — Paper Sessions I & II');
if(!technical.detail.startsWith('Theatre: '))technical.detail='Theatre: '+technical.detail;
technical.detail=technical.detail.replace('\nLibrary-Without-Reshelving','\nAtrium: Library-Without-Reshelving').replace('\nAtrium report: User-first','\nUser-first').replace('Time from the Atrium report.','Scheduled time and room assignments confirmed against the official programme.');
const professional=d2.find(p=>p.title==='Future of Librarianship — Paper Sessions I & II');
professional.detail=professional.detail.replace('Other concurrent papers: The Art','Atrium: The Art').replace('Time from the Theatre report.','Scheduled time and room assignments confirmed against the official programme.');
const closingIndex=programme.findIndex(p=>p.day===2&&p.title==='Closing remarks, poster awards & group photographs');
if(closingIndex>=0)programme.splice(closingIndex,1,
 {day:2,time:'16:30 – 16:35',title:'Closing remarks',detail:'Ian Yap — Conference Chair and Vice President, Library Association of Singapore. The official programme schedules the address before the awards; the supplied combined closing report describes awards before the address. That source distinction is preserved.',links:['closing']},
 {day:2,time:'16:35 – 17:00',title:'Presentation of poster awards and group photographs',detail:'The closing report names Jessie Tan (NIE) as 1st Prize winner, Lim Ting Soon (NLB) as 2nd Prize winner and Muhammad Kurniawan (NLB) as 3rd Prize winner. The official poster competition announces First Place: $1,000; Second Place: $500; Third Place: $250. The full closing report covers both final programme slots.',links:['closing']});
await writeFile('data.js',`export const reports = ${JSON.stringify(reports,null,2)};\n\nexport const programme = ${JSON.stringify(programme,null,2)};\n`);
await refine('index.html',s=>s.replace('Day 1 times follow the official programme. Day 2 times use the supplied reports where the retrieved programme omits times.','All scheduled times and concurrent rooms have been checked against the official LAS programme. Supplied reports are linked to their corresponding sessions.'));
try { const p='verification/official-programme.json';const original=JSON.parse(await readFile(p,'utf8'));const match=original.text.match(/Programme\s*\n([\s\S]*?)Conference Speakers/);if(match){original.text=match[1];await writeFile(p,JSON.stringify(original,null,2));} }catch{}

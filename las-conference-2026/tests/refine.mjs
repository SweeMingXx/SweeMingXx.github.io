import {readFile,writeFile} from 'node:fs/promises';
// Idempotent source-audit correction and WCAG large-text contrast refinement.
const report='reports/technology-panel.md';
const original=await readFile(report,'utf8');
const corrected=original.replace('qualify inspiration and serendipitous discovery within the AI box.','qualify inspiration and serendipity within the AI box.');
if(corrected!==original) await writeFile(report,corrected);
const file='styles.css';
const css=await readFile(file,'utf8');
const accessible=css.replace('color:#9caa8c;letter-spacing:-10px','color:#6a7d5d;letter-spacing:-10px');
if(accessible!==css) await writeFile(file,accessible);

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

await mkdir('results', { recursive: true });
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
new Function(html.split('<script>')[1].split('</script>')[0]);
const server = createServer((req, res) => { res.setHeader('Content-Type', 'text/html'); res.end(html); });
await new Promise(resolve => server.listen(8765, '127.0.0.1', resolve));
const browser = await chromium.launch();
const passed = [];
const test = async (name, fn) => { await fn(); passed.push(name); console.log('PASS: ' + name); };
const errors = [];
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
// Deterministic simulation: drive fixed steps directly instead of wall-clock animation.
await context.addInitScript(() => { window.requestAnimationFrame = () => 1; });
const page = await context.newPage();
page.on('pageerror', e => errors.push(e.message));
const run = code => page.evaluate(code);
try {
  await page.goto('http://127.0.0.1:8765');
  await test('Initial render and desktop layout', async () => {
    await run('draw(performance.now())');
    assert.equal(await page.title(), 'WEB//WING — Rooftop Rush');
    assert.equal(await run('state'), 'ready');
    assert.equal(await run('document.documentElement.scrollWidth <= innerWidth'), true);
    await page.screenshot({ path: 'results/desktop.png', fullPage: true });
  });
  await test('Start, flap, pause and resume from keyboard', async () => {
    await page.click('#start-button');
    assert.equal(await run('state'), 'playing');
    await page.keyboard.press('Space');
    assert.equal(await run('player.vy'), -385);
    await page.keyboard.press('p');
    assert.equal(await run('state'), 'paused');
    const y = await run('player.y');
    await run('step(1/120)');
    assert.equal(await run('player.y'), y);
    await page.keyboard.press('p');
    assert.equal(await run('state'), 'playing');
    assert.equal(await page.locator('[data-mode="rookie"]').isDisabled(), true);
  });
  await test('Gate scoring and best score persistence', async () => {
    await run('player.y=280;player.vy=0;obstacles=[{x:player.x-92,w:76,center:280,gap:184,passed:false,collected:true,safe:false}];step(1/120)');
    assert.equal(await run('score'), 1);
    assert.equal(await run('save.best.hero'), 1);
    assert.equal(await run('JSON.parse(localStorage.getItem(KEY)).best.hero'), 1);
  });
  await test('Sparks collect once and unlock a suit', async () => {
    await run('save.sparks=14;player.y=280;player.vy=0;obstacles=[{x:player.x-38,w:76,center:280,gap:184,passed:false,collected:false,shield:false,safe:false}];step(1/120);step(1/120)');
    assert.equal(await run('save.sparks'), 15);
    assert.equal(await run('coins'), 1);
    await page.click('#suits-button');
    assert.equal(await run('state'), 'paused');
    assert.equal(await page.locator('.suit-option').nth(1).isEnabled(), true);
    assert.equal(await page.locator('.suit-option').nth(2).isDisabled(), true);
    await page.locator('.suit-option').nth(1).click();
    assert.equal(await run('save.suit'), 'noir');
    await page.locator('#suits-dialog .close').click();
    await page.click('#resume-button');
  });
  await test('Shield pickup, protection and expiration', async () => {
    await run('player.y=280;player.vy=0;obstacles=[{x:player.x-38,w:76,center:280,gap:184,passed:false,collected:false,shield:true,safe:false}];step(1/120)');
    assert.equal(await run('shield'), 5);
    await run('player.y=obstacles[0].center-obstacles[0].gap/2-5;step(1/120)');
    assert.equal(await run('state'), 'playing');
    assert.equal(await run('shield'), 0);
    assert.equal(await run('obstacles[0].safe'), true);
    await run('shield=.001;player.y=280;player.vy=0;obstacles=[];step(1/120)');
    assert.equal(await run('shield'), 0);
  });
  await test('Collision ends run; retry resets state', async () => {
    await run('shield=0;player.y=H;step(1/120)');
    assert.equal(await run('state'), 'over');
    assert.equal(await page.locator('#retry-button').isVisible(), true);
    assert.equal(await run('save.runs'), 1);
    await page.click('[data-mode="rookie"]');
    assert.equal(await run('mode'), 'rookie');
    await page.click('#retry-button');
    assert.equal(await run('score'), 0);
    assert.equal(await run('coins'), 0);
    assert.equal(await run('state'), 'playing');
  });
  await test('Help pauses without resuming on modal close', async () => {
    await page.click('#help-button');
    assert.equal(await run('state'), 'paused');
    await page.keyboard.press('Escape');
    assert.equal(await run('state'), 'paused');
    await page.click('#resume-button');
    assert.equal(await run('state'), 'playing');
    await run('dispatchEvent(new Event("blur"))');
    assert.equal(await run('state'), 'paused');
  });
  await test('Settings and progression survive reload', async () => {
    await run('save.reduced=true;save.sound=true;persist()');
    await page.reload();
    assert.equal(await run('save.suit'), 'noir');
    assert.equal(await run('save.sparks'), 16);
    assert.equal(await run('save.best.hero'), 1);
    assert.equal(await run('save.reduced'), true);
    assert.equal(await run('save.sound'), true);
    assert.equal(await run('mode'), 'rookie');
  });
  await test('All modes can clear a sustained run', async () => {
    for (const m of ['rookie', 'hero', 'legend']) {
      const result = await run(`(() => {state='ready';setMode('${m}');start();for(let i=0;i<12000&&state==='playing'&&score<15;i++){const next=obstacles.find(o=>o.x+o.w>player.x-13);const target=next?next.center:280;if(player.y>target+10&&player.vy>0)flap();step(1/120);}return {state,score};})()`);
      assert.equal(result.state, 'playing', JSON.stringify({ mode: m, ...result }));
      assert.ok(result.score >= 15, JSON.stringify(result));
    }
    await run('draw(performance.now());pause()');
    await page.screenshot({ path: 'results/paused.png', fullPage: true });
  });
  await test('Mobile viewport, touch and resize pause', async () => {
    const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    await mobile.addInitScript(() => { window.requestAnimationFrame = () => 1; });
    const p = await mobile.newPage();
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('http://127.0.0.1:8765');
    await p.evaluate('draw(performance.now())');
    assert.equal(await p.evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    await p.screenshot({ path: 'results/mobile.png', fullPage: true });
    await p.locator('#start-button').tap();
    await p.locator('#game').tap({ position: { x: 120, y: 250 } });
    assert.equal(await p.evaluate('player.vy'), -385);
    await p.setViewportSize({ width: 844, height: 390 });
    await p.waitForTimeout(100);
    assert.equal(await p.evaluate('state'), 'paused');
    await mobile.close();
  });
  await test('Storage blocked: playable fallback', async () => {
    const c = await browser.newContext();
    await c.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('Blocked', 'SecurityError'); } }); });
    const p = await c.newPage();
    p.on('pageerror', e => errors.push(e.message));
    await p.goto('http://127.0.0.1:8765');
    await p.click('#start-button');
    assert.equal(await p.evaluate('state'), 'playing');
    await c.close();
  });
  await test('No browser JavaScript errors', async () => assert.deepEqual(errors, []));
  await test('Live GitHub Pages responds and game starts', async () => {
    const live = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    live.on('pageerror', e => errors.push(e.message));
    let response;
    for (let i = 0; i < 12; i++) {
      response = await live.goto('https://sweemingxx.github.io/webwing/?check=' + Date.now(), { waitUntil: 'networkidle' });
      if (response.status() === 200 && (await live.title()).includes('WEB//WING')) break;
      await live.waitForTimeout(10000);
    }
    assert.equal(response.status(), 200);
    assert.equal(await live.title(), 'WEB//WING — Rooftop Rush');
    await live.screenshot({ path: 'results/live.png', fullPage: true });
    await live.click('#start-button');
    assert.equal(await live.evaluate('state'), 'playing');
    await live.keyboard.press('Space');
    await live.keyboard.press('p');
    assert.equal(await live.evaluate('state'), 'paused');
    assert.deepEqual(errors, []);
    await live.close();
  });
} finally {
  await writeFile('results/report.json', JSON.stringify({ passed, errors }, null, 2));
  console.log(JSON.stringify({ passed, errors }, null, 2));
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

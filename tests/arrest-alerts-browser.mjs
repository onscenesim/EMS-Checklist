import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  window.alertTones=[];window.audioClosed=0;
  const parameter=()=>({setValueAtTime(){},exponentialRampToValueAtTime(){}});
  window.AudioContext=class {state='suspended';currentTime=0;destination={};async resume(){this.state='running'}async close(){window.audioClosed++}createGain(){return {gain:parameter(),connect(){}}}createOscillator(){return {frequency:{setValueAtTime(hz){window.alertTones.push(hz)}},connect(){},start(){},stop(){}}}};
 });
 await page.clock.install({time:new Date('2026-10-11T01:00:00-04:00')});
 await page.goto('http://127.0.0.1:4173/#arrest');
 assert.equal(await page.locator('.pulse-digits').textContent(),'02:00');
 assert.equal(await page.locator('.pulse-panel').count(),1);
 await page.locator('[data-action="pulse-cycle"]').click();
 await page.locator('#epi-interval').selectOption('3');
 await page.locator('[data-action="epi-dose"]').click();
 await page.clock.fastForward(104_000);assert.equal(await page.locator('.pulse-digits').textContent(),'00:16');
 assert.equal(await page.evaluate(()=>window.alertTones.length),0);
 await page.clock.fastForward(1_000);assert.equal(await page.locator('.pulse-status').textContent(),'PRE-CHARGE DEFIB NOW');
 assert.equal(await page.locator('.pulse-panel.warning').count(),1);
 assert.equal(await page.evaluate(()=>window.alertTones.length),6);
 await page.locator('.nav-item[data-page="sick"]').click();assert.equal(await page.locator('.cardiac-arrest-box .pulse-digits').textContent(),'00:15');
 await page.clock.fastForward(15_000);assert.equal(await page.locator('.pulse-status').textContent(),'RHYTHM / PULSE CHECK DUE');
 assert.equal(await page.evaluate(()=>window.alertTones.length),12);
 await page.clock.fastForward(30_000);assert.equal(await page.locator('.epi-status').textContent(),'EPI DUE SOON · PREPARE NEXT DOSE');
 assert.deepEqual(await page.evaluate(()=>window.alertTones.slice(-3)),[130.81,130.81,130.81]);
 await page.reload();assert.equal(await page.locator('.epi-digits').textContent(),'00:30');
 await page.locator('.sick-arrest-panel > summary').click();
 await page.locator('[data-action="pulse-cycle"]').click();
 await page.clock.fastForward(1_000);assert.equal(await page.evaluate(()=>window.alertTones.length),0,'No duplicate warning on reload');
 await page.clock.fastForward(29_000);assert.equal(await page.locator('.epi-status').textContent(),'NEXT DOSE DUE');
 assert.equal(await page.evaluate(()=>window.alertTones.length),3);
 await page.clock.fastForward(10_000);assert.equal(await page.evaluate(()=>window.alertTones.length),3);
 await page.locator('[data-action="clear-pulse"]').click();assert.equal(await page.locator('.pulse-digits').textContent(),'02:00');
 await page.locator('[data-action="clear-epi"]').click();assert.equal(await page.locator('.epi-digits').textContent(),'03:00');
 await page.locator('[data-action="toggle-timer-sound"]').click();assert.equal(await page.locator('.timer-sound-status').textContent(),'Timer sounds muted');
 await page.locator('[data-action="pulse-cycle"]').click();await page.clock.fastForward(120_000);assert.equal(await page.evaluate(()=>window.alertTones.length),3);
 await page.locator('[data-action="test-epi-sound"]').click();assert.equal(await page.evaluate(()=>window.alertTones.length),6);
 await page.locator('[data-action="test-pulse-sound"]').click();assert.equal(await page.evaluate(()=>window.alertTones.length),12);
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1100});
  for(const id of ['arrest','sick','cardio']){await page.goto(`http://127.0.0.1:4173/#${id}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${id}: ${width}px overflow`);assert.ok(await page.getByText(/PRE-CHARGE DEFIB/).count()>0);}
  if(width===1440||width===390){await page.goto('http://127.0.0.1:4173/#arrest');await page.locator('.pulse-panel').screenshot({path:`/Users/Shared/EMS Checklist/tmp/pulse-timer-${width}.png`});}
 }
 await page.goto('http://127.0.0.1:4173/#arrest');await page.locator('[data-action="new"]').click();await page.locator('[data-action="confirm-new"]').click();
 await page.goto('http://127.0.0.1:4173/#arrest');assert.equal(await page.locator('.pulse-digits').textContent(),'02:00');assert.equal(await page.locator('.epi-digits').textContent(),'05:00');
 assert.equal(await page.locator('[data-action="clear-pulse"]').isDisabled(),true);
 assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('wfd-encounter-v1')).pulseDueAt),null);
 assert.deepEqual(errors,[]);
 // Real browser audio: confirm gesture unlocks the context and both sound tests execute.
 const real=await browser.newPage();await real.goto('http://127.0.0.1:4173/#arrest');await real.locator('[data-action="test-pulse-sound"]').click();await real.waitForFunction(()=>document.querySelector('.timer-sound-status').textContent.startsWith('Timer sounds ready'));await real.locator('[data-action="test-epi-sound"]').click();
 console.log('Passed: lead-time alerts, distinct generated tones, no duplicate alerts, shared timers, reload persistence, due hold, mute, sound tests, encounter reset and responsive layouts; real browser audio unlock.');
}finally{await browser.close();}

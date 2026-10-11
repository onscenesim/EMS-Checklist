import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-11T02:00:00-04:00')});
 for(const id of ['sick','arrest','intubation','trauma']){
  await page.goto(`http://127.0.0.1:4173/#${id}`);
  const readiness=id==='trauma'?'Turn main O2 AND cabin power on. Turn up the heat.':'Turn main O2 AND cabin power on';
  assert.equal(await page.locator('[data-check]').first().locator('..').innerText().then(s=>s.split('\n')[0]),readiness);
  assert.equal(await page.locator('.oxygen-priority').getByText(readiness,{exact:true}).count(),1);
  assert.equal(await page.getByText(/ventilator/i).count(),0);
  if(id!=='intubation')assert.match(await page.locator('.oxygen-priority').innerText(),/BEFORE THE CALL \/ EN ROUTE/);
 }
 await page.goto('http://127.0.0.1:4173/#sick');
 const panel=page.locator('.sick-arrest-panel');assert.equal(await panel.evaluate(el=>el.open),false);
 assert.equal(await panel.locator('[data-check]').count(),0);
 assert.equal(await page.getByText('Plan the move; keep suction and airway gear accessible',{exact:true}).count(),0);
 assert.equal(await page.getByText('Ensure airway is 100% secure and ETCO₂ is being watched',{exact:true}).count(),1);
 assert.equal(await page.getByText('Place the LUCAS backboard under the patient while they still have a pulse',{exact:true}).count(),1);
 await panel.locator('summary').click();assert.equal(await panel.locator('.arrest-priority-note').isVisible(),true);
 assert.ok(await panel.locator('a[href$="#page=83"]').count()>0);
 await panel.locator('[data-action="pulse-cycle"]').click();await panel.locator('[data-action="epi-dose"]').click();
 await panel.locator('summary').click();await page.clock.fastForward(45_000);assert.equal(await panel.evaluate(el=>el.open),false);
 await page.reload();assert.equal(await panel.evaluate(el=>el.open),false);
 await panel.locator('summary').click();assert.equal(await panel.locator('.pulse-digits').innerText(),'01:15');assert.equal(await panel.locator('.epi-digits').innerText(),'04:15');
 await page.locator('[data-check="sick-0-main-o2"]').check();assert.equal(await panel.evaluate(el=>el.open),true);
 await page.reload();assert.equal(await panel.evaluate(el=>el.open),true);assert.equal(await page.locator('[data-check="sick-0-main-o2"]').isChecked(),true);
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1000});
  for(const id of ['sick','arrest','intubation','trauma']){await page.goto(`http://127.0.0.1:4173/#${id}`);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${id}: ${width}px overflow`);assert.equal(await page.locator('[data-check]').evaluateAll(els=>new Set(els.map(el=>el.dataset.check)).size===els.length),true);}
  if(width===1440||width===390){await page.goto('http://127.0.0.1:4173/#trauma');await page.locator('.oxygen-priority').screenshot({path:`/Users/Shared/EMS Checklist/tmp/trauma-readiness-${width}.png`});await page.goto('http://127.0.0.1:4173/#sick');await page.locator('.oxygen-priority').screenshot({path:`/Users/Shared/EMS Checklist/tmp/main-o2-${width}.png`});await panel.screenshot({path:`/Users/Shared/EMS Checklist/tmp/sick-arrest-directions-${width}.png`});}
 }
 await page.goto('http://127.0.0.1:4173/#sick');await page.locator('[data-action="new"]').click();await page.locator('[data-action="confirm-new"]').click();await page.goto('http://127.0.0.1:4173/#sick');assert.equal(await panel.evaluate(el=>el.open),false);assert.equal(await page.locator('[data-check="sick-0-main-o2"]').isChecked(),false);
 // Inserting O2 preserves the existing intubation preparation checklist identifiers.
 await page.evaluate(()=>sessionStorage.setItem('wfd-encounter-v1',JSON.stringify({checks:{'intubation-0-4':true}})));
 await page.goto('http://127.0.0.1:4173/#intubation');await page.reload();assert.equal(await page.locator('[data-check="intubation-0-4"]').isChecked(),true);assert.equal(await page.locator('[data-check="intubation-0-main-o2"]').isChecked(),false);
 assert.deepEqual(errors,[]);console.log('Passed: O2 priorities, updated airway/LUCAS text, ventilator removal, directions without checkboxes, collapse persistence, timers while collapsed, new encounter reset, preserved intubation progress, desktop and mobile layouts.');
}finally{await browser.close();}

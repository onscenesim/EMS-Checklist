import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/#trauma');const panel=page.locator('.trauma-arrest-panel');
 assert.equal(await panel.count(),1);assert.equal(await panel.evaluate(el=>el.open),false);
 assert.equal(await panel.locator('input').count(),0);
 await panel.locator('summary').click();assert.equal(await panel.evaluate(el=>el.open),true);
 const traumaMarkup=await panel.locator('.trauma-arrest-content').innerHTML();
 assert.equal(await panel.locator('[data-trauma-priority]').count(),4);
 for(const phrase of ['bilateral needle decompression','adult NS 1 L; pediatric NS 20 mL/kg','PEA >40 bpm','PEA <40 bpm','known pregnancy >24 weeks','does not recommend routine epi / atropine','TXA is not beneficial','Do not initiate post-ROSC cooling'])assert.ok((await panel.innerText()).includes(phrase),phrase);
 assert.equal(await panel.locator('a[href$="#page=148"]').count(),2);assert.equal(await panel.locator('a[href$="#page=149"]').count(),1);
 // Opening one mirror opens the other; all content is exactly identical.
 await page.locator('.nav-item[data-page="arrest"]').click();assert.equal(await panel.evaluate(el=>el.open),true);assert.equal(await panel.locator('.trauma-arrest-content').innerHTML(),traumaMarkup);
 assert.equal(await panel.evaluate(el=>el===el.parentElement.lastElementChild),true,'Cardiac arrest mirror sits at bottom');
 await panel.locator('summary').click();await page.locator('.nav-item[data-page="trauma"]').click();assert.equal(await panel.evaluate(el=>el.open),false);
 await page.reload();assert.equal(await panel.evaluate(el=>el.open),false);
 await panel.locator('summary').focus();await page.keyboard.press('Enter');assert.equal(await panel.evaluate(el=>el.open),true);
 await page.locator('[data-check="trauma-0-bleeding"]').check();assert.equal(await panel.evaluate(el=>el.open),true);await page.reload();assert.equal(await panel.evaluate(el=>el.open),true);
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:1100});
  for(const id of ['trauma','arrest']){await page.goto(`http://127.0.0.1:4173/#${id}`);assert.equal(await panel.evaluate(el=>el.open),true);assert.equal(await panel.locator('.trauma-arrest-content').innerHTML(),traumaMarkup);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${id} ${width}px overflow`);}
  if(width===1440||width===390)await panel.screenshot({path:`/Users/Shared/EMS Checklist/tmp/trauma-arrest-${width}.png`});
 }
 await page.locator('[data-action="new"]').click();await page.locator('[data-action="confirm-new"]').click();
 for(const id of ['trauma','arrest']){await page.goto(`http://127.0.0.1:4173/#${id}`);assert.equal(await panel.evaluate(el=>el.open),false);}
 assert.deepEqual(errors,[]);console.log('Passed: identical trauma-arrest content, shared expansion across navigation/reload, keyboard controls, preserved expansion on checklist changes, reset, protocol links and clinical criteria, responsive layouts.');
}finally{await browser.close();}

import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {modules} from '../dist/data.js';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 for(const m of modules){
  await page.goto(`http://127.0.0.1:4173/#${m.id}`);
  assert.equal(await page.locator('.priority-section').count(),m.sections.length);
  assert.equal(await page.locator('.priority-section h2').evaluateAll(els=>new Set(els.map(el=>getComputedStyle(el).color)).size),m.sections.length);
  assert.equal(await page.locator('.brand .crest img').evaluate(img=>img.complete&&img.naturalWidth>0),true);
  await page.locator('.check-control input').first().check();await page.reload();
  assert.equal(await page.locator('.check-control input').first().isChecked(),true);
  await page.setViewportSize({width:320,height:720});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${m.id} 320px overflow`);
  if(m.id==='intubation')await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/checklist-design-intubation-mobile.png',fullPage:true});
  await page.setViewportSize({width:1440,height:1000});
 }
 await page.goto('http://127.0.0.1:4173/#trauma');
 assert.equal(await page.locator('.ketamine-panel').getAttribute('open'),null);
 assert.equal(await page.locator('.pain-table').isVisible(),false);
 await page.locator('.ketamine-panel>summary').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('.pain-table').isVisible(),true);
 assert.equal(await page.locator('.burns-panel:not(.ketamine-panel)').getAttribute('open'),null);
 await page.reload();assert.equal(await page.locator('.pain-table').isVisible(),true);
 await page.locator('#shock-hr').fill('100');assert.equal(await page.locator('.pain-table').isVisible(),true);
 await page.locator('.burns-panel:not(.ketamine-panel)>summary').click();
 await page.reload();assert.equal(await page.locator('.burns-panel[open]').count(),2);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('.ketamine-panel').screenshot({path:'/Users/Shared/EMS Checklist/tmp/ketamine-green-mobile.png'});
 await page.locator('[data-action="new"]').click();await page.locator('[data-action="confirm-new"]').click();
 assert.equal(await page.locator('.burns-panel[open]').count(),0);
 await page.goto('http://127.0.0.1:4173/#post-call');
 assert.equal(await page.locator('.post-check[data-priority]').count(),6);
 assert.equal(await page.locator('.supply-group[data-priority]').count(),10);
 await page.getByRole('checkbox',{name:'Retrieve Equipment'}).check();await page.reload();
 assert.equal(await page.getByRole('checkbox',{name:'Retrieve Equipment'}).isChecked(),true);
 await page.setViewportSize({width:320,height:720});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/postcall-color-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4173/#intubation');
 await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/checklist-design-intubation-desktop.png',fullPage:true});
 assert.deepEqual(errors,[]);
 console.log('Design checks passed: crest asset, all checklist colors / progress, independent keyboard accordions, persistence / reset, and 320 / 390 px layouts.');
} finally {await browser.close();}

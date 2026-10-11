import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {weights,pediatricTubes,medications,igelForWeight} from '../dist/data.js';
import {criticalGroups,pediatricDose} from '../dist/pediatric-ui.js';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/#pediatric');
 for(let i=0;i<9;i++){
  await page.locator(`[data-age="${i}"]`).click();
  assert.equal(await page.locator('#adult-max').count(),0);
  assert.deepEqual(await page.locator('.energy-grid b').allTextContents(),[`${weights[i]*2} J`,`${Math.min(weights[i]*4,200)} J`,`${weights[i]*4>=200?200:Math.min(weights[i]*4,200)+'–'+Math.min(weights[i]*10,200)} J`]);
  assert.deepEqual(await page.locator('.airway-sizing b').allTextContents(),[`${pediatricTubes[i]} mm`,igelForWeight(weights[i]).map(s=>s.size).join(' / ')]);
  assert.equal(await page.locator('.critical-card').count(),8);
  assert.equal(await page.locator('.critical-dose').count(),14);
  for(const g of criticalGroups){const card=page.locator('.critical-card').filter({has:page.getByRole('heading',{name:g.title,exact:true})});for(let j=0;j<g.rows.length;j++){const d=pediatricDose(g.rows[j],i),value=await card.locator('.critical-value').nth(j).innerText();assert.ok(value.includes(d.status??`${d.amount} ${d.unit}`),`${g.title} ${i} ${value}`);}}
  assert.equal(await page.locator('.full-medication-reference').getAttribute('open'),null);
  assert.equal(await page.locator('.medication-panel').isVisible(),false);
 }
 await page.locator('.full-medication-reference>summary').click();assert.equal(await page.locator('.medication-panel').isVisible(),true);
 assert.equal(await page.locator('.medication-panel tbody tr').count(),35);
 await page.locator('#med-search').fill('amiodarone');assert.equal(await page.locator('.medication-panel tbody tr').count(),1);assert.equal(await page.locator('.critical-card').count(),8);
 await page.reload();assert.equal(await page.locator('.medication-panel').isVisible(),true);assert.equal(await page.locator('#med-search').inputValue(),'amiodarone');
 await page.locator('#med-search').fill('');await page.evaluate(()=>{const s=JSON.parse(sessionStorage.getItem('wfd-encounter-v1'));s.adultMax='360';sessionStorage.setItem('wfd-encounter-v1',JSON.stringify(s));});await page.reload();assert.deepEqual(await page.locator('.energy-grid b').allTextContents(),['100 J','200 J','200 J']);
 await page.locator('[data-action="new"]').click();await page.locator('[data-action="confirm-new"]').click();await page.goto('http://127.0.0.1:4173/#pediatric');await page.locator('[data-age="4"]').click();assert.equal(await page.locator('#adult-max').count(),0);
 await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/pediatric-critical-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/pediatric-critical-mobile.png',fullPage:true});
 await page.setViewportSize({width:320,height:720});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.goto('http://127.0.0.1:4173/#sedation');assert.equal(await page.locator('.protocol-links a[href$="#page=173"]').count(),1);
 await page.locator('#ref-age').fill('30');await page.locator('#ref-weight').fill('70');await page.locator('#ref-ideal').fill('60');
 await page.locator('[data-ref-open="sedation-ketamine"]>summary').click();assert.match(await page.locator('[data-recipe="ket-restraint-0"]').innerText(),/240 mg[\s\S]*4.8 mL/);assert.match(await page.locator('[data-recipe="ket-post-intubation-0"]').innerText(),/140 mg[\s\S]*2.8 mL/);
 await page.locator('[data-ref-open="sedation-midazolam"]>summary').click();await page.locator('#stock-midazolam').selectOption('5');assert.match(await page.locator('[data-recipe="versed-post-intubation-0"]').innerText(),/3.5 mg[\s\S]*0.7 mL/);
 await page.locator('#ref-age').fill('12');await page.locator('#ref-weight').fill('40');assert.match(await page.locator('[data-recipe="versed-restraint-ped-0"]').innerText(),/4 mg[\s\S]*0.8 mL/);assert.match(await page.locator('[data-recipe="versed-restraint-ped-1"]').innerText(),/8 mg[\s\S]*1.6 mL/);
 await page.reload();assert.equal(await page.locator('[data-ref-open="sedation-midazolam"]').getAttribute('open'),'');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/sedation-dosing-mobile.png',fullPage:true});
 await page.goto('http://127.0.0.1:4173/#cardio');assert.equal(await page.getByText('Recheck Sync before next shock',{exact:true}).count(),1);
 await page.goto('http://127.0.0.1:4173/#calculators');assert.equal(await page.locator('.calculator>.calculator-note>b').count(),5);assert.equal(await page.getByText('Optional: for adult ketamine dosing',{exact:true}).count(),1);
 await page.goto('http://127.0.0.1:4173/assets/woodlawn-fd-crest.svg');await page.setViewportSize({width:640,height:640});await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/woodlawn-logo-digitized.png'});
 assert.deepEqual(errors,[]);console.log('Pediatric / sedation checks passed: all age columns, critical doses, airway overlaps, table expansion / filtering, default / reset 200 J, sedation routes / stock / caps, SYNC note, and phone layouts.');
}finally{await browser.close();}

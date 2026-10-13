import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/');
 await page.locator('.module-card[data-page="pediatric-arrest"]').click();
 await page.getByRole('heading',{name:'Pediatric cardiac arrest',exact:true}).waitFor();
 assert.equal(await page.locator('.neonatal-code').getAttribute('open'),null);
 assert.equal(await page.locator('.arrest-drugs .critical-card').count(),4);
 await page.locator('[data-age="3"]').click();
 assert.match(await page.locator('[data-arrest-drug="Epinephrine · cardiac arrest"] .critical-value').innerText(),/0.15 mg\s*1.5 mL/);
 assert.match(await page.locator('[data-arrest-drug="Amiodarone · cardiac arrest"] .critical-value').innerText(),/75 mg\s*1.55 mL/);
 assert.match(await page.locator('.dose-discrepancy').innerText(),/1.5 mL/);
 assert.deepEqual(await page.locator('.leader-energy strong').allTextContents(),['30J','60J','60–150J']);
 await page.locator('#peds-arrest-weight').fill('17');
 assert.match(await page.locator('[data-arrest-drug="Epinephrine · cardiac arrest"] .critical-value').innerText(),/0.17 mg\s*1.7 mL/);
 assert.match(await page.locator('[data-arrest-drug="Amiodarone · cardiac arrest"] .critical-value').innerText(),/85 mg\s*1.7 mL/);
 assert.match(await page.locator('.leader-weight-status').innerText(),/17 kg · actual/);
 await page.locator('[data-age="5"]').click();assert.match(await page.locator('.leader-weight-status').innerText(),/17 kg · actual/);
 await page.locator('#peds-arrest-unit').selectOption('lb');await page.locator('#peds-arrest-weight').fill('22.0462262185');
 assert.match(await page.locator('.leader-weight-status').innerText(),/10 kg · actual/);
 await page.locator('#peds-arrest-unit').selectOption('kg');await page.locator('#peds-arrest-weight').fill('101');
 assert.match(await page.locator('[data-arrest-drug="Epinephrine · cardiac arrest"] .critical-value').innerText(),/1 mg\s*10 mL/);
 assert.match(await page.locator('[data-arrest-drug="Amiodarone · cardiac arrest"] .critical-value').innerText(),/300 mg\s*6 mL/);
 assert.deepEqual(await page.locator('.leader-energy strong').allTextContents(),['200J','200J','200J']);
 await page.locator('[data-shock-device="lifepak15"]').click();assert.deepEqual(await page.locator('.leader-energy strong').allTextContents(),['202J','360J','360J']);
 for(const value of ['0','-1','151']){await page.locator('#peds-arrest-weight').fill(value);assert.equal(await page.locator('.arrest-drugs .dose-unavailable').count(),4);assert.deepEqual(await page.locator('.leader-energy strong').allTextContents(),['—J','—J','—J']);}
 await page.locator('#peds-arrest-weight').fill('');await page.locator('[data-age="3"]').click();await page.locator('[data-shock-device="zenix"]').click();
 await page.locator('[data-leader-scroll="peds-code"]').click();assert.match(page.url(),/#pediatric-arrest$/);
 await page.locator('.neonatal-code>summary').click();assert.match(await page.locator('.neonatal-content').innerText(),/No neonatal epinephrine dose is calculated/);
 await page.locator('[data-action="pulse-cycle"]').click();await page.locator('[data-action="epi-dose"]').click();
 assert.equal(await page.locator('.epi-heading a').getAttribute('href'),'https://www.academyofmedicine.org/aws/AOMC/asset_manager/get_file/937559?ver=5#page=152');
 await page.reload();assert.equal(await page.locator('.neonatal-code').getAttribute('open'),'');
 assert.match(await page.locator('.pulse-status').innerText(),/CPR cycle/);
 await page.locator('.neonatal-code>summary').click();
 await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/pediatric-arrest-desktop.png',fullPage:true});
 await page.locator('.leader-related [data-page="birth"]').click();
 await page.getByRole('heading',{name:'Imminent birth',exact:true}).waitFor();
 assert.equal(await page.locator('.neonatal-code').getAttribute('open'),null);
 assert.equal(await page.locator('.birth-page .check-row:visible').count(),14);
 assert.equal(await page.locator('.birth-page h3,.birth-page .check-copy small,.birth-page p').count(),0);
 await page.locator('[data-check="birth-prepare-gestation"]').check();
 await page.locator('.neonatal-code>summary').click();assert.match(page.url(),/#birth$/);assert.equal(await page.locator('.neonatal-code').getAttribute('open'),'');
 assert.match(await page.locator('.birth-source-alert').innerText(),/confirm with medical control/);
 await page.reload();assert.equal(await page.locator('.neonatal-code').getAttribute('open'),'');
 assert.equal(await page.locator('[data-check="birth-prepare-gestation"]').isChecked(),true);
 await page.locator('#birth-eclampsia>summary').click();
 assert.equal(await page.locator('#birth-eclampsia a[href$="#page=218"]').count(),1);
 assert.match(await page.locator('#birth-eclampsia').innerText(),/4–6 g IV in 100 mL NS over 20–25 min/);
 assert.match(await page.locator('#birth-eclampsia').innerText(),/draw 8–12 mL/);
 await page.locator('#birth-eclampsia>summary').click();
 await page.locator('.neonatal-code>summary').click();await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/imminent-birth-desktop.png',fullPage:true});
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});
  for(const route of ['pediatric-arrest','birth']){
   await page.goto('http://127.0.0.1:4173/#'+route);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${route} ${width} collapsed overflow`);
   await page.locator('.neonatal-code>summary').click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${route} ${width} expanded overflow`);
   if(width===390)await page.screenshot({path:`/Users/Shared/EMS Checklist/tmp/${route}-neonatal-mobile.png`,fullPage:true});
   await page.locator('.neonatal-code>summary').click();
  }
 }
 await page.locator('#birth-eclampsia>summary').click();await page.locator('#birth-eclampsia [data-reference-open="magnesium"]').click();await page.locator('[data-ref-open="drug-magnesium"]').waitFor();
 await page.goto('http://127.0.0.1:4173/#birth');await page.locator('.neonatal-code>summary').click();
 await page.locator('[data-action="new"]').click();await page.locator('[data-action="confirm-new"]').click();
 await page.goto('http://127.0.0.1:4173/#birth');assert.equal(await page.locator('.neonatal-code').getAttribute('open'),null);assert.equal(await page.locator('#birth-eclampsia').getAttribute('open'),null);assert.equal(await page.locator('[data-check="birth-prepare-gestation"]').isChecked(),false);
 await page.goto('http://127.0.0.1:4173/#pediatric-arrest');assert.equal(await page.locator('.neonatal-code').getAttribute('open'),null);assert.equal(await page.locator('#peds-arrest-weight').inputValue(),'');assert.equal(await page.locator('.arrest-drugs .dose-unavailable').count(),4);assert.match(await page.locator('.pulse-status').innerText(),/Ready/);
 assert.deepEqual(errors,[]);console.log('New tab checks passed: navigation, actual / estimated kg / lb weight, printed chart discrepancy, caps, invalid input, energy devices, independent neonatal expansion, persistence / reset, shared timers, deep protocol links, magnesium guide, and 320 / 390 px layouts.');
}finally{await browser.close();}

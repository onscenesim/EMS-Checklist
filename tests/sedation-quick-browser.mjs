import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/#sedation');await page.locator('[data-sedation-group="agitation"]').click();
 const dose=id=>page.locator(`[data-recipe="${id}"]`);
 assert.equal(await page.locator('.sedation-path').count(),3);
 assert.equal(await page.locator('.sedation-protocol-details[open]').count(),0);
 assert.deepEqual(await page.locator('.ketamine-height-table tbody tr td:nth-child(2) b').allTextContents(),['150mg','220mg','290mg','365mg','425mg']);assert.deepEqual(await page.locator('.ketamine-height-volume b').allTextContents(),['3mL','4.4mL','5.8mL','7.3mL','8.5mL']);assert.equal(await page.locator('.ketamine-split').count(),4);assert.equal(await page.locator('#ref-ideal').count(),0);
 for(const width of [1440,390,320]){await page.setViewportSize({width,height:1100});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(width===390)await page.locator('[data-sedation-path="ket-restraint"]').screenshot({path:'/Users/Shared/EMS Checklist/tmp/ketamine-height-mobile.png'});}
 assert.match(await dose('versed-restraint-0').innerText(),/Enter patient age in years into the calculator up top to confirm this dose applies to your patient\./);
 assert.equal(await dose('versed-restraint-0').locator('.sedation-give').count(),0);
 assert.equal(await page.locator('#stock-midazolam').inputValue(),'5');assert.match(await page.locator('.stock-default').innerText(),/10 mg \/ 2 mL = 5 mg\/mL/);
 await page.locator('#ref-age').fill('30');await page.locator('#ref-weight').fill('70');
 assert.equal(await page.locator('[data-recipe="ket-restraint-0"]').count(),0);assert.equal(await page.locator('.ketamine-height-table tbody tr').count(),5);
 assert.match(await dose('versed-restraint-0').innerText(),/5 mg[\s\S]*1 mL/);assert.match(await dose('versed-restraint-1').innerText(),/10 mg[\s\S]*2 mL/);
 await page.locator('#stock-midazolam').selectOption('1');assert.match(await dose('versed-restraint-0').innerText(),/5 mg[\s\S]*5 mL/);assert.match(await page.locator('.stock-override').innerText(),/Using 1 mg\/mL/);
 await page.locator('#stock-midazolam').selectOption('custom');assert.match(await dose('versed-restraint-0').innerText(),/Confirm vial concentration/);assert.equal(await page.locator('.stock-default').count(),0);
 await page.locator('#custom-midazolam').fill('10');assert.match(await dose('versed-restraint-0').innerText(),/5 mg[\s\S]*0.5 mL/);
 await page.locator('#stock-midazolam').selectOption('5');await page.reload();assert.equal(await page.locator('#stock-midazolam').inputValue(),'5');assert.match(await dose('versed-restraint-1').innerText(),/10 mg[\s\S]*2 mL/);
 assert.match(await page.locator('.ketamine-height-heading').innerText(),/IM once/);
 assert.match(await page.locator('[data-sedation-path="versed-restraint"] .sedation-instructions').innerText(),/Repeat only with online medical control/);
 await page.locator('[data-sedation-group="intubated"]').click();assert.equal(await page.locator('.sedation-path').count(),2);
 assert.match(await dose('ket-post-intubation-0').innerText(),/140 mg[\s\S]*2.8 mL/);assert.match(await dose('ket-post-intubation-1').innerText(),/70 mg[\s\S]*1.4 mL/);
 assert.match(await dose('versed-post-intubation-0').innerText(),/3.5 mg[\s\S]*0.7 mL/);
 assert.match(await page.locator('[data-sedation-path="versed-post-intubation"] .sedation-instructions').innerText(),/fentanyl OR morphine/);
 await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/sedation-quick-desktop.png',fullPage:true});
 for(const width of [768,390,320]){await page.setViewportSize({width,height:1100});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);if(width===390)await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/sedation-quick-mobile.png',fullPage:true});}
 await page.locator('[data-sedation-group="cardioversion"]').click();assert.equal(await page.locator('.sedation-path').count(),3);assert.equal(await dose('versed-cardioversion-0').locator('.sedation-give').count(),0);
 await page.locator('#prior-versed-cardioversion-0').fill('7');assert.match(await dose('versed-cardioversion-0').innerText(),/2–3 mg[\s\S]*0.4–0.6 mL/);assert.match(await dose('versed-cardioversion-0').innerText(),/MAX 10 mg TOTAL/);assert.equal(await dose('versed-cardioversion-0').locator('.long-values').count(),1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('#prior-versed-cardioversion-0').fill('10');assert.match(await dose('versed-cardioversion-0').innerText(),/maximum reached/);assert.equal(await dose('versed-cardioversion-0').locator('.sedation-give').count(),0);
 await page.locator('#ref-age').fill('12');await page.locator('#ref-weight').fill('40');assert.match(await dose('versed-cardioversion-ped-0').innerText(),/4 mg[\s\S]*0.8 mL/);assert.match(await page.locator('[data-sedation-path="versed-cardioversion-ped"] .sedation-instructions').innerText(),/Medical-control order required/);
 await page.reload();assert.equal(await page.locator('[data-sedation-group="cardioversion"]').getAttribute('aria-pressed'),'true');
 await page.goto('http://127.0.0.1:4173/#cardio');await page.locator('[data-shock-device="lifepak15"]').click();await page.locator('[data-shock-protocol="C300"]').click();assert.deepEqual(await page.locator('.shock-energy-step strong').allTextContents(),['360J','360J','360J']);
 await page.locator('[data-shock-protocol="C303"]').click();assert.deepEqual(await page.locator('.shock-energy-step strong').allTextContents(),['100J','200J','300J','360J']);
 await page.locator('[data-shock-protocol="C306"]').click();await page.locator('[data-shock-rhythm="irregular-biphasic"]').click();assert.deepEqual(await page.locator('.shock-energy-step strong').allTextContents(),['125–200J','200J','300J','360J']);
 await page.reload();assert.equal(await page.locator('[data-shock-device="lifepak15"]').getAttribute('aria-pressed'),'true');
 await page.goto('http://127.0.0.1:4173/#pediatric');await page.locator('[data-age="8"]').click();assert.deepEqual(await page.locator('.energy-grid b').allTextContents(),['100 J','200 J','200–360 J']);
 await page.locator('[data-shock-device="zenix"]').click();assert.deepEqual(await page.locator('.energy-grid b').allTextContents(),['100 J','200 J','200 J']);
 await page.goto('http://127.0.0.1:4173/#cardio');assert.equal(await page.locator('[data-shock-device="zenix"]').getAttribute('aria-pressed'),'true');assert.deepEqual(await page.locator('.shock-energy-step strong').allTextContents(),['120–200J','200J']);
 await page.locator('[data-shock-protocol="C303"]').click();await page.locator('[data-cardio-sedation]').click();assert.equal(await page.locator('[data-sedation-group="cardioversion"]').getAttribute('aria-pressed'),'true');assert.equal(await page.locator('[data-sedation-path="versed-cardioversion"]').isVisible(),true);
 await page.locator('[data-action="new"]').click();await page.locator('[data-action="confirm-new"]').click();await page.goto('http://127.0.0.1:4173/#cardio');assert.equal(await page.locator('[data-shock-device="zenix"]').getAttribute('aria-pressed'),'true');
 assert.deepEqual(errors,[]);console.log('Passed: readable sedation doses / volumes / routes, age and cumulative safeguards, indication filters, clinical instructions, device-specific energy paths, shared pediatric ceiling, persistence/reset and phone layouts.');
}finally{await browser.close();}

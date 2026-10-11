import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1100},timezoneId:'America/New_York'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-10T21:00:00-04:00')});
 await page.goto('http://127.0.0.1:4173/#trauma');
 const expected=['Turn main O2 AND cabin power on. Turn up the heat.','Control bleeding','Check and control airway','Assess chest, ventilation, oxygenation','Treat life-threatening chest injuries with decompression, chest seals','Strip clothes','Full body sweep including armpits and back','Check blood thinners and antiplatelets','Assess head / neck injury and pupils','Turn on the heat and remove wet clothing','Remove constricting jewelry'];
 assert.deepEqual(await page.locator('.check-copy>span').allTextContents(),expected);
 assert.equal(await page.locator('.check-row').count(),11);
 assert.equal(await page.locator('.ketamine-panel').getAttribute('open'),null);
 await page.locator('.ketamine-panel>summary').click();
 assert.equal(await page.locator('.protocol-links a[href$="#page=142"]').count(),1);
 assert.equal(await page.locator('.trauma-pain a[href$="#page=143"]').count(),1);
 assert.match(await page.locator('.pain-stock').innerText(),/500 mg \/ 10 mL/);
 assert.match(await page.locator('.pain-stock').innerText(),/50 mg\/mL · age 16\+/);
 assert.equal((await page.locator('.trauma-pain').innerText()).includes('10mg/mL'),false);
 assert.deepEqual(await page.locator('.pain-table tbody tr').evaluateAll(rows=>rows.map(r=>[...r.children].map(c=>c.innerText.replace(/\s+/g,' ')))),[
  ['<4′11″','0.15 mL 7.5 mg','0.6 mL 30 mg'],['5′–5.5″','0.2 mL 10 mg','0.8 mL 40 mg'],['5.5′–5′11″','0.3 mL 15 mg','1.2 mL 60 mg'],['6′–6′5″','0.35 mL 17.5 mg','1.4 mL 70 mg'],['>6′5″','0.4 mL 20 mg','1.6 mL 80 mg']
 ]);
 assert.equal(await page.locator('.march-section').count(),5);
 assert.equal(await page.locator('.march-section h2').evaluateAll(els=>new Set(els.map(el=>getComputedStyle(el).color)).size),5);

 assert.equal(await page.locator('a[href$="#page=144"]').count(),1);
 assert.equal(await page.locator('a[href$="#page=145"]').count(),1);
 const alert=page.getByRole('button',{name:'Called trauma alert',exact:true}),txa=page.getByRole('button',{name:'GIVE TXA',exact:true});
 await alert.click();const alertAt=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('wfd-encounter-v1')).fields['trauma-alert-at']);
 assert.ok(Number.isFinite(alertAt));assert.equal(await alert.isDisabled(),true);
 await page.clock.fastForward(10_000);await txa.click();
 const txaAt=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('wfd-encounter-v1')).fields['trauma-txa-at']);assert.ok(txaAt>alertAt);
 assert.equal(await page.locator('.trauma-event-time time').count(),2);
 await page.reload();assert.equal(await alert.isDisabled(),true);assert.equal(await txa.isDisabled(),true);
 assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('wfd-encounter-v1')).fields['trauma-alert-at']),alertAt);
 await page.getByRole('button',{name:'Clear trauma alert timestamp'}).click();assert.equal(await alert.isDisabled(),false);
 await alert.click();
 await page.locator('[data-check="trauma-3-body-sweep"]').check();
 assert.equal(await page.locator('.checklist-progress b').innerText(),'1 of 11 complete');
 await page.locator('#shock-hr').fill('120');await page.locator('#shock-sbp').fill('100');
 assert.equal(await page.locator('.shock-result strong').innerText(),'1.20');
 await page.locator('.nav-item[data-page="sick"]').click();assert.equal(await page.locator('.shock-result strong').innerText(),'1.20');
 assert.equal(await page.locator('#shock-hr').inputValue(),'120');
 await page.locator('#shock-sbp').fill('0');assert.equal(await page.locator('.shock-result strong').innerText(),'—');
 await page.locator('#shock-sbp').fill('100');
 await page.locator('.nav-item[data-page="trauma"]').click();
 assert.equal(await page.locator('.burns-panel:not(.ketamine-panel)').getAttribute('open'),null);
 await page.locator('.burns-panel:not(.ketamine-panel)>summary').click();
 assert.equal(await page.locator('.burns-panel:not(.ketamine-panel)').getAttribute('open'),'');
 assert.deepEqual(await page.locator('.burn-priorities li').allTextContents(),[
  'Protect the airway; assess smoke inhalation and respiratory distress.',
  'Stop the burning process; remove affected clothing and constricting jewelry.',
  'Turn up the heat. Cover burns with a clean, dry sheet.',
  'Consider CO / cyanide exposure.','Provide pain care.'
 ]);
 assert.equal(await page.locator('.burn-priorities li').evaluateAll(els=>new Set(els.map(el=>getComputedStyle(el).color)).size),5);
 for(const phrase of ['Assess associated trauma','transport to an appropriate facility and notify it','Time starts at the burn injury.','Enter a positive weight','Each percentage covers the whole listed region'])assert.equal((await page.locator('.burns-content:not(.trauma-pain)').innerText()).includes(phrase),false);
 assert.equal(await page.locator('.burns-panel:not(.ketamine-panel) a[href$="#page=139"]').count(),1);
 assert.deepEqual(await page.locator('.burn-table tbody tr').nth(4).locator('td').allTextContents(),['Each leg','18%','14%']);
 assert.deepEqual(await page.locator('.burn-table tbody tr').nth(5).locator('td').allTextContents(),['Genitals / perineum','1%','Not listed']);
 await page.locator('#burn-weight').fill('70');await page.locator('#burn-tbsa').fill('20');
 assert.deepEqual(await page.locator('.parkland-result strong').allTextContents(),['5,600 mL','2,800 mL','2,800 mL']);
 await page.reload();assert.equal(await page.locator('.burns-panel:not(.ketamine-panel)').getAttribute('open'),'');
 assert.equal(await page.locator('#burn-weight').inputValue(),'70');
 await page.locator('#burn-tbsa').fill('101');assert.equal(await page.locator('.parkland-result strong').count(),0);
 await page.locator('#burn-tbsa').fill('0');assert.equal(await page.locator('.parkland-result strong').count(),0);
 await page.locator('#burn-tbsa').fill('20');await page.locator('#burn-unit').selectOption('lb');await page.locator('#burn-weight').fill('154.32358');
 assert.deepEqual(await page.locator('.parkland-result strong').allTextContents(),['5,600 mL','2,800 mL','2,800 mL']);
 await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/trauma-march-desktop.png',fullPage:true});
 await page.locator('.burns-panel:not(.ketamine-panel)').screenshot({path:'/Users/Shared/EMS Checklist/tmp/burns-desktop.png'});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('.burns-panel:not(.ketamine-panel)').screenshot({path:'/Users/Shared/EMS Checklist/tmp/burns-mobile.png'});
 await page.locator('.trauma-pain').screenshot({path:'/Users/Shared/EMS Checklist/tmp/ketamine-pain-mobile.png'});
 await page.locator('.march-section[data-march="c"]').screenshot({path:'/Users/Shared/EMS Checklist/tmp/march-c-mobile.png'});
 await page.locator('.trauma-events').screenshot({path:'/Users/Shared/EMS Checklist/tmp/trauma-events-mobile.png'});
 await page.setViewportSize({width:320,height:720});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.goto('http://127.0.0.1:4173/#post-call');
 assert.equal(await page.locator('#post-service').count(),0);
 assert.equal(await page.locator('#equipment-pickup').count(),0);
 await page.getByRole('checkbox',{name:'Retrieve Equipment'}).check();
 await page.getByRole('checkbox',{name:'Doors closed, lights off'}).check();
 await page.getByRole('checkbox',{name:'In quarters'}).check();
 assert.equal(await page.locator('.post-closeout .post-count').innerText(),'3 of 6 checked');
 await page.reload();assert.equal(await page.locator('#post-retrieve').isChecked(),true);
 assert.equal(await page.locator('#post-hospital').isChecked(),true);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('.post-closeout').screenshot({path:'/Users/Shared/EMS Checklist/tmp/post-call-reminders-mobile.png'});
 await page.locator('[data-action="new"]').click();await page.locator('[data-action="confirm-new"]').click();
 await page.goto('http://127.0.0.1:4173/#trauma');
 assert.equal(await alert.isDisabled(),false);assert.equal(await txa.isDisabled(),false);
 assert.equal(await page.locator('#shock-hr').inputValue(),'');assert.equal(await page.locator('.shock-result strong').innerText(),'—');
 assert.equal(await page.locator('.burns-panel:not(.ketamine-panel)').getAttribute('open'),null);
 await page.locator('.burns-panel:not(.ketamine-panel)>summary').click();assert.equal(await page.locator('#burn-weight').inputValue(),'');
 // Old positional trauma checks must not check newly worded tasks.
 await page.evaluate(()=>sessionStorage.setItem('wfd-encounter-v1',JSON.stringify({checks:{'trauma-0-0':true,'trauma-3-0':true},fields:{'post-service':true}})));
 await page.reload();assert.equal(await page.locator('.checklist-progress b').innerText(),'0 of 11 complete');
 assert.equal(await page.evaluate(()=>Object.hasOwn(JSON.parse(sessionStorage.getItem('wfd-encounter-v1')).fields,'post-service')),false);
 assert.deepEqual(errors,[]);
 console.log('Trauma / burns checks passed: MARCH, single timestamps / correction / reset, source links, shared shock index, rule of 9s, Parkland units / invalid inputs, expansion persistence, hospital reminders, legacy state, and mobile layouts.');
}finally{await browser.close();}

import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1100},timezoneId:'America/New_York'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.clock.install({time:new Date('2026-10-14T10:00:00-04:00')});
 await page.goto('http://127.0.0.1:4173/#sick');
 const button=page.getByRole('button',{name:'CALLED RELEVANT ALERT',exact:true}),card=page.locator('.sick-alert-events');
 assert.match(await card.innerText(),/CALL EARLY/);
 assert.equal(await card.locator('time').count(),0);
 await button.focus();await page.keyboard.press('Enter');
 const original=await page.evaluate(()=>JSON.parse(sessionStorage.getItem('wfd-encounter-v1')).fields['sick-alert-at']);
 const start=Date.parse('2026-10-14T10:00:00-04:00');assert.ok(original>=start&&original<start+10_000);
 assert.equal(await button.isDisabled(),true);
 assert.equal(await card.locator('time').getAttribute('datetime'),new Date(original).toISOString());
 assert.equal(await card.locator('time').innerText(),'Alert called · '+new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(original)));
 await page.goto('http://127.0.0.1:4173/#trauma');
 const trauma=page.getByRole('button',{name:'Called trauma alert',exact:true});
 assert.equal(await trauma.isDisabled(),false);
 assert.match(await trauma.locator('..').innerText(),/CALL EARLY.*Cell reception typically drops halfway through the drive to UCMC ER\./s);
 await page.clock.fastForward(10_000);await trauma.click();
 await page.goto('http://127.0.0.1:4173/#sick');await page.reload();
 assert.equal(await button.isDisabled(),true);
 assert.equal(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('wfd-encounter-v1')).fields['sick-alert-at']),original);
 await page.getByRole('button',{name:'Clear relevant alert timestamp',exact:true}).click();
 assert.equal(await button.isDisabled(),false);assert.equal(await card.locator('time').count(),0);
 await button.click();assert.notEqual(await page.evaluate(()=>JSON.parse(sessionStorage.getItem('wfd-encounter-v1')).fields['sick-alert-at']),original);
 await page.goto('http://127.0.0.1:4173/#trauma');assert.equal(await trauma.isDisabled(),true);
 for(const width of [1440,390,320]){
  await page.setViewportSize({width,height:900});
  for(const id of ['sick','trauma']){
   await page.goto(`http://127.0.0.1:4173/#${id}`);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${id} ${width}px`);
   if(width===390)await page.locator(id==='sick'?'.sick-alert-events':'.trauma-events').screenshot({path:`/Users/Shared/EMS Checklist/tmp/${id}-early-alert-390.png`});
  }
 }
 await page.locator('[data-action="new"]').click();await page.locator('[data-action="confirm-new"]').click();
 await page.goto('http://127.0.0.1:4173/#sick');assert.equal(await button.isDisabled(),false);assert.equal(await card.locator('time').count(),0);
 await page.goto('http://127.0.0.1:4173/#trauma');assert.equal(await trauma.isDisabled(),false);
 assert.deepEqual(errors,[]);
 console.log('Passed: local alert time, keyboard recording, first timestamp preserved, correction, navigation / reload, independent trauma timestamp, encounter reset, early-call reminders, desktop / phone layouts.');
}finally{await browser.close();}

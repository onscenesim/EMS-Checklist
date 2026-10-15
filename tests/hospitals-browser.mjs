import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173/#hospitals');assert.equal(await page.locator('.hospital-card').count(),7);
assert.match(await page.locator('.hospital-card').nth(1).innerText(),/Level III/);
assert.match(await page.locator('.hospital-card').nth(2).innerText(),/Level I\n/);
await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/hospitals-mobile.png',fullPage:true});
await page.getByRole('button',{name:'Door & EMS room codes',exact:true}).click();
assert.equal(await page.getByLabel('Mercy Fairfield ER Door code',{exact:true}).inputValue(),'1234#');assert.equal(await page.getByLabel('UCMC ER EMS room code',{exact:true}).inputValue(),'#0911*');
const input=page.getByLabel('Mercy Jewish ER Door code',{exact:true});await input.fill('test#123');await page.reload();await page.getByRole('button',{name:'Door & EMS room codes',exact:true}).click();assert.equal(await input.inputValue(),'test#123');
await page.getByRole('button',{name:'Phone numbers',exact:true}).click();await page.getByLabel('Mercy Fairfield ER ER phone number',{exact:true}).fill('513-555-0123');
await page.getByRole('button',{name:'New encounter',exact:true}).click();await page.locator('[data-action="confirm-new"]').click();await page.goto('http://127.0.0.1:4173/#hospitals');await page.getByRole('button',{name:'Phone numbers',exact:true}).click();assert.equal(await page.getByLabel('Mercy Fairfield ER ER phone number',{exact:true}).inputValue(),'513-555-0123');
assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.setViewportSize({width:1440,height:1000});await page.getByRole('button',{name:'Capabilities',exact:true}).click();await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/hospitals-desktop.png',fullPage:true});assert.deepEqual(errors,[]);console.log('Hospital cards, defaults, persistence, encounter reset, phone editing, mobile overflow and page errors passed.');
}finally{await browser.close();}

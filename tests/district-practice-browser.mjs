import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const data=JSON.parse(readFileSync(new URL('../dist/practice-network.json',import.meta.url)));
const key='woodlawn-practice-street-rotation-v1';
const streetKey=s=>s.toLowerCase().replace(/\b(road|rd)\b/g,'rd').replace(/\b(drive|dr)\b/g,'dr').replace(/\b(court|ct)\b/g,'ct').replace(/\b(avenue|ave)\b/g,'ave').replace(/\b(street|st)\b/g,'st').replace(/[^a-z0-9]/g,'');
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const loaded=()=>page.waitForSelector('#practice-start');
 const state=()=>page.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
 await page.goto('http://127.0.0.1:4173/#learn-district');await loaded();
 await page.locator('[data-practice-mode="address"]').click();await page.locator('#practice-area').selectOption('woodlawn');
 assert.match(await page.locator('#practice-mode-note').innerText(),/Streets rotate before repeating/);
 for(let i=0;i<8;i++){await page.locator('#practice-start').click();assert.equal(await page.locator('#practice-setup-error').isVisible(),false);const saved=await state();assert.equal(Object.keys(saved.counts).length,i+1);assert.ok(Object.values(saved.counts).every(n=>n===1));}
 const before=await state();await page.reload();await loaded();assert.deepEqual(await state(),before);
 await page.locator('#practice-area').selectOption('woodlawn');await page.locator('#practice-start').click();assert.equal(Object.keys((await state()).counts).length,9);
 // Force a street without a verified number to the front of the saved cycle.
 const counts=Object.fromEntries(data.targets.filter(t=>['address','street'].includes(t.kind)).map(t=>[streetKey(t.street),1]));counts.hunterct=0;
 const seed={revision:data.revision,counts};
 await page.evaluate(({key,seed})=>localStorage.setItem(key,JSON.stringify(seed)),{key,seed});await page.reload();await loaded();
 await page.locator('#practice-area').selectOption('lincoln');await page.locator('#practice-start').click();
 assert.match(await page.locator('.practice-dispatch h2').innerText(),/Hunter Court · street practice point/);
 assert.equal(await page.locator('.practice-dispatch > p').first().innerText(),'Lincoln Heights');
 await page.locator('#practice-reveal').check();assert.equal(await page.locator('.practice-target-pin').count(),1);
 for(const width of [390,320]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
 await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/street-practice-point-320.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1100});
 await page.evaluate(({key,seed})=>localStorage.setItem(key,JSON.stringify(seed)),{key,seed});await page.reload();await loaded();
 await page.locator('[data-practice-mode="hospital"]').click();await page.locator('#practice-area').selectOption('lincoln');await page.locator('#practice-start').click();
 assert.equal(await page.locator('.practice-dispatch h2').innerText(),'Bethesda North');assert.match(await page.locator('.practice-dispatch small').first().innerText(),/From Hunter Court · street practice point/);
 assert.deepEqual(errors,[]);
 console.log('Street rotation, reload persistence, fallback dispatch and pin, hospital origin, and 320/390px layouts passed.');
}finally{await browser.close();}

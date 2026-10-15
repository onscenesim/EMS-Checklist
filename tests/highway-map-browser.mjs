import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:4173/#hospitals');await page.waitForSelector('.hospital-map-pin');await page.waitForTimeout(1600);
assert.equal(await page.locator('.hospital-map-pin').count(),9);assert.equal(await page.locator('.fd-geo-marker').count(),0);assert.equal(await page.locator('.selected-highway').count(),0);
await page.locator('.hospital-map-panel').screenshot({path:'/Users/Shared/EMS Checklist/tmp/quiet-geographic-mobile.png'});
await page.locator('[data-map-hospital="bethesda"]').click();assert.match(await page.locator('.selected-hospital-context').innerText(),/EAST of Woodlawn/);assert.match(await page.locator('.selected-hospital-context').innerText(),/SR-126 EAST → I-71 NORTH/);assert.equal(await page.locator('.fd-route-highlight').count(),4);assert.match(await page.locator('.backup-options').innerText(),/Montgomery FD/);assert.equal(await page.locator('.selected-highway').count(),3);assert.equal(await page.locator('.hospital-selected').getAttribute('title'),'Bethesda North');assert.equal(await page.locator('[data-map-hospital="bethesda"] .map-number').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(22, 115, 230)');
await page.waitForTimeout(400);await page.locator('.hospital-map-panel').screenshot({path:'/Users/Shared/EMS Checklist/tmp/quiet-geographic-selected.png'});
await page.getByRole('button',{name:'Hide backup FDs'}).click();assert.equal(await page.locator('.fd-geo-marker').count(),0);
await page.getByRole('button',{name:'Show backup FDs'}).click();assert.equal(await page.locator('.fd-route-highlight').count(),4);
await page.locator('[data-backup-station="3"]').click();assert.match(await page.locator('.leaflet-popup-content').innerText(),/Montgomery FD/);
for(const [hospital,name,count] of [['ucmc','Cincinnati 19',5],['jewish','Sycamore 92',4],['westchester','West Chester 75',4],['childrens-liberty','Liberty 112',5],['fairfield','Fairfield 33',4],['samaritan','Cincinnati 34',5],['christ','Cincinnati 5',5],['childrens-main','Cincinnati 32',5]]){
 await page.locator(`[data-map-hospital="${hospital}"]`).click();assert.equal(await page.locator('.fd-route-highlight').count(),count);assert.match(await page.locator('.backup-options').innerText(),new RegExp(name));assert.equal(await page.locator('.hospital-selected').count(),1);assert.ok(await page.locator('.selected-highway').count()>0);
}
await page.locator('.hospital-map-pin[title="UCMC"]').click();assert.equal(await page.locator('.hospital-selected').getAttribute('title'),'UCMC');assert.equal(await page.locator('.selected-highway').count(),2);await page.locator('.hospital-map-panel').screenshot({path:'/Users/Shared/EMS Checklist/tmp/backup-ucmc-mobile.png'});
await page.getByRole('button',{name:'Show all',exact:true}).click();assert.equal(await page.locator('.fd-geo-marker').count(),0);assert.equal(await page.locator('.backup-options').isVisible(),false);assert.equal(await page.locator('.selected-highway').count(),0);assert.equal(await page.locator('.hospital-selected').count(),0);
await page.getByRole('button',{name:'Show nearby FDs'}).click();assert.equal(await page.locator('.fd-geo-marker').count(),7);await page.locator('.fd-geo-marker[title="Springdale Fire Department"]').click();assert.match(await page.locator('.leaflet-popup-content').innerText(),/12147 Lawnview/);await page.getByRole('button',{name:'Hide nearby FDs'}).click();
await page.getByRole('button',{name:'Stat Lines',exact:true}).click();await page.getByRole('button',{name:'Capabilities',exact:true}).click();assert.equal(await page.locator('.hospital-map-pin').count(),9);
for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);}
await page.getByRole('button',{name:'Show all',exact:true}).click();await page.waitForTimeout(500);await page.locator('.hospital-map-panel').screenshot({path:'/Users/Shared/EMS Checklist/tmp/quiet-geographic-desktop.png'});assert.deepEqual(errors,[]);
console.log('Geographic map: 9 hospitals, compass directions, highway approach popup, route-specific backup for all 9 destinations, FD selection, show/hide, remount and responsive layouts passed.');
}finally{await browser.close();}

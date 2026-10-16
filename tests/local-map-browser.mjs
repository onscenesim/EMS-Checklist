import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {destinations} from '../dist/local-destinations.js';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.stack);});
 const assertSeparatePins=async()=>{
  const boxes=await page.locator('.local-place-pin,.local-station-pin').evaluateAll(nodes=>nodes.map(n=>{const r=n.getBoundingClientRect();return {title:n.title,x:r.x,y:r.y,w:r.width,h:r.height};}));
  for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
   const a=boxes[i],b=boxes[j];assert.ok(Math.hypot(a.x+a.w/2-b.x-b.w/2,a.y+a.h/2-b.y-b.h/2)+.5>=(a.w+b.w)/2,`${a.title} overlaps ${b.title}`);
  }
 };
 await page.goto('http://127.0.0.1:4173/#district-map');await page.waitForSelector('.local-list-empty');
 assert.equal(await page.locator('.local-place-pin').count(),0);
 await page.locator('[data-local-area="woodlawn"]').click();
 assert.equal(await page.locator('[data-local-destination="transport"]').count(),1);
 assert.equal(await page.locator('.local-place-pin[title="Woodlawn Transport Division"]').count(),1);
 assert.equal(await page.locator('.local-place-pin').count()+1,destinations.filter(d=>d.area==='woodlawn').length);
 assert.equal(await page.locator('[data-local-destination="woodlawn-fd"] .local-list-number').innerText(),'1');
 assert.equal(await page.locator('[data-local-destination="woodlawn-fd"] .local-station-diamond').innerText(),'◆');
 assert.equal(await page.locator('.local-station-pin').innerText(),'1');
 await assertSeparatePins();
 for(const d of destinations.filter(d=>d.area==='woodlawn'&&d.id!=='woodlawn-fd'))assert.equal(await page.locator(`.local-place-pin[title="${d.name}"]`).innerText(),String(d.number));
 const listIds=()=>page.locator('[data-local-destination]').evaluateAll(nodes=>nodes.map(n=>n.dataset.localDestination));
 assert.deepEqual(await listIds(),destinations.filter(d=>d.area==='woodlawn').map(d=>d.id));
 assert.equal(await page.locator('.leaflet-districtBorders-pane .local-municipal-border').count(),15);
 assert.equal(await page.locator('.leaflet-districtRails-pane .local-rail-track').count(),50);
 assert.ok(await page.locator('.leaflet-districtRails-pane').evaluate(el=>+el.style.zIndex)>await page.locator('.leaflet-districtBorders-pane').evaluate(el=>+el.style.zIndex));
 await page.locator('.local-map-frame').screenshot({path:'/Users/Shared/EMS Checklist/tmp/district-borders-woodlawn.png'});
 await page.locator('[data-local-destination="transport"]').click();assert.match(await page.locator('.local-selection').innerText(),/10088 Springfield Pike Ste 5/);assert.equal(await page.locator('.local-place-pin[title="Woodlawn Transport Division"]').count(),1);
 assert.equal(await page.locator('.local-active-route.normal').count(),1);
 await page.locator('[data-local-destination="goodwill"]').click();await page.locator('[data-local-entrance]').selectOption('outlet');assert.match(await page.locator('.local-selected-heading').innerText(),/10633 Glendale Road/);
 await page.locator('[data-local-area="lincoln"]').click();assert.equal(await page.locator('[data-local-destination="kroger-store"]').count(),0);
 assert.equal(await page.locator('.local-court-cluster').count(),0);await assertSeparatePins();
 assert.deepEqual(await listIds(),destinations.filter(d=>d.area==='lincoln').map(d=>d.id));
 assert.equal(await page.locator('.local-place-pin').count(),destinations.filter(d=>d.area==='lincoln').length);
 await page.waitForTimeout(300);await page.locator('.local-map-frame').screenshot({path:'/Users/Shared/EMS Checklist/tmp/district-courts.png'});assert.equal(await page.locator('.local-place-pin[title="Shivers Court"], .local-place-pin[title="Able Court"], .local-place-pin[title="Love Court"], .local-place-pin[title="Hunter Court"]').count(),4);await page.locator('[data-local-destination="lincoln-fd"]').click();await page.locator('[data-local-mode="blocked"]').click();assert.equal(await page.locator('.local-active-route.blocked').getAttribute('stroke'),'#e5ad08');assert.match(await page.locator('.local-route-summary').innerText(),/underpass/);
 await page.waitForTimeout(1000);await page.locator('.local-map-page').screenshot({path:'/Users/Shared/EMS Checklist/tmp/district-desktop.png'});
 await page.locator('[data-local-search]').fill('Shivers');assert.equal(await page.locator('[data-local-destination]').count(),1);assert.equal(await page.locator('[data-local-destination] .local-list-number').innerText(),String(destinations.find(d=>d.id==='shivers-court').number));await page.locator('[data-local-destination="shivers-court"]').click();assert.match(await page.locator('.local-selection').innerText(),/local correction/);
 await page.locator('[data-local-area="woodlawn"]').click();await page.locator('[data-local-destination="trillium"]').click();assert.equal(await page.locator('.local-active-route').count(),0);assert.match(await page.locator('.local-selection').innerText(),/No established vehicle approach/);
 for(const width of [390,320]){await page.setViewportSize({width,height:900});await page.locator('[data-local-area="lincoln"]').click();await assertSeparatePins();await page.locator('[data-local-destination="lincoln-fd"]').click();await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('.local-map-page').screenshot({path:`/Users/Shared/EMS Checklist/tmp/district-${width}.png`});}
 await page.setViewportSize({width:1440,height:1100});await page.locator('[data-page="hospitals"]').first().click();await page.waitForSelector('.hospital-map-pin');await page.locator('[data-page="district-map"]').first().click();await page.waitForSelector('.local-place-pin');assert.deepEqual(errors,[]);
 console.log('District map: area selection, all markers, alphabetical numbering, station diamond, shared borders, railway layering, routing, train alternative, Goodwill access, search, optional fields, mobile layout, and navigation passed.');
}finally{await browser.close();}

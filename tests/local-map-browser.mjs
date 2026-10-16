import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/#district-map');await page.waitForSelector('.local-list-empty');
 assert.equal(await page.locator('.local-place-pin').count(),0);
 await page.locator('[data-local-area="woodlawn"]').click();
 assert.equal(await page.locator('[data-local-destination="transport"]').count(),1);
 assert.equal(await page.locator('.local-place-pin[title="Woodlawn Transport Division"]').count(),0);
 await page.locator('[data-local-destination="transport"]').click();assert.match(await page.locator('.local-selection').innerText(),/10088 Springfield Pike Ste 5/);assert.equal(await page.locator('.local-place-pin[title="Woodlawn Transport Division"]').count(),1);
 assert.equal(await page.locator('.local-active-route.normal').count(),1);
 await page.locator('[data-local-destination="goodwill"]').click();await page.locator('[data-local-entrance]').selectOption('outlet');assert.match(await page.locator('.local-selected-heading').innerText(),/10633 Glendale Road/);
 await page.locator('[data-local-area="lincoln"]').click();assert.equal(await page.locator('[data-local-destination="kroger-store"]').count(),0);
 assert.equal(await page.locator('.local-court-cluster').count(),1);await page.locator('.local-court-cluster').click();await page.waitForTimeout(300);await page.locator('.local-map-frame').screenshot({path:'/Users/Shared/EMS Checklist/tmp/district-courts.png'});assert.equal(await page.locator('.local-place-pin[title="Shivers Court"], .local-place-pin[title="Able Court"], .local-place-pin[title="Love Court"], .local-place-pin[title="Hunter Court"]').count(),4);await page.locator('[data-local-destination="lincoln-fd"]').click();await page.locator('[data-local-mode="blocked"]').click();assert.equal(await page.locator('.local-active-route.blocked').getAttribute('stroke'),'#e5ad08');assert.match(await page.locator('.local-route-summary').innerText(),/underpass/);
 await page.waitForTimeout(1000);await page.locator('.local-map-page').screenshot({path:'/Users/Shared/EMS Checklist/tmp/district-desktop.png'});
 await page.locator('[data-local-search]').fill('Shivers');assert.equal(await page.locator('[data-local-destination]').count(),1);await page.locator('[data-local-destination="shivers-court"]').click();assert.match(await page.locator('.local-selection').innerText(),/local correction/);
 await page.locator('[data-local-area="woodlawn"]').click();await page.locator('[data-local-destination="trillium"]').click();assert.equal(await page.locator('.local-active-route').count(),0);assert.match(await page.locator('.local-selection').innerText(),/No established vehicle approach/);
 for(const width of [390,320]){await page.setViewportSize({width,height:900});await page.locator('[data-local-area="lincoln"]').click();await page.locator('[data-local-destination="lincoln-fd"]').click();await page.waitForTimeout(300);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.locator('.local-map-page').screenshot({path:`/Users/Shared/EMS Checklist/tmp/district-${width}.png`});}
 await page.setViewportSize({width:1440,height:1100});await page.locator('[data-page="hospitals"]').first().click();await page.waitForSelector('.hospital-map-pin');await page.locator('[data-page="district-map"]').first().click();await page.waitForSelector('.local-place-pin');assert.deepEqual(errors,[]);
 console.log('District map: area selection, zoom-gated markers, routing, train alternative, Goodwill access, search, optional fields, mobile layout, and navigation passed.');
}finally{await browser.close();}

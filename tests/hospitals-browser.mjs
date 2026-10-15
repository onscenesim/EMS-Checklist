import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/#hospitals');assert.equal(await page.locator('.hospital-card').count(),9);
 assert.match(await page.locator('[data-hospital-card="jewish"]').innerText(),/Comprehensive/);
 assert.match(await page.locator('[data-hospital-card="childrens-main"]').innerText(),/Pediatric trauma center\nLevel I/);
 assert.match(await page.locator('[data-hospital-card="childrens-liberty"]').innerText(),/Definitive post-arrest care not listed/);
 assert.equal(await page.locator('.hospital-unverified').count(),9);
 assert.equal(await page.locator('.stroke-legend li').count(),5);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/hospitals-revised-mobile.png',fullPage:true});
 await page.getByRole('button',{name:'Door & EMS room codes',exact:true}).click();assert.equal(await page.locator('.hospital-card').count(),9);assert.equal(await page.locator('.hospital-card input').count(),0);assert.match(await page.locator('.hospital-grid').innerText(),/1234#/);assert.match(await page.locator('.hospital-grid').innerText(),/#0911\*/);
 await page.getByRole('button',{name:'Stat Lines',exact:true}).click();assert.equal(await page.locator('.hospital-card dt').count(),9);assert.equal(await page.locator('.hospital-card input').count(),0);assert.equal(await page.locator('.hospital-placeholder').count(),9);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/hospitals-stat-lines-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:1000});await page.getByRole('button',{name:'Capabilities',exact:true}).click();await page.screenshot({path:'/Users/Shared/EMS Checklist/tmp/hospitals-revised-desktop.png',fullPage:true});assert.deepEqual(errors,[]);
 console.log('Nine hospitals, stroke levels, pediatric distinctions, unverified designation labels, fixed codes, one Stat Line each, and mobile layout passed.');
}finally{await browser.close();}

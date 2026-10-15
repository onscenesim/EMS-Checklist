import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
const page=await browser.newPage({viewport:{width:390,height:844}}),errors=[],requests=[];
page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
await page.goto('http://127.0.0.1:4173/#hospitals');await page.waitForSelector('.highway-canvas svg');
assert.equal(await page.locator('.hospital-dot').count(),9);assert.equal(await page.locator('.fd-dot').count(),0);assert.equal(await page.locator('#nearby-fds').isVisible(),false);
await page.selectOption('#highway-destination','bethesda');assert.match(await page.locator('.highway-route').innerText(),/I-75 SOUTH.*SR-126 EAST.*I-71 NORTH/s);assert.equal(await page.locator('.highway-active').count(),3);
await page.locator('.highway-panel').screenshot({path:'/Users/Shared/EMS Checklist/tmp/highway-mobile.png'});
await page.getByRole('button',{name:'Show nearby FDs'}).click();assert.equal(await page.locator('.fd-dot').count(),7);assert.equal(await page.locator('#nearby-fds').isVisible(),true);
await page.locator('.highway-panel').screenshot({path:'/Users/Shared/EMS Checklist/tmp/highway-fds-mobile.png'});
await page.selectOption('#highway-destination','jewish');assert.match(await page.locator('.highway-route').innerText(),/SR-126 EAST/);assert.doesNotMatch(await page.locator('.highway-route').innerText(),/I-71/);
await page.selectOption('#highway-destination','fairfield');assert.match(await page.locator('.highway-route').innerText(),/I-75 NORTH.*I-275 WEST/s);
await page.getByRole('button',{name:'Hide nearby FDs'}).click();assert.equal(await page.locator('.fd-dot').count(),0);
await page.getByRole('button',{name:'Stat Lines',exact:true}).click();await page.getByRole('button',{name:'Capabilities',exact:true}).click();assert.equal(await page.locator('#highway-destination').inputValue(),'fairfield');
for(const width of [320,390,1440]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const outside=await page.locator('.highway-canvas svg').evaluate(svg=>[...svg.querySelectorAll('text')].filter(e=>{const b=e.getBBox();return b.x<0||b.x+b.width>svg.viewBox.baseVal.width;}).map(e=>e.textContent));assert.deepEqual(outside,[]);}
await page.selectOption('#highway-destination','bethesda');await page.locator('.highway-panel').screenshot({path:'/Users/Shared/EMS Checklist/tmp/highway-desktop.png'});
assert.equal(requests.some(u=>/arcgisonline|cartocdn|tile.openstreetmap/.test(u)),false);assert.deepEqual(errors,[]);console.log('Highway directions, hospital selection, FD toggle, remount, no remote tiles, 320/390/1440 layouts passed.');
}finally{await browser.close();}

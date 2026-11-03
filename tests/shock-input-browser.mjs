import {chromium} from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try{
 const page=await browser.newPage();
 await page.goto('http://127.0.0.1:4173/#trauma');
 await page.locator('#shock-hr').pressSequentially('120');
 await page.locator('#shock-sbp').pressSequentially('100');
 assert.equal(await page.locator('#shock-hr').inputValue(),'120');
 assert.equal(await page.locator('.shock-result strong').innerText(),'1.20');
 assert.match(await page.locator('.shock-panel .clinical-help').innerText(),/120 ÷ 100 = 1.20/);
 await page.locator('#shock-hr').fill('80');await page.locator('#shock-sbp').fill('120');
 assert.equal(await page.locator('.shock-result strong').innerText(),'0.67');
 await page.goto('http://127.0.0.1:4173/#sick');
 assert.equal(await page.locator('.shock-result strong').innerText(),'0.67');
 assert.match(await page.locator('main').innerText(),/Switch monitor lead to PADS/);
 await page.locator('#shock-sbp').fill('0');
 assert.equal(await page.locator('.shock-result strong').innerText(),'—');
 console.log('Shock typing, both division directions, shared inputs, invalid pressure, and pad reminder passed.');
}finally{await browser.close();}

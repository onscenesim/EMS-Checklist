import { chromium } from '/Users/WorkSchool/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4173');
  await page.locator('.stopwatch-launch').tap();
  const digits=page.locator('.stopwatch-time');
  const reset=page.getByRole('button',{name:'Reset',exact:true});
  assert.equal(await digits.innerText(),'00:00.0');
  assert.equal(await reset.isDisabled(),true);
  await page.getByRole('button',{name:'Start stopwatch',exact:true}).tap({position:{x:10,y:30}});
  await page.waitForFunction(()=>document.querySelector('.stopwatch-time').textContent!=='00:00.0');
  assert.equal(await reset.isDisabled(),true);
  await page.reload();
  await page.getByRole('button',{name:'Stop stopwatch',exact:true}).tap();
  const stopped=await digits.innerText();
  await page.waitForTimeout(250);
  assert.equal(await digits.innerText(),stopped);
  await page.reload();assert.equal(await digits.innerText(),stopped);
  await page.getByRole('button',{name:'Resume stopwatch',exact:true}).focus();
  await page.keyboard.press('Space');
  await page.waitForFunction(previous=>document.querySelector('.stopwatch-time').textContent!==previous,stopped);
  await page.getByRole('button',{name:'← Back',exact:true}).tap();
  assert.equal(await page.locator('.timer-digits').innerText(),'00:00');
  await page.locator('.stopwatch-launch').tap();
  await page.getByRole('button',{name:'Stop stopwatch',exact:true}).tap();
  await reset.tap();assert.equal(await digits.innerText(),'00:00.0');
  for(const [width,height] of [[320,568],[390,844],[844,390],[768,1024],[1024,768]]) {
    await page.setViewportSize({width,height});
    await page.waitForTimeout(200);
    assert.equal(await page.locator('.stopwatch-toolbar').count(),1);
    const layout=await page.evaluate(()=>{
      const screen=document.querySelector('.stopwatch-screen').getBoundingClientRect();
      const pad=document.querySelector('.stopwatch-pad').getBoundingClientRect();
      const time=document.querySelector('.stopwatch-time').getBoundingClientRect();
      const hint=document.querySelector('.stopwatch-hint').getBoundingClientRect();
      return {width:innerWidth,height:innerHeight,screen:{width:screen.width,height:screen.height},padRatio:pad.height/innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,timeFits:time.left>=0&&time.right<=innerWidth,hintFits:hint.bottom<=innerHeight};
    });
    assert.equal(layout.overflow,false);assert.equal(layout.screen.width,width);assert.equal(layout.screen.height,height);
    assert.ok(layout.padRatio>.8);assert.ok(layout.timeFits&&layout.hintFits);
    await page.screenshot({path:`/Users/Shared/EMS Checklist/tmp/stopwatch-${width}x${height}.png`});
  }
  // Minute and hour rollovers, including persistence of a long-running timer.
  await page.evaluate(()=>{const state=JSON.parse(sessionStorage.getItem('wfd-encounter-v1'));state.stopwatch={elapsed:3601234,started:null};sessionStorage.setItem('wfd-encounter-v1',JSON.stringify(state));});
  await page.reload();assert.equal(await digits.innerText(),'1:00:01.2');
  await page.setViewportSize({width:320,height:568});
  assert.equal(await digits.evaluate(el=>el.getBoundingClientRect().right<=innerWidth),true);
  await page.getByRole('button',{name:'← Back',exact:true}).tap();
  await page.locator('[data-action="new"]').tap();
  await page.locator('[data-action="confirm-new"]').tap();
  await page.locator('.stopwatch-launch').tap();assert.equal(await digits.innerText(),'00:00.0');
  assert.deepEqual(errors,[]);
  console.log('Stopwatch passed: touch/keyboard, pause/resume/reset, independent timers, navigation/reload, encounter reset, hour display, phone/tablet portrait and landscape.');
} finally {await browser.close();}

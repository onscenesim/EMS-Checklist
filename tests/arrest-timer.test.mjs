import test from 'node:test';
import assert from 'node:assert/strict';
import {dispatchSeconds} from '../dist/arrest-tools.js';
test('dispatch timer starts at 30 minutes and is bounded at zero',()=>{
 const at=1_800_000_000_000,fields={'arrest-dispatch-at':at};
 assert.equal(dispatchSeconds({},at),1800);
 assert.equal(dispatchSeconds(fields,at),1800);
 assert.equal(dispatchSeconds(fields,at+61_000),1739);
 assert.equal(dispatchSeconds(fields,at+1_800_000),0);
 assert.equal(dispatchSeconds(fields,at+3_600_000),0);
 assert.equal(dispatchSeconds(fields,at-10_000),1800);
 for(const invalid of [null,'bad',-1,Infinity])assert.equal(dispatchSeconds({'arrest-dispatch-at':invalid},at),1800);
});

import {remainingSeconds,timerPhase,processTimerAlerts,clearTimerAlerts,createTimerAudio} from '../dist/arrest-timers.js';
test('CPR and epi warnings respect lead time, deadline rounding and invalid stored values',()=>{
 const now=1_800_000_000_000,deadline=now+120_000;
 assert.equal(remainingSeconds(null,120,now),120);
 assert.equal(remainingSeconds(deadline,120,now-60_000),120);
 assert.equal(timerPhase(deadline,120,15,now+104_999),'running');
 assert.equal(timerPhase(deadline,120,15,now+105_000),'warning');
 assert.equal(timerPhase(deadline,120,15,now+120_000),'due');
 assert.equal(remainingSeconds(deadline,120,now+300_000),0);
 assert.equal(timerPhase(now+300_000,300,30,now+270_000),'warning');
 for(const invalid of [null,undefined,NaN,Infinity,'bad',-1])assert.equal(timerPhase(invalid,120,15,now),'idle');
});
test('distinct alerts fire once per phase and persist across navigation/reload; restarting re-arms them',()=>{
 const now=1_800_000_000_000,state={pulseDueAt:now+120_000,epiDueAt:now+135_000,epiInterval:3,timerAlerts:{}},played=[];let saves=0;
 const audio={play:kind=>{played.push(kind);return true}},save=()=>saves++;
 processTimerAlerts(state,audio,save,now+104_000);assert.deepEqual(played,[]);
 processTimerAlerts(state,audio,save,now+105_000);assert.deepEqual(played,['pulse','epi']);
 processTimerAlerts(JSON.parse(JSON.stringify(state)),audio,save,now+110_000);assert.equal(played.length,2);
 processTimerAlerts(state,audio,save,now+135_000);assert.deepEqual(played,['pulse','epi','pulse','epi']);
 processTimerAlerts(state,audio,save,now+300_000);assert.equal(played.length,4);
 state.pulseDueAt=now+420_000;clearTimerAlerts(state,'pulse');processTimerAlerts(state,audio,save,now+405_000);assert.equal(played.at(-1),'pulse');assert.equal(saves,5);
});
test('blocked audio retries, late ticks skip expired warning cues, mute and clear suppress sounds',()=>{
 const now=1_800_000_000_000,state={pulseDueAt:now+120_000,epiDueAt:null},played=[],audio={play:kind=>{played.push(kind);return true}};
 processTimerAlerts(state,{play:()=>false},()=>{},now+105_000);assert.equal(state.timerAlerts,undefined);
 processTimerAlerts(state,audio,()=>{},now+130_000);assert.deepEqual(played,['pulse']);
 processTimerAlerts(state,audio,()=>{},now+131_000);assert.equal(played.length,1);
 state.timerSound=false;state.pulseDueAt=now+240_000;processTimerAlerts(state,audio,()=>{},now+225_000);assert.equal(played.length,1);
 state.pulseDueAt=null;processTimerAlerts(state,audio,()=>{},now+300_000);assert.equal(played.length,1);
});
test('generated pulse ding is higher than epi thrum and simultaneous cues are queued separately',async()=>{
 const prior=globalThis.AudioContext,oscillators=[];let closed=false;
 const parameter=()=>({setValueAtTime(){},exponentialRampToValueAtTime(){}});
 globalThis.AudioContext=class {state='suspended';currentTime=0;destination={};async resume(){this.state='running'}async close(){closed=true}createGain(){return {gain:parameter(),connect(){}}}createOscillator(){const osc={frequency:{setValueAtTime(value){osc.hz=value}},connect(){},start(at){osc.at=at},stop(){}};oscillators.push(osc);return osc}};
 try{const audio=createTimerAudio();assert.equal(audio.play('pulse'),false);await audio.unlock();assert.equal(audio.play('pulse'),true);assert.equal(audio.play('epi'),true);assert.ok(oscillators.slice(0,6).every(osc=>osc.hz>=1046));assert.ok(oscillators.slice(6).every(osc=>osc.hz<200));assert.ok(oscillators[6].at>oscillators[4].at);audio.stop();assert.equal(audio.ready(),false);assert.equal(closed,true);}finally{globalThis.AudioContext=prior;}
});

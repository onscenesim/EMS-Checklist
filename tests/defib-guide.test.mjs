import test from 'node:test';
import assert from 'node:assert/strict';
import {shockProtocols,shockPlan,adultShockSedation,selectedShockDevice} from '../dist/defib-guide.js';
test('adult shock energy paths preserve protocol distinctions and device-specific C300 maximum',()=>{
 assert.equal(shockPlan({}),null);assert.equal(shockPlan({'shock-protocol':'bad'}),null);
 const vf=shockPlan({'shock-protocol':'C300'});assert.equal(vf.initial,'200');assert.deepEqual(vf.steps,['200','200']);assert.equal(vf.mode,'UNSYNCHRONIZED');
 const wide=shockPlan({'shock-protocol':'C303'});assert.equal(wide.initial,'100');assert.deepEqual(wide.steps,['200']);assert.match(wide.syncNote,/impossible/);
 const regular=shockPlan({'shock-protocol':'C306'});assert.equal(regular.initial,'50–100');assert.deepEqual(regular.steps,['100','200']);assert.match(regular.note,/Skip settings already reached/);
 const irregular=shockPlan({'shock-protocol':'C306','shock-narrow-rhythm':'irregular-biphasic'});assert.equal(irregular.initial,'120–200');assert.deepEqual(irregular.steps,['200']);
 const legacy=shockPlan({'shock-protocol':'C306','shock-narrow-rhythm':'irregular-monophasic'});assert.equal(legacy.rhythm,'irregular-biphasic');assert.deepEqual(legacy.steps,['200']);
 for(const code of ['C300','C303','C306'])for(const rhythm of ['regular','irregular-biphasic','irregular-monophasic']){const plan=shockPlan({'shock-protocol':code,'shock-narrow-rhythm':rhythm});for(const dose of [plan.initial,...plan.steps])for(const value of dose.split('–'))assert.ok(Number(value)<=200,`${code} ${rhythm}: ${dose}`);}
 assert.deepEqual(shockProtocols.map(p=>p.page),[75,79,82]);
});
test('LIFEPAK 15 uses the local maximum-energy arrest protocol and supported cardioversion settings',()=>{
 const fields={'shock-device':'lifepak15'};
 assert.equal(selectedShockDevice(fields).max,360);
 const arrest=shockPlan({...fields,'shock-protocol':'C300'});assert.equal(arrest.initial,'360');assert.deepEqual(arrest.steps,['360','360']);
 const wide=shockPlan({...fields,'shock-protocol':'C303'});assert.equal(wide.initial,'100');assert.deepEqual(wide.steps,['200','300','360']);
 const regular=shockPlan({...fields,'shock-protocol':'C306'});assert.equal(regular.initial,'50–100');assert.deepEqual(regular.steps,['100','200','300','360']);
 const irregular=shockPlan({...fields,'shock-protocol':'C306','shock-narrow-rhythm':'irregular-biphasic'});assert.equal(irregular.initial,'125–200');assert.deepEqual(irregular.steps,['200','300','360']);assert.match(irregular.note,/125 J is the lowest LIFEPAK/);
 assert.equal(selectedShockDevice({'shock-device':'bad'}).max,200);
});
test('sedation is indication-specific, adult-only, and shares the existing medication reference',()=>{
 assert.equal(adultShockSedation({'shock-protocol':'C300'}),null);
 for(const code of ['C303','C306']){const path=adultShockSedation({'shock-protocol':code}),recipe=path.recipes[0];assert.equal(path.code,code);assert.equal(recipe.ageMin,16);assert.equal(recipe.low,2);assert.equal(recipe.high,5);assert.equal(recipe.totalMax,10);assert.equal(recipe.route,'IV / IO / IM / IN');}
});

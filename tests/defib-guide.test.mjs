import test from 'node:test';
import assert from 'node:assert/strict';
import {shockProtocols,shockPlan,adultShockSedation} from '../dist/defib-guide.js';
test('adult shock energy paths preserve protocol distinctions and device-specific C300 maximum',()=>{
 assert.equal(shockPlan({}),null);assert.equal(shockPlan({'shock-protocol':'bad'}),null);
 const vf=shockPlan({'shock-protocol':'C300'});assert.equal(vf.initial,'MAX');assert.deepEqual(vf.steps,['MAX','MAX']);assert.equal(vf.mode,'UNSYNCHRONIZED');
 const wide=shockPlan({'shock-protocol':'C303'});assert.equal(wide.initial,'100');assert.deepEqual(wide.steps,['200','300','360']);assert.match(wide.syncNote,/impossible/);
 const regular=shockPlan({'shock-protocol':'C306'});assert.equal(regular.initial,'50–100');assert.deepEqual(regular.steps,['100','200','300','360']);assert.match(regular.note,/Skip settings already reached/);
 const irregular=shockPlan({'shock-protocol':'C306','shock-narrow-rhythm':'irregular-biphasic'});assert.equal(irregular.initial,'120–200');assert.deepEqual(irregular.steps,['200','300','360']);
 const monophasic=shockPlan({'shock-protocol':'C306','shock-narrow-rhythm':'irregular-monophasic'});assert.equal(monophasic.initial,'200');assert.deepEqual(monophasic.steps,['300','360']);
 assert.deepEqual(shockProtocols.map(p=>p.page),[75,79,82]);
});
test('sedation is indication-specific, adult-only, and shares the existing medication reference',()=>{
 assert.equal(adultShockSedation({'shock-protocol':'C300'}),null);
 for(const code of ['C303','C306']){const path=adultShockSedation({'shock-protocol':code}),recipe=path.recipes[0];assert.equal(path.code,code);assert.equal(recipe.ageMin,16);assert.equal(recipe.low,2);assert.equal(recipe.high,5);assert.equal(recipe.totalMax,10);assert.equal(recipe.route,'IV / IO / IM / IN');}
});

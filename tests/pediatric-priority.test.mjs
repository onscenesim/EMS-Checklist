import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pediatricTubes,igelForWeight,medications} from '../dist/data.js';
import {criticalGroups,pediatricDose} from '../dist/pediatric-ui.js';
test('airway sizes retain App J tubes and every valid manufacturer i-gel overlap',()=>{
 assert.deepEqual(pediatricTubes,['3.0–3.5','3.5','4.0–4.5','5.0','5.5','6.0','6.5','7.0','7.0']);
 for(const [kg,sizes] of [[3,[1]],[5,[1,1.5]],[10,[1.5,2]],[15,[2]],[25,[2,2.5]],[30,[2.5,3]],[40,[3]],[50,[3,4]]])assert.deepEqual(igelForWeight(kg).map(s=>s.size),sizes);
 assert.deepEqual(igelForWeight(null),[]);assert.deepEqual(igelForWeight(1),[]);
});
test('critical list retains exact source doses / volume and marks only supported age restrictions',()=>{
 assert.equal(criticalGroups.length,8);for(const g of criticalGroups)for(const m of g.rows)assert.ok(m,g.title);
 const ket=medications.find(m=>m.name==='Ketamine · pain'&&m.concentration==='50 mg/mL'&&m.route==='IV/IO');
 for(let i=0;i<4;i++)assert.equal(pediatricDose(ket,i).status,'TOO YOUNG');
 assert.deepEqual(pediatricDose(ket,4),{amount:4,unit:'mg',volume:.08,status:null});
 const lido=medications.find(m=>m.name==='Lidocaine · before IO infusion');assert.equal(pediatricDose(lido,6).status,'N/A');assert.equal(pediatricDose(lido,7).amount,1);
 const epi=medications.find(m=>m.name==='Epinephrine · anaphylaxis');assert.equal(pediatricDose(epi,0).status,'N/A');
 const amio=medications.find(m=>m.name.startsWith('Amiodarone'));assert.equal(pediatricDose(amio,3).volume,1.55);
});

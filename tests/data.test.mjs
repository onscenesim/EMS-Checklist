import test from 'node:test';
import assert from 'node:assert/strict';
import {medications,weights,ages,energies,modules} from '../dist/data.js';
test('reference cells match age columns; no unaligned volumes',()=>{assert.equal(ages.length,9);assert.equal(weights.length,9);for(const m of medications){assert.equal(m.doses.length,9,m.name);if(m.volumes)assert.equal(m.volumes.length,9,m.name);}});
test('energy calculations require explicit cap and respect ceiling',()=>{assert.equal(energies(null,200),null);assert.equal(energies(3,0),null);assert.equal(energies(-1,200),null);assert.deepEqual(energies(0,200),[6,12,30]);assert.deepEqual(energies(8,200),[100,200,200]);assert.deepEqual(energies(8,360),[100,200,360]);});
test('arrest and anaphylaxis epinephrine keep concentrations and caps separate',()=>{const arrest=medications.find(x=>x.name==='Epinephrine · cardiac arrest');const allergy=medications.find(x=>x.name==='Epinephrine · anaphylaxis');assert.equal(arrest.concentration,'0.1 mg/mL');assert.equal(allergy.concentration,'1 mg/mL');assert.equal(arrest.doses[8],.5);assert.equal(arrest.volumes[8],5);assert.equal(allergy.doses[8],.3);assert.equal(allergy.volumes[8],.3);});
test('ambiguous source cells remain withheld',()=>{assert.equal(medications.find(x=>x.name.startsWith('Amiodarone')).doses[3],null);assert.equal(medications.find(x=>x.name==='Dextrose 25%').doses[1],null);assert.ok(medications.find(x=>x.name==='Glucagon').doses.every(x=>x===null));});
test('checklist identifiers are unique',()=>assert.equal(new Set(modules.map(x=>x.id)).size,modules.length));

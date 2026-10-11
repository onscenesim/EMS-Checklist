import test from 'node:test';
import assert from 'node:assert/strict';
import {ketamineAgitationHeights,ketamineHeightChart} from '../dist/ketamine-height.js';
test('M408 agitation lookup retains printed doses, height bands and split-site markers at 50 mg/mL',()=>{
 assert.deepEqual(ketamineAgitationHeights.map(r=>[r.height,r.dose,r.volume,r.split]),[
  ['<4′11″',150,3,false],['5′–5′5″',220,4.4,true],['5′6″–5′11″',290,5.8,true],['6′–6′5″',365,7.3,true],['>6′5″',425,8.5,true]
 ]);
 for(const row of ketamineAgitationHeights)assert.equal(row.dose/50,row.volume);
});
test('height lookup opens without calculator inputs and does not substitute adult dosing for a known child',()=>{
 const source=(label,page)=>`${label} page ${page}`;
 assert.match(ketamineHeightChart({},source),/3<small>mL/);assert.match(ketamineHeightChart({'ref-age':''},source),/ketamine-height-table/);
 assert.match(ketamineHeightChart({'ref-age':'16'},source),/ketamine-height-table/);
 const pediatric=ketamineHeightChart({'ref-age':'12'},source);assert.doesNotMatch(pediatric,/ketamine-height-table/);assert.match(pediatric,/P616/);
 assert.match(ketamineHeightChart({},source),/4′11″: no printed chart row/);
});

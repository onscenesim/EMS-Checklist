import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {destinations,numberDestinations,stationId} from '../dist/local-destinations.js';
import {municipalBorders} from '../dist/local-boundaries.js';

test('district numbers are consecutive, alphabetical within each area, with Station 96 first',()=>{
 assert.equal(destinations[0].id,stationId);
 assert.deepEqual(destinations.map(d=>d.number),Array.from({length:destinations.length},(_,i)=>i+1));
 for(const area of ['woodlawn','lincoln']){
  const names=destinations.filter(d=>d.area===area&&d.id!==stationId).map(d=>d.name);
  assert.deepEqual(names,[...names].sort((a,b)=>a.localeCompare(b,'en',{sensitivity:'base',numeric:true})));
 }
 const lastWoodlawn=destinations.filter(d=>d.area==='woodlawn').at(-1);
 assert.equal(destinations.find(d=>d.area==='lincoln').number,lastWoodlawn.number+1);
});

test('new records in either area renumber the full catalog without changing IDs or input records',()=>{
 const original=structuredClone(destinations);
 const result=numberDestinations([...destinations,
  {id:'new-woodlawn',name:'A new Woodlawn location',area:'woodlawn'},
  {id:'new-lincoln',name:'A new Lincoln Heights location',area:'lincoln'}]);
 assert.equal(result[0].id,stationId);
 assert.equal(result.find(d=>d.id==='new-woodlawn').number,2);
 const firstLincoln=result.find(d=>d.area==='lincoln');
 assert.equal(firstLincoln.id,'new-lincoln');
 for(const d of destinations){
  const next=result.find(n=>n.id===d.id);
  assert.equal(next.number,d.number+(d.id===stationId?0:d.area==='woodlawn'?1:2));
 }
 assert.deepEqual(destinations,original);
});

test('municipal linework draws shared edges once, including different ring subdivisions',()=>{
 const feature=(id,ring)=>({properties:{GEOID:id},geometry:{type:'Polygon',coordinates:[ring]}});
 const network=municipalBorders([
  feature('a',[[0,0],[.002,0],[.002,.002],[0,.002],[0,0]]),
  feature('b',[[.002,0],[.004,0],[.004,.002],[.002,.002],[.002,.001],[.002,0]])
 ]);
 const shared=network.filter(line=>line.geoids.length===2);
 assert.equal(shared.length,1);
 assert.equal(shared[0].ll.length,3);
 assert.deepEqual(shared[0].geoids,['a','b']);
});

test('real municipal linework has no duplicate segments and one Woodlawn/Lincoln shared path',()=>{
 const geography=JSON.parse(readFileSync(new URL('../dist/local-geography.json',import.meta.url)));
 const lines=municipalBorders(geography.municipalities.features),segments=new Set();
 for(const line of lines)for(let i=1;i<line.ll.length;i++){
  const key=[line.ll[i-1].join(','),line.ll[i].join(',')].sort().join('|');
  assert.equal(segments.has(key),false);segments.add(key);
 }
 assert.equal(lines.filter(line=>line.geoids.includes('3986366')&&line.geoids.includes('3943722')).length,1);
});

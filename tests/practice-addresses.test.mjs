import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {newTrip,createNetwork} from '../dist/district-practice-engine.js';
import {inDistrict,streetCoverage,addressStreetKey,addPracticeAddresses} from '../scripts/practice-address-coverage.mjs';

function fixture(){
 const targets=[{id:'station',kind:'station',node:0,label:'Station'},
  ...Array.from({length:20},(_,i)=>({id:'long-'+i,kind:'address',node:i+1,street:'Long Road',area:'woodlawn'})),
  {id:'short',kind:'address',node:21,street:'Short Court',area:'woodlawn'},
  {id:'point',kind:'street',node:22,street:'Empty Lane',area:'woodlawn'},
  {id:'lincoln',kind:'address',node:23,street:'Lincoln Road',area:'lincoln'},
  {id:'hospital',kind:'hospital',node:24}];
 return {revision:'test-v1',targets,reachable:()=>new Set(Array.from({length:25},(_,i)=>i))};
}
test('street rotation gives sparse streets equal practice and never repeats within a cycle',()=>{
 const n=fixture(),selection={},draws=[];
 for(let i=0;i<12;i++)draws.push(newTrip(n,{mode:'address',area:'woodlawn',rng:()=>0,selection}).call.street);
 for(let i=0;i<12;i+=3)assert.equal(new Set(draws.slice(i,i+3)).size,3);
 for(let i=1;i<draws.length;i++)assert.notEqual(draws[i],draws[i-1]);
 assert.deepEqual(Object.values(selection.counts),[4,4,4]);
});
test('rotation survives JSON storage, shares address/hospital coverage, and respects districts',()=>{
 const n=fixture(),selection={};
 const first=newTrip(n,{mode:'address',area:'woodlawn',selection,rng:()=>0});
 const restored=JSON.parse(JSON.stringify(selection));
 const hospital=newTrip(n,{mode:'hospital',area:'woodlawn',selection:restored,rng:()=>0});
 assert.notEqual(first.call.street,hospital.call.street);assert.equal(hospital.target.kind,'hospital');
 const third=newTrip(n,{mode:'address',area:'woodlawn',selection:restored,rng:()=>0});
 assert.equal(third.call.kind,'street');assert.equal(third.call.area,'woodlawn');
 const lincoln=newTrip(n,{mode:'address',area:'lincoln',selection:restored,rng:()=>.9});assert.equal(lincoln.call.area,'lincoln');
 assert.equal(Object.values(restored.counts).reduce((s,c)=>s+c,0),4);
});
test('address choice varies within the selected street and uses addresses before fallback points',()=>{
 const n=fixture();n.targets.push({id:'unused-point',kind:'street',street:'Long Road',area:'woodlawn',node:22});
 const chosen=[];for(const addressDraw of [0,.99]){const sequence=[0,addressDraw];chosen.push(newTrip(n,{mode:'address',selection:{},rng:()=>sequence.shift()??.9}).call.id);}
 assert.deepEqual(chosen,['long-0','long-19']);
});
test('failed trips do not consume a street; a network revision resets old coverage',()=>{
 const n=fixture(),selection={revision:n.revision,counts:{longrd:50},lastStreet:'longrd'},before=JSON.stringify(selection);
 n.reachable=()=>new Set();assert.throws(()=>newTrip(n,{mode:'address',selection}),/unavailable/);assert.equal(JSON.stringify(selection),before);
 n.reachable=()=>new Set(Array.from({length:25},(_,i)=>i));n.revision='test-v2';
 const trip=newTrip(n,{mode:'address',selection,rng:()=>0});assert.equal(trip.call.street,'Long Road');assert.equal(selection.revision,'test-v2');assert.equal(selection.counts.longrd,1);
});
test('every mapped district street has a usable address or explicitly labeled street point',()=>{
 const data=JSON.parse(readFileSync(new URL('../dist/practice-network.json',import.meta.url))),net=createNetwork(data);
 const coverage=streetCoverage(data);assert.ok(coverage.length>100);
 for(const g of coverage)assert.ok(g.addresses.length||g.points.length,g.area+' '+g.street);
 const station=data.targets.find(t=>t.kind==='station'),reachable=net.reachable(station.node,true);
 for(const t of data.targets.filter(t=>t.kind==='street')){
  assert.match(t.label,/street practice point/);assert.match(t.address,/no verified house number/);assert.ok(!/^\d/.test(t.address));
  assert.ok(inDistrict(data,t.ll,t.area),t.label);assert.ok(reachable.has(t.node),t.label);
  assert.ok(net.choices(t.node,true).some(c=>c.name===t.street),t.label);
 }
 for(const street of ['Glendale Road','Bishopsgate Drive','Redna Terrace','East Leslie Avenue'])assert.ok(data.targets.some(t=>t.kind==='address'&&t.street===street),street);
 for(const street of ['Shivers Court','Hunter Court']){assert.ok(data.targets.some(t=>t.kind==='street'&&t.street===street));assert.ok(!data.targets.some(t=>t.kind==='address'&&t.street===street));}
});
test('county house numbers are sourced, deduplicated, and snapped to the matching district street',()=>{
 const data=JSON.parse(readFileSync(new URL('../dist/practice-network.json',import.meta.url))),source=JSON.parse(readFileSync(new URL('../scripts/data/practice-addresses.json',import.meta.url)));
 const records=new Map(source.records.map(r=>['address-cagis-'+r.id,r])),seen=new Set();let count=0;
 assert.equal(new Set(data.targets.map(t=>t.id)).size,data.targets.length,'target IDs must be unique');
 for(const t of data.targets.filter(t=>t.kind==='address')){
  const key=t.area+'|'+addressStreetKey(t.address);assert.ok(!seen.has(key),t.address);seen.add(key);
  if(!t.id.startsWith('address-cagis-'))continue;count++;
  const r=records.get(t.id);assert.ok(r,t.id);assert.equal(t.address,r.number+' '+t.street);assert.equal(addressStreetKey(t.street),addressStreetKey(r.street));assert.equal(t.area,r.area);
  assert.ok(inDistrict(data,t.ll,t.area),t.address);assert.ok(t.snapMeters<=250);assert.equal(t.source,source.source);
 }
 assert.ok(count>1000);
});
test('address enrichment rejects distant matches and cannot add a point on a road without a return route',()=>{
 const nodes=[[39.24,-84.48],[39.24,-84.478],[39.242,-84.478],[39.244,-84.478]];
 const data={nodes,edges:['Main Road','Blank Lane','One-way Drive'].map((name,i)=>({a:i,b:i+1,name,kind:'residential',one:i===2?1:0,ll:[nodes[i],nodes[i+1]],meters:200})),targets:[{id:'station',kind:'station',node:0}],boundaries:{features:[{properties:{NAME:'Woodlawn village'},geometry:{type:'Polygon',coordinates:[[[-84.49,39.23],[-84.46,39.23],[-84.46,39.25],[-84.49,39.25],[-84.49,39.23]]]}}]}};
 const supplement={source:'test-county',checked:'2026-11-19',records:[{id:'1',number:'10',street:'Main Rd',area:'woodlawn',ll:[39.2401,-84.479]},{id:'2',number:'99',street:'Blank Ln',area:'woodlawn',ll:[39.249,-84.47]}]};
 addPracticeAddresses(data,supplement);
 assert.ok(data.targets.some(t=>t.address==='10 Main Road'));assert.ok(!data.targets.some(t=>t.address==='99 Blank Lane'));
 assert.ok(data.targets.some(t=>t.kind==='street'&&t.street==='Blank Lane'));assert.ok(!data.targets.some(t=>t.street==='One-way Drive'));
 assert.equal(data.addressCoverage.rejected.length,1);
 const before=JSON.stringify({nodes:data.nodes,edges:data.edges,targets:data.targets,revision:data.revision});
 addPracticeAddresses(data,supplement);
 assert.equal(JSON.stringify({nodes:data.nodes,edges:data.edges,targets:data.targets,revision:data.revision}),before,'refresh must preserve targets and graph');
});

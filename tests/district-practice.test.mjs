import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createNetwork,newTrip,drive,returnTrip,rollRailClosure,practiceChoices,turnChoice,uTurnChoice,angle,destinationIsNear} from '../dist/district-practice-engine.js';
const data=JSON.parse(readFileSync(new URL('../dist/practice-network.json',import.meta.url))),net=createNetwork(data);
function route(start,end,blocked=false){const q=[start],seen=new Map([[start,null]]);for(const n of q){if(n===end)break;for(const c of net.choices(n,blocked))if(!seen.has(c.to)){seen.set(c.to,{from:n,...c});q.push(c.to);}}assert.ok(seen.has(end),'target must be reachable');const path=[];let n=end;while(n!==start){const c=seen.get(n);path.unshift(c);n=c.from;}return path;}
function finish(t){for(let i=0;t.status==='driving'&&i<600;i++){const choices=route(t.node,t.target.node,t.blocked);assert.ok(drive(net,t,choices[0]));}assert.equal(t.status,'arrived');}
test('all marked destinations and nine hospitals remain reachable with Marion closed',()=>{const station=data.targets.find(t=>t.kind==='station');const reachable=net.reachable(station.node,true);assert.equal(data.targets.filter(t=>t.kind==='hospital').length,9);assert.ok(data.targets.filter(t=>t.kind==='address').length>100);for(const t of data.targets)assert.ok(reachable.has(t.node),t.label);for(const t of data.targets.filter(t=>t.kind!=='address'))route(t.node,station.node,true);});
test('rail probability is 20% only for Lincoln Heights and closes the actual road',()=>{let count=0;for(let i=0;i<100;i++)count+=rollRailClosure('lincoln',()=>i/100);assert.equal(count,20);assert.equal(rollRailClosure('woodlawn',()=>0),false);assert.equal(rollRailClosure('lincoln',()=>.2),false);const rails=data.edges.map((e,id)=>({...e,id})).filter(e=>e.rail);assert.ok(rails.length);for(const e of rails){assert.ok(!net.choices(e.a,true).some(c=>c.edge===e.id));assert.ok(!net.choices(e.b,true).some(c=>c.edge===e.id));}});
test('normal Marion approach cannot be driven when occupied and a bypass exists',()=>{const t=newTrip(net,{area:'lincoln',destination:'lincoln-fd--main',rng:()=>.5});const normal=route(t.node,t.target.node);assert.ok(normal.some(c=>data.edges[c.edge].rail));t.blocked=true;assert.ok(route(t.node,t.target.node,true).every(c=>!data.edges[c.edge].rail));finish(t);assert.ok(t.history.every(h=>!data.edges[h.edge].rail));assert.ok(t.history.some(h=>/Glendale|Milford/.test(h.road)));});
test('one-way roads cannot be traversed backwards',()=>{for(const [id,e] of data.edges.entries()){if(e.one===1)assert.ok(!net.choices(e.b).some(c=>c.edge===id&&c.reverse));if(e.one===-1)assert.ok(!net.choices(e.a).some(c=>c.edge===id&&!c.reverse));}});
test('landmark practice starts at Station 96, records actual moves, and rejects closure moves',()=>{const t=newTrip(net,{destination:'lincoln-fd--main',area:'lincoln',rng:()=>0});assert.equal(t.origin.kind,'station');assert.equal(t.blocked,true);finish(t);assert.ok(t.history.length);assert.equal(t.meters,t.history.reduce((n,h)=>n+h.meters,0));assert.equal(t.node,t.target.node);assert.equal(drive(net,t,net.choices(t.node)[0]),false);assert.equal(returnTrip(t),true);finish(t);assert.equal(t.target.kind,'station');assert.ok(t.history.some(h=>h.leg==='return'));assert.equal(returnTrip(t),false);});
test('every hospital can be reached from a random address and driven back with separate return directions',()=>{for(const h of data.targets.filter(t=>t.kind==='hospital')){const t=newTrip(net,{mode:'hospital',area:'woodlawn',hospital:h.id,rng:()=>.5});const original=t.origin.node;assert.equal(t.origin.kind,'address');finish(t);const outbound=t.history.length;assert.equal(returnTrip(t),true);finish(t);assert.equal(t.node,original);assert.ok(t.history.length>outbound);assert.ok(t.history.slice(outbound).every(x=>x.leg==='return'));}});
test('random addresses are district addresses and unsupported locations never appear',()=>{for(const area of ['woodlawn','lincoln']){const t=newTrip(net,{mode:'address',area,rng:()=>.7});assert.equal(t.target.area,area);assert.equal(t.target.kind,'address');assert.match(t.target.address,/\d/);}assert.ok(!data.targets.some(t=>t.id.startsWith('trillium')));});

test('the four courts use the saved correction and every target is on the matching court',()=>{
 const expected=['Shivers Court','Able Court','Love Court','Hunter Court'];
 const targets=expected.map(name=>data.targets.find(t=>t.label===name));
 for(let i=0;i<targets.length;i++){const t=targets[i];assert.equal(t.street,expected[i]);assert.ok(net.choices(t.node).every(c=>c.name===expected[i]));if(i)assert.ok(t.ll[1]<targets[i-1].ll[1],'court order is east to west');}
});
test('every random address is placed on its named street, including 529 Matthews Drive',()=>{
 for(const t of data.targets.filter(t=>t.kind==='address')){assert.equal(t.address.replace(/^\S+\s+/,''),t.street);assert.ok(data.edges.some(e=>(e.a===t.node||e.b===t.node)&&e.name===t.street),t.address);}
 const t=data.targets.find(t=>t.address==='529 Matthews Drive');assert.equal(t.street,'Matthews Drive');assert.ok(net.choices(t.node).every(c=>c.name==='Matthews Drive'));
});

test('firehouse departure offers only Springfield Pike north or south',()=>{
 const t=newTrip(net),choices=practiceChoices(net,t);assert.equal(choices.length,2);assert.ok(choices.every(c=>c.name==='Springfield Pike'));
 const left=turnChoice(net,t,'left'),right=turnChoice(net,t,'right');assert.ok(angle(t.heading,left.heading)<0);assert.ok(angle(t.heading,right.heading)>0);assert.notEqual(left.to,right.to);
});
test('selecting a U-turn leaves location, heading and history untouched until driving is confirmed',()=>{
 const t=newTrip(net);drive(net,t,turnChoice(net,t,'right'));const before=JSON.stringify(t),choice=uTurnChoice(net,t);assert.ok(choice);assert.equal(JSON.stringify(t),before);const start=t.node;drive(net,t,choice);assert.notEqual(t.node,start);assert.equal(t.history.findLast(h=>h.turn!=='Continue').turn,'U-turn');
});
test('a click is bounded on highways and near hospital entrances and exits',()=>{
 let highway=0,campus=0;for(const [id,e] of data.edges.entries()){
  if(e.one===-1)continue;const c=net.choices(e.a).find(c=>c.edge===id);if(!c)continue;
  if(e.nearHospital){campus++;const step=net.travel(e.a,c,-1);assert.ok(step.meters<=70,'campus move '+step.meters);}
  else if(e.kind==='motorway'&&highway<200){highway++;const step=net.travel(e.a,c,-1);assert.ok(step.meters<=850,'highway move '+step.meters);}
 }assert.ok(campus>100);assert.equal(highway,200);
});
test('destination pin appears on the correct street within a few moves, not while on another street',()=>{
 const target=data.targets.find(t=>t.address==='529 Matthews Drive'),approach=data.edges.find(e=>e.b===target.node&&e.name==='Matthews Drive'),t={target,node:approach.a,blocked:false,history:[{road:'Matthews Drive'}]};assert.equal(destinationIsNear(net,t),true);t.history=[{road:'Chester Road'}];assert.equal(destinationIsNear(net,t),false);
});
test('Bethesda includes SR-126, both I-275 directions, Exit 50 and campus access roads',()=>{
 assert.ok(data.edges.some(e=>e.ref==='SR 126'));assert.ok(data.edges.some(e=>e.ref==='I 275'));
 assert.ok(data.landmarks.some(l=>l.label.startsWith('Exit 50')));
 assert.ok(data.edges.some(e=>/Exit 50/.test(e.sign)));assert.ok(data.edges.some(e=>/Columbus/.test(e.sign)));
 for(const h of data.targets.filter(t=>t.kind==='hospital'))assert.ok(data.edges.filter(e=>e.nearHospital&&e.ll.some(p=>Math.hypot((p[0]-h.ll[0])*111000,(p[1]-h.ll[1])*86000)<500)).length>10,h.label);
});


test('left and right cycle through Continue and all forward directions, never U-turn',()=>{
 const n=createNetwork({nodes:[[0,0],[1,-1],[1,0],[1,1],[-1,0]],edges:[1,2,3,4].map((b,i)=>({a:0,b,name:'Road '+i,ll:[[0,0],[[1,-1],[1,0],[1,1],[-1,0]][i]],one:0,meters:10}))});
 const t={node:0,heading:0,history:[{from:4}],origin:{},leg:'outbound'},before=JSON.stringify(t),forward=n.choices(0).find(c=>c.to===2);
 let c=forward;const seen=new Set();for(let i=0;i<3;i++){c=turnChoice(n,t,'right',c);seen.add(c.to);}assert.deepEqual([...seen].sort(),[1,2,3]);assert.equal(c.to,2);
 c=turnChoice(n,t,'left',forward);assert.equal(c.to,1);c=turnChoice(n,t,'right',c);assert.equal(c.to,2);
 const reverse=uTurnChoice(n,t);assert.equal(reverse.to,4);assert.notEqual(turnChoice(n,t,'right',reverse).to,4);assert.equal(JSON.stringify(t),before);
});


test('hospital pins appear on approaches two miles away regardless of street or click count',()=>{
 for(const target of data.targets.filter(t=>t.kind==='hospital')){
  const nearby=data.nodes.findIndex(p=>{const m=Math.hypot((p[0]-data.nodes[target.node][0])*111000,(p[1]-data.nodes[target.node][1])*86000);return m>1500&&m<3000;});
  assert.ok(nearby>=0,target.label);const t={target,node:nearby,history:[{road:'Different approach road'}]};assert.equal(destinationIsNear(net,t),true,target.label);
  const far=data.nodes.findIndex(p=>Math.hypot((p[0]-data.nodes[target.node][0])*111000,(p[1]-data.nodes[target.node][1])*86000)>4000);t.node=far;assert.equal(destinationIsNear(net,t),false);t.hospitalPinRevealed=true;assert.equal(destinationIsNear(net,t),true);
 }
});

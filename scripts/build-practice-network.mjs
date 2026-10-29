// Refresh with an Overpass JSON export containing driving ways and district addresses.
// Shared OSM node IDs join roads; grade-separated crossings never join by proximity.
import {readFile,writeFile} from 'node:fs/promises';
import {destinations,stationId} from '../dist/local-destinations.js';
import {hospitalPlaces} from '../dist/hospital-map-data.js';
const input=JSON.parse(await readFile(process.argv[2]));
const geography=JSON.parse(await readFile(new URL('../dist/local-geography.json',import.meta.url)));
const meters=(a,b)=>Math.hypot((a[0]-b[0])*111000,(a[1]-b[1])*86000);
const ways=input.elements.filter(e=>e.type==='way'&&e.tags?.highway&&e.geometry&&!['private','no'].includes(e.tags.access)&&!['private','no'].includes(e.tags.motor_vehicle)&&!['private','no'].includes(e.tags.vehicle)&&e.tags.service!=='parking_aisle');
const points=new Map(),uses=new Map(),ends=new Set();
for(const w of ways){w.nodes.forEach((id,i)=>{points.set(id,[w.geometry[i].lat,w.geometry[i].lon]);uses.set(id,(uses.get(id)||0)+1);});ends.add(w.nodes[0]);ends.add(w.nodes.at(-1));}
function inside(p,ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[0])!==(b[1]>p[0])&&p[1]<(b[0]-a[0])*(p[0]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
function areaOf(p){for(const f of geography.municipalities.features){const area=f.properties.NAME.startsWith('Woodlawn')?'woodlawn':f.properties.NAME.startsWith('Lincoln Heights')?'lincoln':null;if(!area)continue;const polygons=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;if(polygons.some(poly=>inside(p,poly[0])&&!poly.slice(1).some(r=>inside(p,r))))return area;}return null;}
const targets=destinations.filter(d=>!d.routeUnavailable).flatMap(d=>(d.entrances||[{id:'main',ll:d.ll,address:d.address}]).map(e=>({id:d.id+'--'+e.id,label:d.name+(e.id!=='main'?' · '+e.label:''),address:e.address,area:d.area,ll:e.ll,number:d.number,kind:d.id===stationId?'station':'landmark'})));
for(const h of hospitalPlaces)targets.push({id:h.id,label:h.label,address:h.address,ll:h.ll,kind:'hospital'});
const addresses=new Set();
for(const e of input.elements){if(!e.tags?.['addr:housenumber']||!e.tags['addr:street'])continue;const ll=e.lat?[e.lat,e.lon]:e.geometry?.length?[e.geometry.reduce((s,p)=>s+p.lat,0)/e.geometry.length,e.geometry.reduce((s,p)=>s+p.lon,0)/e.geometry.length]:null;if(!ll)continue;const area=areaOf(ll),address=e.tags['addr:housenumber']+' '+e.tags['addr:street'];if(!area||addresses.has(address))continue;addresses.add(address);targets.push({id:'address-'+e.id,label:address,address,area,ll,kind:'address'});}
// Only choose addresses and entrances reachable in both directions from the station.
const raw=new Map([...points.keys()].map(id=>[id,[]])),reverseRaw=new Map([...points.keys()].map(id=>[id,[]]));
for(const w of ways){const one=w.tags.oneway==='-1'?-1:['yes','1','true'].includes(w.tags.oneway)||w.tags.junction==='roundabout'||(w.tags.highway==='motorway'&&w.tags.oneway!=='no')?1:0;for(let i=1;i<w.nodes.length;i++){const a=w.nodes[i-1],b=w.nodes[i];if(one!==-1){raw.get(a).push(b);reverseRaw.get(b).push(a);}if(one!==1){raw.get(b).push(a);reverseRaw.get(a).push(b);}}}
const localVertices=new Set(ways.filter(w=>!['motorway','motorway_link','trunk','trunk_link'].includes(w.tags.highway)).flatMap(w=>w.nodes));
const station=targets.find(t=>t.kind==='station');let seed=[...localVertices].sort((a,b)=>meters(points.get(a),station.ll)-meters(points.get(b),station.ll))[0];
function visit(graph){const seen=new Set([seed]),q=[seed];for(const n of q)for(const next of graph.get(n))if(!seen.has(next)){seen.add(next);q.push(next);}return seen;}
const fromStation=visit(raw),toStation=visit(reverseRaw);
for(const id of localVertices)if(!fromStation.has(id)||!toStation.has(id))localVertices.delete(id);
for(const t of targets){let best=Infinity;for(const id of localVertices){const d=meters(points.get(id),t.ll);if(d<best){best=d;t.osm=id;}}t.snapMeters=Math.round(best);ends.add(t.osm);}
const nodeIds=[...points.keys()].filter(id=>ends.has(id)||uses.get(id)>1),index=new Map(nodeIds.map((id,i)=>[id,i])),nodes=nodeIds.map(id=>points.get(id)),edges=[];
const crossing=[39.2518212,-84.4674834];
function segmentDistance(p,a,b){const x=(b[1]-a[1])*86000,y=(b[0]-a[0])*111000,px=(p[1]-a[1])*86000,py=(p[0]-a[0])*111000,t=Math.max(0,Math.min(1,(px*x+py*y)/(x*x+y*y||1)));return Math.hypot(px-t*x,py-t*y);}
for(const w of ways){let from=0;for(let i=1;i<w.nodes.length;i++){if(!index.has(w.nodes[i]))continue;const ll=w.nodes.slice(from,i+1).map(id=>points.get(id));const name=({'Hunter Court':'Shivers Court','Shivers Court':'Hunter Court'}[w.tags.name]||w.tags.name||w.tags.ref||(w.tags.highway.endsWith('_link')?'Highway ramp':'Access road'));const one=w.tags.oneway==='-1'?-1:['yes','1','true'].includes(w.tags.oneway)||w.tags.junction==='roundabout'||(w.tags.highway==='motorway'&&w.tags.oneway!=='no')?1:0;edges.push({a:index.get(w.nodes[from]),b:index.get(w.nodes[i]),name,kind:w.tags.highway,one,ll,meters:Math.round(ll.slice(1).reduce((s,p,j)=>s+meters(ll[j],p),0)),rail:ll.some((p,j)=>j&&segmentDistance(crossing,ll[j-1],p)<16)});from=i;}}
const adjacency=nodes.map(()=>[]);edges.forEach((e,i)=>{if(e.one!==-1)adjacency[e.a].push([e.b,i]);if(e.one!==1)adjacency[e.b].push([e.a,i]);});
const origin=index.get(targets.find(t=>t.kind==='station').osm);
function reachable(reverse=false){const a=nodes.map(()=>[]);edges.forEach(e=>{if(e.one!==-1)a[reverse?e.b:e.a].push(reverse?e.a:e.b);if(e.one!==1)a[reverse?e.a:e.b].push(reverse?e.b:e.a);});const seen=new Set([origin]),q=[origin];for(const n of q)for(const next of a[n])if(!seen.has(next)){seen.add(next);q.push(next);}return seen;}
const forward=reachable(),back=reachable(true);
const usable=targets.filter(t=>forward.has(index.get(t.osm))&&back.has(index.get(t.osm))&&t.snapMeters<250).map(({osm,...t})=>({...t,node:index.get(osm)}));
for(const t of targets.filter(t=>t.kind!=='address'))if(!usable.some(u=>u.id===t.id))throw Error('Unreachable destination: '+t.label+' ('+t.snapMeters+' m)');
await writeFile(new URL('../dist/practice-network.json',import.meta.url),JSON.stringify({source:'OpenStreetMap / OSRM',checked:'2026-10-28',nodes,edges:edges.filter(e=>forward.has(e.a)&&back.has(e.a)&&forward.has(e.b)&&back.has(e.b)),targets:usable,rails:geography.rails,boundaries:{type:'FeatureCollection',features:geography.municipalities.features.filter(f=>/^(Woodlawn|Lincoln Heights)/.test(f.properties.NAME))}}));
console.log({nodes:nodes.length,edges:edges.length,targets:usable.length,addresses:usable.filter(t=>t.kind==='address').length,railEdges:edges.filter(e=>e.rail).length});

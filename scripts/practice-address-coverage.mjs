import {createNetwork,distance} from '../dist/district-practice-engine.js';
import {projection,streetKey} from './refine-practice-network.mjs';
import {createHash} from 'node:crypto';
const roadKinds=new Set(['residential','living_street','unclassified','tertiary','secondary','primary','service']);
export const addressStreetKey=streetKey;
function inside(p,ring){let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>p[0])!==(b[1]>p[0])&&p[1]<(b[0]-a[0])*(p[0]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
export function inDistrict(data,p,area){return data.boundaries.features.filter(f=>f.properties.NAME.startsWith(area==='woodlawn'?'Woodlawn':'Lincoln Heights')).some(f=>(f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates).some(poly=>inside(p,poly[0])&&!poly.slice(1).some(r=>inside(p,r))));}
export function streetCoverage(data){
 const groups=new Map();
 for(const [id,e] of data.edges.entries()){
  if(!roadKinds.has(e.kind)||!e.name||e.name==='Access road')continue;
  for(const area of ['woodlawn','lincoln']){
   const samples=e.ll.slice(1).map((p,i)=>[(p[0]+e.ll[i][0])/2,(p[1]+e.ll[i][1])/2]);
   if(!samples.some(p=>inDistrict(data,p,area)))continue;
   const key=area+'|'+addressStreetKey(e.name);
   if(!groups.has(key))groups.set(key,{area,street:e.name,edges:[],addresses:[],points:[]});groups.get(key).edges.push(id);
  }
 }
 for(const t of data.targets){const g=groups.get(t.area+'|'+addressStreetKey(t.street));if(g){if(t.kind==='address')g.addresses.push(t);if(t.kind==='street')g.points.push(t);}}
 return [...groups.values()].sort((a,b)=>a.area.localeCompare(b.area)||a.street.localeCompare(b.street));
}
function splitAt(data,id,segment,ll){
 const e=data.edges[id];
 if(distance(ll,e.ll[0])<.2)return e.a;
 if(distance(ll,e.ll.at(-1))<.2)return e.b;
 const node=data.nodes.length;data.nodes.push(ll);
 const length=points=>Math.round(points.slice(1).reduce((sum,p,i)=>sum+distance(points[i],p),0));
 const first=[...e.ll.slice(0,segment),ll],last=[ll,...e.ll.slice(segment)];
 data.edges.splice(id,1,{...e,b:node,ll:first,meters:length(first)},{...e,a:node,ll:last,meters:length(last)});
 return node;
}
export function addPracticeAddresses(data,supplement){
 // Preserve every existing local correction and target; only split driving edges.
 const network=createNetwork(data),station=data.targets.find(t=>t.kind==='station');
 const reachable=network.reachable(station.node,true),reverse=data.nodes.map(()=>[]);
 for(const e of data.edges){if(e.rail)continue;if(e.one!==-1)reverse[e.b].push(e.a);if(e.one!==1)reverse[e.a].push(e.b);}
 const back=new Set([station.node]),q=[station.node];for(const n of q)for(const next of reverse[n])if(!back.has(next)){back.add(next);q.push(next);}
 const safe=e=>reachable.has(e.a)&&reachable.has(e.b)&&back.has(e.a)&&back.has(e.b);
 const usable=new WeakSet(data.edges.filter(safe));
 const edgeKeys=new WeakMap(),edgeKey=e=>{if(!edgeKeys.has(e))edgeKeys.set(e,addressStreetKey(e.name));return edgeKeys.get(e);};
 const snap=(ll,street,area)=>{
  let best={meters:Infinity};const key=addressStreetKey(street);
  for(const [id,e] of data.edges.entries()){
   if(!usable.has(e)||edgeKey(e)!==key)continue;
   for(let segment=1;segment<e.ll.length;segment++){const p=projection(ll,e.ll[segment-1],e.ll[segment]);if(p.meters<best.meters&&inDistrict(data,p.ll,area))best={...p,id,segment};}
  }
  return best;
 };
 const split=point=>{const before=data.edges[point.id],node=splitAt(data,point.id,point.segment,point.ll);if(!data.edges.includes(before)){usable.add(data.edges[point.id]);usable.add(data.edges[point.id+1]);}return node;};
 const names=new Map(data.edges.filter(e=>roadKinds.has(e.kind)&&e.name!=='Access road').map(e=>[addressStreetKey(e.name),e.name]));
 const existing=new Set(data.targets.filter(t=>t.kind==='address').map(t=>t.area+'|'+addressStreetKey(t.address)));
 const report={source:supplement.source,checked:supplement.checked,added:0,rejected:[],unmatchedStreets:{},localCourtConflicts:['Shivers Court','Hunter Court'],streets:[]};
 for(const r of supplement.records){
  const street=names.get(addressStreetKey(r.street));
  if(!street){const key=r.area+'|'+r.street;report.unmatchedStreets[key]=(report.unmatchedStreets[key]||0)+1;continue;}
  if(!inDistrict(data,r.ll,r.area))continue;
  // The department's Shivers / Hunter correction conflicts with the imported
  // county labels. Use street points until house numbering is locally confirmed.
  if(['Shivers Court','Hunter Court'].includes(street))continue;
  const address=r.number+' '+street,key=r.area+'|'+addressStreetKey(address);if(existing.has(key))continue;
  const point=snap(r.ll,street,r.area);
  if(point.meters>250){report.rejected.push({address,area:r.area,reason:'No matching reachable street within 250 meters'});continue;}
  const node=split(point);if(node===station.node)continue;
  data.targets.push({id:'address-cagis-'+r.id,label:address,address,area:r.area,ll:data.nodes[node],sourceLL:r.ll,node,street,kind:'address',snapMeters:Math.round(point.meters),source:supplement.source});existing.add(key);report.added++;
 }
 const covered=new Set(data.targets.filter(t=>t.kind==='address').map(t=>t.area+'|'+addressStreetKey(t.street)));
 data.targets=data.targets.filter(t=>t.kind!=='street'||!covered.has(t.area+'|'+addressStreetKey(t.street)));
 for(const group of streetCoverage(data)){
  if(group.addresses.length||group.points.length)continue;
  let point=null;
  for(const [id,e] of data.edges.entries()){if(!usable.has(e)||edgeKey(e)!==addressStreetKey(group.street))continue;
   for(let segment=1;segment<e.ll.length;segment++){
    const a=e.ll[segment-1],b=e.ll[segment],ll=[(a[0]+b[0])/2,(a[1]+b[1])/2],length=distance(a,b);
    if(inDistrict(data,ll,group.area)&&(!point||length>point.length))point={id,segment,ll,length};
   }
  }
  if(point){const node=split(point),label=group.street+' · street practice point';
   data.targets.push({id:'street-'+group.area+'-'+addressStreetKey(group.street),label,address:group.street+' (no verified house number)',area:group.area,ll:data.nodes[node],node,street:group.street,kind:'street',source:'Saved OpenStreetMap driving network with local corrections'});
  }
 }
 report.streets=streetCoverage(data).map(({area,street,addresses,points})=>({area,street,addresses:addresses.length,streetPoints:points.length}));
 report.countyAddresses=data.targets.filter(t=>t.id.startsWith('address-cagis-')).length;
 data.addressCoverage=report;
 data.revision=supplement.checked+'-'+createHash('sha256').update(JSON.stringify({nodes:data.nodes,edges:data.edges,targets:data.targets})).digest('hex').slice(0,12);
 return data;
}

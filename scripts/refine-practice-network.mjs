// Apply the department's saved map corrections and choose street-specific driving targets.
import {createHash} from 'node:crypto';
import {distance,bearing} from '../dist/district-practice-engine.js';
export const streetKey=s=>String(s||'').toLowerCase().replace(/[’']/g,'').replace(/\b(north|south|east|west)\b/g,m=>m[0]).replace(/\b(road|rd)\b/g,'rd').replace(/\b(drive|dr)\b/g,'dr').replace(/\b(court|ct)\b/g,'ct').replace(/\b(avenue|ave)\b/g,'ave').replace(/\b(street|st)\b/g,'st').replace(/\b(boulevard|blvd)\b/g,'blvd').replace(/[^a-z0-9]/g,'');
export function projection(p,a,b){const x=(b[1]-a[1])*86000,y=(b[0]-a[0])*111000,px=(p[1]-a[1])*86000,py=(p[0]-a[0])*111000,t=Math.max(0,Math.min(1,(px*x+py*y)/(x*x+y*y||1))),ll=[a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])];return {ll,t,meters:distance(p,ll)};}
const lineLength=ll=>ll.slice(1).reduce((sum,p,i)=>sum+distance(ll[i],p),0);
export function refinePracticeNetwork(data,geography){
 const {nodes,targets}=data;let edges=data.edges;
 // Name court geometry from the exact corrected map resource, never from imported labels.
 const courtNames=new Set(['Hunter Court','Able Court','Shivers Court','Love Court']),courts=geography.roads.filter(r=>courtNames.has(r.name));
 for(const e of edges.filter(e=>courtNames.has(e.name))){const p=e.ll[Math.floor(e.ll.length/2)];let best={meters:Infinity};for(const r of courts)for(let i=1;i<r.ll.length;i++){const q=projection(p,r.ll[i-1],r.ll[i]);if(q.meters<best.meters)best={...q,name:r.name};}e.name=best.name;}
 // Project onto the named street and split the edge there. Nearest intersection alone can be on a different street.
 function snap(target,wanted){let best={meters:Infinity};for(let id=0;id<edges.length;id++){const e=edges[id];if(wanted&&!wanted(e))continue;if(/motorway|trunk/.test(e.kind))continue;for(let i=1;i<e.ll.length;i++){const q=projection(target.ll,e.ll[i-1],e.ll[i]);if(q.meters<best.meters)best={...q,id,segment:i};}}
 if(best.id===undefined)return null;const e=edges[best.id];let node;if(distance(best.ll,e.ll[0])<.2)node=e.a;else if(distance(best.ll,e.ll.at(-1))<.2)node=e.b;else{node=nodes.length;nodes.push(best.ll);const ll1=[...e.ll.slice(0,best.segment),best.ll],ll2=[best.ll,...e.ll.slice(best.segment)];edges.splice(best.id,1,{...e,b:node,ll:ll1,meters:Math.round(lineLength(ll1))},{...e,a:node,ll:ll2,meters:Math.round(lineLength(ll2))});}
 return {node,ll:best.ll,street:e.name,meters:best.meters};}
 // Local correction: Schumard's imported west endpoint stops short of North Wayne.
 const schumard=edges.filter(e=>e.name==='Schumard Avenue').flatMap(e=>[e.a,e.b]).sort((a,b)=>nodes[a][1]-nodes[b][1])[0];
 if(schumard!==undefined){const junction=snap({ll:nodes[schumard]},e=>e.name==='North Wayne Avenue');if(!junction||junction.meters>75)throw Error('Schumard / North Wayne correction no longer matches source');if(junction.meters>1)edges.push({a:junction.node,b:schumard,name:'Schumard Avenue',ref:'',sign:'',kind:'residential',one:0,ll:[nodes[junction.node],nodes[schumard]],meters:Math.round(junction.meters),rail:false,correction:'local Schumard / North Wayne connection'});}
 const omitted=[];
 for(const t of targets){let road=t.kind==='address'?t.address.replace(/^\S+\s+/,''):courtNames.has(t.label)?t.label:t.kind==='station'?'Springfield Pike':null;
 const point=road?snap(t.kind==='station'?{...t,ll:[39.2511441,-84.4703906]}:t,e=>streetKey(e.name)===streetKey(road)):null;
 if(road&&(!point||point.meters>250)){if(t.kind==='address'){omitted.push(t.id);continue;}throw Error('No street approach for '+t.label);}
 if(point){t.sourceLL=t.ll;t.ll=point.ll;t.node=point.node;t.street=point.street;t.snapMeters=Math.round(point.meters);}
 else{t.street=edges.find(e=>e.a===t.node||e.b===t.node)?.name||'Access road';}
 if(t.kind==='station'){t.stationExit=true;t.heading=90;t.street='Springfield Pike';}
 }
 const hospitals=targets.filter(t=>t.kind==='hospital');
 // Every long edge has intermediate vertices so a click cannot skip miles or a whole campus.
 const split=[];
 for(const e of edges){const motorway=/motorway|trunk/.test(e.kind),nearHospital=!motorway&&hospitals.some(h=>e.ll.some(p=>distance(p,h.ll)<950)),limit=nearHospital?55:motorway?400:140;
 let from=e.a,ll=[e.ll[0]],length=0;
 for(let i=1;i<e.ll.length;i++){let a=e.ll[i-1],b=e.ll[i],remaining=distance(a,b);while(length+remaining>limit+.01){const fraction=(limit-length)/remaining,p=[a[0]+(b[0]-a[0])*fraction,a[1]+(b[1]-a[1])*fraction],node=nodes.length;nodes.push(p);ll.push(p);split.push({...e,a:from,b:node,ll,meters:Math.round(lineLength(ll)),nearHospital});from=node;ll=[p];a=p;remaining=distance(a,b);length=0;}ll.push(b);length+=remaining;}
 if(ll.length>1)split.push({...e,a:from,b:e.b,ll,meters:Math.round(lineLength(ll)),nearHospital});
 }
 data.edges=split;data.targets=targets.filter(t=>!omitted.includes(t.id));data.revision='2026-10-29-'+createHash('sha256').update(JSON.stringify({nodes,edges:split,targets:data.targets})).digest('hex').slice(0,12);data.checked='2026-10-29';data.corrections={courts:'local-geography.json',addressPlacement:'projected onto matching named street',station:'Springfield Pike frontage',omittedAddresses:omitted.length};
 return data;
}

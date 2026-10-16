// Refresh static driving routes after editing local-destinations.js.
// Run: node scripts/build-local-routes.mjs (requires public internet access).
// Cached routes are checked against mapped at-grade crossings before yellow routes are exported.
import {destinations,stationId} from '../dist/local-destinations.js';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const geography=JSON.parse(await readFile(new URL('../dist/local-geography.json',import.meta.url)));
const start=destinations.find(d=>d.id===stationId).ll;
const cache=new URL('../.local-route-cache/',import.meta.url);await mkdir(cache,{recursive:true});
const distance=(a,b)=>Math.hypot((a[0]-b[0])*111000,(a[1]-b[1])*86000);
function segmentDistance(p,a,b){const x=(b[1]-a[1])*86000,y=(b[0]-a[0])*111000,px=(p[1]-a[1])*86000,py=(p[0]-a[0])*111000;const t=Math.max(0,Math.min(1,(px*x+py*y)/(x*x+y*y||1)));return Math.hypot(px-t*x,py-t*y);}
function crosses(points){return geography.crossings.filter(p=>points.some((b,i)=>i&&segmentDistance(p,points[i-1],b)<14));}
async function getRoute(id,points){
 const file=new URL(id+'.json',cache);let data;try{data=JSON.parse(await readFile(file));}catch{
 const url='https://router.project-osrm.org/route/v1/driving/'+points.map(p=>p[1]+','+p[0]).join(';')+'?overview=full&geometries=geojson&steps=true';
 data=JSON.parse(execFileSync('curl',['-fsS','--retry','2','--max-time','35',url],{encoding:'utf8'}));if(data.code!=='Ok')throw Error(id+': '+data.code);await writeFile(file,JSON.stringify(data));await new Promise(r=>setTimeout(r,150));}
 const route=data.routes[0],ll=route.geometry.coordinates.map(([x,y])=>[y,x]);
 const steps=route.legs.flatMap(l=>l.steps).filter(s=>s.distance>8&&s.maneuver.type!=='arrive').map(s=>({road:({'Hunter Court':'Shivers Court','Shivers Court':'Hunter Court'}[s.name]||s.name||'Access road'),ref:s.ref||null,turn:s.maneuver.modifier||s.maneuver.type,meters:Math.round(s.distance)}));
 return {ll,meters:Math.round(route.distance),steps,crossings:crosses(ll)};
}
const routes={};
for(const d of destinations){
 if(d.id===stationId||d.routeUnavailable)continue;
 for(const entrance of d.entrances||[{id:'main',ll:d.ll}]){
  const key=d.id+'--'+entrance.id;const normal=await getRoute(key,[start,entrance.ll]);let blocked=null;
  if(d.area==='lincoln'){
   // Glendale–Milford passes beneath the CSX tracks: the railway itself is tagged bridge=yes.
   blocked=await getRoute(key+'--train',[start,[39.2574452,-84.4650967],entrance.ll]);
   if(blocked.crossings.length)throw Error(key+' alternate still uses a mapped at-grade rail crossing');
  }
  if(normal.meters>18000||blocked?.meters>18000)throw Error(key+' unexpected outlier route');
  routes[key]={normal,blocked};console.log(key,normal.meters,blocked?.meters||'');
 }
}
await writeFile(new URL('../dist/local-routes.json',import.meta.url),JSON.stringify({source:'OpenStreetMap via OSRM',checked:'2026-10-15',start,routes}));

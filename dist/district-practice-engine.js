export const distance=(a,b)=>Math.hypot((a[0]-b[0])*111000,(a[1]-b[1])*86000);
export const bearing=(a,b)=>(Math.atan2((b[1]-a[1])*86000,(b[0]-a[0])*111000)*180/Math.PI+360)%360;
export const angle=(a,b)=>((b-a+540)%360)-180;
export function turnName(delta){return Math.abs(delta)>150?'U-turn':Math.abs(delta)<25?'Continue':delta<0?'Turn left':'Turn right';}
export function createNetwork(data){
 const adjacent=data.nodes.map(()=>[]);
 data.edges.forEach((e,id)=>{if(e.one!==-1)adjacent[e.a].push({edge:id,to:e.b,reverse:false});if(e.one!==1)adjacent[e.b].push({edge:id,to:e.a,reverse:true});});
 const path=c=>c.reverse?[...data.edges[c.edge].ll].reverse():data.edges[c.edge].ll;
 const choices=(node,blocked=false)=>adjacent[node].filter(c=>!blocked||!data.edges[c.edge].rail).map(c=>({...c,heading:bearing(path(c)[0],path(c)[1]),name:data.edges[c.edge].name,sign:data.edges[c.edge].sign||'',ref:data.edges[c.edge].ref||''})).filter((c,i,a)=>a.findIndex(x=>x.to===c.to&&x.name===c.name)===i);
 function reachable(start,blocked=false){const seen=new Set([start]),q=[start];for(const n of q)for(const c of choices(n,blocked))if(!seen.has(c.to)){seen.add(c.to);q.push(c.to);}return seen;}
 // Each press advances a bounded distance. Hospital drives stop frequently, even without a junction.
 function travel(node,choice,target,blocked=false,arrived=n=>n===target){
  let c=choices(node,blocked).find(x=>x.edge===choice.edge&&x.to===choice.to);if(!c)return null;
  const segments=[],visited=new Set();let traveled=0;
  const first=data.edges[c.edge],limit=first.nearHospital?70:/motorway|trunk/.test(first.kind)?850:240;
  for(let i=0;i<500;i++){
   if(visited.has(c.edge))break;const e=data.edges[c.edge],ll=path(c);
   if(segments.length&&traveled+e.meters>limit)break;
   visited.add(c.edge);segments.push({...c,from:node,ll,meters:e.meters,endHeading:bearing(ll.at(-2),ll.at(-1))});traveled+=e.meters;
   const previous=node;node=c.to;if(arrived(node)||traveled>=limit)break;
   const next=choices(node,blocked).filter(x=>x.to!==previous);if(next.length!==1)break;
   // Keep entrances, exits and changes of road as separate decisions.
   const upcoming=data.edges[next[0].edge];if(upcoming.name!==e.name||upcoming.kind!==e.kind||upcoming.nearHospital&&!e.nearHospital)break;c=next[0];
  }
  return {node,segments,meters:traveled};
 }
 return {...data,choices,path,reachable,travel};
}
export function rollRailClosure(area,rng=Math.random){return area==='lincoln'&&rng()<.2;}
export function newTrip(network,{mode='landmark',area='all',destination='random',hospital='random',rng=Math.random}={}){
 const pick=a=>a[Math.min(a.length-1,Math.floor(rng()*a.length))];
 const station=network.targets.find(t=>t.kind==='station');
 const pool=network.targets.filter(t=>(area==='all'||t.area===area)&&t.kind===(mode==='landmark'?'landmark':'address')&&t.node!==station.node);
 if(!pool.length)throw Error('No practice locations are available in this district.');
 const call=destination==='random'||mode!=='landmark'?pick(pool):pool.find(t=>t.id===destination);
 if(!call)throw Error('Choose a destination in the selected district.');
 const blocked=rollRailClosure(call.area,rng);
 const hospitals=network.targets.filter(t=>t.kind==='hospital');
 const target=mode==='hospital'?(hospital==='random'?pick(hospitals):hospitals.find(t=>t.id===hospital)):call;
 const origin=mode==='hospital'?call:station;
 if(!target||!network.reachable(origin.node,blocked).has(target.node)||!network.reachable(target.node,blocked).has(origin.node))throw Error('This trip is unavailable. Choose another location.');
 return {mode,origin,target,call,blocked,node:origin.node,heading:origin.heading??0,networkRevision:network.revision,leg:'outbound',status:'driving',history:[],meters:0,started:Date.now(),legStarted:Date.now()};
}
export function isArrivalNode(network,trip,node=trip.node){
 if(node===trip.target.node)return true;
 return trip.target.kind==='hospital'&&distance(network.nodes[node],network.nodes[trip.target.node])<=25&&network.choices(node,trip.blocked).some(c=>network.edges[c.edge].kind==='service');
}
export function completeArrival(network,trip){
 if(trip?.status==='driving'&&isArrivalNode(network,trip)){trip.status='arrived';trip.arrived=Date.now();return true;}return false;
}
export function drive(network,trip,choice){
 if(trip.status!=='driving')return false;
 const result=network.travel(trip.node,choice,trip.target.node,trip.blocked,node=>isArrivalNode(network,trip,node));if(!result)return false;
 for(const [i,s] of result.segments.entries()){const delta=angle(trip.heading,s.heading),previous=trip.history.at(-1);trip.history.push({edge:s.edge,reverse:s.reverse,from:s.from,to:s.to,road:s.name,turn:trip.history.length?(i>0&&previous?.road===s.name?'Continue':Math.abs(delta)>150&&previous&&s.to!==previous.from?(delta<0?'Sharp left':'Sharp right'):turnName(delta)):'Depart',meters:s.meters,leg:trip.leg,at:Date.now()});trip.meters+=s.meters;trip.heading=s.endHeading;}
 trip.node=result.node;
 if(trip.target.kind==='hospital'&&distance(network.nodes[trip.node],network.nodes[trip.target.node])<=3219)trip.hospitalPinRevealed=true;
 completeArrival(network,trip);
 return true;
}
export function returnTrip(trip){if(trip.status!=='arrived'||trip.leg==='return')return false;const old=trip.origin;trip.origin=trip.target;trip.target=old;trip.leg='return';trip.status='driving';trip.legStarted=Date.now();return true;}

export function practiceChoices(network,trip){
 const options=network.choices(trip.node,trip.blocked);
 return trip.origin.stationExit&&trip.history.length===0&&trip.leg==='outbound'?options.filter(c=>c.name==='Springfield Pike'):options;
}
export function uTurnChoice(network,trip){
 const options=practiceChoices(network,trip),last=trip.history.at(-1);
 if(last)return options.find(c=>c.to===last.from)||null;
 return options.filter(c=>Math.abs(angle(trip.heading,c.heading))>150).sort((a,b)=>Math.abs(angle(trip.heading,b.heading))-Math.abs(angle(trip.heading,a.heading)))[0]||null;
}
const streetKey=s=>String(s||'').toLowerCase().replace(/\b(road|rd)\b/g,'rd').replace(/\b(drive|dr)\b/g,'dr').replace(/\b(court|ct)\b/g,'ct').replace(/\b(avenue|ave)\b/g,'ave').replace(/\b(street|st)\b/g,'st').replace(/[^a-z0-9]/g,'');
export function destinationIsNear(network,trip){
 if(!trip)return false;if(trip.node===trip.target.node)return true;
 // Reveal hospital campuses on the approach, independently of street names and click count.
 if(trip.target.kind==='hospital')return !!trip.hospitalPinRevealed||distance(network.nodes[trip.node],network.nodes[trip.target.node])<=3219;
 const current=trip.history.at(-1)?.road;if(!current||streetKey(current)!==streetKey(trip.target.street)||distance(network.nodes[trip.node],network.nodes[trip.target.node])>400)return false;
 return true;
}
export function turnChoice(network,trip,direction,current){
 const reverse=uTurnChoice(network,trip);
 const candidates=practiceChoices(network,trip).filter(c=>!(c.edge===reverse?.edge&&c.to===reverse?.to)).sort((a,b)=>angle(trip.heading,a.heading)-angle(trip.heading,b.heading));
 if(!candidates.length)return null;
 const index=candidates.findIndex(c=>c.edge===current?.edge&&c.to===current?.to),step=direction==='left'?-1:1;
 return candidates[index<0?(step<0?0:candidates.length-1):(index+step+candidates.length)%candidates.length];
}

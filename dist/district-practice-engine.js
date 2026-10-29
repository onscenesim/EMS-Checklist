export const distance=(a,b)=>Math.hypot((a[0]-b[0])*111000,(a[1]-b[1])*86000);
export const bearing=(a,b)=>(Math.atan2((b[1]-a[1])*86000,(b[0]-a[0])*111000)*180/Math.PI+360)%360;
export const angle=(a,b)=>((b-a+540)%360)-180;
export function turnName(delta){return Math.abs(delta)>150?'U-turn':Math.abs(delta)<25?'Continue':delta<0?'Turn left':'Turn right';}
export function createNetwork(data){
 const adjacent=data.nodes.map(()=>[]);
 data.edges.forEach((e,id)=>{if(e.one!==-1)adjacent[e.a].push({edge:id,to:e.b,reverse:false});if(e.one!==1)adjacent[e.b].push({edge:id,to:e.a,reverse:true});});
 const path=c=>c.reverse?[...data.edges[c.edge].ll].reverse():data.edges[c.edge].ll;
 const choices=(node,blocked=false)=>adjacent[node].filter(c=>!blocked||!data.edges[c.edge].rail).map(c=>({...c,heading:bearing(path(c)[0],path(c)[1]),name:data.edges[c.edge].name}));
 function reachable(start,blocked=false){const seen=new Set([start]),q=[start];for(const n of q)for(const c of choices(n,blocked))if(!seen.has(c.to)){seen.add(c.to);q.push(c.to);}return seen;}
 // Walk through intermediate geometry / single-exit junctions. Stop at the next choice or target.
 function travel(node,choice,target,blocked=false){let c=choices(node,blocked).find(x=>x.edge===choice.edge&&x.to===choice.to);if(!c)return null;const segments=[],visited=new Set();for(let i=0;i<500;i++){if(visited.has(c.edge))break;visited.add(c.edge);const e=data.edges[c.edge],ll=path(c);segments.push({...c,from:node,ll,meters:e.meters,endHeading:bearing(ll.at(-2),ll.at(-1))});const previous=node;node=c.to;if(node===target)break;const next=choices(node,blocked).filter(x=>x.to!==previous);if(next.length!==1)break;c=next[0];}return {node,segments};}
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
 return {mode,origin,target,call,blocked,node:origin.node,heading:0,leg:'outbound',status:'driving',history:[],meters:0,started:Date.now(),legStarted:Date.now()};
}
export function drive(network,trip,choice){
 if(trip.status!=='driving')return false;
 const result=network.travel(trip.node,choice,trip.target.node,trip.blocked);if(!result)return false;
 for(const [i,s] of result.segments.entries()){const delta=angle(trip.heading,s.heading),previous=trip.history.at(-1);trip.history.push({edge:s.edge,reverse:s.reverse,from:s.from,to:s.to,road:s.name,turn:trip.history.length?(i>0&&previous?.road===s.name?'Continue':turnName(delta)):'Depart',meters:s.meters,leg:trip.leg,at:Date.now()});trip.meters+=s.meters;trip.heading=s.endHeading;}
 trip.node=result.node;
 if(trip.node===trip.target.node){trip.status='arrived';trip.arrived=Date.now();}
 return true;
}
export function returnTrip(trip){if(trip.status!=='arrived'||trip.leg==='return')return false;const old=trip.origin;trip.origin=trip.target;trip.target=old;trip.leg='return';trip.status='driving';trip.legStarted=Date.now();return true;}

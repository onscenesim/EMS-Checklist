// Build one shared border network instead of stroking every municipal polygon.
// Census coordinates are snapped to ~0.1 m to remove floating-point differences.
export function municipalBorders(features){
 const points=new Map(),segments=[];
 const point=c=>{const p=c.map(n=>Math.round(n*1e6)/1e6),key=p.join(',');points.set(key,p);return key;};
 for(const f of features){
  const polygons=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];
  for(const polygon of polygons)for(const ring of polygon){
   for(let i=1;i<ring.length;i++){
    const a=point(ring[i-1]),b=point(ring[i]);
    if(a!==b)segments.push({a,b,geoid:f.properties.GEOID});
   }
  }
 }
 const edges=new Map();
 for(const {a,b,geoid} of segments){
  const start=points.get(a),end=points.get(b),dx=(end[0]-start[0])*86000,dy=(end[1]-start[1])*111000,length2=dx*dx+dy*dy;
  const cuts=[{key:a,t:0},{key:b,t:1}];
  // Split collinear edges at shared vertices, including differently subdivided rings.
  for(const [key,p] of points){
   if(key===a||key===b)continue;
   const x=(p[0]-start[0])*86000,y=(p[1]-start[1])*111000,t=(x*dx+y*dy)/length2;
   if(t>0&&t<1&&Math.hypot(x-t*dx,y-t*dy)<.15)cuts.push({key,t});
  }
  cuts.sort((a,b)=>a.t-b.t);
  for(let i=1;i<cuts.length;i++){
   const ends=[cuts[i-1].key,cuts[i].key].sort(),key=ends.join('|');
   if(!edges.has(key))edges.set(key,{ends,geoids:new Set()});
   edges.get(key).geoids.add(geoid);
  }
 }
 // Join adjacent edges with the same owners so dash patterns continue cleanly.
 const groups=new Map();
 for(const edge of edges.values()){
  const key=[...edge.geoids].sort().join('|');
  if(!groups.has(key))groups.set(key,[]);
  groups.get(key).push(edge.ends);
 }
 const result=[];
 for(const [owners,group] of groups){
  const neighbors=new Map(),unused=new Set(group.map((_,i)=>i));
  group.forEach((ends,i)=>ends.forEach(p=>{if(!neighbors.has(p))neighbors.set(p,[]);neighbors.get(p).push(i);}));
  function walk(start,index){
   const line=[start];let current=start;
   while(unused.has(index)){
    unused.delete(index);const ends=group[index];current=ends[0]===current?ends[1]:ends[0];line.push(current);
    if(neighbors.get(current).length!==2)break;
    index=neighbors.get(current).find(i=>unused.has(i));
   }
   result.push({geoids:owners.split('|'),ll:line.map(key=>{const [lng,lat]=points.get(key);return [lat,lng];})});
  }
  for(const [p,indices] of neighbors)if(indices.length!==2)for(const i of indices)if(unused.has(i))walk(p,i);
  for(const i of unused)walk(group[i][0],i);
 }
 return result;
}

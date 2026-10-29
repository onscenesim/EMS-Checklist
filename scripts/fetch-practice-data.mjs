import {fileURLToPath} from 'node:url';
import {hospitalPlaces} from '../dist/hospital-map-data.js';
import {existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const folder=fileURLToPath(new URL('../../tmp/practice-data/',import.meta.url));mkdirSync(folder,{recursive:true});
for(const west of [-84.49,-84.465,-84.44])for(const south of [39.23,39.25,39.27]){
 const file=folder+west+'_'+south+'.osm';if(existsSync(file))continue;
 const bbox=[west,south,west+.025,south+.02].join(',');
 try{execFileSync('curl',['-fsS','--retry','1','--max-time','45','https://api.openstreetmap.org/api/0.6/map?bbox='+bbox,'-o',file]);console.log('District tile',bbox);}catch{throw Error('Tile failed: '+bbox);}
}
for(const h of hospitalPlaces)for(const reverse of [false,true]){
 const file=folder+h.id+(reverse?'-back':'-out')+'.json';if(existsSync(file))continue;
 const points=reverse?[h.ll,[39.250938,-84.470879]]:[[39.250938,-84.470879],h.ll];
 const url='https://router.project-osrm.org/route/v1/driving/'+points.map(p=>p[1]+','+p[0]).join(';')+'?overview=full&geometries=geojson&steps=true';
 execFileSync('curl',['-fsS','--retry','2','--max-time','30',url,'-o',file]);console.log('Hospital',h.id,reverse?'return':'outbound');
}

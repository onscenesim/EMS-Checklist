import {execFileSync} from 'node:child_process';
import {existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {hospitalRoutes} from '../dist/highway-geometry.js';
import {hospitalPlaces} from '../dist/hospital-map-data.js';
const folder=fileURLToPath(new URL('../../tmp/practice-data/',import.meta.url));
for(const h of hospitalPlaces){const file=folder+'campus-'+h.id+'.osm';if(existsSync(file))continue;const [lat,lon]=h.ll;const bbox=[lon-.009,lat-.009,lon+.009,lat+.009].join(',');execFileSync('curl',['-fsS','--retry','1','--max-time','45','https://api.openstreetmap.org/api/0.6/map?bbox='+bbox,'-o',file]);console.log('Campus roads',h.id);}
for(const [id,bbox] of [['reagan-west','-84.47,39.205,-84.445,39.225'],['reagan-east','-84.445,39.21,-84.42,39.23']]){const file=folder+id+'.osm';if(!existsSync(file)){execFileSync('curl',['-fsS','--retry','1','--max-time','45','https://api.openstreetmap.org/api/0.6/map?bbox='+bbox,'-o',file]);console.log('Reagan ramp connections',id);}}
const hospital=hospitalPlaces.find(h=>h.id==='bethesda').ll;
// Constrain both directions to the requested highway corridors rather than the local-road shortest route.
const route126=hospitalRoutes.bethesda.wl;
const corridors={
 'bethesda-126':{
  out:[[39.239099,-84.45483],route126[200],route126[280],route126[400],hospital],
  back:[hospital,route126[400],route126[280],route126[200],[39.239099,-84.45483]],
  outBearings:';90,75;90,75;0,75;',backBearings:';180,75;270,75;270,75;'
 },
 'bethesda-275':{
  out:[[39.250938,-84.470879],[39.2847164,-84.4194638],[39.2624175,-84.3397561],[39.2584871,-84.3411679],hospital],
  back:[hospital,[39.2848917,-84.4194144],[39.250938,-84.470879]],
  outBearings:';90,75;135,75;;',backBearings:';270,75;'
 }
};
for(const [id,config] of Object.entries(corridors))for(const direction of ['out','back']){
 const file=folder+id+'-'+direction+'.json',stops=config[direction];
 const url='https://router.project-osrm.org/route/v1/driving/'+stops.map(p=>p[1]+','+p[0]).join(';')+'?overview=full&geometries=geojson&steps=true&bearings='+config[direction+'Bearings'];
 execFileSync('curl',['-fsS','--retry','2','--max-time','40',url,'-o',file]);console.log('Highway corridor',id,direction);
}

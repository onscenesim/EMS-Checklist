// Public CAGIS address points only; no parcel ownership or resident information.
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
export const source='https://services.arcgis.com/JyZag7oO4NteHGiq/ArcGIS/rest/services/Open_Data_Feature_Collection/FeatureServer/32';
const records=[];
for(let offset=0;;){
 const params=new URLSearchParams({f:'json',where:"JURISABBRV IN ('WOODLN','LINHTS') AND STATUS IN ('ASSIGNED','USING') AND DATE_DEL IS NULL",outFields:'OBJECTID,ADDRECID,HNUM,CAGDIR,CAGSTRNAME,CAGSFX,JURISABBRV',outSR:'4326',resultRecordCount:'2000',resultOffset:String(offset),orderByFields:'OBJECTID'});
 const result=JSON.parse(execFileSync('curl',['-fLsS','--retry','2','--max-time','40',source+'/query?'+params],{maxBuffer:8*1024*1024}));
 if(result.error||!Array.isArray(result.features))throw Error(JSON.stringify(result.error||result));
 for(const {attributes:a,geometry:g} of result.features)if(g&&/^\d+[A-Za-z]?$/.test(a.HNUM))records.push({id:String(a.OBJECTID),number:a.HNUM,street:[a.CAGDIR,a.CAGSTRNAME,a.CAGSFX].filter(Boolean).join(' '),area:a.JURISABBRV==='WOODLN'?'woodlawn':'lincoln',ll:[g.y,g.x]});
 offset+=result.features.length;
 if(!result.exceededTransferLimit)break;
 if(!result.features.length)throw Error('CAGIS pagination returned an empty page.');
}
await mkdir(new URL('./data/',import.meta.url),{recursive:true});
await writeFile(new URL('./data/practice-addresses.json',import.meta.url),JSON.stringify({source,checked:new Date().toISOString().slice(0,10),records}));
console.log('Saved',records.length,'public district address points.');

import {corridorStations,routeBackup} from './backup-stations.js';
import {approaches,departments} from './hospital-map-context.js';
// Campus coordinates: OpenStreetMap / Mapcarta, checked 2026-10-15.
// Pins locate campuses, not ambulance entrances. Keep this list aligned with hospitals.js.
export const hospitalPlaces = [
 {id:'fairfield',label:'Mercy Fairfield',ll:[39.31329,-84.51710],direction:'NW',address:'3000 Mack Road',source:'https://mapcarta.com/21381872'},
 {id:'bethesda',label:'Bethesda North',ll:[39.25140,-84.34037],direction:'E',address:'10500 Montgomery Road',source:'https://www.latlong.net/poi/bethesda-north-hospital-3505'},
 {id:'ucmc',label:'UCMC',ll:[39.13782,-84.50312],direction:'S',address:'3188 Bellevue Avenue',source:'https://mapcarta.com/26834074',offset:[30,5]},
 {id:'westchester',label:'UC West Chester',ll:[39.35952,-84.36716],direction:'NE',address:'7700 University Drive',source:'https://mapcarta.com/W98388688',offset:[15,9]},
 {id:'samaritan',label:'Good Samaritan',ll:[39.13897,-84.52185],direction:'S',address:'375 Dixmyth Avenue',source:'https://mapcarta.com/21371442',offset:[-26,0]},
 {id:'christ',label:'Christ · Mt. Auburn',ll:[39.12083,-84.51110],direction:'S',address:'2139 Auburn Avenue',source:'https://mapcarta.com/21362728',offset:[0,24]},
 {id:'jewish',label:'Mercy Jewish',ll:[39.20693,-84.38176],direction:'SE',address:'4777 East Galbraith Road',source:'https://www.latlong.net/poi/the-jewish-hospital-1908'},
 {id:'childrens-main',label:'Children’s · Burnet',ll:[39.14083,-84.50332],direction:'S',address:'3333 Burnet Avenue',source:'https://mapcarta.com/26834076',pediatric:true,offset:[15,-27]},
 {id:'childrens-liberty',label:'Children’s · Liberty',ll:[39.37585,-84.36812],direction:'NE',address:'7777 Yankee Road',source:'https://mapcarta.com/W206519313',pediatric:true,offset:[-15,-10]}
];
const escape=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function hospitalMap(){return `<section class="panel hospital-map-panel" aria-labelledby="hospital-map-title">
<div class="hospital-map-heading"><div><h2 id="hospital-map-title">Local hospital map</h2><p>Woodlawn & Lincoln Heights · the 9 hospitals in this reference</p></div><div class="map-actions"><button class="button small" type="button" data-fd-toggle aria-pressed="${showFD}">${showFD?'Hide':'Show'} nearby FDs</button><button class="button small" type="button" data-map-reset>Show all</button></div></div>
<div class="selected-hospital-context" aria-live="polite" hidden></div><div class="hospital-map-wrap"><div id="hospital-map" role="region" aria-label="Hospital locations and highways around Woodlawn and Lincoln Heights"></div><div class="map-compass" aria-label="North up, east right, south down, west left"><b>N</b><span>W <i>↑</i> E</span><b>S</b></div><p class="map-load-message" role="status" hidden>Street map unavailable. Check your connection; hospital locations remain listed below.</p></div>
<section class="backup-options" aria-live="polite" hidden></section><div class="hospital-map-key">${hospitalPlaces.map((h,i)=>`<button type="button" data-map-hospital="${h.id}" aria-pressed="false"><span class="map-number ${h.pediatric?'map-pediatric':''}">${i+1}</span><span>${h.label}</span></button>`).join('')}</div>
<p class="hospital-map-note">Tap a hospital for directions and highlighted backup stations along its highway option. Diamonds mark Woodlawn and Lincoln Heights. Campus locations, not ambulance entrances; routes vary by scene and traffic.</p>
<details class="hospital-map-sources"><summary>Map sources</summary><p>Light gray basemap: © Esri, HERE, Garmin, OpenStreetMap contributors. Campus points: OpenStreetMap / linked sources. FD locations: official addresses, geocoded with Esri. Campus locations checked October 15, 2026. ${hospitalPlaces.map(h=>`<a href="${h.source}" target="_blank" rel="noopener">${h.label}</a>`).join(' · ')}</p></details></section>`;}
let map=null,observer=null,showFD=false,selectedHospital='';
const origins={Woodlawn:[39.25200,-84.47022],'Lincoln Heights':[39.23895,-84.45550]};
export function directionFrom(origin,destination){const angle=(Math.atan2((destination[1]-origin[1])*Math.cos((destination[0]+origin[0])*Math.PI/360),destination[0]-origin[0])*180/Math.PI+360)%360;return ['NORTH','NORTHEAST','EAST','SOUTHEAST','SOUTH','SOUTHWEST','WEST','NORTHWEST'][Math.round(angle/45)%8];}
export function mountHospitalMap(){
 observer?.disconnect();observer=null;if(map){map.stop();map.remove();map=null;}
 const container=document.getElementById('hospital-map');if(!container)return;
 if(!window.L){document.querySelector('.map-load-message').hidden=false;return;}
 const L=window.L;
 map=L.map(container,{scrollWheelZoom:false,zoomControl:false,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false,zoomSnap:0.25,minZoom:9,maxZoom:17,attributionControl:true});
 const instance=map;
 L.control.zoom({position:'bottomright'}).addTo(map);
 map.on('popupopen',()=>container.parentElement.classList.add('map-has-popup'));
 map.on('popupclose',()=>container.parentElement.classList.remove('map-has-popup'));
 const tiles=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',{attribution:'Tiles &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',maxNativeZoom:16,maxZoom:17}).addTo(map);
 let loaded=0;tiles.on('tileload',()=>{loaded++;document.querySelector('.map-load-message')?.setAttribute('hidden','');});tiles.on('tileerror',()=>{if(!loaded){const message=document.querySelector('.map-load-message');if(message)message.hidden=false;}});
 L.control.scale({imperial:true,metric:false,position:'bottomleft'}).addTo(map);
 const bounds=L.latLngBounds(hospitalPlaces.map(h=>h.ll)).pad(0.13);
 const overview=()=>{instance.closePopup();selectedHospital='';document.querySelector('.selected-hospital-context').hidden=true;document.querySelector('.backup-options').hidden=true;instance.fitBounds(bounds,{padding:[34,35]});document.querySelectorAll('[data-map-hospital]').forEach(b=>b.setAttribute('aria-pressed','false'));};
 overview();
 const markers=[];
 hospitalPlaces.forEach((h,i)=>{
  const color='#334c60';
  const dot=L.circleMarker(h.ll,{radius:3,color,fillOpacity:1,weight:1,interactive:false}).addTo(map);
  const leader=L.polyline([],{color,weight:1,interactive:false}).addTo(map);
  const marker=L.marker(h.ll,{icon:L.divIcon({className:'hospital-map-pin',html:`<span class="map-number ${h.pediatric?'map-pediatric':''}">${i+1}</span>`,iconSize:[28,28],iconAnchor:[14,14]}),title:h.label,alt:h.label}).addTo(map);
  const directionLines=Object.entries(origins).map(([name,ll])=>`<span class="hospital-direction"><strong>${directionFrom(ll,h.ll)}</strong> of ${name}</span>`).join('');
  const approach=approaches[h.id];
  marker.bindPopup(`<b>${escape(h.label)}</b><div class="hospital-directions">${directionLines}</div><div class="hospital-popup-route"><small>Highway option</small><strong>${approach.legs.join(' → ')}</strong><span>${escape(approach.local)}</span></div>`,{maxWidth:270,minWidth:210});
  const focus=()=>{
   instance.closePopup();selectedHospital=h.id;showFD=true;
   document.querySelectorAll('[data-map-hospital]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mapHospital===h.id)));
   const context=document.querySelector('.selected-hospital-context');context.hidden=false;context.innerHTML=`<strong>${escape(h.label)}</strong><div>${directionLines}</div><p>${approach.legs.join(' → ')}</p><small>${escape(approach.local)}</small>`;
   updateFDs();
   const options=resolveBackup(h.id);instance.fitBounds(L.latLngBounds([...Object.values(origins),h.ll,...options.map(d=>d.ll)]),{padding:[80,60],maxZoom:12.5});
  };
  marker.on('click',focus);document.querySelector(`[data-map-hospital="${h.id}"]`).onclick=focus;
  markers.push({h,marker,leader,dot});
 });
 const positionPins=()=>{for(const {h,marker,leader} of markers){const offset=instance.getZoom()<12.5?(h.offset||[0,0]):[0,0];const p=instance.latLngToLayerPoint(h.ll).add(offset);const location=instance.layerPointToLatLng(p);marker.setLatLng(location);leader.setLatLngs([h.ll,location]);}};
 instance.on('zoomend',positionPins);positionPins();
 for(const [name,ll,direction] of [['Woodlawn',[39.25200,-84.47022],'left'],['Lincoln Heights',[39.23895,-84.45550],'right']]){
  const community=L.marker(ll,{icon:L.divIcon({className:'community-map-pin',html:'◆',iconSize:[14,14],iconAnchor:[7,7]}),interactive:false}).addTo(map).bindTooltip(name,{permanent:true,direction,offset:direction==='left'?[-10,-6]:[10,8],className:'community-map-label'});
  const positionLabel=()=>{const tooltip=community.getTooltip(),x=instance.latLngToContainerPoint(ll).x;tooltip.options.direction=x<instance.getSize().x/2?'right':'left';tooltip.options.offset=L.point(tooltip.options.direction==='left'?-10:10,name==='Woodlawn'?-6:8);tooltip.update();};
  instance.on('moveend zoomend',positionLabel);positionLabel();
 }
 // Route labels supplement the street basemap at regional zoom.
 for(const [label,ll] of [['I-75',[39.286,-84.443]],['I-71',[39.27,-84.316]],['I-275',[39.291,-84.519]],['SR 126',[39.216,-84.435]],['SR 129',[39.378,-84.445]]]){
  L.marker(ll,{icon:L.divIcon({className:'map-highway-label',html:label,iconSize:[48,20],iconAnchor:[24,10]}),interactive:false,zIndexOffset:-500}).addTo(map);
 }
 const fdLayer=L.layerGroup();
 const allStations=[...departments,...corridorStations];
 const resolveBackup=id=>(routeBackup[id]||[]).map(([key,area])=>({...allStations.find(d=>(d.id||d.name)===key),area}));
 const updateFDs=()=>{
  fdLayer.clearLayers();const panel=document.querySelector('.backup-options');const button=document.querySelector('[data-fd-toggle]');
  button.textContent=(showFD?'Hide':'Show')+(selectedHospital?' backup FDs':' nearby FDs');button.setAttribute('aria-pressed',String(showFD));
  if(!showFD){fdLayer.remove();panel.hidden=true;return;}
  const stations=selectedHospital?resolveBackup(selectedHospital):departments;
  stations.forEach((d,i)=>{
   const letter=String.fromCharCode(65+i),active=!!selectedHospital;
   const marker=L.marker(d.ll,{icon:L.divIcon({className:'fd-geo-marker'+(active?' fd-route-highlight':''),html:active?letter:'FD',iconSize:[26,24],iconAnchor:[13,12]}),title:d.name+' Fire Department',alt:d.name+' Fire Department',zIndexOffset:active?600:0});
   marker.bindPopup(`<b>${escape(d.name)}</b>${d.area?`<br>${escape(d.area)}`:''}<br>${escape(d.address)}<br><a href="${d.source}" target="_blank" rel="noopener">Station source ↗</a>`);
   if(active)marker.bindTooltip(escape(d.name),{direction:'auto',className:'backup-map-label'});
   marker.addTo(fdLayer);d.marker=marker;
  });fdLayer.addTo(instance);
  if(selectedHospital){
   const name=hospitalPlaces.find(h=>h.id===selectedHospital).label;
   panel.hidden=false;panel.innerHTML=`<div class="backup-options-heading"><h3>Possible backup · ${escape(name)}</h3><span>Along the highway option shown · earlier → later</span></div><div class="backup-station-list">${stations.map((d,i)=>`<button type="button" data-backup-station="${i}"><b class="backup-letter">${String.fromCharCode(65+i)}</b><span><strong>${escape(d.name)}</strong><small>${escape(d.area)}</small></span></button>`).join('')}</div><p>Nearby-station shortlist, not live unit availability or a guaranteed nearest responder. Give dispatch your highway, travel direction and exit / mile marker; confirm who can respond.</p>`;
   panel.querySelectorAll('[data-backup-station]').forEach(b=>b.onclick=()=>{const d=stations[Number(b.dataset.backupStation)];instance.panTo(d.ll);d.marker.openPopup();});
  }else panel.hidden=true;
 };
 updateFDs();
 document.querySelector('[data-fd-toggle]').onclick=()=>{instance.closePopup();showFD=!showFD;updateFDs();if(showFD&&!selectedHospital)instance.fitBounds(L.latLngBounds([...departments.map(d=>d.ll),...Object.values(origins)]),{padding:[45,55],maxZoom:13});};
 document.querySelector('[data-map-reset]').onclick=()=>{showFD=false;overview();updateFDs();};
 observer=new ResizeObserver(()=>instance.invalidateSize());observer.observe(container);
}

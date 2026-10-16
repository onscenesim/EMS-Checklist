import {destinations,stationId} from './local-destinations.js';
import {municipalBorders} from './local-boundaries.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const names={woodlawn:'Woodlawn',lincoln:'Lincoln Heights'};
const station=destinations.find(d=>d.id===stationId);
let area='',selected='',entrance='main',mode='normal',search='',map=null,observer=null,serial=0;
let dataPromise;
const getData=()=>dataPromise??=Promise.all(['local-geography.json','local-routes.json'].map(p=>fetch(p).then(r=>{if(!r.ok)throw Error(p);return r.json();}))).catch(e=>{dataPromise=null;throw e;});
export function localAreaMap(){return `<section class="local-map-page"><button class="back" data-page="home">← Overview</button><div class="page-heading"><div><span class="eyebrow">LOCAL REFERENCE</span><h1>District map</h1><p>Woodlawn & Lincoln Heights</p></div></div>
<div class="local-origin"><span class="origin-symbol">◆</span><span><b>Starting at Woodlawn Fire Department</b><small>10121 Springfield Pike</small></span></div>
<div class="local-area-choice" role="group" aria-label="Choose an area">${Object.entries(names).map(([id,name])=>`<button class="button" data-local-area="${id}" aria-pressed="${area===id}">${name}</button>`).join('')}<span>Choose an area, then a destination.</span></div>
<div class="local-layout"><div class="local-map-column"><div class="local-map-frame"><div id="district-map" role="region" aria-label="Woodlawn and Lincoln Heights street, boundary and railway map"></div><div class="map-compass"><b>N</b><span>W <i>↑</i> E</span><b>S</b></div><div class="local-choose-hint" ${area?'hidden':''}>Select Woodlawn or Lincoln Heights above<br><small>Only that area's destinations will appear.</small></div><button class="button small local-fit" data-local-fit>Area overview</button><span class="local-map-error" role="status" hidden></span></div>
<div class="local-map-legend"><span><i class="legend-boundary"></i>Municipal border</span><span><i class="legend-rail"></i>Train tracks</span><span><i class="legend-blue"></i>Standard route</span><span><i class="legend-yellow"></i>Train-blocked alternative</span></div>
<section class="local-selection" aria-live="polite"><p class="muted">Select a destination to see its address and route.</p></section></div>
<aside class="local-destination-panel" aria-label="Local destinations"><div class="local-list-header"><h2>${area?names[area]:'Destinations'}</h2><label class="local-search"><span class="sr-only">Search destinations</span><input type="search" data-local-search placeholder="Find a place or address…" value="${esc(search)}" ${area?'':'disabled'}></label></div><div class="local-destination-list"></div><p class="local-list-note">All destinations are shown. Nearby markers spread apart with thin guide lines. Numbers follow Woodlawn A–Z, then Lincoln Heights A–Z. ◆ Woodlawn Fire Department is always #1.</p></aside></div>
<p class="local-map-footnote">Routes begin at Station 96 and show mapped road access, not live traffic or apparatus clearance. Yellow routes bypass the Marion Road crossing via the Glendale–Milford rail underpass. Confirm the actual entrance and current conditions.</p>
<details class="local-sources"><summary>Map sources & local corrections</summary><p>Municipal boundaries: <a href="https://tigerweb.geo.census.gov/tigerweb/" target="_blank" rel="noopener">U.S. Census TIGERweb</a>. Streets, tracks and routes: <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> / OSRM. Gray base: Esri, HERE, Garmin. Addresses: linked destination sources and user-provided local information. Checked October 15, 2026.</p><p>Courts east → west: Shivers, Able, Love, Hunter, using your local correction. White Cliff and Dorothy Court are the same destination, as confirmed locally.</p></details></section>`;}
export async function mountLocalMap(){
 const token=++serial;observer?.disconnect();observer=null;if(map){map.remove();map=null;}
 const container=document.getElementById('district-map');if(!container)return;
 if(!window.L){container.textContent='Map library unavailable. Reload to try again.';return;}
 const L=window.L;const instance=L.map(container,{scrollWheelZoom:false,zoomControl:false,zoomSnap:.25,minZoom:13,maxZoom:19,zoomAnimation:false,fadeAnimation:false,markerZoomAnimation:false});map=instance;
 instance.setView([39.2505,-84.465],14.5);L.control.zoom({position:'bottomright'}).addTo(instance);L.control.scale({imperial:true,metric:false}).addTo(instance);
 for(const [name,zIndex] of Object.entries({districtFills:280,districtBorders:320,districtRails:410,districtRoutes:430,districtLabels:450,districtPinLeaders:460})){
  const pane=instance.createPane(name);pane.style.zIndex=zIndex;pane.style.pointerEvents='none';
 }
 const tiles=L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Tiles &copy; Esri, HERE, Garmin',maxNativeZoom:16,maxZoom:19}).addTo(instance);
 let tileLoaded=false;tiles.on('tileload',()=>{tileLoaded=true;document.querySelector('.local-map-error')?.setAttribute('hidden','');});tiles.on('tileerror',()=>{if(!tileLoaded){const e=document.querySelector('.local-map-error');if(e){e.hidden=false;e.textContent='Background unavailable; local map overlays remain visible.';}}});
 let geography,routeData;try{[geography,routeData]=await getData();}catch{if(token!==serial)return;document.querySelector('.local-selection').innerHTML='<p>Map data could not load. Reload to try again.</p>';return;}if(token!==serial)return;
 instance.createPane('courtCorrections');instance.getPane('courtCorrections').style.zIndex=250;
 const correctionLayer=L.layerGroup();
 L.rectangle([[39.24859,-84.45037],[39.24972,-84.44771]],{pane:'courtCorrections',stroke:false,fillColor:'#eceeef',fillOpacity:1,interactive:false}).addTo(correctionLayer);
 for(const r of geography.roads.filter(r=>['Shivers Court','Able Court','Love Court','Hunter Court'].includes(r.name))){L.polyline(r.ll,{pane:'courtCorrections',color:'#fff',weight:7,interactive:false}).addTo(correctionLayer);}
 const borders=L.layerGroup().addTo(instance),railLayer=L.layerGroup().addTo(instance),streetLayer=L.layerGroup().addTo(instance),routeLayer=L.layerGroup().addTo(instance),pinLayer=L.layerGroup().addTo(instance),labelLayer=L.layerGroup().addTo(instance);
 const borderNetwork=municipalBorders(geography.municipalities.features);
 const areaFeatures={woodlawn:geography.municipalities.features.find(f=>f.properties.NAME.startsWith('Woodlawn')),lincoln:geography.municipalities.features.find(f=>f.properties.NAME.startsWith('Lincoln Heights'))};
 geography.roads.forEach(r=>L.polyline(r.ll,{color:['motorway','trunk'].includes(r.kind)?'#aab1b7':'#c7cbcf',weight:['motorway','primary'].includes(r.kind)?2.5:1,opacity:.65,interactive:false}).addTo(streetLayer));
 for(const line of geography.rails){L.polyline(line,{pane:'districtRails',className:'local-rail-track',color:'#41484e',weight:3.5,opacity:1,interactive:false}).addTo(railLayer);L.polyline(line,{pane:'districtRails',className:'local-rail-ties',color:'#f4f5f6',weight:2,dashArray:'2 7',opacity:1,interactive:false}).addTo(railLayer);}
 const origin=L.marker(station.ll,{title:'Woodlawn Fire Department · route start',icon:L.divIcon({className:'local-station-pin',html:'<span>1</span>',iconSize:[26,26],iconAnchor:[13,13]}),zIndexOffset:900}).addTo(instance);origin.bindTooltip('Station 96 · start',{direction:'top'});
 const visibleDestinations=()=>destinations.filter(d=>d.area===area&&(!search||`${d.name} ${d.address} ${(d.aliases||[]).join(' ')}`.toLowerCase().includes(search.toLowerCase())));
 function drawBorders(){borders.clearLayers();
  const activeId=areaFeatures[area]?.properties.GEOID;
  L.geoJSON(geography.municipalities,{pane:'districtFills',interactive:false,style:f=>({stroke:false,fillColor:f.properties.GEOID===activeId?'#fff':'#828990',fillOpacity:f.properties.GEOID===activeId ? .02 : .07})}).addTo(borders);
  for(const line of borderNetwork){const active=line.geoids.includes(activeId);
   L.polyline(line.ll,{pane:'districtBorders',className:'local-municipal-border',color:active?'#68747e':'#8f989f',weight:active?1.7:1,opacity:active?.85:.6,dashArray:active?'8 5':null,interactive:false}).addTo(borders);
  }
 }
 function fitArea(){if(!area)return;const bounds=L.geoJSON(areaFeatures[area]).getBounds();visibleDestinations().forEach(d=>bounds.extend(d.ll));instance.fitBounds(bounds,{padding:[35,35],maxZoom:15.5});}
 const compact=n=>n.replace('Fire Department','FD').replace('Police Department','PD').replace('Apartments','Apts').replace('Elementary','Elem.').replace('Woodlawn ','').replace('Lincoln Heights ','');
 function updatePins(){pinLayer.clearLayers();if(!area)return;
  const occupied=[instance.latLngToContainerPoint(station.ll)];
  const pins=[...visibleDestinations()].sort((a,b)=>Number(b.id===selected)-Number(a.id===selected));
  for(const d of pins){
   if(d.id===stationId)continue;
   const active=d.id===selected;
   const pinLocation=active?(d.entrances?.find(e=>e.id===entrance)?.ll||d.ll):d.ll;
   const anchor=instance.latLngToContainerPoint(pinLocation),offsets=[[0,0]];
   for(const radius of [32,48,64,80])for(let i=0;i<16;i++){const angle=i*Math.PI/8;offsets.push([Math.cos(angle)*radius,Math.sin(angle)*radius]);}
   const offset=offsets.find(([x,y])=>occupied.every(p=>p.distanceTo(anchor.add([x,y]))>=32))||[0,0];
   const point=anchor.add(offset);occupied.push(point);
   const markerLocation=instance.containerPointToLatLng(point);
   if(offset[0]||offset[1]){
    L.polyline([pinLocation,markerLocation],{pane:'districtPinLeaders',color:'#66737e',weight:1,opacity:.8,interactive:false,className:'local-pin-leader'}).addTo(pinLayer);
    L.circleMarker(pinLocation,{pane:'districtPinLeaders',radius:2,stroke:false,fillColor:'#66737e',fillOpacity:1,interactive:false}).addTo(pinLayer);
   }
   const m=L.marker(markerLocation,{title:d.name,alt:d.name,zIndexOffset:active?1000:200,icon:L.divIcon({className:'local-place-pin'+(active?' is-selected':''),html:`<span>${d.number}</span>`,iconSize:[28,28],iconAnchor:[14,14]})}).addTo(pinLayer);
   m.on('click',()=>select(d.id));m.bindTooltip(esc(compact(d.name)),{permanent:active||instance.getZoom()>=16.75,direction:'top',offset:[0,-12],className:'local-place-label'});
  }
 }
 function updateStreetLabels(){labelLayer.clearLayers();const z=instance.getZoom(),size=instance.getSize(),occupied=[];if(z>=16)correctionLayer.addTo(instance);else correctionLayer.remove();
  const abbreviate=s=>s.replace(/ Avenue/g,' Ave').replace(/ Boulevard/g,' Blvd').replace(/ Road/g,' Rd').replace(/ Street/g,' St').replace(/ Court/g,' Ct').replace(/ Drive/g,' Dr');
  const roadNames=new Set();
  const priority=r=>r.ref?0:r.kind==='secondary'?1:r.kind==='tertiary'?2:r.name.endsWith('Court')?3:4;
  const candidates=[...geography.roads].sort((a,b)=>priority(a)-priority(b)||b.ll.length-a.ll.length);
  for(const r of candidates){
   if(roadNames.has(r.name))continue;if(z<14.5&&!['motorway','primary','secondary','tertiary'].includes(r.kind))continue;
   if(z<16.25&&r.name.endsWith('Court'))continue;
   const line=r.ll.map(p=>instance.latLngToContainerPoint(p));let chosen=null;
   for(let i=1;i<line.length;i++){const a=line[i-1],b=line[i],mid=a.add(b).divideBy(2),length=a.distanceTo(b);if(mid.x<40||mid.x>size.x-40||mid.y<22||mid.y>size.y-22)continue;if(!chosen||length>chosen.length)chosen={a,b,mid,length};}
   if(!chosen)continue;
   const label=r.kind==='motorway'?(r.ref||'I-75').replaceAll('I ','I-'):abbreviate(r.name),w=label.length*6.5;
   let angle=Math.atan2(chosen.b.y-chosen.a.y,chosen.b.x-chosen.a.x)*180/Math.PI;if(angle>90)angle-=180;if(angle< -90)angle+=180;
   const rad=Math.abs(angle*Math.PI/180),bw=Math.abs(Math.cos(rad))*w+Math.abs(Math.sin(rad))*15,bh=Math.abs(Math.sin(rad))*w+Math.abs(Math.cos(rad))*15;
   const box=[chosen.mid.x-bw/2-4,chosen.mid.y-bh/2-4,chosen.mid.x+bw/2+4,chosen.mid.y+bh/2+4];
   if(occupied.some(b=>box[0]<b[2]&&box[2]>b[0]&&box[1]<b[3]&&box[3]>b[1]))continue;
   occupied.push(box);roadNames.add(r.name);
   L.marker(instance.containerPointToLatLng(chosen.mid),{pane:'districtLabels',interactive:false,icon:L.divIcon({className:'local-street-label'+(r.kind==='motorway'?' highway-street-label':''),html:`<span style="transform:translate(-50%,-50%) rotate(${angle}deg)">${esc(label)}</span>`,iconSize:[0,0]})}).addTo(labelLayer);
  }
  for(const f of geography.municipalities.features){const name=f.properties.NAME.replace(/ (village|city)$/,'');if(['Woodlawn','Lincoln Heights'].includes(name))continue;const center=L.geoJSON(f).getBounds().getCenter();L.marker(center,{pane:'districtLabels',interactive:false,icon:L.divIcon({className:'local-neighbor-label',html:esc(name),iconSize:[110,20],iconAnchor:[55,10]})}).addTo(labelLayer);}
 }
 function updateList(){const panel=document.querySelector('.local-destination-list');document.querySelector('.local-list-header h2').textContent=area?names[area]:'Destinations';
  panel.innerHTML=!area?'<p class="muted local-list-empty">Choose an area to browse its destinations.</p>':visibleDestinations().map(d=>`<button data-local-destination="${d.id}" aria-pressed="${selected===d.id}"><span class="local-list-number">${d.number}</span><span><strong>${d.id===stationId?'<span class="local-station-diamond" title="Route starting point" aria-label="Route starting point">◆</span> ':''}${esc(d.name)}</strong><small>${esc(d.address)}</small>${d.areaNote?`<em>${esc(d.areaNote)}</em>`:''}</span></button>`).join('')||'<p class="local-list-empty">No matching destinations in this area.</p>';
  panel.querySelectorAll('[data-local-destination]').forEach(b=>b.onclick=()=>select(b.dataset.localDestination));
 }
 function showSelection(){routeLayer.clearLayers();const d=destinations.find(d=>d.id===selected),panel=document.querySelector('.local-selection');if(!d){panel.innerHTML='<p class="muted">Select a destination to see its address and route.</p>';return;}
  const access=d.entrances?.find(e=>e.id===entrance);const route=routeData.routes[d.id+'--'+entrance]?.[mode];const address=access?.address||d.address;
  panel.innerHTML=`<div class="local-selected-heading"><span class="local-list-number">${d.number}</span><div><h2>${esc(d.name)}</h2><p>${esc(address)}</p></div></div>${d.description?`<p class="local-description">${esc(d.description)}</p>`:''}
  ${d.entrances?`<label class="local-entrance-select">Access point<select data-local-entrance>${d.entrances.map(e=>`<option value="${e.id}" ${e.id===entrance?'selected':''}>${esc(e.label)} · ${esc(e.address)}</option>`).join('')}</select></label>`:''}
  ${d.id===stationId?'<p>Route starting point · you are already at Station 96.</p>':d.routeUnavailable?`<p class="local-unconfirmed">${esc(d.routeUnavailable)}</p>`:`<div class="local-route-modes" role="group" aria-label="Route option"><button class="button small route-standard" data-local-mode="normal" aria-pressed="${mode==='normal'}">Blue · standard route</button>${d.area==='lincoln'?`<button class="button small route-train" data-local-mode="blocked" aria-pressed="${mode==='blocked'}">Yellow · Marion crossing blocked</button>`:''}</div>${route?`<p class="local-route-summary"><b>${(route.meters/1609.344).toFixed(1)} mi</b> from Woodlawn FD${mode==='blocked'?' · via Glendale–Milford underpass':''}</p><details class="local-directions"><summary>Street-by-street directions</summary><ol>${route.steps.map(s=>`<li><b>${esc(s.road)}</b><span>${esc(s.turn.replaceAll('-',' '))} · ${s.meters<1609?Math.round(s.meters*3.28084/50)*50+' ft':(s.meters/1609.344).toFixed(1)+' mi'}</span></li>`).join('')}<li><b>Arrive at ${esc(d.name)}</b><span>${esc(address)}</span></li></ol></details>`:'<p>Route not available.</p>'}`}
  ${d.localCorrection?'<p class="local-correction">Court label uses your local correction: east → west, Shivers · Able · Love · Hunter.</p>':''}${d.source?`<a class="local-source-link" href="${esc(access?.source||d.source)}" target="_blank" rel="noopener">Address source ↗</a>`:''}`;
  if(route){L.polyline(route.ll,{pane:'districtRoutes',color:'#fff',weight:9,interactive:false}).addTo(routeLayer);L.polyline(route.ll,{pane:'districtRoutes',color:mode==='blocked'?'#e5ad08':'#1673e6',weight:5,interactive:false,className:'local-active-route '+mode}).addTo(routeLayer);}
  panel.querySelectorAll('[data-local-mode]').forEach(b=>b.onclick=()=>{mode=b.dataset.localMode;showSelection();fitTrip();});
  const selectAccess=panel.querySelector('[data-local-entrance]');if(selectAccess)selectAccess.onchange=()=>{entrance=selectAccess.value;showSelection();fitTrip();updatePins();};
 }
 function fitTrip(){const d=destinations.find(d=>d.id===selected);if(!d)return;const route=routeData.routes[d.id+'--'+entrance]?.[mode];if(d.routeUnavailable||d.id===stationId){instance.setView(d.ll,17.5);return;}instance.fitBounds(L.latLngBounds(route?.ll||[station.ll,d.ll]),{padding:[35,45],maxZoom:17});}
 function select(id){selected=id;entrance='main';mode='normal';updateList();showSelection();fitTrip();updatePins();if(innerWidth<=850)document.querySelector('.local-map-frame').scrollIntoView({block:'start'});}
 document.querySelectorAll('[data-local-area]').forEach(b=>b.onclick=()=>{area=b.dataset.localArea;selected='';search='';mode='normal';document.querySelectorAll('[data-local-area]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelector('.local-choose-hint').hidden=true;const input=document.querySelector('[data-local-search]');input.disabled=false;input.value='';drawBorders();updateList();showSelection();fitArea();updatePins();});
 document.querySelector('[data-local-search]').oninput=e=>{search=e.target.value;updateList();updatePins();};
 document.querySelector('[data-local-fit]').onclick=()=>{selected='';showSelection();updateList();fitArea();updatePins();};
 origin.on('click',()=>{if(area==='woodlawn')select(stationId);});
 instance.on('zoomend moveend',()=>{if(token!==serial||!container.isConnected)return;updatePins();updateStreetLabels();});drawBorders();updateList();if(area)fitArea();showSelection();updatePins();updateStreetLabels();
 observer=new ResizeObserver(()=>{if(token!==serial||!container.isConnected)return;instance.invalidateSize();updatePins();updateStreetLabels();});observer.observe(container);
}

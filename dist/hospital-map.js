import {hospitalPlaces} from './hospital-map-data.js';
export {hospitalPlaces};
// Deliberately schematic: topology and travel directions, not street geometry.
const approaches={
 fairfield:{legs:['I-75 NORTH','I-275 WEST'],local:'Winton Road → Mack Road',segments:['75n','275w']},
 bethesda:{legs:['I-75 SOUTH','SR-126 EAST','I-71 NORTH'],local:'Pfeiffer Road → Montgomery Road',segments:['75to126','126e','71n']},
 ucmc:{legs:['I-75 SOUTH'],local:'Local streets to the UCMC campus',segments:['75to126','75south']},
 westchester:{legs:['I-75 NORTH'],local:'Tylersville Road → University Drive',segments:['75n','75upper']},
 samaritan:{legs:['I-75 SOUTH'],local:'Hopple Street / Martin Luther King Drive → Dixmyth Avenue',segments:['75to126','75south']},
 christ:{legs:['I-75 SOUTH'],local:'Local streets to the Mt. Auburn campus',segments:['75to126','75south']},
 jewish:{legs:['I-75 SOUTH','SR-126 EAST'],local:'Kenwood Road → East Galbraith Road',segments:['75to126','126jewish']},
 'childrens-main':{legs:['I-75 SOUTH'],local:'Hopple Street / Martin Luther King Drive → Burnet Avenue',segments:['75to126','75south']},
 'childrens-liberty':{legs:['I-75 NORTH'],local:'Liberty Way → Yankee Road',segments:['75n','75upper']}
};
const departments=[
 {name:'Springdale',address:'12147 Lawnview Avenue',x:.10,y:197,source:'https://www.hamiltoncountyfirechiefs.com/uploads/2/9/3/3/29330831/springdale_fd-_hiring_flyer.pdf'},
 {name:'Glendale',address:'80 East Sharon Road',x:.15,y:231,source:'https://glendalefd.org/about/contact/'},
 {name:'Sharonville HQ',address:'11637 Chester Road',x:.51,y:225,source:'https://www.sharonville.org/127/Fire-EMS'},
 {name:'Evendale',address:'10500 Reading Road',x:.52,y:275,source:'https://www.evendaleohio.org/fire-department'},
 {name:'Wyoming',address:'600 Grove Avenue',x:.07,y:349,source:'https://www.wyomingohio.gov/161/Fire-EMS-Department'},
 {name:'Lockland',address:'101 North Cooper Avenue',x:.19,y:375,source:'https://www.locklandoh.org/government-2/departments/fire-depart/'},
 {name:'Reading · Valley',address:'1000 Market Street',x:.49,y:365,source:'https://readingfdohio.org/about/contact/'}
];
let selected='',showFD=false,observer;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function hospitalMap(){return `<section class="panel highway-panel" aria-labelledby="highway-title">
<div class="highway-heading"><div><h2 id="highway-title">Hospital highway guide</h2><p>Woodlawn & Lincoln Heights</p></div><button class="button small fd-toggle" type="button" aria-pressed="${showFD}" aria-controls="nearby-fds" data-fd-toggle>${showFD?'Hide':'Show'} nearby FDs</button></div>
<label class="highway-picker">Hospital<select id="highway-destination"><option value="">All hospitals</option>${hospitalPlaces.map(h=>`<option value="${h.id}" ${h.id===selected?'selected':''}>${h.label}</option>`).join('')}</select></label>
<div class="highway-route" aria-live="polite"></div><div class="highway-canvas" id="hospital-map"></div>
<div id="nearby-fds" ${showFD?'':'hidden'}><p class="fd-caption">Nearby department locations · schematic placement</p><div class="fd-directory">${departments.map(d=>`<a href="${d.source}" target="_blank" rel="noopener"><b>${d.name}</b><span>${d.address}</span></a>`).join('')}</div></div>
<p class="highway-note">Schematic · not to scale. Highway options from the service area; scene location and traffic may favor local roads. Dashed lines represent local access.</p>
<details class="highway-sources"><summary>Sources</summary><p>Campus locations and official department pages checked October 15, 2026. <a href="https://www.trihealth.com/locations/bethesda-north-hospital/patient-and-visitor-information/maps-directions-and-parking" target="_blank" rel="noopener">Bethesda North directions</a> · <a href="https://hrs.osu.edu/-/media/files/shared/locations/driving-directions/osu-comprehensive-transplant-center-jewish-hospital-mercy-health/dri_dir_jewish_hospital_cincinnati.pdf" target="_blank" rel="noopener">Jewish / Kenwood access</a> · <a href="https://www.cincinnatichildrens.org/locations/liberty" target="_blank" rel="noopener">Children’s Liberty</a>. FD source links appear when the layer is shown.</p></details></section>`;}
export function mountHospitalMap(){
 observer?.disconnect();const root=document.querySelector('.highway-panel');if(!root)return;
 const canvas=root.querySelector('.highway-canvas');
 const draw=()=>{
 const w=Math.max(240,Math.round(canvas.clientWidth)),h=600,x75=w*.40,x71=w*.81,hub=315,ns='http://www.w3.org/2000/svg';
 const el=(name,attrs={},text)=>{const e=document.createElementNS(ns,name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);if(text!==undefined)e.textContent=text;return e;};
 const svg=el('svg',{viewBox:`0 0 ${w} ${h}`,width:w,height:h,role:'img','aria-label':'Schematic highways and nine hospitals. North is up. Select a hospital for directional highway legs.'});
 svg.append(el('title',{},'Hospital highway approaches from Woodlawn and Lincoln Heights'));
 const path=(points,cls,extra={})=>{const p=el('polyline',{points:points.map(a=>a.join(',')).join(' '),class:cls,fill:'none',...extra});svg.append(p);return p;};
 const text=(x,y,value,cls='road-text',anchor='start')=>{const e=el('text',{x,y,class:cls,'text-anchor':anchor},value);svg.append(e);return e;};
 const badge=(x,y,value)=>{const width=value.length*6.7+16;svg.append(el('rect',{x:x-width/2,y:y-12,width,height:23,rx:4,class:'road-badge'}));text(x,y+4,value,'road-text','middle');};
 // Main corridors are drawn as neutral lines, without a street or terrain layer.
 path([[x75,42],[x75,562]],'highway-base');path([[x71,42],[x71,400],[w*.60,562]],'highway-base');
 path([[16,180],[w-16,180]],'highway-base');path([[16,400],[x71,400]],'highway-base');path([[16,82],[x75,82]],'highway-secondary');
 const segments={
 '75n':[[x75,hub],[x75,180]],'75upper':[[x75,180],[x75,61]],'275w':[[x75,180],[w*.12,180]],
 '75to126':[[x75,hub],[x75,400]],'75south':[[x75,400],[x75,540]],
 '126e':[[x75,400],[x71,400]],'126jewish':[[x75,400],[w*.68,400]],'71n':[[x71,400],[x71,290]]
 };
 if(selected){for(const key of approaches[selected].segments){const pts=segments[key];path(pts,'highway-active');const[a,b]=pts,angle=Math.atan2(b[1]-a[1],b[0]-a[0])*180/Math.PI;const t=a[1]===b[1]?(b[0]>a[0]?.82:.20):.5;const x=a[0]+(b[0]-a[0])*t,y=a[1]+(b[1]-a[1])*t;svg.append(el('path',{d:'M -6 -5 L 1 0 L -6 5',transform:`translate(${x} ${y}) rotate(${angle})`,class:'highway-arrow'}));}}
 // Cardinal directions stay visible in every selection.
 text(w/2,18,'↑ NORTH','cardinal','middle');text(12,590,'← WEST','cardinal');text(w-12,590,'EAST →','cardinal','end');text(w/2,590,'SOUTH ↓','cardinal','middle');
 badge(x75,153,'I-75');badge(x71,153,'I-71');badge(w*.18,180,'I-275');badge(w*.62,180,'I-275');badge(w*.20,82,'SR-129');badge(w*.54,400,'SR-126');
 text(x75-10,47,'N ↑','road-direction','end');text(x75-10,562,'S ↓','road-direction','end');text(x71+10,47,'N ↑','road-direction');
 // Source communities, west of the I-75 corridor.
 path([[w*.18,268],[x75,268]],'local-access');path([[w*.18,315],[x75,315]],'local-access');
 text(14,257,'WOODLAWN','home-label');text(14,303,'LINCOLN HEIGHTS','home-label');svg.append(el('circle',{cx:w*.18,cy:268,r:4,class:'home-dot'}));svg.append(el('circle',{cx:w*.18,cy:315,r:4,class:'home-dot'}));
 const hospitals=[
 {id:'fairfield',x:w*.12,y:130,label:['Mercy','Fairfield'],tx:14,ty:111,access:[[w*.12,130],[w*.12,180]]},
 {id:'childrens-liberty',x:x75+18,y:61,label:['Children’s Liberty'],tx:x75+29,ty:65,access:[[x75,61],[x75+18,61]]},
 {id:'westchester',x:x75+18,y:115,label:['UC West Chester'],tx:x75+29,ty:119,access:[[x75,115],[x75+18,115]]},
 {id:'bethesda',x:x71+14,y:290,label:['Bethesda','North'],tx:w-12,ty:319,anchor:'end',access:[[x71,290],[x71+14,290]]},
 {id:'jewish',x:w*.68,y:435,label:['Mercy Jewish'],tx:w-12,ty:451,anchor:'end',access:[[w*.68,400],[w*.68,435]]},
 {id:'childrens-main',x:w*.55,y:475,label:['Children’s Burnet'],tx:w*.55+10,ty:479,access:[[x75,475],[w*.55,475]]},
 {id:'samaritan',x:w*.18,y:489,label:['Good','Samaritan'],tx:14,ty:477,access:[[x75,489],[w*.18,489]]},
 {id:'ucmc',x:w*.55,y:515,label:['UCMC'],tx:w*.55+10,ty:519,access:[[x75,515],[w*.55,515]]},
 {id:'christ',x:w*.21,y:551,label:['Christ'],tx:14,ty:555,access:[[x75,551],[w*.21,551]]}
 ];
 for(const p of hospitals){if(w>500){if(['fairfield','samaritan','christ'].includes(p.id)){p.tx=p.x-12;p.anchor='end';}else if(['bethesda','jewish'].includes(p.id)){p.tx=p.x+12;p.ty=p.y+4;p.anchor='start';}}const active=p.id===selected;path(p.access,active?'local-access is-active':'local-access');svg.append(el('circle',{cx:p.x,cy:p.y,r:active?5:4,class:active?'hospital-dot is-active':'hospital-dot'}));p.label.forEach((line,i)=>text(p.tx,p.ty+i*15,line,active?'hospital-label is-active':'hospital-label',p.anchor||'start'));}
 if(showFD){for(const d of departments){const x=w*d.x;svg.append(el('rect',{x:x-3,y:d.y-4,width:6,height:6,class:'fd-dot'}));text(x+8,d.y+3,d.name,'fd-map-label');}}
 canvas.replaceChildren(svg);
 const route=root.querySelector('.highway-route');const p=hospitalPlaces.find(p=>p.id===selected);
 route.innerHTML=p?`<strong>${esc(p.label)}</strong><div class="highway-legs">${approaches[selected].legs.map(l=>`<span>${l}</span>`).join('<i>→</i>')}</div><small>${esc(approaches[selected].local)}</small>`:'<span>Select a hospital to see which highways and directions to take.</span>';
 };
 root.querySelector('#highway-destination').onchange=e=>{selected=e.target.value;draw();};
 root.querySelector('[data-fd-toggle]').onclick=e=>{showFD=!showFD;e.currentTarget.setAttribute('aria-pressed',String(showFD));e.currentTarget.textContent=`${showFD?'Hide':'Show'} nearby FDs`;root.querySelector('#nearby-fds').hidden=!showFD;draw();};
 observer=new ResizeObserver(draw);observer.observe(canvas);draw();
}

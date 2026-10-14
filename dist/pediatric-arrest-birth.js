import {ages,weights,medications,pediatricTubes,igelForWeight,igelSource} from './data.js';
import {pediatricDose} from './pediatric-ui.js';
import {selectedShockDevice,shockDevicePicker} from './defib-guide.js';
import {kgFrom} from './calculations.js';
import {newbornDirections,oxygenGuide} from './birth-ui.js';

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt=n=>Number(n.toFixed(3)).toString();

const numberTile=(label,value,unit='',note='')=>`<div class="leader-number"><span>${label}</span><strong>${value}<small>${unit}</small></strong>${note?`<p>${note}</p>`:''}</div>`;

export function arrestWeight(state){
 const f=state.fields,actual=f['peds-arrest-weight'];
 if(actual!==undefined&&String(actual).trim()!==''){
  const kg=kgFrom(actual,f['peds-arrest-unit']||'kg');
  return Number.isFinite(kg)&&kg>0&&kg<=150?{kg,mode:'actual',index:weights.indexOf(kg)}:{kg:null,mode:'invalid',index:-1};
 }
 const index=Number.isInteger(state.age)&&state.age>=0&&state.age<weights.length?state.age:-1;
 return {kg:index<0?null:weights[index],mode:index<0?'empty':'estimate',index};
}

const arrestDrugs=[
 {name:'Epinephrine',row:'Epinephrine · cardiac arrest',color:'red',stock:.1,rule:kg=>Math.min(.01*kg,1),formula:'0.01 mg/kg · maximum 1 mg',note:'Repeat every 3–5 min. Use 1 mg / 10 mL arrest syringe.',page:152},
 {name:'Amiodarone',row:'Amiodarone · cardiac arrest',color:'purple',stock:50,rule:kg=>Math.min(5*kg,300),formula:'5 mg/kg · maximum 300 mg',note:'Refractory VF / pVT only; may repeat twice per P601.',page:152},
 {name:'Lidocaine · arrest alternative',row:'Lidocaine · cardiac arrest',color:'teal',stock:20,rule:kg=>kg,formula:'1 mg/kg IV / IO push',note:'VF / pVT: alternative to amiodarone. Arrest dose; not IO analgesia.',page:152},
 {name:'Normal saline',row:'Normal saline bolus',color:'blue',stock:null,rule:kg=>20*kg,formula:'20 mL/kg IV / IO',note:'PEA / asystole or traumatic arrest. Reassess; further boluses per medical control.',page:153}
];
export function arrestDose(drug,weight){
 if(!weight.kg)return null;
 const row=medications.find(m=>m.name===drug.row);
 if(weight.index>=0){const d=pediatricDose(row,weight.index);return {...d,table:true};}
 const amount=drug.rule(weight.kg),unit=drug.stock?'mg':'mL';
 return {amount,unit,volume:drug.stock?amount/drug.stock:amount,table:false};
}
function drugCards(state,source){const weight=arrestWeight(state);return `<div class="critical-grid arrest-drugs">${arrestDrugs.map(drug=>{
 const d=arrestDose(drug,weight);
 return `<article class="critical-card" data-priority="${drug.color}" data-arrest-drug="${drug.row}"><h3>${drug.name}</h3><div class="critical-dose"><div><b>${drug.formula}</b><div class="critical-route"><span class="critical-route-badge">IV</span><span class="critical-route-badge">IO</span></div>${drug.stock?`<small>${drug.stock} mg/mL · verify stock</small>`:''}</div><div class="critical-value">${d?`<b>${fmt(d.amount)} <small>${d.unit}</small></b>${drug.stock?`<span>${fmt(d.volume)} mL</span>`:''}`:'<b class="dose-unavailable">Select weight</b>'}</div></div><p>${drug.note}</p>${d?.table&&drug.row==='Amiodarone · cardiac arrest'&&weight.kg===15?'<p class="dose-discrepancy"><b>Printed table: 75 mg / 1.55 mL.</b> At 50 mg/mL, 75 mg converts to 1.5 mL. Confirm this source discrepancy before administration.</p>':''}<div class="critical-links">${source(drug.row==='Normal saline bolus'?'P602':'P601',drug.page)}${d?.table?source('APPENDIX J',rowPage(drug.row)):''}</div></article>`;
 }).join('')}</div><div class="leader-caution"><b>Read back dose, concentration and mL.</b> Different stock → recalculate volume. ETT epi uses a different dose / concentration: ${source('ETT · P601 / P602',152)}</div>`;}
function rowPage(name){return medications.find(m=>m.name===name).page;}
function weightPanel(state,source){const f=state.fields,w=arrestWeight(state),device=selectedShockDevice(f),kg=w.kg,igels=igelForWeight(kg);
 return `<div class="leader-weight-fields"><label class="field">Actual weight<input id="peds-arrest-weight" data-ref-field="peds-arrest-weight" type="number" min="0" step="any" inputmode="decimal" placeholder="If known" value="${esc(f['peds-arrest-weight'])}"></label><label class="field">Units<select id="peds-arrest-unit" data-ref-field="peds-arrest-unit"><option value="kg" ${f['peds-arrest-unit']!=='lb'?'selected':''}>kg</option><option value="lb" ${f['peds-arrest-unit']==='lb'?'selected':''}>lb</option></select></label></div><div class="age-grid">${ages.map((a,i)=>`<button data-age="${i}" aria-pressed="${state.age===i}" class="${state.age===i?'selected':''}"><b>${a}</b><span>${weights[i]} kg estimate</span></button>`).join('')}</div><p class="leader-weight-status" role="status">${w.mode==='invalid'?'Enter a valid weight greater than 0 and no more than 150 kg. Values cleared.':kg?`<b>${fmt(kg)} kg · ${w.mode==='actual'?'actual weight':'age estimate'}</b>${w.mode==='actual'?' · Clear to use age estimate.':' · Confirm weight with Broselow / length-based assessment.'}`:'Enter actual weight, or select an age estimate.'}</p><div class="leader-airway">${numberTile('ET TUBE · APP J',w.index>=0?pediatricTubes[w.index]:'Use Broselow',w.index>=0?'mm':'',w.index<0?'Use length-based sizing.':'Confirm anatomy / placement.')}${numberTile('i-gel · WEIGHT RANGE',igels.map(s=>s.size).join(' / ')||'—','','Match actual weight and anatomy.')}</div><div class="leader-sources">${source('AIRWAY · T706',193)}<a class="source" href="${igelSource}" target="_blank" rel="noopener">i-gel SIZE GUIDE ↗</a></div>${shockDevicePicker(f)}<div class="leader-energy">${numberTile('FIRST SHOCK · 2 J/kg',kg?Math.min(Math.ceil(2*kg),device.max):'—','J')}${numberTile('SECOND · 4 J/kg',kg?Math.min(Math.ceil(4*kg),device.max):'—','J')}${numberTile('LATER · 4–10 J/kg',kg?`${Math.min(Math.ceil(4*kg),device.max)}${4*kg>=device.max?'':'–'+Math.min(Math.ceil(10*kg),device.max)}`:'—','J')}</div><p class="leader-help"><b>VF / pulseless VT · unsynchronized.</b> Round up; maximum ${device.max} J.</p><div class="leader-sources">${source('P601',152)}${source('APPENDIX J',237)}</div>`;
}

const directions=rows=>`<div class="peds-directions">${rows.map(([condition,action])=>`<div class="peds-direction"><b>${condition}</b><span>${action}</span></div>`).join('')}</div>`;
const fold=(state,icon,id,title,symbol,color,body)=>`<details id="${id}" class="birth-fold peds-fold" data-priority="${color}" data-code-open="${id}" ${state.fields[id+'-open']?'open':''}><summary>${icon(symbol)}<b>${title}</b><span class="expand-symbol" aria-hidden="true">+</span></summary><div class="peds-fold-content">${body}</div></details>`;

export function neonatalPanel(state,source,icon){return `<details class="birth-fold neonatal-code peds-fold" data-priority="purple" data-code-open="arrest-neonatal" ${state.fields['arrest-neonatal-open']?'open':''}><summary>${icon('skull')}<b>Neonatal code · at birth</b><span class="expand-symbol" aria-hidden="true">+</span></summary><div class="neonatal-content"><div class="peds-exception">Infant arrest outside delivery → pediatric pathway. Reassess after 30 sec of effective ventilation; pediatric 2-min timer does not apply.</div>${newbornDirections(source)}${oxygenGuide()}<div class="peds-exception">Prolonged term resuscitation: no active warming (P600).</div>${source('P600',151)}</div></details>`;}

function causesPanel(state,source,icon){return fold(state,icon,'peds-causes','Find the cause','search','teal',directions([
 ['Infant found in bed / choking / drowning','Confirm chest rise; correct seal / position, suction or remove visible obstruction. Ask last seen breathing and submersion time.'],
 ['Asthma / airway disease / tracheostomy','Check obstruction, displaced tube and air trapping; reassess ventilation / ETCO₂.'],
 ['Fever / illness / vomiting / diarrhea','Consider sepsis or volume loss; glucose, perfusion and response to fluids.'],
 ['Opioids / pills / unknown ingestion','Get substance, amount, time and packaging. Ventilate; naloxone must not delay CPR / defibrillation.'],
 ['Fire / smoke / heater exposure','Consider CO / cyanide; give oxygen, alert hospital. Normal SpO₂ does not exclude CO.'],
 ['Sudden collapse / known heart disease','Get rhythm, cardiac history and prior surgery; consider arrhythmia / myocarditis.'],
 ['Unexplained arrest / injury','Expose chest, back and scalp; look for occult bleeding or inflicted injury. Trauma pathway if injury explains arrest.']
 ])+`<div class="leader-sources">${source('AIRWAY · P606 / P607',157)}${source('GLUCOSE · P608',161)}${source('SUBMERSION · P614',170)}${source('TOXINS · M411',107)}</div>`);}

function pediatricTrauma(state,source,icon){return fold(state,icon,'peds-trauma','Traumatic arrest','skull','orange',directions([
 ['Gunshot / stabbing / MVC / struck pedestrian / major fall','Control external bleeding; expose chest, axillae and back. Consider hidden blood loss / head injury.'],
 ['Blunt trauma or penetrating torso injury','Bilateral needle decompression per S509 / T701; reassess for recurrent tension.'],
 ['Blood loss','IV / IO NS 20 mL/kg; pressure bag for IO. Recheck flow and hemorrhage control.'],
 ['VF / pVT','Defibrillate per P601 while correcting blood loss, chest pressure and hypoxia.'],
 ['ROSC or EMS-witnessed penetrating arrest','Immediate transport; nearest trauma center. Under 18: pediatric trauma center permitted.'],
 ['Other rhythms / termination','Use S509 rhythm guidance with medical control; no independent termination decision.']
 ])+`<div class="peds-exception"><b>Traumatic / hypovolemic arrest:</b> no routine epi / atropine or TXA; no post-ROSC cooling (S509). Injury insufficient to explain arrest → medical pathway.</div><div class="peds-exception">Pregnancy &gt;24 weeks / fundus at umbilicus → nearest ED for resuscitative delivery.</div><div class="leader-sources">${source('S509',148)}${source('S509 · EXCEPTIONS',149)}${source('DECOMPRESSION · T701',183)}</div>`);}

export function pediatricArrest(state,source,icon,timers,renderRow){
 const check=(id,text)=>renderRow({id:'pediatric-arrest'},{id,text},'brief',0);
 const section=(title,color,body)=>`<section class="check-section priority-section peds-checklist" data-priority="${color}"><h2>${title}</h2>${body}</section>`;
 return `<div class="leader-page peds-brief"><button class="back" data-page="home">← All checklists</button><div class="page-heading"><h1>Pediatric cardiac arrest</h1><div class="large-icon red">${icon('skull')}</div></div>
 <section class="oxygen-priority">${check('main-o2','Turn on O2, cabin power and heat')}</section>
 <nav class="protocol-links" aria-label="Pediatric arrest protocols">${source('P601 · UNDER 16',152)}${source('P602',153)}${source('CPR · SB204',50)}<a class="source" href="https://cpr.heart.org/en/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/Algorithm-PALS-CA-250123.pdf" target="_blank" rel="noopener">AHA · PALS ↗</a></nav>
 <div class="leader-shortcuts"><button data-leader-scroll="peds-weight">${icon('calculator')} Weight & doses</button><button data-leader-scroll="peds-code">${icon('skull')} CPR</button><button data-leader-scroll="peds-timers">${icon('clock')} Timers</button></div>
 ${section('Prepare','blue',check('gear','Pediatric BVM / masks, suction, pads, IV / IO, Broselow')+check('roles','Assign airway, compressions, monitor, access / meds')+check('history','Ask: last seen well, breathing before collapse, illness / injury / exposure'))}
 <div id="peds-code">${section('During CPR','red',`<div class="peds-cpr-strip"><div><b>100–120/min</b><span>Depth ≥⅓ chest</span></div><div><b>15:2</b><span>2 rescuers, prepubertal</span></div><div><b>20–30 breaths/min</b><span>Advanced airway</span></div></div><div class="peds-exception">Single rescuer / pubertal: 30:2. Advanced airway: continuous compressions.</div>${check('cpr','CPR + oxygenated BVM; pads connected')}${check('ventilation','No chest rise? Correct mask seal, position or obstruction; suction ready')}${check('glucose','Check glucose; treat low glucose per P608')}${check('precharge','Pre-charge during CPR; rhythm / pulse check every 2 min; rotate compressors')}<div class="peds-rhythms">${directions([
 ['PEA / asystole','Epi IV / IO as soon as possible, then every 3–5 min. NS 20 mL/kg; reassess. Confirm asystole in 2 leads.'],
 ['VF / pulseless VT','2 J/kg → 4 J/kg → 4–10 J/kg (adult maximum). Clear, shock, immediately resume CPR. Epi after 2 shocks (AHA), then every 3–5 min; amiodarone / lidocaine for refractory VF / pVT.']
 ])}</div><div class="peds-exception">Nonshockable → disarm. Trauma causing arrest → S509 below. HR &lt;60 + poor perfusion despite oxygenation / ventilation → CPR + ${source('P603',154)}.</div>` )}</div>
 ${fold(state,icon,'peds-weight','Weight, doses & shock energy','calculator','purple',weightPanel(state,source)+drugCards(state,source))}
 <div id="peds-timers" class="leader-timers">${timers}</div>
 ${pediatricTrauma(state,source,icon)}
 ${causesPanel(state,source,icon)}
 ${section('ROSC & hospital report','teal',check('airway','Secure airway; recheck ETCO₂, SpO₂, BP and glucose')+check('oxygen','After reliable SpO₂: titrate oxygen; avoid hyperventilation')+check('pressure','Cycle BP every 2 min; prepare weight-based pressor / sedation if needed')+check('report','Report weight, cause, downtime, first rhythm, shocks, drug doses / times, ROSC time')+`<div class="peds-exception">P601: early transport after resuscitation starts. P602: coordinate transport / ongoing resuscitation with medical control.</div><div class="leader-sources">${source('POST-ROSC · C307',83)}${source('PUSH-DOSE EPI · SB205',54)}${source('TERMINATION · A105',20)}</div>`)}
 ${neonatalPanel(state,source,icon)}
 <div class="leader-related"><button class="button" data-page="pediatric">Pediatric calculator</button><button class="button" data-page="birth">Imminent birth</button></div></div>`;
}

export function bindArrestBirth(getState,save){
 document.addEventListener('click',e=>{
  const summary=e.target.closest('[data-code-open]>summary');
  if(summary){const details=summary.parentElement;getState().fields[details.dataset.codeOpen+'-open']=!details.open;save();}
  const b=e.target.closest('[data-leader-scroll]');if(!b)return;
  const target=document.getElementById(b.dataset.leaderScroll);
  if(target?.matches('details[data-code-open]')){getState().fields[target.dataset.codeOpen+'-open']=true;save();target.open=true;}
  if(b.dataset.leaderScroll==='birth-newborn'){getState().fields['birth-neonatal-open']=true;save();target?.querySelector('details')?.setAttribute('open','');}
  target?.scrollIntoView({block:'start'});
 });
 document.addEventListener('toggle',e=>{if(!e.target.isConnected||!e.target.matches('[data-code-open]'))return;getState().fields[e.target.dataset.codeOpen+'-open']=e.target.open;save();},true);
}

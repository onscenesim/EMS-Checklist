import {neonatalEpinephrine} from './neonatal-epinephrine.js';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const item=(id,text)=>({id,text});
const direction=(condition,action,protocol,urgent=false)=>({condition,action,protocol,urgent});
const oxygenAlgorithm='https://www.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2025-Algorithms/1-2-Algorithm-Neonatal-Resuscitation-250129.pdf';
const ucNicu='https://www.uchealth.com/en/womens-care/nicu';
const oxygenTargets=[[2,'65–70'],[3,'70–75'],[4,'75–80'],[5,'80–85'],[10,'85–95']];

const power=item('power','Main O2 + Cabin power + Heat ON');
const prepare=[
 item('equipment','OB kit · neonatal BVM · suction · warm, dry towels'),
 item('teams','Assign mother / baby teams; request extra ALS'),
 item('gestation','Get gestational age')
];
const post=[
 item('birth-time','Record birth time'),
 item('warmth','Dry / warm baby; remove wet towels, cover head'),
 item('assessment','Assess breathing / HR; right-hand SpO₂'),
 item('oxygen','If giving O₂: target SpO₂ 85–95% at ≥10 min after birth'),
 item('restraint','Secure newborn in neonatal restraint')
];
const delivery=[
 direction('Crowning','Deliver on scene'),
 direction('Not imminent','Transport to L&D'),
 direction('Nuchal cord','Slip over head / shoulders; tight cord → O800'),
 direction('Vigorous baby','Delay cord clamp 30–60 sec (O800)')
];
const newborn=[
 direction('First','Dry, warm, position airway; HR + right-hand SpO₂'),
 direction('Apnea / gasping or HR <100','BVM 60/min; begin with ROOM AIR (P600)'),
 direction('No chest rise / no HR rise','Correct seal, position, obstruction'),
 direction('BVM still ineffective','Consider ETT / laryngeal mask BEFORE compressions'),
 direction('HR <60 after 30 sec BVM moving chest','START CHEST COMPRESSIONS: 3 compressions : 1 breath; two-thumb technique',undefined,true),
 direction('During chest compressions','100% O₂; after ROSC, titrate to SpO₂ targets'),
 {epinephrine:true},
 direction('HR ≥60','Stop compressions; continue BVM if needed'),
 direction('ETT','Term 3.0–3.5 mm; preterm 2.5–3.0 mm; confirm CO₂ / depth'),
 direction('Delivery blood loss / shock','NS 20 mL/kg IV; use actual newborn weight')
];
const complications=[
 direction('Heavy bleeding AFTER birth','MASSAGE UTERINE FUNDUS—firm, vigorous pressure. NOT GENTLE.',['O801 · HEMORRHAGE',216],true),
 direction('Hemorrhage / shock','2 IVs + crystalloid + TXA',['TXA · S506',144]),
 direction('Bleeding persists','Control other bleeding sources; do not rely on massage alone'),
 direction('Shoulders stuck','McRoberts + suprapubic pressure; NO fundal pressure / head traction'),
 direction('Prolapsed cord','Lift presenting part, elevate hips, keep cord moist, maternal O₂; urgent transport'),
 direction('Breech / malpresentation','ALS + medical control; O801 maneuvers',['O801',215])
];
const eclampsia=[
 direction('Pregnant / ≤6 weeks postpartum + seizure','Consider eclampsia'),
 direction('Immediate care','Left lateral tilt; glucose, BP, ETCO₂'),
 direction('Seizing, age 16+','Versed 10 mg IM once; alternate routes → M410',['ALTERNATE ROUTES · M410',106]),
 direction('Magnesium','4–6 g IV in 100 mL NS over 20–25 min—even after seizure stops'),
 direction('5 g / 10 mL stock','Draw 8–12 mL; dilute before infusion'),
 direction('Magnesium + Versed','Respiratory depression; no magnesium with myasthenia gravis'),
 direction('No IV','Magnesium 5 g deep IM each buttock (10 g total); Z-track / 3-inch needle'),
 direction('BP ≥160 systolic and/or ≥110 diastolic twice, ≥15 min apart','O802',['SEVERE BP · O802',219])
];

// Regional bands are a briefing reference, never an automatic withholding / TOR rule.
function viability(source){return `<aside class="birth-viability" aria-label="Gestational age and viability"><div class="viability-title">Regional gestational-age bands · O800</div><div class="viability-grid"><div data-priority="orange"><strong>&lt;22 <span>weeks</span></strong><b>Extreme prematurity</b><span>Medical control decision</span></div><div data-priority="purple"><strong>22–24 6/7 <span>weeks</span></strong><b>Periviable</b><span>Indicated care + medical control</span></div><div data-priority="teal"><strong>≥25 <span>weeks</span></strong><b>Viable</b><span>Resuscitate if indicated</span></div></div><div class="viability-decision"><b>Uncertain age / no HR at birth → indicated resuscitation + medical control.</b><span>O800 labels &lt;22 weeks non-viable; UCMC reports care from 21 weeks. Withholding / stopping: medical control decision.</span>${source('O800',213)}<a class="source" href="${ucNicu}" target="_blank" rel="noopener">UCMC · 21 WEEKS ↗</a></div></aside>`;}

export function oxygenGuide(){return `<aside class="newborn-oxygen" aria-label="Newborn oxygen saturation targets"><div class="oxygen-guide-title"><b>SpO₂ targets · right hand / wrist</b><span>Minutes since BIRTH</span></div><div class="oxygen-target-grid">${oxygenTargets.map(([minute,target])=>`<div><span>${minute===10?'≥10':minute} min</span><strong>${target}%</strong></div>`).join('')}</div><div class="oxygen-guide-rule"><b>Excess O₂ can harm. Do not chase 100%.</b><span>Chest compressions: 100% O₂. After ROSC: titrate down.</span><a class="source" href="${oxygenAlgorithm}" target="_blank" rel="noopener">2025 AHA TARGETS ↗</a></div></aside>`;}
function localNicus(state,icon){return `<details id="birth-nicus" class="birth-fold" data-priority="blue" data-code-open="birth-nicus" ${state.fields['birth-nicus-open']?'open':''}><summary>${icon('hospital')}<b>Local high-level NICUs</b><span class="expand-symbol" aria-hidden="true">+</span></summary><div class="nicu-list"><a class="nicu-row" href="${ucNicu}" target="_blank" rel="noopener"><b>UCMC</b><strong>LEVEL III</strong><span>Maternity + NICU · peri-viable care</span></a><a class="nicu-row" href="https://www.trihealth.com/locations/good-samaritan-hospital" target="_blank" rel="noopener"><b>Good Samaritan</b><strong>LEVEL III</strong><span>Maternity + NICU</span></a><a class="nicu-row" href="https://www.cincinnatichildrens.org/service/n/nicu" target="_blank" rel="noopener"><b>Cincinnati Children’s · Burnet</b><strong>LEVEL IV</strong><span>Highest neonatal / surgical level · coordinate maternal care separately</span></a></div></details>`;}

export function imminentBirth(state,source,icon,renderRow){
 const checks=(key,list)=>list.map((entry,i)=>renderRow({id:'birth'},entry,key,i)).join('');
 const directions=list=>list.map(entry=>entry.epinephrine?neonatalEpinephrine(source):`<div class="birth-direction ${entry.urgent?'urgent':''}"><div class="birth-direction-line"><b class="birth-condition">${esc(entry.condition)}</b><span class="birth-arrow" aria-hidden="true">→</span><span class="birth-action">${esc(entry.action)}</span></div>${entry.protocol?`<div class="birth-direction-source">${source(...entry.protocol)}</div>`:''}</div>`).join('');
 const checklist=(number,title,color,key,list,extra='')=>`<section class="check-section priority-section birth-checklist" data-priority="${color}"><h2><span>${number}</span>${title}</h2>${checks(key,list)}${extra}</section>`;
 const flow=(title,color,list)=>`<section class="check-section priority-section birth-flow" data-priority="${color}"><h2>${title}</h2>${directions(list)}</section>`;
 const fold=(id,title,color,list,prefix='',extra='',refs='')=>`<details id="${id}" class="birth-fold ${id==='birth-newborn'?'neonatal-code':''}" data-priority="${color}" data-code-open="${id==='birth-newborn'?'birth-neonatal':id}" ${state.fields[(id==='birth-newborn'?'birth-neonatal':id)+'-open']?'open':''}><summary>${icon({'birth-complications':'caution','birth-newborn':'child','birth-eclampsia':'bolt'}[id])}<b>${title}</b><span class="expand-symbol" aria-hidden="true">+</span></summary><div class="birth-fold-body ${id==='birth-newborn'?'neonatal-content':''}">${prefix}${directions(list)}${extra}${refs?`<div class="birth-source-links">${refs}</div>`:''}</div></details>`;
 return `<div class="birth-page"><button class="back" data-page="home">← All checklists</button><div class="page-heading"><h1>Imminent birth</h1><div class="large-icon teal">${icon('birth')}</div></div>
 <section class="oxygen-priority birth-power" aria-label="Main oxygen, cabin power, and heat first priority">${renderRow({id:'birth'},power,'prepare',0)}</section>
 <div class="birth-source-links birth-protocols">${source('O800',213)}${source('O801',215)}${source('O802',218)}</div>
 ${checklist('01','Pre-delivery','blue','prepare',prepare,viability(source))}
 ${flow('Delivery','teal',delivery)}
 ${fold('birth-complications','Delivery complications','red',complications,'','',source('O801',215))}
 ${checklist('02','Post-delivery','teal','post',post,oxygenGuide())}
 ${fold('birth-newborn','Neonatal code','purple',newborn,viability(source),oxygenGuide(),source('P600',151))}
 ${fold('birth-eclampsia','Eclampsia / severe BP','purple',eclampsia,'','',source('O802',218)+source('P610 · UNDER 16',164)+`<button class="button small" data-page="medications" data-reference-open="magnesium">Magnesium guide</button>`)}
 ${localNicus(state,icon)}
 </div>`;
}

export function newbornDirections(source){return newborn.map(entry=>entry.epinephrine?neonatalEpinephrine(source):`<div class="birth-direction ${entry.urgent?'urgent':''}"><div class="birth-direction-line"><b class="birth-condition">${esc(entry.condition)}</b><span class="birth-arrow" aria-hidden="true">→</span><span class="birth-action">${esc(entry.action)}</span></div></div>`).join('');}

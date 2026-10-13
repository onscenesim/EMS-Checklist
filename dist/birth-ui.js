const aha='https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const item=(id,text)=>({id,text});
const direction=(condition,action,protocol)=>({condition,action,protocol});

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
 item('oxygen','Titrate O₂ to newborn SpO₂ targets; avoid excess O₂'),
 item('restraint','Secure newborn in neonatal restraint')
];
const delivery=[
 direction('Crowning','Deliver on scene'),
 direction('Not imminent','Transport to L&D'),
 direction('Nuchal cord','Slip over head / shoulders; tight cord → O800'),
 direction('Vigorous baby','Delay cord clamp 30–60 sec (O800)')
];
const mother=[
 direction('Heavy bleeding','Assess uterine tone; massage if boggy'),
 direction('Hemorrhage / shock','2 IVs, fluids, TXA',['TXA · S506',144]),
 direction('Placenta undelivered','No cord traction; do not delay transport'),
 direction('22–31 6/7 weeks','Level 3 NICU'),
 direction('Mother / baby unstable','Nearest appropriate hospital'),
 direction('Notify L&D','Gestational age, birth time, blood loss, baby HR / resuscitation duration')
];
const newborn=[
 direction('First','Dry, warm, position airway; HR + right-hand SpO₂'),
 direction('Apnea / gasping or HR <100','BVM 60/min, ROOM AIR (P600)'),
 direction('No chest rise / no HR rise','Correct seal, position, obstruction'),
 direction('HR <60 after 30 sec BVM moving chest','3:1, two thumbs'),
 direction('Persistent HR <60','IV / IO, medical control for epi; repeat q3–5 min'),
 direction('HR ≥60','Stop compressions; continue BVM if needed'),
 direction('ETT','Term 3.0–3.5 mm; preterm 2.5–3.0 mm; confirm CO₂ / depth'),
 direction('Delivery blood loss / shock','NS 20 mL/kg; confirm volume with medical control')
];
const complications=[
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
function viability(source){return `<aside class="birth-viability" aria-label="Gestational age and viability"><div class="viability-title">Gestational age · O800</div><div class="viability-grid"><div data-priority="orange"><strong>&lt;22 <span>weeks</span></strong><b>O800: non-viable</b><span>Medical control decision</span></div><div data-priority="purple"><strong>22–24 6/7 <span>weeks</span></strong><b>Periviable</b><span>Indicated care + medical control</span></div><div data-priority="teal"><strong>≥25 <span>weeks</span></strong><b>Viable</b><span>Resuscitate if indicated</span></div></div><div class="viability-decision"><b>Uncertain age / no HR at birth → indicated resuscitation + medical control.</b><span>Withholding / stopping resuscitation: medical control decision.</span>${source('O800',213)}</div></aside>`;}

export function imminentBirth(state,source,icon,renderRow){
 const checks=(key,list)=>list.map((entry,i)=>renderRow({id:'birth'},entry,key,i)).join('');
 const directions=list=>list.map(entry=>`<div class="birth-direction"><div class="birth-direction-line"><b class="birth-condition">${esc(entry.condition)}</b><span class="birth-arrow" aria-hidden="true">→</span><span class="birth-action">${esc(entry.action)}</span></div>${entry.protocol?`<div class="birth-direction-source">${source(...entry.protocol)}</div>`:''}</div>`).join('');
 const checklist=(number,title,color,key,list,extra='')=>`<section class="check-section priority-section birth-checklist" data-priority="${color}"><h2><span>${number}</span>${title}</h2>${checks(key,list)}${extra}</section>`;
 const flow=(title,color,list)=>`<section class="check-section priority-section birth-flow" data-priority="${color}"><h2>${title}</h2>${directions(list)}</section>`;
 const fold=(id,title,color,list,prefix='',extra='',refs='')=>`<details id="${id}" class="birth-fold ${id==='birth-newborn'?'neonatal-code':''}" data-priority="${color}" data-code-open="${id==='birth-newborn'?'birth-neonatal':id}" ${state.fields[(id==='birth-newborn'?'birth-neonatal':id)+'-open']?'open':''}><summary><b>${title}</b><span class="expand-symbol" aria-hidden="true">+</span></summary><div class="birth-fold-body ${id==='birth-newborn'?'neonatal-content':''}">${prefix}${directions(list)}${extra}${refs?`<div class="birth-source-links">${refs}</div>`:''}</div></details>`;
 return `<div class="birth-page"><button class="back" data-page="home">← All checklists</button><div class="page-heading"><h1>Imminent birth</h1><div class="large-icon teal">${icon('birth')}</div></div>
 <section class="oxygen-priority birth-power" aria-label="Main oxygen, cabin power, and heat first priority">${renderRow({id:'birth'},power,'prepare',0)}</section>
 <div class="birth-source-links birth-protocols">${source('O800',213)}${source('O801',215)}${source('O802',218)}</div>
 ${checklist('01','Pre-delivery','blue','prepare',prepare,viability(source))}
 ${flow('Delivery','teal',delivery)}
 ${fold('birth-complications','Delivery complications','orange',complications,'','',source('O801',215))}
 ${checklist('02','Post-delivery','teal','post',post)}
 ${fold('birth-newborn','Neonatal code','purple',newborn,viability(source),'<div class="birth-source-alert">P600 epi dose / volume and resuscitation timing conflict: confirm with medical control.</div>',source('P600',151)+`<a class="source" href="${aha}" target="_blank" rel="noopener">2025 AHA ↗</a>`)}
 ${flow('Mother & transport','red',mother)}
 ${fold('birth-eclampsia','Eclampsia / severe BP','purple',eclampsia,'','',source('O802',218)+source('P610 · UNDER 16',164)+`<button class="button small" data-page="medications" data-reference-open="magnesium">Magnesium guide</button>`)}
 </div>`;
}

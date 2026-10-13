const aha='https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation';
const item=(id,text,protocol)=>({id,text,...(protocol?{protocol}: {})});

// Briefing prompts only. Each row is an action, threshold, dose, or handoff fact.
const prepare=[
 item('power','Main O₂ + cabin power + heat ON'),
 item('equipment','OB kit · neonatal BVM · suction · warm, dry towels'),
 item('teams','Assign mother / baby teams; request extra ALS'),
 item('gestation','Get gestational age')
];
const delivery=[
 item('imminent','Crowning → deliver on scene'),
 item('nuchal','Check nuchal cord; slip over head / shoulders'),
 item('cord','Vigorous baby → delay cord clamp 30–60 sec (O800)'),
 item('newborn','Record birth time; dry, warm, assess breathing / HR')
];
const after=[
 item('tone','Heavy bleeding → assess uterine tone; massage if boggy'),
 item('hemorrhage','Hemorrhage / shock → 2 IVs, fluids, TXA',['TXA · S506',144]),
 item('placenta','No cord traction; do not wait for placenta'),
 item('restraint','Transport together; secure newborn in neonatal restraint'),
 item('destination','22–31 6/7 weeks → Level 3 NICU; unstable → nearest appropriate hospital'),
 item('handoff','Notify L&D: gestational age, birth time, blood loss, baby HR / resuscitation duration')
];
const newborn=[
 item('assessment','Dry, warm, position airway; HR + right-hand SpO₂'),
 item('ventilation','Apnea / gasping or HR <100 → BVM 60/min, ROOM AIR (P600)'),
 item('correct','No chest rise / no HR rise → correct seal, position, obstruction'),
 item('compressions','HR <60 after 30 sec BVM moving chest → 3:1, two thumbs'),
 item('epi','Persistent HR <60 → IV / IO, medical control for epi; repeat q3–5 min'),
 item('recovery','HR ≥60 → stop compressions; continue BVM if needed'),
 item('tube','ETT: term 3.0–3.5 mm; preterm 2.5–3.0 mm; confirm CO₂ / depth'),
 item('volume','Delivery blood loss / shock → NS 20 mL/kg; confirm volume with medical control')
];
const complications=[
 item('shoulders','Shoulders stuck → McRoberts + suprapubic pressure; NO fundal pressure / head traction'),
 item('prolapse','Prolapsed cord → lift presenting part, elevate hips, keep cord moist, maternal O₂; urgent transport'),
 item('breech','Breech / malpresentation → ALS + medical control; O801 maneuvers',['O801',215])
];
const eclampsia=[
 item('recognition','Pregnant / ≤6 weeks postpartum + seizure → consider eclampsia'),
 item('tilt','Left lateral tilt; glucose, BP, ETCO₂'),
 item('versed','Seizing, age 16+ → Versed 10 mg IM once; alternate routes → M410',['ALTERNATE ROUTES · M410',106]),
 item('magnesium','Magnesium 4–6 g IV in 100 mL NS over 20–25 min—even after seizure stops'),
 item('stock','5 g / 10 mL stock → draw 8–12 mL; dilute before infusion'),
 item('cautions','Magnesium + Versed → respiratory depression; no magnesium with myasthenia gravis'),
 item('mag-im','No IV → magnesium 5 g deep IM each buttock (10 g total); Z-track / 3-inch needle'),
 item('severe-bp','BP ≥160 systolic and/or ≥110 diastolic twice, ≥15 min apart → O802',['SEVERE BP · O802',219])
];

export function imminentBirth(state,source,icon,renderRow){
 const rows=(key,list)=>list.map((entry,i)=>renderRow({id:'birth'},entry,key,i)).join('');
 const section=(number,title,color,key,list)=>`<section class="check-section priority-section" data-priority="${color}"><h2><span>${number}</span>${title}</h2>${rows(key,list)}</section>`;
 const fold=(id,title,color,list,extra='',refs='')=>`<details id="${id}" class="birth-fold ${id==='birth-newborn'?'neonatal-code':''}" data-priority="${color}" data-code-open="${id==='birth-newborn'?'birth-neonatal':id}" ${state.fields[(id==='birth-newborn'?'birth-neonatal':id)+'-open']?'open':''}><summary><b>${title}</b><span class="expand-symbol" aria-hidden="true">+</span></summary><div class="birth-fold-body ${id==='birth-newborn'?'neonatal-content':''}">${rows(id,list)}${extra}${refs?`<div class="birth-source-links">${refs}</div>`:''}</div></details>`;
 return `<div class="birth-page"><button class="back" data-page="home">← All checklists</button><div class="page-heading"><h1>Imminent birth</h1><div class="large-icon teal">${icon('birth')}</div></div><div class="birth-source-links birth-protocols">${source('O800',213)}${source('O801',215)}${source('O802',218)}</div>
 ${section('01','Prepare','blue','prepare',prepare)}
 ${section('02','Deliver','teal','delivery',delivery)}
 ${fold('birth-newborn','Neonatal code','purple',newborn,'<div class="birth-source-alert">P600 epi dose / volume and resuscitation timing conflict: confirm with medical control.</div>',source('P600',151)+`<a class="source" href="${aha}" target="_blank" rel="noopener">2025 AHA ↗</a>`)}
 ${fold('birth-complications','Delivery complications','orange',complications,'',source('O801',215))}
 ${section('03','Mother & transport','red','after',after)}
 ${fold('birth-eclampsia','Eclampsia / severe BP','purple',eclampsia,'',source('O802',218)+source('P610 · UNDER 16',164)+`<button class="button small" data-page="medications" data-reference-open="magnesium">Magnesium guide</button>`)}
 </div>`;
}

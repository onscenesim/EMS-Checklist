export const protocol='https://www.academyofmedicine.org/aws/AOMC/asset_manager/get_file/937559?ver=5';
export const modules=[
  {id:'sick',title:'Sick patient / cardiac arrest',short:'Sick patient / arrest',icon:'pulse',color:'red',tag:'RESUSCITATION',source:'SB204 · SB212 · C300 · C301 · C307',page:50,
    refs:[['Arrest · SB204',50],['Crashing patient · SB212',71],['VF / VT · C300',75],['PEA / asystole · C301',76],['Post-ROSC · C307',83]],
    sections:[
      ['Scene & team',['Assign leader, airway, CPR, access / medications, and scene control','Check responsiveness, breathing, and pulse','Prepare suction and patient movement']],
      ['Assessment & stabilization',['Assess airway / ventilation; use waveform capnography as indicated','Apply monitor; check BP and reassess','Full body assessment and lung sounds','Establish IV / IO as indicated','Use AMS / trauma checklist as needed']],
      ['Cardiac arrest',['Start high-quality CPR; apply defibrillator pads','Identify rhythm; follow arrest protocol','Treat reversible causes','Recheck rhythm / pulse at protocol intervals']],
      ['Transport & handoff',['Reassess and secure equipment before movement','Notify receiving hospital',{text:'After ROSC, follow C307',protocol:['POST-ROSC CARE · C307',83]}]]
    ]},
  {id:'cardio',title:'Defibrillation / cardioversion',short:'Defib / cardioversion',icon:'bolt',color:'amber',tag:'CARDIAC',source:'C300 · C303 · C306',page:75,
    refs:[['Defibrillation · C300',75],['Wide complex · C303',79],['Narrow complex · C306',82]],
    sections:[
      ['Before therapy',['Confirm pulse, rhythm, and protocol','Apply pads; check connection','Select rhythm-specific energy per protocol / device','Assess sedation need; do not delay urgent therapy']],
      ['Synchronized cardioversion',['Enable SYNC; confirm R-wave markers','Clear patient; verify no contact','Deliver synchronized shock as indicated','Recheck SYNC before every shock']],
      ['After therapy',['Recheck rhythm, pulse, perfusion, and BP','Obtain ECG after conversion as appropriate','Record therapy and response']]
    ]},
  {id:'sedation',title:'Sedation',short:'Sedation',icon:'syringe',color:'purple',tag:'PROCEDURE',source:'C303 · C306 · M408 · T715',page:79,
    refs:[['Wide complex · C303',79],['Narrow complex · C306',82],['Restraint · M408',100],['Pediatric restraint · P616',173],['After intubation · T715',209]],
    sections:[
      ['Preparation',['Confirm indication and sedation pathway','Check allergies, prior medications, and contraindications','Baseline mental status, BP, and breathing','Prepare suction, ventilation, and backup airway']],
      ['Medication safety',['Confirm agent, concentration, route, dose, and maximum','Obtain medical-control orders as required','Cross-check medication / route with team member']],
      ['Monitoring & handoff',['Monitor ECG, SpO₂, and waveform capnography as indicated','Recheck ventilation, BP, and consciousness','Record medication, time, response, and repeat-dose orders']],
      ['Post-intubation sedation',[
        {id:'post-intubation',text:'Provide post-intubation analgesia / sedation as indicated',note:'Confirm / secure ETT; continuous ECG, SpO₂, and ETCO₂. Sedate patients given paralytics.',protocol:['POST-INTUBATION SEDATION · T715',209]},
        'Reassess pain, sedation, and BP; hand off medications / times'
      ]]
    ]},
  {id:'intubation',title:'Intubation',short:'Intubation',icon:'airway',color:'blue',tag:'AIRWAY',source:'T705 · T706 · A102 · T715',page:193,
    refs:[['Intubation · T706',193],['Airway · T705',189],['Assisted intubation · A102',17],['After intubation · T715',209]],
    sections:[
      ['Prepare',['Confirm indication, scope, and airway plan','Position / preoxygenate; optimize hemodynamics','Set up and test suction',
        {text:'Prepare adult ETT: 7.0 or 8.0 mm; bougie, lube, laryngoscope',note:'Choose size for patient anatomy; pediatric sizing: Broselow tape.'},
        'Prepare waveform capnography, tube holder, and backup airway',
        {id:'push-dose-epi',text:'Have push-dose epinephrine ready',protocol:['PUSH-DOSE EPI · SB205',53]}
      ]],
      ['Intubate',['Assign operator and backup','Intubate per T706; do not interrupt CPR','Confirm continuous waveform ETCO₂ and bilateral breath sounds',
        {text:'Adult depth: start at 22 cm at teeth; inflate cuff / document depth',note:'Adjust to anatomy; confirm waveform ETCO₂ and bilateral breath sounds. Pediatric depth is patient-specific.'},
        'Secure tube; confirm ventilation'
      ]],
      ['Reassess',['Recheck placement / waveform after every movement','Monitor SpO₂, ETCO₂, and BP',
        {id:'documentation',text:'Document tube size / depth, attempts, and response'}
      ]],
      ['Post-intubation sedation',[
        {id:'post-intubation',text:'Provide post-intubation analgesia / sedation as indicated',note:'Confirm / secure ETT; continuous ECG, SpO₂, and ETCO₂. Sedate patients given paralytics.',protocol:['POST-INTUBATION SEDATION · T715',209],tool:['sedation','Sedation checklist']}
      ]]
    ]},
  {id:'ams',title:'Altered mental status',short:'Altered mental status',icon:'brain',color:'teal',tag:'ASSESSMENT',source:'SB201 · M414',page:43,
    refs:[['AMS · SB201',43],['Stroke · M414',117]],
    sections:[['Immediate neuro checks',[{id:'bgl',text:'Check BGL'},{id:'stroke',text:'Stroke assessment'},{id:'pupils',text:'Check pupils'}]]]},
  {id:'trauma',title:'Trauma',short:'Trauma',icon:'shield',color:'orange',tag:'ASSESSMENT',source:'SB206 · S500 · S501 · S506',page:56,
    refs:[['Trauma assessment · SB206',56],['Hemorrhagic shock · S500',135],['Head / spine · S501',137],['Pain control · S505',142]],
    sections:[
      ['M · Bleeding',[{id:'bleeding',text:'Control bleeding'}]],
      ['A · Airway',[{id:'airway',text:'Check and control airway'}]],
      ['R · Respirations',[{id:'chest-assessment',text:'Assess chest, ventilation, oxygenation'},{id:'chest-treatment',text:'Treat life-threatening chest injuries with decompression, chest seals'}]],
      ['C · Circulation',[{id:'strip-clothes',text:'Strip clothes'},{id:'body-sweep',text:'Full body sweep including armpits and back'},{id:'blood-thinners',text:'Check blood thinners and antiplatelets'},{id:'head-neck',text:'Assess head / neck injury and pupils'}]],
      ['H · Heat',[{id:'warmth',text:'Turn on the heat and remove wet clothing'},{id:'jewelry',text:'Remove constricting jewelry'}]]
    ]}

];
export const checklistId=(moduleId,sectionIndex,item,itemIndex)=>`${moduleId}-${sectionIndex}-${typeof item==='string'?itemIndex:item.id??itemIndex}`;
export const causes=[['oxygen','Hypoxia / hypercapnia','Airway, oxygenation, ventilation, capnography'],['glucose','Glucose abnormality','Obtain and document blood glucose'],['stroke','Stroke / neurologic event','Stroke assessment, pupils, last known well'],['seizure','Seizure / postictal state','Witnessed activity, duration, recovery'],['toxic','Medication / toxin / alcohol','Recent doses, exposures, substances'],['cardiac','Cardiac cause / poor perfusion','ECG, blood pressure, rhythm'],['infection','Infection / sepsis','Temperature, suspected source, perfusion'],['trauma','Trauma / head injury','Injury survey, history, anticoagulants'],['metabolic','Other metabolic cause','History, comorbidities, available findings']];
export const ages=['0–3 mo','6 mo','9–24 mo','3 yr','6 yr','8 yr','10 yr','12 yr','14 yr'];
export const weights=[3,5,10,15,20,25,30,40,50];
export const pediatricTubes=['3.0–3.5','3.5','4.0–4.5','5.0','5.5','6.0','6.5','7.0','7.0'];
export const igelSource='https://www.intersurgical.com/info/igel-anaesthesia';
export const igelSizes=[{size:1,min:2,max:5},{size:1.5,min:5,max:12},{size:2,min:10,max:25},{size:2.5,min:25,max:35},{size:3,min:30,max:60},{size:4,min:50,max:90},{size:5,min:90,max:Infinity}];
export const igelForWeight=kg=>Number.isFinite(kg)&&kg>0?igelSizes.filter(s=>kg>=s.min&&kg<=s.max):[];
// Source-table values, not interpolation. Null means not listed for this age category.
// Each row retains its indication, route and concentration. Clinical release is pending review.
const row=(name,route,concentration,doses,volumes,unit='mg',note='',page=237)=>({name,route,concentration,doses,volumes,unit,note,page});
export const medications=[
row('Acetaminophen · pain','PO','160 mg / 5 mL',[45,75,150,225,300,375,450,600,750],[1.4,2.3,4.7,7,9.4,12,14,19,23],'mg','Pain only. Fever dosing uses M421; confirm age eligibility in P611.'),
row('Adenosine · initial dose','IV','3 mg/mL',[.3,.5,1,1.5,2,2.5,3,4,5],[.1,.17,.33,.5,.67,.83,1,1.3,1.7],'mg','P604: medical control; rapid IV push followed by rapid 10 mL NS flush.'),
row('Amiodarone · cardiac arrest','IV/IO','50 mg/mL',[15,25,50,75,100,125,150,200,250],[.3,.5,1,1.55,2,2.5,3,4,5],'mg','Table dose and volume as printed.'),
row('Atropine','IV/IO','0.1 mg/mL',[.06,.1,.2,.3,.4,.5,.5,.5,.5],[.6,1,2,3,4,5,5,5,5]),
row('Sodium bicarbonate','IV/IO','8.4% · 1 mEq/mL',[3,5,10,15,20,25,30,40,50],[3,5,10,15,20,25,30,40,50],'mEq'),
row('Dextrose 10%','IV/IO','0.1 g/mL',[1.5,2.5,5,7.5,10,12.5,15,20,25],[15,25,50,75,100,125,150,200,250],'g'),
{...row('Dextrose 25%','IV/IO','0.25 g/mL',[1.5,2.5,5,null,null,null,null,null,null],[6,10,20,null,null,null,null,null,null],'g','Table dose and volume as printed.'),doseUnits:['g','mg','g',null,null,null,null,null,null]},
row('Dextrose 50%','IV/IO','0.5 g/mL',[null,null,null,7.5,10,12.5,15,20,25],[null,null,null,15,20,25,30,40,50],'g'),
row('Diphenhydramine','IM/IV','50 mg/mL',[null,null,10,15,20,25,30,40,50],[null,null,.2,.3,.4,.5,.6,.8,1]),
row('Epinephrine · cardiac arrest','IV/IO','0.1 mg/mL',[.03,.05,.1,.15,.2,.25,.3,.4,.5],[.3,.5,1,1.5,2,2.5,3,4,5],'mg','P601: repeat every 3–5 minutes; maximum 1 mg per IV/IO dose.'),
row('Epinephrine · anaphylaxis','IM','1 mg/mL',[null,.05,.1,.15,.2,.25,.3,.3,.3],[null,.05,.1,.15,.2,.25,.3,.3,.3]),
{...row('Epinephrine · push dose','IV','10 mcg/mL',[3,5,10,15,20,20,20,20,20],[.3,.5,1,1.5,2,2,2,2,2],'mcg'),perDose:true,dosingRule:'1 mcg/kg · max 20 mcg per dose'},
row('Fentanyl','IV/IO/IM/SC','50 mcg/mL',[null,5,10,15,20,25,30,40,50],[null,.1,.2,.3,.4,.5,.6,.8,1],'mcg'),
row('Fentanyl','IN','50 mcg/mL',[null,10,20,30,40,50,60,80,100],[null,.2,.4,.6,.8,1,1.2,1.6,2],'mcg'),
row('Glucagon','IM','1 unit/mL · table label',[.5,.5,.5,.5,1,1,1,1,1],[.5,.5,.5,.5,1,1,1,1,1],'mg'),
row('Hypertonic saline · increased ICP','IV','3%',[12,20,40,60,80,100,120,160,200],null,'mL','Once; maximum 500 mL. Confirm indication in the full protocol.'),
row('Ketamine · pain','IV/IO','10 mg/mL',[null,null,null,null,4,5,6,8,10],[null,null,null,null,.4,.5,.6,.8,1],'mg','100 mg/mL is not recommended for pediatric IV/IO in App J.'),
row('Ketamine · pain','IV/IO','50 mg/mL',[null,null,null,null,4,5,6,8,10],[null,null,null,null,.08,.1,.12,.16,.2]),
row('Ketamine · pain','IN','50 mg/mL',[null,null,null,null,12,15,18,24,30],[null,null,null,null,.24,.3,.36,.48,.6],'mg','10 mg/mL is not recommended for pediatric IN in App J.',238),
row('Ketamine · pain','IN','100 mg/mL',[null,null,null,null,12,15,18,24,30],[null,null,null,null,.12,.15,.18,.24,.3],'mg','',238),
row('Lidocaine · cardiac arrest','IV/IO','20 mg/mL',[3,5,10,15,20,25,30,40,50],[.15,.25,.5,.75,1,1.25,1.5,2,2.5],'mg','',238),
row('Lidocaine · before IO infusion','IO','20 mg/mL',[null,null,null,null,null,null,null,1,1],null,'mL','Prime extension tubing with lidocaine, not saline, for IO pain control. Let dwell 60 seconds before the saline flush. Small pediatric doses: follow device instructions for direct-hub administration.',238),
row('Methylprednisolone','IV/IO/IM/PO','62.5 mg/mL',[null,null,null,30,30,60,60,60,60],[null,null,null,.5,.5,1,1,1,1],'mg','Volumes are rounded as printed in App J.',238),
row('Midazolam · seizures','IM/IN/Buccal','5 mg/mL',[.6,1,2,5,5,5,5,10,10],[.12,.2,.4,1,1,1,1,2,2],'mg','P610 uses weight bands; do not interpolate from the row heading.',238),
row('Midazolam · seizures','IV','5 mg/mL',[.3,.5,1,1.5,2,2.5,3,4,5],[.06,.1,.2,.3,.4,.5,.6,.8,1],'mg','',238),
row('Midazolam · sedation','IV/IO','5 mg/mL',[.3,.5,1,1.5,2,2.5,3,4,5],[.06,.1,.2,.3,.4,.5,.6,.8,1],'mg','Indication-specific authorization applies; this row does not authorize general procedural sedation.',238),
row('Midazolam · sedation','IM/IN','5 mg/mL',[.6,1,2,3,4,5,6,8,10],[.12,.2,.4,.6,.8,1,1.2,1.6,2],'mg','Indication-specific authorization applies; see P616 for chemical restraint.',238),
row('Morphine sulfate','IV/IM','10 mg/mL',[null,null,null,1.5,2,2.5,3,4,5],[null,null,null,.15,.2,.25,.3,.4,.5],'mg','',238),
row('Naloxone','All routes in App J','1 mg/mL',[.3,.5,1,1.5,2,2,2,2,2],[.3,.5,1,1.5,2,2,2,2,2],'mg','Confirm route and formulation with the applicable protocol.',238),
row('Normal saline bolus','IV/IO','0.9%',[60,100,200,300,400,500,600,800,1000],null,'mL','20 mL/kg reference; indication-specific limits and reassessment apply.',238),
row('Ondansetron','IV','2 mg/mL',[null,null,1.5,2,3,4,4,4,4],[null,null,.75,1,1.5,2,2,2,2],'mg','Confirm age eligibility in M405.',238),
row('Ondansetron','PO','4 mg tablet',[null,null,null,4,4,4,4,4,4],null,'mg','',238),
row('Prednisolone','PO','3 mg/mL',[null,null,null,30,30,60,60,60,60],[null,null,null,10,10,20,20,20,20],'mg','',238),
row('Prednisone','PO','20 mg tablets',[null,null,null,30,30,60,60,60,60],null,'mg','30 mg = 1.5 tablets; 60 mg = 3 tablets.',238),
row('Tranexamic acid','IV','10 mg/mL',[45,75,150,225,300,375,450,1000,1000],[4.5,7.5,15,22.5,30,37.5,45,100,100],'mg','Confirm indication, age eligibility, preparation, and administration in S506.',238)
];
export function energies(index,adultMax){if(!Number.isInteger(index)||index<0||index>=weights.length||![200,360].includes(adultMax))return null;const w=weights[index];return [Math.min(Math.ceil(w*2),adultMax),Math.min(Math.ceil(w*4),adultMax),Math.min(Math.ceil(w*10),adultMax)];}

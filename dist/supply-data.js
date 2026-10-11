// Inventory reference: Medic Check Form.pdf supplied 2026-10-10, pp. 1–4.
// Quantities describe stock at each location; they are not requested restock quantities.
const categories=[
  ['airway','Airway & suction','airway'],['oxygen','Oxygen & ventilation','pulse'],
  ['monitor','Monitoring & assessment','pulse'],['iv','IV & IO','syringe'],
  ['meds','Medications & fluids','syringe'],['trauma','Trauma & dressings','shield'],
  ['ppe','PPE & infection control','shield'],['movement','Moving & immobilizing','child'],
  ['power','Equipment & batteries','bolt'],['vehicle','Vehicle & safety','grid'],
  ['reference','Bags & reference supplies','book']
].map(([id,name,icon])=>({id,name,icon}));
const entries=[];
function stock(category,location,rows){for(const row of rows.trim().split('\n')){const [name,stock,aliases='']=row.split('|');entries.push({category,location,name,stock,aliases});}}
stock('ppe','Cab',`Gloves — small||S gloves
Gloves — medium||M gloves
Gloves — large||L gloves
Gloves — extra large||XL gloves
Surgical masks|At least 10|face mask`);
stock('vehicle','Cab',`Report tablet||
MDC||mobile data computer
Mobile radio||
Traffic vest|2|high visibility
Passports|2|
Tactical vest|2|`);
stock('reference','Cab',`ERG||Emergency Response Guidebook
NIOSH book||`);
stock('vehicle','Mechanical',`Bay door opener||
Fuel card||`);
stock('oxygen','Exterior L-1',`Main oxygen bottle|Above 300 per form|O2 cylinder`);
stock('vehicle','Exterior L-1',`Irons||Halligan flathead axe
Hydrant wrench||`);
stock('movement','Exterior L-2',`Stairchair||stair chair
Megamover||mega mover
Vacuum splint kit||vaccum
Vacuum leg splint||
Vacuum arm splint||
Vacuum ankle splint||
Vacuum splint pump||`);
stock('movement','Exterior L-3',`Backboard|2|
Pediatric board||pedi board
Reeves roll-up board||
KED||Kendrick extrication device
Hare traction splint||
Head blocks|2|CID bag
Adult cervical collar|2|c collar CID bag
Pediatric cervical collar|2|pedi c collar CID bag
Sheet||CID bag linen
Backboard straps|6 pairs|CID bag`);
stock('power','Interior / exterior R-1 access',`Portable suction||
Spare cot battery||
LUCAS||mechanical CPR
LUCAS suction cup||
LUCAS head strap||
LUCAS backboard||
Tactical helmet|2|
Turnout gear||`);
stock('reference','Interior / exterior R-1 access',`Pediatric bag||pedi
IV bag — blue||intravenous
IV bag — red||intravenous
First-in bag||first in
Drug bag||`);
stock('monitor','Interior / exterior R-1 access',`Monitor||cardiac`);
stock('vehicle','Exterior R-2',`SCBA #1||self contained breathing apparatus
SCBA #2||self contained breathing apparatus`);
stock('power','Monitor',`Monitor battery|2|batteries`);
stock('monitor','Monitor',`BP cuff — small||blood pressure S
BP cuff — medium||blood pressure M
BP cuff — large||blood pressure L
3-lead cable||three lead
12-lead cable||twelve lead
Pulse oximeter||pulse ox
Adult defibrillator pads||adult pads
Pediatric defibrillator pads||pedi pads
Pediatric pulse ox sticker||pedi finger
Test block||
Monitor paper||spare
Electrodes|At least 20|ECG EKG stickers
In-line ETCO2||inline capnography
Nasal ETCO2||capnography`);
stock('airway','First-in bag · top pouch',`Oral airways — 50–110 mm||OPA 50 60 70 80 90 100 110 mm
Nasal airways — 20–36 Fr||NPA 20 22 24 26 28 30 32 34 36 FR
KY jelly|2|lubricant
Emesis bag|2|vomit mesh pocket`);
stock('oxygen','First-in bag · mesh pockets',`Adult non-rebreather mask||NRB
Adult nasal cannula||NC
Pediatric non-rebreather mask||pedi NRB
Pediatric nasal cannula||pedi NC`);
stock('oxygen','First-in bag · main pouch',`Portable oxygen bottle|300 minimum per form|O2 cylinder
Oxygen key||O2 wrench
BVM||bag valve mask ambu`);
stock('monitor','First-in bag · blue bag',`BP cuff — adult||blood pressure
Stethoscope||
Pulse oximeter||pulse ox
Thermometer||
Penlight||`);
stock('monitor','First-in bag · glucometer pouch',`Glucometer||blood glucose meter
Lancets|5|
Test strips|More than 5|glucose`);
stock('iv','First-in bag · glucometer pouch',`Alcohol preps||alcohol pads swabs`);
stock('trauma','First-in bag · glucometer pouch',`Band-Aids|More than 5|bandaids adhesive bandage`);
stock('trauma','First-in bag · trauma bag',`Trauma shears||scissors
4 × 4 gauze|5|4x4
Combine pad|5|combi ABD
4-inch roll bandage|2|4x4 Kling
2-inch roll bandage|2|2x4 Kling
Coban|1 roll|self adherent
Ring cutter||
Tape|2 rolls|
Triangular bandage||`);
stock('reference','First-in bag · main pouch & lid',`Trauma bag||`);
stock('airway','Drug bag · right zipper',`i-gel — size 3||igel i gel
 i-gel — size 4||igel i gel
 i-gel — size 5||igel i gel`.replace(/^ /gm,''));
stock('trauma','Drug bag · left zipper',`Israeli trauma bandage|2|
Tourniquet|2|torniquet
4-inch Kling||4 in 4in
Trauma shears||scissors
Tape||
Chest seal|2|
Burn dressing||
Needle decompression|2|`);
stock('movement','Drug bag · left zipper',`Arm board|2|`);
stock('ppe','Drug bag · left zipper',`Gown||`);
stock('ppe','Drug bag · top zipper',`Sharps container||`);
stock('iv','Drug bag · medicine (red)',`18 G needle — 1 inch|5|18g 1\"
18 G filter needle — 1.5 inches|5|18g 1.5\"
22 G needle — 1 inch|5|22g 1\"
10 mL saline flush||10ml
1 mL syringe|2|1ml
3 mL syringe|2|3ml
5 mL syringe|2|5ml
10 mL syringe||10ml 10cc
MAD device|2|mucosal atomization intranasal`);
stock('meds','Drug bag · medicine (red)',`Atropine — 1 mg|3|atropine 1mg
Epinephrine — 1:10,000|6|epi 1:10000
Narcan — 1 mg|2|naloxone 1mg
Aspirin||ASA
Epinephrine — 1 mg, 1:1,000|2|epi 1mg 1:1000
Amiodarone — 150 mg|3|150mg
Adenosine — 6 mg||6mg
Adenosine — 12 mg|2|12mg
Zofran — 4 mg|2|ondansetron 4mg
Solu-Medrol — 125 mg|2|solu medrol methylprednisolone 125mg
Benadryl — 50 mg|2|diphenhydramine 50mg
Nitroglycerin||nitro
Glucagon||
Pediatric acetaminophen|6|pedi Tylenol
Oral glucose|2|
DuoNeb|2|duo-neb duo neb ipratropium albuterol
Albuterol|2|
Oral Zofran||ondansetron`);
stock('meds','Drug bag · universal (black)',`3% hypertonic solution — 500 mL||saline 500ml
10% dextrose — 250 mL||D10 250ml
Magnesium sulfate||
Sodium bicarbonate||bicarb
Lidocaine||
D50 or D10||dextrose
Nifedipine||
Afrin||oxymetazoline
Calcium chloride||`);
stock('iv','Drug bag · universal (black)',`10 mL saline flush||10ml
Stopcock||
Drip set — 15 gtt/mL||15 gtts dripset`);
stock('reference','Drug bag · universal (black)',`TXA kit||tranexamic acid`);
stock('meds','TXA kit · universal (black)',`TXA — 1 g in 10 mL||tranexamic acid 1g 10ml
Saline — 100 mL||normal saline NS 100ml`);
stock('iv','TXA kit · universal (black)',`Drip set — 60 gtt/mL||60 gtts dripset microdrip
10 mL syringe||10cc 10ml
Transfer needle||`);
stock('power','Drug bag · airway (green)',`C batteries|2|`);
stock('iv','Drug bag · airway (green)',`20 mL syringe||20ml
10 mL syringe||10ml 10cc`);
stock('airway','Drug bag · airway (green)',`Magill forceps — small||sm
Magill forceps — large||lg
Colorimetric CO2 detector||colormetric
ET tube — 6 mm||ETT 6.0
ET tube — 6.5 mm||ETT
ET tube — 7 mm||ETT 7.0
ET tube — 7.5 mm||ETT
ET tube — 8 mm||ETT 8.0
Tube holder||ETT
Bougie||
Blade handle||laryngoscope
Miller blade — size 3||
Miller blade — size 4||
Mac blade — size 3||Macintosh
Mac blade — size 4||Macintosh
UE scope||video laryngoscope
D3 blade||
D4 blade||`);
stock('monitor','Drug bag · airway (green)',`In-line ETCO2||inline capnography`);
stock('iv','Drug bag · intravenous (blue)',`Pressure infuser||
IO drill||intraosseous EZ IO
IO stabilizer||
IO needle — 15 mm, red||15mm
IO needle — 25 mm, blue||25mm
IO needle — 45 mm, yellow||45mm`);
stock('iv','IV bag · intravenous (blue)',`22 G catheter|2|22g IV
20 G catheter|2|20g IV
18 G catheter|2|18g IV
16 G catheter|2|16g IV
Tourniquet|2|torniquet
Alcohol preps|5|alcohol pads swabs
Tape|1 roll|
Tegaderm|2|
2 × 2 gauze|4|2x2
Lockset|2|lock set
Drip set — 15 gtt/mL||15 gtts dripset
IV start kit|2|
10 mL saline flush|2|10ml`);
stock('meds','IV bag · intravenous (blue)',`Saline — 1,000 mL||normal saline NS 1000ml 1 liter`);
stock('ppe','Above side door',`Gloves — medium||M gloves
Gloves — large||L gloves
Gloves — extra large||XL gloves`);
stock('airway','Interior compartment 1',`Oral airways — 50–110 mm|1 each|OPA 50 60 70 80 90 100 110 mm
Nasal airways — 20–36 Fr|1 each|NPA 20 22 24 26 28 30 32 34 36 FR
Bulb syringe|2|
Yankauer suction set||catheter
KY jelly|3|lubricant
 i-gel — size 3||igel i gel
 i-gel — size 4||igel i gel
 i-gel — size 5||igel i gel
Suction catheter — 10 Fr||10FR
Suction catheter — 12 Fr||12FR
Suction catheter — 14 Fr||14FR
Suction catheter — 16 Fr||16FR
Suction catheter — 18 Fr||18FR`.replace(/^ /gm,''));
stock('monitor','Interior compartment 1',`O2 inline / NC / Capoline|2 each|ETCO2 capnography capnoline`);
stock('oxygen','Interior compartment 1',`Adult non-rebreather mask|2|NRB
Adult nasal cannula|2|NC
Pediatric non-rebreather mask|2|pedi NRB
Pediatric nasal cannula|2|pedi NC
Nebulizer|2|
Nebulizer mask|2|
CPAP — medium||med
CPAP — large||lg
Adult BVM||bag valve mask ambu
Pediatric BVM||pedi bag valve mask ambu`);
stock('vehicle','Action area',`Squad phone & charger||`);
stock('airway','Action area',`Suction canister||
Yankauer suction set||catheter`);
stock('oxygen','Action area',`Wall-mount oxygen regulator||O2`);
stock('trauma','Action area',`Trauma shears||scissors`);
stock('monitor','Action area',`Stethoscope||
Penlight||`);
stock('power','Action area',`Spare LUCAS battery||`);
stock('reference','Action area',`Quick reference charts||
Hospital phone list||
Protocol binder||
Seal log book||`);
stock('power','Behind jump seat compartment',`UE scope charger||`);
stock('reference','Behind jump seat compartment',`Employee Narcan||employee naloxone seal`);
stock('ppe','CPR seat · under cushion',`Tyvek suit|2|
Biohazard bags|10|bio hazard
PPE kit||`);
stock('movement','CPR seat · under cushion',`Hard restraints|4|
Soft restraints|4|`);
stock('movement','Interior compartment 2',`SAM pelvic sling||
SAM splint|2|`);
stock('ppe','Interior compartment 2',`N95 mask|4|N-95`);
stock('airway','Interior compartment 2',`Quick Trach — adult||quicktrach cricothyrotomy
Quick Trach — pediatric||pedi quicktrach cricothyrotomy
LifeVac||
Bite stick|2|`);
stock('trauma','Interior compartment 2',`SAM chest seal|2|
Non-adhering dressing|5|non adhering
Cold pack|3|ice
Heat pack|3|hot
Trauma shears||scissors
Burn sheet|2|
Chuk pad|2|chux underpad
Triangular bandage|3|
Trauma wound dressing|2|
14 G decompression needle|4|14ga 14g needle decompression
CAT tourniquet|2|combat application
Coban|2|self adherent
Nose pincher|2|epistaxis clamp
4-inch Kling|4|4 in 4in
2-inch Kling|2|2 in 2in
Combine pad|5|combi ABD
4 × 4 gauze|20|4x4
2 × 2 gauze|10|2x2
Band-Aids|10|bandaids adhesive bandage
OB kit|2|obstetric childbirth
Eye pad|2|
Eye shield|2|`);
stock('monitor','Interior compartment 2',`12-lead stickers||extra electrodes ECG EKG`);
stock('movement','Interior compartment 3',`Towels|6|linen`);
stock('oxygen','Bench seat · under seat',`Spare oxygen bottle||O2 cylinder`);
stock('movement','Bench seat · under seat',`Spare linen||sheet towel
Pedi-Mate||pediatric restraint`);
stock('oxygen','Cot',`Cot oxygen bottle|Above 500 per form|O2 cylinder`);
stock('movement','Cot',`Cot||stretcher
Cot straps|3|
Extra linen||sheet towel`);
stock('iv','Crew-added supply',`Drip set — 10 gtt/mL||10 drop set 10 drop sets 10 gtt tubing`);
stock('power','Crew-added supply',`Radio battery||portable radio battery spare radio battery replacement radio battery walkie talkie battery`);
// Keep the complete source inventory, then expose only items appropriate for restock.
const catalog=new Map();
for(const entry of entries){const key=entry.category+'|'+entry.name;let item=catalog.get(key);if(!item){item={id:entry.category+'-'+entry.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/-$/,''),name:entry.name,category:entry.category,aliases:entry.aliases,locations:[]};catalog.set(key,item);}else{item.aliases+=' '+entry.aliases;}item.locations.push({name:entry.location,stock:entry.stock});}
const inventory=[...catalog.values()];
const durableNames=new Set([
 'ERG','NIOSH book','Pediatric bag','IV bag — blue','IV bag — red','First-in bag','Drug bag','Trauma bag','Quick reference charts','Hospital phone list','Protocol binder','Seal log book',
 'Oxygen key','Wall-mount oxygen regulator',
 'Stairchair','Vacuum splint kit','Vacuum leg splint','Vacuum arm splint','Vacuum ankle splint','Vacuum splint pump','Backboard','Pediatric board','Reeves roll-up board','KED','Hare traction splint','Backboard straps','Hard restraints','Pedi-Mate','Cot','Cot straps',
 'Portable suction','Spare cot battery','LUCAS head strap','LUCAS backboard','Tactical helmet','Turnout gear','Spare LUCAS battery','UE scope charger',
 'Monitor','BP cuff — small','BP cuff — medium','BP cuff — large','BP cuff — adult','3-lead cable','12-lead cable','Pulse oximeter','Test block','Stethoscope','Thermometer','Penlight','Glucometer',
 'Magill forceps — small','Magill forceps — large','Blade handle','Miller blade — size 3','Miller blade — size 4','Mac blade — size 3','Mac blade — size 4','UE scope','LifeVac','IO drill','Pressure infuser','Trauma shears','Ring cutter'
]);
export const supplies=inventory.filter(item=>item.category!=='vehicle'&&!durableNames.has(item.name));
// Quick picks reference the same inventory IDs and restock quantities as the full catalog.
export const frequentlyUsed=[
 ['18 G catheter','18 G IV catheter'],['20 G catheter','20 G IV catheter'],['22 G catheter','22 G IV catheter'],
 ['IV start kit','IV start kit'],['10 mL saline flush','10 mL saline flush'],['Lockset','J loop · lockset'],
 ['Drip set — 10 gtt/mL','10-drop set'],['Saline — 1,000 mL','0.9% normal saline · 1 liter bag'],
 ['Nasal ETCO2','ETCO2 nasal cannula'],['Electrodes','Electrodes'],['Monitor paper','EKG paper'],
 ['Monitor battery','New battery · monitor'],['Alcohol preps','Alcohol preps'],['Band-Aids','Band-Aids'],['Lancets','Glucometer lancets'],
 ['Gloves — medium','Medium gloves'],['18 G filter needle — 1.5 inches','Filter needle · 18 G'],
 ['3 mL syringe','3 mL syringe'],['1 mL syringe','1 mL syringe'],['Radio battery','Radio battery']
].map(([name,label])=>{const item=supplies.find(s=>s.name===name);if(item)item.aliases+=' '+label;return {item,label};});
export const supplyCategories=categories.filter(c=>supplies.some(item=>item.category===c.id)).map(c=>({...c,name:c.id==='power'?'Batteries & LUCAS':c.id==='reference'?'Replacement kits':c.name}));
export const inventoryLocations=[...new Set(supplies.flatMap(item=>item.locations.map(l=>l.name)))];
// Common crew terminology, singular/plural forms, and abbreviations.
const extraAliases=[
 [/^\d+ G catheter$/, 'IV cath caths IV catheter catheters intravenous cannula cannulas cannulation angiocath angiocaths angiocatheter IV needle IV needles venflon'],
 [/^IO needle/, 'intraosseous EZ-IO EZIO IO needles'],
 [/syringe/i, 'syringes cc ml'],
 [/Nasal ETCO2/i, 'ETCO2 nasal cannula ETCO2 nasal cannulas capnography cannula capno NC'],
 [/Monitor paper/i, 'EKG paper ECG paper rhythm paper printer paper'],
 [/Monitor battery/i, 'new battery new batteries replacement battery Zoll battery monitor batteries'],
 [/Lancets/i, 'glucometer lancet glucometer lancets fingerstick lancet'],
 [/saline flush/i, 'flush flushes saline flushes NS prefilled flush'],
 [/drip set/i, 'dripset dripsets drip sets tubing IV tubing giving set infusion set'],
 [/IV start kit/i, 'IV kit IV kits cannulation kit startkit'],
 [/Lockset/i, 'saline lock IV lock hep lock heplock extension tubing extension set J loop J loops jloop jloops'],
 [/Tegaderm/i, 'transparent dressing clear dressing IV dressing'],
 [/Alcohol preps/i, 'alcohol wipes alcohol swabs alcohol pads prep pads'],
 [/gauze/i, 'gauze pads gauze sponges dressing dressings'],
 [/Combine pad/i, 'ABD pad ABD pads abdominal pad abdominal pads combine dressing'],
 [/Coban/i, 'coflex self adherent wrap self adhesive wrap vet wrap'],
 [/Kling|roll bandage/i, 'rolled gauze gauze roll roller bandage conforming bandage'],
 [/Band-Aids/i, 'bandaid band aids bandaids adhesive bandages plasters'],
 [/Tourniquet/i, 'tourniquets tq tqs'],
 [/CAT tourniquet/i, 'combat tourniquet combat application tourniquet'],
 [/Chest seal/i, 'chest seals occlusive dressing occlusive dressings'],
 [/Chuk pad/i, 'chux chucks underpads absorbent pad'],
 [/Emesis bag/i, 'barf bag vomit bag sick bag emesis bags'],
 [/Gloves/i, 'exam gloves nitrile gloves'],
 [/Oral airways/i, 'oral airway OPAs oropharyngeal airway'],
 [/Nasal airways/i, 'nasal airway NPAs nasopharyngeal airway nasal trumpet nose trumpet'],
 [/i-gel/i, 'igels i gels supraglottic airway SGA'],
 [/ET tube/i, 'ET tubes ETTs endotracheal tube endotracheal tubes breathing tube'],
 [/Yankauer/i, 'yankauer yankeur yankour rigid suction suction tip'],
 [/Suction catheter/i, 'suction cath suction caths suction catheters'],
 [/non-rebreather/i, 'nonrebreather non rebreather oxygen mask NRB masks'],
 [/nasal cannula/i, 'nasal cannulas nasal prongs oxygen tubing NC'],
 [/BVM/i, 'ambu bag ambubag bag valve mask resuscitator'],
 [/oxygen bottle/i, 'oxygen tank O2 tank O2 bottle oxygen cylinder'],
 [/Saline —/i, 'saline bag saline bags IV fluid IV fluids NS normal saline sodium chloride'],
 [/Nitroglycerin/i, 'nitroglycerine nitrostat NTG'],
 [/Epinephrine/i, 'adrenaline epinepherine'],
 [/acetaminophen/i, 'paracetamol APAP tylenol'],
 [/Zofran/i, 'ondansetron zofran ODT'],
 [/LUCAS/, 'lucas device CPR machine chest compression device']
];
for(const item of supplies){for(const [pattern,aliases] of extraAliases){if(pattern.test(item.name))item.aliases+=' '+aliases;}if(/^\d+ G catheter$/.test(item.name)){const gauge=item.name.match(/^\d+/)[0];item.aliases+=` ${gauge} gauge ${gauge} ga ${gauge} g ${gauge}g`;}}
const normalize=s=>s.toLowerCase().normalize('NFKD').replace(/(\d)\s*(?:gauge|ga|g)\b/g,'$1 g').replace(/[^a-z0-9%.]+/g,' ').trim();
const commonWords={caths:'catheter',cath:'catheter',catheters:'catheter',cannulas:'cannula',cannulae:'cannula',needles:'needle',syringes:'syringe',flushes:'flush',pads:'pad',bandages:'bandage',dressings:'dressing',bags:'bag',tubes:'tube',gloves:'glove',wipes:'wipe',swabs:'swab',gtts:'gtt',gauge:'g',ga:'g'};
const terms=s=>normalize(s).split(/\s+/).filter(Boolean).map(t=>commonWords[t]||t);
// One insertion, deletion, substitution, or swapped pair. Never fuzz numbers / sizes.
function minorTypo(a,b){
 if(a===b)return true;
 if(!/^[a-z]{4,}$/.test(a)||!/^[a-z]{4,}$/.test(b)||Math.abs(a.length-b.length)>1)return false;
 if(a.length===b.length){const changed=[];for(let i=0;i<a.length;i++)if(a[i]!==b[i])changed.push(i);return changed.length===1||(changed.length===2&&changed[1]===changed[0]+1&&a[changed[0]]===b[changed[1]]&&a[changed[1]]===b[changed[0]]);}
 const shorter=a.length<b.length?a:b,longer=a.length<b.length?b:a;
 let i=0,j=0,skipped=false;while(i<shorter.length&&j<longer.length){if(shorter[i]===longer[j]){i++;j++;}else{if(skipped)return false;skipped=true;j++;}}return true;
}
const searchIndex=new Map(supplies.map(item=>[item.id,terms(item.name+' '+item.aliases+' '+supplyCategories.find(c=>c.id===item.category).name+' '+item.locations.map(l=>l.name+' '+l.stock).join(' '))]));
export function findSupplies(query='',category=''){
 const tokens=terms(query);
 return supplies.filter(item=>(!category||item.category===category)&&tokens.every(token=>searchIndex.get(item.id).some(word=>word.includes(token)||minorTypo(token,word))));
}

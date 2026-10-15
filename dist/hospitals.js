import {hospitalMap} from './hospital-map.js';
const survey='https://www.academyofmedicine.org/aws/AOMC/asset_manager/get_file/916898?ver=1';
const strokeSources={
 fairfield:'https://www.mercy.com/locations/hospitals/cincinnati/mercy-health-fairfield-hospital',
 trihealth:'https://www.trihealth.com/services/trihealth-neuroscience-care/stroke-center',
 uc:'https://www.uchealth.com/en/neuroscience-institute/comprehensive-stroke-center',
 jewish:'https://www.mercy.com/news-events/news/cincinnati/2025/the-jewish-hospital-mercy-health-has-earned-the-joint-commission-gold-seal-of-approval',
 children:'https://www.cincinnatichildrens.org/service/c/cerebrovascular/locations'
};
// Directory entries are maintained here as codes and Stat Lines become available.
// Blank values intentionally display a placeholder; never substitute a public switchboard number.
export const hospitals=[
 {id:'fairfield',name:'Mercy Fairfield ER',trauma:null,stroke:'primary',strokeSource:strokeSources.fairfield,door:'1234#',room:'',statLine:''},
 {id:'bethesda',name:'Bethesda North ER',trauma:'III',stroke:'tsc',strokeSource:strokeSources.trihealth,door:'',room:'',statLine:''},
 {id:'ucmc',name:'UCMC ER',trauma:'I',stroke:'comprehensive',strokeSource:strokeSources.uc,door:'N/A (they let you in)',room:'#0911*',statLine:''},
 {id:'westchester',name:'UC West Chester ER',trauma:'III',stroke:'primary',strokeSource:strokeSources.uc,door:'',room:'',statLine:''},
 {id:'samaritan',name:'Good Samaritan ER',trauma:null,stroke:'comprehensive',strokeSource:strokeSources.trihealth,door:'',room:'',statLine:''},
 {id:'christ',name:'Christ Hospital ER',trauma:null,stroke:'primary',strokeSource:survey,door:'',room:'',statLine:''},
 {id:'jewish',name:'Mercy Jewish ER',trauma:null,stroke:'comprehensive',strokeSource:strokeSources.jewish,door:'',room:'',statLine:''},
 {id:'childrens-main',name:"Children’s Hospital · Main Campus",pediatric:true,trauma:'I',stroke:'unrated',strokeNote:'Pediatric stroke service · Burnet campus; adult tier not assigned',strokeSource:strokeSources.children,door:'',room:'',statLine:''},
 {id:'childrens-liberty',name:"Children’s Hospital · Liberty Campus",pediatric:true,trauma:null,stroke:'unrated',strokeNote:'No stroke tier listed in regional survey',strokeSource:survey,door:'',room:'',statLine:''}
];
const strokeTypes={comprehensive:['Comprehensive (CSC)','Broadest stroke resources'],tsc:['Thrombectomy-Capable (TSC)','Clot retrieval + primary care'],primary:['Primary (PSC)','Initial stroke treatment'],asrh:['Acute Stroke-Ready (ASRH)','Initial treatment + transfer'],unrated:['Not rated','No tier verified; capability may differ']};
let tab='capabilities';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const link=(url,label)=>`<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>`;
const row=(label,content)=>`<div><dt>${label}</dt><dd>${content}</dd></div>`;
const slot=(label,value)=>row(label,value?esc(value):'<span class="hospital-placeholder">To be added</span>');
const strokeBadge=type=>`<span class="stroke-badge stroke-${type}">${strokeTypes[type][0]}</span>`;
function capability(h){return `<section class="panel hospital-card" data-hospital-card="${h.id}"><h2>${h.name}</h2>${h.pediatric?'<p class="hospital-population">PEDIATRIC</p>':''}<dl>
${row(h.pediatric?'Pediatric trauma center':'Adult trauma center',h.trauma?'Level '+h.trauma:'No level listed')}
${row('Stroke center',strokeBadge(h.stroke)+(h.strokeNote?`<span>${h.strokeNote}</span>`:''))}
${row('Cath lab',!h.pediatric?'24/7 · On site':h.id==='childrens-main'?'Pediatric cath · On site':'Not listed')}
${row('ROSC destination',h.pediatric?(h.id==='childrens-main'?'Pediatric post-arrest care listed':'Definitive post-arrest care not listed'):'Local designation unverified')}
${row('Cardiac Arrest Center certification','<span class="hospital-unverified">Not verified</span>')}
</dl><p class="hospital-card-source">${link(h.strokeSource,'Stroke source')}</p></section>`;}
export function hospitalReference(source,icon){return `<div class="page-heading"><div><span class="eyebrow">QUICK REFERENCE</span><h1 class="hospital-heading">${icon('hospital')} Hospital capabilities</h1></div></div>
<nav class="hospital-tabs" aria-label="Hospital reference sections">${[['capabilities','Capabilities'],['codes','Door & EMS room codes'],['phones','Stat Lines']].map(([id,label])=>`<button class="button ${tab===id?'hospital-active':''}" data-hospital-tab="${id}" aria-pressed="${tab===id}">${label}</button>`).join('')}</nav>
${tab==='capabilities'?`${hospitalMap()}<section class="panel hospital-guidance destination-guide"><div class="destination-heading"><h2>Stroke: who goes where</h2>${source('M414',117)}</div>
<div class="destination-row"><b>LVO screen negative<br><span>or last known well ≥24 hours</span></b><p><strong>Closest certified stroke center.</strong> Bethesda North is appropriate if closest.</p></div>
<div class="destination-row"><b>LVO screen positive<br><span>e.g. C-STAT · last known well &lt;24 hours</span></b><div><p><strong>Mercy Jewish in under 30 minutes? Go to Jewish</strong>—your usual closest Comprehensive center. UC is another option; use whichever CSC is closest from the scene.</p><p><strong>Traffic or out of district?</strong> If no Comprehensive center is under 30 minutes, go to <strong>Bethesda North</strong> if it’s the nearest TSC and within 30 minutes.</p><p class="destination-condition">Good Samaritan is also a Comprehensive option. Don’t miss the thrombolytic window; if the timing criteria aren’t met, use the closest certified stroke center.</p><p>${source('C-STAT & destination flow',117)}</p></div></div>
<div class="destination-row"><b>Suspected stroke under age 16</b><p><strong>Consider preferential transport to Cincinnati Children’s.</strong> Main / Burnet has the listed pediatric stroke service. ${source('M414 pediatric note',118)}</p></div>
<p class="destination-footnote">Stroke alert + pre-notify. Use current availability and department medical direction. Unknown onset: consult medical control.</p></section>
<details class="panel hospital-guidance"><summary><b>Stroke color key</b></summary><ol class="stroke-legend">${Object.entries(strokeTypes).map(([key,[label,note]])=>`<li>${strokeBadge(key)}<span>${note}</span></li>`).join('')}</ol><p>Colors show resource scope, not destination priority. “Not rated” means no tier verified; Children’s Main provides pediatric stroke care outside the adult scale.</p></details>
<details class="panel hospital-guidance"><summary><b>ROSC designation & protocol guidance</b></summary><p>The local ROSC destination card has not been verified. Formal “Cardiac Arrest Center” certification is also unverified for these facilities. Cath availability alone does not establish either designation.</p><p>C307 directs presumed cardiac arrests / post-ROSC STEMI to 24-hour cath facilities. For patients unresponsive and not following commands, confirm temperature-management capability. Follow trauma triage when applicable.</p><div class="protocol-links">${source('Post-ROSC · C307',83)}${source('Destination criteria · C307',84)}${source('Trauma destination · SB206',55)}</div></details>
<div class="hospital-grid">${hospitals.map(capability).join('')}</div><p class="hospital-source">Reviewed October 14, 2026. ${link(survey,'AOM 2025 ED Capabilities Survey')} supplies trauma, cath and pediatric post-arrest listings. Newer hospital stroke sources take precedence: Mercy Jewish is now Comprehensive. No level / capability listed does not mean no emergency care. These are not live availability listings.</p><details class="panel hospital-guidance"><summary>Additional sources</summary><p>${link('https://www.cincinnatichildrens.org/service/e/emergency','Children’s campus emergency services')} · ${link('https://www.cincinnatichildrens.org/service/c/catheterization-intervention/contact','Children’s Main cath service')} · ${link('https://www.jointcommission.org/en-us/certification/stroke','Stroke certification levels')} · ${link('https://www.heart.org/en/professional/quality-improvement/healthcare-certification/cardiac-certification','AHA cardiac certification programs')}</p></details>`:
`<section class="panel hospital-guidance"><h2>${tab==='codes'?'Door & EMS room codes':'Stat Lines'}</h2><p>${tab==='codes'?'Known codes are listed below. Remaining spaces are reserved for future updates.':'One Stat Line per hospital. Spaces are reserved for verified numbers.'}</p></section><div class="hospital-grid">${hospitals.map(h=>`<section class="panel hospital-card"><h2>${h.name}</h2><dl>${tab==='codes'?slot('Door code',h.door)+slot('EMS room code',h.room):slot('Stat Line',h.statLine)}</dl></section>`).join('')}</div>`}`;}
export function bindHospitals(render){document.addEventListener('click',e=>{const button=e.target.closest('[data-hospital-tab]');if(button){tab=button.dataset.hospitalTab;render();}});}

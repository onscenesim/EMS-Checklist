// M408, printed page 102: adult RASS +4 IM dosing at department stock 50 mg/mL.
// Preserve printed height bands; 4′11″ has no assigned row in the source chart.
import {number} from './calculations.js';
export const ketamineAgitationHeights=[
 {height:'<4′11″',label:'Under 4′11″',dose:150,volume:3,split:false},
 {height:'5′–5′5″',label:'5′0″–5′5″',dose:220,volume:4.4,split:true},
 {height:'5′6″–5′11″',label:'5′6″–5′11″',dose:290,volume:5.8,split:true},
 {height:'6′–6′5″',label:'6′0″–6′5″',dose:365,volume:7.3,split:true},
 {height:'>6′5″',label:'Over 6′5″',dose:425,volume:8.5,split:true}
];
export function ketamineHeightChart(fields,source){
 const age=number(fields['ref-age']);
 if(age!==null&&Number.isFinite(age)&&age<16)return `<div class="ketamine-height-age">This adult agitation chart does not apply to the entered age. ${source('PEDIATRIC RESTRAINT · P616',174)}</div>`;
 return `<div class="ketamine-height-guide"><div class="ketamine-height-heading"><b>Match height → read IM dose</b><span>50 mg/mL · IM once</span></div><table class="ketamine-height-table"><caption>Adult · age 16+ · RASS +4 agitation</caption><thead><tr><th scope="col">HEIGHT</th><th scope="col">IM DOSE</th><th scope="col">DRAW <small>50 mg/mL</small></th></tr></thead><tbody>${ketamineAgitationHeights.map(r=>`<tr><th scope="row">${r.label.includes('–')?r.label.split('–').map((part,i)=>`<span>${i?'to ':''}${part}</span>`).join(''):r.label.replace(/^(Under|Over) (.*)$/,'<small>$1</small><span>$2</span>')}</th><td><b>${r.dose}<small>mg</small></b></td><td class="ketamine-height-volume"><b>${r.volume}<small>mL</small></b>${r.split?'<span class="ketamine-split">MULTIPLE IM SITES*</span>':''}</td></tr>`).join('')}</tbody></table><p class="ketamine-height-split"><b>*Ideally give in more than one IM site.</b> Volumes shown are the total draw.</p><p class="ketamine-height-gap">4′11″: no printed chart row; confirm dose with medical control.</p><div class="ketamine-height-source">${source('HEIGHT CHART · M408',102)}</div></div>`;
}

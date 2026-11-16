import {pediatricSyringe} from './syringe.js';
export function neonatalEpinephrine(source){return `<div class="neonatal-epi" aria-label="P600 newborn epinephrine IV or IO">
 <div class="neonatal-epi-trigger"><b>HR &lt;60 after 60 sec of compressions + adequate ventilation</b><span>→ Give epinephrine via IV or IO</span></div>
 <div class="neonatal-epi-route"><strong>Epinephrine · IV / IO</strong><b>0.1 mg/mL · 1 mg / 10 mL syringe</b><span class="neonatal-epi-draw">Draw from code epi into a <b>1 mL syringe</b> with <b>0.01 mL markings</b>.</span></div>
 <div class="neonatal-epi-doses"><div data-neonatal-dose="term"><b>TERM</b><strong>0.3 <span>mL</span></strong><span>0.03 mg</span>${pediatricSyringe(.3)}</div><div data-neonatal-dose="preterm"><b>PRETERM</b><strong>0.2 <span>mL</span></strong><span>0.02 mg</span>${pediatricSyringe(.2)}</div></div>
 <div class="neonatal-epi-repeat"><b>Repeat every 3–5 min while HR &lt;60.</b><span>If IV access is unavailable, P600 allows distal femoral IO.</span></div>
 <div class="neonatal-epi-sources">${source('P600',170)}${source('APPENDIX I',262)}</div>
 </div>`;}

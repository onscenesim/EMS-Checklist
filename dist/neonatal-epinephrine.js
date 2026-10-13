// P600 (p151) and Appendix I (p236) both print 0.4 mL term / 0.2 mL preterm
// from 0.1 mg/mL IV/IO stock. The preterm mass below is derived from that volume.
// Their ETT instructions conflict internally and with each other; do not infer
// an ETT recipe or reuse the pediatric arrest calculator for newborn dosing.
export function neonatalEpinephrine(source){return `<div class="neonatal-epi" aria-label="P600 newborn epinephrine IV or IO">
 <div class="neonatal-epi-trigger"><b>HR &lt;60 after 30 sec CPR + effective BVM</b><span>→ Consider epinephrine</span></div>
 <div class="neonatal-epi-route"><strong>Epinephrine · IV / IO</strong><b>0.1 mg/mL · 1 mg / 10 mL syringe</b><span class="neonatal-epi-draw">Draw from code epi into a <b>1 mL syringe</b> with <b>0.01 mL markings</b>.</span></div>
 <div class="neonatal-epi-doses"><div data-neonatal-dose="term"><b>TERM</b><strong>0.4 <span>mL</span></strong><span>0.04 mg</span></div><div data-neonatal-dose="preterm"><b>PRETERM</b><strong>0.2 <span>mL</span></strong><span>0.02 mg</span></div></div>
 <div class="neonatal-epi-repeat"><b>Repeat every 3–5 min while HR &lt;60.</b><span>No IV / IO → request medical-control ETT order.</span></div>
 <div class="neonatal-epi-sources">${source('P600',151)}${source('APPENDIX I',236)}</div>
 </div>`;}

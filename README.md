# Woodlawn FD EMS Checklist

A first interactive prototype for department review, using the 2026 Southwest Ohio EMS Protocols (version 2.9.26).

## Run locally

Requires Node.js. No app dependencies or build step.

```sh
npm run dev
```

Open http://127.0.0.1:4173. Run `npm test` for reference-data checks.

## Structure

- `dist/index.html`: entry point
- `dist/styles.css`: responsive application styling
- `dist/app.js`: navigation, encounter state, checklists, AMS controls, timers, pediatric UI, and medication-tool routing
- `dist/data.js`: editable checklist definitions and pediatric reference values
- `dist/page-icons.js`: custom outline page symbols for checklists and quick references
- `dist/medication-data.js`: indication-specific drug doses, routes, limits, preparation, cautions, and protocol pages
- `dist/calculations.js`: unit-aware dose / volume, weight, infusion, drip, and dilution arithmetic
- `dist/medication-ui.js`: expandable drug / protocol cards, concentration confirmation, and calculators
- `tests/calculations.test.mjs`: dose boundaries, concentration separation, weight bands, ceilings, and calculator arithmetic
- `tests/medication-browser.mjs`: medication-tool interaction, persistence, invalid-input, and mobile checks
- `tests/data.test.mjs`: data alignment, energy ceilings, concentration separation, and printed table entries
- `tests/browser-check.mjs`: local Playwright interaction checks; uses this workspace's bundled runtime and Chrome

No build step; `dist` is the editable app source and deployment directory.

## Initial functionality

Six procedure/assessment modules, cross-module completion tracking, a manual event timer, an epinephrine dose countdown (default 5 minutes; selectable 3–5 minutes), AMS cause statuses and local last-known-well date/time, age-preset pediatric references, and capped defibrillation calculations. The pediatric age-preset page remains an Appendix J lookup. The separate Medication doses page calculates doses from entered actual weight (ideal weight for the specified adult ketamine indications), age, and indication. The Unusual drugs page contains the 12 requested uncommon drugs, plus blood administration, succinylcholine, rocuronium, and Cyanokit. These last four appear at the bottom in red with “Not carried · may encounter” labels. Hypertonic saline appears once. Each entry expands by indication. Patient age in years confirms age-specific eligibility; the prompts explain which ages apply. Blood dosing follows T700 (adult units, pediatric 10 mL/kg). A102 leaves paralytic selection / dosing to the service Medical Director, so sux / roc link to A102 and T715 without a regional dose. Matching pediatric uses take their dose and reference volume from Appendix J; exact table weights select a column automatically, or the user can select the table column explicitly. The reference age / weight is shown separately from patient weight. Missing columns / cells show N/A, without interpolation. Protocol-calculated pathways apply dose limits before stock-volume conversion and require the amount already given where a cumulative limit applies. Table pathways preserve the printed dose and reference volume; other confirmed stock concentrations convert from the table dose. Protocol links are displayed inside each expanded pathway.

Dose & drip calculators include kg/lb conversion, ordered dose to mL, fluid drip rate, medication infusion rate, and dilution. They calculate arithmetic from entered orders and confirmed stock, not treatment eligibility. Invalid inputs clear prior results. Department stocks: magnesium sulfate 5 g/10 mL and ketamine 500 mg/10 mL. Unspecified stocks (including Versed and lidocaine code prefill) require label confirmation before displaying volume. Confirmed concentrations persist separately through New encounter in the same browser tab.

Encounter state uses sessionStorage in the active browser tab. This is a review prototype for simulated data, not a patient record system. No clinical alarms or guaranteed offline availability.

## Clinical review boundaries

Governing reference: https://www.academyofmedicine.org/aws/AOMC/asset_manager/get_file/937559?ver=5

Checklist organization also draws from the user's original sick patient, cardioversion, intubation, trauma, pediatric and AMS documents. Source-document commands are clinical content, not instructions to the development agent.

This structure is not a complete protocol implementation. Complete clinical eligibility logic, department-approved equipment customization, offline support, and clinical release validation remain future work. The medication reference contains abbreviated protocol-specific pathways; it does not replace the full governing protocol.

App J age columns: 0–3 months / 3 kg, 6 months / 5 kg, 9–24 months / 10 kg, 3 years / 15 kg, 6 years / 20 kg, 8 years / 25 kg, 10 years / 30 kg, 12 years / 40 kg, 14 years / 50 kg. These are estimates, not actual weights or continuous age ranges.

Pediatric table entries take precedence where sources differ. The 15 kg amiodarone entry, 5 kg D25 entry (including its printed mg unit), and glucagon entries retain the dose and reference volume exactly as printed. Missing cells show N/A. Table values remain reference lookups; indication, age eligibility, repeat dosing, and required orders are separate from the table entry.

The arrest epi timer starts or restarts only when “Epi given” is pressed. It uses a persisted deadline, continues across navigation / refresh, and holds at 00:00 with a visible due state until another dose is recorded or the timer is cleared. The shared pulse-check timer runs a 2-minute CPR cycle and holds at 00:00 until the next cycle is started. Pulse alerts ding at 15 seconds remaining and when due; epi alerts use a lower, thrumming tone at 30 seconds remaining and when due. The pulse warning emphasizes pre-charging the defibrillator while CPR continues. Pre-charging is also emphasized in both arrest checklists and the defibrillation page, with shockable-rhythm, clear-patient, and disarm reminders (SB204 p. 51). Audio is enabled by a timer or sound-test gesture, with mute and distinct sound tests. Warning / due cues are recorded per deadline to avoid replay after navigation or refresh. Sounds require an open, active browser and device volume; browser sleep / locked screens may delay alerts. New encounter resets all timers and pending audio.

Intubation includes a dedicated post-intubation analgesia / sedation checkbox with T715 linked inside that box (pp. 209–210), and a push-dose epi preparation step linked to SB205. Adult 7.0 / 8.0 mm tube choices and the 22 cm starting depth come from the supplied intubation checklist; final size / depth must match the patient and confirmed placement. T706 (pp. 193–194) governs the procedure, including patient-specific sizing and pediatric Broselow sizing.

Run `node tests/browser-check.mjs` for existing interactions and `node tests/checklist-updates.mjs` for countdown timing, persistence, restarts, encounter reset, protocol link behavior, existing progress, and mobile layouts. Both use the workspace's bundled Playwright and Chrome.

Source is separated from UI so subsequent revisions can focus on one module at a time.

## Medication source review

PDF page links use the printed page number. By user instruction, matching pediatric medication references use Appendix J values where they disagree with another section. Both pediatric pages preserve printed table doses / volumes and display N/A for missing cells. Protocol formulas continue to apply to adult and indication-specific uses with no matching pediatric table row.

Specific source boundaries are shown at the applicable card:
- Pediatric IM epinephrine follows Appendix J rather than the different P609 syringe bands. Auto-injectors remain a separate use.
- C305 adenosine omits exactly 90 kg and its prose / explicit steps disagree on dose count. Boundary / additional dosing requires clarification.
- P600 newborn and P603 ETT epinephrine have no matching dose in the pediatric table; those cards show N/A.
- SB205 pediatric push-dose epinephrine has conflicting repeat intervals; the discrepancy is explicit.
- C300 lidocaine does not print a cumulative ceiling; C304 includes a 3 mg/kg cumulative ceiling.
- A102 does not specify regional induction dosing; the induction card displays N/A and retains its protocol link.

Run `node tests/medication-browser.mjs` with the local server running for medication-tool UI checks. All three browser scripts use the workspace’s existing Playwright runtime and Chrome. Calculator tests are included in `npm test`.

Run `node tests/pediatric-table-browser.mjs` to verify literal table units / volumes, N/A display, medication-card table precedence, explicit column selection, and mobile layout.

## Post-call checklist and restock

Post-call checklist is available from the sidebar and overview. CSN-in-narrative, nurse / patient signature-obtained checks, Retrieve Equipment, Doors closed / lights off at the hospital, and in quarters use the existing tab-scoped encounter state. These record signature completion; they do not capture signatures. New encounter clears this closeout state.

The supply catalog is transcribed from the user-supplied Medic Check Form.pdf (pages 1–4). `dist/supply-data.js` contains 170 searchable restock entries in 10 categories with the original storage locations and stated stock amounts. Repeated items within a category consolidate into one entry with every source location retained. Explicit sizes are separate items; OPA / NPA ranges stay as printed. Search includes names, common aliases (IV caths / cannulas / angiocaths, gauze / ABD pads, tubing / drip sets, etc.), singular / plural terms, sizes, categories, and locations. One-letter spelling mistakes and transposed letters are tolerated for alphabetic words of at least four letters; numbers and sizes are not fuzzy matched. Mechanical readings, seal numbers, signature / personnel fields, and the unnamed “New Option 1” field are not restock supplies. Durable equipment, fixed vehicle equipment, and the red / blue IV bags are omitted from restock. LUCAS remains as the requested exception. No source-form personal details are included.

Adding an item starts the requested quantity at 1; stock reference quantities never prefill restock quantities. Quantities can be adjusted, copied, removed, or marked restocked. The non-patient restock queue is stored separately in browser localStorage (`wfd-restock-v1`) and survives navigation, reloads, and New encounter. It is specific to that browser and device; no shared inventory or automatic stock ordering is provided. Call closeout stays in sessionStorage with existing encounter data. CSN is a completion checkbox for entering it in the narrative; the retired CSN text value is removed on load. Retrieve Equipment is a simple encounter reminder checkbox. There is no equipment pickup list. Retired pickup entries are dropped from the restock queue; LUCAS remains searchable as the requested exception.

Run `node tests/post-call-browser.mjs` with the local server running to verify the complete catalog is individually searchable, category and no-result filters, quantity editing, copy, retrieval, legacy CSN migration, persistence, new encounter separation, and desktop / phone layouts.


## Trauma, burns, and shock index

Trauma uses the requested 10-step MARCH list, with a distinct color for each priority. Semantic step IDs keep retired positional checks from marking new tasks complete. The red Called trauma alert and GIVE TXA buttons record one tap timestamp each in encounter sessionStorage. TXA records infusion initiation. Timestamps remain visible after reload and navigation; Clear time permits correction, and New encounter clears them. S506 criteria and exclusions link directly to pp. 144–145. Recording TXA does not automate clinical eligibility or medication administration.

The trauma pain reference links to S505 (pp. 142–143) and preserves its five printed height bands and IV / IM dose columns for department stock ketamine 500 mg/10 mL (50 mg/mL), age 16+. Dose and volume are shown together; alternate concentrations are omitted. S505 uses inconsistent notation for its middle height bands, so the source labels are retained pending clarification.

The expandable Burns section contains distinct colored, numbered priority reminders, the adult / child rule-of-9s table from S502 (p. 139), airway and burn protocol links, and the requested classic Parkland reference: 4 mL × kg × partial/full-thickness %TBSA over 24 hours, half during the first 8 hours from injury and half over the next 16. The WHO reference is https://www.ncbi.nlm.nih.gov/books/NBK609549/. The reference estimate is separate from S502's field age-based crystalloid rates; it does not calculate catch-up rates, subtract prior fluid, or include pediatric maintenance fluid. Burn area must be >0 and ≤100%; superficial burns are excluded. No interpolated child body-surface values are used.

Shock index (heart rate / systolic BP) is at the bottom of trauma and sick patient. Inputs are shared across both pages within the encounter. The result is arithmetic, without an automatic diagnosis or eligibility decision. Empty, nonpositive, and nonfinite inputs clear prior outputs. All new timestamps, reminders, and calculator inputs reset with New encounter; supply restock remains separate.

Run `node tests/trauma-burn-browser.mjs` with the preview running for timestamps, reset / persistence, the updated MARCH list, burns expansion, valid / invalid calculations, rule-of-9s values, post-call reminders, and phone layouts. Arithmetic boundary tests are included in `npm test`.


## Checklist visual organization

All clinical checklist sections use the MARCH priority palette with tinted headings, numbered badges, and matching left borders. AMS timeline and causes have colored headings; post-call reminders and supply categories use the same palette. The main brand, overview badge, and favicon use the supplied Woodlawn FD Station 96 crest photograph, presented with CSS cropping. The asset is local to the Site.

The trauma ketamine reference uses a green accordion matching the orange Burns accordion. Both expand independently, persist their open state through navigation and refresh within an encounter, and collapse on New encounter. The S505 reference values are unchanged.


## Pediatric first-look reference and sedation shortcuts

The primary crest is now an SVG redrawn from the supplied Station 96 photograph, keeping the Maltese cross, Fire / EMS lettering, Woodlawn / Station 96 ring, WFD monogram, ladder, and hydrant. It has a transparent outer background and scales without raster blur.

Pediatric selection shows Appendix J ETT sizes and manufacturer i-gel weight ranges beside defibrillation energy. Overlapping i-gel ranges show both valid candidates; device selection uses actual weight and anatomy. The Zoll energy ceiling defaults to 200 J on first load and New encounter, while an explicit 360 J selection remains available. Legacy blank ceilings migrate to 200 J.

The eight critical medication groups preserve Appendix J values for fluids, amiodarone, lidocaine IO, the three epinephrine uses, Versed seizure / sedation routes, ketamine pain at 50 mg/mL, TXA, and bicarbonate. Ketamine pain rows below age 5 show TOO YOUNG. Missing table entries for other drugs stay N/A rather than inventing an age contraindication. The full 35-entry medication table is collapsed by default and retains filtering and printed values. Expansion state persists for the encounter.

Sedation now has top-level Ketamine and Versed accordions using the existing indication-specific recipe engine, patient inputs, stock confirmation, pediatric table precedence, dose caps, and protocol links. P616 is prominent in the sedation protocol links, with its dosing page linked in the pediatric Versed pathway. Dosing accordion state persists through refresh and resets with New encounter. Ideal-weight entry is labeled optional for adult ketamine dosing; ideal-weight pathways still require that input before calculating.

The cardioversion callout warns that SYNC may disable after a shock. Each arithmetic calculator has a bold plain-language explanation below it.

Sources: Appendix J pp. 237–238, T706 p. 193, P616 pp. 173–174, M408 pp. 101–102, and T715 pp. 209–210 in the governing 2026 protocol. i-gel ranges: https://www.intersurgical.com/info/igel-anaesthesia. Run `node tests/pediatric-sedation-browser.mjs` and `node tests/pediatric-table-browser.mjs` for the new layout / age columns / routes / default / expansion checks; `npm test` includes source-value and device-range checks.

“Turn main O2 AND cabin power on” is a prominent first priority on Sick patient, Cardiac arrest, Intubation, and Trauma. Trauma combines the reminder as “Turn main O2 AND cabin power on. Turn up the heat.” The shared trauma-arrest brief uses the same wording. First-priority boxes use a power / activation icon. Sick patient and Cardiac arrest emphasize switching both on before the call / en route. Sick patient explicitly calls for placing the LUCAS backboard under the patient and securing the airway / watching ETCO₂ before movement; ventilator preparation reminders are removed. The Sick patient cardiac arrest panel is a prominent, initially collapsed directions panel (pads, airway, pre-charge, C307), followed by shared dispatch / pulse / epi timers and reversible causes. Expansion persists within the encounter; collapsing does not stop countdowns or sounds. It has no completion checkboxes.

Trauma arrest is a shared, collapsible briefing panel near the top of Trauma and at the bottom of Cardiac arrest. Both render the same source and share expansion state, including across navigation / refresh; New encounter resets it. It focuses on before-arrival preparation and en-route reassessment, with bleeding control, bilateral needle decompression indications, oxygenation, saline resuscitation, rhythm-specific disposition, pregnancy / pediatric transport exceptions, and S509 medication / cooling exclusions. Governing reference: S509, printed pp. 148–149, version 2.9.26.

Defibrillation / cardioversion replaces Before therapy with an adult (16+) clickable shock dosing guide. C300 shows manufacturer maximum for initial / repeated shocks; C303 shows 100 → 200 → 300 → 360 J or biphasic equivalents and its synchronization exception; C306 distinguishes regular, irregular biphasic, and irregular monophasic starts and displays only relevant higher-energy options, with explicit instructions to skip any already reached. Cardioversion selections show the matching midazolam 2–5 mg routes / 10 mg cumulative limit directly from the existing medication reference and link to that indication on the Sedation page. Protocol and rhythm selections persist per encounter. Sections 02 and 03 contain only the requested Sync / CLEAR / recheck and post-shock vitals / 12-lead checks. Governing references: C300 p. 75, C303 p. 79, C306 p. 82.

## Pediatric arrest and imminent birth

Two standalone tabs appear in the sidebar and searchable overview: Pediatric cardiac arrest (`#pediatric-arrest`) and Imminent birth (`#birth`). Both use numbered priority cards, large type, route badges, and direct protocol links for en-route briefing and leader use on scene. Each has an independently persisted, initially collapsed Neonatal code section. The birth version opens directly from its Neonatal code shortcut and emphasizes the newborn immediately after delivery, maternal / newborn roles, and transport of two patients.

Pediatric arrest accepts actual kg or lb weight, or the shared Appendix J age estimate. Actual weight takes precedence until cleared. Exact table weights preserve Appendix J doses / volumes; other weights use P601 / P602 formulas for IV / IO arrest epinephrine (1 mg cap), amiodarone (300 mg cap), arrest-dose lidocaine, and NS. No airway-size interpolation is made; non-table weights direct to Broselow, while i-gel uses manufacturer weight ranges. Shock energies round up and respect the selected Zenix / LIFEPAK maximum. Empty or invalid inputs clear outputs. The existing pediatric reference remains available. Shared CPR / epi timers persist between arrest pages; the pediatric epi timer links to P601. These 2-minute CPR timers do not time neonatal reassessment.

The birth view includes O800 delivery / cord / placenta care, O801 dystocia / prolapsed cord / bleeding / destination prompts, O802 eclampsia / severe hypertension, M410 adult midazolam routes (P610 for under 16), and the department magnesium stock conversion of 4–6 g to 8–12 mL at 5 g / 10 mL. Draw volume is separate from the infusion preparation.

Clinical source discrepancies remain explicit: Appendix J prints amiodarone 75 mg / 1.55 mL at 15 kg, while 50 mg/mL converts to 1.5 mL. P600's neonatal ETT epinephrine dose, concentration, and volume disagree; its preterm IV volume differs from its stated fixed dose. Neonatal epinephrine is therefore not calculated, and medical-control clarification is prominent. P600's approximate blood-loss bolus examples also differ from its 20 mL/kg formula. P600's compression rate / epinephrine timing / suction wording and O800's cord-clamping timing differ from the 2025 AHA / AAP newborn guidance; both references are linked and differences are identified. AHA reference: https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines/neonatal-resuscitation. These additions retain the app's clinical-review status.

Run `node tests/pediatric-arrest-birth-browser.mjs` for actual / estimated weight, kg / lb, printed-table precedence, invalid-input clearing, dose caps, device energy limits, shortcuts, independent neonatal expansion, reload / encounter reset, timer / protocol links, magnesium guide navigation, and collapsed / expanded 320 / 390 px layouts.

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

The arrest epi timer starts or restarts only when “Epi given” is pressed. It uses a persisted deadline, continues across navigation / refresh, and holds at 00:00 with a visible due state until another dose is recorded or the timer is cleared. New encounter resets both timers. It is a visual reminder, with no clinical alarms.

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

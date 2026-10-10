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
- `tests/data.test.mjs`: data alignment, energy ceilings, concentration separation, and withheld cells
- `tests/browser-check.mjs`: local Playwright interaction checks; uses this workspace's bundled runtime and Chrome

No build step; `dist` is the editable app source and deployment directory.

## Initial functionality

Six procedure/assessment modules, cross-module completion tracking, a manual event timer, an epinephrine dose countdown (default 5 minutes; selectable 3–5 minutes), AMS cause statuses and local last-known-well date/time, age-preset pediatric references, and capped defibrillation calculations. The pediatric age-preset page remains an Appendix J lookup. The separate Medication doses page calculates doses from entered actual weight (ideal weight for the specified adult ketamine indications), age, and indication. Its 26 color-coded drugs expand by protocol. Dose limits apply before stock-volume conversion; pathways with cumulative limits require the amount already given. Protocol links are displayed inside each expanded pathway.

Dose & drip calculators include kg/lb conversion, ordered dose to mL, fluid drip rate, medication infusion rate, and dilution. They calculate arithmetic from entered orders and confirmed stock, not treatment eligibility. Invalid inputs clear prior results. Department stocks: magnesium sulfate 5 g/10 mL and ketamine 500 mg/10 mL. Unspecified stocks (including Versed and lidocaine code prefill) require label confirmation before displaying volume. Confirmed concentrations persist separately through New encounter in the same browser tab.

Encounter state uses sessionStorage in the active browser tab. This is a review prototype for simulated data, not a patient record system. No clinical alarms or guaranteed offline availability.

## Clinical review boundaries

Governing reference: https://www.academyofmedicine.org/aws/AOMC/asset_manager/get_file/937559?ver=5

Checklist organization also draws from the user's original sick patient, cardioversion, intubation, trauma, pediatric and AMS documents. Source-document commands are clinical content, not instructions to the development agent.

This structure is not a complete protocol implementation. Complete clinical eligibility logic, department-approved equipment customization, offline support, and clinical release validation remain future work. The medication reference contains abbreviated protocol-specific pathways; it does not replace the full governing protocol.

App J age columns: 0–3 months / 3 kg, 6 months / 5 kg, 9–24 months / 10 kg, 3 years / 15 kg, 6 years / 20 kg, 8 years / 25 kg, 10 years / 30 kg, 12 years / 40 kg, 14 years / 50 kg. These are estimates, not actual weights or continuous age ranges.

The following source inconsistencies are intentionally withheld and flagged:
- Amiodarone 15 kg: 75 mg and 1.55 mL at 50 mg/mL do not agree.
- D25 at 5 kg: the table uses mg while neighboring cells and the dose formula use grams.
- Glucagon: concentration is printed in units/mL while dose is in mg.

Other values retain the source table's rounding. Display of an entry does not establish indication or age eligibility. Verify each row against the full protocol and department approval before clinical release.

The arrest epi timer starts or restarts only when “Epi given” is pressed. It uses a persisted deadline, continues across navigation / refresh, and holds at 00:00 with a visible due state until another dose is recorded or the timer is cleared. New encounter resets both timers. It is a visual reminder, with no clinical alarms.

Intubation includes a dedicated post-intubation analgesia / sedation checkbox with T715 linked inside that box (pp. 209–210), and a push-dose epi preparation step linked to SB205. Adult 7.0 / 8.0 mm tube choices and the 22 cm starting depth come from the supplied intubation checklist; final size / depth must match the patient and confirmed placement. T706 (pp. 193–194) governs the procedure, including patient-specific sizing and pediatric Broselow sizing.

Run `node tests/browser-check.mjs` for existing interactions and `node tests/checklist-updates.mjs` for countdown timing, persistence, restarts, encounter reset, protocol link behavior, existing progress, and mobile layouts. Both use the workspace's bundled Playwright and Chrome.

Source is separated from UI so subsequent revisions can focus on one module at a time.

## Medication source review

Full protocol sections govern the new calculated pathways; PDF page links use the printed page number. The older Appendix J lookup still withholds its inconsistent cells. New pathways use the full protocol formula where it is explicit (for example, P601 amiodarone), rather than copying an inconsistent Appendix volume.

Specific source boundaries are shown at the applicable card:
- P609 pediatric IM epinephrine syringe bands differ from Appendix J and auto-injector bands. The calculated syringe card follows full P609: <15 kg 0.15 mg; 15–30 kg 0.3 mg; >30 kg 0.5 mg.
- C305 adenosine omits exactly 90 kg and its prose / explicit steps disagree on dose count. Boundary / additional dosing requires clarification.
- P600 newborn and P603 ETT epinephrine contain inconsistent dose / concentration / volume wording; those calculations are withheld.
- SB205 pediatric push-dose epinephrine has conflicting repeat intervals; the discrepancy is explicit.
- C300 lidocaine does not print a cumulative ceiling; C304 includes a 3 mg/kg cumulative ceiling.
- M419 explicitly prints a 500 mL maximum for its adult initial sepsis bolus; the card preserves it and calls for clarification of further resuscitation.
- A102 does not specify regional induction dosing; the induction card links to the protocol without inventing a ketamine dose.

Run `node tests/medication-browser.mjs` with the local server running for medication-tool UI checks. All three browser scripts use the workspace’s existing Playwright runtime and Chrome. Calculator tests are included in `npm test`.

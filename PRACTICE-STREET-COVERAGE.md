# Practice street coverage

Checked November 19, 2026.

The picker now covers **113 named streets** in the saved driving network (67 Woodlawn street entries and 51 Lincoln Heights entries; shared streets count once in a Both districts rotation). All 118 district/street combinations have a numbered address or a labeled street practice point.

Added **1,093 numbered addresses** from [CAGIS Countywide Addresses](https://services.arcgis.com/JyZag7oO4NteHGiq/ArcGIS/rest/services/Open_Data_Feature_Collection/FeatureServer/32), producing 2,704 numbered addresses in total. The county layer reports its address-data update as July 22, 2026. Only active, nondeleted address points in Woodlawn or Lincoln Heights were downloaded. Imported numbers must match a named driving street within 250 meters, remain in the district, and support travel both ways with the rail crossing closed.

The picker randomly orders streets before choosing an address within the selected street. Address and hospital practice share coverage counts. Counts persist across visits in the same browser and reset when the road network changes. Immediate street repeats are avoided at cycle boundaries when alternatives exist. Switching district filters keeps shared progress. Failed trip creation does not consume a street.

## Streets using practice points (26)

These points are placed on reachable road segments inside the district. Assignments explicitly say “street practice point”; no house number is invented.

| District | Mapped street |
|---|---|
| Lincoln Heights | Carey Street |
| Lincoln Heights | Carey Walk |
| Lincoln Heights | Catherine Avenue |
| Lincoln Heights | Hunter Court |
| Lincoln Heights | Magee Avenue |
| Lincoln Heights | McIntyre Street |
| Lincoln Heights | Medosh Street |
| Lincoln Heights | North Leggett Court |
| Lincoln Heights | North Wayne Avenue |
| Lincoln Heights | Shivers Court |
| Lincoln Heights | Smith Court |
| Lincoln Heights | South Leggett Court |
| Lincoln Heights | Techview Place |
| Lincoln Heights | Vision Way |
| Lincoln Heights | Wayne Court |
| Woodlawn | Bellbrook Lane |
| Woodlawn | Congress Avenue |
| Woodlawn | Fieldstone Drive |
| Woodlawn | Grueninger Way |
| Woodlawn | Jones Alley |
| Woodlawn | Magee Street |
| Woodlawn | McLean Avenue |
| Woodlawn | Oak Road |
| Woodlawn | Oak Street |
| Woodlawn | Timerview Court |
| Woodlawn | Woodstock Drive |

## Source differences kept for review

The county Shivers/Hunter labels conflict with the department’s saved east-to-west correction. The saved correction is preserved; both courts use street practice points. Able and Love have usable county addresses.

Several county street names differ from the saved road names or lack a matching road in this graph. These records are excluded rather than attaching a number to a different named street:

- Lincoln Heights: MEDOSH AV — 36 source records.
- Lincoln Heights: VILLAS CIR — 42 source records.
- Woodlawn: WOODSTOCK RD — 34 source records.
- Woodlawn: MCLEAN ST — 21 source records.
- Lincoln Heights: MAGEE CT — 5 source records.
- Woodlawn: JONES AV — 1 source records.
- Woodlawn: TIMBERVIEW CT — 9 source records.
- Woodlawn: BROWN AV — 1 source records.
- Lincoln Heights: I-75 SB EXWY — 3 source records.

The source differences include possible suffix/spelling changes such as McLean Street versus mapped McLean Avenue, Woodstock Road versus mapped Woodstock Drive, and Timberview Court versus mapped Timerview Court. They remain unconfirmed locally. This coverage audit applies to the saved named driving network; it does not claim to include every actual street, private road, or address in the municipalities.

## Refresh and validation

Run `node scripts/fetch-practice-addresses.mjs` to refresh the public source snapshot, then `node scripts/update-practice-addresses.mjs` to enrich the current graph. Full network builds also apply the snapshot. A JSON audit is included as `addressCoverage` in `dist/practice-network.json`.

Run `npm test`. With the local server running, `node tests/district-practice-browser.mjs` checks rotation, reload persistence, fallback dispatch/pins, hospital origins, and mobile layouts.

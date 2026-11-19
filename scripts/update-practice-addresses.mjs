// Enrich an existing graph without rebuilding or undoing saved local corrections.
import {readFile,writeFile} from 'node:fs/promises';
import {addPracticeAddresses} from './practice-address-coverage.mjs';
const path=new URL('../dist/practice-network.json',import.meta.url);
const data=JSON.parse(await readFile(path));
const supplement=JSON.parse(await readFile(new URL('./data/practice-addresses.json',import.meta.url)));
addPracticeAddresses(data,supplement);
await writeFile(path,JSON.stringify(data));
console.log(JSON.stringify(data.addressCoverage,null,2));

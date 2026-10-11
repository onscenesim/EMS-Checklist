import test from 'node:test';
import assert from 'node:assert/strict';
import {dispatchSeconds} from '../dist/arrest-tools.js';
test('dispatch timer starts at 30 minutes and is bounded at zero',()=>{
 const at=1_800_000_000_000,fields={'arrest-dispatch-at':at};
 assert.equal(dispatchSeconds({},at),1800);
 assert.equal(dispatchSeconds(fields,at),1800);
 assert.equal(dispatchSeconds(fields,at+61_000),1739);
 assert.equal(dispatchSeconds(fields,at+1_800_000),0);
 assert.equal(dispatchSeconds(fields,at+3_600_000),0);
 assert.equal(dispatchSeconds(fields,at-10_000),1800);
 for(const invalid of [null,'bad',-1,Infinity])assert.equal(dispatchSeconds({'arrest-dispatch-at':invalid},at),1800);
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shockIndex,parkland,ruleOfNines} from '../dist/clinical-tools.js';
test('shock index handles positive inputs, zero / missing pressures, and nonfinite results',()=>{
 assert.equal(shockIndex('120','100'),1.2);assert.equal(shockIndex(80,120),2/3);
 for(const [hr,sbp] of [['',100],[100,''],[0,100],[100,0],[-10,100],[100,-1],['NaN',100],[Infinity,100],[1e308,1e-308]])assert.equal(shockIndex(hr,sbp),null);
});
test('classic Parkland uses kg and percent, preserves decimals, and rejects invalid burn area',()=>{
 assert.deepEqual(parkland(70,'kg',20),{kg:70,total:5600,first8:2800,next16:2800});
 assert.ok(Math.abs(parkland(154.3235835294143,'lb',20).total-5600)<.001);
 assert.equal(parkland(70,'kg',2.5).total,700);assert.equal(parkland(70,'kg',100).total,28000);
 for(const args of [[70,'kg',0],[70,'kg',101],[70,'kg',''],[0,'kg',20],['','kg',20],[70,'oz',20],[Infinity,'kg',20],[70,'kg',Infinity],[1e308,'kg',100]])assert.equal(parkland(...args),null);
});
test('rule-of-9s retains S502 child percentages without inventing the unlisted cell',()=>{
 assert.equal(ruleOfNines.find(r=>r[0]==='Each leg')[2],14);
 assert.equal(ruleOfNines.find(r=>r[0]==='Genitals / perineum')[2],null);
 assert.equal(ruleOfNines.reduce((n,[region,adult])=>n+adult*(region.startsWith('Each ')?2:1),0),100);
});

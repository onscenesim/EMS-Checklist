import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shockIndex,parkland,ruleOfNines,ketaminePainTable} from '../dist/clinical-tools.js';
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

test('S505 pain chart preserves height bands and IV / IM doses at carried 50 mg/mL',()=>{
 assert.deepEqual(ketaminePainTable.map(r=>[r.height,r.ivMg,r.ivMl,r.imMg,r.imMl]),[
  ['<4′11″',7.5,.15,30,.6],['5′–5.5″',10,.2,40,.8],['5.5′–5′11″',15,.3,60,1.2],['6′–6′5″',17.5,.35,70,1.4],['>6′5″',20,.4,80,1.6]
 ]);
 for(const r of ketaminePainTable){assert.equal(r.ivMg/50,r.ivMl);assert.equal(r.imMg/50,r.imMl);}
});

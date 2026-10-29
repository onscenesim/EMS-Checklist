import test from 'node:test';
import assert from 'node:assert/strict';
import {landmarkBuildings,buildingNameVisible} from '../dist/landmark-buildings.js';
test('recognizable buildings use real closed outlines, including both firehouses and warehouse',()=>{
 assert.ok(landmarkBuildings.length>100);
 for(const b of landmarkBuildings){assert.ok(b.ll.length>=4);assert.deepEqual(b.ll[0],b.ll.at(-1));}
 for(const name of ['Woodlawn Fire Department','Lincoln Heights Firehouse','Kroger Warehouse'])assert.ok(landmarkBuildings.some(b=>b.name===name),name);
});
test('building names require proximity and respect hidden street names',()=>{
 const b=landmarkBuildings.find(b=>b.name==='Kroger Warehouse');
 assert.equal(buildingNameVisible(b,b.center,16),true);
 assert.equal(buildingNameVisible(b,[b.center[0]+.01,b.center[1]],18),false);
 assert.equal(buildingNameVisible(b,b.center,15),false);
 assert.equal(buildingNameVisible(b,b.center,18,false),false);
});

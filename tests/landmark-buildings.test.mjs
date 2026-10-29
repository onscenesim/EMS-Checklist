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

test('reported missing landmarks and apartment buildings are retained below the old size cutoff',()=>{
 for(const [id,name] of [['201044262','Century Inn'],['52432959','Friendship Plaza Apartments'],['200416038','The Commons Apartments'],['36951679','Goodwill'],['64168206','Woodlawn Recreation Center']])assert.equal(landmarkBuildings.find(b=>b.id===id)?.name,name);
 for(const id of ['200416082','200416044','200416074','200416026','52431265','52431266'])assert.ok(landmarkBuildings.some(b=>b.id===id),id);
 assert.ok(!landmarkBuildings.some(b=>b.id==='687039045'&&b.name==='Woodlawn Recreation Center'));
});

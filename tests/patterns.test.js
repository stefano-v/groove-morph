import test from 'node:test';
import assert from 'node:assert/strict';
import {banks,blend,probability,makePattern} from '../patterns.js';
test('four styles contain six instruments and sixteen steps',()=>{
 assert.equal(banks.length,4);
 banks.forEach(bank=>{assert.equal(bank.length,6);bank.forEach(row=>assert.equal(row.length,16));});
});
test('morph endpoints select the first and last styles',()=>{
 assert.deepEqual(blend(0),{a:0,b:1,mix:0});
 assert.deepEqual(blend(1),{a:3,b:3,mix:0});
});
test('morph probabilities are continuous across all style boundaries',()=>{
 for(const x of [1/3,2/3])for(let i=0;i<6;i++)for(let s=0;s<16;s++)
 assert.ok(Math.abs(probability(x-1e-7,.5,i,s)-probability(x+1e-7,.5,i,s))<1e-5);
});
test('generated patterns are repeatable, bounded and react to energy',()=>{
 const params={morph:.5,complexity:.7,energy:.5};
 assert.deepEqual(makePattern(params,3),makePattern(params,3));
 const low=makePattern({...params,energy:0},3),high=makePattern({...params,energy:1},3);
 high.forEach((row,i)=>row.forEach((v,s)=>{assert.ok(v>=0&&v<=1);assert.ok(v>=low[i][s]);}));
});

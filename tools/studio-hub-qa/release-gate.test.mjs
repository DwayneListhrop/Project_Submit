import test from 'node:test';
import assert from 'node:assert/strict';
import {assess} from './release-gate.mjs';
import fs from 'node:fs';
const baseline = JSON.parse(fs.readFileSync(new URL('./projects.json',import.meta.url),'utf8'));
test('incomplete registry is blocked',()=> {
 const r=assess(baseline);
 assert.equal(r.status,'blocked');
 assert.equal(r.projects.length,8);
 assert.ok(r.projects.every(p=>p.status==='blocked'));
});
test('self-declared passing evidence cannot certify release',()=>{
 const fake=structuredClone(baseline);
 for(const p of fake.projects){
   p.repo ||= 'example/test';p.source ||= 'index.html';p.sha='a'.repeat(40);p.target_url='https://example.test';
   p.evidence=['functional','accessibility','security','release'].map(kind=>({kind,status:'pass',commit:p.sha,artifact_url:'https://example.test/artifact',checked_at:'2026-11-01'}));
 }
 const r=assess(fake);
 assert.equal(r.status,'blocked');
 assert.ok(r.projects.every(p=>p.reasons.some(x=>x.includes('provenance'))));
});
test('duplicate project IDs invalidates registry',()=>{
 const fake=structuredClone(baseline);
 fake.projects[1].id=fake.projects[0].id;
 assert.equal(assess(fake).status,'invalid');
});

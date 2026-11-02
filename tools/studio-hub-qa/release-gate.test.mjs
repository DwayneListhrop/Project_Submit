import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {assess} from './release-gate.mjs';
const base=JSON.parse(fs.readFileSync(new URL('./projects.json',import.meta.url),'utf8'));
test('all ranked 30 are recognized and blocked',()=>{const r=assess(base);assert.equal(r.status,'blocked');assert.equal(r.projects.length,30);assert.ok(r.projects.every(x=>x.status==='blocked'));});
test('claimed passes and hashes do not bypass provenance',()=>{const x=structuredClone(base);for(const p of x.projects){p.repo||='example/test';p.source||='index.html';p.sha='a'.repeat(40);p.target_url='https://example.test';p.latest_version.artifact_sha256='b'.repeat(64);p.evidence=['functional','accessibility','security','release'].map(kind=>({kind,status:'pass',commit:p.sha,run_id:123}));}const r=assess(x);assert.equal(r.status,'blocked');assert.ok(r.projects.every(p=>p.reasons.some(s=>s.includes('provenance'))));});
test('duplicate ranks fail validation',()=>{const x=structuredClone(base);x.projects[1].rank=1;assert.equal(assess(x).status,'invalid');});
test('unresolved parent reference fails validation',()=>{const x=structuredClone(base);x.projects[0].parent_id='not-a-build';assert.equal(assess(x).status,'invalid');});

import test from 'node:test';
import assert from 'node:assert/strict';
import {validateInventory} from './audit-capabilities.mjs';

function fixture() {
 const data={schema_version:1,audit_date:'2026-11-02',scope:['owner/repo'],policy:'Source audit only; no release certification.',capabilities:Array.from({length:12},(_,i)=>({id:'cap-'+i,upgrade:'Capability '+i,status:'unverified',evidence:[],next:'Inspect source'}))};
 const manifest={schema_version:1,artifacts:[{id:'engine',library_file_id:'libfile_example',filename:'engine.html',sha256:'a'.repeat(64),size_bytes:1234,observed_capabilities:['cap-0'],limitations:['Source inspection only; runtime untested.']}]};
 data.capabilities[0].status='partially-verified';
 data.capabilities[0].evidence=[{type:'recovered-artifact',artifact_id:'engine',note:'Reusable module found in source.'}];
 return {data,manifest};
}

test('legacy repository evidence remains valid without a manifest',()=>{
 const {data}=fixture();
 data.capabilities[0].status='verified-present';
 data.capabilities[0].evidence=[{repo:'owner/repo',ref:'main',path:'engine.js'}];
 assert.equal(validateInventory(data).summary['verified-present'],1);
});
test('recovery metadata supports partial verification and states its limits',()=>{
 const {data,manifest}=fixture();const report=validateInventory(data,manifest);
 assert.equal(report.summary['partially-verified'],1);
 assert.equal(report.recovered_artifacts.verification,'metadata-only');
 assert.match(report.recovered_artifacts.limits,/not the original artifact bytes/);
});
test('dangling recovered artifact references fail',()=>{
 const {data,manifest}=fixture();data.capabilities[0].evidence[0].artifact_id='missing';
 assert.throws(()=>validateInventory(data,manifest),/unknown recovered artifact/);
});
test('invalid artifact fingerprints and unsafe byte sizes fail',()=>{
 for(const badHash of ['a'.repeat(63),'A'.repeat(64),'g'.repeat(64)]) {
  const {data,manifest}=fixture();manifest.artifacts[0].sha256=badHash;
  assert.throws(()=>validateInventory(data,manifest),/invalid artifact SHA-256/);
 }
 for(const size of [0,-1,1.5,Number.MAX_SAFE_INTEGER+1]) {
  const {data,manifest}=fixture();manifest.artifacts[0].size_bytes=size;
  assert.throws(()=>validateInventory(data,manifest),/invalid artifact size/);
 }
});
test('an artifact cannot support an unobserved capability',()=>{
 const {data,manifest}=fixture();manifest.artifacts[0].observed_capabilities=['cap-1'];
 assert.throws(()=>validateInventory(data,manifest),/does not support capability/);
});
test('recovery alone cannot establish verified-present',()=>{
 const {data,manifest}=fixture();data.capabilities[0].status='verified-present';
 assert.throws(()=>validateInventory(data,manifest),/recovered artifacts alone cannot certify/);
});
test('duplicate artifact identities and missing provenance or limits fail',()=>{
 const {data,manifest}=fixture();manifest.artifacts.push(structuredClone(manifest.artifacts[0]));
 assert.throws(()=>validateInventory(data,manifest),/duplicate artifact id/);
 for(const field of ['library_file_id','filename','limitations']) {
  const f=fixture();delete f.manifest.artifacts[0][field];
  assert.throws(()=>validateInventory(f.data,f.manifest));
 }
});

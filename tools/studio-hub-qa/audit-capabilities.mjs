import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';

const valid = new Set(['verified-present','partially-verified','unverified']);
const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const recoveryLimits = 'Recovered artifact hashes are fingerprints recorded during source recovery. CI validates metadata and references, not the original artifact bytes, runtime behavior, cross-app integration, or release readiness.';

export function validateInventory(data, manifest = {schema_version:1, artifacts:[]}) {
 assert.equal(data?.schema_version,1,'unsupported capability schema');
 assert.ok(Array.isArray(data.scope) && data.scope.every(nonempty),'invalid repository scope');
 assert.ok(nonempty(data.policy),'missing audit limits');
 assert.ok(Array.isArray(data.capabilities),'capabilities not an array');
 assert.equal(data.capabilities.length,12,'expected twelve capability categories');
 assert.ok(data.capabilities.every(c=>c && nonempty(c.id)),'missing capability id');
 assert.equal(new Set(data.capabilities.map(x=>x.id)).size,data.capabilities.length,'duplicate capability id');
 assert.equal(manifest?.schema_version,1,'unsupported recovered artifact schema');
 assert.ok(Array.isArray(manifest.artifacts),'artifacts not an array');
 const artifacts = new Map();
 for (const artifact of manifest.artifacts) {
  assert.ok(artifact && nonempty(artifact.id),'missing artifact id');
  assert.ok(!artifacts.has(artifact.id),'duplicate artifact id: '+artifact.id);
  assert.ok(nonempty(artifact.library_file_id) && artifact.library_file_id.startsWith('libfile_'),'missing artifact Library provenance: '+artifact.id);
  assert.ok(nonempty(artifact.filename),'missing artifact filename: '+artifact.id);
  assert.ok(typeof artifact.sha256==='string' && /^[a-f0-9]{64}$/.test(artifact.sha256),'invalid artifact SHA-256: '+artifact.id);
  assert.ok(Number.isSafeInteger(artifact.size_bytes) && artifact.size_bytes>0,'invalid artifact size: '+artifact.id);
  assert.ok(Array.isArray(artifact.observed_capabilities) && artifact.observed_capabilities.length>0 && artifact.observed_capabilities.every(id=>data.capabilities.some(c=>c.id===id)),'invalid observed capabilities: '+artifact.id);
  assert.ok(Array.isArray(artifact.limitations) && artifact.limitations.length>0 && artifact.limitations.every(nonempty),'missing artifact limitations: '+artifact.id);
  artifacts.set(artifact.id,artifact);
 }
 for (const c of data.capabilities) {
  assert.ok(valid.has(c.status), 'unknown status: '+c.id);
  assert.ok(nonempty(c.upgrade) && nonempty(c.next), 'missing scope/next step: '+c.id);
  assert.ok(Array.isArray(c.evidence), 'evidence not an array: '+c.id);
  let repositoryEvidence = 0;
  for (const e of c.evidence) {
   assert.ok(e && typeof e==='object','invalid evidence: '+c.id);
   if(e.type==='recovered-artifact') {
    assert.ok(nonempty(e.artifact_id) && artifacts.has(e.artifact_id),'unknown recovered artifact: '+c.id);
    assert.ok(nonempty(e.note),'missing recovered artifact observation: '+c.id);
    assert.ok(artifacts.get(e.artifact_id).observed_capabilities.includes(c.id),'artifact does not support capability: '+c.id);
   } else {
    assert.ok(e.type===undefined || e.type==='repository','unknown evidence type: '+c.id);
    assert.ok(data.scope.includes(e.repo) && nonempty(e.ref) && nonempty(e.path), 'untraceable evidence: '+c.id);
    repositoryEvidence++;
   }
  }
  if(c.status==='verified-present') assert.ok(repositoryEvidence>0,'verified without repository evidence; recovered artifacts alone cannot certify capability: '+c.id);
 }
 const summary=Object.fromEntries([...valid].map(status=>[status,data.capabilities.filter(c=>c.status===status).length]));
 return {schema_version:1,as_of:data.audit_date,scope:data.scope,limits:data.policy,summary,capabilities:data.capabilities,recovered_artifacts:{schema_version:1,verification:'metadata-only',limits:recoveryLimits,artifacts:manifest.artifacts}};
}

if(process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
 const data=JSON.parse(fs.readFileSync(new URL('./capability-inventory.json',import.meta.url),'utf8'));
 const manifestPath=new URL('./recovered-artifacts.json',import.meta.url);
 const manifest=fs.existsSync(manifestPath)?JSON.parse(fs.readFileSync(manifestPath,'utf8')):undefined;
 const report=validateInventory(data,manifest);
 if(process.argv.includes('--write'))fs.writeFileSync(new URL('./capability-audit-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({audit:'passed',...report.summary,total:data.capabilities.length,recovered_artifacts:report.recovered_artifacts.artifacts.length}));
}

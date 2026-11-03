import fs from 'node:fs';
import assert from 'node:assert/strict';
const src = new URL('./capability-inventory.json', import.meta.url);
const data = JSON.parse(fs.readFileSync(src, 'utf8'));
const valid = new Set(['verified-present','partially-verified','unverified']);
assert.equal(data.schema_version,1);
assert.equal(data.capabilities.length,12);
assert.equal(new Set(data.capabilities.map(x=>x.id)).size,data.capabilities.length,'duplicate capability id');
for (const c of data.capabilities) {
 assert.ok(valid.has(c.status), 'unknown status: '+c.id);
 assert.ok(c.upgrade && c.next, 'missing scope/next step: '+c.id);
 assert.ok(Array.isArray(c.evidence), 'evidence not an array: '+c.id);
 if (c.status==='verified-present') assert.ok(c.evidence.length, 'verified without evidence: '+c.id);
 for (const e of c.evidence) assert.ok(data.scope.includes(e.repo) && e.ref && e.path, 'untraceable evidence: '+c.id);
}
const summary=Object.fromEntries([...valid].map(status=>[status,data.capabilities.filter(c=>c.status===status).length]));
const report={schema_version:1,as_of:data.audit_date,scope:data.scope,limits:data.policy,summary,capabilities:data.capabilities};
if(process.argv.includes('--write'))fs.writeFileSync(new URL('./capability-audit-report.json',import.meta.url),JSON.stringify(report,null,2)+'\\n');
console.log(JSON.stringify({audit:'passed',...summary,total:data.capabilities.length}));

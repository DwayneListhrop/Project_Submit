import fs from 'node:fs';
const file = new URL('./projects.json', import.meta.url);
const registry = JSON.parse(fs.readFileSync(file, 'utf8'));
const expected = ['ged-math','living-cell','warehouse','repeat-listener','caretaxi','biology-unified','motioncraft','studio-hub'];
const failures = [];
const verdicts = registry.projects.map(p => {
  const reasons = [];
  if (!p.repo || !p.source || !/^[a-f0-9]{40}$/.test(p.sha || '')) reasons.push('Unpinned source');
  if (!/^https:\/\//.test(p.target_url || '')) reasons.push('Missing deployment URL');
  const required = ['functional','accessibility','security','release'];
  for (const kind of required) {
    const e = (p.evidence || []).find(e => e.kind === kind && e.status === 'pass' && e.commit === p.sha && e.artifact_url && e.checked_at);
    if (!e) reasons.push('Missing matching ' + kind + ' evidence');
  }
  return {id:p.id, status:reasons.length ? 'blocked' : 'candidate', reasons};
});
if (registry.schema_version !== 1) failures.push('Unsupported registry schema');
if (registry.projects.length !== 8 || new Set(registry.projects.map(p=>p.id)).size !== 8 || expected.some(id=>!registry.projects.some(p=>p.id===id))) failures.push('Top-eight inventory mismatch');
const report = {schema_version:1, generated_at:new Date().toISOString(), status:failures.length ? 'invalid' : verdicts.every(p=>p.status==='candidate') ? 'candidate' : 'blocked', failures, projects:verdicts};
fs.writeFileSync(new URL('./release-gate-report.json', import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(failures.length || (process.argv.includes('--enforce') && report.status!=='candidate')) process.exitCode = 1;

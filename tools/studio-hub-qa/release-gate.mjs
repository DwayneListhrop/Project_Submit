import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

export function assess(registry) {
  const expected = ['ged-math','living-cell','warehouse','repeat-listener','caretaxi','biology-unified','motioncraft','studio-hub'];
  const failures = [];
  const projects = Array.isArray(registry?.projects) ? registry.projects : [];
  if (registry?.schema_version !== 1) failures.push('Unsupported registry schema');
  if (projects.length !== expected.length || new Set(projects.map(p => p?.id)).size !== expected.length || expected.some(id => !projects.some(p => p?.id === id))) failures.push('Top-eight inventory mismatch');
  const verdicts = projects.map(p => {
    const reasons = [];
    if (!p || typeof p !== 'object') return {id:null,status:'blocked',reasons:['Invalid project entry']};
    if (!p.repo || !p.source || !/^[a-f0-9]{40}$/.test(p.sha || '')) reasons.push('Unpinned source');
    if (!/^https:\/\//.test(p.target_url || '')) reasons.push('Missing deployment URL');
    const required = ['functional','accessibility','security','release'];
    for (const kind of required) {
      const recorded = Array.isArray(p.evidence) && p.evidence.some(e => e?.kind === kind && e.status === 'pass' && e.commit === p.sha && e.artifact_url && e.checked_at);
      if (!recorded) reasons.push('Missing matching ' + kind + ' evidence');
    }
    // A registry entry is an assertion, not independent proof. Never approve solely from JSON.
    reasons.push('Evidence provenance not independently verified against GitHub Actions');
    return {id:p.id,status:'blocked',reasons};
  });
  return {schema_version:1, generated_at:new Date().toISOString(), status:failures.length ? 'invalid' : 'blocked', failures, projects:verdicts};
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const registry = JSON.parse(fs.readFileSync(new URL('./projects.json',import.meta.url),'utf8'));
  const report = assess(registry);
  fs.writeFileSync(new URL('./release-gate-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
  if (report.failures.length || (process.argv.includes('--enforce') && report.status !== 'candidate')) process.exitCode = 1;
}

import fs from 'node:fs';
const path = 'results.json';
let suites = [], stats = {}, readError = null;
try {
  const parsed = JSON.parse(fs.readFileSync(path, 'utf8'));
  suites = parsed.suites || []; stats = parsed.stats || {};
} catch (err) { readError = String(err); }
const tests = [];
function walk(items) {
  for (const suite of items) {
    for (const spec of suite.specs || []) {
      for (const t of spec.tests || []) {
        const r = t.results?.at(-1);
        tests.push({name: spec.title, status: t.status || r?.status || 'unknown', error: r?.error?.message || null});
      }
    }
    walk(suite.suites || []);
  }
}
walk(suites);
const target = (process.env.STUDIO_TARGET_URL || '').trim();
const passed = process.env.TEST_OUTCOME === 'success' && !readError;
const report = {
  schema: 'd_builds.studio_hub.qa.v1',
  generated_at: new Date().toISOString(),
  commit: process.env.GITHUB_SHA || null,
  run_id: process.env.GITHUB_RUN_ID || null,
  scope: target ? 'preview-smoke' : 'harness-only',
  application_verified: Boolean(target && tests.some(t => t.name.includes('Application preview') && t.status === 'expected')),
  release_ready: false,
  gate: passed ? 'pass' : 'fail',
  reason: target ? 'Only preview smoke tests were run; functional regression and native release gates remain required.' : 'No application target configured; harness passing does NOT validate any app.',
  stats, tests, read_error: readError,
  cloudflare_deployed: false
};
fs.writeFileSync('qa-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({gate:report.gate,scope:report.scope,application_verified:report.application_verified}));

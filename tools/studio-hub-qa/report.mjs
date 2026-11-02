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
  scope: target ? 'portfolio-regression-and-preview-smoke' : 'portfolio-regression',
  application_verified: Boolean(passed && tests.filter(t => t.name.startsWith('Portfolio ')).length === 3 && tests.filter(t => t.name.startsWith('Portfolio ')).every(t => t.status === 'expected')),
  release_ready: false,
  gate: passed ? 'pass' : 'fail',
  reason: target ? 'Only preview smoke tests were run; functional regression and native release gates remain required.' : 'Portfolio source regression tests run against the built app; full release coverage remains incomplete.',
  stats, tests, read_error: readError,
  cloudflare_deployed: false
};
fs.writeFileSync('qa-report.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({gate:report.gate,scope:report.scope,application_verified:report.application_verified}));

import fs from 'node:fs';
const registry = JSON.parse(fs.readFileSync(new URL('./projects.json',import.meta.url),'utf8'));
const allowed = new Set(['DwayneListhrop/Project_Submit','dwayne-lis/d_builds']);
const out = {schema_version:1,generated_at:new Date().toISOString(),projects:[]};
async function github(path) {
  const token=process.env.GITHUB_TOKEN;
  if (!token) throw Error('GITHUB_TOKEN is unavailable');
  const res=await fetch('https://api.github.com'+path,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(12000)});
  if(!res.ok) throw Error('GitHub API HTTP '+res.status);
  return res.json();
}
for (const p of registry.projects) {
 const result={id:p.id,source_commit:p.sha||null,status:'blocked',checks:[],reasons:[]};
 if(!allowed.has(p.repo)){result.reasons.push('Repository not allowlisted or missing');out.projects.push(result);continue;}
 if(!/^[a-f0-9]{40}$/.test(p.sha||'')){result.reasons.push('Missing immutable source SHA');out.projects.push(result);continue;}
 const entries=Array.isArray(p.evidence)?p.evidence:[];
 for(const e of entries) {
   if(!Number.isSafeInteger(e.run_id)||e.run_id<=0 || typeof e.workflow!=='string' || !e.workflow || !['functional','accessibility','security','release'].includes(e.kind)){
     result.reasons.push('Invalid evidence descriptor');continue;
   }
   try{
     const run=await github('/repos/'+p.repo+'/actions/runs/'+e.run_id);
     const match=run.head_sha===p.sha && run.repository?.full_name===p.repo && run.status==='completed' && run.conclusion==='success' && run.name===e.workflow && run.event!=='workflow_dispatch';
     const jobs=await github('/repos/'+p.repo+'/actions/runs/'+e.run_id+'/jobs?per_page=100');
     const completed=(jobs.jobs||[]).filter(j=>j.status==='completed'&&j.conclusion==='success');
     const named=completed.some(j=>j.name===e.job);
     const valid=Boolean(match&&named&&e.job && (jobs.total_count||0)<=100);
     result.checks.push({kind:e.kind,run_id:e.run_id,verified:valid,run_url:run.html_url||null});
     if(!valid)result.reasons.push('Run, job, repository, event or commit does not match '+e.kind);
   }catch(err){result.reasons.push('Cannot verify '+e.kind+': '+String(err.message).slice(0,100));}
 }
 for(const kind of ['functional','accessibility','security','release']){
   if(!result.checks.some(c=>c.kind===kind&&c.verified))result.reasons.push('Missing independently verified '+kind+' job');
 }
 if(!p.source || !p.target_url)result.reasons.push('Missing source path or deployment URL');
 // This verifier produces evidence only, never automatically approves a release.
 out.projects.push(result);
}
fs.writeFileSync(new URL('./github-evidence-report.json',import.meta.url),JSON.stringify(out,null,2)+'\n');
console.log(JSON.stringify({total:out.projects.length,blocked:out.projects.filter(p=>p.status==='blocked').length,verified_checks:out.projects.flatMap(p=>p.checks).filter(c=>c.verified).length}));

import fs from 'node:fs';
const registry=JSON.parse(fs.readFileSync(new URL('./projects.json',import.meta.url),'utf8'));
const token=process.env.GITHUB_TOKEN;
const allowed=new Set(['dwayne-lis/d_builds','DwayneListhrop/Project_Submit']);
const results=[];
for(const project of registry.projects){
 const checks=[];
 for(const e of project.observed_ci||[]){
  const row={run_id:e.run_id,category:e.category,classification:'historical-only',verified:false};
  try{
   if(!allowed.has(project.repo)||!Number.isSafeInteger(e.run_id)||!token)throw Error('Unavailable repository, run ID or token');
   const response=await fetch('https://api.github.com/repos/'+project.repo+'/actions/runs/'+e.run_id,{headers:{Authorization:'Bearer '+token,Accept:'application/vnd.github+json'},signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error('HTTP '+response.status);
   const run=await response.json();
   row.verified=run.repository?.full_name===project.repo && run.id===e.run_id && run.head_sha?.startsWith(e.sha) && run.name===e.workflow && run.status==='completed' && run.conclusion==='success';
   row.commit_sha=run.head_sha||null;
   row.run_url=run.html_url||null;
   if(!row.verified)row.reason='Run metadata mismatch or failed result';
  }catch(err){row.reason=String(err.message).slice(0,100);}
  checks.push(row);
 }
 results.push({id:project.id,release_status:'blocked',historical_ci:checks});
}
const report={schema_version:1,generated_at:new Date().toISOString(),note:'Historical CI metadata does not certify current release',projects:results};
fs.writeFileSync(new URL('./historical-ci-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({projects:results.length,observed:results.flatMap(p=>p.historical_ci).length,verified:results.flatMap(p=>p.historical_ci).filter(x=>x.verified).length,release_candidates:0}));

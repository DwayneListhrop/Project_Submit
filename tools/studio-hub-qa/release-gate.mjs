import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
export function assess(registry){
 const projects=Array.isArray(registry?.projects)?registry.projects:[];
 const failures=[];
 if(registry?.schema_version!==2)failures.push('Unsupported schema');
 if(projects.length!==30 || new Set(projects.map(p=>p?.id)).size!==30 || projects.some((p,i)=>p?.rank!==i+1))failures.push('Top 30 inventory/rank mismatch');
 const ids=new Set(projects.map(p=>p?.id));
 const results=projects.map(p=>{
  const reasons=[];
  if(!p||typeof p!=='object')return {id:null,status:'blocked',reasons:['Invalid entry']};
  if(p.parent_id && (!ids.has(p.parent_id)||p.parent_id===p.id))reasons.push('Invalid parent relationship');
  if(!p.repo||!p.source||!/^[0-9a-f]{40}$/.test(p.sha||''))reasons.push('Source not commit-pinned');
  if(!/^https:\/\//.test(p.target_url||''))reasons.push('Deployment not verified');
  if(!p.latest_version?.artifact_sha256||!/^[a-f0-9]{64}$/.test(p.latest_version.artifact_sha256))reasons.push('No immutable latest artifact hash');
  for(const kind of ['functional','accessibility','security','release']){
   if(!Array.isArray(p.evidence)||!p.evidence.some(e=>e?.kind===kind && e?.status==='pass' && e?.commit===p.sha && e?.run_id))reasons.push('Missing '+kind+' evidence');
  }
  reasons.push('Independent evidence and artifact provenance not certified');
  return {id:p.id,rank:p.rank,status:'blocked',reasons};
 });
 if(results.some(x=>x.reasons.includes('Invalid parent relationship')))failures.push('Invalid relationships');
 return {schema_version:2,generated_at:new Date().toISOString(),status:failures.length?'invalid':'blocked',failures,projects:results};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const report=assess(JSON.parse(fs.readFileSync(new URL('./projects.json',import.meta.url),'utf8')));
 fs.writeFileSync(new URL('./release-gate-report.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,projects:report.projects.length,failures:report.failures}));
 if(report.failures.length||(process.argv.includes('--enforce')&&report.status!=='candidate'))process.exitCode=1;
}

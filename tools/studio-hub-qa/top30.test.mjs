import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const dir=new URL('./',import.meta.url);
const data=JSON.parse(fs.readFileSync(new URL('projects.json',dir),'utf8'));
const html=fs.readFileSync(new URL('dashboard/index.html',dir),'utf8');
test('exactly thirty ranked projects and unique IDs',()=>{assert.equal(data.schema_version,2);assert.equal(data.projects.length,30);assert.equal(new Set(data.projects.map(p=>p.id)).size,30);assert.deepEqual(data.projects.map(p=>p.rank),Array.from({length:30},(_,i)=>i+1));});
test('dashboard references registry and exposes accessible controls',()=>{assert.match(html,/fetch\('\.\.\/projects\.json'/);for(const id of ['search','status','kind'])assert.match(html,new RegExp('id="'+id+'"'));assert.match(html,/aria-live="polite"/);});
test('module reconciliation is explicit and all releases blocked',()=>{const map=Object.fromEntries(data.projects.map(p=>[p.id,p]));assert.equal(map['caretaxi-driver'].parent_id,'caretaxi');assert.equal(map['intervention-dashboard'].kind,'candidate-module');assert.equal(map['learning-session-engine'].kind,'candidate-module');assert.ok(data.projects.every(p=>p.release_status==='blocked'));});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function fn(name,next){return html.slice(html.indexOf('function '+name+'('),html.indexOf(next,html.indexOf('function '+name+'(')));}
const context=vm.createContext({SKILLS:[{id:'synthetic'}]});
vm.runInContext(fn('v11ValidatePortfolio','async function v11StageRestore')+fn('csvCell','function exportCsv'),context);
const validate=x=>context.v11ValidatePortfolio(x);
const fixture=()=>({schema:1,portfolio:{profile:{code:'SYNTHETIC'},attempts:[{id:'test-1',skillId:'synthetic',correct:1,total:2,minutes:1,attachments:[],evidenceType:'game',verified:false}],goals:[]},attachments:[]});
test('synthetic portfolio validates without changing evidence',()=>{const x=fixture();assert.equal(validate(x).validation.errors.length,0);assert.equal(x.portfolio.attempts[0].verified,false)});
test('malformed collections and future schema are rejected',()=>{for(const mutate of [x=>x.schema=2,x=>x.portfolio.attempts={},x=>x.portfolio.goals='bad',x=>x.portfolio.profile=[],x=>x.attachments={}]){const x=fixture();mutate(x);assert.throws(()=>validate(x))}});
test('invalid scores and duplicate IDs block restore',()=>{for(const score of [-1,3,NaN,Infinity]){const x=fixture();x.portfolio.attempts[0].correct=score;assert.ok(validate(x).validation.errors.length)}const x=fixture();x.portfolio.attempts.push({...x.portfolio.attempts[0]});assert.ok(validate(x).validation.errors.length)});
test('missing files and assisted verification block restore',()=>{const x=fixture();x.portfolio.attempts[0].attachments=['missing'];assert.ok(validate(x).validation.errors.length);x.portfolio.attempts[0].verified=true;assert.ok(validate(x).validation.errors.some(x=>x.includes('independent')))});
test('CSV export neutralizes spreadsheet formulas and escapes quotes',()=>{for(const text of ['=1+1',' +SUM(A1)','@SUM(A1)','-1+2','\tformula'])assert.ok(context.csvCell(text).startsWith('"\''));assert.equal(context.csvCell('a"b'),'"a""b"')});
test('malformed scan history and nonboolean verification flags cannot restore',()=>{for(const mutate of [x=>x.portfolio.captureScans=[{findings:'malformed'}],x=>x.portfolio.captureScans=[{findings:[null]}],x=>x.portfolio.attempts[0].verified='false']){const x=fixture();mutate(x);assert.throws(()=>validate(x))}});

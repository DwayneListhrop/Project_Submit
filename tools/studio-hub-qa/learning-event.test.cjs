const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const fixturePath=path.join(__dirname,'learning-event-source.js');
const sourcePath=process.env.LEARNING_ENGINE_HTML || process.argv.slice(2).find(arg=>/\.(?:html|js)$/.test(arg)) || (fs.existsSync(fixturePath)?fixturePath:path.join(__dirname,'recovered/OPEN_DBuilds_Learning_Session_Engine_V8.html'));
const html=fs.readFileSync(sourcePath,'utf8');
const script=html.match(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/i)?.[1] || (sourcePath.endsWith('.js')?html:null);
assert.ok(script,'Learning Session Engine inline script missing');

// Compile candidate slices rather than duplicating the application's validation logic.
function declaration(prefix) {
 const start=script.indexOf(prefix);
 assert.notEqual(start,-1,'Source declaration missing: '+prefix);
 for(let end=script.indexOf('}',start);end!==-1;end=script.indexOf('}',end+1)) {
  const candidate=script.slice(start,end+1)+';';
  try {new vm.Script(candidate);return candidate;} catch(error) {if(!(error instanceof SyntaxError))throw error;}
 }
 throw new Error('Unterminated declaration: '+prefix);
}
function harness() {
 const guard=script.match(/\/\* LEARNING_EVENT_GUARD_START \*\/([\s\S]*?)\/\* LEARNING_EVENT_GUARD_END \*\//)?.[1];
 assert.ok(guard,'Learning event guard region missing');
 const sandbox={state:{id:'test-session',stage:0,attempts:0,correct:0,repairs:0,hints:0,interactions:0,mastery:{},events:[],meta:{}},STAGES:['Build','Activate','Anticipate','Manipulate','Explain'],sequence:[],motionResetCalls:0,activityCalls:0,motionReset(){this.motionResetCalls++;},activity(){this.activityCalls++;},persist(){},render(){},beep(){},bridgeLog(){},renderPlugin(){},console,CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail;}}};
 sandbox.window=sandbox;sandbox.dispatchEvent=()=>{};sandbox.document={querySelector:()=>null};
 const context=vm.createContext(sandbox);
 sandbox.motionReset=()=>{sandbox.motionResetCalls++;};sandbox.activity=()=>{sandbox.activityCalls++;};
 vm.runInContext(['emit','recordAttempt','recordMastery','masteryPct'].map(name=>declaration('function '+name+'(')).join('\n')+'\n'+guard+'\n'+declaration('window.DBuildsPluginBridge={'),context);
 const bridge={ingest(detail){context.incomingJSON=JSON.stringify(detail);return vm.runInContext('DBuildsPluginBridge.ingest(JSON.parse(incomingJSON))',context);},get currentPlugin(){return sandbox.DBuildsPluginBridge.currentPlugin;},set currentPlugin(plugin){context.pluginJSON=JSON.stringify(plugin);vm.runInContext('DBuildsPluginBridge.currentPlugin=JSON.parse(pluginJSON)',context);}};
 return {context,state:sandbox.state,bridge};
}
function accepted(result){assert.equal(result?.accepted,true,JSON.stringify(result));}
function rejected(result){assert.equal(result?.accepted,false,JSON.stringify(result));assert.equal(typeof result.reason,'string');}

test('duplicate event IDs count one attempt',()=>{
 const {state,bridge}=harness();
 accepted(bridge.ingest({type:'attempt.submitted',correct:true,eventId:'answer-1'}));
 rejected(bridge.ingest({type:'attempt.submitted',correct:true,eventId:'answer-1'}));
 assert.equal(state.attempts,1);assert.equal(state.correct,1);assert.equal(state.events.length,1);
});
test('invalid mastery stages including prototype keys cannot affect progress',()=>{
 const {state,bridge,context}=harness();
 for(const stage of ['__proto__','constructor','Unknown','build',null,{},5])rejected(bridge.ingest({type:'mastery.recorded',masteryStage:stage,eventId:'stage-'+String(stage)}));
 assert.equal(Object.keys(state.mastery).length,0);assert.equal(vm.runInContext('masteryPct()',context),0);
 accepted(bridge.ingest({type:'mastery.recorded',masteryStage:'Build',evidence:'Explained the model',eventId:'valid-stage'}));
 assert.equal(vm.runInContext('masteryPct()',context),20);
});
test('correctness must be an explicit own boolean',()=>{
 const {state,bridge,context}=harness();
 for(const correct of ['false','true',1,0,null,undefined])rejected(bridge.ingest({type:'attempt.submitted',correct}));
 rejected(vm.runInContext('const inherited=Object.create({correct:true});inherited.type="attempt.submitted";DBuildsPluginBridge.ingest(inherited)',context));
 assert.equal(state.attempts,0);assert.equal(state.correct,0);assert.equal(state.repairs,0);
});
test('invalid event types do not mutate evidence',()=>{
 const {state,bridge}=harness();
 for(const type of [null,undefined,3,{},'',[], 'not-an-event'])rejected(bridge.ingest({type,correct:true}));
 assert.equal(state.events.length,0);assert.equal(state.attempts,0);
});
test('teacher test events cannot add learner attempts or mastery',()=>{
 const {state,bridge}=harness();
 for(const teacher of [{mode:'teacher'},{teacherMode:true}]) {
  rejected(bridge.ingest({type:'attempt.submitted',correct:true,...teacher}));
  rejected(bridge.ingest({type:'mastery.recorded',masteryStage:'Build',evidence:'Valid evidence',...teacher}));
 }
 assert.equal(state.attempts,0);assert.equal(Object.keys(state.mastery).length,0);
});
test('external reserved fields cannot replace engine event metadata',()=>{
 const {state,bridge}=harness();
 accepted(bridge.ingest({type:'attempt.submitted',correct:true,id:999,time:'forged',stage:'Explain',eventId:'metadata'}));
 assert.equal(state.events[0].id,1);assert.notEqual(state.events[0].time,'forged');assert.equal(state.events[0].stage,'Build');
});
test('legacy no-ID attempts remain valid and distinct',()=>{
 const {state,bridge}=harness();
 accepted(bridge.ingest({type:'attempt.submitted',correct:false}));
 accepted(bridge.ingest({type:'attempt.submitted',correct:false}));
 assert.equal(state.attempts,2);assert.equal(state.repairs,2);
});
test('identical answers with different IDs count as distinct attempts',()=>{
 const {state,bridge}=harness();
 for(const eventId of ['first','second'])accepted(bridge.ingest({type:'attempt.submitted',correct:true,eventId}));
 assert.equal(state.attempts,2);assert.equal(state.correct,2);
});
test('deduplication is scoped to plug-in identity and survives switching back',()=>{
 const {state,bridge}=harness();
 bridge.currentPlugin={id:'alpha'};accepted(bridge.ingest({type:'attempt.submitted',correct:true,eventId:'same'}));
 bridge.currentPlugin={id:'beta'};accepted(bridge.ingest({type:'attempt.submitted',correct:true,eventId:'same'}));
 bridge.currentPlugin={id:'alpha'};rejected(bridge.ingest({type:'attempt.submitted',correct:true,eventId:'same'}));
 assert.equal(state.attempts,2);
});
test('direct public recording functions reject invalid scoring input',()=>{
 const {state,context}=harness();
 vm.runInContext('recordAttempt("false"); recordMastery("__proto__", "bad")',context);
 assert.equal(state.attempts,0);assert.equal(Object.keys(state.mastery).length,0);
});

test('invalid source stage is rejected rather than recorded as progress',()=>{
 const {state,bridge}=harness();
 rejected(bridge.ingest({type:'attempt.submitted',correct:true,stage:'forged'}));
 assert.equal(state.attempts,0);assert.equal(state.events.length,0);
});
test('session teacher-test and registered plug-in teacher-test suppress learning evidence',()=>{
 const {state,bridge,context}=harness();
 vm.runInContext('setTeacherTest(true)',context);
 rejected(bridge.ingest({type:'attempt.submitted',correct:true}));
 vm.runInContext('setTeacherTest(false)',context);
 bridge.currentPlugin={id:'demo',teacherTest:true};
 rejected(bridge.ingest({type:'attempt.submitted',correct:true}));
 assert.equal(state.attempts,0);
});
test('duplicate detection survives persisted-state reload and clears for a new session',()=>{
 const {bridge,context}=harness();
 const detail={type:'attempt.submitted',correct:true,eventId:'persisted'};
 accepted(bridge.ingest(detail));
 vm.runInContext('state=JSON.parse(JSON.stringify(state))',context);
 rejected(bridge.ingest(detail));
 assert.equal(vm.runInContext('state.attempts',context),1);
 vm.runInContext('state={...state,id:"new-session",attempts:0,correct:0,repairs:0,events:[],mastery:{}}',context);
 accepted(bridge.ingest(detail));
 assert.equal(vm.runInContext('state.attempts',context),1);
});
test('explicit true and false outcomes update the intended counters',()=>{
 const {state,bridge}=harness();
 accepted(bridge.ingest({type:'attempt.submitted',correct:true,eventId:'yes'}));
 accepted(bridge.ingest({type:'attempt.submitted',correct:false,eventId:'no'}));
 assert.equal(state.attempts,2);assert.equal(state.correct,1);assert.equal(state.repairs,1);
 assert.equal(state.events[0].correct,true);assert.equal(state.events[1].correct,false);
});
test('hints count once by ID and never count in teacher test mode',()=>{
 const {state,bridge}=harness();
 accepted(bridge.ingest({type:'hint.used',eventId:'hint-1'}));
 rejected(bridge.ingest({type:'hint.used',eventId:'hint-1'}));
 rejected(bridge.ingest({type:'hint.used',eventId:'hint-2',teacherTest:true}));
 assert.equal(state.hints,1);assert.equal(state.attempts,0);assert.equal(state.events.length,1);
});
test('plain producer objects from another realm are accepted',()=>{
 const {state,context}=harness();
 context.foreignEvent={type:'attempt.submitted',correct:true,eventId:'foreign'};
 accepted(vm.runInContext('DBuildsPluginBridge.ingest(foreignEvent)',context));
 assert.equal(state.attempts,1);assert.equal(state.correct,1);
});

test('own toJSON cannot rewrite scoring input or conceal teacher mode',()=>{
 const {state,context}=harness();
 for(const source of [
  '({type:"attempt.submitted",correct:false,toJSON(){return {type:"attempt.submitted",correct:true}}})',
  '({type:"attempt.submitted",correct:true,teacherMode:true,toJSON(){return {type:"attempt.submitted",correct:true}}})'
 ])rejected(vm.runInContext('DBuildsPluginBridge.ingest('+source+')',context));
 assert.equal(state.attempts,0);assert.equal(state.correct,0);assert.equal(state.events.length,0);
});
test('mastery evidence is validated after nested JSON serialization',()=>{
 const {state,context}=harness();
 rejected(vm.runInContext('DBuildsPluginBridge.ingest({type:"mastery.recorded",masteryStage:"Build",evidence:{toJSON(){return null}}})',context));
 rejected(vm.runInContext('DBuildsPluginBridge.ingest({type:"mastery.recorded",masteryStage:"Build",evidence:{value:undefined}})',context));
 assert.equal(Object.keys(state.mastery).length,0);assert.equal(state.events.length,0);
});
test('native teacher-test emissions leave learner event and interaction counters unchanged',()=>{
 const {state,context}=harness();
 vm.runInContext('setTeacherTest(true)',context);
 rejected(vm.runInContext('emit("interaction.manipulated",{value:42})',context));
 rejected(vm.runInContext('recordAttempt(true)',context));
 rejected(vm.runInContext('recordMastery("Build","Valid explanation")',context));
 assert.equal(state.interactions,0);assert.equal(state.events.length,0);assert.equal(state.attempts,0);assert.equal(Object.keys(state.mastery).length,0);
});
test('leaving teacher mode clears demonstration readiness while preserving earned evidence',()=>{
 const {state,context}=harness();
 accepted(vm.runInContext('recordAttempt(true,{eventId:"earned"})',context));
 accepted(vm.runInContext('recordMastery("Build","Earned learner explanation")',context));
 const events=state.events.length;
 vm.runInContext('setTeacherTest(true); state.stage=4; sequence=["demonstration"]; atomForgeReady=true; atomTransferComplete=true; circuitConnected=true; setTeacherTest(false)',context);
 assert.equal(state.teacherTest,false);assert.equal(state.stage,0);
 assert.equal(vm.runInContext('sequence.length',context),0);
 for(const flag of ['atomForgeReady','atomTransferComplete','circuitConnected'])assert.equal(vm.runInContext(flag,context),false);
 assert.equal(vm.runInContext('motionResetCalls',context),1);assert.equal(vm.runInContext('activityCalls',context),1);
 assert.equal(state.attempts,1);assert.equal(state.correct,1);assert.equal(state.events.length,events);assert.equal(vm.runInContext('masteryPct()',context),20);
});

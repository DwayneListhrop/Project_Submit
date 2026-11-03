// Exact guard/runtime excerpts from the standalone V8.1 HTML; see learning-event-hardening.md.
function emit(type,detail={}){if(state.teacherTest===true)return {accepted:false,reason:"teacher-mode"};const e={...detail,id:state.events.length+1,time:new Date().toISOString(),type,stage:STAGES[state.stage]||"Complete"};state.events.push(e);state.interactions++;persist();render();window.dispatchEvent(new CustomEvent("dbuilds:session-event",{detail:e}))}

function masteryPct(){return Math.round(STAGES.filter(s=>Object.hasOwn(state.mastery,s)).length/STAGES.length*100)}

/* LEARNING_EVENT_GUARD_START */
// Stable producer eventId is optional for legacy clients; only events with IDs are deduplicated.
function validateLearningEvent(detail) {
 const fail=reason=>({accepted:false,reason});
 if(!detail || typeof detail!=="object" || Array.isArray(detail))return fail("invalid-event");
 const proto=Object.getPrototypeOf(detail);
 if(proto!==null && Object.getPrototypeOf(proto)!==null)return fail("invalid-event");
 if(Object.hasOwn(detail,"toJSON"))return fail("invalid-data");
 try {const json=JSON.stringify(detail);if(json.length>32768)return fail("event-too-large");detail=JSON.parse(json)}catch{return fail("invalid-data")}
 if(!detail || typeof detail!=="object" || Array.isArray(detail))return fail("invalid-data");
 if(!Object.hasOwn(detail,"type") || typeof detail.type!=="string" || !/^[a-z][a-z0-9_-]*(?:\.[a-z][a-z0-9_-]*)+$/.test(detail.type) || detail.type.length>120)return fail("invalid-type");
 for(const flag of ["teacherTest","teacherMode","testMode","teacher"])
  if(Object.hasOwn(detail,flag) && typeof detail[flag]!=="boolean")return fail("invalid-mode");
 if(Object.hasOwn(detail,"mode") && !["learner","student","teacher","test"].includes(detail.mode))return fail("invalid-mode");
 if(Object.hasOwn(detail,"stage") && !STAGES.includes(detail.stage))return fail("invalid-stage");
 if(detail.type==="attempt.submitted" && (!Object.hasOwn(detail,"correct") || typeof detail.correct!=="boolean"))return fail("invalid-correctness");
 if(detail.type==="mastery.recorded") {
  if(!Object.hasOwn(detail,"masteryStage") || !STAGES.includes(detail.masteryStage))return fail("invalid-stage");
  const evidence=detail.evidence;
  if(!Object.hasOwn(detail,"evidence") || !(typeof evidence==="string" && evidence.trim() || evidence && typeof evidence==="object" && !Array.isArray(evidence) && Object.keys(evidence).length))return fail("missing-evidence");
 }
 if(Object.hasOwn(detail,"eventId") && !(typeof detail.eventId==="string" && detail.eventId.trim() && detail.eventId.length<=128))return fail("invalid-event-id");
 let payload;
 try {const json=JSON.stringify(detail);if(json.length>32768)return fail("event-too-large");payload=JSON.parse(json)}catch{return fail("invalid-data")}
 for(const key of ["id","time","type","stage","sourcePlugin","__proto__","constructor","prototype"])delete payload[key];
 return {accepted:true,type:detail.type,payload,teacher:detail.teacherTest===true || detail.teacherMode===true || detail.testMode===true || detail.teacher===true || detail.mode==="teacher" || detail.mode==="test"};
}
function acceptLearningEvent(detail,sourcePlugin="native",pluginTeacher=false) {
 const result=validateLearningEvent(detail);
 if(!result.accepted)return result;
 if(state.teacherTest===true || pluginTeacher || result.teacher)return {accepted:false,reason:"teacher-mode"};
 const {type,payload}=result;
 if(payload.eventId && state.events.some(e=>e.sourcePlugin===sourcePlugin && e.eventId===payload.eventId))return {accepted:false,reason:"duplicate-event"};
 if(type==="attempt.submitted"){state.attempts++;if(payload.correct===true)state.correct++;else state.repairs++}
 if(type==="hint.used")state.hints++;
 if(type==="mastery.recorded")state.mastery[payload.masteryStage]={time:new Date().toISOString(),evidence:payload.evidence};
 emit(type,{...payload,sourcePlugin});
 return {accepted:true,reason:payload.eventId?"accepted":"legacy-without-event-id"};
}
function recordAttempt(correct,detail={}) {
 const result=acceptLearningEvent({...detail,type:"attempt.submitted",correct},"native");
 if(result.accepted)beep(correct);return result;
}
function recordMastery(stage,evidence) {
 return acceptLearningEvent({type:"mastery.recorded",masteryStage:stage,evidence},"native");
}
function setTeacherTest(enabled) {
 if(typeof enabled!=="boolean")return {accepted:false,reason:"invalid-mode"};
 const leaving=state.teacherTest===true && !enabled;
 state.teacherTest=enabled;
 // Clear demonstration readiness when returning to learner mode, while keeping earned scores.
 if(leaving){state.stage=0;sequence=[];motionReset();window.atomForgeReady=false;window.atomTransferComplete=false;window.circuitConnected=false;activity();render()}
 const button=document.querySelector("#teacherTest");
 if(button){button.textContent="Teacher test: "+(enabled?"On":"Off");button.setAttribute("aria-pressed",String(enabled))}
 persist();return {accepted:true,teacherTest:enabled};
}
/* LEARNING_EVENT_GUARD_END */

window.DBuildsPluginBridge={
 currentPlugin:null,
 register(meta={}){
   const normalized={
     id:meta.id||"external-activity",
     name:meta.name||"External D_Builds Activity",
     version:meta.version||"1.0",
     concept:meta.concept||state.meta.concept||"Unspecified",
     stages:Array.isArray(meta.stages)?meta.stages:STAGES,
     teacherTest:meta.teacherTest===true || meta.teacherMode===true || meta.mode==="teacher" || meta.mode==="test",
     capabilities:meta.capabilities||["events","attempts","mastery"]
   };
   this.currentPlugin=normalized;
   bridgeLog("REGISTER",normalized);
   emit("plugin.registered",{pluginId:normalized.id,pluginName:normalized.name,pluginVersion:normalized.version,pluginConcept:normalized.concept});
   renderPlugin();
   window.dispatchEvent(new CustomEvent("dbuilds:engine-command",{detail:{command:"registered",sessionId:state.id,sessionStage:STAGES[state.stage]}}));
   return normalized;
 },
 disconnect(){
   if(!this.currentPlugin)return;
   const old=this.currentPlugin;this.currentPlugin=null;
   bridgeLog("DISCONNECT",{id:old.id});
   emit("plugin.disconnected",{pluginId:old.id});
   renderPlugin();
 },
 ingest(detail={}){
   const plugin=this.currentPlugin;
   const result=acceptLearningEvent(detail,plugin?.id||"external",plugin?.teacherTest===true);
   bridgeLog(result.accepted?"EVENT":"EXCLUDED",{reason:result.reason,type:detail?.type});
   return result;
 }
};

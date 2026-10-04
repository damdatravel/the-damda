const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
function moduleAt(path,requireFn){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:requireFn,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'url',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'pub',SUPABASE_SERVICE_ROLE_KEY:'key'}},Date,Set,Number,JSON,Object,Error});return m.exports}
const lib=moduleAt('src/lib/improvementWorkflow.ts'),analysis='[우선 개선안]\n1. 질문 검토 | 조언 질문이라 업체 추천이 목적이 아님 | 고객 목표와 질문 의도 확인 | 업체 탐색 의도 일치 | 같은 채널\n2. 질문 검토 | 중복 | 중복\n[Benchmark별 관찰]\n- 내용'
assert.equal(lib.proposals(analysis,10).length,1);assert.equal(lib.proposals(analysis,10)[0].status,'pending');assert.equal(lib.proposals('근거 없음',10).length,0)
let row={id:10,project_id:1,observed:[{measurements:[{latest:{question_id:3,channel:'Gemini'}}]}],interpreted:analysis},measurements=[],auth=true,failCAS=false
const client={auth:{getUser:async()=>({data:{user:auth?{id:'staff'}:null},error:null})},from(table){let filters=[],patch=null;const q={select(){return q},eq(k,v){filters.push([k,v]);return q},is(k,v){filters.push([k,v,'is']);return q},in(k,v){filters.push([k,v]);return q},gt(k,v){filters.push([k,v,'gt']);return q},order(){return q},limit(){return q},update(p){patch=p;return q},single(){return Promise.resolve(exec(true))},maybeSingle(){return Promise.resolve(exec(true))},then(resolve,reject){return Promise.resolve(exec(false)).then(resolve,reject)}};function exec(single){if(table==='discovery_analysis_history'){if(patch){if(failCAS||filters.some(([k,v,op])=>{if(k.startsWith('observed->')){const index=Number(k.split('->')[1]),w=row.observed[index]?.workflow;return op==='is'?!!w:String(w?.revision)!==v}return k==='observed'&&v!==JSON.stringify(row.observed)}))return{data:null,error:null};row={...row,...patch}}return{data:single?row:[row],error:null}}if(table==='discovery_measurements')return{data:measurements.filter(m=>filters.every(([k,v,op])=>op==='gt'?m[k]>v:Array.isArray(v)?v.includes(m[k]):m[k]===v)),error:null};if(table==='discovery_questions')return{data:[{id:3}],error:null};return{data:[],error:null}}return q}}
const route=moduleAt('src/app/api/discovery/improvement-workflow/route.ts',name=>name==='next/server'?{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}}:name==='next/headers'?{cookies:()=>({get:()=>({value:'token'})})}:name==='@supabase/supabase-js'?{createClient:()=>client}:name.includes('improvementWorkflow')?lib:{ensureCaseReport:async()=>({})})
const post=b=>route.POST({json:async()=>({projectId:1,sourceId:10,...b})})
;(async()=>{
 assert.equal((await post({action:'init'})).status,200);const original=JSON.stringify(row.observed[0]);let w=lib.readWorkflow(row.observed);const id=w.tasks[0].id
 assert.equal((await post({action:'update',revision:0,taskId:id,patch:{status:'approved'}})).status,409)
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'applied',application:'改'}})).status,400)
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'approved'}})).status,200);w=lib.readWorkflow(row.observed)
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'applied'}})).status,400)
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'applied',application:'목표 질문 검토 적용'}})).status,200);w=lib.readWorkflow(row.observed)
 const applied=w.tasks[0].appliedAt
 measurements=[{id:50,project_id:1,question_id:3,channel:'Other',created_at:'2099-01-01'}]
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'reviewed',outcome:'변화 없음'},measurementIds:[50]})).status,400)
 measurements=[{id:50,project_id:1,question_id:3,channel:'Gemini',created_at:'2099-01-01'}]
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'reviewed',outcome:'미발견 유지. 질문 의도와 출처를 다시 검토'},measurementIds:[50]})).status,200)
 w=lib.readWorkflow(row.observed);assert.equal(w.tasks[0].measurementIds[0],50);assert.equal(JSON.stringify(row.observed[0]),original);assert(lib.workflowReport(w.tasks).includes('미발견 유지'))
 auth=false;assert.equal((await post({action:'init'})).status,401)
 console.log('Passed: persisted lifecycle, stale revision, premature apply, required application evidence, same-channel remeasurement, original measurement preservation, report summary and staff authentication.')
})().catch(e=>{console.error(e);process.exitCode=1})
const refs=[{question_id:3,channel:'Gemini',is_discovered:false,created_at:'2026-09-01'}]
assert(lib.measurementOutcome(refs,[{question_id:3,channel:'Gemini',is_discovered:false,created_at:'2026-10-01'}]).includes('미발견 유지'))
assert(lib.measurementOutcome(refs,[{question_id:3,channel:'Gemini',is_discovered:null,created_at:'2026-10-01'}]).includes('판단 보류'))
assert(lib.measurementOutcome(refs,[{question_id:3,channel:'Gemini',is_discovered:true,created_at:'2026-10-01'}]).includes('신규 발견'))

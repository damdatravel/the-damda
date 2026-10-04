const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
function moduleAt(path,requireFn){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:requireFn||((n)=>moduleAt(require('path').resolve(require('path').dirname(path),n)+'.ts')),process:{env:{NEXT_PUBLIC_SUPABASE_URL:'url',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'pub',SUPABASE_SERVICE_ROLE_KEY:'key'}},Date,Set,Number,JSON,Object,Error});return m.exports}
const lib=moduleAt('src/lib/improvementWorkflow.ts'),analysis='[우선 개선안]\n1. 질문 검토 | 조언 질문이라 업체 추천이 목적이 아님 | 고객 목표와 질문 의도 확인 | 업체 탐색 의도 일치 | 같은 채널\n2. 질문 검토 | 중복 | 중복\n[Benchmark별 관찰]\n- 내용'
assert.equal(lib.proposals(analysis,10).length,1);assert.equal(lib.proposals(analysis,10)[0].status,'pending');assert.equal(lib.proposals('근거 없음',10).length,0)
let row={id:10,project_id:1,observed:[{measurements:[{latest:{question_id:3,channel:'Gemini'}}]}],interpreted:analysis},measurements=[],auth=true,contextChanged=false,failCAS=false,projectScope={ai_management:true,naver_management:true},naverRows=[]
const client={auth:{getUser:async()=>({data:{user:auth?{id:'staff'}:null},error:null})},from(table){let filters=[],patch=null;const q={select(){return q},eq(k,v){filters.push([k,v]);return q},is(k,v){filters.push([k,v,'is']);return q},in(k,v){filters.push([k,v]);return q},gt(k,v){filters.push([k,v,'gt']);return q},order(){return q},limit(){return q},update(p){patch=p;return q},single(){return Promise.resolve(exec(true))},maybeSingle(){return Promise.resolve(exec(true))},then(resolve,reject){return Promise.resolve(exec(false)).then(resolve,reject)}};function exec(single){if(table==='discovery_analysis_history'){if(filters.some(([k,v])=>k==='id'&&Array.isArray(v)))return{data:naverRows,error:null};if(patch){if(failCAS||filters.some(([k,v,op])=>{if(k.startsWith('observed->')){const index=Number(k.split('->')[1]),w=row.observed[index]?.workflow;return op==='is'?!!w:String(w?.revision)!==v}return k==='observed'&&v!==JSON.stringify(row.observed)}))return{data:null,error:null};row={...row,...patch}}return{data:single?row:[row],error:null}}if(table==='discovery_projects')return{data:projectScope,error:null};if(table==='discovery_measurements')return{data:measurements.filter(m=>filters.every(([k,v,op])=>op==='gt'?m[k]>v:Array.isArray(v)?v.includes(m[k]):m[k]===v)),error:null};if(table==='discovery_questions')return{data:[{id:3}],error:null};return{data:[],error:null}}return q}}
const route=moduleAt('src/app/api/discovery/improvement-workflow/route.ts',name=>name==='next/server'?{NextResponse:{json:(body,opts)=>({body,status:opts?.status||200})}}:name==='next/headers'?{cookies:()=>({get:()=>({value:'token'})})}:name==='@supabase/supabase-js'?{createClient:()=>client}:name.includes('contextStore')?{projectContext:async()=>({})}:name.includes('contextVersion')?{contextImpact:()=>({status:contextChanged?'changed':'current',changed:[],message:'legacy'})}:name.includes('discovery/evidence')?moduleAt('src/lib/discovery/evidence.ts'):name.includes('improvementWorkflow')?lib:name.includes('workPlan')?moduleAt('src/lib/workPlan.ts'):{ensureCaseReport:async()=>({})})
const post=b=>route.POST({json:async()=>({projectId:1,sourceId:10,...b})})
;(async()=>{
 assert.equal((await post({action:'init'})).status,200);const original=JSON.stringify(row.observed[0]);let w=lib.readWorkflow(row.observed);const id=w.tasks[0].id
 assert.equal((await post({action:'update',revision:0,taskId:id,patch:{status:'approved'}})).status,409)
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'applied',application:'改'}})).status,400)
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'approved'}})).status,200);w=lib.readWorkflow(row.observed)
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{reviewNote:'서비스 범위 확인. 대상 고객 표현 수정 요청'}})).status,200);w=lib.readWorkflow(row.observed);assert.equal(w.tasks[0].reviewNote,'서비스 범위 확인. 대상 고객 표현 수정 요청');assert.equal(w.tasks[0].status,'approved');assert.equal(w.tasks[0].appliedAt,null)

 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{draft:'검토된 수정안',generationContext:{}}})).status,200);w=lib.readWorkflow(row.observed)
 contextChanged=true
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'applied',application:'적용 시도'}})).status,409)
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{draft:'변경 중 초안',generationContext:{}}})).status,409)
 assert.equal(lib.readWorkflow(row.observed).revision,w.revision);assert.equal(JSON.stringify(row.observed[0]),original)
 contextChanged=false
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'applied'}})).status,400)
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'applied',application:'목표 질문 검토 적용'}})).status,200);w=lib.readWorkflow(row.observed)
 const applied=w.tasks[0].appliedAt
 measurements=[{id:50,project_id:1,question_id:3,channel:'Other',created_at:'2099-01-01'}]
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'reviewed',outcome:'변화 없음'},measurementIds:[50]})).status,400)
 measurements=[{id:50,project_id:1,question_id:3,channel:'Gemini',created_at:'2099-01-01'}]
 assert.equal((await post({action:'update',revision:w.revision,taskId:id,patch:{status:'reviewed',outcome:'미발견 유지. 질문 의도와 출처를 다시 검토'},measurementIds:[50]})).status,200)
 w=lib.readWorkflow(row.observed);assert.equal(w.tasks[0].measurementIds[0],50);assert.equal(JSON.stringify(row.observed[0]),original);assert(lib.workflowReport(w.tasks).includes('미발견 유지'))
 auth=false;assert.equal((await post({action:'init'})).status,401)
 auth=true;projectScope={ai_management:false,naver_management:true};row={id:20,project_id:1,measurement_round:'Naver',observed:[{query:'업체 추천',checkedAt:'2026-10-01',results:[{channel:'블로그',items:[]}]}],interpreted:'[우선 개선 제안]\n1. 블로그 근거 검토 | 설명이 일부 미확인 | 공식 계정 확인 | 정보 확인 | 같은 검색어\n[해석 범위]'}
 assert.equal((await post({sourceId:20,action:'init'})).status,200);w=lib.readWorkflow(row.observed);const nid=w.tasks[0].id
 assert.equal((await post({sourceId:20,action:'update',revision:w.revision,taskId:nid,patch:{status:'approved'}})).status,200);w=lib.readWorkflow(row.observed)
 assert.equal((await post({sourceId:20,action:'update',revision:w.revision,taskId:nid,patch:{draft:'근거 부족',assessment:{status:'needs_evidence',reason:'공식 계정 확인 필요'}}})).status,200);w=lib.readWorkflow(row.observed)
 assert.equal((await post({sourceId:20,action:'update',revision:w.revision,taskId:nid,patch:{status:'applied',application:'블로그'}})).status,409)
 assert.equal((await post({sourceId:20,action:'update',revision:w.revision,taskId:nid,patch:{draft:'확인 후 수정안',assessment:{status:'ready',reason:'기존 내용 비교'}}})).status,200);w=lib.readWorkflow(row.observed)
 assert.equal((await post({sourceId:20,action:'update',revision:w.revision,taskId:nid,patch:{status:'applied',application:'확인된 문구 보강 URL'}})).status,200);w=lib.readWorkflow(row.observed)
 naverRows=[{id:21,observed:[{query:'다른 검색어',checkedAt:'2099-01-01',results:[{channel:'블로그',items:[]}]}]}]
 assert.equal((await post({sourceId:20,action:'update',revision:w.revision,taskId:nid,patch:{status:'reviewed',outcome:'출처 비교'},measurementIds:[21]})).status,400)
 naverRows[0].observed[0].query='업체 추천'
 assert.equal((await post({sourceId:20,action:'update',revision:w.revision,taskId:nid,patch:{status:'reviewed',outcome:'출처 비교'},measurementIds:[21]})).status,200)
 assert.equal(lib.readWorkflow(row.observed).tasks[0].naverHistoryIds[0],21)
 projectScope={ai_management:true,naver_management:false};assert.equal((await post({sourceId:20,action:'init'})).status,409)
 console.log('Passed: persisted lifecycle, stale revision, premature apply, required application evidence, same-channel remeasurement, original measurement preservation, report summary and staff authentication.')
})().catch(e=>{console.error(e);process.exitCode=1})
const refs=[{question_id:3,channel:'Gemini',is_discovered:false,created_at:'2026-09-01'}]
assert(lib.measurementOutcome(refs,[{question_id:3,channel:'Gemini',is_discovered:false,created_at:'2026-10-01'}]).includes('미발견 유지'))
assert(lib.measurementOutcome(refs,[{question_id:3,channel:'Gemini',is_discovered:null,created_at:'2026-10-01'}]).includes('판단 보류'))
assert(lib.measurementOutcome(refs,[{question_id:3,channel:'Gemini',is_discovered:true,created_at:'2026-10-01'}]).includes('신규 발견'))

const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm')
function load(file,imports,extra={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require:n=>imports[n]||require(n),Date,Number,JSON,Error,...extra});return m.exports}
const shared=load('src/lib/engagement.ts',{}),fact={id:'f1',goalId:'g1',label:'지역',value:'서울',source:'직원 내부 메모',reason:'지역 확인',review:'pending'},state={facts:[fact],goals:[],request:{id:'request',expiresAt:new Date(Date.now()+86400000).toISOString(),facts:[fact],goals:[],answeredAt:null},responses:[],events:[]};let status='proposal',saved=false,lastArgs
const db={from(table){return{select(){return this},eq(){return this},maybeSingle:async()=>({data:{document:state,inquiry_id:1}}),single:async()=>({data:{status}})}},rpc:async(name,args)=>{saved=true;lastArgs=args;return{data:true}}}
const r=load('src/app/api/client/confirm/[token]/route.ts',{'next/server':{NextResponse:{json:(body,o)=>({body,status:o?.status||200})}},'@supabase/supabase-js':{createClient:()=>db},'../../../../../lib/engagement':shared},{process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://test.invalid',SUPABASE_SERVICE_ROLE_KEY:'server'}}})
const token='a'.repeat(43),answers=[{id:'f1',status:'corrected',value:' 인천 ',internal_notes:'not allowed'}]
async function call(body={requestId:'request',answers},t=token){return r.POST({text:async()=>JSON.stringify(body)},{params:{token:t}})}
;(async()=>{
 assert.equal((await call(undefined,'invalid')).status,404)
 assert.equal((await call({requestId:'request',answers:[]})).status,400)
 assert.equal((await call({requestId:'old',answers})).status,409)
 assert.equal(saved,false)
 status='closed';assert.equal((await call()).status,404);status='proposal'
 state.request.answeredAt='done';assert.equal((await call()).status,409);state.request.answeredAt=null
 assert.equal((await call()).status,200);assert.equal(saved,true);assert.equal(lastArgs.answers[0].value,'인천');assert.equal(lastArgs.answers[0].internal_notes,undefined)
 console.log('Passed: scoped public submission, changed-request/replay/closed-case rejection, validation and answer sanitization.')
})().catch(err=>{console.error(err);process.exitCode=1})

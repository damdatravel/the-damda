const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm')
function load(file,imports={}){const module={exports:{}};const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;vm.runInNewContext(js,{module,exports:module.exports,require:n=>imports[n]||require(n),fetch,Date,Number,Error,process:{env:{NEXT_PUBLIC_SUPABASE_URL:"https://example.test",SUPABASE_SERVICE_ROLE_KEY:"server",NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"public"}}});return module.exports}
const shared=load('src/lib/caseReportDocument.ts')
assert.equal(shared.validClosure({reason:'예산·가격',customerStatement:'',analysis:'  ',followUp:''}),false)
assert.equal(shared.validClosure({reason:'예산·가격',customerStatement:'예산 없음',analysis:'범위를 조정해 재제안',followUp:''}),true)
assert.equal(shared.validClosure({reason:'가짜 사유',customerStatement:'',analysis:'검토',followUp:''}),false)
assert.equal(shared.validCustomerReport({...shared.reportFromBaseline({}),findings:[42]}),false)
const state={project_id:9,status:'contracted'},row={draft:shared.reportFromBaseline({summary:'상담 내용',proposal:'다음 계획'}),published:null};let signedIn=true
const db={auth:{getUser:async()=>({data:{user:signedIn?{id:'staff'}:null}})},from(table){let patch;return{select(){return this},eq(){return this},maybeSingle:async()=>({data:state}),update(p){patch=p;return this},single:async()=>{Object.assign(row,patch);return{data:row}}}}}
const route=load('src/app/api/discovery/inquiries/[id]/customer-report/route.ts',{
 '../../../../../../lib/caseReportDocument':shared,'../../../../../../lib/caseReport':{ensureCaseReport:async()=>row},'next/server':{NextResponse:{json:(body,o)=>({body,status:o?.status||200})}},'next/headers':{cookies:()=>({get:()=>({value:'token'})})},'@supabase/supabase-js':{createClient:()=>db}
})
async function call(action,document=row.draft){return route.POST({json:async()=>({action,document})},{params:{id:'1'}})}
;(async()=>{
 signedIn=false;assert.equal((await call('publish')).status,401);signedIn=true
 state.project_id=null;assert.equal((await call('publish')).status,409);state.project_id=9
 assert.equal((await call('publish')).status,200);const published=row.published
 assert.equal((await call('save',{...row.draft,summary:'공개 전 초안'})).status,200)
 assert.equal(row.published,published);assert.equal(row.published.summary,'상담 내용')
 assert.equal((await call('publish',{...row.draft,summary:''})).status,400)
 assert.equal((await call('unpublish')).status,200);assert.equal(row.published,null)
 console.log('Passed: closure validation, staff-only access, contract gate, publish isolation, withdrawal.')
})().catch(e=>{console.error(e);process.exitCode=1})

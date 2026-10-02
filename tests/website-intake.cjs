const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
const transpile=p=>ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText
const pm={exports:{}};vm.runInNewContext(transpile('src/lib/websitePlatform.ts'),{module:pm,exports:pm.exports,URL})
let inserted
const db={auth:{getUser:async()=>({data:{user:{id:'staff'}}})},from:table=>({insert:payload=>{if(table==='discovery_inquiries')inserted=payload;return table==='discovery_inquiries'?{select:()=>({single:async()=>({data:{id:1}})})}:Promise.resolve({error:null})}})}
const m={exports:{}}
vm.runInNewContext(transpile('src/app/api/discovery/inquiries/route.ts'),{module:m,exports:m.exports,URL,process:{env:{NEXT_PUBLIC_SUPABASE_URL:'x',SUPABASE_SERVICE_ROLE_KEY:'x',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'x'}},require:name=>name.includes('websitePlatform')?pm.exports:name.includes('engagement')?{validSearchGoal:()=>true,cleanSearchGoal:x=>x}:name==='next/server'?{NextResponse:{json:(data,options)=>({data,status:options?.status||200})}}:name==='next/headers'?{cookies:()=>({get:()=>({value:'staff'})})}:name==='@supabase/supabase-js'?{createClient:()=>db}:name.includes('websiteTransfer')?{readWebsiteTransfer:()=>null}:name==='node:crypto'?{randomBytes:()=>({toString:()=> 'token'})}:null})
const input={company_name:'업체',website_url:'',contact_name:'담당자',phone:'',email:'',industry:'',main_services:'',message:'',ai:true,naver:false}
;(async()=>{
 assert.equal((await m.exports.POST({json:async()=>input})).status,400)
 assert.equal((await m.exports.POST({json:async()=>({...input,website_context:{status:'planning'}})})).status,200)
 assert.equal(inserted.website_url,'');assert.equal(inserted.website_context.status,'planning')
 assert.equal((await m.exports.POST({json:async()=>({...input,website_context:{status:'existing'}})})).status,400)
 assert.equal((await m.exports.POST({json:async()=>({...input,website_context:{status:'building'}})})).status,200)
 assert.equal((await m.exports.POST({json:async()=>({...input,website_url:'https://company.example',website_context:{status:'existing'}})})).status,200)
 console.log('Passed: missing URL rejected for existing sites, planning/building accepted without URL, existing URL retained.')
})().catch(e=>{console.error(e);process.exitCode=1})

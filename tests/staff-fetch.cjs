const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
function load(fetch){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/staffFetch.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,fetch});return m.exports.staffFetch}
;(async()=>{
 const calls=[],body=JSON.stringify({analysis:'completed draft'});let n=0
 const request=load(async(url,init)=>{calls.push([url,init]);if(url==='/api/staff/refresh')return {ok:true};return {status:++n===1?401:200}})
 assert.equal((await request('/save',{method:'POST',body})).status,200)
 assert.deepEqual(calls.map(x=>x[0]),['/save','/api/staff/refresh','/save']);assert.equal(calls[2][1].body,body)
 let count=0;const failed=load(async url=>{count++;return url==='/api/staff/refresh'?{ok:false}:{status:401}})
 assert.equal((await failed('/save')).status,401);assert.equal(count,2)
 count=0;const serverError=load(async()=>{count++;return {status:500}})
 assert.equal((await serverError('/save')).status,500);assert.equal(count,1)
 console.log('Passed: refresh and retry identical save request; failed refresh retains 401; no retry on ambiguous server failures.')
})().catch(e=>{console.error(e);process.exitCode=1})

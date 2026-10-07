const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
const fixed='2026-09-16T01:00:00Z',RealDate=Date
class Clock extends RealDate{constructor(...args){super(...(args.length?args:[fixed]))}}
function load(path,require){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require,Intl,Date:Clock});return m.exports}
const cycle=load('src/lib/discovery/measurementCycle.ts')
const {measurementGate}=load('src/lib/discovery/measurementGate.ts',()=>cycle)
const result={data:[{created_at:'2026-09-13T01:00:00Z'}],error:null}
const query={select(){return this},eq(){return this},order(){return this},limit(){return Promise.resolve(result)}}
;(async()=>{
 const added=await measurementGate({from:()=>query},1,null)
 assert.equal(added.blocked,true);assert.equal(added.reuse,false);assert.equal(added.cycle.next,'2026-09-28')
 const previous=await measurementGate({from:()=>query},1,{created_at:'2026-09-15T01:00:00Z'})
 assert.equal(previous.reuse,true)
 result.error={message:'DB unavailable'}
 await assert.rejects(()=>measurementGate({from:()=>query},1,null),/기준일 조회 실패/)
 console.log('Passed: defer new channels, reuse current round, fail closed when anchor cannot be read.')
})().catch(e=>{console.error(e);process.exitCode=1})

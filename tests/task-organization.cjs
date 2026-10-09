const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
function load(path,req){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:req,Map,Set,Number,Object,JSON});return m.exports}
const l=load('src/lib/discovery/taskOrganization.ts'),sig=load('src/lib/discovery/taskOrganizationSignature.ts',n=>require(n))
const c=[1,2,3,4].map(i=>({key:l.taskKey(1,'t'+i),scope:i===4?'naver':'ai',title:'작업'+i,action:'변경'+i,reason:'근거',references:[]}))
const group=(members,relevance='relevant',priority=1)=>({title:'검토 묶음',reason:'같은 작업의 원본 비교',members,relevance,priority})
const groups=[group([c[0].key,c[1].key]),group([c[2].key],'verify'),group([c[3].key],'later')]
assert(l.validTaskGroups(groups,c));assert.equal(l.priorityGroups(groups).length,1)
assert(!l.validTaskGroups(groups.slice(0,2),c));assert(!l.validTaskGroups([...groups,group([c[0].key])],c));assert(!l.validTaskGroups([group(c.map(x=>x.key))],c));assert(!l.validTaskGroups([group(['invented'])],c));assert(!l.validTaskGroups([{...groups[0],priority:0},...groups.slice(1)],c))
assert.equal(l.priorityGroups(Array(5).fill(group([c[0].key]))).length,3)
const a=sig.organizationSignature({id:1},{questions:[1]},c,{goal:'a'});assert.notEqual(a,sig.organizationSignature({id:2},{questions:[1]},c,{goal:'a'}));assert.notEqual(a,sig.organizationSignature({id:1},{questions:[1]},c.slice(1),{goal:'a'}));assert.notEqual(a,sig.organizationSignature({id:1},{questions:[1]},c,{goal:'b'}))
console.log('Passed: complete one-time source membership, no invented/cross-scope groups, top-three relevant candidates, invalidation after goal/status/input changes.')

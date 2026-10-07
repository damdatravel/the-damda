const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/discovery/taskDuplicates.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports})
const {sameTask}=m.exports,a={title:'FAQ 보강',action:'배송 요금 안내를 추가',reason:'요금 누락',status:'pending'}
assert.equal(sameTask(a,{...a,title:'FAQ  보강',action:'배송 요금 안내를 추가.'}),true)
assert.equal(sameTask(a,{...a,action:'취소 요금 안내를 추가'}),false)
assert.equal(sameTask(a,{...a,title:'다른 작업'}),false)
assert.equal(sameTask(a,{...a,status:'reviewed',reason:'개선 후 다시 누락'}),false)
assert.equal(sameTask({...a,selectionKey:'a'},{...a,selectionKey:'b'}),false)
console.log('Passed: repeated work deduplication, different actions preserved, completed-work recurrence preserved, journey isolation.')

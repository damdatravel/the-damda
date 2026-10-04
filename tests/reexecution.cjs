const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/discovery/reexecution.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,require,JSON,Date,Error});const lib=m.exports
const context={parts:{goal:'a',questions:'b'}},key=lib.runKey(1,context),first=lib.reserveRun([],key,false);assert.equal(first.run.attempt,1)
assert.throws(()=>lib.reserveRun(first.runs,key,false),/이미 실행/)
const failed={...first.run,status:'failed'};assert.throws(()=>lib.reserveRun([failed],key,false),/재시도/);assert.equal(lib.reserveRun([failed],key,true).run.attempt,2)
assert.throws(()=>lib.reserveRun([{...failed,attempt:3}],key,true),/3회/)
const done={...first.run,status:'completed',resultId:99};assert.equal(lib.reserveRun([done],key,true).reused.resultId,99)
assert.notEqual(lib.runKey(2,context),key);assert.notEqual(lib.runKey(1,{parts:{goal:'changed',questions:'b'}}),key)
console.log('Passed: source/context isolation, duplicate running rejection, completed reuse, explicit retry and bounded attempts')

const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/discovery/evidence.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{module:m,exports:m.exports,JSON,Array});const e=m.exports
const original=[{question:'original',measurements:[{latest:{question_id:3,channel:'Gemini',result_text:'answer'}}]},{kind:'improvement-workflow',workflow:{revision:1,tasks:[]}}]
const snapshot=JSON.stringify(original),copy=e.originalEvidence(original);copy[0].measurements[0].latest.result_text='changed';assert.equal(JSON.stringify(original),snapshot)
const refs=e.measurementReferences(original);refs[0].channel='changed';assert.equal(JSON.stringify(original),snapshot)
assert.equal(e.measurementReferences(original)[0].channel,'Gemini');assert.equal(e.originalEvidence(null).length,0)
const envelope={kind:'improvement-workflow',workflow:{revision:2,tasks:[]}},saved=e.attachWorkflow(original,envelope);envelope.workflow.revision=99;assert.equal(saved[1].workflow.revision,2);assert.equal(saved.length,2);assert.equal(JSON.stringify(original),snapshot);assert.equal(saved[0].measurements[0].latest.result_text,'answer')
console.log('Passed: original evidence isolation, derived reference isolation, workflow replacement without raw measurement mutation')

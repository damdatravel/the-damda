const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm'),m={exports:{}}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/discovery/measurementCycle.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,Intl,Date})
const {measurementCycle,cycleSchedule,inCycle}=m.exports
const dates=['2026-09-13T01:00:00Z','2026-09-15T01:00:00Z']
assert.equal(measurementCycle(dates,'2026-09-16T01:00:00Z').next,'2026-09-28')
assert.equal(measurementCycle(dates,'2026-09-16T01:00:00Z').due,false)
assert.equal(measurementCycle(dates,'2026-09-28T01:00:00Z').due,true)
assert.equal(measurementCycle(dates,'2026-09-28T01:00:00Z').round,2)
assert.equal(measurementCycle([...dates,'2026-09-27T01:00:00Z'],'2026-09-28T01:00:00Z').base,'2026-09-13')
assert.equal(measurementCycle(dates,'2026-09-27T15:00:00Z').due,true) // Seoul midnight
assert.equal(inCycle('2026-09-15T01:00:00Z',measurementCycle(dates,'2026-09-28T01:00:00Z')),false)
assert.equal(inCycle('2026-09-28T01:00:00Z',measurementCycle(dates,'2026-09-29T01:00:00Z')),true)
assert.equal(cycleSchedule(dates,'2027-03-01T01:00:00Z')[0].date>='2027-03-01',true)
assert.equal(cycleSchedule([]).length,0)
assert.equal(measurementCycle([],'2026-09-13T01:00:00Z').due,true)
console.log('Passed: common anchor, deferred new channels, 15-day cadence, Seoul boundary, round isolation, long-running schedules.')
const row=(id,channel,date,question_id=1)=>({id,question_id,channel,created_at:date})
const cycle=measurementCycle(dates,'2026-09-28T01:00:00Z')
const latest=m.exports.cycleMeasurements([row(1,'OpenAI','2026-09-13'),row(2,'Gemini','2026-09-15'),row(3,'OpenAI','2026-09-28T02:00:00Z'),row(4,'OpenAI','2026-09-28T03:00:00Z'),row(5,'Meta','2026-09-28T03:00:00Z'),row(6,'OpenAI','2026-09-28T03:00:00Z',2)],cycle)
assert.equal(latest.size,3);assert.equal(latest.get('1:OpenAI').id,4);assert.equal(latest.has('1:Gemini'),false);assert.equal(latest.get('1:Meta').id,5)
console.log('Passed: latest per question/channel, Meta included, previous-round Gemini excluded rather than reported as missing discovery.')

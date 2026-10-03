const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm'),m={exports:{}}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/measurementComparison.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports})
const q=[{id:1,question:'질문'},{id:2,question:'다른 질문'}]
const row=(id,channel,round,found,date,question_id=1)=>({id,question_id,channel,measurement_round:round,is_discovered:found,created_at:date})
const records=[row(1,'Gemini','Day 0',false,'2026-09-01'),row(2,'Gemini','Day 0',true,'2026-09-02'),row(3,'Gemini','Day 7',true,'2026-09-08'),row(4,'OpenAI','Day 0',true,'2026-09-01'),row(5,'Naver','Day 7',true,'2026-09-08'),row(6,'Manual','Day 0',null,'2026-09-01'),row(7,'Manual','Day 7',true,'2026-09-08'),row(8,'Other','Day 0',true,'2026-09-01'),row(9,'Other','Day 7',false,'2026-09-08'),row(10,'Gemini','Day 7',false,'2026-09-09',2)]
const result=m.exports.compareMeasurements(q,records.reverse()),find=c=>result[0].measurements.find(x=>x.channel===c)
assert.equal(find('Gemini').baseline.id,1);assert.equal(find('Gemini').latest.id,3);assert.equal(find('Gemini').change,'신규 발견')
assert.equal(find('OpenAI').change,'재측정 대기');assert.equal(find('Naver').change,'기준 측정 없음');assert.equal(find('Manual').change,'판단 보류');assert.equal(find('Other').change,'미발견으로 변화');assert.equal(result[1].measurements[0].comparable,false)
console.log('Passed: earliest baseline, latest measurement, channel/question isolation, missing baseline, missing remeasurement, unknown verdict, lost discovery.')

const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
function load(path,req){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:req,Date,Intl,Map,Set,JSON,Number,Object});return m.exports}
const same=load('src/lib/questionReview.ts'),cycle=load('src/lib/discovery/measurementCycle.ts'),g=load('src/lib/discovery/goalProgress.ts',n=>n.includes('questionReview')?same:cycle)
const current={goalId:'g1',inquiryId:1,searchGoal:{service:'배송'},criteria:{status:'active',priorityDiscussion:{agreed:true}}},binding={goalSnapshot:current,linkedAt:'2026-10-01T03:00:00Z',questions:[{id:1,question:'배송 추천해줘?'}]},q=[{id:1,question:'배송 추천해줘?',is_benchmark:true}],now='2026-10-09T03:00:00Z'
assert(g.confirmedGoal(current));assert(!g.confirmedGoal({...current,criteria:{status:'draft'}}));assert(g.validQuestionLinks([1,2,3,4,5]));assert(!g.validQuestionLinks([1,2,3,4,5,6]));assert(!g.validQuestionLinks([1,1]));assert(!g.validQuestionLinks([-1]))
const m=[{id:1,question_id:1,channel:'Gemini',created_at:'2026-10-01T02:00:00Z',is_discovered:true},{id:2,question_id:1,channel:'Gemini',created_at:'2026-10-02T03:00:00Z',is_discovered:false},{id:3,question_id:1,channel:'OpenAI API',created_at:'2026-10-03T03:00:00Z',is_discovered:true}]
const j=[{createdAt:'2026-10-02T04:00:00Z',journey:{goalSnapshot:current}},{createdAt:'2026-10-02T04:00:00Z',journey:{}},{createdAt:'2026-09-02T04:00:00Z',journey:{goalSnapshot:current}}]
let r=g.goalEvidence(binding,current,q,m,j,['2026-10-01T02:00:00Z'],now);assert.equal(r.measurements.size,2);assert.equal(r.measurements.get('1:Gemini').id,2);assert.equal(r.journeys.length,1)
assert(g.goalEvidence(binding,{...current,goalId:'g2'},q,m,j,[],now).stale)
assert.equal(g.goalEvidence(binding,current,[{...q[0],question:'변경된 질문?'}],m,j,[],now).measurements.size,0)
assert.equal(g.goalEvidence(binding,current,[{...q[0],is_benchmark:false}],m,j,[],now).measurements.size,0)
console.log('Passed: agreed active goal, bounded project question links, no pre-link/stale/unlinked evidence, exact question preservation, current cycle and separate channels.')

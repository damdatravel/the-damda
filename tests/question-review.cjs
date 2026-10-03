const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm'),m={exports:{}}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/questionReview.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports})
const {validAssessments}=m.exports,checks={goal:'목표 관련',naturalness:'자연스러움',facts:'확정 사실 확인',duplicates:'중복 없음',measurement:'측정 가능'},a={key:'q1',decision:'recommend',reason:'목표와 관련 있음',suggestedQuestion:'',checks}
assert(validAssessments([a],['q1']));assert(!validAssessments([a,a],['q1','q2']));assert(!validAssessments([{...a,key:'other'}],['q1']));assert(!validAssessments([],['q1']));assert(!validAssessments([{...a,decision:'revise'}],['q1']));assert(validAssessments([{...a,decision:'revise',suggestedQuestion:'공항에서 호텔로 짐을 보내는 방법은?'}],['q1']));assert(!validAssessments([{...a,checks:{}}],['q1']));assert(validAssessments([{...a,decision:'verify'}],['q1']));console.log('Passed: complete review coverage, duplicate/unknown key rejection, revision question validation, required reasons, fact-check decision.')
const {validStaffDecisions,sameGoalSnapshot}=m.exports
assert(validStaffDecisions([{key:'q1',selected:true,reason:''}],[{key:'q1'}],[a]))
assert(!validStaffDecisions([{key:'q1',selected:true,reason:''}],[{key:'q1'}],[{...a,decision:'exclude'}]))
assert(validStaffDecisions([{key:'q1',selected:true,reason:'실제 고객 상황을 확인함'}],[{key:'q1'}],[{...a,decision:'verify'}]))
assert(validStaffDecisions([{key:'q1',selected:false,reason:''}],[{key:'q1'}],[a]))
assert(!validStaffDecisions([{key:'q1',selected:false,reason:''},{key:'q1',selected:true,reason:''}],[{key:'q1'},{key:'q2'}],[a]))
assert(sameGoalSnapshot({criteria:{status:'active'},goalId:'a'},{goalId:'a',criteria:{status:'active'}}))
assert(!sameGoalSnapshot({goalId:'a'},{goalId:'b'}))
assert(!sameGoalSnapshot({goalId:'a',searchGoal:{service:'배송'}},{goalId:'a',searchGoal:{service:'보관'}}))
console.log('Passed: complete staff selection coverage, override reason requirement, unselected preservation, goal snapshot ordering and changed goal rejection.')

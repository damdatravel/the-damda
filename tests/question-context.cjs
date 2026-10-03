const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm'),m={exports:{}}
vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/questionContext.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports})
const {contextIssue,partitionDimensions,sameQuestion}=m.exports
const d=(id,type,value,source='website',evidence=value)=>({id,dimension_type:type,dimension_value:value,source,notes:'AI Source Profile · 근거: '+evidence})
assert(contextIssue(d(1,'PURPOSE','현재 상태를 먼저 진단하고 싶음','inquiry'),['캐리어 배송']))
assert(contextIssue(d(2,'ACTION','자세한 안내를 요청함','inquiry','자세히 알려주세요.'),['캐리어 배송']))
assert.equal(contextIssue(d(3,'PROBLEM','검색 유입이 적음'),[]),null) // Marketing site's actual consumer problem remains valid.
assert.equal(contextIssue(d(4,'WHERE','서울','inquiry'),['서울']),null) // Confirmed business fact.
assert(contextIssue(d(5,'SERVICE','어디서든 어디로든 짐을 옮기는 서비스'),[]))
assert.equal(contextIssue(d(6,'SERVICE','수거 서비스'),[]),null)
const result=partitionDimensions([d(1,'WHEN','당일'),d(2,'WHEN','당 일'),d(3,'WHERE','당일')],[])
assert.equal(result.usable.length,2);assert.equal(result.excluded.length,1)
assert(sameQuestion('공항에서 호텔로 짐을 보내나요?','공항에서  호텔로 짐을 보내나요？'))
assert(!sameQuestion('공항에서 호텔로 짐을 보내나요?','호텔에서 공항으로 짐을 보내나요?'))
console.log('Passed: consultation intent isolation, confirmed business evidence, marketing business retention, slogan rejection, conservative material/question deduplication.')

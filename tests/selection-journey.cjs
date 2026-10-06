const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/discovery/selectionJourney.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,URL,JSON,Object});const l=m.exports
const steps=l.journeyQuestions('서비스 A');assert.equal(steps.length,4);steps.forEach(s=>s.answer='서비스 A를 추천합니다. 공식 자료 확인은 필요합니다.')
let j={version:1,target:'서비스 A',channel:'ChatGPT',conditions:'처음 이용',steps,reviewed:false};assert(l.validateJourney(j))
j.steps[0].verdicts.recommendation={value:true,evidence:'서비스 A를 추천합니다.'};assert(l.validateJourney(j))
j.steps[1].verdicts.recommendation={value:false,evidence:'해당 조건에서는 다른 서비스를 제안함'};assert(l.journeyTransitions(j).some(x=>x.includes('추천 후보 포함')));assert(l.journeySummary(j).includes('대화 단계별 변화'))
j.steps[0].verdicts.mention={value:true,evidence:'조작된 인용'};assert(!l.validateJourney(j));j.steps[0].verdicts.mention={value:null,evidence:''}
j.steps[0].urls=['javascript:alert(1)'];assert(!l.validateJourney(j));j.steps[0].urls=['https://example.com'];assert(l.validateJourney(j))
assert(!l.validateJourney({...j,steps:Array(7).fill(j.steps[0])}));assert(!l.validateJourney({...j,channel:'OpenAI Web Search API'}));assert(!l.validateJourney({...j,steps:[{...j.steps[0],stage:'toString'}]}));assert(!l.validateJourney({...j,steps:[{...j.steps[0],answer:''}]}))
console.log('Passed: ordered product/service journey, separate outcomes, uncertainty, exact positive quotes, unsafe URL/stage rejection and bounded turns')

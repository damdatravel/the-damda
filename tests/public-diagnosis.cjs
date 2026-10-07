const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
function load(file,extra={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,require,URL,Buffer,AbortSignal,...extra});return m.exports}
const s=load('src/lib/publicDiagnosis.ts')
const result=s.summarizeDiagnosis({pages:[{title:'서비스',description:'설명',h1:'제목',hasFaq:true},{title:'',description:'',h1:''},{error:'실패'}],sitemapFound:false})
assert.match(result.summary,/2개/);assert.match(result.findings[0],/제목 누락 1개/);assert.match(result.notice,/별도 측정/);assert.equal(result.priorities.length,3)
const contextual=s.summarizeDiagnosis({pages:[{title:'서비스',description:'안내',h1:'설명'}],sitemapFound:true,intakeContext:{search_goal:{service:'야외 저녁 웨딩',situation:'야외에서 결혼식을 준비할 때'}}})
assert.match(contextual.priorities[0],/고객이 먼저 알리고 싶은 서비스/);assert.match(contextual.priorities[1],/검토할 고객 검색 상황/);assert.match(contextual.priorities[2],/본 상담에서 확인/);assert.equal(contextual.findings.length,3)
let calls=0
const p=load('src/lib/publicWebsiteFetch.ts',{fetch:async()=>{calls++;return {status:302,headers:new Headers({location:'http://127.0.0.1/admin'}),body:{cancel:async()=>{}}}},Headers})
for(const ip of ['127.0.0.1','10.0.0.1','192.168.1.2','169.254.169.254','172.16.0.1','100.64.0.1','::1','::ffff:127.0.0.1','fd00::1'])assert(p.privateAddress(ip),ip)
assert(!p.privateAddress('8.8.8.8'))
;(async()=>{await assert.rejects(p.assertPublicWebsite(new URL('http://user:password@8.8.8.8')));await assert.rejects(p.publicWebsiteFetch('http://8.8.8.8'));assert.equal(calls,1);console.log('Passed: partial-page summary, scoped findings, private networks, credential URLs, private redirect rejection.')})().catch(e=>{console.error(e);process.exitCode=1})

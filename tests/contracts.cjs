const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict')
function moduleAt(file,require){const box={exports:{},require,Buffer,process,Date,JSON,Intl};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,box);return box.exports}
const quote=moduleAt('src/lib/quotation.ts',()=>{}),doc=moduleAt('src/lib/contractDocument.ts',()=>quote)
const presentation=moduleAt('src/lib/contractPresentation.ts',()=>quote)
const contracts=moduleAt('src/lib/discovery/contracts.ts',name=>name==='node:crypto'?require('node:crypto'):name==='../quotation'?quote:name==='../contractDocument'?doc:name==='../contractPresentation'?presentation:name==='../consultingSms'?{cleanPhone:v=>/^010\d{8}$/.test(v.replace(/\D/g,''))?v.replace(/\D/g,''):''}:name==='next/headers'?{cookies:()=>({get:()=>null})}:{createClient:()=>{throw Error('Unexpected DB call')}})
assert.equal(contracts.contractHash({z:1,a:{c:2,b:3}}),contracts.contractHash({a:{b:3,c:2},z:1}))
assert.notEqual(contracts.contractHash([1,2]),contracts.contractHash([2,1]))
assert(!contracts.validSignature('data:image/svg+xml;base64,PHN2Zz4='))
assert(!contracts.validSignature('data:image/png;base64,'+Buffer.alloc(120).toString('base64')))
assert(!contracts.validSignature('data:image/png;base64,'+'A'.repeat(230000)))
const q={number:'Q1',date:'2026-10-12',customer:'고객',phone:'01012345678',email:'customer@example.com',ai:true,naver:false,vat:true,status:'draft',websites:1,queries:3,months:2,startDate:'2026-10-20',channels:[],scope:'블로그 4건, 고객 자료로 제작하고 발행 전 검토',payment:'매월 선납',cooperation:'자료 및 사실 확인',lines:[{name:'월 관리',kind:'monthly',quantity:1,price:100000}]}
for(const k of ['validUntil','contact','website','situation','priorities','purpose','frequency','reportFrequency','consultation','notes'])q[k]=''
const d={customerType:'corporate',businessNumber:'1234567890',representative:'대표',signer:'담당자',position:'팀장',authority:'delegate',authorityEvidence:'대표자 이메일 위임 확인',publishing:false,media:'',usage:'',revenue:'',afterEnd:'',termination:'종료 15일 전 통보. 완료 작업 차감 후 미집행 예산 반환.',authentication:'basic',sealPreview:false};q.contractDraft=d
assert.equal(contracts.contractIssues(q).length,0)
assert(contracts.contractIssues({...q,contractDraft:{...d,authentication:'identity'}}).length)
assert(contracts.contractIssues({...q,contractDraft:{...d,authorityEvidence:''}}).length)
assert(contracts.contractIssues({...q,contractDraft:{...d,publishing:true}}).length)
assert(contracts.contractIssues({...q,scope:'조건을 작성하세요.'}).length)
const text=doc.contractText(q);assert(text.includes('220,000원'));assert(text.includes('명의 본인 확인'));assert(text.includes('권한'))
const row={id:'test',status:'signed',snapshot:{text:'<script>alert(1)</script>',quote:q,seal:null},snapshot_hash:'hash',signature_data:'data:image/svg+xml;base64,PHN2Zz4=',provider_approved_at:'now',signed_at:'later'}
const html=contracts.contractHtml(row);assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));assert(!html.includes('image/svg+xml'))
console.log('Passed: JSONB-safe hash, signature input limits, dispatch readiness, PASS rejection, authority and publishing conditions, text totals, HTML escaping.')

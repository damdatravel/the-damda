const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('node:assert/strict')
const box={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/lib/quotation.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,box)
const {validateQuotation,quoteTotals}=box.exports
const q={number:'Q1',customer:'고객',ai:true,naver:false,vat:true,status:'draft',websites:1,queries:3,months:2,channels:[],lines:[{name:'관리',kind:'monthly',quantity:1,price:100000}]}
for(const k of ['date','validUntil','contact','phone','email','website','situation','priorities','purpose','frequency','reportFrequency','consultation','startDate','scope','cooperation','payment','notes'])q[k]=''
assert(validateQuotation(q))
const d={customerType:'corporate',authority:'delegate',authentication:'identity',publishing:true,sealPreview:false}
for(const k of ['businessNumber','representative','signer','position','authorityEvidence','media','usage','revenue','afterEnd','termination'])d[k]='검토 초안'
assert(validateQuotation({...q,contractDraft:d}))
assert(!validateQuotation({...q,contractDraft:{...d,customerType:'unknown'}}))
assert(!validateQuotation({...q,contractDraft:{...d,publishing:'true'}}))
assert(!validateQuotation({...q,contractDraft:{...d,authorityEvidence:undefined}}))
assert(!validateQuotation({...q,contractDraft:{...d,usage:'x'.repeat(10001)}}))
assert.equal(quoteTotals({...q,contractDraft:d}).grand,220000)
assert.equal(q.status,'draft')
console.log('Passed: existing quotes, contract draft validation, unchanged quote totals and status.')

const assert=require('node:assert/strict'),fs=require('fs'),ts=require('typescript'),vm=require('vm')
function load(file){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{module:m,exports:m.exports,URL,require:()=>load('src/lib/websitePlatform.ts')});return m.exports}
const p=load('src/lib/websitePlatform.ts'),w=load('src/lib/websiteWork.ts')
assert.equal(p.detectPlatform('<img src="https://cdn.imweb.me/a.png">','https://company.com').name,'아임웹')
assert.equal(p.detectPlatform('<img src="https://cdn.imweb.me.attacker.test/a.png">','https://company.com').name,'미확인')
assert.equal(p.detectPlatform('EC_FRONT','https://company.com').name,'카페24 쇼핑몰')
assert.equal(p.detectPlatform('','https://company.cafe24.com').name,'미확인')
assert.equal(p.detectPlatform('<script src="/wp-includes/a.js"></script>','https://company.com').name,'워드프레스')
assert.equal(p.detectPlatform('EC_FRONT <img src="https://cdn.imweb.me/a.png">','https://company.com').name,'미확인')
assert.equal(p.cleanWebsiteContext({status:'planning'}).editable,'unknown')
assert.equal(p.cleanWebsiteContext({status:'bad'}),null)
assert.match(p.productionDirection({company_name:'테스트',website_context:{}},{service:'배송'}).summary,/측정 결과가 아닙니다/)
const item={id:'a',page:'',evidence:'',change:'',reason:'',priority:'',owner:'',criteria:'',feasibility:'',response:'',verification:'',measurement:'',status:'draft'}
assert(w.validWebsiteWork([item]));assert(!w.validWebsiteWork([{...item,status:'applied'}]));assert(!w.validWebsiteWork([{...item,status:'remeasured',verification:'페이지 반영'}]));assert(w.validWebsiteWork([{...item,status:'remeasured',verification:'페이지 반영',measurement:'동일 질문 재측정 기록'}]))
assert.match(w.workRequest('회사',{platform:'아임웹'},[item]),/제작사 회신/)
console.log('Passed: platform evidence, conflicting signals, hosting separation, unknown context, planning report, work verification requirements.')

const hotel=p.cleanWebsiteContext({status:'planning',siteType:'hotel',features:['예약','임의기능'],photoSource:'shoot',videoSource:'provided',mediaDetails:'객실 5개 촬영'})
assert.equal(hotel.siteType,'hotel');assert.equal(hotel.features.length,1);assert.match(p.websiteBrief(hotel),/호텔·숙박업/);assert.match(p.websiteBrief(hotel),/객실 5개 촬영/);assert.match(p.websiteBrief(hotel),/새로 촬영 필요/)

const food=p.cleanWebsiteContext({status:'planning',siteType:'food',mediaSubjects:['대표 메뉴·음식 사진','잘못된 대상']})
assert.equal(food.mediaSubjects.length,1);assert.match(p.websiteBrief(food),/대표 메뉴·음식 사진/);assert(p.industryMedia.medical.includes('의료진·구성원 프로필'))

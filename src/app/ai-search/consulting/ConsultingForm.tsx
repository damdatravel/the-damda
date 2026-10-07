'use client'
import WebsiteContextFields from '../../../components/WebsiteContextFields'
import SearchGoalFields from '../../../components/SearchGoalFields'
import {emptySearchGoal} from '../../../lib/engagement'
import {FormEvent,useEffect,useState} from 'react'
import Link from 'next/link'

const naverConcern='네이버에서 업체·홈페이지가 잘 검색되지 않음'
const concernOptions=[naverConcern,'검색해도 업체가 잘 나오지 않음','ChatGPT 등 AI에서 잘 발견되지 않음','광고 의존도가 높음','홈페이지 검색 유입이 적음','현재 상태를 먼저 진단하고 싶음']

export default function ConsultingForm({topic}:{topic?:string}){
 const [businessField,setBusinessField]=useState('')
 const [websiteContext,setWebsiteContext]=useState({status:'existing',creator:'unknown',editable:'unknown',agencyContact:'unknown',platform:'',purpose:''})
 const [searchGoal,setSearchGoal]=useState({...emptySearchGoal,channels:[topic==='naver'?'Naver':'AI']})
 const[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('')
 const[concerns,setConcerns]=useState<string[]>(topic==='naver'?[naverConcern]:[]),[emailDomain,setEmailDomain]=useState('naver.com')
 const[phoneTail,setPhoneTail]=useState(''),[otp,setOtp]=useState(''),[smsBusy,setSmsBusy]=useState(false),[verified,setVerified]=useState(false),[seconds,setSeconds]=useState(0)
 useEffect(()=>{if(seconds<=0)return;const t=setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>clearInterval(t)},[seconds])
 const [diagnosisId,setDiagnosisId]=useState('')
 const [initialCompany,setInitialCompany]=useState(''),[initialService,setInitialService]=useState(''),[initialEmail,setInitialEmail]=useState(''),[initialEmailCustom,setInitialEmailCustom]=useState('')
 const [initialWebsite,setInitialWebsite]=useState('')
 useEffect(()=>{try{const id=new URLSearchParams(location.search).get('diagnosis'),d=JSON.parse(sessionStorage.getItem('damda-diagnosis')||'null');if(id&&d?.id===id&&d.expires>Date.now()){setDiagnosisId(id);setInitialWebsite(d.url);setPhoneTail(d.phone.slice(3));setVerified(true);setInitialCompany(d.company_name||'');setBusinessField(d.industry||'');if(d.search_goal){setSearchGoal(d.search_goal);setInitialService(d.search_goal.service||'')}if(d.email){setInitialEmail(d.email.split('@')[0]);const domain=d.email.split('@')[1];if(['naver.com','gmail.com','daum.net','hanmail.net','kakao.com','nate.com'].includes(domain))setEmailDomain(domain);else{setEmailDomain('');setInitialEmailCustom(domain)}}}}catch{}},[])
 const phone='010'+phoneTail
 const toggle=(v:string)=>setConcerns(x=>x.includes(v)?x.filter(y=>y!==v):[...x,v])
 const sendOtp=async()=>{
  setError('');if(!/^\d{8}$/.test(phoneTail)){setError('휴대전화 번호 8자리를 입력해 주세요.');return}
  setSmsBusy(true);const r=await fetch('/api/consulting/sms/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone})});const j=await r.json().catch(()=>({}))
  setSmsBusy(false);if(!r.ok){setError(j.error||'인증번호 발송에 실패했습니다.');if(j.retryAfter)setSeconds(j.retryAfter);return}
  setVerified(false);setOtp('');setSeconds(180)
 }
 const verifyOtp=async()=>{
  setError('');if(!/^\d{6}$/.test(otp)){setError('6자리 인증번호를 입력해 주세요.');return}
  setSmsBusy(true);const r=await fetch('/api/consulting/sms/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,code:otp})});const j=await r.json().catch(()=>({}));setSmsBusy(false)
  if(!r.ok){setError(j.error||'인증에 실패했습니다.');return}setVerified(true);setSeconds(0)
 }
 const submit=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();setBusy(true);setError('')
  const f=new FormData(e.currentTarget)
  if(!verified){setError('휴대전화 인증을 완료해 주세요.');setBusy(false);return}
  if(!f.get('privacy_agreed')){setError('개인정보 수집·이용에 동의해 주세요.');setBusy(false);return}
  const domain=String(f.get('email_domain')||'').trim()||String(f.get('email_domain_custom')||'').trim()
  const emailId=String(f.get('email_id')||'').trim()
  const payload={diagnosis_id:diagnosisId||undefined,website_context:websiteContext,search_goal:searchGoal,company_name:String(f.get('company_name')||'').trim(),website_url:String(f.get('website_url')||'').trim(),industry:String(f.get('industry')==='other'?f.get('industry_other')||'':f.get('industry')||'').trim(),main_services:String(f.get('main_services')||'').trim(),concerns,contact_name:String(f.get('contact_name')||'').trim(),phone,email:emailId&&domain?emailId+'@'+domain:'',message:String(f.get('message')||'').trim(),privacy_agreed:true,public_receipt_agreed:!!f.get('public_receipt_agreed')}
  const r=await fetch('/api/consulting/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),j=await r.json().catch(()=>({}))
  if(!r.ok){setError(j.error||'접수 중 오류가 발생했습니다.');setBusy(false);return}setDone(true);setBusy(false)
 }
 if(done)return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-lg font-extrabold text-[#087A56]">상담 접수가 완료되었습니다.</p><p className="mt-2 text-sm leading-relaxed text-gray-600">보내주신 사업 정보와 목표를 확인한 뒤 홈페이지 진단 또는 제작 방향 상담을 진행합니다.</p></div>
 const input='mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]'
 return <form onSubmit={submit} className="mt-7 space-y-5">
  {diagnosisId&&<p className="rounded-xl bg-emerald-50 p-4 text-sm">사전 진단 결과를 상담 자료로 연결합니다. 인증이 만료되었다면 다시 인증해 주세요.</p>}<WebsiteContextFields value={websiteContext} onChange={setWebsiteContext}/><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">업체명·브랜드명 *<input name="company_name" defaultValue={initialCompany} key={initialCompany} required className={input}/></label><label className="text-sm font-bold">홈페이지 URL {websiteContext.status==='existing'?'*':'(있는 경우)'}<input name="website_url" defaultValue={initialWebsite} key={initialWebsite} type="url" required={websiteContext.status==='existing'} placeholder="https://" className={input}/></label></div>
  <div className="grid gap-4 md:grid-cols-2"><div><label className="block text-sm font-bold">사업 분야<select name="industry" value={businessField} onChange={e=>setBusinessField(e.target.value)} aria-describedby="business-field-help" className={input}><option value="">선택해 주세요 (선택 사항)</option>{['웨딩·행사','음식점·카페','숙박·호텔','여행·운송','의료·건강','법률·세무 등 전문 서비스','부동산·분양','쇼핑·유통','제조·산업','교육','생활·청소','광고·마케팅·IT'].map(v=><option key={v} value={v}>{v}</option>)}<option value="other">기타 · 직접 입력</option></select></label><p id="business-field-help" className="mt-2 text-xs font-normal leading-5 text-gray-500">사업자등록증 기준이 아닌, 고객에게 제공하는 사업 분야를 선택해 주세요.</p>{businessField==='other'&&<label className="mt-3 block text-sm font-bold">사업 분야 직접 입력<input name="industry_other" required maxLength={100} placeholder="예: 반려동물 서비스" className={input}/></label>}</div><div><label className="block text-sm font-bold">주요 서비스·상품<input name="main_services" defaultValue={initialService} key={initialService} placeholder="예: 야외·저녁 스몰웨딩, 행사 장소 제공, 행사 기획·진행" className={input}/></label><p className="mt-2 text-xs font-normal leading-5 text-gray-500">고객이 이용하거나 구매할 수 있는 구체적인 서비스·상품을 적어 주세요.</p></div></div>
  <SearchGoalFields required value={searchGoal} onChange={setSearchGoal}/>
  <fieldset><legend className="text-sm font-bold">현재 가장 궁금한 문제</legend><div className="mt-3 grid gap-2">{concernOptions.map(x=><label key={x} className="flex cursor-pointer gap-3 rounded-xl bg-[#F7FAF9] p-3 text-sm"><input type="checkbox" checked={concerns.includes(x)} onChange={()=>toggle(x)}/><span>{x}</span></label>)}</div></fieldset>
  <label className="block text-sm font-bold">담당자명 *<input name="contact_name" required className={input}/></label>
  <div><p className="text-sm font-bold">전화번호 *</p><div className="mt-2 flex gap-2"><div className="flex w-20 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-600">010</div><input value={phoneTail} onChange={e=>{setPhoneTail(e.target.value.replace(/\D/g,'').slice(0,8));setVerified(false)}} inputMode="numeric" placeholder="12345678" disabled={verified} className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]"/><button type="button" onClick={sendOtp} disabled={smsBusy||verified||(seconds>120)} className="whitespace-nowrap rounded-xl border border-[#0A9B6C] px-4 text-sm font-bold text-[#087A56] disabled:opacity-40">{verified?'인증완료':seconds>120?`재전송 ${seconds-120}초`:'인증번호 받기'}</button></div>
  {!verified&&seconds>0&&<div className="mt-2 flex gap-2"><input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" placeholder="6자리 인증번호" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]"/><button type="button" onClick={verifyOtp} disabled={smsBusy} className="rounded-xl bg-[#0A0F1E] px-5 text-sm font-bold text-white">확인</button><span className="self-center text-xs text-gray-500">{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span></div>}
  {verified&&<p className="mt-2 text-sm font-bold text-[#087A56]">✓ 휴대전화 인증이 완료되었습니다.</p>}</div>
  <div><p className="text-sm font-bold">이메일</p><div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"><input name="email_id" defaultValue={initialEmail} key={initialEmail} placeholder="example" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]"/><span className="hidden text-gray-400 sm:block">@</span><div className="flex min-w-0 flex-1 gap-2"><select value={emailDomain} onChange={e=>setEmailDomain(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#0A9B6C]"><option value="naver.com">naver.com</option><option value="gmail.com">gmail.com</option><option value="daum.net">daum.net</option><option value="hanmail.net">hanmail.net</option><option value="kakao.com">kakao.com</option><option value="nate.com">nate.com</option><option value="">직접입력</option></select>{emailDomain===''&&<input name="email_domain_custom" defaultValue={initialEmailCustom} key={initialEmailCustom} placeholder="회사도메인.com" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#0A9B6C]"/>}</div><input type="hidden" name="email_domain" value={emailDomain}/></div></div>
  <label className="block text-sm font-bold">추가로 전달할 내용<textarea name="message" rows={4} className={input}/></label>
  <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600"><div className="mb-3 rounded-lg bg-gray-50 p-3 text-xs leading-6"><p><b>수집·이용 목적:</b> 상담 접수, 홈페이지 진단·검토, 상담 및 결과 안내</p><p><b>필수 항목:</b> 업체명/브랜드명, 홈페이지 상황, 홈페이지 URL(보유 시), 담당자명, 인증된 휴대전화 번호, 우선 서비스·검색 상황·희망 채널</p><p><b>선택 항목:</b> 이메일, 사업 분야, 주요 서비스·상품, 현재 고민, 추가 상담내용, 희망 대상·지역·검색 표현, 제작 환경·수정 가능 여부·제작 목적, 홈페이지 유형·기능·요구사항·참고 사이트·희망 일정·예산, 사진·영상 제공 여부와 촬영·편집 요구사항</p><p><b>보유기간:</b> 미계약 상담은 상담 종료일로부터 1년 후 파기. 계약 전환 시 계약·고객관리 목적에 필요한 기간 보관</p><p><b>동의 거부:</b> 동의를 거부할 수 있으나 상담 신청은 제한됩니다.</p></div><label className="flex gap-3"><input name="privacy_agreed" type="checkbox" required/><span><b>개인정보 수집·이용에 동의합니다. (필수)</b> · <Link href="/privacy" target="_blank" className="text-[#087A56] underline">개인정보처리방침 보기</Link></span></label><label className="mt-4 flex gap-3"><input name="public_receipt_agreed" type="checkbox"/><span>홈페이지 최근 상담 접수 목록에 업체명 첫 글자·사업 분야·희망 채널·접수일을 30일간 공개하는 데 동의합니다. (선택)<br/><span className="text-xs">예: 김*** · 상담 문의 접수. 연락처·이메일·문의 내용은 공개하지 않으며, 동의하지 않아도 상담이 가능합니다. 공개 철회는 개인정보 문의처로 요청할 수 있습니다.</span></span></label></div>
  {error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  <button disabled={busy||!verified} className="w-full rounded-xl bg-[#10E096] px-6 py-4 font-extrabold text-[#0A0F1E] disabled:opacity-50">{busy?'접수 중...':'진단 상담 신청하기 →'}</button>
 </form>
}

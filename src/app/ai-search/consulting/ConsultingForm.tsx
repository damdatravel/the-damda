'use client'
import {FormEvent,useEffect,useState} from 'react'
import Link from 'next/link'

const naverConcern='네이버에서 업체·홈페이지가 잘 검색되지 않음'
const concernOptions=[naverConcern,'검색해도 업체가 잘 나오지 않음','ChatGPT 등 AI에서 잘 발견되지 않음','광고 의존도가 높음','홈페이지 검색 유입이 적음','현재 상태를 먼저 진단하고 싶음']

export default function ConsultingForm({topic}:{topic?:string}){
 const[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('')
 const[concerns,setConcerns]=useState<string[]>(topic==='naver'?[naverConcern]:[]),[emailDomain,setEmailDomain]=useState('naver.com')
 const[phoneTail,setPhoneTail]=useState(''),[otp,setOtp]=useState(''),[smsBusy,setSmsBusy]=useState(false),[verified,setVerified]=useState(false),[seconds,setSeconds]=useState(0)
 useEffect(()=>{if(seconds<=0)return;const t=setInterval(()=>setSeconds(s=>Math.max(0,s-1)),1000);return()=>clearInterval(t)},[seconds])
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
  const payload={company_name:String(f.get('company_name')||'').trim(),website_url:String(f.get('website_url')||'').trim(),industry:String(f.get('industry')||'').trim(),main_services:String(f.get('main_services')||'').trim(),concerns,contact_name:String(f.get('contact_name')||'').trim(),phone,email:emailId&&domain?emailId+'@'+domain:'',message:String(f.get('message')||'').trim(),privacy_agreed:true}
  const r=await fetch('/api/consulting/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}),j=await r.json().catch(()=>({}))
  if(!r.ok){setError(j.error||'접수 중 오류가 발생했습니다.');setBusy(false);return}setDone(true);setBusy(false)
 }
 if(done)return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-lg font-extrabold text-[#087A56]">상담 접수가 완료되었습니다.</p><p className="mt-2 text-sm leading-relaxed text-gray-600">보내주신 홈페이지와 내용을 확인한 뒤 진단·검토를 진행합니다.</p></div>
 const input='mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]'
 return <form onSubmit={submit} className="mt-7 space-y-5">
  <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">업체명·브랜드명 *<input name="company_name" required className={input}/></label><label className="text-sm font-bold">홈페이지 URL *<input name="website_url" type="url" required placeholder="https://" className={input}/></label></div>
  <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">업종<input name="industry" className={input}/></label><label className="text-sm font-bold">주요 서비스·상품<input name="main_services" className={input}/></label></div>
  <fieldset><legend className="text-sm font-bold">현재 가장 궁금한 문제</legend><div className="mt-3 grid gap-2">{concernOptions.map(x=><label key={x} className="flex cursor-pointer gap-3 rounded-xl bg-[#F7FAF9] p-3 text-sm"><input type="checkbox" checked={concerns.includes(x)} onChange={()=>toggle(x)}/><span>{x}</span></label>)}</div></fieldset>
  <label className="block text-sm font-bold">담당자명 *<input name="contact_name" required className={input}/></label>
  <div><p className="text-sm font-bold">전화번호 *</p><div className="mt-2 flex gap-2"><div className="flex w-20 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold text-gray-600">010</div><input value={phoneTail} onChange={e=>{setPhoneTail(e.target.value.replace(/\D/g,'').slice(0,8));setVerified(false)}} inputMode="numeric" placeholder="12345678" disabled={verified} className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]"/><button type="button" onClick={sendOtp} disabled={smsBusy||verified||(seconds>120)} className="whitespace-nowrap rounded-xl border border-[#0A9B6C] px-4 text-sm font-bold text-[#087A56] disabled:opacity-40">{verified?'인증완료':seconds>120?`재전송 ${seconds-120}초`:'인증번호 받기'}</button></div>
  {!verified&&seconds>0&&<div className="mt-2 flex gap-2"><input value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} inputMode="numeric" placeholder="6자리 인증번호" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]"/><button type="button" onClick={verifyOtp} disabled={smsBusy} className="rounded-xl bg-[#0A0F1E] px-5 text-sm font-bold text-white">확인</button><span className="self-center text-xs text-gray-500">{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span></div>}
  {verified&&<p className="mt-2 text-sm font-bold text-[#087A56]">✓ 휴대전화 인증이 완료되었습니다.</p>}</div>
  <div><p className="text-sm font-bold">이메일</p><div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"><input name="email_id" placeholder="example" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]"/><span className="hidden text-gray-400 sm:block">@</span><div className="flex min-w-0 flex-1 gap-2"><select value={emailDomain} onChange={e=>setEmailDomain(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#0A9B6C]"><option value="naver.com">naver.com</option><option value="gmail.com">gmail.com</option><option value="daum.net">daum.net</option><option value="hanmail.net">hanmail.net</option><option value="kakao.com">kakao.com</option><option value="nate.com">nate.com</option><option value="">직접입력</option></select>{emailDomain===''&&<input name="email_domain_custom" placeholder="회사도메인.com" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#0A9B6C]"/>}</div><input type="hidden" name="email_domain" value={emailDomain}/></div></div>
  <label className="block text-sm font-bold">추가로 전달할 내용<textarea name="message" rows={4} className={input}/></label>
  <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600"><div className="mb-3 rounded-lg bg-gray-50 p-3 text-xs leading-6"><p><b>수집·이용 목적:</b> 상담 접수, 홈페이지 진단·검토, 상담 및 결과 안내</p><p><b>필수 항목:</b> 업체명/브랜드명, 홈페이지 URL, 담당자명, 인증된 휴대전화 번호</p><p><b>선택 항목:</b> 이메일, 업종, 주요 서비스·상품, 현재 고민, 추가 상담내용</p><p><b>보유기간:</b> 미계약 상담은 상담 종료일로부터 1년 후 파기. 계약 전환 시 계약·고객관리 목적에 필요한 기간 보관</p><p><b>동의 거부:</b> 동의를 거부할 수 있으나 상담 신청은 제한됩니다.</p></div><label className="flex gap-3"><input name="privacy_agreed" type="checkbox" required/><span><b>개인정보 수집·이용에 동의합니다. (필수)</b> · <Link href="/privacy" target="_blank" className="text-[#087A56] underline">개인정보처리방침 보기</Link></span></label></div>
  {error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  <button disabled={busy||!verified} className="w-full rounded-xl bg-[#10E096] px-6 py-4 font-extrabold text-[#0A0F1E] disabled:opacity-50">{busy?'접수 중...':'진단 상담 신청하기 →'}</button>
 </form>
}

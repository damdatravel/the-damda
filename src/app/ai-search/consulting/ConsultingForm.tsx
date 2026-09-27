'use client'
import {FormEvent,useState} from 'react'
import {createClient} from '@supabase/supabase-js'
import Link from 'next/link'

const concernOptions=['검색해도 업체가 잘 나오지 않음','ChatGPT 등 AI에서 잘 발견되지 않음','광고 의존도가 높음','홈페이지 검색 유입이 적음','현재 상태를 먼저 진단하고 싶음']

export default function ConsultingForm(){
 const[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('')
 const[concerns,setConcerns]=useState<string[]>([])
 const[emailDomain,setEmailDomain]=useState('naver.com')
 const toggle=(v:string)=>setConcerns(x=>x.includes(v)?x.filter(y=>y!==v):[...x,v])
 const submit=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();setBusy(true);setError('')
  const f=new FormData(e.currentTarget)
  if(!f.get('privacy_agreed')){setError('개인정보 수집·이용에 동의해 주세요.');setBusy(false);return}
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url||!key){setError('접수 시스템 설정을 확인해 주세요.');setBusy(false);return}
  const s=createClient(url,key)
  const payload={company_name:String(f.get('company_name')||'').trim(),website_url:String(f.get('website_url')||'').trim(),industry:String(f.get('industry')||'').trim()||null,main_services:String(f.get('main_services')||'').trim()||null,concerns,contact_name:String(f.get('contact_name')||'').trim(),phone:(String(f.get('phone_prefix')||'').trim()+String(f.get('phone_number')||'').replace(/[^0-9]/g,'')).trim()||null,email:(String(f.get('email_id')||'').trim()&&(String(f.get('email_domain')||'').trim()||String(f.get('email_domain_custom')||'').trim())?String(f.get('email_id')||'').trim()+'@'+(String(f.get('email_domain')||'').trim()||String(f.get('email_domain_custom')||'').trim()):null),message:String(f.get('message')||'').trim()||null,privacy_agreed:true,status:'diagnosis_pending'}
  if(!payload.phone&&!payload.email){setError('전화번호 또는 이메일 중 하나는 입력해 주세요.');setBusy(false);return}
  const r=await s.from('discovery_inquiries').insert(payload)
  if(r.error){setError('접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');setBusy(false);return}
  setDone(true);setBusy(false)
 }
 if(done)return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6"><p className="text-lg font-extrabold text-[#087A56]">상담 접수가 완료되었습니다.</p><p className="mt-2 text-sm leading-relaxed text-gray-600">보내주신 홈페이지와 내용을 확인한 뒤 진단·검토를 진행합니다.</p></div>
 const input='mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]'
 return <form onSubmit={submit} className="mt-7 space-y-5">
  <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">업체명·브랜드명 *<input name="company_name" required className={input}/></label><label className="text-sm font-bold">홈페이지 URL *<input name="website_url" type="url" required placeholder="https://" className={input}/></label></div>
  <div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-bold">업종<input name="industry" className={input}/></label><label className="text-sm font-bold">주요 서비스·상품<input name="main_services" className={input}/></label></div>
  <fieldset><legend className="text-sm font-bold">현재 가장 궁금한 문제</legend><div className="mt-3 grid gap-2">{concernOptions.map(x=><label key={x} className="flex cursor-pointer gap-3 rounded-xl bg-[#F7FAF9] p-3 text-sm"><input type="checkbox" checked={concerns.includes(x)} onChange={()=>toggle(x)}/><span>{x}</span></label>)}</div></fieldset>
  <label className="block text-sm font-bold">담당자명 *<input name="contact_name" required className={input}/></label>
  <div><p className="text-sm font-bold">전화번호</p><div className="mt-2 flex gap-2"><select name="phone_prefix" defaultValue="010" className="w-28 rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#0A9B6C]"><option>010</option><option>011</option><option>016</option><option>017</option><option>018</option><option>019</option><option>02</option><option>031</option><option>032</option><option>033</option><option>041</option><option>042</option><option>043</option><option>044</option><option>051</option><option>052</option><option>053</option><option>054</option><option>055</option><option>061</option><option>062</option><option>063</option><option>064</option><option>070</option></select><input name="phone_number" inputMode="numeric" placeholder="1234-5678" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]"/></div></div>
  <div><p className="text-sm font-bold">이메일</p><div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"><input name="email_id" placeholder="example" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-[#0A9B6C]"/><span className="hidden text-gray-400 sm:block">@</span><div className="flex min-w-0 flex-1 gap-2"><select value={emailDomain} onChange={e=>setEmailDomain(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#0A9B6C]"><option value="naver.com">naver.com</option><option value="gmail.com">gmail.com</option><option value="daum.net">daum.net</option><option value="hanmail.net">hanmail.net</option><option value="kakao.com">kakao.com</option><option value="nate.com">nate.com</option><option value="">직접입력</option></select>{emailDomain===''&&<input name="email_domain_custom" placeholder="회사도메인.com" className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-3 text-sm outline-none focus:border-[#0A9B6C]"/>}</div><input type="hidden" name="email_domain" value={emailDomain}/></div></div>
  <label className="block text-sm font-bold">추가로 전달할 내용<textarea name="message" rows={4} className={input}/></label>
  <div className="rounded-xl border border-gray-200 p-4 text-sm text-gray-600"><div className="mb-3 rounded-lg bg-gray-50 p-3 text-xs leading-6"><p><b>수집·이용 목적:</b> 상담 접수, 홈페이지 진단·검토, 상담 및 결과 안내</p><p><b>필수 항목:</b> 업체명/브랜드명, 홈페이지 URL, 담당자명, 전화번호 또는 이메일 중 1개 이상</p><p><b>선택 항목:</b> 업종, 주요 서비스·상품, 현재 고민, 추가 상담내용</p><p><b>보유기간:</b> 미계약 상담은 상담 종료일로부터 1년 후 파기. 계약 전환 시 계약·고객관리 목적에 필요한 기간 보관</p><p><b>동의 거부:</b> 동의를 거부할 수 있으나 상담 신청은 제한됩니다.</p></div><label className="flex gap-3"><input name="privacy_agreed" type="checkbox" required/><span><b>개인정보 수집·이용에 동의합니다. (필수)</b> · <Link href="/privacy" target="_blank" className="text-[#087A56] underline">개인정보처리방침 보기</Link></span></label></div>
  {error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  <button disabled={busy} className="w-full rounded-xl bg-[#10E096] px-6 py-4 font-extrabold text-[#0A0F1E] disabled:opacity-50">{busy?'접수 중...':'진단 상담 신청하기 →'}</button>
 </form>
}

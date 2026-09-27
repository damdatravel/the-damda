'use client'
import {FormEvent,useState} from 'react'
import {createClient} from '@supabase/supabase-js'

const concernOptions=['검색해도 업체가 잘 나오지 않음','ChatGPT 등 AI에서 잘 발견되지 않음','광고 의존도가 높음','홈페이지 검색 유입이 적음','현재 상태를 먼저 진단하고 싶음']

export default function ConsultingForm(){
 const[busy,setBusy]=useState(false),[done,setDone]=useState(false),[error,setError]=useState('')
 const[concerns,setConcerns]=useState<string[]>([])
 const toggle=(v:string)=>setConcerns(x=>x.includes(v)?x.filter(y=>y!==v):[...x,v])
 const submit=async(e:FormEvent<HTMLFormElement>)=>{
  e.preventDefault();setBusy(true);setError('')
  const f=new FormData(e.currentTarget)
  if(!f.get('privacy_agreed')){setError('개인정보 수집·이용에 동의해 주세요.');setBusy(false);return}
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url||!key){setError('접수 시스템 설정을 확인해 주세요.');setBusy(false);return}
  const s=createClient(url,key)
  const payload={company_name:String(f.get('company_name')||'').trim(),website_url:String(f.get('website_url')||'').trim(),industry:String(f.get('industry')||'').trim()||null,main_services:String(f.get('main_services')||'').trim()||null,concerns,contact_name:String(f.get('contact_name')||'').trim(),phone:String(f.get('phone')||'').trim()||null,email:String(f.get('email')||'').trim()||null,message:String(f.get('message')||'').trim()||null,privacy_agreed:true,status:'diagnosis_pending'}
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
  <div className="grid gap-4 md:grid-cols-3"><label className="text-sm font-bold">담당자명 *<input name="contact_name" required className={input}/></label><label className="text-sm font-bold">전화번호<input name="phone" inputMode="tel" className={input}/></label><label className="text-sm font-bold">이메일<input name="email" type="email" className={input}/></label></div>
  <label className="block text-sm font-bold">추가로 전달할 내용<textarea name="message" rows={4} className={input}/></label>
  <label className="flex gap-3 rounded-xl border border-gray-200 p-4 text-sm text-gray-600"><input name="privacy_agreed" type="checkbox" required/><span>상담 및 진단을 위해 업체 정보와 담당자 연락처를 수집·이용하는 것에 동의합니다. *</span></label>
  {error&&<p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
  <button disabled={busy} className="w-full rounded-xl bg-[#10E096] px-6 py-4 font-extrabold text-[#0A0F1E] disabled:opacity-50">{busy?'접수 중...':'진단 상담 신청하기 →'}</button>
 </form>
}

'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
const labels:Record<string,string>={diagnosis_pending:'진단 대기',reviewing:'진단·검토 중',proposal:'진행 협의',customer_delivery:'고객 전달',quote_drafting:'견적서 작성 중',quote_ready:'견적서 작성 완료',quote_sent:'견적서 전달 완료',contracted:'계약 완료',closed:'상담 종료'}
export default function InquiryActions({id,status}:{id:number;status:string}){
 const router=useRouter(),[busy,setBusy]=useState(false),[error,setError]=useState('')
 const change=async(next:string)=>{setBusy(true);setError('');const r=await fetch('/api/discovery/inquiries/'+id,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:next})});if(!r.ok){const j=await r.json().catch(()=>({}));setError(j.error||'상태 변경에 실패했습니다.')}else router.refresh();setBusy(false)}
 const steps=[['proposal','진행 협의'],['customer_delivery','고객 결과 전달'],['quote_drafting','견적서 작성 시작'],['quote_ready','견적서 작성 완료'],['quote_sent','견적서 전달 완료']] as const
 return <aside className="rounded-2xl border border-gray-200 bg-[#0A0F1E] p-6 text-white shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#10E096]">Work Status</p><h2 className="mt-1 text-xl font-extrabold">진단 진행 상태</h2><p className="mt-2 text-sm text-gray-400">현재: {labels[status]||status}</p><div className="mt-6 grid gap-2">
 <button disabled={busy||status==='reviewing'} onClick={()=>change('reviewing')} className="rounded-xl bg-[#10E096] px-4 py-3 text-sm font-extrabold text-[#0A0F1E] disabled:opacity-40">진단·검토 시작</button>
 {steps.map(([value,label])=><button key={value} disabled={busy||status===value} onClick={()=>change(value)} className="rounded-xl border border-white/20 px-4 py-3 text-sm font-bold disabled:opacity-40">{label}</button>)}
 <button disabled={busy||status==='contracted'} onClick={()=>change('contracted')} className="mt-2 rounded-xl bg-white px-4 py-3 text-sm font-extrabold text-[#0A0F1E] disabled:opacity-40">계약 완료</button>
 <button disabled={busy||status==='closed'} onClick={()=>change('closed')} className="rounded-xl border border-red-400/30 px-4 py-3 text-sm font-bold text-red-200 disabled:opacity-40">미계약 · 상담 종료</button>
 <button disabled={busy||status==='diagnosis_pending'} onClick={()=>change('diagnosis_pending')} className="mt-2 rounded-xl border border-white/20 px-4 py-3 text-xs font-bold text-gray-300 disabled:opacity-40">진단 대기로 되돌리기</button>
 </div><p className="mt-4 text-xs leading-5 text-gray-500">계약 완료 건은 계약 상태로 남기고, 미계약 건만 상담 종료로 보관합니다.</p>{error&&<p className="mt-4 rounded-lg bg-red-950/50 p-3 text-xs text-red-200">{error}</p>}</aside>
}
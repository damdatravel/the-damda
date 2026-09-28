import Link from 'next/link'
import {notFound} from 'next/navigation'
import {createClient} from '@supabase/supabase-js'
import WebsiteInspector from '../../WebsiteInspector'
import InquiryActions from './InquiryActions'
import DiagnosisReportEditor from './DiagnosisReportEditor'

export const dynamic='force-dynamic'
export const revalidate=0

type Inquiry={id:number;company_name:string;website_url:string;industry:string|null;main_services:string|null;concerns:string[]|null;contact_name:string;phone:string|null;email:string|null;message:string|null;status:string;created_at:string;project_id:number|null}
const statusLabel:Record<string,string>={diagnosis_pending:'진단 대기',reviewing:'진단·검토 중',proposal:'진행 협의',customer_delivery:'고객 전달',quote_drafting:'견적서 작성 중',quote_ready:'견적서 작성 완료',quote_sent:'견적서 전달 완료',contracted:'계약 완료',converted:'프로젝트 전환',closed:'상담 종료'}

async function getReport(id:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return null
 const s=createClient(url,key,{auth:{persistSession:false}})
 const r=await s.from('discovery_diagnosis_reports').select('title,summary,findings,priorities,proposal,status,public_token').eq('inquiry_id',id).maybeSingle()
 return r.data as any
}

async function getInquiry(id:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return null
 const s=createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const r=await s.from('discovery_inquiries').select('id,company_name,website_url,industry,main_services,concerns,contact_name,phone,email,message,status,created_at,project_id').eq('id',id).single()
 return r.data as Inquiry|null
}

export default async function InquiryPage({params}:{params:{id:string}}){
 const inquiry=await getInquiry(Number(params.id)); if(!inquiry)notFound()
 const report=await getReport(inquiry.id)
 return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-6xl px-5 pb-10 pt-24 md:px-8 md:pt-28">
  <header className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">Consultation Diagnosis</p><h1 className="mt-1 text-3xl font-extrabold">{inquiry.company_name}</h1><p className="mt-2 text-sm text-gray-500">접수 {new Date(inquiry.created_at).toLocaleString('ko-KR')} · {statusLabel[inquiry.status]||inquiry.status}</p></div><Link href="/discovery" className="inline-flex items-center justify-center rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white transition hover:opacity-90">회사 대시보드로 돌아가기 →</Link></header>
  <section className="mb-6 grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
   <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Inquiry</p><h2 className="mt-1 text-xl font-extrabold">접수 정보</h2><dl className="mt-5 grid gap-4 text-sm md:grid-cols-2">
    <div><dt className="text-gray-400">홈페이지</dt><dd className="mt-1 font-bold"><a className="break-all text-[#087A56] hover:underline" href={inquiry.website_url} target="_blank" rel="noopener noreferrer">{inquiry.website_url}</a></dd></div>
    <div><dt className="text-gray-400">업종</dt><dd className="mt-1 font-bold">{inquiry.industry||'미입력'}</dd></div>
    <div className="md:col-span-2"><dt className="text-gray-400">주요 서비스·상품</dt><dd className="mt-1 font-bold">{inquiry.main_services||'미입력'}</dd></div>
    <div><dt className="text-gray-400">담당자</dt><dd className="mt-1 font-bold">{inquiry.contact_name}</dd></div>
    <div><dt className="text-gray-400">연락처</dt><dd className="mt-1 font-bold">{inquiry.phone||inquiry.email||'미입력'}</dd></div>
    {inquiry.phone&&inquiry.email&&<div className="md:col-span-2"><dt className="text-gray-400">이메일</dt><dd className="mt-1 font-bold">{inquiry.email}</dd></div>}
   </dl>
   {inquiry.concerns?.length?<div className="mt-6"><p className="text-sm font-bold">현재 고민</p><div className="mt-2 flex flex-wrap gap-2">{inquiry.concerns.map(x=><span key={x} className="rounded-full bg-gray-100 px-3 py-1 text-xs">{x}</span>)}</div></div>:null}
   {inquiry.message&&<div className="mt-6"><p className="text-sm font-bold">추가 전달 내용</p><p className="mt-2 whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-600">{inquiry.message}</p></div>}
   </div>
   <InquiryActions id={inquiry.id} status={inquiry.status}/>
  </section>
  <WebsiteInspector url={inquiry.website_url}/>
  <DiagnosisReportEditor id={inquiry.id} initial={report}/>
  <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500"><p className="font-bold text-[#0A0F1E]">정식 프로젝트 전환</p><p className="mt-2">현재 단계에서는 상담·진단 상태만 관리합니다. 실제 진행이 확정된 건만 Discovery 프로젝트로 전환합니다. 자동 전환하지 않습니다.</p></section>
 </div></div>
}
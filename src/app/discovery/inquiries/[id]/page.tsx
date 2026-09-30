import Link from 'next/link'
import {notFound} from 'next/navigation'
import {createClient} from '@supabase/supabase-js'
import InquiryConsultation from './InquiryConsultation'
import {consultationScope} from '../../../../lib/consultationScope'
import InquiryActions from './InquiryActions'
import {requireStaff} from '../../../../lib/requireStaff'
import QuotationEditor from './QuotationEditor'
import {Quotation,validateQuotation} from '../../../../lib/quotation'

export const dynamic='force-dynamic'
export const revalidate=0

type Inquiry={id:number;company_name:string;website_url:string;industry:string|null;main_services:string|null;concerns:string[]|null;contact_name:string;phone:string|null;email:string|null;message:string|null;status:string;created_at:string;project_id:number|null}
const statusLabel:Record<string,string>={diagnosis_pending:'진단 대기',reviewing:'진단·검토 중',proposal:'진행 협의',customer_delivery:'고객 전달',quote_drafting:'견적서 작성 중',quote_ready:'견적서 작성 완료',quote_sent:'견적서 전달 완료',contracted:'계약 완료',converted:'프로젝트 전환',closed:'상담 종료'}

async function getReport(id:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return null
 const s=createClient(url,key,{auth:{persistSession:false}})
 const r=await s.from('discovery_diagnosis_reports').select('title,summary,findings,priorities,proposal,status,public_token,website_snapshot').eq('inquiry_id',id).maybeSingle()
 return r.data as any
}

async function getInquiry(id:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return null
 const s=createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const r=await s.from('discovery_inquiries').select('id,company_name,website_url,industry,main_services,concerns,contact_name,phone,email,message,status,created_at,project_id').eq('id',id).single()
 return r.data as Inquiry|null
}
async function getNaverHistory(id:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return []
 const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const {data}=await s.from('discovery_naver_inquiry_history').select('id,query,interpreted,created_at').eq('inquiry_id',id).order('created_at',{ascending:false}).limit(20)
 return data||[]
}
async function getQuote(id:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return {document:null,ready:false}
 const s=createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const {data,error}=await s.from('discovery_quotations').select('document').eq('inquiry_id',id).maybeSingle()
 return {document:data?.document,ready:!error}
}

export default async function InquiryPage({params}:{params:{id:string}}){
 await requireStaff()
 const inquiry=await getInquiry(Number(params.id)); if(!inquiry)notFound()
 const report=await getReport(inquiry.id)
 const naverHistory=await getNaverHistory(inquiry.id)
 const savedQuote=await getQuote(inquiry.id),scope=consultationScope(report?.website_snapshot,inquiry.concerns)
 const today=new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'}),valid=new Date(Date.now()+14*86400000).toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'})
 const initialQuote:Quotation=validateQuotation(savedQuote.document)?savedQuote.document:{
  number:`DD-${today.replace(/-/g,'')}-${inquiry.id}`,date:today,validUntil:valid,customer:inquiry.company_name,contact:inquiry.contact_name||'',phone:inquiry.phone||'',email:inquiry.email||'',website:inquiry.website_url,
  ...scope,situation:report?.summary||'',priorities:(report?.priorities||[]).map((x:any)=>typeof x==='string'?x:x.title||x.action||x.description||'').filter(Boolean).join('\n'),purpose:'업체와 서비스 정보를 점검하고, 검색 결과를 분석해 우선 개선 방향을 제공하고 변화 과정을 확인합니다.',
  websites:1,queries:10,channels:[...(scope.naver?['네이버 웹문서','네이버 블로그']:[]),...(scope.ai?['Gemini API','OpenAI API']:[])],frequency:'월 1회',reportFrequency:'월 1회',consultation:'월 1회 · 온라인 상담',startDate:'',months:1,
  scope:'홈페이지 점검, 검색어·질문 선정, 선택 채널 측정, 결과 분석, 개선안 제안 및 재측정.\n홈페이지 수정·콘텐츠 제작·게시·개발 작업은 별도 견적이며, 포함하는 작업은 본 견적에 명시합니다.',cooperation:'업체·서비스 정보 확인, 개선안 검토 및 적용 여부 공유. 홈페이지 수정이 필요한 경우 접근 권한 또는 제작업체 협조.',payment:'초기 설정비 및 첫 월 관리비는 착수 전 결제. 이후 월 관리비는 매월 관리 시작 전 결제. 추가 작업의 결제 시기는 별도 협의.',notes:'',vat:true,status:'draft',lines:[{name:'초기 진단·설정비',kind:'initial',quantity:1,price:0},{name:'월 검색 관리비',kind:'monthly',quantity:1,price:0}]
 }
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
   <InquiryActions id={inquiry.id} status={inquiry.status} projectId={inquiry.project_id} services={consultationScope(report?.website_snapshot,inquiry.concerns)}/>
  </section>
  <QuotationEditor id={inquiry.id} initial={initialQuote} storageReady={savedQuote.ready}/>
  {inquiry.project_id?<section className="mb-6 rounded-2xl border border-emerald-200 bg-white p-6"><h2 className="text-xl font-bold">계약 후 관리 단계</h2><p className="mt-2 text-sm text-gray-600">초기 상담 자료는 보관됩니다. 이후 진단·개선·재측정은 연결된 관리 프로젝트에서 진행하세요.</p><Link href={`/discovery/projects/${inquiry.project_id}`} className="mt-4 inline-block rounded-xl bg-[#087A56] px-5 py-3 text-sm font-bold text-white">관리 프로젝트 열기 →</Link>{report?.status==='published'&&<Link href={`/diagnosis/${report.public_token}`} className="ml-3 inline-block text-sm font-bold text-[#087A56]">확정한 초기 상담 보고서 보기 →</Link>}</section>:<InquiryConsultation id={inquiry.id} website={inquiry.website_url} concerns={inquiry.concerns} initial={report} history={naverHistory}/>}
  <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500"><p className="font-bold text-[#0A0F1E]">정식 프로젝트 전환</p><p className="mt-2">{inquiry.project_id?`계약 완료 · 관리 프로젝트 #${inquiry.project_id}로 연결되었습니다.`:'계약 완료 시 이 상담 정보를 바탕으로 관리 프로젝트가 자동 생성되고 상담 건과 연결됩니다.'}</p></section>
 </div></div>
}

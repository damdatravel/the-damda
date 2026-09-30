import {requireStaff} from '../../lib/requireStaff'
import Link from 'next/link'
import StaffLogoutButton from './StaffLogoutButton'
import {createClient} from '@supabase/supabase-js'
import QuotationList,{QuoteRow} from './QuotationList'
import {validateQuotation} from '../../lib/quotation'
export const dynamic='force-dynamic'
export const revalidate=0
type Project={id:number;name:string|null;website_url:string|null;status:string|null}
type Task={project_id:number;status:string;completed_at:string|null}
type Inquiry={id:number;company_name:string;website_url:string;industry:string|null;status:string;created_at:string}
function dayKey(iso:string){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))}
function addDays(iso:string,days:number){const d=new Date(iso);d.setDate(d.getDate()+days);return dayKey(d.toISOString())}
async function getData(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return{projects:[] as Project[],tasks:[] as Task[],inquiries:[] as Inquiry[],error:'Supabase 환경변수를 확인해 주세요.'}
 const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const[p,t,i]=await Promise.all([
  s.from('discovery_projects').select('id,name,website_url,status').order('id'),
  s.from('discovery_improvement_tasks').select('project_id,status,completed_at'),
  s.from('discovery_inquiries').select('id,company_name,website_url,industry,status,created_at').not('status','in','(contracted,converted,closed)').order('created_at',{ascending:false})
 ])
 return{projects:(p.data??[]) as Project[],tasks:(t.data??[]) as Task[],inquiries:(i.data??[]) as Inquiry[],error:p.error?.message??t.error?.message??i.error?.message??null}
}
async function getQuotations(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return {rows:[] as QuoteRow[],error:'견적 조회 환경변수를 확인해 주세요.'}
 const s=createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const {data,error}=await s.from('discovery_quotations').select('inquiry_id,document,updated_at,discovery_inquiries(company_name,status,project_id)').order('updated_at',{ascending:false})
 if(error)return {rows:[] as QuoteRow[],error:'견적 목록을 조회하지 못했습니다. 견적 저장 테이블과 연결 상태를 확인해 주세요.'}
 const rows:QuoteRow[]=[]
 for(const row of data||[]){const inquiry=Array.isArray(row.discovery_inquiries)?row.discovery_inquiries[0]:row.discovery_inquiries;if(inquiry&&validateQuotation(row.document))rows.push({inquiryId:row.inquiry_id,company:inquiry.company_name,inquiryStatus:inquiry.status,projectId:inquiry.project_id,updatedAt:row.updated_at,document:row.document})}
 return {rows,error:null}
}
export default async function CompanyDashboard(){
 await requireStaff()
 const [{projects,tasks,inquiries,error},quotations]=await Promise.all([getData(),getQuotations()])
 const today=dayKey(new Date().toISOString())
 const rows=projects.map(p=>{const done=tasks.filter(t=>t.project_id===p.id&&t.status==='effect_confirmed'&&t.completed_at).sort((a,b)=>new Date(b.completed_at!).getTime()-new Date(a.completed_at!).getTime());const base=done[0]?.completed_at;const schedule=base?[7,15,30,45,60,75,90].map(day=>({day,date:addDays(base,day)})):[];const next=schedule.find(x=>x.date>=today)??null;return{...p,completed:done.length,next}})
 const due=rows.filter(r=>r.next).sort((a,b)=>a.next!.date.localeCompare(b.next!.date))
 return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-8 md:pt-20">
  <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">Damda Discovery</p><h1 className="text-3xl font-extrabold md:text-4xl">회사 대시보드</h1><p className="mt-2 text-sm text-gray-500">신규 상담부터 사전 진단, 기존 프로젝트 운영까지 한 곳에서 관리합니다.</p></div><StaffLogoutButton/></header>
  {error&&<div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">DB 연결 확인 필요: {error}</div>}
  <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="관리 프로젝트" value={rows.length}/><Stat label="재측정 예정" value={due.length}/><Stat label="완료 개선 작업" value={tasks.filter(t=>t.status==='effect_confirmed').length}/><Stat label="오늘 재측정" value={due.filter(r=>r.next?.date===today).length}/></section>
  <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Consultation Queue</p><h2 className="mt-1 text-xl font-extrabold">신규 상담·진단 대기</h2><p className="mt-2 text-sm text-gray-500">상담 폼으로 접수되어 아직 정식 프로젝트로 전환되지 않은 업체입니다.</p></div><div className="flex flex-wrap items-center gap-3"><span className="text-sm font-bold text-gray-400">총 {inquiries.length}건</span><Link href="/discovery/inquiries" className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold">상담 신청 업체 전체 목록 →</Link></div></div>{inquiries.length===0?<div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500">현재 대기 중인 상담·진단 건이 없습니다.</div>:<div className="mt-5 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200">{inquiries.map(x=><div key={x.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.3fr_1.7fr_1fr_auto] md:items-center"><div><p className="font-extrabold">{x.company_name}</p><p className="mt-1 text-xs text-gray-400">{x.industry||'업종 미입력'} · {new Date(x.created_at).toLocaleDateString('ko-KR')}</p></div><a href={x.website_url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-[#087A56] hover:underline">{x.website_url}</a><span className="justify-self-start rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{({diagnosis_pending:'진단 대기',reviewing:'진단·검토 중',proposal:'진행 협의'} as Record<string,string>)[x.status]||x.status}</span><Link href={`/discovery/inquiries/${x.id}`} className="justify-self-start rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold">진단 건 열기</Link></div>)}</div>}</section>
  <QuotationList rows={quotations.rows} error={quotations.error}/>
  <section className="mb-6 grid gap-4 md:grid-cols-2"><Link href="/discovery/ai" className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-emerald-400"><p className="text-xs font-bold uppercase tracking-wider text-[#087A56]">Search · AI</p><h2 className="mt-2 text-xl font-extrabold">검색·AI 통합 관리</h2><p className="mt-2 text-sm leading-6 text-gray-500">SEO·AEO·GEO 질문, 채널별 측정, 개선안과 재측정을 관리합니다.</p><span className="mt-4 inline-block text-sm font-bold text-[#087A56]">통합 관리 열기 →</span></Link><Link href="/discovery/naver" className="rounded-2xl border border-emerald-200 bg-[#F1FBF6] p-6 shadow-sm transition-colors hover:border-emerald-500"><p className="text-xs font-bold uppercase tracking-wider text-[#087A56]">Naver</p><h2 className="mt-2 text-xl font-extrabold">네이버 전문 관리</h2><p className="mt-2 text-sm leading-6 text-gray-600">웹문서·블로그·카페글·지역 검색과 검색어 트렌드를 살펴봅니다.</p><span className="mt-4 inline-block text-sm font-bold text-[#087A56]">네이버 관리 열기 →</span></Link></section>
  <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Analysis Archive</p><h2 className="mt-1 text-xl font-extrabold">분석 아카이브</h2><p className="mt-2 text-sm text-gray-500">계약 여부와 관계없이 홈페이지 진단 사례를 보존해 이후 질문·진단 품질 개선에 활용합니다.</p></div><Link href="/discovery/archive" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">분석 자료 보기 →</Link></div></section>
  <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Website Check</p><h2 className="mt-1 text-xl font-extrabold">홈페이지 사전 상담 진단</h2><p className="mt-2 text-sm text-gray-500">상담 건에서 검색·AI 또는 네이버 진단 범위를 선택하고 초기 고객 보고서를 작성합니다. 관리 프로젝트는 계약 후 생성됩니다.</p></div><Link href="/discovery/website-check" className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white">사전 상담 진단 열기 →</Link></div></section>
  <section className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-5"><p className="text-sm font-bold">운영 원칙</p><p className="mt-2 text-sm leading-relaxed text-gray-500">회사 대시보드는 전체 고객과 오늘 할 일을 관리하고, 프로젝트 대시보드는 실제 진단·Benchmark·측정·개선·재측정을 수행합니다. 고객용 대시보드는 내부 승인·오류·기술 정보는 숨기고 결과와 진행 상황만 제공합니다.</p></section>
 </div></div>
}
function Stat({label,value}:{label:string;value:number}){return <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-gray-500">{label}</p><p className="mt-2 text-4xl font-extrabold">{value}</p></article>}

import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
import WebsiteInspector from '../WebsiteInspector'

export const dynamic='force-dynamic'
export const revalidate=0

type Project={id:number;name:string|null;website_url:string|null;industry:string|null;status:string|null}
type Inquiry={id:number;company_name:string;website_url:string;industry:string|null;status:string;created_at:string}

async function getProjects(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return{projects:[] as Project[],error:'Supabase 환경변수를 확인해 주세요.'}
 const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const r=await s.from('discovery_projects').select('id,name,website_url,industry,status').order('id')
 return{projects:(r.data??[]) as Project[],error:r.error?.message??null}
}

async function getInquiries(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return{inquiries:[] as Inquiry[],error:'SUPABASE_SERVICE_ROLE_KEY 설정이 필요합니다.'}
 const s=createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const r=await s.from('discovery_inquiries').select('id,company_name,website_url,industry,status,created_at').neq('status','converted').neq('status','closed').order('created_at',{ascending:false})
 return{inquiries:(r.data??[]) as Inquiry[],error:r.error?.message??null}
}
const statusLabel:Record<string,string>={diagnosis_pending:'진단 대기',reviewing:'진단·검토 중',proposal:'진행 협의'}

export default async function WebsiteCheckPage(){
 const[{projects,error},{inquiries,error:inquiryError}]=await Promise.all([getProjects(),getInquiries()])
 return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-6xl px-5 pb-10 pt-16 md:px-8 md:pt-20">
  <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">The Damda Discovery</p><h1 className="text-3xl font-extrabold md:text-4xl">홈페이지 현황 확인</h1><p className="mt-2 max-w-2xl text-sm text-gray-500">새 홈페이지를 진단하고, 실제 관리하기로 한 사이트는 Discovery 프로젝트로 연결합니다.</p></div><Link href="/discovery" className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white">회사 대시보드로 돌아가기 →</Link></header>
  <WebsiteInspector/>
  <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
   <div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Consultation Queue</p><h2 className="mt-1 text-xl font-extrabold">상담·진단 대기</h2><p className="mt-2 text-sm text-gray-500">상담 폼으로 접수되어 아직 정식 프로젝트로 전환되지 않은 업체입니다.</p></div><span className="text-sm font-bold text-gray-400">총 {inquiries.length}건</span></div>
   {inquiryError&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">상담 목록 연결 필요: {inquiryError}</div>}
   {!inquiryError&&inquiries.length===0&&<div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500">현재 대기 중인 상담·진단 건이 없습니다.</div>}
   {inquiries.length>0&&<div className="mt-5 divide-y divide-gray-200 overflow-hidden rounded-xl border border-gray-200">{inquiries.map(x=><div key={x.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.4fr_1.7fr_1fr_auto] md:items-center"><div><p className="font-extrabold">{x.company_name}</p><p className="mt-1 text-xs text-gray-400">{x.industry||'업종 미입력'} · {new Date(x.created_at).toLocaleDateString('ko-KR')}</p></div><a href={x.website_url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-[#087A56] hover:underline">{x.website_url}</a><span className="justify-self-start rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{statusLabel[x.status]||x.status}</span><Link href={`/discovery/inquiries/${x.id}`} className="justify-self-start rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold">진단 건 열기</Link></div>)}</div>}
  </section>
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
   <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Managed Projects</p><h2 className="mt-1 text-xl font-extrabold">진행 중인 프로젝트</h2><p className="mt-2 text-sm text-gray-500">Discovery에 등록되어 관리 중인 홈페이지입니다. 고객 프로젝트가 추가되면 이 목록에 함께 표시됩니다.</p></div><span className="text-sm font-bold text-gray-400">총 {projects.length}개</span></div>
   {error&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">프로젝트 목록 확인 필요: {error}</div>}
   {!error&&projects.length===0&&<div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-sm text-gray-500">아직 등록된 프로젝트가 없습니다.</div>}
   {projects.length>0&&<div className="mt-5 overflow-hidden rounded-xl border border-gray-200">
    <div className="hidden grid-cols-[1.4fr_1.7fr_1fr_auto] gap-4 bg-gray-50 px-4 py-3 text-xs font-bold text-gray-400 md:grid"><span>프로젝트</span><span>홈페이지</span><span>상태</span><span>관리</span></div>
    <div className="divide-y divide-gray-200">{projects.map(p=><div key={p.id} className="grid gap-3 px-4 py-4 md:grid-cols-[1.4fr_1.7fr_1fr_auto] md:items-center md:gap-4">
     <div><p className="font-extrabold">{p.name||'이름 없음'}</p>{p.industry&&<p className="mt-1 text-xs text-gray-400">{p.industry}</p>}</div>
     <div>{p.website_url?<a href={p.website_url} target="_blank" rel="noopener noreferrer" className="break-all text-sm text-[#087A56] hover:underline">{p.website_url}</a>:<span className="text-sm text-gray-400">홈페이지 미등록</span>}</div>
     <div><span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-[#087A56]">{p.status||'진행 중'}</span></div>
     <Link href={p.id===1?'/discovery':`/discovery?project=${p.id}`} className="justify-self-start rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-bold hover:bg-gray-50">프로젝트 열기</Link>
    </div>)}</div>
   </div>}
  </section>
  <section className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500"><p className="font-bold text-[#0A0F1E]">다음 연결 단계</p><p className="mt-2">홈페이지 진단 결과에서 실제 관리할 사이트만 새 프로젝트로 등록하거나 기존 프로젝트에 연결합니다. 진단만 한 사이트는 고객 프로젝트가 되지 않습니다.</p></section>
 </div></div>
}
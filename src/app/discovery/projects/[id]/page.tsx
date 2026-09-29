import {requireStaff} from '../../../../lib/requireStaff'
import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
import DashboardExplorer from '../../DashboardExplorer'
import Day0Analyzer from '../../Day0Analyzer'
import ProjectOnboarding from '../../ProjectOnboarding'
import ServiceSelector from './ServiceSelector'
import {type CalendarMeasurement} from '../../ActivityCalendar'
export const dynamic='force-dynamic'
export const revalidate=0
type P={id:number;name:string|null;website_url:string|null;industry:string|null;main_services:string|null;target_customer:string|null;service_area:string|null;description:string|null;status:string|null;ai_management:boolean;naver_management:boolean}
type B={id:number;question:string}
type T={id:number;priority:number;title:string;status:string;summary:string|null;work_details:string[];completed_at:string|null;created_at:string}
async function getData(projectId:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return{project:null as P|null,benchmarks:[] as B[],measurements:[] as CalendarMeasurement[],tasks:[] as T[],error:'Supabase 환경변수를 확인해 주세요.'}
 const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const[p,q,m,t]=await Promise.all([
  s.from('discovery_projects').select('id,name,website_url,industry,main_services,target_customer,service_area,description,status,ai_management,naver_management').eq('id',projectId).maybeSingle(),
  s.from('discovery_questions').select('id,question').eq('project_id',projectId).eq('is_benchmark',true).order('id'),
  s.from('discovery_measurements').select('id,channel,is_discovered,measurement_round,created_at,question_id,result_text,source_urls,notes').eq('project_id',projectId).order('created_at',{ascending:false}),
  s.from('discovery_improvement_tasks').select('id,priority,title,status,summary,work_details,completed_at,created_at').eq('project_id',projectId).order('priority')
 ])
 const rows=m.data??[]
 const ids=[...new Set(rows.map((x:any)=>Number(x.question_id)).filter(Boolean))]
 let questionMap=new Map<number,string>()
 let questionError:string|null=null
 if(ids.length){
  const qr=await s.from('discovery_questions').select('id,question').in('id',ids)
  questionError=qr.error?.message??null
  questionMap=new Map((qr.data??[]).map((x:any)=>[Number(x.id),String(x.question)]))
 }
 const mm=rows.map((x:any)=>({...x,question:questionMap.get(Number(x.question_id))??null})) as CalendarMeasurement[]
 return{project:p.data as P|null,benchmarks:(q.data??[]) as B[],measurements:mm,tasks:(t.data??[]) as T[],error:p.error?.message??q.error?.message??m.error?.message??t.error?.message??questionError}
}
export default async function DiscoveryPage({params}:{params:{id:string}}){
 await requireStaff()
 const projectId=Number(params.id)
 const{project,benchmarks,measurements,tasks,error}=await getData(projectId);return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-8 md:pt-20"><header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">Damda Discovery</p><h1 className="text-3xl font-extrabold md:text-4xl">프로젝트 대시보드</h1><p className="mt-2 text-sm text-gray-500">선택한 업체의 질문·측정·개선·재측정 이력을 관리합니다.</p></div><div className="flex flex-wrap gap-2">{project?.naver_management&&<Link href={`/discovery/naver/projects/${projectId}`} className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-[#087A56]">네이버 진단 →</Link>}<Link href={'/discovery/archive/projects/'+projectId} className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">분석 아카이브</Link><Link href="/discovery" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">회사 대시보드 ←</Link>{projectId===1&&<Link href="/client/demo" className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-bold text-[#087A56]">고객 화면 미리보기 →</Link>}</div></header>{error&&<div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">DB 연결 확인 필요: {error}</div>}{project&&<section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Project</p><h2 className="mt-1 text-xl font-bold">{project.name}</h2><p className="mt-2 text-sm text-gray-500">{project.description||'프로젝트 설명이 아직 없습니다.'}</p></div>{project.website_url&&<span className="text-sm text-gray-500">{project.website_url}</span>}</div><div className="mt-4 grid gap-3 text-sm md:grid-cols-4"><div><span className="text-gray-400">업종</span><p className="font-semibold">{project.industry||'-'}</p></div><div><span className="text-gray-400">주요 서비스</span><p className="font-semibold">{project.main_services||'-'}</p></div><div><span className="text-gray-400">대상 고객</span><p className="font-semibold">{project.target_customer||'-'}</p></div><div><span className="text-gray-400">서비스 지역</span><p className="font-semibold">{project.service_area||'-'}</p></div></div><ServiceSelector id={projectId} ai={project.ai_management} naver={project.naver_management}/></section>}{project?.ai_management&&<><ProjectOnboarding projectId={projectId} benchmarks={benchmarks} measurementCount={measurements.length}/><Day0Analyzer projectId={projectId} ready={benchmarks.length>0&&measurements.some((measurement:any)=>measurement.measurement_round==='Day 0'&&benchmarks.some((benchmark:any)=>Number(benchmark.id)===Number(measurement.question_id)))}/><DashboardExplorer projectName={project?.name??'프로젝트'} measurements={measurements} benchmarks={benchmarks} tasks={tasks}/></>}<footer className="mt-8 text-center text-xs text-gray-400">Damda Discovery Project Dashboard · Supabase Connected</footer></div></div>}
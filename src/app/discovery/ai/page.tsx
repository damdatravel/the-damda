import {cycleSchedule} from '../../../lib/discovery/measurementCycle'
import {projectLogoUrl} from '../../../lib/projectLogo'
import ProjectIcon from '../ProjectIcon'
import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
import {requireStaff} from '../../../lib/requireStaff'

export const dynamic='force-dynamic'
export const revalidate=0
type Project={id:number;name:string|null;website_url:string|null}
type Task={project_id:number;status:string;completed_at:string|null}
const dayKey=(iso:string)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))
function addDays(iso:string,days:number){const d=new Date(iso);d.setDate(d.getDate()+days);return dayKey(d.toISOString())}

export default async function AiManagement(){
 await requireStaff()
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 let projects:Project[]=[],tasks:Task[]=[],questions:{project_id:number}[]=[],measurements:{project_id:number;created_at:string}[]=[]
 let error:string|null=null
 if(url&&key){
  const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
  const [p,t,q,m]=await Promise.all([
   s.from('discovery_projects').select('id,name,website_url').eq('ai_management',true).order('id'),
   s.from('discovery_improvement_tasks').select('project_id,status,completed_at'),
   s.from('discovery_questions').select('project_id').eq('is_benchmark',true),
   s.from('discovery_measurements').select('project_id,created_at')
  ])
  projects=p.data||[];tasks=t.data||[];questions=q.data||[];measurements=m.data||[]
  error=p.error?.message??t.error?.message??q.error?.message??m.error?.message??null
 }else error='Supabase 환경변수를 확인해 주세요.'
 const today=dayKey(new Date().toISOString())
 const rows=projects.map(p=>{
  const done=tasks.filter(t=>t.project_id===p.id&&t.status==='effect_confirmed'&&t.completed_at).sort((a,b)=>new Date(b.completed_at!).getTime()-new Date(a.completed_at!).getTime())
  const schedule=cycleSchedule(measurements.filter(m=>m.project_id===p.id).map(m=>m.created_at))
  return {...p,completed:done.length,next:schedule.find(x=>x.date>=today)??null}
 })
 const workflow=rows.flatMap(r=>{
  const projectTasks=tasks.filter(t=>t.project_id===r.id),open=projectTasks.filter(t=>t.status!=='effect_confirmed').length
  const items:{projectId:number;projectName:string;label:string;detail:string}[]=[]
  const add=(label:string,detail:string)=>items.push({projectId:r.id,projectName:r.name||'프로젝트',label,detail})
  if(open)add('개선 작업 확인',`진행 중·검토 필요 ${open}건`)
  if(r.next)add(`Day ${r.next.day} 재측정`,r.next.date)
  if(!items.length){
   if(!questions.some(q=>q.project_id===r.id))add('질문·Benchmark 준비','질문 엔진에서 측정 질문을 지정하세요')
   else if(!measurements.some(m=>m.project_id===r.id))add('최초 정기 측정','Benchmark 질문의 기초 상태를 측정하세요')
   else if(!projectTasks.length)add('측정 결과 분석','최신 회차 종합 분석과 개선안을 검토하세요')
   else add('후속 측정 확인','개선 결과와 다음 측정 계획을 확인하세요')
  }
  return items
 }).slice(0,8)
 return <main className="min-h-screen bg-[#F4F7F6] px-5 pb-16 pt-24 text-[#0A0F1E] md:px-8"><div className="mx-auto max-w-7xl"><header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.22em] text-[#087A56]">Damda Discovery · Search & AI</p><h1 className="mt-2 text-3xl font-extrabold md:text-4xl">검색·AI 통합 관리</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">고객별 질문과 채널 측정, 개선 작업과 재측정을 관리합니다.</p></div><Link href="/discovery" className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-bold">← 회사 대시보드</Link></header>
 {error&&<div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">DB 연결 확인 필요: {error}</div>}
 <section className="mb-7 grid gap-4 md:grid-cols-3"><article className="rounded-2xl border border-gray-200 bg-white p-6"><h2 className="text-lg font-extrabold">질문과 측정</h2><p className="mt-2 text-sm leading-6 text-gray-500">업체별 질문 엔진에서 반복 측정할 질문을 선정하고 가능한 채널을 측정합니다.</p></article><article className="rounded-2xl border border-gray-200 bg-white p-6"><h2 className="text-lg font-extrabold">원인과 개선</h2><p className="mt-2 text-sm leading-6 text-gray-500">채널별 결과와 근거를 검토해 고칠 일을 정리합니다.</p></article><article className="rounded-2xl border border-gray-200 bg-white p-6"><h2 className="text-lg font-extrabold">재측정과 기록</h2><p className="mt-2 text-sm leading-6 text-gray-500">같은 질문으로 변화를 확인하고 작업 이력을 남깁니다.</p></article></section>
 <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]"><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Work Floor</p><h2 className="mt-1 text-xl font-bold">작업 플로어</h2><p className="mt-1 text-xs text-gray-400">전체 프로젝트에서 지금 확인할 작업과 가까운 재측정을 모아봅니다.</p></div><span className="text-sm font-bold text-gray-400">최대 8건</span></div><div className="mt-5 space-y-3">{workflow.length?workflow.map((w,i)=><div key={w.projectId+'-'+i} className="rounded-xl bg-amber-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-extrabold">{w.projectName}</p><p className="mt-1 text-sm text-amber-900">{w.label} · {w.detail}</p></div><Link href={`/discovery/projects/${w.projectId}`} className="text-xs font-bold text-[#087A56]">작업 열기 →</Link></div></div>):<p className="rounded-xl border border-dashed p-5 text-sm text-gray-500">현재 확인할 작업이 없습니다.</p>}</div></section>
 <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold">관리 프로젝트</h2><p className="mt-1 text-xs text-gray-400">업체를 선택하면 질문·측정·개선 화면으로 이동합니다.</p></div><span className="text-sm font-bold text-gray-400">총 {rows.length}개</span></div><div className="mt-5 space-y-3">{rows.map(r=><div key={r.id} className="rounded-xl border border-gray-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex min-w-0 items-start gap-3"><ProjectIcon logo={projectLogoUrl(r.id)} name={r.name} website={r.website_url} size="sm"/><div className="min-w-0"><p className="font-extrabold">{r.name||'프로젝트'}</p><p className="mt-1 break-all text-xs text-gray-400">{r.website_url||'웹사이트 미등록'} · 개선 완료 {r.completed}건</p><p className="mt-2 text-sm text-gray-600">{r.next?`다음 일정: Day ${r.next.day} · ${r.next.date}`:`다음 작업: ${workflow.find(w=>w.projectId===r.id)?.label||'프로젝트 확인'}`}</p></div></div><Link href={`/discovery/projects/${r.id}`} className="shrink-0 rounded-lg bg-[#0A0F1E] px-3 py-2 text-center text-xs font-bold text-white">프로젝트 대시보드</Link></div></div>)}{!rows.length&&<p className="text-sm text-gray-500">등록된 프로젝트가 없습니다.</p>}</div></section></div></div></main>
}

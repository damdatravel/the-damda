import Link from 'next/link'
import StaffLogoutButton from './StaffLogoutButton'
import {createClient} from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export const revalidate=0
type Project={id:number;name:string|null;website_url:string|null;status:string|null}
type Task={project_id:number;status:string;completed_at:string|null}
function dayKey(iso:string){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))}
function addDays(iso:string,days:number){const d=new Date(iso);d.setDate(d.getDate()+days);return dayKey(d.toISOString())}
async function getData(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return{projects:[] as Project[],tasks:[] as Task[],error:'Supabase 환경변수를 확인해 주세요.'}
 const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const[p,t]=await Promise.all([
  s.from('discovery_projects').select('id,name,website_url,status').order('id'),
  s.from('discovery_improvement_tasks').select('project_id,status,completed_at').not('completed_at','is',null)
 ])
 return{projects:(p.data??[]) as Project[],tasks:(t.data??[]) as Task[],error:p.error?.message??t.error?.message??null}
}
export default async function CompanyDashboard(){
 const{projects,tasks,error}=await getData()
 const today=dayKey(new Date().toISOString())
 const rows=projects.map(p=>{const done=tasks.filter(t=>t.project_id===p.id&&t.status==='effect_confirmed'&&t.completed_at).sort((a,b)=>new Date(b.completed_at!).getTime()-new Date(a.completed_at!).getTime());const base=done[0]?.completed_at;const schedule=base?[7,15,30,45,60,75,90].map(day=>({day,date:addDays(base,day)})):[];const next=schedule.find(x=>x.date>=today)??null;return{...p,completed:done.length,next}})
 const due=rows.filter(r=>r.next).sort((a,b)=>a.next!.date.localeCompare(b.next!.date))
 return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-8 md:pt-20">
  <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">The Damda Discovery</p><h1 className="text-3xl font-extrabold md:text-4xl">회사 대시보드</h1><p className="mt-2 text-sm text-gray-500">모든 고객 프로젝트의 다음 작업과 운영 상태를 한 곳에서 확인합니다.</p></div><div className="flex gap-2"><Link href="/discovery/projects/1" className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white">더담다 프로젝트 열기 →</Link><StaffLogoutButton/></div></header>
  {error&&<div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">DB 연결 확인 필요: {error}</div>}
  <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4"><Stat label="관리 프로젝트" value={rows.length}/><Stat label="재측정 예정" value={due.length}/><Stat label="완료 개선 작업" value={tasks.filter(t=>t.status==='effect_confirmed').length}/><Stat label="오늘 재측정" value={due.filter(r=>r.next?.date===today).length}/></section>
  <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]"><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-bold">다음 작업</h2><p className="mt-1 text-xs text-gray-400">가까운 재측정 일정부터 표시합니다.</p><div className="mt-5 space-y-3">{due.length?due.slice(0,8).map(r=><div key={r.id} className="rounded-xl bg-amber-50 p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-extrabold">{r.name||'프로젝트'}</p><p className="mt-1 text-sm text-amber-900">Day {r.next!.day} 재측정 · {r.next!.date}</p></div>{r.id===1&&<Link href="/discovery/projects/1" className="text-xs font-bold text-[#087A56]">열기 →</Link>}</div></div>):<p className="rounded-xl border border-dashed p-5 text-sm text-gray-500">예정된 재측정이 없습니다.</p>}</div></section>
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-bold">관리 프로젝트</h2><p className="mt-1 text-xs text-gray-400">회사 운영 화면 아래에 프로젝트별 관리 화면이 연결됩니다.</p><div className="mt-5 space-y-3">{rows.map(r=><div key={r.id} className="rounded-xl border border-gray-200 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-extrabold">{r.name||'프로젝트'}</p><p className="mt-1 text-xs text-gray-400">{r.website_url||'웹사이트 미등록'} · 개선 완료 {r.completed}건</p><p className="mt-2 text-sm text-gray-600">{r.next?`다음 일정: Day ${r.next.day} · ${r.next.date}`:'다음 재측정 일정 없음'}</p></div><div className="flex gap-2">{r.id===1?<><Link href="/discovery/projects/1" className="rounded-lg bg-[#0A0F1E] px-3 py-2 text-xs font-bold text-white">관리</Link><Link href="/client/demo" className="rounded-lg border px-3 py-2 text-xs font-bold">고객 화면</Link></>:<span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-bold text-gray-400">프로젝트 화면 준비 중</span>}</div></div></div>)}</div></section></div>
  <section className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-5"><p className="text-sm font-bold">운영 원칙</p><p className="mt-2 text-sm leading-relaxed text-gray-500">회사 대시보드는 전체 고객과 오늘 할 일을 관리하고, 프로젝트 대시보드는 실제 진단·Benchmark·측정·개선·재측정을 수행합니다. 고객용 대시보드는 내부 승인·오류·기술 정보는 숨기고 결과와 진행 상황만 제공합니다.</p></section>
 </div></div>
}
function Stat({label,value}:{label:string;value:number}){return <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-gray-500">{label}</p><p className="mt-2 text-4xl font-extrabold">{value}</p></article>}

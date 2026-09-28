import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
export const dynamic='force-dynamic'
export const revalidate=0
function dayKey(iso:string){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))}
function addDays(iso:string,days:number){const d=new Date(iso);d.setDate(d.getDate()+days);return dayKey(d.toISOString())}
async function getData(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return{project:null as any,benchmarks:0,measurements:[] as any[],tasks:[] as any[]}
 const s=createClient(url,key,{global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const[p,q,m,t]=await Promise.all([s.from('discovery_projects').select('id,name,website_url,description').eq('id',1).maybeSingle(),s.from('discovery_questions').select('id',{count:'exact',head:true}).eq('project_id',1).eq('is_benchmark',true),s.from('discovery_measurements').select('id,is_discovered,created_at,measurement_round').eq('project_id',1).order('created_at',{ascending:false}),s.from('discovery_improvement_tasks').select('id,title,status,completed_at').eq('project_id',1).order('priority')])
 return{project:p.data,benchmarks:q.count??0,measurements:m.data??[],tasks:t.data??[]}
}
export default async function ClientDemo(){
 const{project,benchmarks,measurements,tasks}=await getData()
 const completed=tasks.filter((t:any)=>t.status==='effect_confirmed')
 const base=completed.filter((t:any)=>t.completed_at).sort((a:any,b:any)=>new Date(b.completed_at).getTime()-new Date(a.completed_at).getTime())[0]?.completed_at
 const today=dayKey(new Date().toISOString()),schedule=base?[7,30,60,90].map(day=>({day,date:addDays(base,day)})):[],next=schedule.find(x=>x.date>=today)
 const found=measurements.filter((m:any)=>m.is_discovered).length
 return <div className="min-h-screen bg-[#F7F9F8] text-[#0A0F1E]"><div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
  <header className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">Discovery Client</p><div className="mt-2 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><h1 className="text-3xl font-extrabold">{project?.name||'고객사'} 발견 관리</h1><p className="mt-2 text-sm text-gray-500">검색과 AI에서 발견될 수 있는 기반을 만들고 변화 과정을 기록합니다.</p></div><span className="w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">운영 중</span></div></header>
  <section className="grid gap-4 sm:grid-cols-3"><Card label="Benchmark 질문" value={String(benchmarks)} note="같은 질문으로 변화를 비교합니다."/><Card label="현재 측정 기록" value={String(measurements.length)} note={`발견 기록 ${found}건`}/><Card label="다음 재측정" value={next?`Day ${next.day}`:'예정 없음'} note={next?.date||'일정 준비 중'}/></section>
  <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">이번 진행 상황</h2><p className="mt-1 text-sm text-gray-500">내부 기술 작업이 아니라 고객이 확인할 수 있는 완료 결과만 보여드립니다.</p><div className="mt-5 space-y-3">{completed.map((t:any)=><div key={t.id} className="flex items-start gap-3 rounded-xl bg-gray-50 p-4"><span className="mt-0.5 text-emerald-600">✓</span><div><p className="font-bold">{t.title}</p><p className="mt-1 text-xs text-gray-400">{t.completed_at?dayKey(t.completed_at):'완료'}</p></div></div>)}</div></section>
  <section className="mt-6 grid gap-6 md:grid-cols-2"><div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">측정 기준</h2><p className="mt-3 text-sm leading-relaxed text-gray-600">처음 정한 Benchmark 질문을 유지해 Day0와 이후 재측정을 비교합니다. 질문을 임의로 바꾸지 않아 변화 흐름을 확인할 수 있습니다.</p></div><div className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-lg font-bold text-amber-950">다음 일정</h2><p className="mt-3 text-sm text-amber-900">{next?`${next.date}에 Day ${next.day} 재측정을 진행할 예정입니다.`:'다음 재측정 일정을 준비하고 있습니다.'}</p></div></section>
  <div className="mt-8 border-t pt-5 text-center"><p className="text-xs text-gray-400">고객용 대시보드 V0.1 미리보기 · 로그인/권한 분리는 다음 단계에서 연결합니다.</p><Link href="/discovery" className="mt-3 inline-block text-xs font-bold text-gray-500">← 내부 회사 대시보드</Link></div>
 </div></div>
}
function Card({label,value,note}:{label:string;value:string;note:string}){return <article className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-gray-500">{label}</p><p className="my-2 text-3xl font-extrabold">{value}</p><p className="text-xs text-gray-400">{note}</p></article>}

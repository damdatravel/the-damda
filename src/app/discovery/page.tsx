import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type DiscoveryProject = {
  id:number; name:string|null; website_url:string|null; industry:string|null; main_services:string|null;
  target_customer:string|null; service_area:string|null; description:string|null; status:string|null
}
type Measurement={id:number;channel:string;is_discovered:boolean;measurement_round:string|null;created_at:string;question_id:number}
type DashboardData={project:DiscoveryProject|null;benchmarkCount:number;measurements:Measurement[];error:string|null}

async function getData():Promise<DashboardData>{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return{project:null,benchmarkCount:0,measurements:[],error:'Supabase 환경변수를 확인해 주세요.'}
 const s=createClient(url,key)
 const [p,q,m]=await Promise.all([
  s.from('discovery_projects').select('id,name,website_url,industry,main_services,target_customer,service_area,description,status').order('id',{ascending:true}).limit(1).maybeSingle(),
  s.from('discovery_questions').select('id',{count:'exact',head:true}).eq('project_id',1).eq('is_benchmark',true),
  s.from('discovery_measurements').select('id,channel,is_discovered,measurement_round,created_at,question_id').eq('project_id',1).order('created_at',{ascending:false})
 ])
 return{project:p.data,benchmarkCount:q.count??0,measurements:m.data??[],error:p.error?.message??q.error?.message??m.error?.message??null}
}

function dayKey(iso:string){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))}
function channelLabel(c:string){return c==='Naver Search'?'Naver':c==='Google AI'?'Google AI Overview / AI Mode':c}
function shortChannel(c:string){return c==='Google Search'?'Google':c==='Naver Search'?'Naver':c==='Google AI'?'Google AI':c}

export default async function DiscoveryPage(){
 const{project,benchmarkCount,measurements,error}=await getData()
 const discovered=measurements.filter(x=>x.is_discovered).length
 const stats=[
  {label:'Benchmark 질문',value:String(benchmarkCount),note:benchmarkCount?'반복 측정할 기준 질문입니다.':'아직 등록된 질문이 없습니다.'},
  {label:'측정 기록',value:String(measurements.length),note:measurements.length?'저장된 채널별 측정 기록입니다.':'Day 0 측정 전입니다.'},
  {label:'발견',value:String(discovered),note:measurements.length?'전체 측정 중 발견된 기록입니다.':'측정 후 집계됩니다.'},
  {label:'검토 대기',value:'0',note:'현재 대기 작업이 없습니다.'},
 ]
 const searchChannels=['Google Search','Naver']
 const aiChannels=['ChatGPT','Gemini','Perplexity','Claude','Copilot']
 const googleAiChannels=['Google AI Overview / AI Mode']
 const latestByChannel=new Map<string,Measurement>()
 for(const m of measurements){const k=channelLabel(m.channel);if(!latestByChannel.has(k))latestByChannel.set(k,m)}
 const today=new Date()
 const y=today.getFullYear(),mo=today.getMonth()
 const first=new Date(y,mo,1),start=new Date(y,mo,1-first.getDay())
 const cells=Array.from({length:35},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d})
 const grouped=new Map<string,Measurement[]>()
 for(const m of measurements){const k=dayKey(m.created_at);grouped.set(k,[...(grouped.get(k)??[]),m])}

 return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
  <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">The Damda Discovery</p><h1 className="text-3xl font-extrabold md:text-4xl">Discovery Dashboard</h1><p className="mt-2 text-sm text-gray-500">검색과 AI에서 더담다가 어떻게 발견되는지 기록하고 변화 과정을 측정합니다.</p></div><div className="flex flex-wrap gap-2"><Link href="/discovery/dimensions" className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white">질문 재료 →</Link><div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"><span className="text-gray-400">Project</span><span className="ml-3 font-bold">{project?.name??'프로젝트'}</span></div></div></header>
  {error&&<div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">DB 연결 확인 필요: {error}</div>}
  {project&&<section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Live Project Data</p><h2 className="mt-1 text-xl font-bold">{project.name}</h2><p className="mt-2 text-sm text-gray-500">{project.description||'프로젝트 설명이 아직 없습니다.'}</p></div>{project.website_url&&<span className="text-sm text-gray-500">{project.website_url}</span>}</div><div className="mt-4 grid gap-3 text-sm md:grid-cols-4"><div><span className="text-gray-400">업종</span><p className="font-semibold">{project.industry||'-'}</p></div><div><span className="text-gray-400">주요 서비스</span><p className="font-semibold">{project.main_services||'-'}</p></div><div><span className="text-gray-400">대상 고객</span><p className="font-semibold">{project.target_customer||'-'}</p></div><div><span className="text-gray-400">서비스 지역</span><p className="font-semibold">{project.service_area||'-'}</p></div></div></section>}
  <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map(x=><article key={x.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-gray-500">{x.label}</p><p className="my-2 text-4xl font-extrabold">{x.value}</p><p className="text-xs leading-relaxed text-gray-400">{x.note}</p></article>)}</section>
  <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
   <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-bold">Activity Calendar</h2><p className="mt-1 text-sm text-gray-400">측정과 작업 이력이 날짜별로 쌓입니다.</p></div><span className="rounded-full bg-[#E8FAF3] px-3 py-1 text-xs font-bold text-[#087A56]">Day 0</span></div>
    <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400">{['일','월','화','수','목','금','토'].map(d=><div key={d} className="py-2">{d}</div>)}{cells.map((d,i)=>{const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,items=grouped.get(k)??[],inMonth=d.getMonth()===mo;return <div key={i} className={"min-h-20 rounded-lg border p-1 text-left "+(items.length?'border-emerald-200 bg-emerald-50':'border-gray-100 bg-[#FAFBFB]')+(inMonth?'':' opacity-40')}><span className="text-[10px] text-gray-400">{d.getDate()}</span>{items.slice(0,3).map(m=><div key={m.id} className="mt-1 truncate rounded bg-white px-1 py-0.5 text-[9px] font-semibold">{shortChannel(m.channel)} · {m.is_discovered?'발견':'미발견'}</div>)}{items.length>3&&<div className="mt-1 text-[9px] text-gray-500">+{items.length-3}건</div>}</div>})}</div>
    {measurements.length===0?<div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">아직 기록된 활동이 없습니다. 첫 측정과 작업부터 자동 기록을 시작합니다.</div>:<div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">측정 기록 {measurements.length}건이 캘린더에 자동 반영되었습니다.</div>}
   </section>
   <div className="space-y-6"><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-bold">채널 현황</h2><p className="mt-1 text-xs text-gray-400">V0.1 핵심 측정: Google Search + ChatGPT · Gemini · Perplexity</p><div className="mt-5 space-y-5"><ChannelGroup title="검색" channels={searchChannels} core={['Google Search']} latest={latestByChannel}/><ChannelGroup title="AI 발견" channels={aiChannels} core={['ChatGPT','Gemini','Perplexity']} latest={latestByChannel}/><ChannelGroup title="Google AI" channels={googleAiChannels} core={[]} latest={latestByChannel}/></div></section>
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-bold">최근 작업</h2>{measurements.length?<div className="mt-5 space-y-2">{measurements.slice(0,6).map(m=><div key={m.id} className="rounded-xl bg-gray-50 p-3 text-sm"><span className="font-bold">{shortChannel(m.channel)}</span><span className="ml-2 text-gray-500">{m.measurement_round??'측정'} · {m.is_discovered?'발견':'미발견'}</span><div className="mt-1 text-xs text-gray-400">{new Date(m.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</div></div>)}</div>:<div className="mt-5 rounded-xl border border-dashed border-gray-300 p-5 text-center"><p className="text-sm font-semibold text-gray-500">작업 기록 0건</p></div>}</section>
   </div>
  </div><footer className="mt-8 text-center text-xs text-gray-400">Discovery V0.1 · Supabase Connected</footer>
 </div></div>
}

function ChannelGroup({title,channels,core,latest}:{title:string;channels:string[];core:string[];latest:Map<string,Measurement>}){
 return <div><p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">{title}</p><div className="space-y-2">{channels.map(c=>{const m=latest.get(c);return <div key={c} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><div className="flex items-center gap-2"><span className="font-semibold">{c}</span>{core.includes(c)&&<span className="rounded-full bg-[#E8FAF3] px-2 py-0.5 text-[10px] font-bold text-[#087A56]">V0.1</span>}</div><span className={"text-sm "+(m?(m.is_discovered?'text-emerald-600':'text-gray-600'):'text-gray-400')}>{m?(m.is_discovered?'발견':'미발견'):'측정 전'}</span></div>})}</div></div>
}

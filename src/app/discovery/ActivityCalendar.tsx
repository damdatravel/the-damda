'use client'
import {useState} from 'react'

export type CalendarMeasurement={
 id:number;channel:string;is_discovered:boolean;measurement_round:string|null;created_at:string;question_id:number;
 result_text:string|null;source_urls:string|null;notes:string|null;question:string|null
}
export type CalendarTask={id:number;priority:number;title:string;status:string;summary:string|null;work_details:string[];completed_at:string|null;created_at:string}
function dayKey(iso:string){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))}
function shortChannel(c:string){return c==='Google Search'?'Google':c==='Naver Search'?'Naver':c==='Google AI'?'Google AI':c==='OpenAI Web Search API'?'OpenAI Web':'Gemini'===c?'Gemini':c}
function dateLabel(key:string){const[y,m,d]=key.split('-').map(Number);return `${m}월 ${d}일 측정 기록`}
export default function ActivityCalendar({measurements,tasks}:{measurements:CalendarMeasurement[];tasks:CalendarTask[]}){
 const[selectedTask,setSelectedTask]=useState<CalendarTask|null>(null)
 const[selected,setSelected]=useState<CalendarMeasurement|null>(null)
 const[selectedDay,setSelectedDay]=useState<{key:string;items:CalendarMeasurement[]}|null>(null)
 const today=new Date(),y=today.getFullYear(),mo=today.getMonth()
 const first=new Date(y,mo,1),start=new Date(y,mo,1-first.getDay())
 const cells=Array.from({length:35},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d})
 const grouped=new Map<string,CalendarMeasurement[]>()
 const taskGrouped=new Map<string,CalendarTask[]>()
 for(const m of measurements){const k=dayKey(m.created_at);grouped.set(k,[...(grouped.get(k)??[]),m])}
 for(const t of tasks){const k=dayKey(t.completed_at||t.created_at);taskGrouped.set(k,[...(taskGrouped.get(k)??[]),t])}
 const openDetail=(m:CalendarMeasurement)=>{setSelectedDay(null);setSelected(m)}
 return <>
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
   <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-bold">Activity Calendar</h2><p className="mt-1 text-sm text-gray-400">날짜를 누르면 그날의 전체 측정 기록을 볼 수 있습니다.</p></div><span className="rounded-full bg-[#E8FAF3] px-3 py-1 text-xs font-bold text-[#087A56]">Day 0</span></div>
   <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400">{['일','월','화','수','목','금','토'].map(d=><div key={d} className="py-2">{d}</div>)}{cells.map((d,i)=>{const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,items=grouped.get(k)??[],dayTasks=taskGrouped.get(k)??[],inMonth=d.getMonth()===mo;return <div key={i} onClick={()=>items.length&&setSelectedDay({key:k,items})} className={"min-h-20 rounded-lg border p-1 text-left "+((items.length||dayTasks.length)?'cursor-pointer border-emerald-200 bg-emerald-50 hover:bg-emerald-100':'border-gray-100 bg-[#FAFBFB]')+(inMonth?'':' opacity-40')}><span className="text-[10px] text-gray-400">{d.getDate()}</span>{dayTasks.slice(0,1).map(t=><button type="button" key={'task-'+t.id} onClick={e=>{e.stopPropagation();setSelectedTask(t)}} title="작업 상세 보기" className="mt-1 block w-full truncate rounded bg-[#0A0F1E] px-1 py-0.5 text-left text-[9px] font-bold text-white hover:opacity-80">개선안 {t.priority} · {t.status==='effect_confirmed'?'완료 ✓':'적용 완료'}</button>)}{items.slice(0,dayTasks.length?2:3).map(m=><button type="button" key={m.id} onClick={e=>{e.stopPropagation();openDetail(m)}} title="측정 상세 보기" className="mt-1 block w-full truncate rounded bg-white px-1 py-0.5 text-left text-[9px] font-semibold hover:bg-emerald-100">{shortChannel(m.channel)} · {m.is_discovered?'발견':'미발견'}</button>)}{items.length>(dayTasks.length?2:3)&&<button type="button" onClick={e=>{e.stopPropagation();setSelectedDay({key:k,items})}} className="mt-1 text-[9px] font-bold text-[#087A56] hover:underline">+{items.length-(dayTasks.length?2:3)}건 전체보기</button>}</div>})}</div>
   {measurements.length===0?<div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">아직 기록된 활동이 없습니다. 첫 측정과 작업부터 자동 기록을 시작합니다.</div>:<div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">측정 기록 {measurements.length}건 · 개선 작업 {tasks.length}건이 캘린더에 자동 반영되었습니다. 날짜 또는 기록을 클릭하면 상세 내용을 볼 수 있습니다.</div>}
  </section>
  {selectedTask&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={()=>setSelectedTask(null)}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Improvement Work</p><h3 className="mt-1 text-xl font-extrabold">개선안 {selectedTask.priority} · {selectedTask.title}</h3><p className="mt-1 text-sm text-gray-500">{selectedTask.status==='effect_confirmed'?'완료 ✓':selectedTask.status==='completed'?'적용 완료':selectedTask.status}</p></div><button onClick={()=>setSelectedTask(null)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold">닫기</button></div>{selectedTask.summary&&<Block label="작업 요약" value={selectedTask.summary}/>}<div className="mt-5"><p className="mb-2 text-sm font-bold">실제 작업 내용</p><div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4">{selectedTask.work_details.map((x,i)=><p key={i} className="text-sm leading-relaxed"><b>{i+1}.</b> {x}</p>)}</div></div><Info label="완료 일시" value={new Date(selectedTask.completed_at||selectedTask.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}/></div></div>}
  {selectedDay&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={()=>setSelectedDay(null)}>
   <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Daily Measurements</p><h3 className="mt-1 text-xl font-extrabold">{dateLabel(selectedDay.key)} ({selectedDay.items.length}건)</h3><p className="mt-1 text-sm text-gray-500">확인할 기록을 선택하세요.</p></div><button onClick={()=>setSelectedDay(null)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold">닫기</button></div>
    <div className="mt-5 space-y-3">{selectedDay.items.map(m=><button key={m.id} onClick={()=>openDetail(m)} className="w-full rounded-xl border border-gray-200 bg-gray-50 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-extrabold">{shortChannel(m.channel)}</span><span className={"rounded-full px-2 py-1 text-xs font-bold "+(m.is_discovered?'bg-emerald-100 text-emerald-700':'bg-gray-200 text-gray-600')}>{m.is_discovered?'발견':'미발견'}</span></div><p className="mt-2 line-clamp-2 text-sm text-gray-600">{m.question||`질문 ID ${m.question_id}`}</p><p className="mt-2 text-xs text-gray-400">{new Date(m.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</p></button>)}</div>
   </div>
  </div>}
  {selected&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={()=>setSelected(null)}>
   <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={e=>e.stopPropagation()}>
    <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Measurement Detail</p><h3 className="mt-1 text-xl font-extrabold">{shortChannel(selected.channel)} · {selected.measurement_round??'측정'}</h3></div><button onClick={()=>setSelected(null)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-bold">닫기</button></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><Info label="발견 여부" value={selected.is_discovered?'발견':'미발견'}/><Info label="측정 일시" value={new Date(selected.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}/><Info label="채널" value={selected.channel}/></div>
    <Block label="Benchmark 질문" value={selected.question||`질문 ID ${selected.question_id}`}/>
    <Block label="실제 결과 / 답변" value={selected.result_text||'기록 없음'}/>
    <Block label="출처 URL" value={selected.source_urls||'기록 없음'} links/>
    <Block label="메모" value={selected.notes||'기록 없음'}/>
   </div>
  </div>}
 </>
}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-xl bg-gray-50 p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 text-sm font-bold">{value}</p></div>}
function Block({label,value,links=false}:{label:string;value:string;links?:boolean}){return <div className="mt-5"><p className="mb-2 text-sm font-bold">{label}</p><div className="whitespace-pre-wrap break-words rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed">{links&&value!=='기록 없음'?value.split(/\s+/).map((v,i)=>/^https?:\/\//.test(v)?<a key={i} href={v} target="_blank" rel="noreferrer" className="block text-blue-600 underline">{v}</a>:<span key={i}>{v} </span>):value}</div></div>}

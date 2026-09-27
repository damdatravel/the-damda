'use client'
import {useState} from 'react'

export type CalendarMeasurement={
 id:number;channel:string;is_discovered:boolean;measurement_round:string|null;created_at:string;question_id:number;
 result_text:string|null;source_urls:string|null;notes:string|null;question:string|null
}
function dayKey(iso:string){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))}
function shortChannel(c:string){return c==='Google Search'?'Google':c==='Naver Search'?'Naver':c==='Google AI'?'Google AI':c}
export default function ActivityCalendar({measurements}:{measurements:CalendarMeasurement[]}){
 const[selected,setSelected]=useState<CalendarMeasurement|null>(null)
 const today=new Date(),y=today.getFullYear(),mo=today.getMonth()
 const first=new Date(y,mo,1),start=new Date(y,mo,1-first.getDay())
 const cells=Array.from({length:35},(_,i)=>{const d=new Date(start);d.setDate(start.getDate()+i);return d})
 const grouped=new Map<string,CalendarMeasurement[]>()
 for(const m of measurements){const k=dayKey(m.created_at);grouped.set(k,[...(grouped.get(k)??[]),m])}
 return <>
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
   <div className="mb-6 flex items-center justify-between"><div><h2 className="text-xl font-bold">Activity Calendar</h2><p className="mt-1 text-sm text-gray-400">측정 기록을 클릭하면 당시 질문과 결과를 확인할 수 있습니다.</p></div><span className="rounded-full bg-[#E8FAF3] px-3 py-1 text-xs font-bold text-[#087A56]">Day 0</span></div>
   <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400">{['일','월','화','수','목','금','토'].map(d=><div key={d} className="py-2">{d}</div>)}{cells.map((d,i)=>{const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,items=grouped.get(k)??[],inMonth=d.getMonth()===mo;return <div key={i} className={"min-h-20 rounded-lg border p-1 text-left "+(items.length?'border-emerald-200 bg-emerald-50':'border-gray-100 bg-[#FAFBFB]')+(inMonth?'':' opacity-40')}><span className="text-[10px] text-gray-400">{d.getDate()}</span>{items.slice(0,3).map(m=><button type="button" key={m.id} onClick={()=>setSelected(m)} title="측정 상세 보기" className="mt-1 block w-full truncate rounded bg-white px-1 py-0.5 text-left text-[9px] font-semibold hover:bg-emerald-100">{shortChannel(m.channel)} · {m.is_discovered?'발견':'미발견'}</button>)}{items.length>3&&<div className="mt-1 text-[9px] text-gray-500">+{items.length-3}건</div>}</div>})}</div>
   {measurements.length===0?<div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">아직 기록된 활동이 없습니다. 첫 측정과 작업부터 자동 기록을 시작합니다.</div>:<div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">측정 기록 {measurements.length}건이 캘린더에 자동 반영되었습니다. 기록을 클릭하면 상세 내용을 볼 수 있습니다.</div>}
  </section>
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

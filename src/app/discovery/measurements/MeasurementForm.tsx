'use client'
import {useState} from 'react'
import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'

type Props={questionId:number;question:string;projectId:number}
const channelGroups=[{label:'Core AI',values:['ChatGPT','Gemini']},{label:'Search',values:['Google Search','Naver Search']},{label:'Extended AI',values:['Google AI','Perplexity','Claude','Copilot']}]

export default function MeasurementForm({questionId,question,projectId}:Props){
 const[channel,setChannel]=useState('Google Search')
 const[discovered,setDiscovered]=useState('')
 const[result,setResult]=useState('')
 const[urls,setUrls]=useState('')
 const[notes,setNotes]=useState('')
 const[saving,setSaving]=useState(false)
 const[msg,setMsg]=useState('')
 const save=async()=>{
  if(discovered===''){setMsg('발견 여부를 선택해 주세요.');return}
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url||!key){setMsg('Supabase 환경변수를 확인해 주세요.');return}
  setSaving(true);setMsg('')
  const s=createClient(url,key)
  const{error}=await s.from('discovery_measurements').insert({project_id:projectId,question_id:questionId,channel,is_discovered:discovered==='yes',result_text:result||null,source_urls:urls||null,notes:notes||null,measurement_round:'Day 0'})
  setSaving(false)
  if(error){setMsg('저장 실패: '+error.message);return}
  setMsg(channel+' Day 0 측정을 저장했습니다.')
  setResult('');setUrls('');setNotes('');setDiscovered('')
 }
 return <div className="space-y-6">
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
   <p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Benchmark Question</p>
   <h2 className="mt-2 text-xl font-extrabold leading-relaxed">{question}</h2>
   <p className="mt-2 text-sm text-gray-500">Day 0에서는 홈페이지를 수정하기 전 현재 상태를 그대로 기록합니다.</p>
  </section>
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
   <div className="grid gap-5 md:grid-cols-2">
    <label className="text-sm font-bold">측정 채널<select value={channel} onChange={e=>setChannel(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 font-normal">{channelGroups.map(group=><optgroup key={group.label} label={group.label}>{group.values.map(x=><option key={x}>{x}</option>)}</optgroup>)}</select></label>
    <label className="text-sm font-bold">발견 여부<select value={discovered} onChange={e=>setDiscovered(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 font-normal"><option value="">선택</option><option value="yes">발견됨</option><option value="no">발견되지 않음</option></select></label>
   </div>
   <label className="mt-5 block text-sm font-bold">실제 결과 / 답변<textarea value={result} onChange={e=>setResult(e.target.value)} rows={7} placeholder="검색 결과나 AI 답변을 그대로 또는 필요한 범위로 기록" className="mt-2 w-full rounded-xl border border-gray-200 p-3 font-normal"/></label>
   <label className="mt-5 block text-sm font-bold">출처 URL<textarea value={urls} onChange={e=>setUrls(e.target.value)} rows={3} placeholder="관련 URL이 있으면 기록" className="mt-2 w-full rounded-xl border border-gray-200 p-3 font-normal"/></label>
   <label className="mt-5 block text-sm font-bold">메모<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="순위, 인용 여부, 특이사항 등" className="mt-2 w-full rounded-xl border border-gray-200 p-3 font-normal"/></label>
   {msg&&<div className={"mt-5 rounded-xl border p-3 text-sm "+(msg.startsWith('저장 실패')||msg.startsWith('발견 여부')?'border-red-200 bg-red-50 text-red-700':'border-emerald-200 bg-emerald-50 text-emerald-700')}>{msg}</div>}
   <div className="mt-5 flex gap-2"><button onClick={save} disabled={saving} className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white disabled:bg-gray-300">{saving?'저장 중...':'Day 0 기록 저장'}</button><Link href={"/discovery/projects/"+projectId+"/questions"} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold">질문으로 돌아가기</Link></div>
  </section>
 </div>
}

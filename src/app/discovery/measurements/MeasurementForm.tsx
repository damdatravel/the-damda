'use client'
import {useState} from 'react'
import Link from 'next/link'

type Props={questionId:number;question:string;projectId:number;initialChannel?:string}
const channelGroups=[{label:'Core AI',values:['ChatGPT']},{label:'Search',values:['Google Search','Naver Search']},{label:'Extended AI',values:['Google AI','Perplexity','Claude','Copilot']}]
const channels=channelGroups.flatMap(group=>group.values)

export default function MeasurementForm({questionId,question,projectId,initialChannel}:Props){
 const[channel,setChannel]=useState(channels.includes(initialChannel||'')?initialChannel!:'ChatGPT')
 const[discovered,setDiscovered]=useState('')
 const[result,setResult]=useState('')
 const[urls,setUrls]=useState('')
 const[notes,setNotes]=useState('')
 const[saving,setSaving]=useState(false)
 const[msg,setMsg]=useState('')
 const save=async()=>{
  if(discovered===''){setMsg('발견 여부를 선택해 주세요.');return}
  if(!result.trim()){setMsg('실제 답변을 입력해 주세요.');return}
  setSaving(true);setMsg('')
  try{
   const response=await fetch('/api/discovery/measure-manual',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,questionId,channel,discovered:discovered==='yes',result,urls,notes})})
   const data=await response.json()
   if(!response.ok)throw new Error(data.error||'저장 실패')
   setMsg(channel+' 측정 기록을 저장했습니다. 프로젝트 대시보드의 Day 0 분석에 포함됩니다.')
   setResult('');setUrls('');setNotes('');setDiscovered('')
  }catch(e:any){setMsg('저장 실패: '+e.message)}finally{setSaving(false)}
 }
 return <div className="space-y-6">
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
   <p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Benchmark Question</p>
   <h2 className="mt-2 text-xl font-extrabold leading-relaxed">{question}</h2>
   <p className="mt-2 text-sm text-gray-500">ChatGPT 실제 화면이나 선택한 검색·AI 채널에서 이 질문의 결과를 직접 확인해 기록합니다. OpenAI API 웹 검색 자동 측정과는 별도 결과입니다.</p>
  </section>
  <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
   <div className="grid gap-5 md:grid-cols-2">
    <label className="text-sm font-bold">측정 채널<select value={channel} onChange={e=>setChannel(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 font-normal">{channelGroups.map(group=><optgroup key={group.label} label={group.label}>{group.values.map(x=><option key={x}>{x}</option>)}</optgroup>)}</select></label>
    <label className="text-sm font-bold">발견 여부<select value={discovered} onChange={e=>setDiscovered(e.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 bg-white p-3 font-normal"><option value="">선택</option><option value="yes">발견됨</option><option value="no">발견되지 않음</option></select></label>
   </div>
   <label className="mt-5 block text-sm font-bold">실제 결과 / 답변<textarea value={result} onChange={e=>setResult(e.target.value)} rows={7} placeholder="검색 결과나 AI 답변을 그대로 또는 필요한 범위로 기록" className="mt-2 w-full rounded-xl border border-gray-200 p-3 font-normal"/></label>
   <label className="mt-5 block text-sm font-bold">출처 URL<textarea value={urls} onChange={e=>setUrls(e.target.value)} rows={3} placeholder="관련 URL이 있으면 기록" className="mt-2 w-full rounded-xl border border-gray-200 p-3 font-normal"/></label>
   <label className="mt-5 block text-sm font-bold">메모<textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="순위, 인용 여부, 특이사항 등" className="mt-2 w-full rounded-xl border border-gray-200 p-3 font-normal"/></label>
   {msg&&<div className={"mt-5 rounded-xl border p-3 text-sm "+(msg.startsWith('저장 실패')||msg.startsWith('발견 여부')||msg.startsWith('실제 답변')?'border-red-200 bg-red-50 text-red-700':'border-emerald-200 bg-emerald-50 text-emerald-700')}>{msg}</div>}
   <div className="mt-5 flex gap-2"><button onClick={save} disabled={saving} className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white disabled:bg-gray-300">{saving?'저장 중...':'Day 0 기록 저장'}</button><Link href={"/discovery/projects/"+projectId+"/questions"} className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold">질문으로 돌아가기</Link></div>
  </section>
 </div>
}

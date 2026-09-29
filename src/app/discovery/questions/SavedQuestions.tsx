'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
type Q={id:number;question:string;intent:string|null;dimension_count:number;is_benchmark:boolean;status:string;created_at:string}
type AutoChannel='gemini'|'openai'
export default function SavedQuestions({initial,projectId,projectName}:{initial:Q[];projectId:number;projectName:string}){
 const router=useRouter()
 const[qs,setQs]=useState(initial),[busy,setBusy]=useState<number|null>(null),[autoBusy,setAutoBusy]=useState<string|null>(null),[batchBusy,setBatchBusy]=useState(false),[msg,setMsg]=useState('')
 useEffect(()=>{
  const onSaved=(event:Event)=>{const detail=(event as CustomEvent<{projectId:number;questions:Q[]}>).detail;if(detail?.projectId===projectId&&Array.isArray(detail.questions)){setQs(detail.questions);setMsg('저장된 질문 목록을 갱신했습니다.')}}
  window.addEventListener('discovery-questions-saved',onSaved)
  const controller=new AbortController()
  fetch('/api/discovery/saved-questions?projectId='+projectId,{cache:'no-store',signal:controller.signal}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error||'목록 조회 실패');if(!Array.isArray(data.questions))throw new Error('질문 목록 응답이 올바르지 않습니다.');setQs(data.questions)}).catch(e=>{if(e.name!=='AbortError')setMsg('저장된 질문 조회 실패: '+e.message)})
  return()=>{controller.abort();window.removeEventListener('discovery-questions-saved',onSaved)}
 },[projectId])
 const toggle=async(q:Q)=>{setBusy(q.id);setMsg('');const next=!q.is_benchmark;try{const r=await fetch('/api/discovery/saved-questions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,id:q.id,isBenchmark:next})});const j=await r.json();if(!r.ok)throw new Error(j.error||'변경 실패');setQs(x=>x.map(v=>v.id===q.id?{...v,is_benchmark:next}:v));setMsg(next?'Benchmark로 지정했습니다.':'Benchmark 지정을 해제했습니다.')}catch(e:any){setMsg('변경 실패: '+e.message)}finally{setBusy(null)}}
 const requestMeasure=async(q:Q,channel:AutoChannel)=>{const r=await fetch('/api/discovery/measure-'+channel,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,questionId:q.id})});const j=await r.json();if(!r.ok)throw new Error(j.error||'자동 측정 실패');if(!j.verified||!j.measurementId)throw new Error('DB 저장 검증에 실패했습니다.');return j}
 const autoMeasure=async(q:Q,channel:AutoChannel)=>{const label=channel==='openai'?'OpenAI Web Search':'Gemini';const key=channel+'-'+q.id;setAutoBusy(key);setMsg('');try{const j=await requestMeasure(q,channel);router.refresh();setMsg(j.reused?label+' 오늘 이미 측정한 기록을 다시 표시했습니다. 새 API 호출이나 새 기록은 생성되지 않았습니다.':label+' 새 자동 측정 완료 · '+(j.discovered?projectName+' 발견':projectName+' 미발견')+' · 대시보드와 캘린더에 저장되었습니다.')}catch(e:any){setMsg(label+' 자동 측정 실패: '+e.message)}finally{setAutoBusy(null)}}
 const runAll=async()=>{
  const targets=qs.filter(q=>q.is_benchmark)
  if(!targets.length){setMsg('실패: 먼저 Benchmark 질문을 지정해 주세요.');return}
  const channels:AutoChannel[]=['gemini','openai']
  setBatchBusy(true)
  let saved=0,reused=0,discovered=0
  const failures:string[]=[]
  try{
   for(const channel of channels){
    const label=channel==='gemini'?'Gemini':'OpenAI 웹 API'
    for(let i=0;i<targets.length;i++){
     const q=targets[i]
     setMsg(`자동 측정 중 · ${label} ${i+1}/${targets.length}`)
     try{const j=await requestMeasure(q,channel);saved++;if(j.reused)reused++;if(j.discovered)discovered++}
     catch(e:any){failures.push(`${label} Q${qs.indexOf(q)+1}: ${e.message}`)}
    }
   }
   const summary=`자동 측정 완료 · DB 확인 ${saved}/${targets.length*channels.length} · 신규 ${saved-reused} · 오늘 기록 재사용 ${reused} · 발견 ${discovered}건`
   setMsg(failures.length?`${summary} · 실패 ${failures.length}건 (${failures.join(' / ')})`:`${summary} · 결과는 프로젝트 대시보드에 저장되었습니다.`)
   router.refresh()
  }finally{setBatchBusy(false)}
 }
 const n=qs.filter(q=>q.is_benchmark).length
 return <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Saved Questions</p><h2 className="mt-1 text-2xl font-extrabold">저장된 질문 / Benchmark</h2><p className="mt-2 text-sm text-gray-500">저장 {qs.length}개 · Benchmark {n}개 · Gemini와 OpenAI 웹 API를 한 번에 측정·저장합니다. ChatGPT 실제 화면 확인은 필요할 때만 기록합니다.</p></div><button onClick={runAll} disabled={batchBusy||autoBusy!==null||n===0} className="shrink-0 rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{batchBusy?'자동 측정 중...':`Benchmark 전체 자동 측정 (${n}개 · Gemini + OpenAI 웹 API)`}</button></div>{msg&&<div className={"mb-4 rounded-xl border p-3 text-sm "+(msg.includes('실패')?'border-red-200 bg-red-50 text-red-700':msg.includes('측정 중')||msg.includes('측정 시작')?'border-blue-200 bg-blue-50 text-blue-700':'border-emerald-200 bg-emerald-50 text-emerald-700')}>{msg} {!msg.includes('실패')&&<a href={'/discovery/projects/'+projectId} className="ml-2 font-bold underline">최신 대시보드 보기 →</a>}</div>}{qs.length===0?<div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">아직 저장된 질문이 없습니다.</div>:<div className="space-y-3">{qs.map((q,i)=><article key={q.id} className={'rounded-xl border p-4 '+(q.is_benchmark?'border-[#0A9B6C] bg-[#F0FBF7]':'border-gray-200 bg-[#FAFBFB]')}><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="mb-2 flex flex-wrap gap-2 text-[10px]"><span className="font-bold text-gray-400">Q{i+1}</span>{q.intent&&<span className="rounded-full bg-white px-2 py-1 text-gray-500">{q.intent}</span>}<span className="rounded-full bg-white px-2 py-1 text-gray-500">{q.dimension_count} dimensions</span>{q.is_benchmark&&<span className="rounded-full bg-[#0A9B6C] px-2 py-1 font-bold text-white">BENCHMARK</span>}</div><p className="font-bold leading-relaxed">{q.question}</p></div><button onClick={()=>toggle(q)} disabled={busy===q.id||batchBusy} className={'shrink-0 rounded-xl px-4 py-2 text-sm font-bold '+(q.is_benchmark?'border border-gray-200 bg-white text-gray-700':'bg-[#0A0F1E] text-white')}>{busy===q.id?'변경 중...':q.is_benchmark?'Benchmark 해제':'Benchmark 지정'}</button>{q.is_benchmark&&<><Link href={'/discovery/measurements?project='+projectId+'&question='+q.id} className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2 text-center text-sm font-bold text-gray-600">화면 결과 직접 기록</Link><button onClick={()=>autoMeasure(q,'gemini')} disabled={autoBusy!==null||batchBusy} className="shrink-0 rounded-xl border border-[#0A9B6C] bg-white px-4 py-2 text-sm font-bold text-[#087A56] disabled:opacity-50">{autoBusy==='gemini-'+q.id?'Gemini 측정 중...':'Gemini 자동 측정'}</button><button onClick={()=>autoMeasure(q,'openai')} disabled={autoBusy!==null||batchBusy} className="shrink-0 rounded-xl border border-[#0A0F1E] bg-white px-4 py-2 text-sm font-bold text-[#0A0F1E] disabled:opacity-50">{autoBusy==='openai-'+q.id?'OpenAI 측정 중...':'OpenAI 웹 API 측정'}</button></>}</div></article>)}</div>}</section>
}

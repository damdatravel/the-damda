'use client'
import {useEffect,useState} from 'react'
import Link from 'next/link'
import {useRouter} from 'next/navigation'
type Q={review_session_id?:string|null;goal_snapshot?:any;id:number;question:string;intent:string|null;dimension_count:number;is_benchmark:boolean;status:string;created_at:string}
type AutoChannel='gemini'|'openai'|'naver'|'perplexity'|'claude'
const channelGroups=[{title:'Core AI',channels:[{name:'OpenAI Web',key:'openai'},{name:'ChatGPT'},{name:'Gemini',key:'gemini'}]},{title:'Search',channels:[{name:'Google'},{name:'Naver 웹문서 API',key:'naver'},{name:'Naver 통합검색'}]},{title:'Extended AI',channels:[{name:'네이버 AI 브리핑'},{name:'네이버 쇼핑 AI'},{name:'Google AI'},{name:'Perplexity API',key:'perplexity'},{name:'Claude API',key:'claude'},{name:'Copilot'}]}] as const
export default function SavedQuestions({initial,projectId,projectName,naverReady=false,perplexityReady=false,claudeReady=false}:{initial:Q[];projectId:number;projectName:string;naverReady?:boolean;perplexityReady?:boolean;claudeReady?:boolean}){
 const router=useRouter()
 const[qs,setQs]=useState(initial),[busy,setBusy]=useState<number|null>(null),[batchBusy,setBatchBusy]=useState(false),[selectedChannels,setSelectedChannels]=useState<AutoChannel[]>(['gemini','openai',...(naverReady?['naver' as const]:[])]),[msg,setMsg]=useState('')
 useEffect(()=>{
  const onSaved=(event:Event)=>{const detail=(event as CustomEvent<{projectId:number;questions:Q[]}>).detail;if(detail?.projectId===projectId&&Array.isArray(detail.questions)){setQs(detail.questions);setMsg('저장된 질문 목록을 갱신했습니다.')}}
  window.addEventListener('discovery-questions-saved',onSaved)
  const controller=new AbortController()
  fetch('/api/discovery/saved-questions?projectId='+projectId,{cache:'no-store',signal:controller.signal}).then(async r=>{const data=await r.json();if(!r.ok)throw new Error(data.error||'목록 조회 실패');if(!Array.isArray(data.questions))throw new Error('질문 목록 응답이 올바르지 않습니다.');setQs(data.questions)}).catch(e=>{if(e.name!=='AbortError')setMsg('저장된 질문 조회 실패: '+e.message)})
  return()=>{controller.abort();window.removeEventListener('discovery-questions-saved',onSaved)}
 },[projectId])
 const toggle=async(q:Q)=>{setBusy(q.id);setMsg('');const next=!q.is_benchmark;try{const r=await fetch('/api/discovery/saved-questions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,id:q.id,isBenchmark:next})});const j=await r.json();if(!r.ok)throw new Error(j.error||'변경 실패');setQs(x=>x.map(v=>v.id===q.id?{...v,is_benchmark:next}:v));setMsg(next?'Benchmark로 지정했습니다.':'Benchmark 지정을 해제했습니다.')}catch(e:any){setMsg('변경 실패: '+e.message)}finally{setBusy(null)}}
 const requestMeasure=async(q:Q,channel:AutoChannel)=>{const r=await fetch('/api/discovery/measure-'+channel,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,questionId:q.id})});const j=await r.json();if(!r.ok)throw new Error(j.error||'자동 측정 실패');if(!j.verified||!j.measurementId)throw new Error('DB 저장 검증에 실패했습니다.');return j}
 const runAll=async()=>{
  const targets=qs.filter(q=>q.is_benchmark)
  if(!targets.length){setMsg('실패: 먼저 Benchmark 질문을 지정해 주세요.');return}
  const channels=selectedChannels
  if(!channels.length){setMsg('실패: 자동 측정할 채널을 선택해 주세요.');return}
  setBatchBusy(true)
  let saved=0,reused=0,discovered=0
  const failures:string[]=[]
  try{
   for(const channel of channels){
    const label={gemini:'Gemini',naver:'Naver 웹문서 API',openai:'OpenAI 웹 API',perplexity:'Perplexity API',claude:'Claude API'}[channel]
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
 const toggleChannel=(channel:AutoChannel)=>setSelectedChannels(current=>current.includes(channel)?current.filter(x=>x!==channel):[...current,channel])
 const n=qs.filter(q=>q.is_benchmark).length
 return <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Saved Questions</p><h2 className="mt-1 text-2xl font-extrabold">저장된 질문 / Benchmark</h2><p className="mt-2 text-sm text-gray-500">저장 {qs.length}개 · Benchmark {n}개 · 선택한 채널에서 기준 질문을 자동 측정합니다.</p></div><div className="mb-5 flex flex-wrap items-end justify-between gap-4 rounded-xl border border-emerald-100 bg-[#F7FBF9] p-4"><div><p className="text-sm font-extrabold">자동 측정할 채널</p><div className="mt-3 grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">{channelGroups.map(group=><div key={group.title}><p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[#087A56]">{group.title}</p><div className="space-y-2">{group.channels.map(channel=>{const key='key' in channel?channel.key:null;const enabled=!!key&&(key!=='naver'||naverReady)&&(key!=='perplexity'||perplexityReady)&&(key!=='claude'||claudeReady);return <label key={channel.name} className={'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm '+(enabled?'border-emerald-200 bg-white font-semibold':'border-gray-200 bg-gray-100 text-gray-400')} title={enabled?'자동 측정 가능':key==='naver'?'Naver API 키 필요':key==='perplexity'?'Perplexity API 키 필요':key==='claude'?'Anthropic API 키 필요':'자동 측정 연동 전'}><input type="checkbox" checked={key?selectedChannels.includes(key):false} disabled={!enabled||batchBusy} onChange={()=>{if(key)toggleChannel(key)}} className="h-4 w-4 accent-[#0A9B6C]"/><span>{channel.name}</span><span className="ml-auto text-[10px]">{enabled?'자동':key?'키 필요':'준비 중'}</span></label>})}</div></div>)}</div><p className="mt-2 text-xs text-gray-500">Naver 웹문서·Perplexity·Claude API는 각 키 등록 후 활성화됩니다. 네이버 AI 브리핑·쇼핑 AI는 질문별 ‘화면 결과 기록’에서 기록할 수 있습니다. 자동 측정 연동은 준비 중입니다. Google AI·Copilot도 화면 기록과 자동 측정을 구분합니다. API 결과와 실제 화면 결과는 구분해 기록합니다.</p></div><button onClick={runAll} disabled={batchBusy||n===0||selectedChannels.length===0} className="shrink-0 rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{batchBusy?'자동 측정 중...':`선택 채널 전체 측정 (${n}개 질문)`}</button></div>{msg&&<div className={"mb-4 rounded-xl border p-3 text-sm "+(msg.includes('실패')?'border-red-200 bg-red-50 text-red-700':msg.includes('측정 중')||msg.includes('측정 시작')?'border-blue-200 bg-blue-50 text-blue-700':'border-emerald-200 bg-emerald-50 text-emerald-700')}>{msg} {!msg.includes('실패')&&<a href={'/discovery/projects/'+projectId} className="ml-2 font-bold underline">최신 대시보드 보기 →</a>}</div>}{qs.length===0?<div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-400">아직 저장된 질문이 없습니다.</div>:<div className="space-y-3">{qs.map((q,i)=><article key={q.id} className={'rounded-xl border p-4 '+(q.is_benchmark?'border-[#0A9B6C] bg-[#F0FBF7]':'border-gray-200 bg-[#FAFBFB]')}><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_9rem_9rem] md:items-center"><div className="min-w-0"><div className="mb-2 flex flex-wrap gap-2 text-[10px]"><span className="font-bold text-gray-400">Q{i+1}</span>{q.intent&&<span className="rounded-full bg-white px-2 py-1 text-gray-500">{q.intent}</span>}<span className="rounded-full bg-white px-2 py-1 text-gray-500">{q.dimension_count} dimensions</span>{q.is_benchmark&&<span className="rounded-full bg-[#0A9B6C] px-2 py-1 font-bold text-white">BENCHMARK</span>}</div><p className="font-bold leading-relaxed">{q.question}</p>{q.review_session_id&&<p className="mt-2 text-xs text-gray-500">검토 이력 연결 · 당시 목표: {q.goal_snapshot?.searchGoal?.service||'목표 미등록'}</p>}</div><button onClick={()=>toggle(q)} disabled={busy===q.id||batchBusy} className={'w-full rounded-xl px-4 py-2 text-sm font-bold '+(q.is_benchmark?'border border-gray-200 bg-white text-gray-700':'bg-[#0A0F1E] text-white')}>{busy===q.id?'변경 중...':q.is_benchmark?'Benchmark 해제':'Benchmark 지정'}</button>{q.is_benchmark&&<><Link href={'/discovery/measurements?project='+projectId+'&question='+q.id} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-center text-sm font-bold text-gray-600">화면 결과 기록</Link></>}{!q.is_benchmark&&<span className="hidden md:block" aria-hidden="true"/>}</div></article>)}</div>}</section>
}

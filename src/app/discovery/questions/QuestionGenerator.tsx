'use client'
import { useMemo,useState } from 'react'
import { useRouter } from 'next/navigation'
type D={id:number;dimension_type:string;dimension_value:string;priority:number}
type C={question:string;intent:string;mode:string;ingredients:D[];combinationKey:string}
const allowed=['WHO','FOR_WHOM','WHERE','WHEN','SERVICE','PURPOSE','PROBLEM','CONDITION','PREFERENCE','URGENCY','ACTION']
const list=(a:D[],t:string)=>a.filter(x=>x.dimension_type===t).sort((x,y)=>y.priority-x.priority||x.id-y.id)
const clean=(a:Array<D|undefined>)=>a.filter(Boolean) as D[]
const key=(a:D[])=>a.slice().sort((x,y)=>x.dimension_type.localeCompare(y.dimension_type)||x.id-y.id).map(x=>x.dimension_type+':'+x.id).join('|')
function hasBatchim(s:string){const c=s.charCodeAt(s.length-1);return c>=0xac00&&c<=0xd7a3&&((c-0xac00)%28)!==0}
const object=(s:string)=>s+(hasBatchim(s)?'을':'를')
function problemSituation(value:string){
 if(/않음$/.test(value))return value.replace(/않음$/,'않는다면')
 if(/없음$/.test(value))return value.replace(/없음$/,'없다면')
 if(/어려움$/.test(value))return value.replace(/어려움$/,'어렵다면')
 return value.replace(/(?:라는|다는)? 문제$/,'')+' 때문에 고민이라면'
}
function usablePurpose(value:string){
 const phrase=value.trim()
 return phrase.length<=20&&!/어디서|어디로|어디든|누구나|모든|것|싶|진단|확인|현재 상태|필요|문제|불편|[가-힣](?:하다|하는|할|되다|되는|할 수)$/.test(phrase)
}
function normalizeService(value:string,where?:string,when?:string){
 let service=value.trim()
 if(where)service=service.replace(where,'').trim()
 if(when){const time=when.match(/당일|야간|새벽|주말|평일|오전|오후/)?.[0];if(time)service=service.replace(time,'').trim()}
 return service.replace(/\s+/g,' ').trim()||value.trim()
}
function serviceLabel(value:string){
 const text=value.replace(/^(?:인천공항|김포공항|공항|집|호텔|숙소|서울|수도권|[·,\/\s])+에서\s*/,'').replace(/^(?:집|호텔|숙소|서울|수도권|[·,\/\s])+까지\s*/,'').replace(/^(?:당일|야간|새벽|주말|평일)\s*/,'').trim()
 const match=text.match(/(?:캐리어|수하물|짐|가방)\s*(?:배송|운송|배달|보관)|(?:검색|AI 검색|홈페이지)\s*(?:노출|관리|진단|분석)/i)
 return match?.[0]??text
}
function placeVariants(value:string){
 const from=value.match(/(.+?)에서\s*(.+?)까지/)
 if(!from)return [value.trim()]
 const origins=from[1].split(/[·,/]|\s+또는\s+/).map(x=>x.trim()).filter(Boolean)
 const destinations=from[2].split(/[·,/]|\s+또는\s+/).map(x=>x.trim()).filter(Boolean)
 const variants=origins.flatMap(origin=>destinations.map(destination=>`${origin}에서 ${destination}까지`))
 return [...new Set(variants)]
}
function generate(a:D[],count:number){
 const places=list(a,'WHERE'),times=list(a,'WHEN'),where=places[0],when=times[0]
 const candidates=list(a,'SERVICE').filter(d=>!/어디서든|어디로든|책임지는|함께하는|솔루션|^(?:수거부터|처음부터)/i.test(d.dimension_value)).map(d=>({dimension:d,name:normalizeService(d.dimension_value,where?.dimension_value,when?.dimension_value)}))
 const services=candidates.sort((x,y)=>x.name.length-y.name.length).filter((x,i,all)=>!all.slice(0,i).some(v=>x.name.includes(v.name)||v.name.includes(x.name)))
 const marketingService=services.some(x=>/검색|광고|마케팅|SEO|GEO|AEO/i.test(x.name))
 const problems=list(a,'PROBLEM').filter(x=>marketingService||!/검색|노출|유입|홈페이지|SEO|GEO|AEO|진단|현재 상태|업체가 잘 나오/i.test(x.dimension_value))
 const purpose=list(a,'PURPOSE')[0]
 const out:C[]=[],seen=new Set<string>()
 if(!services.length)return out
 const placesToUse=where?placeVariants(where.dimension_value):[]
 const whenText=when?.dimension_value.match(/당일|야간|새벽|주말|평일|오전|오후/)?.[0]
 const timeText=whenText?whenText+' ':''
 const templates:Array<{intent:string;mode:string;write:(s:string,p?:string)=>string}>=[
  {intent:'발견/서비스 탐색',mode:'기본 질문',write:s=>`${s} 업체를 찾을 수 있나요?`},
  {intent:'발견/서비스 탐색',mode:'기본 질문',write:s=>`${object(s)} 맡길 만한 곳이 있나요?`},
  {intent:'비교/선택 탐색',mode:'상황 질문',write:s=>`${s} 업체를 고를 때 무엇을 확인해야 하나요?`},
  {intent:'가격/조건 탐색',mode:'상황 질문',write:s=>`${s} 요금은 얼마인가요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${s} 예약은 어떻게 하나요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${s} 신청하면 어떤 순서로 진행되나요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${s} 신청 전에 준비할 것이 있나요?`},
  {intent:'가격/조건 탐색',mode:'상황 질문',write:s=>`${s} 요금이 달라지는 경우는 언제인가요?`},
  {intent:'비교/선택 탐색',mode:'상황 질문',write:s=>`${s} 이용 후기는 어디에서 볼 수 있나요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${s} 예약이 가능한지 미리 알 수 있나요?`},
  {intent:'비교/선택 탐색',mode:'상황 질문',write:s=>`${s} 업체별 서비스 범위는 어떻게 다른가요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${s} 예약을 변경하거나 취소할 수 있나요?`}
 ]
 if(problems.length)templates.splice(2,0,{intent:'문제 인식 → 해결 탐색',mode:'상황 질문',write:(s,p)=>`${problemSituation(p??'')} ${object(s)} 이용할 때 무엇을 확인해야 하나요?`})
 for(let r=0;r<count*services.length*4&&out.length<count;r++){
  const template=templates[r%templates.length],service=services[Math.floor(r/templates.length)%services.length],problem=template.intent.startsWith('문제')?problems[Math.floor(r/(templates.length*services.length))%problems.length]:undefined
  const goal=!problem&&purpose&&r%templates.length===0&&usablePurpose(purpose.dimension_value)?purpose:undefined
  const ingredients=clean([service.dimension,where,when,problem,goal]).filter((x,i,all)=>all.findIndex(v=>v.id===x.id)===i)
  if(ingredients.length<2)continue
  const statement=template.write(serviceLabel(service.name),problem?.dimension_value)
  const goalText=goal?object(goal.dimension_value.trim())+' 위해 ':''
  const index=r%templates.length
  const place=placesToUse.length?placesToUse[index%placesToUse.length]:''
  const placeText=place?place+(/(에서|까지|으로|부터|에)$/.test(place)?' ':'에서 '):''
  const question=(placeText+(index%3===0?timeText:'')+goalText+statement).replace(/\s+/g,' ').trim()
  if(seen.has(question))continue
  seen.add(question)
  out.push({question,intent:template.intent,mode:ingredients.length>=5?'롱테일 질문':template.mode,ingredients,combinationKey:key(ingredients)+'|intent:'+r%templates.length})
 }
 return out
}
export default function QuestionGenerator({dimensions,projectId,ai=false}:{dimensions:D[];projectId:number;ai?:boolean}){const router=useRouter();const[count,setCount]=useState(12),[cs,setCs]=useState<C[]>([]),[sel,setSel]=useState<Set<string>>(new Set()),[saving,setSaving]=useState(false),[busy,setBusy]=useState(false),[msg,setMsg]=useState('');const active=useMemo(()=>dimensions.filter(x=>allowed.includes(x.dimension_type)),[dimensions]);const run=async()=>{setBusy(true);setMsg('');try{let generated:C[];if(ai){const response=await fetch('/api/discovery/generate-questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,count})});const data=await response.json();if(!response.ok)throw new Error(data.error||'질문 생성 실패');generated=data.questions}else generated=generate(active,count);setCs(generated);setSel(new Set());setMsg(generated.length?'':active.length<2?'질문을 만들려면 서로 다른 질문 재료가 최소 2개 필요합니다.':'현재 재료에서 조합 가능한 질문이 없습니다. SERVICE 등의 재료를 확인해 주세요.')}catch(e:any){setCs([]);setMsg(e.message||'질문을 만들지 못했습니다.')}finally{setBusy(false)}};const toggle=(k:string)=>{const n=new Set(sel);n.has(k)?n.delete(k):n.add(k);setSel(n)}
 const save=async()=>{const chosen=cs.filter(c=>sel.has(c.combinationKey));if(!chosen.length)return;setSaving(true);setMsg('');try{const response=await fetch('/api/discovery/saved-questions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,questions:chosen.map(c=>({question:c.question,intent:c.intent,ingredientIds:c.ingredients.map(x=>x.id)}))})});const data=await response.json();if(!response.ok)throw new Error(data.error||'저장 실패');setMsg(data.saved+'개 질문을 저장했습니다.'+(data.skipped?' 이미 저장된 '+data.skipped+'개는 건너뛰었습니다.':''));setSel(new Set());router.refresh()}catch(e:any){setMsg('저장 실패: '+e.message)}finally{setSaving(false)}}
 return <div className="space-y-6"><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Question Engine</p><h2 className="mt-1 text-2xl font-extrabold">질문 후보 생성</h2><p className="mt-2 text-sm text-gray-500">검토한 재료로 질문을 만든 뒤 필요한 후보를 골라 저장합니다.</p></div><div className="flex items-center gap-2"><label className="text-sm text-gray-500">후보 수</label><select value={count} onChange={e=>setCount(Number(e.target.value))} className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold">{[6,12,18,24].map(n=><option key={n}>{n}</option>)}</select><button onClick={run} disabled={busy} className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?'질문 생성 중...':'질문 생성'}</button></div></div></section>
 {msg&&cs.length===0&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{msg}</p>}
 {cs.length>0&&<section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold">생성 결과</h2><p className="mt-1 text-sm text-gray-400">{cs.length}개 후보 · {sel.size}개 선택</p></div><button onClick={save} disabled={sel.size===0||saving} className="rounded-xl bg-[#0A0F1E] px-4 py-2 text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-400">{saving?'저장 중...':sel.size+'개 질문 저장'}</button></div>{msg&&<div className={"mb-4 rounded-xl border p-3 text-sm "+(msg.startsWith('저장 실패')?'border-red-200 bg-red-50 text-red-700':'border-emerald-200 bg-emerald-50 text-emerald-700')}>{msg}</div>}<div className="space-y-3">{cs.map((c,i)=><article key={c.combinationKey} onClick={()=>toggle(c.combinationKey)} className={'cursor-pointer rounded-xl border p-4 '+(sel.has(c.combinationKey)?'border-[#0A9B6C] bg-[#F0FBF7]':'border-gray-200 bg-[#FAFBFB]')}><div className="flex gap-3"><div className={'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs '+(sel.has(c.combinationKey)?'border-[#0A9B6C] bg-[#0A9B6C] text-white':'border-gray-300')}>{sel.has(c.combinationKey)?'✓':''}</div><div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-gray-400">Q{i+1}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#087A56]">{c.mode}</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">{c.intent}</span><span className="text-[10px] text-gray-400">{c.ingredients.length} dimensions</span></div><p className="mt-2 font-bold leading-relaxed">{c.question}</p><div className="mt-3 flex flex-wrap gap-2">{c.ingredients.map(x=><span key={x.id} className="rounded-full bg-white px-2 py-1 text-[10px] text-gray-500"><b>{x.dimension_type}</b> · {x.dimension_value}</span>)}</div></div></div></article>)}</div></section>}</div>}

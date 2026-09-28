'use client'
import { useMemo,useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
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
function normalizeService(value:string,where?:string,when?:string){
 let service=value.trim()
 if(where)service=service.replace(where,'').trim()
 if(when){const time=when.match(/당일|야간|새벽|주말|평일|오전|오후/)?.[0];if(time)service=service.replace(time,'').trim()}
 return service.replace(/\s+/g,' ').trim()||value.trim()
}
function generate(a:D[],count:number){
 const places=list(a,'WHERE'),times=list(a,'WHEN'),where=places[0],when=times[0]
 const candidates=list(a,'SERVICE').map(d=>({dimension:d,name:normalizeService(d.dimension_value,where?.dimension_value,when?.dimension_value)}))
 const services=candidates.sort((x,y)=>x.name.length-y.name.length).filter((x,i,all)=>!all.slice(0,i).some(v=>x.name.includes(v.name)||v.name.includes(x.name)))
 const marketingService=services.some(x=>/검색|광고|마케팅|SEO|GEO|AEO/i.test(x.name))
 const problems=list(a,'PROBLEM').filter(x=>marketingService||!/검색|노출|유입|홈페이지|SEO|GEO|AEO|진단|현재 상태|업체가 잘 나오/i.test(x.dimension_value))
 const purpose=list(a,'PURPOSE')[0]
 const out:C[]=[],seen=new Set<string>()
 if(!services.length)return out
 const place=where?.dimension_value.trim()||''
 const placeText=place?place+(/(에서|까지|으로|부터|에)$/.test(place)?' ':'에서 '):''
 const whenText=when?.dimension_value.match(/당일|야간|새벽|주말|평일|오전|오후/)?.[0]
 const timeText=whenText?whenText+' ':''
 const templates:Array<{intent:string;mode:string;write:(s:string,p?:string)=>string}>=[
  {intent:'발견/서비스 탐색',mode:'기본 질문',write:s=>`${object(s)} 제공하는 업체는 어디서 찾을 수 있나요?`},
  {intent:'발견/서비스 탐색',mode:'기본 질문',write:s=>`${object(s)} 신청하려면 어디를 알아보면 되나요?`},
  {intent:'비교/선택 탐색',mode:'상황 질문',write:s=>`${s} 업체를 선택할 때 무엇을 비교해야 하나요?`},
  {intent:'가격/조건 탐색',mode:'상황 질문',write:s=>`${s} 비용은 어떻게 확인할 수 있나요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${object(s)} 이용하려면 어떻게 신청하나요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${s} 신청부터 이용까지 어떤 절차를 거치나요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${s} 신청 전에 준비해야 할 것이 있나요?`},
  {intent:'가격/조건 탐색',mode:'상황 질문',write:s=>`${s} 비용은 어떤 조건에 따라 달라지나요?`},
  {intent:'비교/선택 탐색',mode:'상황 질문',write:s=>`${s} 업체의 후기는 어디서 확인할 수 있나요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${s} 이용 가능 여부를 미리 확인할 수 있나요?`},
  {intent:'비교/선택 탐색',mode:'상황 질문',write:s=>`${s} 업체마다 제공 범위가 어떻게 다른가요?`},
  {intent:'이용/예약 탐색',mode:'상황 질문',write:s=>`${s} 신청 후 변경이나 취소는 어떻게 하나요?`}
 ]
 if(problems.length)templates.splice(2,0,{intent:'문제 인식 → 해결 탐색',mode:'상황 질문',write:(s,p)=>`${problemSituation(p??'')} ${object(s)} 이용하면 어떤 점을 확인해야 하나요?`})
 for(let r=0;r<count*services.length*4&&out.length<count;r++){
  const template=templates[r%templates.length],service=services[Math.floor(r/templates.length)%services.length],problem=template.intent.startsWith('문제')?problems[Math.floor(r/(templates.length*services.length))%problems.length]:undefined
  const goal=!problem&&purpose&&[0,3].includes(r%templates.length)&&!/싶|진단|확인|현재 상태|필요|문제|불편/.test(purpose.dimension_value)?purpose:undefined
  const ingredients=clean([service.dimension,where,when,problem,goal]).filter((x,i,all)=>all.findIndex(v=>v.id===x.id)===i)
  if(ingredients.length<2)continue
  const statement=template.write(service.name,problem?.dimension_value)
  const goalText=goal?object(goal.dimension_value.trim())+' 위해 ':''
  const question=(placeText+timeText+goalText+statement).replace(/\s+/g,' ').trim()
  if(seen.has(question))continue
  seen.add(question)
  out.push({question,intent:template.intent,mode:ingredients.length>=5?'롱테일 질문':template.mode,ingredients,combinationKey:key(ingredients)+'|intent:'+r%templates.length})
 }
 return out
}
const val=(c:C,t:string)=>c.ingredients.find(x=>x.dimension_type===t)?.dimension_value??null
export default function QuestionGenerator({dimensions,projectId}:{dimensions:D[];projectId:number}){const router=useRouter();const[count,setCount]=useState(12),[cs,setCs]=useState<C[]>([]),[sel,setSel]=useState<Set<string>>(new Set()),[saving,setSaving]=useState(false),[msg,setMsg]=useState('');const active=useMemo(()=>dimensions.filter(x=>allowed.includes(x.dimension_type)),[dimensions]);const run=()=>{const generated=generate(active,count);setCs(generated);setSel(new Set());setMsg(generated.length?'':active.length<3?'질문을 만들려면 서로 다른 질문 재료가 최소 3개 필요합니다.':'현재 재료에서 조합 가능한 질문이 없습니다. SERVICE, WHERE, WHEN 등의 재료를 확인해 주세요.')};const toggle=(k:string)=>{const n=new Set(sel);n.has(k)?n.delete(k):n.add(k);setSel(n)}
 const save=async()=>{const chosen=cs.filter(c=>sel.has(c.combinationKey));if(!chosen.length)return;const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key){setMsg('Supabase 환경변수를 확인해 주세요.');return}setSaving(true);setMsg('');const supabase=createClient(url,key);const rows=chosen.map(c=>({project_id:projectId,question:c.question,intent:c.intent,who:val(c,'WHO'),for_whom:val(c,'FOR_WHOM'),where_location:val(c,'WHERE'),purpose:val(c,'PURPOSE'),problem:val(c,'PROBLEM'),action:val(c,'ACTION'),service:val(c,'SERVICE'),dimension_count:c.ingredients.length,combination_key:c.combinationKey,is_duplicate:false,is_benchmark:false,status:'saved',notes:c.mode}));const{data:existing,error:readError}=await supabase.from('discovery_questions').select('combination_key').eq('project_id',projectId).in('combination_key',rows.map(r=>r.combination_key));if(readError){setSaving(false);setMsg('저장 전 확인 실패: '+readError.message);return}const existingKeys=new Set((existing??[]).map(x=>x.combination_key));const newRows=rows.filter(r=>!existingKeys.has(r.combination_key));const{error}=newRows.length?await supabase.from('discovery_questions').insert(newRows):{error:null};setSaving(false);if(error){setMsg('저장 실패: '+error.message);return}setMsg(newRows.length+'개 질문을 저장했습니다.'+(rows.length-newRows.length?' 이미 저장된 '+(rows.length-newRows.length)+'개는 건너뛰었습니다.':''));setSel(new Set());router.refresh()}
 return <div className="space-y-6"><section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">V0.4 Save Pipeline</p><h2 className="mt-1 text-2xl font-extrabold">질문 후보 생성</h2><p className="mt-2 text-sm text-gray-500">질문을 생성하고 필요한 후보를 선택해 Supabase에 실제 저장합니다.</p></div><div className="flex items-center gap-2"><label className="text-sm text-gray-500">후보 수</label><select value={count} onChange={e=>setCount(Number(e.target.value))} className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold">{[6,12,18,24].map(n=><option key={n}>{n}</option>)}</select><button onClick={run} className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white">질문 생성</button></div></div></section>
 {msg&&cs.length===0&&<p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{msg}</p>}
 {cs.length>0&&<section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="mb-5 flex items-center justify-between gap-4"><div><h2 className="text-xl font-bold">생성 결과</h2><p className="mt-1 text-sm text-gray-400">{cs.length}개 후보 · {sel.size}개 선택</p></div><button onClick={save} disabled={sel.size===0||saving} className="rounded-xl bg-[#0A0F1E] px-4 py-2 text-sm font-bold text-white disabled:bg-gray-200 disabled:text-gray-400">{saving?'저장 중...':sel.size+'개 질문 저장'}</button></div>{msg&&<div className={"mb-4 rounded-xl border p-3 text-sm "+(msg.startsWith('저장 실패')?'border-red-200 bg-red-50 text-red-700':'border-emerald-200 bg-emerald-50 text-emerald-700')}>{msg}</div>}<div className="space-y-3">{cs.map((c,i)=><article key={c.combinationKey} onClick={()=>toggle(c.combinationKey)} className={'cursor-pointer rounded-xl border p-4 '+(sel.has(c.combinationKey)?'border-[#0A9B6C] bg-[#F0FBF7]':'border-gray-200 bg-[#FAFBFB]')}><div className="flex gap-3"><div className={'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs '+(sel.has(c.combinationKey)?'border-[#0A9B6C] bg-[#0A9B6C] text-white':'border-gray-300')}>{sel.has(c.combinationKey)?'✓':''}</div><div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-gray-400">Q{i+1}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#087A56]">{c.mode}</span><span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">{c.intent}</span><span className="text-[10px] text-gray-400">{c.ingredients.length} dimensions</span></div><p className="mt-2 font-bold leading-relaxed">{c.question}</p><div className="mt-3 flex flex-wrap gap-2">{c.ingredients.map(x=><span key={x.id} className="rounded-full bg-white px-2 py-1 text-[10px] text-gray-500"><b>{x.dimension_type}</b> · {x.dimension_value}</span>)}</div></div></div></article>)}</div></section>}</div>}

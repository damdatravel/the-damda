'use client'
import {useEffect,useState} from 'react'
type Item={id:string;title:string;reason:string;action:string;status:'pending'|'approved'|'hold'}
const KEY='discovery_review_items_v01'
function parse(text:string):Item[]{
 const section=text.split('[우선 개선안]')[1]?.split('[Benchmark별 관찰]')[0]||''
 return section.split('\n').map(x=>x.trim()).filter(x=>/^\d+\./.test(x)).slice(0,7).map((line,i)=>{
  const body=line.replace(/^\d+\.\s*/,'');const p=body.split('|').map(x=>x.trim())
  return{id:'day0-'+i,title:p[0]||body,reason:p[1]||'',action:p.slice(2).join(' | ')||'',status:'pending' as const}
 })
}
export default function Day0Analyzer(){
 const[busy,setBusy]=useState(false),[result,setResult]=useState(''),[error,setError]=useState(''),[items,setItems]=useState<Item[]>([])
 useEffect(()=>{try{const x=localStorage.getItem(KEY);if(x)setItems(JSON.parse(x))}catch{}},[])
 const save=(next:Item[])=>{setItems(next);localStorage.setItem(KEY,JSON.stringify(next));window.dispatchEvent(new Event('discovery-review-change'))}
 const run=async()=>{setBusy(true);setError('');try{const r=await fetch('/api/discovery/analyze-day0',{method:'POST'});const j=await r.json();if(!r.ok)throw new Error(j.error||'분석 실패');setResult(j.analysis);const parsed=parse(j.analysis);if(parsed.length)save(parsed)}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 const status=(id:string,s:Item['status'])=>save(items.map(x=>x.id===id?{...x,status:s}:x))
 const edit=(id:string)=>{const x=items.find(v=>v.id===id);if(!x)return;const action=prompt('실제 작업 내용을 수정하세요.',x.action);if(action!==null)save(items.map(v=>v.id===id?{...v,action}:v))}
 return <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Day 0 Analysis</p><h2 className="mt-1 text-xl font-extrabold">미발견 원인 · 개선안 분석</h2><p className="mt-2 text-sm text-gray-500">Benchmark와 OpenAI Web Day 0 결과를 읽어 개선 과제를 만들고 승인·수정·보류합니다. 아직 홈페이지를 자동 수정하지 않습니다.</p></div><button onClick={run} disabled={busy} className="shrink-0 rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?'분석 중...':'Day 0 자동 분석'}</button></div>{error&&<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
 {items.length>0&&<div className="mt-6"><div className="mb-3 flex items-center justify-between"><h3 className="font-extrabold">개선 과제 검토</h3><span className="text-sm text-gray-500">대기 {items.filter(x=>x.status==='pending').length} · 승인 {items.filter(x=>x.status==='approved').length} · 보류 {items.filter(x=>x.status==='hold').length}</span></div><div className="space-y-3">{items.map((x,i)=><article key={x.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4"><div className="flex flex-col gap-3 md:flex-row md:justify-between"><div><p className="text-xs font-bold text-[#0A9B6C]">개선안 {i+1} · {x.status==='pending'?'검토 대기':x.status==='approved'?'승인됨':'보류'}</p><h4 className="mt-1 font-extrabold">{x.title}</h4>{x.reason&&<p className="mt-2 text-sm text-gray-600"><b>이유:</b> {x.reason}</p>}{x.action&&<p className="mt-1 text-sm text-gray-600"><b>할 일:</b> {x.action}</p>}</div><div className="flex shrink-0 flex-wrap gap-2">{x.status!=='approved'&&<button onClick={()=>status(x.id,'approved')} className="rounded-lg bg-[#0A9B6C] px-3 py-2 text-xs font-bold text-white">승인</button>}{x.status==='approved'&&<button onClick={()=>status(x.id,'pending')} className="rounded-lg border border-[#0A9B6C] bg-white px-3 py-2 text-xs font-bold text-[#087A56]">승인 취소</button>}<button onClick={()=>edit(x.id)} className="rounded-lg border bg-white px-3 py-2 text-xs font-bold">수정</button>{x.status!=='hold'&&<button onClick={()=>status(x.id,'hold')} className="rounded-lg border bg-white px-3 py-2 text-xs font-bold">보류</button>}{x.status==='hold'&&<button onClick={()=>status(x.id,'pending')} className="rounded-lg border bg-white px-3 py-2 text-xs font-bold">다시 검토</button>}</div></div></article>)}</div></div>}
 {result&&<details className="mt-5"><summary className="cursor-pointer text-sm font-bold text-gray-500">자동분석 원문 보기</summary><div className="mt-3 whitespace-pre-wrap rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-gray-800">{result}</div></details>}
 </section>
}

'use client'
import {useState} from 'react'

type Dimension={id:number;dimension_type:string;dimension_value:string;priority:number;is_active:boolean;source?:string;notes?:string}
export default function DimensionReview({projectId,dimensions,onDimensions}:{projectId:number;dimensions:Dimension[];onDimensions:(items:Dimension[])=>void}){
 const [editing,setEditing]=useState<number|null>(null),[value,setValue]=useState(''),[busy,setBusy]=useState<number|null>(null),[error,setError]=useState('')
 const update=async(item:Dimension,change:{value?:string;active?:boolean})=>{
  setBusy(item.id);setError('')
  try{const r=await fetch('/api/discovery/question-dimensions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,id:item.id,...change})});const j=await r.json();if(!r.ok)throw new Error(j.error||'변경 실패');onDimensions(dimensions.map(x=>x.id===item.id?j.dimension:x));setEditing(null)}catch(e:any){setError(e.message)}finally{setBusy(null)}
 }
 return <section className="rounded-2xl border border-gray-200 bg-white p-5 text-sm">
  <h2 className="text-lg font-bold">질문 재료 검토</h2><p className="mt-1 text-gray-500">잘못 추출된 재료는 비활성화하고, 표현이 어색하면 수정한 뒤 질문을 생성하세요.</p>
  {error&&<p className="mt-3 text-red-600">{error}</p>}
  <div className="mt-4 space-y-2">{dimensions.map(item=><div key={item.id} className="rounded-xl border border-gray-200 p-3"><div className="flex flex-wrap items-center gap-2"><span className="font-bold text-[#087A56]">{item.dimension_type}</span>{editing===item.id?<input aria-label="질문 재료 수정" className="min-w-40 flex-1 rounded border px-2 py-1" value={value} onChange={e=>setValue(e.target.value)}/>:<span className={item.is_active?'flex-1':'flex-1 text-gray-400 line-through'}>{item.dimension_value}</span>}{editing===item.id?<button disabled={busy===item.id} onClick={()=>update(item,{value})} className="rounded border px-2 py-1">저장</button>:<button onClick={()=>{setEditing(item.id);setValue(item.dimension_value)}} className="rounded border px-2 py-1">수정</button>}<button disabled={busy===item.id} onClick={()=>update(item,{active:!item.is_active})} className="rounded border px-2 py-1">{item.is_active?'제외':'다시 사용'}</button></div>{item.notes&&<p className="mt-1 text-xs text-gray-500">{item.source} · {item.notes}</p>}</div>)}</div>
 </section>
}

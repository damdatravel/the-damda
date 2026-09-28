'use client'
import {useState} from 'react'
type Dimension={id:number;dimension_type:string;dimension_value:string;priority:number;is_active:boolean}
export default function DimensionSeeder({projectId,onDimensions}:{projectId:number;onDimensions:(dimensions:Dimension[])=>void}){
 const [busy,setBusy]=useState(false),[msg,setMsg]=useState(''),[profile,setProfile]=useState<Array<{type:string;value:string;source:string;evidence:string}>>([])
 const run=async()=>{setBusy(true);setMsg('');try{const r=await fetch('/api/discovery/seed-dimensions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId})});const j=await r.json();if(!r.ok)throw new Error(j.error||'질문 재료 구성 실패');setProfile(j.profile||[]);onDimensions(j.dimensions||[]);setMsg('AI Source Profile에서 근거가 확인된 재료 '+j.added+'개를 추가했습니다. 활성 질문 재료 '+(j.dimensions||[]).filter((x:Dimension)=>x.is_active).length+'개를 불러왔습니다.')}catch(e:any){setMsg(e.message)}finally{setBusy(false)}}
 return <div className="mt-4"><button onClick={run} disabled={busy} className="rounded-xl bg-[#0A0F1E] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy?'추출 중...':'상담·홈페이지에서 AI Source Profile 추출'}</button>{msg&&<p className="mt-2 text-xs">{msg}</p>}{profile.length>0&&<details className="mt-3 rounded-xl border bg-white p-3 text-sm"><summary className="cursor-pointer font-bold">추출 근거 {profile.length}개 보기</summary><div className="mt-3 space-y-2">{profile.map((x,i)=><p key={i}><b>{x.type}</b> · {x.value} <span className="text-gray-500">({x.source}: {x.evidence})</span></p>)}</div></details>}</div>
}

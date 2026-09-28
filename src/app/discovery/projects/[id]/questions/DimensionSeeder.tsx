'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
export default function DimensionSeeder({projectId}:{projectId:number}){
 const router=useRouter(),[busy,setBusy]=useState(false),[msg,setMsg]=useState('')
 const run=async()=>{setBusy(true);setMsg('');try{const r=await fetch('/api/discovery/seed-dimensions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId})});const j=await r.json();if(!r.ok)throw new Error(j.error||'질문 재료 구성 실패');setMsg('질문 재료 '+j.added+'개를 추가했습니다.');router.refresh()}catch(e:any){setMsg(e.message)}finally{setBusy(false)}}
 return <div className="mt-4"><button onClick={run} disabled={busy} className="rounded-xl bg-[#0A0F1E] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy?'구성 중...':'진단 자료로 질문 재료 구성'}</button>{msg&&<p className="mt-2 text-xs">{msg}</p>}</div>
}
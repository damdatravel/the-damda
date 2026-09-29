'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'

export default function ServiceSelector({id,ai,naver}:{id:number;ai:boolean;naver:boolean}){
 const router=useRouter(),[value,setValue]=useState({ai_management:ai,naver_management:naver}),[busy,setBusy]=useState(false),[error,setError]=useState('')
 async function change(key:'ai_management'|'naver_management'){
  const next={...value,[key]:!value[key]}
  if(!next.ai_management&&!next.naver_management){setError('최소 한 서비스를 선택해 주세요.');return}
  setBusy(true);setError('')
  try{const response=await fetch(`/api/discovery/projects/${id}/services`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(next)});const data=await response.json();if(!response.ok)throw new Error(data.error||'서비스 변경 실패');setValue(next);router.refresh()}
  catch(e){setError(e instanceof Error?e.message:'서비스 변경 실패')}
  finally{setBusy(false)}
 }
 return <div className="mt-5 border-t border-gray-100 pt-4"><p className="text-sm font-bold">관리 서비스</p><p className="mt-1 text-xs text-gray-500">이용 중인 서비스에 체크하면 해당 관리 목록에 표시됩니다.</p><div className="mt-3 flex flex-wrap gap-3">{([['ai_management','AI 진단·관리'],['naver_management','네이버 진단·관리']] as const).map(([key,label])=><label key={key} className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold"><input type="checkbox" checked={value[key]} disabled={busy} onChange={()=>change(key)} className="h-4 w-4 accent-emerald-600"/>{label}</label>)}</div>{error&&<p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}</div>
}

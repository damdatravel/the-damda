'use client'
import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'

export default function ProjectLogoEditor({id,logo}:{id:number;logo:string|null}){
 const router=useRouter(),[file,setFile]=useState<File|null>(null),[preview,setPreview]=useState<string|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState(''),[missing,setMissing]=useState(false),[inputKey,setInputKey]=useState(0)
 useEffect(()=>{setMissing(false)},[logo])
 useEffect(()=>{if(!file){setPreview(null);return}const src=URL.createObjectURL(file);setPreview(src);return()=>URL.revokeObjectURL(src)},[file])
 function choose(selected:File|null){setError('');setMessage('');if(selected&&(selected.size>2*1024*1024||!['image/png','image/jpeg','image/webp'].includes(selected.type))){setFile(null);setInputKey(k=>k+1);setError('2MB 이하의 PNG, JPG, WEBP 이미지를 선택해 주세요.');return}setFile(selected)}
 async function update(remove=false){
  if(!remove&&!file)return
  setBusy(true);setError('');setMessage('')
  try{const body=new FormData();if(file)body.append('logo',file)
   const response=await fetch(`/api/discovery/projects/${id}/logo`,{method:remove?'DELETE':'POST',...(remove?{}:{body})})
   const result=await response.json();if(!response.ok)throw new Error(result.error||'로고를 저장하지 못했습니다.')
   setFile(null);setInputKey(k=>k+1);setMessage(remove?'등록한 로고를 삭제했습니다.':'로고를 저장했습니다.');router.refresh()
  }catch(e){setError(e instanceof Error?e.message:'로고를 저장하지 못했습니다.')}finally{setBusy(false)}
 }
 return <section className="rounded-xl border border-gray-200 bg-white p-4"><h3 className="text-sm font-bold">고객사 로고</h3><p className="mt-1 text-xs leading-5 text-gray-500">직접 등록한 로고를 우선 표시합니다. PNG·JPG·WEBP, 최대 2MB. 선명한 원본 이미지를 권장합니다.</p><div className="mt-3 flex flex-wrap items-center gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">{preview?<img src={preview} alt="선택한 로고 미리보기" className="h-full w-full object-contain p-1"/>:logo&&!missing?<img src={logo} alt="등록한 고객사 로고" onError={()=>setMissing(true)} className="h-full w-full object-contain p-1"/>:<span className="text-xs text-gray-400">미등록</span>}</div><div className="min-w-0 flex-1"><label className="block text-xs font-bold">로고 파일 선택<input key={inputKey} disabled={busy} type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>choose(e.target.files?.[0]||null)} className="mt-2 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:font-bold file:text-emerald-800"/></label><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={busy||!file} onClick={()=>update()} className="rounded-lg bg-[#087A56] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy?'처리 중...':'로고 등록·변경'}</button><button type="button" disabled={busy||missing||!logo} onClick={()=>update(true)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold disabled:opacity-50">등록한 로고 삭제</button></div></div></div><p className="mt-3 text-xs text-gray-500">로고는 위 버튼으로 별도 저장됩니다. 삭제하면 홈페이지 아이콘 또는 업체명 표시로 돌아갑니다.</p>{message&&<p role="status" className="mt-2 text-sm text-emerald-800">{message}</p>}{error&&<p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}</section>
}

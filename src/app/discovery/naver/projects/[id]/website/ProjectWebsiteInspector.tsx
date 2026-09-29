'use client'
import {useState} from 'react'
import WebsiteInspector from '../../../../WebsiteInspector'

export default function ProjectWebsiteInspector({projectId,url}:{projectId:number;url:string|null}){
 const[notice,setNotice]=useState('')
 async function save(result:unknown){
  setNotice('진단 결과를 프로젝트에 저장하는 중...')
  try{const response=await fetch('/api/discovery/naver-website',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,result})});const data=await response.json();if(!response.ok)throw new Error(data.error||'저장 실패');setNotice('프로젝트에 저장했습니다. 다음 네이버 개선안 작성에 함께 사용됩니다.')}
  catch(e){setNotice(`저장 실패: ${e instanceof Error?e.message:'다시 시도해 주세요.'}`)}
 }
 return <><WebsiteInspector url={url} onResult={save}/>{notice&&<p role="status" className="-mt-5 mb-7 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}</>
}

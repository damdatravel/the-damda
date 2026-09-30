'use client'
import {useState} from 'react'
import WebsiteInspector from '../../../../WebsiteInspector'
import KeywordRecommendations,{type SavedSuggestions} from './KeywordRecommendations'

export default function ProjectWebsiteInspector({projectId,url,websiteHistoryId,saved,selectedQueries}:{projectId:number;url:string|null;websiteHistoryId:number|null;saved:SavedSuggestions;selectedQueries:string[]}){
 const[notice,setNotice]=useState(''),[currentWebsiteId,setCurrentWebsiteId]=useState(websiteHistoryId),[saving,setSaving]=useState(false)
 async function save(result:unknown){
  setSaving(true);setNotice('진단 결과를 프로젝트에 저장하는 중...')
  try{const response=await fetch('/api/discovery/naver-website',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({projectId,result})});const data=await response.json();if(!response.ok)throw new Error(data.error||'저장 실패');setCurrentWebsiteId(data.history.id);setNotice('프로젝트에 저장했습니다. 다음 네이버 개선안 작성에 함께 사용됩니다.')}
  catch(e){setNotice(`저장 실패: ${e instanceof Error?e.message:'다시 시도해 주세요.'}`);setCurrentWebsiteId(null)}finally{setSaving(false)}
 }
 return <><WebsiteInspector url={url} onResult={save}/>{notice&&<p role="status" className="-mt-5 mb-7 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}<KeywordRecommendations projectId={projectId} ready={!!currentWebsiteId&&!saving} websiteHistoryId={currentWebsiteId} saved={saved} selectedQueries={selectedQueries}/></>
}

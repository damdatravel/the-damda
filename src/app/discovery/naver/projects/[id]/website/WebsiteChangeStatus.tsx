'use client'
import {useEffect,useState} from 'react'
type Result={status:string;checkedAt?:string;changes?:{url:string;fields:string[]}[];failed?:string[];error?:string}
export default function WebsiteChangeStatus({projectId,baselineId,onStatus}:{projectId:number;baselineId:number|null;onStatus:(status:string)=>void}){
 const[result,setResult]=useState<Result|null>(null),[retry,setRetry]=useState(0),[busy,setBusy]=useState(false)
 useEffect(()=>{
  if(!baselineId){setResult({status:'no_baseline'});onStatus('no_baseline');return}
  const controller=new AbortController();setBusy(true);setResult(null);onStatus('checking')
  fetch(`/api/discovery/naver-website-changes?projectId=${projectId}`,{cache:'no-store',signal:controller.signal}).then(async response=>{const data=await response.json();if(!response.ok)throw new Error(data.error||'변경 확인 실패');if(!controller.signal.aborted){setResult(data);onStatus(data.status)}}).catch(e=>{if(!controller.signal.aborted){setResult({status:'unavailable',error:e.message});onStatus('unavailable')}}).finally(()=>{if(!controller.signal.aborted)setBusy(false)})
  return()=>controller.abort()
 },[projectId,baselineId,retry,onStatus])
 const message=busy?'저장된 진단과 현재 홈페이지 내용을 비교하고 있습니다.':result?.status==='changed'?'홈페이지 변경이 확인되었습니다. 위의 홈페이지 확인을 다시 실행한 뒤 추천 검색어를 재생성해 주세요.':result?.status==='unchanged'?'확인한 페이지에서 이전 진단과의 차이를 발견하지 못했습니다. 저장된 진단으로 검색어를 추천할 수 있습니다.':result?.status==='baseline_required'?'기존 진단에 본문 비교 기록이 없습니다. 홈페이지 확인을 한 번 다시 실행하면 변경 확인을 사용할 수 있습니다.':result?.status==='no_baseline'?'홈페이지 확인을 먼저 실행하면 다음 방문부터 변경 여부를 확인합니다.':result?.error||'일부 페이지를 읽지 못해 변경 여부를 확정할 수 없습니다. 다시 확인하거나 홈페이지를 재진단해 주세요.'
 return <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-sm font-bold">홈페이지 변경 확인</h2><button type="button" disabled={!baselineId||busy} onClick={()=>setRetry(x=>x+1)} className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold disabled:opacity-50">{busy?'비교 중...':'변경 여부 다시 확인'}</button></div><p role="status" className={'mt-2 text-sm leading-6 '+(result?.status==='changed'?'text-amber-800':'text-gray-600')}>{message}</p>{result?.changes?.length? <ul className="mt-3 space-y-2">{result.changes.map((item,i)=><li key={i} className="break-all text-xs text-gray-600">{item.url} · {item.fields.join(', ')} 변경</li>)}</ul>:null}{result?.checkedAt&&<p className="mt-2 text-xs text-gray-500">확인 시각: {new Date(result.checkedAt).toLocaleString('ko-KR')}</p>}<p className="mt-2 text-xs text-gray-400">이 화면을 열 때 저장된 공개 페이지 최대 8개를 비교합니다. 화면을 닫은 동안 계속 감시하지는 않습니다.</p></section>
}

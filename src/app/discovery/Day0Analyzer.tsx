'use client'
import {useState} from 'react'
export default function Day0Analyzer(){
 const[busy,setBusy]=useState(false),[result,setResult]=useState(''),[error,setError]=useState('')
 const run=async()=>{setBusy(true);setError('');try{const r=await fetch('/api/discovery/analyze-day0',{method:'POST'});const j=await r.json();if(!r.ok)throw new Error(j.error||'분석 실패');setResult(j.analysis)}catch(e:any){setError(e.message)}finally{setBusy(false)}}
 return <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Day 0 Analysis</p><h2 className="mt-1 text-xl font-extrabold">미발견 원인 · 개선안 분석</h2><p className="mt-2 text-sm text-gray-500">Benchmark와 OpenAI Web Day 0 결과를 읽어 홈페이지에 필요한 정보 구조를 제안합니다. 아직 홈페이지를 자동 수정하지 않습니다.</p></div><button onClick={run} disabled={busy} className="shrink-0 rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?'분석 중...':'Day 0 자동 분석'}</button></div>{error&&<div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}{result&&<div className="mt-5 whitespace-pre-wrap rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-gray-800">{result}</div>}</section>
}

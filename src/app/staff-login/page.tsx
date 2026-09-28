'use client'
import {FormEvent,useState} from 'react'
import {useRouter,useSearchParams} from 'next/navigation'

export default function StaffLogin(){
 const router=useRouter(),params=useSearchParams()
 const[loading,setLoading]=useState(false),[error,setError]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setLoading(true);setError('')
  const fd=new FormData(e.currentTarget)
  const res=await fetch('/api/staff/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fd.get('email'),password:fd.get('password')})})
  if(!res.ok){const d=await res.json().catch(()=>({}));setError(d.error||'로그인에 실패했습니다.');setLoading(false);return}
  const next=params.get('next');router.replace(next&&next.startsWith('/')?next:'/discovery');router.refresh()
 }
 return <div className="min-h-screen bg-[#F4F7F6] px-5 pb-16 pt-28 text-[#0A0F1E]"><div className="mx-auto max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">The Damda Discovery</p><h1 className="mt-2 text-3xl font-extrabold">사내 로그인</h1><p className="mt-2 text-sm text-gray-500">더담다에서 발급한 사내 계정으로 로그인해 주세요.</p><form onSubmit={submit} className="mt-7 space-y-4"><label className="block"><span className="text-sm font-bold">이메일</span><input name="email" type="email" required autoComplete="username" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#0A9B6C]"/></label><label className="block"><span className="text-sm font-bold">비밀번호</span><input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#0A9B6C]"/></label>{error&&<p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-[#0A0F1E] px-4 py-3 font-bold text-white disabled:opacity-50">{loading?'확인 중...':'Discovery 로그인'}</button></form><p className="mt-5 text-center text-xs text-gray-400">회원가입은 제공하지 않습니다. 사내 계정은 관리자가 발급합니다.</p></div></div>

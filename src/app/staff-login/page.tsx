'use client'
import {FormEvent,useState} from 'react'
import {useRouter} from 'next/navigation'

export default function StaffLogin(){
 const router=useRouter()
 const[loading,setLoading]=useState(false)
 const[error,setError]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setLoading(true);setError('')
  const fd=new FormData(e.currentTarget)
  const res=await fetch('/api/staff/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:fd.get('email'),password:fd.get('password')})})
  if(!res.ok){
   const data=await res.json().catch(()=>({}))
   setError(data.error||'로그인에 실패했습니다.')
   setLoading(false)
   return
  }
  router.replace('/discovery');router.refresh()
 }
 return <main className="min-h-screen bg-[#F4F7F6] px-5 pt-28 text-[#0A0F1E]"><div className="mx-auto max-w-md rounded-2xl border bg-white p-8 shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">The Damda Discovery</p><h1 className="mt-2 text-3xl font-extrabold">사내 로그인</h1><p className="mt-2 text-sm text-gray-500">더담다 임직원 전용 시스템입니다.</p><form onSubmit={submit} className="mt-7 space-y-4"><input name="email" type="email" required autoComplete="username" placeholder="이메일" className="w-full rounded-xl border px-4 py-3"/><input name="password" type="password" required autoComplete="current-password" placeholder="비밀번호" className="w-full rounded-xl border px-4 py-3"/>{error&&<p className="text-sm font-semibold text-red-700">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-[#0A0F1E] px-4 py-3 font-bold text-white disabled:opacity-50">{loading?'확인 중...':'로그인'}</button></form></div></main>
}
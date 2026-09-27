import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import QuestionGenerator from './QuestionGenerator'

export const dynamic = 'force-dynamic'

type Dimension = { id:number; dimension_type:string; dimension_value:string; priority:number; is_active:boolean }

async function getDimensions() {
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!url||!key) return {dimensions:[] as Dimension[],error:'Supabase 환경변수를 확인해 주세요.'}
  const supabase=createClient(url,key)
  const {data,error}=await supabase.from('discovery_question_dimensions').select('id,dimension_type,dimension_value,priority,is_active').eq('project_id',1).eq('is_active',true).order('priority',{ascending:false})
  return {dimensions:(data??[]) as Dimension[],error:error?.message??null}
}

export default async function QuestionsPage(){
  const {dimensions,error}=await getDimensions()
  return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">Question Engine</p><h1 className="text-3xl font-extrabold md:text-4xl">질문 생성</h1><p className="mt-2 text-sm text-gray-500">저장된 질문 재료를 조합해 실제 고객이 물어볼 질문 후보를 만듭니다.</p></div><div className="flex gap-2"><Link href="/discovery/dimensions" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold shadow-sm">질문 재료</Link><Link href="/discovery" className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold shadow-sm">← 대시보드</Link></div></header>
    {error?<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div>:<QuestionGenerator dimensions={dimensions}/>}
  </div></div>
}

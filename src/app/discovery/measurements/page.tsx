import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
import MeasurementForm from './MeasurementForm'
export const dynamic='force-dynamic'

async function getQuestion(id:number,projectId:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return null
 const s=createClient(url,key)
 const{data}=await s.from('discovery_questions').select('id,question,is_benchmark').eq('project_id',projectId).eq('id',id).eq('is_benchmark',true).maybeSingle()
 return data
}
export default async function MeasurementsPage({searchParams}:{searchParams:{question?:string;project?:string;channel?:string}}){
 const id=Number(searchParams?.question||0),projectId=Number(searchParams?.project||1),q=id>0&&Number.isInteger(projectId)&&projectId>0?await getQuestion(id,projectId):null
 return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-5xl px-5 py-10 md:px-8">
  <header className="mb-8 flex items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">Measurement</p><h1 className="text-3xl font-extrabold md:text-4xl">Day 0 측정</h1><p className="mt-2 text-sm text-gray-500">같은 Benchmark 질문을 채널별로 기록해 이후 변화와 비교합니다.</p></div><Link href={"/discovery/projects/"+projectId+"/questions"} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold shadow-sm">← 질문</Link></header>
  {q?<MeasurementForm questionId={q.id} question={q.question} projectId={projectId} initialChannel={searchParams?.channel}/>:<section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">측정할 Benchmark 질문을 찾지 못했습니다. 질문 화면에서 Benchmark를 지정한 뒤 Day 0 측정을 시작해 주세요.</section>}
 </div></div>
}

import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
import QuestionGenerator from '../../../questions/QuestionGenerator'
import SavedQuestions from '../../../questions/SavedQuestions'
import DimensionSeeder from './DimensionSeeder'
export const dynamic='force-dynamic'
type D={id:number;dimension_type:string;dimension_value:string;priority:number;is_active:boolean}
type Q={id:number;question:string;intent:string|null;dimension_count:number;is_benchmark:boolean;status:string;created_at:string}
async function getData(projectId:number){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return{project:null,dimensions:[] as D[],questions:[] as Q[],error:'Supabase 환경변수를 확인해 주세요.'}
 const s=createClient(url,key)
 const {count:measurementCount}=await s.from('discovery_measurements').select('id',{count:'exact',head:true}).eq('project_id',projectId)
 if((measurementCount??0)===0){
  await s.from('discovery_questions').delete().eq('project_id',projectId).eq('intent','신규 프로젝트 자동 Benchmark')
 }
 const[p,d,q]=await Promise.all([
  s.from('discovery_projects').select('id,name,website_url').eq('id',projectId).maybeSingle(),
  s.from('discovery_question_dimensions').select('id,dimension_type,dimension_value,priority,is_active').eq('project_id',projectId).eq('is_active',true).order('priority',{ascending:false}),
  s.from('discovery_questions').select('id,question,intent,dimension_count,is_benchmark,status,created_at').eq('project_id',projectId).order('created_at',{ascending:false})
 ])
 return{project:p.data,dimensions:(d.data??[]) as D[],questions:(q.data??[]) as Q[],error:p.error?.message??d.error?.message??q.error?.message??null}
}
export default async function ProjectQuestions({params}:{params:{id:string}}){
 const projectId=Number(params.id),{project,dimensions,questions,error}=await getData(projectId)
 return <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]"><div className="mx-auto max-w-7xl px-5 pb-10 pt-16 md:px-8 md:pt-20"><header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">Question Engine</p><h1 className="text-3xl font-extrabold md:text-4xl">{project?.name??'프로젝트'} 질문 엔진</h1><p className="mt-2 text-sm text-gray-500">후보 질문을 넓게 만들고 검토한 뒤 반복 측정할 Benchmark를 직접 지정합니다.</p></div><Link href={'/discovery/projects/'+projectId} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold shadow-sm">← 프로젝트 대시보드</Link></header>{error?<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div>:<div className="space-y-6"><section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800"><b>AI Source Profile · 프로젝트 전용 질문 재료</b><p className="mt-2">상담 정보와 실제 홈페이지 진단을 근거로 질문 재료를 추출합니다. 이미 생성된 재료가 있어도 추가 추출할 수 있습니다.</p><DimensionSeeder projectId={projectId}/></section>{dimensions.length>0&&<QuestionGenerator dimensions={dimensions} projectId={projectId}/>}<SavedQuestions initial={questions} projectId={projectId} projectName={project?.name??'프로젝트'}/></div>}</div></div>
}
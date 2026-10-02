import {approvedEdges,allowsCombination} from '../../../../lib/ontology'
import {readOntology} from '../../../../lib/ontologyStore'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {createHash} from 'node:crypto'

async function staff(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!pub||!secret)return null
 const token=cookies().get('damda_staff_token')?.value
 if(!token)return null
 const auth=createClient(url,pub,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error}=await auth.auth.getUser(token)
 return error||!data.user?null:createClient(url,secret,{auth:{persistSession:false}})
}

export async function GET(req:Request){
 try{
  const projectId=Number(new URL(req.url).searchParams.get('projectId'))
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'프로젝트를 확인해 주세요.'},{status:400})
  const s=await staff();if(!s)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const {data,error}=await s.from('discovery_questions').select('id,question,intent,dimension_count,is_benchmark,status,created_at').eq('project_id',projectId).order('created_at',{ascending:false})
  if(error)return NextResponse.json({error:error.message},{status:500})
  return NextResponse.json({questions:data??[]},{headers:{'Cache-Control':'no-store'}})
 }catch(e:any){return NextResponse.json({error:e?.message||'질문 조회에 실패했습니다.'},{status:500})}
}

export async function POST(req:Request){
 try{
  const body=await req.json(),projectId=Number(body.projectId),questions=body.questions
  if(!Number.isInteger(projectId)||projectId<1||!Array.isArray(questions)||!questions.length||questions.length>24)return NextResponse.json({error:'저장할 질문을 확인해 주세요.'},{status:400})
  const s=await staff();if(!s)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const {data:project}=await s.from('discovery_projects').select('id').eq('id',projectId).maybeSingle()
  if(!project)return NextResponse.json({error:'프로젝트를 찾지 못했습니다.'},{status:404})
  const {data:dimensions,error:de}=await s.from('discovery_question_dimensions').select('id,dimension_type,dimension_value').eq('project_id',projectId).eq('is_active',true)
  if(de)return NextResponse.json({error:de.message},{status:500})
  const ontology=await readOntology(s,projectId),edges=ontology?approvedEdges(ontology.graph,dimensions||[]):[]
  const byId=new Map((dimensions??[]).map(x=>[x.id,x]))
  const rows=[] as Array<Record<string,unknown>>
  for(const q of questions){
   const question=typeof q.question==='string'?q.question.trim().replace(/\s+/g,' '):''
   const ids=Array.isArray(q.ingredientIds)?[...new Set(q.ingredientIds)]:[]
   const ingredients=ids.map(id=>byId.get(id))
   if(question.length<10||question.length>170||!question.endsWith('?')||!ids.length||ingredients.some(x=>!x)||!ingredients.some(x=>x?.dimension_type==='SERVICE')||new Set(ingredients.map(x=>x?.dimension_type)).size<2)return NextResponse.json({error:'질문 재료가 변경되었습니다. 다시 생성해 주세요.'},{status:400})
   if(ontology&&!allowsCombination(edges,ids as number[],dimensions||[]))return NextResponse.json({error:'관계의 승인 상태가 변경되었습니다. 질문을 다시 생성해 주세요.'},{status:409})
   const trace=ontology?JSON.stringify({version:1,updatedAt:ontology.updatedAt,ingredientIds:ids,edges:edges.filter(e=>ids.includes(e.to)&&(e.from===0||ids.includes(e.from)))}):null
   const get=(type:string)=>ingredients.find(x=>x?.dimension_type===type)?.dimension_value??null
   rows.push({project_id:projectId,question,intent:String(q.intent||'발견/서비스 탐색').slice(0,100),who:get('WHO'),for_whom:get('FOR_WHOM'),where_location:get('WHERE'),purpose:get('PURPOSE'),problem:get('PROBLEM'),action:get('ACTION'),service:get('SERVICE'),dimension_count:ingredients.length,combination_key:`reviewed:${createHash('sha256').update(projectId+'|'+question).digest('hex').slice(0,32)}`,is_duplicate:false,is_benchmark:false,status:'saved',notes:trace?'검토 후 저장 · 관계 근거: '+trace:'검토 후 저장'})
  }
  const {data:existing,error:ee}=await s.from('discovery_questions').select('question').eq('project_id',projectId).in('question',rows.map(x=>x.question))
  if(ee)return NextResponse.json({error:ee.message},{status:500})
  const already=new Set((existing??[]).map(x=>x.question)),fresh=rows.filter(x=>{if(already.has(x.question))return false;already.add(x.question);return true})
  if(fresh.length){const {error}=await s.from('discovery_questions').insert(fresh);if(error)return NextResponse.json({error:error.message},{status:500})}
  const {data:stored,error:readError}=await s.from('discovery_questions').select('id,question,intent,dimension_count,is_benchmark,status,created_at').eq('project_id',projectId).order('created_at',{ascending:false})
  if(readError)return NextResponse.json({error:'저장 후 목록 조회 실패: '+readError.message},{status:500})
  return NextResponse.json({saved:fresh.length,skipped:rows.length-fresh.length,questions:stored??[]})
 }catch(e:any){return NextResponse.json({error:e?.message||'질문 저장에 실패했습니다.'},{status:500})}
}

export async function PATCH(req:Request){
 try{
  const body=await req.json(),projectId=Number(body.projectId),id=Number(body.id)
  if(!Number.isInteger(projectId)||projectId<1||!Number.isInteger(id)||id<1||typeof body.isBenchmark!=='boolean')return NextResponse.json({error:'변경할 질문을 확인해 주세요.'},{status:400})
  const s=await staff();if(!s)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const {data,error}=await s.from('discovery_questions').update({is_benchmark:body.isBenchmark}).eq('project_id',projectId).eq('id',id).select('id,is_benchmark').maybeSingle()
  if(error)return NextResponse.json({error:error.message},{status:500})
  if(!data)return NextResponse.json({error:'질문을 찾지 못했습니다.'},{status:404})
  return NextResponse.json({question:data})
 }catch(e:any){return NextResponse.json({error:e?.message||'Benchmark 변경에 실패했습니다.'},{status:500})}
}

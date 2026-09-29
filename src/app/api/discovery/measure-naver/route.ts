import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

const channel='Naver Web API'
const seoulDay=(date:string)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date))
const clean=(value:unknown)=>String(value||'').replace(/<[^>]*>/g,'').replace(/&(?:amp|lt|gt|quot|apos);/g,entity=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'"}[entity]||entity))

export async function POST(req:Request){
 try{
  const {questionId,projectId:rawProjectId}=await req.json()
  const projectId=Number(rawProjectId)
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  const clientId=process.env.NAVER_CLIENT_ID,clientSecret=process.env.NAVER_CLIENT_SECRET
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!clientId||!clientSecret)return NextResponse.json({error:'Naver 검색 API 인증 정보가 아직 설정되지 않았습니다.'},{status:503})
  if(!url||!publishable||!key)return NextResponse.json({error:'Supabase 환경변수를 확인해 주세요.'},{status:500})
  const token=cookies().get('damda_staff_token')?.value
  if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:user,error:authError}=await auth.auth.getUser(token)
  if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const s=createClient(url,key,{auth:{persistSession:false}})
  const {data:q,error:qe}=await s.from('discovery_questions').select('id,question').eq('project_id',projectId).eq('id',Number(questionId)).eq('is_benchmark',true).maybeSingle()
  if(qe||!q)return NextResponse.json({error:qe?.message||'Benchmark 질문을 찾지 못했습니다.'},{status:404})
  const {data:existing,error:ee}=await s.from('discovery_measurements').select('id,is_discovered,result_text,source_urls,created_at').eq('project_id',projectId).eq('question_id',q.id).eq('channel',channel).order('created_at',{ascending:false}).limit(1).maybeSingle()
  if(ee)return NextResponse.json({error:'기존 측정 확인 실패: '+ee.message},{status:500})
  if(existing&&seoulDay(existing.created_at)===seoulDay(new Date().toISOString()))return NextResponse.json({ok:true,verified:true,reused:true,measurementId:existing.id,discovered:existing.is_discovered,answer:existing.result_text,sourceUrls:existing.source_urls??[]})
  const {data:project,error:pe}=await s.from('discovery_projects').select('name,website_url').eq('id',projectId).single()
  if(pe||!project)return NextResponse.json({error:pe?.message||'프로젝트를 찾지 못했습니다.'},{status:404})
  const searchUrl=new URL('https://naverapihub.apigw.ntruss.com/search/v1/webkr')
  searchUrl.searchParams.set('query',q.question)
  searchUrl.searchParams.set('display','20')
  searchUrl.searchParams.set('start','1')
  searchUrl.searchParams.set('format','json')
  const response=await fetch(searchUrl,{headers:{'X-NCP-APIGW-API-KEY-ID':clientId,'X-NCP-APIGW-API-KEY':clientSecret},cache:'no-store'})
  const raw=await response.json().catch(()=>({}))
  if(!response.ok)return NextResponse.json({error:'Naver 웹문서 API 오류: '+(raw?.errorMessage||raw?.error?.message||raw?.message||response.statusText)},{status:502})
  const items=(Array.isArray(raw?.items)?raw.items:[]).map((item:any)=>({title:clean(item.title),description:clean(item.description),link:String(item.link||'')}))
  const answer=items.length?items.map((item:{title:string;description:string;link:string},index:number)=>`${index+1}. ${item.title}\n${item.description}\n${item.link}`).join('\n\n'):'상위 20개 웹문서 검색 결과가 없습니다.'
  const sourceUrls=[...new Set(items.map((item:{link:string})=>item.link).filter((link:string)=>/^https?:\/\//i.test(link)))]
  const names=[project.name,project.website_url].filter(Boolean).flatMap((value:string)=>{const name=value.toLowerCase();try{return[name,new URL(name).hostname.replace(/^www\./,'')]}catch{return[name]}}).filter((name:string)=>name.length>=3)
  const discovered=names.some((name:string)=>answer.toLowerCase().includes(name))
  const {data:saved,error:ie}=await s.from('discovery_measurements').insert({project_id:projectId,question_id:q.id,channel,is_discovered:discovered,result_text:answer,source_urls:sourceUrls.length?sourceUrls:null,notes:'자동 측정 · Naver 웹문서 검색 API 상위 20건 · 일반 통합검색 화면과 별도 · 업체명/도메인 직접 언급 판정',measurement_round:existing?'재측정':'Day 0'}).select('id').single()
  if(ie||!saved)return NextResponse.json({error:'측정 저장 검증 실패: '+(ie?.message||'저장된 행을 다시 읽지 못했습니다.')},{status:500})
  return NextResponse.json({ok:true,verified:true,reused:false,measurementId:saved.id,discovered,answer,sourceUrls})
 }catch(e:any){return NextResponse.json({error:e?.message||'Naver 측정 중 오류가 발생했습니다.'},{status:500})}
}

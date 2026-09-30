import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {inspectWebsite} from '../../../../lib/websiteInspection'
import {compareWebsite} from '../../../../lib/websiteChanges'
export const maxDuration=120
export async function GET(req:Request){
 try{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value
  if(!url||!publishable||!service||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}}),{data:{user}}=await auth.auth.getUser(token)
  if(!user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const projectId=Number(new URL(req.url).searchParams.get('projectId'))
  if(!Number.isSafeInteger(projectId)||projectId<1)return NextResponse.json({error:'프로젝트를 확인해 주세요.'},{status:400})
  const s=createClient(url,service,{auth:{persistSession:false}})
  const {data:project,error}=await s.from('discovery_projects').select('website_url,naver_management').eq('id',projectId).maybeSingle()
  if(error)return NextResponse.json({error:'프로젝트 조회 실패'},{status:500})
  if(!project?.naver_management||!project.website_url)return NextResponse.json({error:'프로젝트 홈페이지를 확인해 주세요.'},{status:404})
  const {data:history,error:historyError}=await s.from('discovery_analysis_history').select('id,observed,created_at').eq('project_id',projectId).eq('measurement_round','Naver Website').order('created_at',{ascending:false}).limit(1).maybeSingle()
  if(historyError)return NextResponse.json({error:'진단 이력 조회 실패'},{status:500})
  const previous=history?.observed?.[0]
  if(!history||!previous?.pages?.length)return NextResponse.json({status:'no_baseline'})
  const registered=new URL(/^https?:\/\//i.test(project.website_url)?project.website_url:'https://'+project.website_url)
  if(registered.hostname.replace(/^www\./,'')!==new URL(previous.website).hostname.replace(/^www\./,''))return NextResponse.json({status:'changed',changes:[{url:project.website_url,fields:['등록된 홈페이지 주소']}],failed:[]})
  const knownUrls=previous.pages.filter((p:any)=>!p.error).map((p:any)=>p.url).filter((value:unknown)=>{try{const u=new URL(String(value));return /^https?:$/.test(u.protocol)&&u.hostname.replace(/^www\./,'')===registered.hostname.replace(/^www\./,'')}catch{return false}}).slice(0,8)
  if(!knownUrls.length)return NextResponse.json({status:'no_baseline'})
  const current=await inspectWebsite(project.website_url,knownUrls)
  return NextResponse.json({...compareWebsite(previous,current),baselineId:history.id,baselineAt:history.created_at,checkedAt:current.checkedAt,pageCount:current.pageCount})
 }catch{return NextResponse.json({error:'홈페이지 변경 여부를 확인하지 못했습니다. 잠시 후 다시 확인해 주세요.'},{status:502})}
}

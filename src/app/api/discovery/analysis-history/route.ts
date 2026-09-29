import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

async function client(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value
 if(!url||!publishable||!service||!token)return null
 const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error}=await auth.auth.getUser(token)
 return error||!data.user?null:createClient(url,service,{auth:{persistSession:false}})
}
export async function GET(req:Request){
 const s=await client();if(!s)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const projectId=Number(new URL(req.url).searchParams.get('projectId'))
 const round=new URL(req.url).searchParams.get('round')
 if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
 let query=s.from('discovery_analysis_history').select('id,project_id,measurement_round,observed,interpreted,created_at').eq('project_id',projectId)
 if(round==='Naver')query=query.in('measurement_round',['Naver','Naver Approved'])
 const {data,error}=await query.order('created_at',{ascending:false}).limit(20)
 return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({history:data??[]})
}
export async function POST(req:Request){
 const s=await client();if(!s)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const body=await req.json().catch(()=>({})),projectId=Number(body.projectId),analysis=String(body.analysis||'')
 if(!Number.isInteger(projectId)||projectId<1||!analysis.trim()||analysis.length>30000)return NextResponse.json({error:'분석 기록을 확인해 주세요.'},{status:400})
 const observed=Array.isArray(body.observed)?body.observed.slice(0,100):[]
 const {data,error}=await s.from('discovery_analysis_history').insert({project_id:projectId,measurement_round:'Day 0',observed,interpreted:analysis}).select('id,created_at').single()
 return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({ok:true,history:data})
}

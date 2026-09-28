import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

export async function PATCH(req:Request){
 try{
  const body=await req.json(),projectId=Number(body.projectId),id=Number(body.id)
  if(!Number.isInteger(projectId)||projectId<1||!Number.isInteger(id)||id<1)return NextResponse.json({error:'잘못된 질문 재료입니다.'},{status:400})
  const value=typeof body.value==='string'?body.value.trim():undefined
  if(value!==undefined&&(value.length<2||value.length>150))return NextResponse.json({error:'재료는 2~150자로 입력해 주세요.'},{status:400})
  if(value===undefined&&typeof body.active!=='boolean')return NextResponse.json({error:'변경 내용이 없습니다.'},{status:400})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!publishable||!secret)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
  const token=cookies().get('damda_staff_token')?.value
  if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:user,error:authError}=await auth.auth.getUser(token)
  if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const s=createClient(url,secret,{auth:{persistSession:false}})
  const updates=value!==undefined?{dimension_value:value}: {is_active:body.active}
  const {data,error}=await s.from('discovery_question_dimensions').update(updates).eq('id',id).eq('project_id',projectId).select('id,dimension_type,dimension_value,priority,is_active,source,notes').maybeSingle()
  if(error)return NextResponse.json({error:error.message},{status:500})
  if(!data)return NextResponse.json({error:'질문 재료를 찾지 못했습니다.'},{status:404})
  return NextResponse.json({dimension:data})
 }catch(e:any){return NextResponse.json({error:e?.message||'질문 재료 변경 실패'},{status:500})}
}

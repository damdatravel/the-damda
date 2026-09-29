import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

export async function PATCH(req:Request,{params}:{params:{id:string}}){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value
 if(!url||!publishable||!service||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:user,error:authError}=await auth.auth.getUser(token)
 if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const id=Number(params.id),body=await req.json().catch(()=>({}))
 if(!Number.isInteger(id)||id<1||typeof body.ai_management!=='boolean'||typeof body.naver_management!=='boolean'||(!body.ai_management&&!body.naver_management))return NextResponse.json({error:'AI 관리 또는 네이버 관리 중 하나 이상을 선택해 주세요.'},{status:400})
 const s=createClient(url,service,{auth:{persistSession:false}})
 const {data,error}=await s.from('discovery_projects').update({ai_management:body.ai_management,naver_management:body.naver_management}).eq('id',id).select('id,ai_management,naver_management').single()
 return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({project:data})
}

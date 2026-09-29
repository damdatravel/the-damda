import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'

const fields=['description','industry','main_services','target_customer','service_area'] as const
export async function PATCH(req:Request,{params}:{params:{id:string}}){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value
 if(!url||!publishable||!service||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:{user}}=await auth.auth.getUser(token)
 if(!user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const id=Number(params.id),body=await req.json().catch(()=>({}))
 if(!Number.isInteger(id)||id<1)return NextResponse.json({error:'프로젝트를 확인해 주세요.'},{status:400})
 const update:Record<string,string|null>={}
 for(const field of fields){if(typeof body[field]!=='string'||body[field].length>(field==='description'?3000:1000))return NextResponse.json({error:'입력 내용을 확인해 주세요.'},{status:400});update[field]=body[field].trim()||null}
 const s=createClient(url,service,{auth:{persistSession:false}})
 const {data,error}=await s.from('discovery_projects').update(update).eq('id',id).select('id').single()
 return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json({project:data})
}

import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {reconcileTasks} from '@/lib/discovery/taskReconciliation'
export const maxDuration=120
export async function POST(req:Request){try{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value
 if(!url||!pub||!key||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=await createClient(url,pub).auth.getUser(token);if(auth.error||!auth.data.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const id=Number((await req.json()).projectId);if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:'프로젝트를 확인해 주세요.'},{status:400})
 return NextResponse.json(await reconcileTasks(createClient(url,key),id))
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'자동 비교 실패'},{status:503})}}

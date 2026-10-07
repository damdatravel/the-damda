import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {measurementCycle} from '../../../../lib/discovery/measurementCycle'
export const dynamic='force-dynamic'
export async function GET(req:Request){
 const projectId=Number(new URL(req.url).searchParams.get('projectId'))
 if(!Number.isSafeInteger(projectId)||projectId<1)return NextResponse.json({error:'프로젝트를 확인해 주세요.'},{status:400})
 const token=cookies().get('damda_staff_token')?.value,url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!token||!url||!pub||!key)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=await createClient(url,pub).auth.getUser(token)
 if(auth.error||!auth.data.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const {data,error}=await createClient(url,key).from('discovery_measurements').select('created_at').eq('project_id',projectId).order('created_at',{ascending:true}).limit(1)
 if(error)return NextResponse.json({error:'측정 일정 조회 실패'},{status:500})
 return NextResponse.json({cycle:measurementCycle((data||[]).map(x=>x.created_at)),hasMeasurements:!!data?.length})
}

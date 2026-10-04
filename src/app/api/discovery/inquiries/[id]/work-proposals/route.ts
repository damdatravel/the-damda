import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {readWorkflow} from '../../../../../../lib/improvementWorkflow'
import {validAdditionalWork} from '../../../../../../lib/workPlan'
export async function GET(req:Request,{params}:{params:{id:string}}){
 try{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,token=cookies().get('damda_staff_token')?.value
 if(!url||!key||!pub||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=await createClient(url,pub,{auth:{persistSession:false}}).auth.getUser(token)
 if(auth.error||!auth.data.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const id=Number(params.id);if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:'상담을 확인해 주세요.'},{status:400})
 const s=createClient(url,key),i=await s.from('discovery_inquiries').select('project_id').eq('id',id).single()
 if(i.error)return NextResponse.json({error:'상담 조회 실패'},{status:404})
 if(!i.data.project_id)return NextResponse.json({proposals:[]})
 const p=await s.from('discovery_projects').select('ai_management,naver_management').eq('id',i.data.project_id).single()
 if(p.error)throw Error('프로젝트 범위 조회 실패')
 const rounds=[...(p.data.ai_management?['Day 0','Comparison']:[]),...(p.data.naver_management?['Naver']:[])]
 const h=await s.from('discovery_analysis_history').select('id,measurement_round,observed').eq('project_id',i.data.project_id).in('measurement_round',rounds).order('id',{ascending:false}).limit(100)
 if(h.error)throw Error('작업 견적 후보 조회 실패')
 const proposals=(h.data||[]).flatMap(row=>(readWorkflow(row.observed||[])?.tasks||[]).filter(t=>t.status==='approved'&&t.assessment?.status==='ready'&&validAdditionalWork(t.additionalWork)).map(t=>({key:`${row.id}:${t.id}`,sourceId:row.id,taskId:t.id,service:row.measurement_round==='Naver'?'naver':'ai',...t.additionalWork})))
 return NextResponse.json({proposals})
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'견적 후보 조회 실패'},{status:500})}
}

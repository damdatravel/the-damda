import {validCustomerReport} from '../../../../../../lib/caseReportDocument'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {ensureCaseReport} from '../../../../../../lib/caseReport'
export async function POST(req:Request,{params}:{params:{id:string}}){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,token=cookies().get('damda_staff_token')?.value
 if(!url||!pub||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=createClient(url,pub,{auth:{persistSession:false}}),u=await auth.auth.getUser(token)
 if(u.error||!u.data.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 if(!key)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const id=Number(params.id),body=await req.json().catch(()=>({}))
 if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:'상담 번호를 확인해 주세요.'},{status:400})
 const s=createClient(url,key,{auth:{persistSession:false}})
 const inquiry=await s.from('discovery_inquiries').select('project_id,status').eq('id',id).maybeSingle()
 if(inquiry.error)return NextResponse.json({error:'상담 조회 실패'},{status:500})
 if(!inquiry.data?.project_id||!['contracted','converted'].includes(inquiry.data.status))return NextResponse.json({error:'계약 완료된 상담에서 고객 보고서를 관리할 수 있습니다.'},{status:409})
 try{
  const row=await ensureCaseReport(s,id),now=new Date().toISOString()
  if(body.action==='prepare')return NextResponse.json({report:row})
  if(!['save','publish','unpublish','rotate'].includes(body.action))return NextResponse.json({error:'지원하지 않는 작업입니다.'},{status:400})
  let patch:any={updated_at:now}
  if(body.action==='unpublish')patch.published=null
  else if(body.action==='rotate'){const {randomBytes}=await import('crypto');patch.public_token=randomBytes(32).toString('base64url')}
  else{
   if(!validCustomerReport(body.document))return NextResponse.json({error:'보고서 내용을 확인해 주세요.'},{status:400})
   const d=body.document
   if(body.action==='publish'&&(!d.title.trim()||!d.summary.trim()||!d.nextSteps.trim()))return NextResponse.json({error:'제목·현재 상황·다음 계획을 작성한 뒤 공개해 주세요.'},{status:400})
   patch.draft=d
   if(body.action==='publish'){patch.published=d;patch.published_at=now}
  }
  const saved=await s.from('discovery_case_reports').update(patch).eq('inquiry_id',id).select('*').single()
  if(saved.error)throw new Error('고객 보고서 저장 실패')
  return NextResponse.json({report:saved.data})
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'고객 보고서 처리 실패'},{status:500})}
}

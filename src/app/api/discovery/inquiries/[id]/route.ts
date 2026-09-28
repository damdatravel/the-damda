import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const allowed=new Set(['diagnosis_pending','reviewing','proposal','customer_delivery','quote_drafting','quote_ready','quote_sent','contracted','closed'])
export async function PATCH(req:Request,{params}:{params:{id:string}}){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const body=await req.json().catch(()=>({}))
 if(!allowed.has(body.status))return NextResponse.json({error:'허용되지 않은 상태입니다.'},{status:400})
 const s=createClient(url,key,{auth:{persistSession:false}})
 const id=Number(params.id)
 if(body.status==='contracted'){
  const inquiry=await s.from('discovery_inquiries').select('id,company_name,website_url,industry,main_services,project_id').eq('id',id).single()
  if(inquiry.error)return NextResponse.json({error:inquiry.error.message},{status:500})
  if(inquiry.data.project_id){
   const done=await s.from('discovery_inquiries').update({status:'contracted',updated_at:new Date().toISOString()}).eq('id',id).select('id,status,project_id').single()
   if(done.error)return NextResponse.json({error:done.error.message},{status:500})
   return NextResponse.json(done.data)
  }
  const created=await s.from('discovery_projects').insert({name:inquiry.data.company_name,website_url:inquiry.data.website_url,industry:inquiry.data.industry,main_services:inquiry.data.main_services,status:'active'}).select('id').single()
  if(created.error)return NextResponse.json({error:'프로젝트 생성 실패: '+created.error.message},{status:500})
  const done=await s.from('discovery_inquiries').update({status:'contracted',project_id:created.data.id,updated_at:new Date().toISOString()}).eq('id',id).select('id,status,project_id').single()
  if(done.error){await s.from('discovery_projects').delete().eq('id',created.data.id);return NextResponse.json({error:'상담 건 연결 실패: '+done.error.message},{status:500})}
  return NextResponse.json(done.data)
 }
 const r=await s.from('discovery_inquiries').update({status:body.status,updated_at:new Date().toISOString()}).eq('id',id).select('id,status,project_id').single()
 if(r.error)return NextResponse.json({error:r.error.message},{status:500})
 return NextResponse.json(r.data)
}
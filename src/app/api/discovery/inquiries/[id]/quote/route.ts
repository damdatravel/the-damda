import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {validateQuotation} from '../../../../../../lib/quotation'
export async function PUT(req:Request,{params}:{params:{id:string}}){
 try{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,token=cookies().get('damda_staff_token')?.value
  if(!url||!key||!pub||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const {data:{user}}=await createClient(url,pub,{auth:{persistSession:false}}).auth.getUser(token)
  if(!user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const id=Number(params.id),body=await req.json()
  if(!Number.isSafeInteger(id)||id<1||!validateQuotation(body))return NextResponse.json({error:'서비스, 고객명, 견적번호와 수량·금액을 확인해 주세요.'},{status:400})
  const s=createClient(url,key,{auth:{persistSession:false}})
  const {data:inquiry}=await s.from('discovery_inquiries').select('id').eq('id',id).maybeSingle()
  if(!inquiry)return NextResponse.json({error:'상담 업체를 찾을 수 없습니다.'},{status:404})
  const {error}=await s.from('discovery_quotations').upsert({inquiry_id:id,document:body,updated_at:new Date().toISOString()},{onConflict:'inquiry_id'})
  if(error)return NextResponse.json({error:error.code==='42P01'||error.code==='PGRST205'?'견적 저장 테이블 설정이 필요합니다. discovery_quotations.sql을 실행해 주세요.':'견적 저장에 실패했습니다.'},{status:500})
  return NextResponse.json({savedAt:new Date().toISOString()})
 }catch{return NextResponse.json({error:'견적을 저장하지 못했습니다. 다시 시도해 주세요.'},{status:500})}
}

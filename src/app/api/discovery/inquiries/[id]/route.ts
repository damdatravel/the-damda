import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
const allowed=new Set(['diagnosis_pending','reviewing','proposal','customer_delivery','quote_drafting','quote_ready','quote_sent','contracted','closed'])
export async function PATCH(req:Request,{params}:{params:{id:string}}){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const body=await req.json().catch(()=>({})); if(!allowed.has(body.status))return NextResponse.json({error:'허용되지 않은 상태입니다.'},{status:400})
 const s=createClient(url,key,{auth:{persistSession:false}})
 const r=await s.from('discovery_inquiries').update({status:body.status,updated_at:new Date().toISOString()}).eq('id',Number(params.id)).select('id,status').single()
 if(r.error)return NextResponse.json({error:r.error.message},{status:500})
 return NextResponse.json(r.data)
}
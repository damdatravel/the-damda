import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {unpack,VERIFIED_COOKIE} from '@/lib/consultingSms'
import {cookies} from 'next/headers'
export async function GET(req:Request){
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}
 const token=new URL(req.url).searchParams.get('token')||''
 const state=unpack<{kind:string;id:string;exp:number}>(token)
 if(!state||state.kind!=='diagnosis-prefill'||!state.id||!Number.isFinite(state.exp)||state.exp<Date.now())return NextResponse.json({error:'사전 진단 연결이 만료되었습니다. 직접 입력하거나 사전 진단을 다시 진행해 주세요.'},{status:410,headers})
 try{
 const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}})
 const {data,error}=await s.from('discovery_public_diagnoses').select('id,website_url,intake_context,inquiry_id,phone').eq('id',state.id).gt('expires_at',new Date().toISOString()).maybeSingle()
 if(error)throw Error('DATABASE')
 if(!data||data.inquiry_id)return NextResponse.json({error:'이미 상담에 연결되었거나 사용할 수 없는 사전 진단입니다. 새 상담 내용을 직접 입력해 주세요.'},{status:410,headers})
 const verified=unpack<{phone:string;exp:number}>(cookies().get(VERIFIED_COOKIE)?.value)
 const samePhone=!!verified&&verified.exp>Date.now()&&verified.phone===data.phone
 // Contact is returned only when this browser already verified the same phone.
 return NextResponse.json({...(samePhone?{verifiedPhone:data.phone}:{}),id:data.id,url:data.website_url,company_name:data.intake_context?.company_name||'',industry:data.intake_context?.industry||'',search_goal:data.intake_context?.search_goal||null},{headers})
 }catch{return NextResponse.json({error:'사전 진단 내용을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'},{status:503,headers})}
}

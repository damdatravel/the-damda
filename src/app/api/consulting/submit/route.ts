import {randomBytes} from 'node:crypto'
import {summarizeDiagnosis} from '@/lib/publicDiagnosis'
import {cleanWebsiteContext} from '../../../../lib/websitePlatform'
import {validSearchGoal,cleanSearchGoal} from '../../../../lib/engagement'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {VERIFIED_COOKIE,cleanPhone,unpack} from '@/lib/consultingSms'

type Verified={phone:string;exp:number}
export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({})),phone=cleanPhone(String(body.phone||''))
  const verified=unpack<Verified>(cookies().get(VERIFIED_COOKIE)?.value)
  if(!phone||!verified||verified.phone!==phone||Date.now()>verified.exp)return NextResponse.json({error:'휴대전화 인증을 완료해 주세요.'},{status:403})
  if(body.search_goal!==undefined&&!validSearchGoal(body.search_goal))return NextResponse.json({error:'우선 서비스·고객 검색 상황·희망 채널을 확인해 주세요.'},{status:400})
  const company_name=String(body.company_name||'').trim(),website_url=String(body.website_url||'').trim(),contact_name=String(body.contact_name||'').trim()
  const context=body.website_context===undefined?null:cleanWebsiteContext(body.website_context)
  if(body.website_context!==undefined&&!context)return NextResponse.json({error:'홈페이지 상황을 확인해 주세요.'},{status:400})
  if(website_url){try{const u=new URL(website_url);if(!['http:','https:'].includes(u.protocol)||u.username||u.password)throw Error()}catch{return NextResponse.json({error:'공개된 http/https 홈페이지 주소를 입력해 주세요.'},{status:400})}}
  if(!company_name||(!website_url&&(!context||context.status==='existing'))||!contact_name)return NextResponse.json({error:'필수 항목을 입력해 주세요.'},{status:400})
  if(body.privacy_agreed!==true)return NextResponse.json({error:'개인정보 수집·이용에 동의해 주세요.'},{status:400})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!key)return NextResponse.json({error:'접수 시스템 설정을 확인해 주세요.'},{status:500})
  const s=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
  let diagnosis:any=null
  if(body.diagnosis_id){
   const d=await s.from('discovery_public_diagnoses').select('*').eq('id',body.diagnosis_id).eq('phone',phone).gt('expires_at',new Date().toISOString()).maybeSingle()
   if(d.error||!d.data||d.data.inquiry_id)return NextResponse.json({error:'사전 진단 자료가 만료되었거나 이미 접수되었습니다. 사전 진단을 다시 실행해 주세요.'},{status:409})
   if(new URL(d.data.snapshot.website).origin!==new URL(website_url).origin)return NextResponse.json({error:'진단한 홈페이지와 상담 주소가 다릅니다.'},{status:400})
   diagnosis=d.data
  }
  const payload={...(context?{website_context:context}:{}),...(body.search_goal?{search_goal:cleanSearchGoal(body.search_goal)}:{}),company_name,website_url,industry:String(body.industry||'').trim()||null,main_services:String(body.main_services||'').trim()||null,concerns:[...new Set([...(Array.isArray(body.concerns)?body.concerns.filter((x:any)=>typeof x==='string'&&x.length<=200):[]),...(body.search_goal?.channels.includes('Naver')?['네이버에서 업체·홈페이지가 잘 검색되지 않음']:[]),...(body.search_goal?.channels.includes('AI')?['ChatGPT 등 AI에서 잘 발견되지 않음']:[])])],contact_name,phone,email:String(body.email||'').trim()||null,message:String(body.message||'').trim()||null,privacy_agreed:true,public_receipt_agreed:body.public_receipt_agreed===true,status:'diagnosis_pending'}
  const r=await s.from('discovery_inquiries').insert(payload).select('id').single()
  if(r.error){console.error('consulting insert',r.error);return NextResponse.json({error:'접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'},{status:500})}
  if(diagnosis){
   const summary=summarizeDiagnosis(diagnosis.snapshot)
   const report=await s.from('discovery_diagnosis_reports').insert({inquiry_id:r.data!.id,title:`${company_name} 홈페이지 초기 점검`,summary:summary.summary,findings:summary.findings,priorities:summary.priorities,proposal:summary.notice,status:'draft',public_token:randomBytes(24).toString('base64url'),website_snapshot:{...diagnosis.snapshot,consultationServices:{ai:!!body.search_goal?.channels.includes('AI'),naver:!!body.search_goal?.channels.includes('Naver')}}})
   if(report.error){await s.from('discovery_inquiries').delete().eq('id',r.data!.id);return NextResponse.json({error:'진단 자료 연결에 실패했습니다. 다시 접수해 주세요.'},{status:500})}
   await s.from('discovery_public_diagnoses').update({inquiry_id:r.data!.id}).eq('id',diagnosis.id)
  }
  const out=NextResponse.json({ok:true});out.cookies.delete(VERIFIED_COOKIE);return out
 }catch(e){console.error('consulting submit',e);return NextResponse.json({error:'접수 중 오류가 발생했습니다.'},{status:500})}
}

import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {VERIFIED_COOKIE,unpack,pack,cleanPhone} from '@/lib/consultingSms'
import {inspectWebsite} from '@/lib/websiteInspection'
import {summarizeDiagnosis} from '@/lib/publicDiagnosis'
export const maxDuration=120
const CHECK='damda_public_diagnosis'
export async function POST(req:Request){
 try{
  const b=await req.json(),phone=cleanPhone(String(b.phone||'')),v=unpack<{phone:string;exp:number}>(cookies().get(VERIFIED_COOKIE)?.value)
  if(!phone||v?.phone!==phone||v.exp<Date.now())return NextResponse.json({error:'휴대전화 인증을 완료해 주세요.'},{status:403})
  const s=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false}})
  if(b.action&&b.action!=='email')return NextResponse.json({error:'요청을 확인해 주세요.'},{status:400})
  if(b.action==='email'){
   const state=unpack<{id:string;phone:string;exp:number}>(cookies().get(CHECK)?.value)
   if(!state||state.phone!==phone||state.exp<Date.now())return NextResponse.json({error:'사전 진단을 먼저 실행해 주세요.'},{status:403})
   const email=String(b.email||'').trim()
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||b.emailConsent!==true)return NextResponse.json({error:'수신 이메일과 발송 동의를 확인해 주세요.'},{status:400})
   if(!process.env.RESEND_API_KEY||!process.env.DIAGNOSIS_EMAIL_FROM)return NextResponse.json({error:'이메일 발송 준비 중입니다. 화면에서 결과를 확인하거나 상담을 신청해 주세요.'},{status:503})
   const prior=await s.from('discovery_public_diagnoses').select('email,email_status').eq('id',state.id).eq('phone',phone).maybeSingle()
   if(prior.error)throw Error('DATABASE')
   if(!prior.data||!['pending','failed'].includes(prior.data.email_status)||prior.data.email_status==='failed'&&prior.data.email!==email)return NextResponse.json({error:'이미 발송을 요청했습니다. 실패한 발송은 같은 이메일로 다시 시도할 수 있습니다.'},{status:409})
   const claim=await s.from('discovery_public_diagnoses').update({email_status:'sending',email}).eq('id',state.id).eq('phone',phone).eq('email_status',prior.data.email_status).gt('expires_at',new Date().toISOString()).select('snapshot,website_url').maybeSingle()
   if(claim.error)throw Error('DATABASE')
   if(!claim.data)return NextResponse.json({error:'이미 발송을 요청했거나 진단이 만료되었습니다.'},{status:409})
   const d=summarizeDiagnosis(claim.data.snapshot)
   const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`diagnosis-${state.id}`},body:JSON.stringify({from:process.env.DIAGNOSIS_EMAIL_FROM,to:[email],subject:'담다 디스커버리 홈페이지 사전 진단',text:[claim.data.website_url,d.summary,...d.findings,'우선 점검 사항',...d.priorities,d.notice,'상담 신청: https://www.the-damda.co.kr/ai-search/consulting'].join('\n\n')}),signal:AbortSignal.timeout(15000)}).catch(()=>null)
   await s.from('discovery_public_diagnoses').update({email_status:r?.ok?'sent':'failed'}).eq('id',state.id)
   if(!r?.ok)return NextResponse.json({error:'이메일을 발송하지 못했습니다. 화면의 결과는 그대로 확인할 수 있습니다.'},{status:502})
   return NextResponse.json({ok:true})
  }
  if(b.privacyConsent!==true)return NextResponse.json({error:'사전 진단을 위한 개인정보 이용에 동의해 주세요.'},{status:400})
  const count=await s.from('discovery_public_diagnoses').select('id',{count:'exact',head:true}).eq('phone',phone).gte('created_at',new Date(Date.now()-86400000).toISOString())
  if(count.error)throw Error('DATABASE')
  if((count.count||0)>=3)return NextResponse.json({error:'하루에 최대 3회까지 진단할 수 있습니다.'},{status:429})
  const snapshot=await inspectWebsite(String(b.url||''))
  if(!snapshot.pageCount)return NextResponse.json({error:'확인 가능한 공개 페이지가 없습니다.'},{status:422})
  const saved=await s.from('discovery_public_diagnoses').insert({phone,website_url:snapshot.website,snapshot,retained_until:new Date(Date.now()+(b.retentionConsentVersion===2?90:1)*86400000).toISOString()}).select('id').single()
  if(saved.error)throw Error('DATABASE')
  const out=NextResponse.json({ok:true,result:summarizeDiagnosis(snapshot),website:snapshot.website,id:saved.data.id})
  out.cookies.set(CHECK,pack({id:saved.data.id,phone,exp:Date.now()+86400000}),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:86400})
  // Delete records only after the consented retention period.
  await s.from('discovery_public_diagnoses').delete().lt('retained_until',new Date().toISOString())
  return out
 }catch{return NextResponse.json({error:'사전 진단을 완료하지 못했습니다. 주소를 확인하거나 상담 접수를 이용해 주세요.'},{status:500})}
}

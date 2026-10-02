import {cleanWebsiteContext} from '../../../../lib/websitePlatform'
import {validSearchGoal,cleanSearchGoal} from '../../../../lib/engagement'
import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {readWebsiteTransfer} from '../../../../lib/websiteTransfer'
import {randomBytes} from 'node:crypto'
export async function POST(req:Request){
 try{
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,token=cookies().get('damda_staff_token')?.value
  if(!url||!key||!pub||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const {data:{user}}=await createClient(url,pub,{auth:{persistSession:false}}).auth.getUser(token)
  if(!user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const b=await req.json(),fields=['company_name','website_url','contact_name','phone','email','industry','main_services','message']
  const context=b.website_context===undefined?null:cleanWebsiteContext(b.website_context)
  if(b.website_context!==undefined&&!context)return NextResponse.json({error:'홈페이지 상황을 확인해 주세요.'},{status:400})
  if(fields.some(k=>typeof b[k]!=='string'||b[k].length>2000)||!b.company_name.trim()||(!b.website_url.trim()&&(!context||context.status==='existing'))||!b.contact_name.trim()||typeof b.ai!=='boolean'||typeof b.naver!=='boolean'||(!b.ai&&!b.naver))return NextResponse.json({error:'업체명·홈페이지·담당자와 상담 범위를 확인해 주세요.'},{status:400})
  if(b.search_goal!==undefined&&!validSearchGoal(b.search_goal))return NextResponse.json({error:'우선 서비스·고객 검색 상황·희망 채널을 확인해 주세요.'},{status:400})
  let site:URL|undefined;try{if(b.website_url.trim()){site=new URL(/^https?:\/\//i.test(b.website_url.trim())?b.website_url.trim():'https://'+b.website_url.trim());if(!['http:','https:'].includes(site.protocol)||site.username||site.password)throw Error()}}catch{return NextResponse.json({error:'올바른 홈페이지 주소를 입력해 주세요.'},{status:400})}
  const snapshot=b.websiteTransfer?readWebsiteTransfer(b.websiteTransfer,site?.href||''):null
  if(b.websiteTransfer&&!snapshot)return NextResponse.json({error:'확인 자료가 만료되었거나 홈페이지 주소가 다릅니다. 자료 연결을 해제하거나 홈페이지를 다시 확인해 주세요.'},{status:400})
  const phone=b.phone.replace(/[\s-]/g,'');if(phone&&!/^0\d{8,10}$/.test(phone)||b.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email.trim()))return NextResponse.json({error:'연락처·이메일 형식을 확인해 주세요.'},{status:400})
  const s=createClient(url,key,{auth:{persistSession:false}})
  const {data,error}=await s.from('discovery_inquiries').insert({...(context?{website_context:context}:{}),...(b.search_goal?{search_goal:cleanSearchGoal(b.search_goal)}:{}),company_name:b.company_name.trim(),website_url:site?.href||'',contact_name:b.contact_name.trim(),phone:phone||null,email:b.email.trim()||null,industry:b.industry.trim()||null,main_services:b.main_services.trim()||null,message:b.message.trim()||null,concerns:[...(b.naver?['네이버에서 업체·홈페이지가 잘 검색되지 않음']:[]),...(b.ai?['ChatGPT 등 AI에서 잘 발견되지 않음']:[])],privacy_agreed:false,internal_notes:'직원 직접 등록 · 휴대전화 미인증 · 고객 온라인 동의 미수집',status:'diagnosis_pending'}).select('id').single()
  if(error)return NextResponse.json({error:'상담 등록에 실패했습니다.'},{status:500})
  const saved=await s.from('discovery_diagnosis_reports').insert({inquiry_id:data.id,title:`${b.company_name.trim()} 사전 진단`,summary:'',findings:[],priorities:[],proposal:'',status:'draft',public_token:randomBytes(24).toString('base64url'),website_snapshot:{...(snapshot||{}),consultationServices:{ai:b.ai,naver:b.naver}}})
  if(saved.error){await s.from('discovery_inquiries').delete().eq('id',data.id);return NextResponse.json({error:'상담 범위를 저장하지 못했습니다. 다시 등록해 주세요.'},{status:500})}
  return NextResponse.json({id:data.id})
 }catch{return NextResponse.json({error:'상담을 등록하지 못했습니다.'},{status:500})}
}

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
  const payload={...(context?{website_context:context}:{}),...(body.search_goal?{search_goal:cleanSearchGoal(body.search_goal)}:{}),company_name,website_url,industry:String(body.industry||'').trim()||null,main_services:String(body.main_services||'').trim()||null,concerns:[...new Set([...(Array.isArray(body.concerns)?body.concerns.filter((x:any)=>typeof x==='string'&&x.length<=200):[]),...(body.search_goal?.channels.includes('Naver')?['네이버에서 업체·홈페이지가 잘 검색되지 않음']:[]),...(body.search_goal?.channels.includes('AI')?['ChatGPT 등 AI에서 잘 발견되지 않음']:[])])],contact_name,phone,email:String(body.email||'').trim()||null,message:String(body.message||'').trim()||null,privacy_agreed:true,status:'diagnosis_pending'}
  const r=await s.from('discovery_inquiries').insert(payload)
  if(r.error){console.error('consulting insert',r.error);return NextResponse.json({error:'접수 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'},{status:500})}
  const out=NextResponse.json({ok:true});out.cookies.delete(VERIFIED_COOKIE);return out
 }catch(e){console.error('consulting submit',e);return NextResponse.json({error:'접수 중 오류가 발생했습니다.'},{status:500})}
}

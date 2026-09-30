import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {consultationScope} from '../../../../lib/consultationScope'

const channels={webkr:'웹문서',blog:'블로그',cafearticle:'카페글',local:'지역'} as const
const clean=(value:unknown)=>String(value??'').replace(/<[^>]*>/g,'').replace(/&(?:amp|lt|gt|quot|apos|nbsp);/g,entity=>({'&amp;':'&','&lt;':'<','&gt;':'>','&quot;':'"','&apos;':"'",'&nbsp;':' '}[entity]||entity))
const day=(date:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)

export async function POST(request:Request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 const id=process.env.NAVER_CLIENT_ID,secret=process.env.NAVER_CLIENT_SECRET
 if(!url||!publishable||!key||!id||!secret)return NextResponse.json({error:'네이버 API 또는 직원 인증 환경 설정을 확인해 주세요.'},{status:503})
 const token=cookies().get('damda_staff_token')?.value
 if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:{user}}=await auth.auth.getUser(token)
 if(!user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 let body:{projectId?:number;inquiryId?:number;query?:string;channels?:string[];trend?:boolean;shoppingCategory?:string}
 try{body=await request.json()}catch{return NextResponse.json({error:'요청 형식을 확인해 주세요.'},{status:400})}
 const projectId=Number(body.projectId),inquiryId=Number(body.inquiryId),query=String(body.query||'').trim()
 const isProject=Number.isInteger(projectId)&&projectId>0,isInquiry=Number.isInteger(inquiryId)&&inquiryId>0
 if(isProject===isInquiry||!query||query.length>80)return NextResponse.json({error:'프로젝트 또는 상담 건과 80자 이내 검색어를 입력해 주세요.'},{status:400})
 const chosen=Array.isArray(body.channels)?[...new Set(body.channels)].filter(code=>code in channels):[]
 const useTrend=body.trend===true,shoppingCategory=String(body.shoppingCategory||'').trim()
 if(!chosen.length&&!useTrend&&!shoppingCategory)return NextResponse.json({error:'조회할 채널을 하나 이상 선택해 주세요.'},{status:400})
 if(shoppingCategory&&!/^\d{8,12}$/.test(shoppingCategory))return NextResponse.json({error:'네이버쇼핑 카테고리 코드를 확인해 주세요.'},{status:400})
 const s=createClient(url,key,{auth:{persistSession:false}})
 const {data:project}=isProject?await s.from('discovery_projects').select('id,name,naver_management').eq('id',projectId).maybeSingle():await s.from('discovery_inquiries').select('id,company_name,status').eq('id',inquiryId).maybeSingle()
 if(!project||isProject&&!('naver_management' in project&&project.naver_management))return NextResponse.json({error:'네이버 관리 대상 업체를 찾지 못했습니다.'},{status:404})
 if(isInquiry){
  const {data:inquiry}=await s.from('discovery_inquiries').select('project_id,concerns').eq('id',inquiryId).maybeSingle()
  const {data:diagnosis}=await s.from('discovery_diagnosis_reports').select('website_snapshot').eq('inquiry_id',inquiryId).maybeSingle()
  const scope=consultationScope(diagnosis?.website_snapshot,inquiry?.concerns),queries=diagnosis?.website_snapshot?.naverSelectedQueries
  if(inquiry?.project_id)return NextResponse.json({error:'계약된 고객은 관리 프로젝트에서 조회해 주세요.'},{status:409})
  if(!scope.naver||!Array.isArray(queries)||queries.length>3||!queries.includes(query))return NextResponse.json({error:'상담 홈페이지 점검 후 대표 검색어를 최대 3개 선택·저장해 주세요.'},{status:409})
  if(shoppingCategory)return NextResponse.json({error:'쇼핑 분야 상세 관리는 계약 후 프로젝트에서 진행합니다.'},{status:400})
 }
 const headers={'X-NCP-APIGW-API-KEY-ID':id,'X-NCP-APIGW-API-KEY':secret}
 const results=await Promise.all(chosen.map(async code=>{
  const label=channels[code as keyof typeof channels]
  try{
   const target=new URL(`https://naverapihub.apigw.ntruss.com/search/v1/${code}`)
   target.searchParams.set('query',query);target.searchParams.set('display',code==='local'?'5':'10');target.searchParams.set('format','json')
   const response=await fetch(target,{headers,cache:'no-store',signal:AbortSignal.timeout(10000)})
   const raw=await response.json().catch(()=>({}))
   if(!response.ok)return {code,label,error:`${response.status}: ${clean(raw.errorMessage||raw.message||'API 이용 권한 또는 요청을 확인해 주세요.')}`}
   return {code,label,total:Number(raw.total||0),items:(Array.isArray(raw.items)?raw.items:[]).map((item:any)=>({title:clean(item.title),description:clean(item.description),link:String(item.link||''),address:clean(item.address)}))}
  }catch{return {code,label,error:'네이버 API에 연결하지 못했습니다.'}}
 }))
 const end=new Date(),start=new Date(end);start.setUTCDate(start.getUTCDate()-90)
 let trend:{data:{period:string;ratio:number}[];error?:string}|null=null
 if(useTrend)try{
  const response=await fetch('https://naverapihub.apigw.ntruss.com/search-trend/v1/search',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({startDate:day(start),endDate:day(end),timeUnit:'week',keywordGroups:[{groupName:query,keywords:[query]}]}),cache:'no-store',signal:AbortSignal.timeout(10000)})
  const raw=await response.json().catch(()=>({}))
  if(!response.ok)trend={data:[],error:`${response.status}: ${clean(raw.errorMessage||raw.message||'검색어 트렌드 API 이용 권한을 확인해 주세요.')}`}
  else trend={data:(raw.results?.[0]?.data||[]).map((point:any)=>({period:String(point.period),ratio:Number(point.ratio)||0}))}
 }catch{trend={data:[],error:'검색어 트렌드 API에 연결하지 못했습니다.'}}
 let shopping:{category:string;data:{period:string;ratio:number}[];error?:string}|null=null
 if(shoppingCategory)try{
  const response=await fetch('https://naverapihub.apigw.ntruss.com/shopping/v1/category/keywords',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({startDate:day(start),endDate:day(end),timeUnit:'week',category:shoppingCategory,keyword:[{name:query,param:[query]}]}),cache:'no-store',signal:AbortSignal.timeout(10000)})
  const raw=await response.json().catch(()=>({}))
  shopping={category:shoppingCategory,data:response.ok?(raw.results?.[0]?.data||[]).map((point:any)=>({period:String(point.period),ratio:Number(point.ratio)||0})):[],...(!response.ok?{error:`${response.status}: ${clean(raw.errorMessage||raw.message||'쇼핑 인사이트 이용 권한 또는 카테고리 코드를 확인해 주세요.')}`}:{})}
 }catch{shopping={category:shoppingCategory,data:[],error:'쇼핑 인사이트 API에 연결하지 못했습니다.'}}
 return NextResponse.json({project:'name' in project?project.name:project.company_name,query,checkedAt:new Date().toISOString(),results,trend,shopping})
}

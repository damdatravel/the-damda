import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import crypto from 'crypto'

function db(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('DB_CONFIG');return createClient(url,key,{auth:{persistSession:false}})}
function token(){return crypto.randomBytes(24).toString('base64url')}
export async function POST(req:Request,{params}:{params:{id:string}}){
 try{const s=db(),id=Number(params.id),body=await req.json().catch(()=>({}))
  const {data:i,error}=await s.from('discovery_inquiries').select('id,company_name,website_url,industry,main_services,concerns,message').eq('id',id).single()
  if(error||!i)return NextResponse.json({error:'상담 정보를 찾을 수 없습니다.'},{status:404})
  const action=String(body.action||'generate')
  if(action==='generate'){
   const concerns=Array.isArray(i.concerns)?i.concerns.join(', '):''
   const title=`${i.company_name} 검색·AI 발견 현황 진단`
   const summary=`${i.company_name}의 홈페이지와 상담 내용을 기준으로 현재 검색·AI 발견 준비 상태를 확인합니다. 아래 내용은 상담 전 1차 진단이며, 실제 개선 작업은 내부 검토 후 확정합니다.`
   const findings=[i.website_url?`홈페이지(${i.website_url})가 운영되고 있어 공개 정보 구조를 점검할 수 있습니다.`:'홈페이지 주소 확인이 필요합니다.',i.main_services?`주요 서비스·상품: ${i.main_services}`:'주요 서비스·상품 설명 보완이 필요합니다.',concerns?`고객이 직접 선택한 주요 고민: ${concerns}`:'상담 시 주요 고민을 추가 확인합니다.']
   const priorities=['검색엔진과 AI가 업체·서비스를 명확히 이해할 수 있도록 핵심 페이지의 제목·설명·본문 구조를 점검합니다.','sitemap·구조화 정보·FAQ 등 기계가 읽을 수 있는 기본 정보를 확인합니다.','실제 고객이 사용할 질문을 기준으로 현재 발견 상태를 측정하고 개선 우선순위를 정합니다.']
   const proposal='우선 현재 홈페이지의 공개 정보와 검색·AI 발견 상태를 기준선으로 측정한 뒤, 영향도가 높은 항목부터 단계적으로 개선하는 방식을 제안합니다. 특정 검색 순위나 AI 추천 노출을 보장하지 않습니다.'
   const existing=await s.from('discovery_diagnosis_reports').select('id,public_token,status').eq('inquiry_id',id).maybeSingle()
   const payload={inquiry_id:id,title,summary,findings,priorities,proposal,status:'draft',public_token:existing.data?.public_token||token(),updated_at:new Date().toISOString()}
   const r=existing.data?await s.from('discovery_diagnosis_reports').update(payload).eq('id',existing.data.id).select().single():await s.from('discovery_diagnosis_reports').insert(payload).select().single()
   if(r.error)return NextResponse.json({error:r.error.message},{status:500});return NextResponse.json({ok:true,report:r.data})
  }
  const {data:report}=await s.from('discovery_diagnosis_reports').select('*').eq('inquiry_id',id).maybeSingle()
  if(!report)return NextResponse.json({error:'먼저 진단 결과 초안을 생성해 주세요.'},{status:400})
  if(action==='save'||action==='publish'){
   const patch={title:String(body.title||report.title),summary:String(body.summary||''),findings:Array.isArray(body.findings)?body.findings:[],priorities:Array.isArray(body.priorities)?body.priorities:[],proposal:String(body.proposal||''),status:action==='publish'?'published':'draft',published_at:action==='publish'?new Date().toISOString():report.published_at,updated_at:new Date().toISOString()}
   const r=await s.from('discovery_diagnosis_reports').update(patch).eq('id',report.id).select().single();if(r.error)return NextResponse.json({error:r.error.message},{status:500});return NextResponse.json({ok:true,report:r.data})
  }
  return NextResponse.json({error:'지원하지 않는 작업입니다.'},{status:400})
 }catch(e:any){return NextResponse.json({error:e?.message||'진단 결과 처리 중 오류가 발생했습니다.'},{status:500})}
}

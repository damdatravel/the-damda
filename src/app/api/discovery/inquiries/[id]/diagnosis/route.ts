import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import crypto from 'crypto'

function db(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw new Error('DB_CONFIG');return createClient(url,key,{auth:{persistSession:false}})}
function token(){return crypto.randomBytes(24).toString('base64url')}
function clean(s:string){return s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
function pick(html:string,re:RegExp){return clean(html.match(re)?.[1]||'')}
function types(html:string){return [...new Set([...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map(x=>x[1]))]}
async function fetchHtml(url:string){const r=await fetch(url,{redirect:'follow',headers:{'User-Agent':'TheDamdaDiscovery/0.3'},signal:AbortSignal.timeout(10000),cache:'no-store'});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);return {html:await r.text(),url:r.url}}
async function inspect(target:string){
 const first=await fetchHtml(target);const base=new URL(first.url),html=first.html
 const links=[...html.matchAll(/href=["']([^"'#]+)["']/gi)].map(m=>{try{const u=new URL(m[1],base);u.hash='';u.search='';return u.origin===base.origin&&/^https?:$/.test(u.protocol)?u.toString():''}catch{return ''}}).filter(Boolean)
 let sitemapFound=false,sitemapUrlCount=0
 try{const r=await fetch(new URL('/sitemap.xml',base),{signal:AbortSignal.timeout(7000),cache:'no-store'});if(r.ok){const xml=await r.text();sitemapUrlCount=[...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].length;sitemapFound=sitemapUrlCount>0}}catch{}
 const urls=[...new Set([base.toString(),...links])].slice(0,8),pages:any[]=[]
 for(const u of urls){try{const x=u===base.toString()?first:await fetchHtml(u),h=x.html;pages.push({url:x.url,title:pick(h,/<title[^>]*>([\s\S]*?)<\/title>/i),description:pick(h,/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)||pick(h,/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i),h1:pick(h,/<h1[^>]*>([\s\S]*?)<\/h1>/i),structuredData:types(h),hasFaq:/FAQ|자주\s*묻는|질문과\s*답변/i.test(clean(h))})}catch(e:any){pages.push({url:u,error:e.message})}}
 const ok=pages.filter(x=>!x.error),structuredDataTypes=[...new Set(ok.flatMap(x=>x.structuredData||[]))]
 return {checkedAt:new Date().toISOString(),website:base.origin,pageCount:ok.length,sitemapFound,sitemapUrlCount,structuredDataTypes,pages}
}
async function synthesize(i:any,snapshot:any){
 const key=process.env.OPENAI_API_KEY;if(!key)return null
 const evidence={company:i.company_name,website:i.website_url,industry:i.industry,services:i.main_services,concerns:i.concerns,websiteCheck:snapshot}
 const prompt=`당신은 THE DAMDA DISCOVERY의 사전 진단 작성 도우미입니다. 아래 실제 홈페이지 점검 데이터와 상담 정보를 근거로 고객에게 보여줄 한국어 1차 진단서를 작성하세요. 확인되지 않은 사실은 단정하지 마세요. 검색 순위나 AI 추천 노출을 보장하지 마세요. findings는 실제 확인 사실 3~6개, priorities는 근거가 있는 개선 우선순위 3~5개로 작성하세요. JSON만 반환하세요. 스키마: {"summary":"string","findings":["string"],"priorities":["string"],"proposal":"string"}. 데이터: ${JSON.stringify(evidence)}`
 const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${key}`},body:JSON.stringify({model:'gpt-5.5',input:prompt,text:{format:{type:'json_schema',name:'diagnosis',strict:true,schema:{type:'object',properties:{summary:{type:'string'},findings:{type:'array',items:{type:'string'}},priorities:{type:'array',items:{type:'string'}},proposal:{type:'string'}},required:['summary','findings','priorities','proposal'],additionalProperties:false}}}})})
 const raw=await r.json();if(!r.ok)throw new Error('OpenAI API 오류: '+(raw?.error?.message||r.statusText))
 const text=(raw.output||[]).filter((x:any)=>x.type==='message').flatMap((x:any)=>x.content||[]).filter((x:any)=>x.type==='output_text').map((x:any)=>x.text).join('').trim()
 return JSON.parse(text)
}
export async function POST(req:Request,{params}:{params:{id:string}}){
 try{const s=db(),id=Number(params.id),body=await req.json().catch(()=>({}))
  const {data:i,error}=await s.from('discovery_inquiries').select('id,company_name,website_url,industry,main_services,concerns,message').eq('id',id).single()
  if(error||!i)return NextResponse.json({error:'상담 정보를 찾을 수 없습니다.'},{status:404})
  const action=String(body.action||'generate')
  if(action==='generate'){
   let target=String(i.website_url||'').trim();if(!/^https?:\/\//i.test(target))target='https://'+target
   const snapshot=await inspect(target)
   const ai=await synthesize(i,snapshot)
   const missingTitle=snapshot.pages.filter((p:any)=>!p.error&&!p.title).length,missingDesc=snapshot.pages.filter((p:any)=>!p.error&&!p.description).length,missingH1=snapshot.pages.filter((p:any)=>!p.error&&!p.h1).length,faq=snapshot.pages.filter((p:any)=>p.hasFaq).length
   const fallback={summary:`${i.company_name} 홈페이지의 공개 페이지 ${snapshot.pageCount}개를 실제 확인했습니다. Sitemap은 ${snapshot.sitemapFound?'확인':'미확인'}되었고, 구조화 정보는 ${snapshot.structuredDataTypes.length?snapshot.structuredDataTypes.join(', '):'확인되지 않았습니다'}.`,findings:[`공개 페이지 ${snapshot.pageCount}개 확인 · 제목 누락 ${missingTitle}개 · 설명 누락 ${missingDesc}개 · H1 누락 ${missingH1}개`,`Sitemap: ${snapshot.sitemapFound?`확인됨 (URL ${snapshot.sitemapUrlCount}개)`:'미확인'}`,`구조화 정보: ${snapshot.structuredDataTypes.join(', ')||'미확인'} · FAQ 관련 페이지: ${faq}개`],priorities:['제목·설명·H1이 비어 있거나 서비스 설명이 불명확한 핵심 페이지부터 정비합니다.','Sitemap·구조화 정보·FAQ 등 검색엔진과 AI가 읽을 수 있는 기본 정보를 보완합니다.','실제 고객 질문을 기준으로 검색·AI 발견 상태를 별도 측정해 기준선을 만듭니다.'],proposal:'이번 홈페이지 점검 결과를 기준으로 우선순위를 확정하고, 이후 실제 검색·AI 발견 측정을 통해 개선 전 기준선을 만드는 방식을 제안합니다. 특정 검색 순위나 AI 추천 노출을 보장하지 않습니다.'}
   const d=ai||fallback,title=`${i.company_name} 검색·AI 발견 현황 진단`
   const existing=await s.from('discovery_diagnosis_reports').select('id,public_token').eq('inquiry_id',id).maybeSingle()
   const payload={inquiry_id:id,title,summary:d.summary,findings:d.findings,priorities:d.priorities,proposal:d.proposal,status:'draft',public_token:existing.data?.public_token||token(),website_snapshot:snapshot,updated_at:new Date().toISOString()}
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

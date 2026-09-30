import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'

export async function POST(req:Request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,service=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value
 if(!url||!publishable||!service||!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data:{user}}=await auth.auth.getUser(token)
 if(!user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const body=await req.json().catch(()=>({})),projectId=Number(body.projectId),result=body.result
 if(!Number.isInteger(projectId)||projectId<1||!result||typeof result.website!=='string'||!Array.isArray(result.pages)||JSON.stringify(result).length>60000)return NextResponse.json({error:'홈페이지 진단 결과를 확인해 주세요.'},{status:400})
 const s=createClient(url,service,{auth:{persistSession:false}})
 const {data:project}=await s.from('discovery_projects').select('website_url,naver_management').eq('id',projectId).maybeSingle()
 if(!project?.naver_management||!project.website_url)return NextResponse.json({error:'네이버 프로젝트 홈페이지가 등록되지 않았습니다.'},{status:404})
 try{const registered=new URL(/^https?:\/\//i.test(project.website_url)?project.website_url:'https://'+project.website_url),checked=new URL(result.website);if(registered.hostname.replace(/^www\./,'')!==checked.hostname.replace(/^www\./,''))return NextResponse.json({error:'등록된 프로젝트 홈페이지와 진단 주소가 다릅니다.'},{status:400})}catch{return NextResponse.json({error:'홈페이지 주소를 확인해 주세요.'},{status:400})}
 const observed={website:result.website,checkedAt:result.checkedAt,pageCount:result.pageCount,sitemapFound:result.sitemapFound,sitemapUrlCount:result.sitemapUrlCount,structuredDataTypes:result.structuredDataTypes,pages:result.pages.slice(0,8).map((page:any)=>({url:String(page.url||'').slice(0,500),title:String(page.title||'').slice(0,300),description:String(page.description||'').slice(0,700),h1:String(page.h1||'').slice(0,300),contentHash:typeof page.contentHash==='string'&&/^[a-f0-9]{64}$/.test(page.contentHash)?page.contentHash:null,textSample:String(page.textSample||'').slice(0,900),hasFaq:!!page.hasFaq,structuredData:Array.isArray(page.structuredData)?page.structuredData.slice(0,15):[],error:String(page.error||'').slice(0,300)}))}
 const summary=`공개 홈페이지 ${observed.pageCount}개 페이지 확인 · Sitemap ${observed.sitemapFound?'확인됨':'미확인'} · 구조화 정보 ${Array.isArray(observed.structuredDataTypes)&&observed.structuredDataTypes.length?observed.structuredDataTypes.join(', '):'미확인'}`
 const {data,error}=await s.from('discovery_analysis_history').insert({project_id:projectId,measurement_round:'Naver Website',observed:[observed],interpreted:summary}).select('id,created_at').single()
 return error?NextResponse.json({error:'진단 결과 저장 실패: '+error.message},{status:500}):NextResponse.json({history:data})
}

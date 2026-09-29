import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'
const seoulDay=(date:string)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(date))

export async function POST(req:Request){
 try{
  const {questionId,projectId:rawProjectId}=await req.json()
  const projectId=Number(rawProjectId)
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  const geminiKey=process.env.GEMINI_API_KEY
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!geminiKey)return NextResponse.json({error:'GEMINI_API_KEY가 아직 설정되지 않았습니다.'},{status:500})
  if(!url||!publishable||!key)return NextResponse.json({error:'Supabase 환경변수를 확인해 주세요.'},{status:500})
  const token=cookies().get('damda_staff_token')?.value
  if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:user,error:authError}=await auth.auth.getUser(token)
  if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const s=createClient(url,key,{auth:{persistSession:false}})
  const {data:q,error:qe}=await s.from('discovery_questions').select('id,question,is_benchmark').eq('project_id',projectId).eq('id',Number(questionId)).eq('is_benchmark',true).maybeSingle()
  if(qe||!q)return NextResponse.json({error:qe?.message||'Benchmark 질문을 찾지 못했습니다.'},{status:404})
  const {data:existing,error:ee}=await s.from('discovery_measurements').select('id,is_discovered,result_text,source_urls,created_at').eq('project_id',projectId).eq('question_id',q.id).eq('channel','Gemini').order('created_at',{ascending:false}).limit(1).maybeSingle()
  if(ee)return NextResponse.json({error:'기존 측정 확인 실패: '+ee.message},{status:500})
  if(existing&&seoulDay(existing.created_at)===seoulDay(new Date().toISOString()))return NextResponse.json({ok:true,verified:true,reused:true,measurementId:existing.id,discovered:existing.is_discovered,answer:existing.result_text,sourceUrls:existing.source_urls??[]})
  const {data:project}=await s.from('discovery_projects').select('name,website_url').eq('id',projectId).single()
  const resp=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',{
   method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':geminiKey},
   body:JSON.stringify({contents:[{role:'user',parts:[{text:q.question}]}],tools:[{google_search:{}}],generationConfig:{temperature:0.2}})
  })
  const raw=await resp.json()
  if(!resp.ok)return NextResponse.json({error:'Gemini API 오류: '+(raw?.error?.message||resp.statusText)},{status:502})
  const answer=(raw?.candidates?.[0]?.content?.parts??[]).map((p:any)=>p.text||'').join('\n').trim()
  if(!answer)return NextResponse.json({error:'Gemini 응답에서 텍스트를 찾지 못했습니다.'},{status:502})
  const sourceUrls=[...new Set((raw?.candidates?.[0]?.groundingMetadata?.groundingChunks??[]).map((x:any)=>x?.web?.uri).filter((x:any):x is string=>typeof x==='string'))]
  const haystack=(answer+'\n'+sourceUrls.join('\n')).toLowerCase()
  const names=[project?.name,project?.website_url].filter(Boolean).flatMap((v:any)=>{const name=String(v).toLowerCase();try{const u=new URL(name);return[name,u.hostname.replace(/^www\./,'')]}catch{return[name]}}).filter((v:string)=>v.length>=3)
  const discovered=names.some((name:string)=>haystack.includes(name))
  const {data:saved,error:ie}=await s.from('discovery_measurements').insert({project_id:projectId,question_id:q.id,channel:'Gemini',is_discovered:discovered,result_text:answer,source_urls:sourceUrls.length?sourceUrls:null,notes:'자동 측정 · Gemini API + Google Search grounding · 프로젝트 브랜드/도메인 직접 언급 기준 자동 판정',measurement_round:existing?'재측정':'Day 0'}).select('id').single()
  if(ie||!saved)return NextResponse.json({error:'측정 저장 검증 실패: '+(ie?.message||'저장된 행을 다시 읽지 못했습니다.')},{status:500})
  return NextResponse.json({ok:true,verified:true,reused:false,measurementId:saved.id,discovered,answer,sourceUrls})
 }catch(e:any){return NextResponse.json({error:e?.message||'자동 측정 중 오류가 발생했습니다.'},{status:500})}
}

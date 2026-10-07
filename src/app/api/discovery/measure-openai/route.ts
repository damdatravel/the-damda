import {measurementGate} from '../../../../lib/discovery/measurementGate'
import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

export async function POST(req:Request){
 try{
  const {questionId,projectId:rawProjectId}=await req.json()
  const projectId=Number(rawProjectId)
  if(!Number.isInteger(projectId)||projectId<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
  const openaiKey=process.env.OPENAI_API_KEY
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!openaiKey)return NextResponse.json({error:'OPENAI_API_KEY가 아직 설정되지 않았습니다.'},{status:500})
  if(!url||!publishable||!key)return NextResponse.json({error:'Supabase 환경변수를 확인해 주세요.'},{status:500})
  const token=cookies().get('damda_staff_token')?.value
  if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:user,error:authError}=await auth.auth.getUser(token)
  if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const s=createClient(url,key,{auth:{persistSession:false}})
  const {data:q,error:qe}=await s.from('discovery_questions').select('id,question,is_benchmark').eq('project_id',projectId).eq('id',Number(questionId)).eq('is_benchmark',true).maybeSingle()
  if(qe||!q)return NextResponse.json({error:qe?.message||'Benchmark 질문을 찾지 못했습니다.'},{status:404})

  // 정기 회차에서 이미 저장된 질문·채널은 재사용한다.
  const {data:existing,error:ee}=await s.from('discovery_measurements')
   .select('id,is_discovered,result_text,source_urls,created_at')
   .eq('project_id',projectId).eq('question_id',q.id).eq('channel','OpenAI Web Search API')
   .order('created_at',{ascending:false}).limit(1).maybeSingle()
  if(ee)return NextResponse.json({error:'기존 측정 확인 실패: '+ee.message},{status:500})
  const gate=await measurementGate(s,projectId,existing)
  if(gate.reuse&&existing)return NextResponse.json({ok:true,verified:true,reused:true,measurementId:existing.id,discovered:existing.is_discovered,answer:existing.result_text,sourceUrls:existing.source_urls??[]})
  if(gate.blocked)return NextResponse.json({error:gate.message,nextMeasurementDate:gate.cycle.next},{status:409})

  const {data:project}=await s.from('discovery_projects').select('name,website_url').eq('id',projectId).single()
  const resp=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${openaiKey}`},body:JSON.stringify({model:'gpt-5.5',tools:[{type:'web_search'}],tool_choice:'auto',include:['web_search_call.action.sources'],input:`다음 질문에 현재 웹 정보를 검색해서 자연스럽게 답변해 주세요. 특정 업체를 억지로 포함하지 말고, 실제 검색 결과에 근거해 답하세요. 질문: ${q.question}`})})
  const raw=await resp.json()
  if(!resp.ok)return NextResponse.json({error:'OpenAI API 오류: '+(raw?.error?.message||resp.statusText)},{status:502})
  const textParts=(raw?.output??[]).filter((item:any)=>item?.type==='message').flatMap((item:any)=>item?.content??[]).filter((part:any)=>part?.type==='output_text')
  const answer=textParts.map((part:any)=>part?.text||'').join('\n').trim()
  if(!answer)return NextResponse.json({error:'OpenAI 응답에서 텍스트를 찾지 못했습니다.'},{status:502})
  const citedUrls=textParts.flatMap((part:any)=>(part?.annotations??[]).filter((a:any)=>a?.type==='url_citation').map((a:any)=>a?.url||a?.url_citation?.url).filter(Boolean))
  const sourceUrls=(raw?.output??[]).filter((item:any)=>item?.type==='web_search_call').flatMap((item:any)=>item?.action?.sources??[]).map((source:any)=>source?.url).filter(Boolean)
  const urls=[...new Set([...citedUrls,...sourceUrls])] as string[]
  const haystack=(answer+'\n'+urls.join('\n')).toLowerCase()
  const names=[project?.name,project?.website_url].filter(Boolean).flatMap((v:any)=>{const s=String(v).toLowerCase();try{const u=new URL(s);return[s,u.hostname.replace(/^www\\./,'')]}catch{return[s]}}).filter((v:string)=>v.length>=3)
  const discovered=names.some((v:string)=>haystack.includes(v))

  // insert 결과를 다시 받아 실제 DB 저장까지 확인해야 성공으로 처리한다.
  const {data:saved,error:ie}=await s.from('discovery_measurements').insert({project_id:projectId,question_id:q.id,channel:'OpenAI Web Search API',is_discovered:discovered,result_text:answer,source_urls:urls.length?urls:null,notes:'자동 측정 · OpenAI Responses API + Web Search · 프로젝트 브랜드/도메인 직접 언급 기준 자동 판정',measurement_round:existing?'재측정':'Day 0'}).select('id,question_id,channel,is_discovered,created_at').single()
  if(ie||!saved)return NextResponse.json({error:'측정 저장 검증 실패: '+(ie?.message||'저장된 행을 다시 읽지 못했습니다.')},{status:500})
  return NextResponse.json({ok:true,verified:true,reused:false,measurementId:saved.id,discovered,answer,sourceUrls:urls})
 }catch(e:any){return NextResponse.json({error:e?.message||'자동 측정 중 오류가 발생했습니다.'},{status:500})}
}

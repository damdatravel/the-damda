import {measurementGate} from '../../../lib/discovery/measurementGate'
import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

type Provider='Perplexity API'|'Claude API'|'Meta Model API'
const urlsFrom=(items:unknown[])=>[...new Set(items.filter((value):value is string=>typeof value==='string'&&/^https?:\/\//i.test(value)))]

export async function measureExternal(req:Request,provider:Provider){
 try{
  const {questionId,projectId:rawProjectId}=await req.json()
  const projectId=Number(rawProjectId)
  if(!Number.isInteger(projectId)||projectId<1||!Number.isInteger(Number(questionId))||Number(questionId)<1)return NextResponse.json({error:'올바른 프로젝트와 질문을 지정해 주세요.'},{status:400})
  const meta=provider==='Meta Model API'
  const apiKey=meta?process.env.META_API_KEY:provider==='Perplexity API'?process.env.PERPLEXITY_API_KEY:process.env.ANTHROPIC_API_KEY
  if(!apiKey)return NextResponse.json({error:`${meta?'META_API_KEY':provider==='Perplexity API'?'PERPLEXITY_API_KEY':'ANTHROPIC_API_KEY'}가 설정되지 않았습니다.`},{status:503})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY
  if(!url||!publishable||!key)return NextResponse.json({error:'Supabase 환경변수를 확인해 주세요.'},{status:500})
  const token=cookies().get('damda_staff_token')?.value
  if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:user,error:authError}=await auth.auth.getUser(token)
  if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const s=createClient(url,key,{auth:{persistSession:false}})
  const {data:q,error:qe}=await s.from('discovery_questions').select('id,question').eq('project_id',projectId).eq('id',Number(questionId)).eq('is_benchmark',true).maybeSingle()
  if(qe||!q)return NextResponse.json({error:qe?.message||'Benchmark 질문을 찾지 못했습니다.'},{status:404})
  const {data:existing,error:ee}=await s.from('discovery_measurements').select('id,is_discovered,result_text,source_urls,created_at').eq('project_id',projectId).eq('question_id',q.id).eq('channel',provider).order('created_at',{ascending:false}).limit(1).maybeSingle()
  if(ee)return NextResponse.json({error:'기존 측정 확인 실패: '+ee.message},{status:500})
  const gate=await measurementGate(s,projectId,existing)
  if(gate.reuse&&existing)return NextResponse.json({ok:true,verified:true,reused:true,measurementId:existing.id,discovered:existing.is_discovered,answer:existing.result_text,sourceUrls:existing.source_urls??[]})
  if(gate.blocked)return NextResponse.json({error:gate.message,nextMeasurementDate:gate.cycle.next},{status:409})
  const {data:project,error:pe}=await s.from('discovery_projects').select('name,website_url').eq('id',projectId).single()
  if(pe||!project)return NextResponse.json({error:pe?.message||'프로젝트를 찾지 못했습니다.'},{status:404})
  const perplexity=provider==='Perplexity API'
  const response=await fetch(meta?'https://api.meta.ai/v1/responses':perplexity?'https://api.perplexity.ai/v1/agent':'https://api.anthropic.com/v1/messages',{
   method:'POST',headers:(meta||perplexity)?{'Content-Type':'application/json',Authorization:`Bearer ${apiKey}`}:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
   body:JSON.stringify(meta?{model:process.env.META_MODEL||'muse-spark-1.3',input:q.question,tools:[{type:'web_search'}]}:perplexity?{preset:'fast',input:q.question}:{model:'claude-sonnet-5',max_tokens:1600,messages:[{role:'user',content:`현재 공개 웹 정보를 검색해 다음 질문에 자연스럽게 답변해 주세요. 특정 업체를 억지로 포함하지 마세요. 질문: ${q.question}`}],tools:[{type:'web_search_20250305',name:'web_search',max_uses:3}]}),cache:'no-store',signal:AbortSignal.timeout(90000)
  })
  const raw=await response.json().catch(()=>({}))
  if(!response.ok)return NextResponse.json({error:`${provider} 오류: ${raw?.error?.message||raw?.message||response.statusText}`},{status:502})
  if(meta&&!(raw.output||[]).some((x:any)=>x.type==='web_search_call'))return NextResponse.json({error:'Meta API에서 웹 검색 실행을 확인하지 못했습니다. 검색 측정으로 저장하지 않았습니다.'},{status:502})
  const parts=(meta||perplexity)?(raw?.output??[]).filter((item:any)=>item?.type==='message'&&item?.role==='assistant').flatMap((item:any)=>item?.content??[]):(raw?.content??[]).filter((item:any)=>item?.type==='text')
  const answer=parts.map((part:any)=>part?.text||'').join('\n').trim()
  if(!answer)return NextResponse.json({error:`${provider} 응답에서 답변을 찾지 못했습니다.`},{status:502})
  const sources=perplexity?(raw?.output??[]).filter((item:any)=>item?.type==='search_results').flatMap((item:any)=>item?.results??[]).map((item:any)=>item?.url):[]
  const citations=parts.flatMap((part:any)=>part?.citations??part?.annotations??[]).map((item:any)=>item?.url||item?.cited_text?.url)
  const sourceUrls=urlsFrom([...sources,...citations])
  const names=[project.name,project.website_url].filter(Boolean).flatMap((value:string)=>{const name=value.toLowerCase();try{return[name,new URL(name).hostname.replace(/^www\./,'')]}catch{return[name]}}).filter((name:string)=>name.length>=3)
  const haystack=(answer+'\n'+sourceUrls.join('\n')).toLowerCase()
  const discovered=names.some((name:string)=>haystack.includes(name))
  const {data:saved,error:ie}=await s.from('discovery_measurements').insert({project_id:projectId,question_id:q.id,channel:provider,is_discovered:discovered,result_text:answer,source_urls:sourceUrls.length?sourceUrls:null,notes:`${meta?'모델 '+(process.env.META_MODEL||'muse-spark-1.3')+' · ':''}자동 측정 · ${provider} + 웹 검색 · 소비자 화면과 별도 · 프로젝트 브랜드/도메인 직접 언급 기준 자동 판정`,measurement_round:existing?'재측정':'Day 0'}).select('id').single()
  if(ie||!saved)return NextResponse.json({error:'측정 저장 검증 실패: '+(ie?.message||'저장된 행을 읽지 못했습니다.')},{status:500})
  return NextResponse.json({ok:true,verified:true,reused:false,measurementId:saved.id,discovered,answer,sourceUrls})
 }catch(error:any){return NextResponse.json({error:error?.message||'자동 측정 중 오류가 발생했습니다.'},{status:500})}
}

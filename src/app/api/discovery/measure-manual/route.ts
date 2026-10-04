import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {cookies} from 'next/headers'

const channels=new Set(['ChatGPT','Google Search','Naver Search','Naver AI Briefing','Google AI','Perplexity','Claude','Copilot'])

export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({})),projectId=Number(body.projectId),questionId=Number(body.questionId)
  if(!Number.isInteger(projectId)||projectId<1||!Number.isInteger(questionId)||questionId<1||!channels.has(body.channel)||(typeof body.discovered!=='boolean'&&!(body.channel==='Naver AI Briefing'&&body.discovered===null)))return NextResponse.json({error:'측정 질문과 채널을 확인해 주세요.'},{status:400})
  const result=String(body.result||'').trim(),notes=String(body.notes||'').trim(),sourceUrls=String(body.urls||'').split(/\s+/).filter(Boolean)
  if(!result||result.length>30000||notes.length>3000||sourceUrls.length>30||sourceUrls.some(x=>!/^https?:\/\//i.test(x)))return NextResponse.json({error:'실제 답변과 출처 URL을 확인해 주세요.'},{status:400})
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,publishable=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value
  if(!url||!publishable||!secret)return NextResponse.json({error:'Supabase 환경변수를 확인해 주세요.'},{status:500})
  if(!token)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const auth=createClient(url,publishable,{auth:{persistSession:false,autoRefreshToken:false}})
  const {data:user,error:authError}=await auth.auth.getUser(token)
  if(authError||!user.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
  const s=createClient(url,secret,{auth:{persistSession:false}})
  const {data:question,error:qe}=await s.from('discovery_questions').select('id').eq('project_id',projectId).eq('id',questionId).eq('is_benchmark',true).maybeSingle()
  if(qe||!question)return NextResponse.json({error:qe?.message||'Benchmark 질문을 찾지 못했습니다.'},{status:404})
  const {data:existing,error:ee}=await s.from('discovery_measurements').select('id').eq('project_id',projectId).eq('question_id',questionId).eq('channel',body.channel).limit(1)
  if(ee)return NextResponse.json({error:ee.message},{status:500})
  const {data:saved,error}=await s.from('discovery_measurements').insert({project_id:projectId,question_id:questionId,channel:body.channel,is_discovered:body.discovered,result_text:result,source_urls:sourceUrls.length?sourceUrls:null,notes:body.channel==='Naver AI Briefing'?`네이버 AI 브리핑 화면 기록 · ${body.discovered===null?'AI 답변 미표시 또는 판단 보류':'AI 답변 표시됨'}${notes?' · '+notes:''}`:notes||'수동 측정 · 실제 채널 결과 기록',measurement_round:existing?.length?'재측정':'Day 0'}).select('id').single()
  if(error||!saved)return NextResponse.json({error:'측정 저장 실패: '+(error?.message||'저장 확인 실패')},{status:500})
  return NextResponse.json({ok:true,measurementId:saved.id})
 }catch(e:any){return NextResponse.json({error:e?.message||'수동 측정 중 오류가 발생했습니다.'},{status:500})}
}

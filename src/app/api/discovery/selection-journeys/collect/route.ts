import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {validateJourney} from '../../../../../lib/discovery/selectionJourney'
export const maxDuration=120
export async function POST(req:Request){try{
 const token=cookies().get('damda_staff_token')?.value,url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,secret=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!token||!url||!pub||!secret)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const auth=await createClient(url,pub).auth.getUser(token);if(auth.error||!auth.data.user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 const b=await req.json(),j=b.journey,index=b.index,id=Number(b.projectId)
 if(!Number.isSafeInteger(id)||id<1||!Number.isInteger(index)||index<0||index>=j?.steps?.length||!['OpenAI API','Gemini API'].includes(j?.channel)||!validateJourney({...j,reviewed:false,steps:j.steps.map((s:any)=>({...s,answer:s.answer||'수집 대기'}))})||j.steps.slice(0,index).some((s:any)=>!s.answer.trim()))return NextResponse.json({error:'채널·질문 순서·원본을 확인해 주세요.'},{status:400})
 const s=createClient(url,secret),p=await s.from('discovery_projects').select('ai_management').eq('id',id).single();if(p.error||!p.data?.ai_management)return NextResponse.json({error:'AI 관리 프로젝트가 필요합니다.'},{status:403})
 const open=j.channel==='OpenAI API',key=open?process.env.OPENAI_API_KEY:process.env.GEMINI_API_KEY,model=open?'gpt-5.5':'gemini-3.5-flash';if(!key)return NextResponse.json({error:'선택 채널의 API 키를 설정해 주세요.'},{status:503})
 // Only explicit measurement conditions and questions are sent; never inject the target as a recommendation instruction.
 const turns=j.steps.slice(0,index+1).flatMap((x:any,i:number)=>[{role:'user',text:(i===0&&j.conditions?`이용 조건: ${j.conditions}\n`:'')+x.question},...(i<index?[{role:'assistant',text:x.answer}]:[])])
 const body=open?{model,store:false,max_output_tokens:6000,tools:[{type:'web_search'}],include:['web_search_call.action.sources'],input:turns.map((t:any)=>({role:t.role,content:t.text}))}:{contents:turns.map((t:any)=>({role:t.role==='assistant'?'model':'user',parts:[{text:t.text}]})),tools:[{google_search:{}}],generationConfig:{maxOutputTokens:6000}}
 const r=await fetch(open?'https://api.openai.com/v1/responses':`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:open?{'Content-Type':'application/json',Authorization:`Bearer ${key}`}:{'Content-Type':'application/json','x-goog-api-key':key},body:JSON.stringify(body),signal:AbortSignal.timeout(100000)}),raw=await r.json();if(!r.ok)throw Error('API 답변 수집 실패 ('+r.status+'). 키·크레딧·모델 설정을 확인하세요.')
 const parts=(raw.output||[]).flatMap((x:any)=>x.content||[]),answer=open?parts.filter((x:any)=>x.type==='output_text').map((x:any)=>x.text).join('\n'):(raw.candidates?.[0]?.content?.parts||[]).filter((x:any)=>!x.thought).map((x:any)=>x.text||'').join('\n')
 if(!answer.trim()||answer.length>20000||open&&raw.status!=='completed'||!open&&raw.candidates?.[0]?.finishReason!=='STOP')throw Error('완전한 답변을 수집하지 못했습니다. 이 단계부터 다시 실행하세요.')
 const candidates=open?[...parts.flatMap((x:any)=>(x.annotations||[]).map((a:any)=>a.url)),...(raw.output||[]).flatMap((x:any)=>(x.action?.sources||[]).map((a:any)=>a.url))]:(raw.candidates?.[0]?.groundingMetadata?.groundingChunks||[]).map((x:any)=>x.web?.uri)
 const urls=[...new Set<string>(candidates.filter((x:any)=>{try{const u=new URL(x);return ['http:','https:'].includes(u.protocol)&&!u.username&&!u.password}catch{return false}}))].slice(0,20)
 return NextResponse.json({answer,urls,model,collectedAt:new Date().toISOString(),usage:raw.usage||raw.usageMetadata||null})
 }catch{return NextResponse.json({error:'답변 수집에 실패했습니다. 완료된 단계는 유지됩니다. 키·크레딧·응답 제한을 확인한 뒤 실패 단계부터 다시 실행하세요.'},{status:502})}}

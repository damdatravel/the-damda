import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export async function POST(req:Request){
 try{
  const {questionId}=await req.json()
  const openaiKey=process.env.OPENAI_API_KEY
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!openaiKey)return NextResponse.json({error:'OPENAI_API_KEY가 아직 설정되지 않았습니다.'},{status:500})
  if(!url||!key)return NextResponse.json({error:'Supabase 환경변수를 확인해 주세요.'},{status:500})

  const s=createClient(url,key)
  const {data:q,error:qe}=await s.from('discovery_questions').select('id,question,is_benchmark').eq('project_id',1).eq('id',Number(questionId)).eq('is_benchmark',true).maybeSingle()
  if(qe||!q)return NextResponse.json({error:qe?.message||'Benchmark 질문을 찾지 못했습니다.'},{status:404})

  const resp=await fetch('https://api.openai.com/v1/responses',{
   method:'POST',
   headers:{'Content-Type':'application/json','Authorization':`Bearer ${openaiKey}`},
   body:JSON.stringify({
    model:'gpt-5.5',
    tools:[{type:'web_search'}],
    tool_choice:'auto',
    include:['web_search_call.action.sources'],
    input:`다음 질문에 현재 웹 정보를 검색해서 자연스럽게 답변해 주세요. 특정 업체를 억지로 포함하지 말고, 실제 검색 결과에 근거해 답하세요. 질문: ${q.question}`
   })
  })
  const raw=await resp.json()
  if(!resp.ok)return NextResponse.json({error:'OpenAI API 오류: '+(raw?.error?.message||resp.statusText)},{status:502})

  const textParts=(raw?.output??[])
   .filter((item:any)=>item?.type==='message')
   .flatMap((item:any)=>item?.content??[])
   .filter((part:any)=>part?.type==='output_text')
  const answer=textParts.map((part:any)=>part?.text||'').join('\n').trim()
  if(!answer)return NextResponse.json({error:'OpenAI 응답에서 텍스트를 찾지 못했습니다.'},{status:502})

  const citedUrls=textParts.flatMap((part:any)=>(part?.annotations??[])
   .filter((a:any)=>a?.type==='url_citation')
   .map((a:any)=>a?.url||a?.url_citation?.url)
   .filter(Boolean))
  const sourceUrls=(raw?.output??[])
   .filter((item:any)=>item?.type==='web_search_call')
   .flatMap((item:any)=>item?.action?.sources??[])
   .map((source:any)=>source?.url)
   .filter(Boolean)
  const urls=[...new Set([...citedUrls,...sourceUrls])] as string[]

  const haystack=(answer+'\n'+urls.join('\n')).toLowerCase()
  const discovered=haystack.includes('더담다')||haystack.includes('더 담다')||haystack.includes('the damda')||haystack.includes('the-damda.co.kr')

  const {error:ie}=await s.from('discovery_measurements').insert({
   project_id:1,
   question_id:q.id,
   channel:'OpenAI Web Search API',
   is_discovered:discovered,
   result_text:answer,
   source_urls:urls.length?urls:null,
   notes:'자동 측정 · OpenAI Responses API + Web Search · 브랜드/도메인 직접 언급 기준 자동 판정',
   measurement_round:'Day 0'
  })
  if(ie)return NextResponse.json({error:'측정 저장 실패: '+ie.message},{status:500})
  return NextResponse.json({ok:true,discovered,answer,sourceUrls:urls})
 }catch(e:any){
  return NextResponse.json({error:e?.message||'자동 측정 중 오류가 발생했습니다.'},{status:500})
 }
}

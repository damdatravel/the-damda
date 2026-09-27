import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export async function POST(req:Request){
 try{
  const {questionId}=await req.json()
  const geminiKey=process.env.GEMINI_API_KEY
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if(!geminiKey)return NextResponse.json({error:'GEMINI_API_KEY가 아직 설정되지 않았습니다.'},{status:500})
  if(!url||!key)return NextResponse.json({error:'Supabase 환경변수를 확인해 주세요.'},{status:500})
  const s=createClient(url,key)
  const {data:q,error:qe}=await s.from('discovery_questions').select('id,question,is_benchmark').eq('project_id',1).eq('id',Number(questionId)).eq('is_benchmark',true).maybeSingle()
  if(qe||!q)return NextResponse.json({error:qe?.message||'Benchmark 질문을 찾지 못했습니다.'},{status:404})
  const resp=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent',{
   method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':geminiKey},
   body:JSON.stringify({contents:[{role:'user',parts:[{text:q.question}]}],generationConfig:{temperature:0.2}})
  })
  const raw=await resp.json()
  if(!resp.ok)return NextResponse.json({error:'Gemini API 오류: '+(raw?.error?.message||resp.statusText)},{status:502})
  const answer=(raw?.candidates?.[0]?.content?.parts??[]).map((p:any)=>p.text||'').join('\n').trim()
  if(!answer)return NextResponse.json({error:'Gemini 응답에서 텍스트를 찾지 못했습니다.'},{status:502})
  const lower=answer.toLowerCase()
  const discovered=lower.includes('더담다')||lower.includes('더 담다')||lower.includes('the damda')||lower.includes('the-damda.co.kr')
  const {error:ie}=await s.from('discovery_measurements').insert({project_id:1,question_id:q.id,channel:'Gemini',is_discovered:discovered,result_text:answer,source_urls:null,notes:'자동 측정 · Gemini API · 브랜드/도메인 직접 언급 기준 자동 판정',measurement_round:'Day 0'})
  if(ie)return NextResponse.json({error:'측정 저장 실패: '+ie.message},{status:500})
  return NextResponse.json({ok:true,discovered,answer})
 }catch(e:any){return NextResponse.json({error:e?.message||'자동 측정 중 오류가 발생했습니다.'},{status:500})}
}

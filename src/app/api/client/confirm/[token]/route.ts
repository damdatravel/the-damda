import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
import {validAnswers,publicConfirmation} from '../../../../../lib/engagement'
export async function POST(req:Request,{params}:{params:{token:string}}){try{
 if(!/^[A-Za-z0-9_-]{43}$/.test(params.token))return NextResponse.json({error:'유효하지 않은 링크입니다.'},{status:404})
 const raw=await req.text();if(raw.length>30000)return NextResponse.json({error:'입력 내용이 너무 깁니다.'},{status:413})
 const body=JSON.parse(raw),url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return NextResponse.json({error:'현재 확인서를 열 수 없습니다.'},{status:503})
 const s=createClient(url,key,{auth:{persistSession:false}}),r=await s.from('discovery_engagements').select('document,inquiry_id').eq('public_token',params.token).maybeSingle()
 const view=r.data?publicConfirmation(r.data.document):null
 if(!view)return NextResponse.json({error:'만료되었거나 중단된 확인 요청입니다.'},{status:404})
 const i=await s.from('discovery_inquiries').select('status').eq('id',r.data!.inquiry_id).single();if(i.error||i.data.status==='closed')return NextResponse.json({error:'종료된 확인 요청입니다.'},{status:404})
 if(view.submitted||view.id!==body.requestId)return NextResponse.json({error:'이미 제출했거나 새 확인 요청으로 변경되었습니다.'},{status:409})
 if(!validAnswers(body.answers,view.facts as any))return NextResponse.json({error:'모든 항목을 확인하고 수정 내용은 2,000자 이내로 입력해 주세요.'},{status:400})
 const answers=body.answers.map((a:any)=>({id:a.id,status:a.status,value:a.status==='corrected'?a.value.trim():''}))
 const saved=await s.rpc('discovery_submit_confirmation',{link_token:params.token,request_id:body.requestId,answers})
 if(saved.error||saved.data!==true)return NextResponse.json({error:'제출 상태가 바뀌었습니다. 페이지를 새로고침해 주세요.'},{status:409})
 return NextResponse.json({ok:true})
}catch{return NextResponse.json({error:'확인 답변을 저장하지 못했습니다.'},{status:400})}}

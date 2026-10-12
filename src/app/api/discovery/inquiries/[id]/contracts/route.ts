import {NextResponse} from 'next/server'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {cleanPhone} from '@/lib/consultingSms'
import {contractDb,contractStaff,contractIssues,contractText,contractHash,contractUrl,contractHtml,sendContractMail,CONTRACT_VERSION} from '@/lib/discovery/contracts'
export const dynamic='force-dynamic'
export const maxDuration=60
export async function GET(req:Request,{params}:{params:{id:string}}){
 if(!await contractStaff())return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 try{const id=Number(params.id);if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:'상담을 확인하세요.'},{status:400});const s=contractDb(),download=new URL(req.url).searchParams.get('download');if(download){const r=await s.from('discovery_contracts').select('*').eq('inquiry_id',id).eq('id',download).maybeSingle();if(r.error||!r.data)return NextResponse.json({error:'계약을 찾을 수 없습니다.'},{status:404});return new NextResponse(contractHtml(r.data),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private, no-store','Referrer-Policy':'no-referrer','Content-Security-Policy':"default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'"}})}const r=await s.from('discovery_contracts').select('id,status,created_at,sent_at,signed_at,expires_at,recipient_email,completion_email_status').eq('inquiry_id',id).order('created_at',{ascending:false}).limit(30);if(r.error)return NextResponse.json({error:'계약 저장 설정이 필요합니다. discovery_contracts.sql을 실행하세요.'},{status:503});return NextResponse.json({contracts:r.data},{headers:{'Cache-Control':'no-store'}})}catch{return NextResponse.json({error:'계약 조회 실패'},{status:500})}
}
export async function POST(req:Request,{params}:{params:{id:string}}){
 const user=await contractStaff();if(!user)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401})
 try{
 const id=Number(params.id),body=await req.json();if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:'상담을 확인하세요.'},{status:400});const s=contractDb()
 if(body.action==='cancel'){const r=await s.from('discovery_contracts').update({status:'cancelled'}).eq('inquiry_id',id).eq('id',body.contractId).in('status',['sending','sent','send_failed']).select('id').maybeSingle();if(r.error||!r.data)return NextResponse.json({error:'서명된 계약은 취소하거나 수정할 수 없습니다.'},{status:409});return NextResponse.json({ok:true})}
 if(!['send','retry','completionEmail'].includes(body.action)||body.confirmed!==true)return NextResponse.json({error:'계약 내용과 수신자, 제공자 승인·발송 확인이 필요합니다.'},{status:400})
 if(!process.env.RESEND_API_KEY||!process.env.DIAGNOSIS_EMAIL_FROM||!process.env.SOLAPI_API_SECRET)return NextResponse.json({error:'Resend 및 문자 인증 환경 설정이 필요합니다.'},{status:503})
 let row:any
 if(body.action==='send'){
 const saved=await s.from('discovery_quotations').select('document').eq('inquiry_id',id).maybeSingle();if(saved.error||!saved.data)return NextResponse.json({error:'견적서와 계약 초안을 먼저 저장하세요.'},{status:400});const q=saved.data.document,issues=contractIssues(q);if(issues.length)return NextResponse.json({error:issues.join(' / ')},{status:400})
 const seal=q.contractDraft.sealPreview?'data:image/png;base64,'+(await readFile(path.join(process.cwd(),'private-assets/company-seal.png'))).toString('base64'):null
 const snapshot={version:CONTRACT_VERSION,quote:q,text:contractText(q),seal},r=await s.from('discovery_contracts').insert({inquiry_id:id,snapshot,snapshot_hash:contractHash(snapshot),recipient_email:q.email.trim(),recipient_phone:cleanPhone(q.phone),expires_at:new Date(Date.now()+7*86400000).toISOString(),provider_user_id:user.id}).select('*').single()
 if(r.error)return NextResponse.json({error:r.error.code==='23505'?'이미 서명 대기 계약이 있습니다. 기존 계약을 확인하거나 취소한 뒤 새로 발송하세요.':'계약 저장 설정을 확인하세요. discovery_contracts.sql 실행이 필요합니다.'},{status:409});row=r.data
 }else{
 const r=await s.from('discovery_contracts').select('*').eq('inquiry_id',id).eq('id',body.contractId).maybeSingle();if(r.error||!r.data)return NextResponse.json({error:'계약 조회 실패'},{status:404});row=r.data
 if(body.action==='completionEmail'){if(row.status!=='signed')return NextResponse.json({error:'서명 완료 계약만 발송할 수 있습니다.'},{status:409});try{await sendContractMail(row,true);await s.from('discovery_contracts').update({completion_email_status:'sent'}).eq('id',row.id);return NextResponse.json({ok:true})}catch{return NextResponse.json({error:'완료 안내 발송 실패. 계약 서명 기록은 유지됩니다.'},{status:502})}}
 if(Date.parse(row.expires_at)<Date.now()||!['send_failed','sending'].includes(row.status)||row.status==='sending'&&Date.now()-Date.parse(row.created_at)<180000)return NextResponse.json({error:'발송 실패 또는 3분 이상 발송 대기 계약만 재시도할 수 있습니다.'},{status:409})
 }
 try{await sendContractMail(row);const saved=await s.from('discovery_contracts').update({status:'sent',sent_at:new Date().toISOString()}).eq('id',row.id).in('status',['sending','send_failed']).select('id').maybeSingle();if(saved.error||!saved.data)throw Error('STATUS');return NextResponse.json({ok:true,contractId:row.id})}catch{await s.from('discovery_contracts').update({status:'send_failed'}).eq('id',row.id).in('status',['sending','send_failed']);return NextResponse.json({error:'메일 발송 또는 상태 저장을 확인하지 못했습니다. 이력에서 동일 계약 재시도를 사용하세요.'},{status:502})}
 }catch{return NextResponse.json({error:'계약 발송 처리 실패. 입력과 서버 설정을 확인하세요.'},{status:500})}
}

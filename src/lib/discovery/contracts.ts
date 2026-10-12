import {contractPrintHtml} from '../contractPresentation'
import crypto from 'node:crypto'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {Quotation,quoteTotals,validateQuotation,quoteServicesConsistent} from '../quotation'
import {cleanPhone,pack,unpack} from '../consultingSms'
export const CONTRACT_VERSION='damda-contract-v1'
export function stableJson(value:any):string{if(Array.isArray(value))return '['+value.map(stableJson).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).filter(k=>value[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+stableJson(value[k])).join(',')+'}';return JSON.stringify(value)}
export function contractHash(value:unknown){return crypto.createHash('sha256').update(stableJson(value)).digest('hex')}
export {contractText} from '../contractDocument'
export function contractIssues(q:unknown):string[]{
 if(!validateQuotation(q)||!quoteServicesConsistent(q))return ['저장된 견적 정보가 올바르지 않습니다.']
 const d=q.contractDraft;if(!d)return ['계약 초안을 작성하고 견적서를 저장해 주세요.']
 const issues:string[]=[]
 if(!cleanPhone(q.phone)||!/^\S+@\S+\.\S+$/.test(q.email)||q.email.length>254)issues.push('서명자의 휴대폰 번호와 이메일을 확인하세요.')
 if(!/^\d{10}$/.test(d.businessNumber.replace(/\D/g,'')))issues.push('사업자등록번호 10자리를 입력하세요.')
 for(const [name,v] of [['대표자',d.representative],['서명자',d.signer],['제공 범위',q.scope],['결제 조건',q.payment],['고객 협조',q.cooperation],['종료·정산 조건',d.termination]])if(!v.trim())issues.push(name+'을 입력하세요.')
 if(!/^\d{4}-\d{2}-\d{2}$/.test(q.startDate)||!Number.isFinite(Date.parse(q.startDate)))issues.push('관리 시작일을 입력하세요.')
 if(d.authentication!=='basic')issues.push('PASS·명의 본인 확인은 아직 연동 전입니다. 기본 문자 인증 계약만 발송할 수 있습니다.')
 if(d.authority==='delegate'&&!d.authorityEvidence.trim())issues.push('담당자 계약 권한 확인 내용을 입력하세요.')
 if(d.publishing&&[d.media,d.usage,d.revenue,d.afterEnd].some(v=>!v.trim()))issues.push('매체·수량·자료 이용·수익 귀속·종료 후 처리 조건을 입력하세요.')
 if([q.scope,d.termination,...(d.publishing?[d.media,d.afterEnd]:[])].some(v=>/작성하세요|명시하세요|기재합니다|협의해 기재/.test(v)))issues.push('초안 안내 문구를 실제 합의한 조건으로 바꿔 주세요.')
 return issues
}
export function contractDb(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!url||!key)throw Error('서버 데이터베이스 설정이 필요합니다.');return createClient(url,key,{auth:{persistSession:false}})}
export async function contractStaff(){const token=cookies().get('damda_staff_token')?.value,url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!token||!url||!key)return null;const r=await createClient(url,key,{auth:{persistSession:false}}).auth.getUser(token);return r.error?null:r.data.user}
export function contractToken(row:{id:string;expires_at:string}){if(!process.env.SOLAPI_API_SECRET)throw Error('인증 서명 설정이 필요합니다.');return pack({kind:CONTRACT_VERSION,id:row.id,exp:Date.parse(row.expires_at)})}
export async function contractFromToken(token:string){const p=unpack<{kind:string;id:string;exp:number}>(token);if(!p||p.kind!==CONTRACT_VERSION||!Number.isFinite(p.exp)||p.exp<Date.now()||!/^[\da-f-]{36}$/.test(p.id))return null;const r=await contractDb().from('discovery_contracts').select('*').eq('id',p.id).gt('expires_at',new Date().toISOString()).maybeSingle();if(r.error)throw Error('계약 조회 실패');if(!r.data||r.data.status==='cancelled'||Date.parse(r.data.expires_at)!==p.exp)return null;return r.data}
export function contractUrl(row:{id:string;expires_at:string}){return 'https://www.the-damda.co.kr/client/contract?token='+encodeURIComponent(contractToken(row))}
export async function sendContractMail(row:any,completed=false){
 if(!process.env.RESEND_API_KEY||!process.env.DIAGNOSIS_EMAIL_FROM)throw Error('Resend 발송 설정이 필요합니다.')
 const url=contractUrl(row),subject=completed?'담다 디스커버리 계약 서명 완료':'담다 디스커버리 계약 내용 확인 및 서명 요청'
 const result=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'contract-'+row.id+(completed?'-signed':'-request')},body:JSON.stringify({from:process.env.DIAGNOSIS_EMAIL_FROM,to:[row.recipient_email],subject,...(completed?{attachments:[{filename:'damda-contract-'+row.id+'.html',content:Buffer.from(contractHtml(row)).toString('base64')}]}:{}),text:`${subject}\n\n계약서를 확인하세요: ${url}\n\n링크는 ${new Date(row.expires_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}까지 유효합니다. 서명 완료 문서는 화면 또는 첨부 계약본에서 인쇄 / PDF 저장할 수 있습니다. 링크를 다른 사람에게 전달하지 마세요.`}),signal:AbortSignal.timeout(15000)})
 if(!result.ok)throw Error('이메일 발송 실패');return true
}
export function validSignature(value:unknown):value is string{if(typeof value!=='string'||!/^data:image\/png;base64,[A-Za-z0-9+/]+=*$/.test(value)||value.length>220000)return false;const b=Buffer.from(value.split(',')[1],'base64');return b.length>=100&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))&&b.subarray(12,16).toString()==='IHDR'&&b.readUInt32BE(16)>0&&b.readUInt32BE(16)<=1024&&b.readUInt32BE(20)>0&&b.readUInt32BE(20)<=512}
export function contractHtml(row:any){return contractPrintHtml({quote:row.snapshot.quote,text:row.snapshot.text,logo:row.snapshot.logo,seal:row.snapshot.seal,signature:row.signature_data,status:row.status,id:row.id,hash:row.snapshot_hash,providerApprovedAt:row.provider_approved_at,signedAt:row.signed_at})}

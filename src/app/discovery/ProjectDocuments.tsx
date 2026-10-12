import Link from 'next/link'
import {createClient} from '@supabase/supabase-js'
import {requireStaff} from '../../lib/requireStaff'
import {quoteStatuses,quoteTotals,validateQuotation} from '../../lib/quotation'

const contractStatuses:Record<string,string>={sending:'발송 중',sent:'서명 대기',send_failed:'발송 실패',signed:'체결 완료',cancelled:'취소'}
function date(value:string|null){return value?new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—'}
export default async function ProjectDocuments({projectId}:{projectId:number}){
 await requireStaff()
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 const shell=(body:React.ReactNode)=><section id="project-documents" className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6"><h2 className="text-xl font-bold">견적·계약 보관함</h2><p className="mt-2 mb-5 text-sm leading-6 text-gray-500">프로젝트에 연결된 상담의 견적서와 계약 이력입니다. 견적은 최신 저장본이며, 계약은 발송 당시 확정한 원본을 보관합니다.</p>{body}</section>
 if(!url||!key)return shell(<p role="alert" className="text-sm text-amber-800">견적·계약 조회 환경변수를 확인해 주세요.</p>)
 const s=createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const inquiries=await s.from('discovery_inquiries').select('id,company_name,created_at').eq('project_id',projectId).order('created_at',{ascending:false})
 if(inquiries.error)return shell(<p role="alert" className="text-sm text-amber-800">연결된 상담 자료를 불러오지 못했습니다. 새로고침해 다시 확인해 주세요.</p>)
 if(!inquiries.data?.length)return shell(<p className="text-sm text-gray-500">프로젝트에 연결된 상담 자료가 없습니다. 상담에서 계약 전환으로 연결된 견적·계약을 이곳에서 확인할 수 있습니다.</p>)
 const ids=inquiries.data.map(i=>i.id)
 const [quotes,contracts]=await Promise.all([
  s.from('discovery_quotations').select('inquiry_id,document,updated_at').in('inquiry_id',ids).order('updated_at',{ascending:false}),
  s.from('discovery_contracts').select('id,inquiry_id,status,created_at,sent_at,signed_at,expires_at').in('inquiry_id',ids).order('created_at',{ascending:false})
 ])
 return shell(<div className="space-y-5">{(quotes.error||contracts.error)&&<p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{quotes.error?'견적서':''}{quotes.error&&contracts.error?' 및 ':''}{contracts.error?'계약 이력':''}을 불러오지 못했습니다. 저장 테이블과 연결 상태를 확인해 주세요.</p>}{inquiries.data.map(inquiry=>{
  const saved=quotes.data?.find(q=>q.inquiry_id===inquiry.id),q=saved&&validateQuotation(saved.document)?saved.document:null
  const history=contracts.data?.filter(c=>c.inquiry_id===inquiry.id)||[]
  return <article key={inquiry.id} className="rounded-xl border border-gray-200 p-4 md:p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">{inquiry.company_name} · 상담 #{inquiry.id}</h3><p className="mt-1 text-xs text-gray-500">접수 {date(inquiry.created_at)}</p></div><Link href={`/discovery/inquiries/${inquiry.id}?quote=1#quotation`} className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-800">견적·계약 관리 →</Link></div><div className="mt-4 rounded-lg bg-gray-50 p-4">{q?<><p className="font-semibold">견적 {q.number} · {quoteStatuses[q.status]}</p><p className="mt-1 text-sm">계약기간 총액 {quoteTotals(q).grand.toLocaleString('ko-KR')}원 · {q.vat?'부가세 포함':'부가세 별도'}</p><p className="mt-1 text-xs text-gray-500">최근 저장 {date(saved!.updated_at)}</p></>:<p className="text-sm text-gray-500">{quotes.error?'견적 조회 실패':saved?'저장된 견적 형식을 확인해 주세요.':'저장된 견적서가 없습니다.'}</p>}</div><h4 className="mt-5 text-sm font-bold">계약 이력 {contracts.error?'':`(${history.length}건)`}</h4>{!history.length&&!contracts.error&&<p className="mt-2 text-sm text-gray-500">발송한 계약서가 없습니다.</p>}<div className="mt-2 space-y-2">{history.map(c=>{
   const expired=c.status==='sent'&&new Date(c.expires_at).getTime()<Date.now()
   return <div key={c.id} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><p className="text-sm font-semibold">{expired?'서명 기한 만료':contractStatuses[c.status]||c.status}</p><p className="mt-1 text-xs text-gray-500">생성 {date(c.created_at)}{c.sent_at&&` · 발송 ${date(c.sent_at)}`}{c.signed_at&&` · 서명 ${date(c.signed_at)}`}</p><p className="mt-1 break-all text-xs text-gray-400">계약 ID {c.id}</p></div><a href={`/api/discovery/inquiries/${inquiry.id}/contracts?download=${encodeURIComponent(c.id)}`} target="_blank" rel="noreferrer" className="shrink-0 rounded-lg border border-gray-300 px-4 py-2 text-center text-sm font-bold">계약 원본 · PDF 저장 ↗</a></div>
  })}</div></article>
 })}</div>)
}

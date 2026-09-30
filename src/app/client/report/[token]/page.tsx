import {notFound} from 'next/navigation'
import {createClient} from '@supabase/supabase-js'
import {validCustomerReport} from '../../../../lib/caseReportDocument'
export const dynamic='force-dynamic'
export const revalidate=0
export const metadata={title:'고객 관리 보고서 · 담다 디스커버리',robots:{index:false,follow:false}}
export default async function CustomerReportPage({params}:{params:{token:string}}){
 if(!/^[A-Za-z0-9_-]{43}$/.test(params.token))notFound()
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)notFound()
 const s=createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const result=await s.from('discovery_case_reports').select('inquiry_id,published,published_at').eq('public_token',params.token).maybeSingle()
 const row=result.data
 if(!row||!validCustomerReport(row.published))notFound()
 const inquiry=await s.from('discovery_inquiries').select('company_name,status,project_id').eq('id',row.inquiry_id).maybeSingle()
 if(!inquiry.data?.project_id||!['contracted','converted'].includes(inquiry.data.status))notFound()
 const r=row.published
 return <main className="min-h-screen bg-[#F4F7F6] px-5 pb-16 pt-24 text-[#0A0F1E]"><div className="mx-auto max-w-3xl"><p className="text-xs font-bold tracking-widest text-emerald-700">담다 디스커버리 · 고객 관리 보고서</p><h1 className="mt-3 text-3xl font-extrabold">{r.title}</h1><p className="mt-3 text-sm text-gray-500">{inquiry.data.company_name}{r.period&&` · ${r.period}`}</p><p className="mt-2 text-xs text-gray-400">보고서 확정 {new Date(row.published_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})}</p><Block title="현재 상황" text={r.summary}/><Items title="확인한 근거와 진단" items={r.findings}/><Items title="개선 우선순위" items={r.priorities}/><Block title="진행 내용과 측정 변화" text={r.progress||'아직 확정된 진행 내용이 없습니다.'}/><Block title="다음 계획" text={r.nextSteps}/><p className="mt-6 text-xs text-gray-500">담당자가 검토·공개 확정한 보고서입니다. 이 전용 링크를 통해 열람할 수 있습니다.</p></div></main>
}
function Block({title,text}:{title:string;text:string}){return <section className="mt-5 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700">{text}</p></section>}
function Items({title,items}:{title:string;items:string[]}){return <section className="mt-5 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">{title}</h2>{items.length?items.map((x,i)=><p key={i} className="mt-3 whitespace-pre-wrap border-b pb-3 text-sm leading-7 last:border-0">{i+1}. {x}</p>):<p className="mt-3 text-sm text-gray-500">아직 확정된 내용이 없습니다.</p>}</section>}

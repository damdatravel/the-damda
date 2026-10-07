import {createClient} from '@supabase/supabase-js'
export default async function RecentReceipts(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return null
 const s=createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const {data,error}=await s.from('discovery_inquiries').select('company_name,created_at').eq('public_receipt_agreed',true).gte('created_at',new Date(Date.now()-30*86400000).toISOString()).order('created_at',{ascending:false}).limit(5)
 if(error||!data?.length)return null
 return <section className="bg-emerald-50 px-5 pb-12"><div className="mx-auto max-w-4xl rounded-2xl border border-emerald-200 bg-white p-6"><h2 className="text-lg font-bold">최근 상담 문의 접수</h2><p className="mt-2 text-sm text-gray-500">공개에 동의한 실제 상담 접수입니다. 업체명 일부만 표시합니다.</p><ul className="mt-4 divide-y">{data.map((r,i)=><li key={i} className="flex flex-wrap items-center justify-between gap-3 py-3"><span><span className="font-bold">{Array.from(String(r.company_name||'').trim())[0]||'고'}***</span> · 상담 문의 접수</span><span className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})} <span className="ml-2 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">접수 완료</span></span></li>)}</ul></div></section>
}

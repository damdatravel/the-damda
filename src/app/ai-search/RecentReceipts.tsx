import {createClient} from '@supabase/supabase-js'
const fields=['웨딩·행사','음식점·카페','숙박·호텔','여행·운송','의료·건강','법률·세무 등 전문 서비스','부동산·분양','쇼핑·유통','제조·산업','교육','생활·청소','광고·마케팅·IT','기타']
export default async function RecentReceipts(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return null
 const s=createClient(url,key,{auth:{persistSession:false},global:{fetch:(input,init)=>fetch(input,{...init,cache:'no-store'})}})
 const since=new Date(Date.now()-30*86400000).toISOString()
 const [inquiries,diagnoses]=await Promise.all([
 s.from('discovery_inquiries').select('company_name,industry,search_goal,created_at').eq('public_receipt_agreed',true).gte('created_at',since).order('created_at',{ascending:false}).limit(5),
 s.from('discovery_public_diagnoses').select('intake_context,created_at').eq('public_receipt_agreed',true).is('inquiry_id',null).gt('retained_until',new Date().toISOString()).gte('created_at',since).order('created_at',{ascending:false}).limit(5)])
 const rows=[...(inquiries.data||[]).map(r=>({...r,kind:'상담 문의 접수'})),...(diagnoses.data||[]).map(r=>({...r.intake_context,created_at:r.created_at,kind:'홈페이지 사전 진단 접수'}))].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,5)
 if(!rows.length)return null
 return <section className="bg-emerald-50 px-5 pb-12"><div className="mx-auto max-w-4xl rounded-2xl border border-emerald-200 bg-white p-6"><h2 className="text-lg font-bold">최근 사전 진단·상담 접수</h2><p className="mt-2 text-sm text-gray-500">공개에 동의한 실제 접수입니다. 업체명 일부와 사업 분야·희망 채널만 표시합니다.</p><ul className="mt-4 divide-y">{rows.map((r,i)=><li key={i} className="flex flex-wrap items-center justify-between gap-3 py-4"><div><p><span className="font-bold">{Array.from(String(r.company_name||'').trim())[0]||'고'}***</span> · {r.kind}</p><p className="mt-2 text-sm text-gray-600">{fields.includes(r.industry)?r.industry:'사업 분야 미공개'} · {(Array.isArray(r.search_goal?.channels)?r.search_goal.channels:[]).filter((v:string)=>['AI','Naver'].includes(v)).map((v:string)=>v==='AI'?'AI 검색':'네이버 검색').join('·')||'검색 진단'}</p></div><span className="text-sm text-gray-500">{new Date(r.created_at).toLocaleDateString('ko-KR',{timeZone:'Asia/Seoul'})} <span className="ml-2 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">접수 완료</span></span></li>)}</ul></div></section>
}

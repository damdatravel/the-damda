import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'
export async function POST(req:Request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return NextResponse.json({error:'서버 설정을 확인해 주세요.'},{status:500})
 const {projectId}=await req.json().catch(()=>({}));const id=Number(projectId)
 if(!Number.isInteger(id)||id<1)return NextResponse.json({error:'올바른 프로젝트가 아닙니다.'},{status:400})
 const s=createClient(url,key,{auth:{persistSession:false}})
 const p=await s.from('discovery_projects').select('id,name,website_url,industry,main_services,description').eq('id',id).single()
 if(p.error)return NextResponse.json({error:p.error.message},{status:404})
 const iq=await s.from('discovery_inquiries').select('id,concerns,message').eq('project_id',id).maybeSingle()
 const dr=iq.data?await s.from('discovery_diagnosis_reports').select('priorities,website_snapshot').eq('inquiry_id',iq.data.id).maybeSingle():{data:null}
 const snap:any=dr.data?.website_snapshot||{},pages=Array.isArray(snap.pages)?snap.pages.filter((x:any)=>!x.error):[]
 const text=pages.flatMap((x:any)=>[x.title,x.description,x.h1,x.textSample]).filter(Boolean).join(' · ')
 const rows:any[]=[];const add=(t:string,v:any,n:number,source='diagnosis')=>{const x=String(v||'').trim();if(x&&!rows.some(r=>r.dimension_type===t&&r.dimension_value===x))rows.push({project_id:id,dimension_type:t,dimension_value:x,priority:n,is_active:true,source})}
 add('WHO',p.data.industry||'이 서비스를 찾는 고객',80,'project')
 String(p.data.main_services||'').split(/[,/·\n]/).map((x:string)=>x.trim()).filter(Boolean).slice(0,8).forEach((x:string,i:number)=>add('SERVICE',x,100-i,'project'))
 ;(iq.data?.concerns||[]).slice(0,8).forEach((x:string,i:number)=>add('PROBLEM',x,95-i))
 ;(dr.data?.priorities||[]).slice(0,5).forEach((x:string,i:number)=>add('PURPOSE',x,80-i))
 ;['인천공항','김포공항','서울','인천','홍대','명동','강남','잠실','부산','제주'].filter(x=>text.includes(x)||String(p.data.main_services||'').includes(x)).forEach((x,i)=>add('WHERE',x,90-i,'website'))
 ;['서비스 찾기','서비스 비교','가격·조건 확인','이용 방법 확인'].forEach((x,i)=>add('ACTION',x,75-i,'system'))
 const existing=await s.from('discovery_question_dimensions').select('dimension_type,dimension_value').eq('project_id',id)
 if(existing.error)return NextResponse.json({error:existing.error.message},{status:500})
 const keys=new Set((existing.data||[]).map((x:any)=>x.dimension_type+'|'+x.dimension_value)),fresh=rows.filter(x=>!keys.has(x.dimension_type+'|'+x.dimension_value))
 if(fresh.length){const ins=await s.from('discovery_question_dimensions').insert(fresh);if(ins.error)return NextResponse.json({error:ins.error.message},{status:500})}
 return NextResponse.json({ok:true,added:fresh.length,total:(existing.data?.length||0)+fresh.length})
}
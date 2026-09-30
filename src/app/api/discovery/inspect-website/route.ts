import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

import {inspectWebsite} from '../../../../lib/websiteInspection'
export const maxDuration=120
export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({}))
  const dbUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  let target=String(body?.url||'').trim()
  if(!target&&dbUrl&&key){const s=createClient(dbUrl,key);const {data}=await s.from('discovery_projects').select('website_url').eq('id',1).single();target=String(data?.website_url||'')}
  if(!target)return NextResponse.json({error:'확인할 홈페이지 URL이 없습니다.'},{status:400})
  if(!/^https?:\/\//i.test(target))target='https://'+target
  const start=new URL(target)
  if(!/^https?:$/.test(start.protocol)||['localhost','127.0.0.1','0.0.0.0','::1'].includes(start.hostname))return NextResponse.json({error:'공개된 http/https 홈페이지 주소만 확인할 수 있습니다.'},{status:400})
  return NextResponse.json(await inspectWebsite(target))
 }catch(e:any){return NextResponse.json({error:e?.message||'홈페이지 확인 중 오류가 발생했습니다.'},{status:500})}
}
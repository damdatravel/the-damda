import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export async function POST(req:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
 const token=req.cookies.get('damda_staff_token')?.value
 if(url&&key&&token){
  const supabase=createClient(url,key,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false}})
  await supabase.auth.signOut().catch(()=>null)
 }
 const out=NextResponse.json({ok:true})
 out.cookies.delete('damda_staff_token')
 out.cookies.delete('damda_staff_refresh')
 out.headers.set('Clear-Site-Data','"cache"')
 return out
}
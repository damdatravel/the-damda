import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export async function POST(req:Request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!url||!key)return NextResponse.json({error:'인증 환경설정을 확인해 주세요.'},{status:500})
 const body=await req.json().catch(()=>({}))
 if(!body.email||!body.password)return NextResponse.json({error:'이메일과 비밀번호를 입력해 주세요.'},{status:400})
 const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
 const{data,error}=await supabase.auth.signInWithPassword({email:String(body.email),password:String(body.password)})
 if(error||!data.session)return NextResponse.json({error:'계정 정보를 확인해 주세요.'},{status:401})
 const out=NextResponse.json({ok:true})
 out.cookies.set('damda_staff_token',data.session.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60})
 out.cookies.set('damda_staff_refresh',data.session.refresh_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30})
 return out
}
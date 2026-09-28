import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export async function POST(req:Request){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return NextResponse.json({error:'인증 설정을 확인해 주세요.'},{status:500})
 const{email,password}=await req.json().catch(()=>({}))
 if(!email||!password)return NextResponse.json({error:'이메일과 비밀번호를 입력해 주세요.'},{status:400})
 const s=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
 const{data,error}=await s.auth.signInWithPassword({email:String(email),password:String(password)})
 if(error||!data.session)return NextResponse.json({error:'계정 정보를 확인해 주세요.'},{status:401})
 const res=NextResponse.json({ok:true})
 res.cookies.set('damda_staff_token',data.session.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*8})
 return res
}

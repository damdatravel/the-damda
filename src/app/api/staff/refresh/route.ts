import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
export async function POST(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,refresh=cookies().get('damda_staff_refresh')?.value
 if(!url||!key)return NextResponse.json({error:'인증 환경설정을 확인해 주세요.'},{status:500})
 if(!refresh)return NextResponse.json({error:'다시 직원 로그인해 주세요.'},{status:401})
 const auth=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
 const {data,error}=await auth.auth.refreshSession({refresh_token:refresh})
 if(error||!data.session)return NextResponse.json({error:'다시 직원 로그인해 주세요.'},{status:401})
 const out=NextResponse.json({ok:true}),options={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax' as const,path:'/'}
 out.cookies.set('damda_staff_token',data.session.access_token,{...options,maxAge:data.session.expires_in})
 out.cookies.set('damda_staff_refresh',data.session.refresh_token,{...options,maxAge:60*60*24*30})
 return out
}

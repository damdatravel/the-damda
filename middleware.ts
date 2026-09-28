import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export async function middleware(req:NextRequest){
 const path=req.nextUrl.pathname
 const protectedPath=path.startsWith('/discovery')||path.startsWith('/client/demo')||(path.startsWith('/api/discovery')&&!path.startsWith('/api/discovery/calendar.ics'))
 if(!protectedPath)return NextResponse.next()
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
 if(url&&key){
  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
  const token=req.cookies.get('damda_staff_token')?.value
  if(token){
   const{data}=await supabase.auth.getUser(token)
   if(data.user)return NextResponse.next()
  }
  const refresh=req.cookies.get('damda_staff_refresh')?.value
  if(refresh){
   const{data}=await supabase.auth.refreshSession({refresh_token:refresh})
   if(data.session){
    const out=NextResponse.next()
    out.cookies.set('damda_staff_token',data.session.access_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60})
    out.cookies.set('damda_staff_refresh',data.session.refresh_token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:60*60*24*30})
    return out
   }
  }
 }
 if(path.startsWith('/api/'))return NextResponse.json({error:'Unauthorized'},{status:401})
 const login=new URL('/staff-login',req.url)
 return NextResponse.redirect(login)
}
export const config={matcher:['/discovery/:path*','/client/demo/:path*','/api/discovery/:path*']}

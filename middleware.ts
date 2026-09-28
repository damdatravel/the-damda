import {NextRequest,NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

async function isAuthenticated(req:NextRequest){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
 const token=req.cookies.get('damda_staff_token')?.value
 if(!url||!key||!token)return false
 try{
  const supabase=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})
  const{data,error}=await supabase.auth.getUser(token)
  return !error&&!!data.user
 }catch{return false}
}

export async function middleware(req:NextRequest){
 const path=req.nextUrl.pathname
 if(await isAuthenticated(req))return NextResponse.next()
 if(path.startsWith('/api/'))return NextResponse.json({error:'Unauthorized'},{status:401})
 const login=new URL('/staff-login',req.url)
 login.searchParams.set('next',path)
 return NextResponse.redirect(login)
}

export const config={
 matcher:[
  '/discovery',
  '/discovery/:path*',
  '/client/demo',
  '/client/demo/:path*',
  '/api/discovery/((?!calendar\\.ics).*)'
 ]
}

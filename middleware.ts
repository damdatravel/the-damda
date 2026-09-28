import {NextRequest,NextResponse} from 'next/server'

async function validStaff(req:NextRequest){
 const token=req.cookies.get('damda_staff_token')?.value
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY
 if(!token||!url||!key)return false
 try{const r=await fetch(url+'/auth/v1/user',{headers:{apikey:key,Authorization:'Bearer '+token},cache:'no-store'});return r.ok}catch{return false}
}
export async function middleware(req:NextRequest){
 const p=req.nextUrl.pathname
 const protectedPath=p.startsWith('/discovery')||p.startsWith('/client/demo')||(p.startsWith('/api/discovery')&&!p.startsWith('/api/discovery/calendar.ics'))
 if(!protectedPath)return NextResponse.next()
 if(await validStaff(req))return NextResponse.next()
 if(p.startsWith('/api/'))return NextResponse.json({error:'Unauthorized'},{status:401})
 const login=new URL('/staff-login',req.url);login.searchParams.set('next',p);return NextResponse.redirect(login)
}
export const config={matcher:['/discovery/:path*','/client/demo/:path*','/api/discovery/:path*']}

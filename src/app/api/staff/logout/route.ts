import {NextResponse} from 'next/server'
export async function POST(){
 const out=NextResponse.json({ok:true})
 for(const name of ['damda_staff_token','damda_staff_refresh'])out.cookies.set(name,'',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0})
 return out
}
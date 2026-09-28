import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {COOKIE,VERIFIED_COOKIE,cleanPhone,otpHash,pack,unpack} from '@/lib/consultingSms'

type OtpState={phone:string;hash:string;exp:number;sentAt:number;tries:number}
export async function POST(req:Request){
 const body=await req.json().catch(()=>({})),phone=cleanPhone(String(body.phone||'')),code=String(body.code||'').replace(/\D/g,'')
 const state=unpack<OtpState>(cookies().get(COOKIE)?.value)
 if(!phone||!/^[0-9]{6}$/.test(code)||!state||state.phone!==phone)return NextResponse.json({error:'인증정보를 확인해 주세요.'},{status:400})
 if(Date.now()>state.exp)return NextResponse.json({error:'인증번호가 만료되었습니다. 다시 받아 주세요.'},{status:410})
 if(state.tries>=5)return NextResponse.json({error:'인증 시도 횟수를 초과했습니다. 인증번호를 다시 받아 주세요.'},{status:429})
 if(otpHash(phone,code)!==state.hash){
  const out=NextResponse.json({error:`인증번호가 일치하지 않습니다. (${4-state.tries}회 남음)`},{status:400})
  out.cookies.set(COOKIE,pack({...state,tries:state.tries+1}),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:Math.max(1,Math.floor((state.exp-Date.now())/1000))})
  return out
 }
 const out=NextResponse.json({ok:true})
 out.cookies.set(VERIFIED_COOKIE,pack({phone,exp:Date.now()+30*60*1000}),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:1800})
 out.cookies.delete(COOKIE)
 return out
}

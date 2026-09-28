import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {COOKIE,cleanPhone,otpHash,pack,randomOtp,sendSolapiSms,unpack} from '@/lib/consultingSms'

type OtpState={phone:string;hash:string;exp:number;sentAt:number;tries:number}
export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({})),phone=cleanPhone(String(body.phone||''))
  if(!phone)return NextResponse.json({error:'휴대전화 번호를 확인해 주세요.'},{status:400})
  const now=Date.now(),old=unpack<OtpState>(cookies().get(COOKIE)?.value)
  if(old&&old.sentAt&&now-old.sentAt<60000)return NextResponse.json({error:'인증번호는 60초 후 다시 받을 수 있습니다.',retryAfter:Math.ceil((60000-(now-old.sentAt))/1000)},{status:429})
  const code=randomOtp()
  await sendSolapiSms(phone,code)
  const out=NextResponse.json({ok:true,expiresIn:180})
  out.cookies.set(COOKIE,pack({phone,hash:otpHash(phone,code),exp:now+180000,sentAt:now,tries:0}),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:180})
  return out
 }catch(e){console.error('consulting sms send',e);return NextResponse.json({error:'인증번호 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.'},{status:500})}
}

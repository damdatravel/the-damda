import crypto from 'crypto'

const COOKIE='damda_consulting_otp'
const VERIFIED_COOKIE='damda_consulting_phone'

export {COOKIE,VERIFIED_COOKIE}

function secret(){return process.env.SOLAPI_API_SECRET||''}
export function cleanPhone(v:string){const d=v.replace(/\D/g,'');return /^010\d{8}$/.test(d)?d:''}
export function sign(value:string){return crypto.createHmac('sha256',secret()).update(value).digest('hex')}
export function pack(payload:Record<string,unknown>){
 const raw=Buffer.from(JSON.stringify(payload)).toString('base64url')
 return raw+'.'+sign(raw)
}
export function unpack<T>(value?:string):T|null{
 if(!value)return null
 const [raw,sig]=value.split('.')
 if(!raw||!sig)return null
 const expected=sign(raw)
 if(sig.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null
 try{return JSON.parse(Buffer.from(raw,'base64url').toString()) as T}catch{return null}
}
export function otpHash(phone:string,code:string){return sign(phone+':'+code)}
export function randomOtp(){return crypto.randomInt(100000,1000000).toString()}
export async function sendSolapiSms(to:string,code:string){
 const apiKey=process.env.SOLAPI_API_KEY, apiSecret=process.env.SOLAPI_API_SECRET
 const from=(process.env.SOLAPI_SENDER_NUMBER||'').replace(/\D/g,'')
 if(!apiKey||!apiSecret||!from)throw new Error('SOLAPI_CONFIG')
 const date=new Date().toISOString(),salt=crypto.randomUUID()
 const signature=crypto.createHmac('sha256',apiSecret).update(date+salt).digest('hex')
 const r=await fetch('https://api.solapi.com/messages/v4/send',{
  method:'POST',headers:{'Content-Type':'application/json',Authorization:`HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`},
  body:JSON.stringify({message:{to,from,text:`[더담다] 상담 신청 인증번호는 ${code}입니다. 3분 안에 입력해 주세요.`}})
 })
 if(!r.ok)throw new Error('SOLAPI_SEND_'+r.status)
 return r.json().catch(()=>({}))
}

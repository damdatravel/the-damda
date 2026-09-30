import {createHmac,timingSafeEqual} from 'node:crypto'
function secret(){return process.env.SUPABASE_SERVICE_ROLE_KEY}
export function signWebsiteTransfer(snapshot:unknown){const key=secret();if(!key)return null;const payload=Buffer.from(JSON.stringify({snapshot,expiresAt:Date.now()+2*60*60*1000})).toString('base64url');return payload+'.'+createHmac('sha256',key).update(payload).digest('base64url')}
export function readWebsiteTransfer(token:unknown,website:string):any|null{
 try{
  const key=secret();if(!key||typeof token!=='string'||token.length>250000)return null
  const parts=token.split('.');if(parts.length!==2)return null
  const expected=createHmac('sha256',key).update(parts[0]).digest(),actual=Buffer.from(parts[1],'base64url')
  if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return null
  const data=JSON.parse(Buffer.from(parts[0],'base64url').toString()),s=data.snapshot
  if(!Number.isFinite(data.expiresAt)||data.expiresAt<Date.now()||!s?.pageCount||!Array.isArray(s.pages)||!s.checkedAt||new URL(s.website).origin!==new URL(website).origin)return null
  return s
 }catch{return null}
}

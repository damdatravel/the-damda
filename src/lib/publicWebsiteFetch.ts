import {lookup} from 'node:dns/promises'
import {isIP} from 'node:net'
export function privateAddress(ip:string){
 if(isIP(ip)===4){const [a,b]=ip.split('.').map(Number);return a===0||a===10||a===127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a>=224||a===198&&(b===18||b===19)}
 if(isIP(ip)===6){const x=ip.toLowerCase();return x==='::'||x==='::1'||x.startsWith('fc')||x.startsWith('fd')||/^fe[89ab]/.test(x)||x.startsWith('ff')||x.startsWith('::ffff:')||!x.startsWith('2')&& !x.startsWith('3')}
 return true
}
export async function assertPublicWebsite(url:URL){
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port&&!['80','443'].includes(url.port)||url.hostname==='localhost'||url.hostname.endsWith('.localhost'))throw Error('공개 홈페이지 주소만 확인할 수 있습니다.')
 const host=url.hostname.replace(/^\[|\]$/g,'')
 const addresses=isIP(host)?[{address:host}]:await lookup(host,{all:true})
 if(!addresses.length||addresses.some(x=>privateAddress(x.address)))throw Error('공개 홈페이지 주소만 확인할 수 있습니다.')
}
export async function publicWebsiteFetch(target:string){
 let url=new URL(target)
 for(let hop=0;hop<5;hop++){
  await assertPublicWebsite(url)
  const r=await fetch(url,{redirect:'manual',headers:{'User-Agent':'TheDamdaDiscovery/0.2'},signal:AbortSignal.timeout(10000),cache:'no-store'})
  if([301,302,303,307,308].includes(r.status)){const location=r.headers.get('location');await r.body?.cancel();if(!location)throw Error('이동 주소가 없습니다.');url=new URL(location,url);continue}
  if(!r.ok)throw Error(`홈페이지 응답 ${r.status}`)
  const reader=r.body?.getReader();if(!reader)throw Error('홈페이지 내용을 읽지 못했습니다.')
  const chunks:Uint8Array[]=[];let size=0
  try{while(true){const next=await reader.read();if(next.done)break;size+=next.value.length;if(size>2000000)throw Error('페이지 크기가 점검 한도를 초과했습니다.');chunks.push(next.value)}}finally{await reader.cancel()}
  return {html:Buffer.concat(chunks).toString('utf8'),finalUrl:url.toString(),contentType:r.headers.get('content-type')||''}
 }
 throw Error('홈페이지 이동 횟수가 너무 많습니다.')
}

import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

const MAX_PAGES=8
function clean(s:string){return s.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
function pick(html:string,re:RegExp){return clean(html.match(re)?.[1]||'')}
function isPage(u:URL){return !u.pathname.startsWith('/_next/')&&!u.pathname.match(/\.(?:css|js|mjs|map|ico|jpg|jpeg|png|gif|svg|webp|avif|pdf|zip|xml|txt|woff2?|ttf|eot|json)(?:$|\/)/i)}
function links(html:string,base:URL){
 const out:string[]=[]
 for(const m of html.matchAll(/href=["']([^"'#]+)["']/gi)){try{const u=new URL(m[1],base);if(u.origin===base.origin&&/^https?:$/.test(u.protocol)&&isPage(u)){u.hash='';u.search='';out.push(u.toString())}}catch{}}
 return [...new Set(out)]
}
function structuredTypes(html:string){return [...new Set([...html.matchAll(/"@type"\s*:\s*"([^"]+)"/g)].map(x=>x[1]))]}
async function getHtml(url:string){const r=await fetch(url,{redirect:'follow',headers:{'User-Agent':'TheDamdaDiscovery/0.2'},signal:AbortSignal.timeout(10000),cache:'no-store'});if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);const type=r.headers.get('content-type')||'';if(!type.includes('text/html'))throw new Error(`HTML 페이지가 아닙니다 (${type||'content-type 없음'})`);return {html:await r.text(),finalUrl:r.url}}
async function fetchText(url:URL){const r=await fetch(url,{redirect:'follow',headers:{'User-Agent':'TheDamdaDiscovery/0.2'},signal:AbortSignal.timeout(7000),cache:'no-store'});if(!r.ok)return '';return await r.text()}
export async function POST(req:Request){
 try{
  const body=await req.json().catch(()=>({}))
  const dbUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  let target=String(body?.url||'').trim()
  if(!target&&dbUrl&&key){const s=createClient(dbUrl,key);const {data}=await s.from('discovery_projects').select('website_url').eq('id',1).single();target=String(data?.website_url||'')}
  if(!target)return NextResponse.json({error:'확인할 홈페이지 URL이 없습니다.'},{status:400})
  if(!/^https?:\/\//i.test(target))target='https://'+target
  const start=new URL(target)
  if(!/^https?:$/.test(start.protocol)||['localhost','127.0.0.1','0.0.0.0','::1'].includes(start.hostname))return NextResponse.json({error:'공개된 http/https 홈페이지 주소만 확인할 수 있습니다.'},{status:400})
  const first=await getHtml(start.toString());const base=new URL(first.finalUrl)
  let discovered=links(first.html,base)
  let sitemapUrls:string[]=[]
  const sitemapCandidates=[new URL('/sitemap.xml',base)]
  try{const robots=await fetchText(new URL('/robots.txt',base));for(const m of robots.matchAll(/^\s*Sitemap:\s*(\S+)/gim)){try{const u=new URL(m[1],base);if(!sitemapCandidates.some(x=>x.toString()===u.toString()))sitemapCandidates.push(u)}catch{}}}catch{}
  for(const sm of sitemapCandidates){try{const xml=await fetchText(sm);if(!xml)continue;for(const m of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)){try{const u=new URL(m[1].trim(),base);if(u.origin===base.origin&&isPage(u))sitemapUrls.push(u.toString())}catch{}}}catch{}}
  sitemapUrls=[...new Set(sitemapUrls)]
  const candidates=[base.toString(),...sitemapUrls,...discovered].filter(x=>{try{return isPage(new URL(x))}catch{return false}})
  const urls=[...new Set(candidates)].slice(0,MAX_PAGES)
  const pages:any[]=[]
  for(const url of urls){try{const x=url===base.toString()?first:await getHtml(url);const html=x.html;pages.push({url:x.finalUrl,title:pick(html,/<title[^>]*>([\s\S]*?)<\/title>/i),description:pick(html,/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)||pick(html,/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i),h1:pick(html,/<h1[^>]*>([\s\S]*?)<\/h1>/i),structuredData:structuredTypes(html),hasFaq:/FAQ|자주\s*묻는|질문과\s*답변/i.test(clean(html)),textSample:clean(html).slice(0,900)})}catch(e:any){pages.push({url,error:e.message})}}
  const types=[...new Set(pages.flatMap(x=>x.structuredData||[]))]
  return NextResponse.json({ok:true,checkedAt:new Date().toISOString(),website:base.origin,pageCount:pages.filter(x=>!x.error).length,sitemapFound:sitemapUrls.length>0,sitemapUrlCount:sitemapUrls.length,structuredDataTypes:types,pages})
 }catch(e:any){return NextResponse.json({error:e?.message||'홈페이지 확인 중 오류가 발생했습니다.'},{status:500})}
}
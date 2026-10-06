import {publicWebsiteFetch} from './publicWebsiteFetch'
import {detectPlatform} from './websitePlatform'
import {createHash} from 'node:crypto'
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
async function getHtml(url:string){const r=await publicWebsiteFetch(url);if(!r.contentType.includes('text/html'))throw Error('HTML 페이지가 아닙니다.');return r}
async function fetchText(url:URL){return (await publicWebsiteFetch(url.toString())).html}

export async function inspectWebsite(target:string,knownUrls?:string[]){
 if(!/^https?:\/\//i.test(target))target='https://'+target
 const start=new URL(target)
 if(!/^https?:$/.test(start.protocol)||['localhost','127.0.0.1','0.0.0.0','::1'].includes(start.hostname))throw new Error('공개된 http/https 홈페이지 주소만 확인할 수 있습니다.')
  const first=await getHtml(start.toString());const base=new URL(first.finalUrl)
  let discovered=links(first.html,base)
  let sitemapUrls:string[]=[]
  const sitemapCandidates=[new URL('/sitemap.xml',base)]
  try{const robots=await fetchText(new URL('/robots.txt',base));for(const m of robots.matchAll(/^\s*Sitemap:\s*(\S+)/gim)){try{const u=new URL(m[1],base);if(!sitemapCandidates.some(x=>x.toString()===u.toString()))sitemapCandidates.push(u)}catch{}}}catch{}
  for(const sm of sitemapCandidates){try{const xml=await fetchText(sm);if(!xml)continue;for(const m of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)){try{const u=new URL(m[1].trim(),base);if(u.origin===base.origin&&isPage(u))sitemapUrls.push(u.toString())}catch{}}}catch{}}
  sitemapUrls=[...new Set(sitemapUrls)]
  const candidates=[base.toString(),...sitemapUrls,...discovered].filter(x=>{try{return isPage(new URL(x))}catch{return false}})
  const urls=knownUrls?.length?[...new Set(knownUrls)].slice(0,MAX_PAGES):[...new Set(candidates)].slice(0,MAX_PAGES)
  const pages:any[]=[]
  for(const url of urls){try{const x=url===base.toString()?first:await getHtml(url);const html=x.html;pages.push({url:x.finalUrl,title:pick(html,/<title[^>]*>([\s\S]*?)<\/title>/i),description:pick(html,/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["'][^>]*>/i)||pick(html,/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["'][^>]*>/i),h1:pick(html,/<h1[^>]*>([\s\S]*?)<\/h1>/i),structuredData:structuredTypes(html),hasFaq:/FAQ|자주\s*묻는|질문과\s*답변/i.test(clean(html)),textSample:clean(html).slice(0,900),contentHash:createHash('sha256').update(clean(html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1]||html)).digest('hex')})}catch(e:any){pages.push({url,error:e.message})}}
  const types=[...new Set(pages.flatMap(x=>x.structuredData||[]))]
 return {platform:detectPlatform(first.html,first.finalUrl),ok:true,checkedAt:new Date().toISOString(),website:base.origin,pageCount:pages.filter(x=>!x.error).length,sitemapFound:sitemapUrls.length>0,sitemapUrlCount:sitemapUrls.length,structuredDataTypes:types,pages}
}

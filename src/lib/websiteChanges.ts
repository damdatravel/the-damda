type Page={url:string;title?:string;description?:string;h1?:string;hasFaq?:boolean;structuredData?:string[];contentHash?:string;error?:string}
type Snapshot={pages:Page[];sitemapFound?:boolean;sitemapUrlCount?:number}
export function compareWebsite(previous:Snapshot,current:Snapshot){
 const changes:{url:string;fields:string[]}[]=[],failed:string[]=[]
 let incomplete=false
 const normalize=(value:unknown)=>String(value||'').replace(/\s+/g,' ').trim()
 for(const old of previous.pages.filter(x=>!x.error)){
  const next=current.pages.find(x=>x.url===old.url)
  if(!next){if(current.pages.some(x=>x.error))failed.push(old.url);else changes.push({url:old.url,fields:['페이지 주소·이동']});continue}
  if(next.error){failed.push(old.url);continue}
  const fields:string[]=[]
  for(const [key,label] of [['title','제목'],['description','설명'],['h1','주요 제목']] as const)if(normalize(old[key])!==normalize(next[key]))fields.push(label)
  if(!!old.hasFaq!==!!next.hasFaq)fields.push('FAQ')
  if(JSON.stringify([...(old.structuredData||[])].sort())!==JSON.stringify([...(next.structuredData||[])].sort()))fields.push('구조화 정보')
  if(old.contentHash&&next.contentHash){if(old.contentHash!==next.contentHash)fields.push('페이지 내용')}else incomplete=true
  if(fields.length)changes.push({url:old.url,fields})
 }
 return {status:changes.length?'changed':failed.length?'unavailable':incomplete?'baseline_required':'unchanged',changes,failed}
}

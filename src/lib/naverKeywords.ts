export const keywordGroups=['상호','서비스','목적·문제','지역'] as const
export type NaverKeyword={query:string;group:typeof keywordGroups[number];reason:string;sourceUrl:string}
export function normalizeQueries(value:unknown):string[]|null{
 if(!Array.isArray(value)||!value.length||value.length>10||value.some(q=>typeof q!=='string'||!q.trim()||q.trim().length>80))return null
 return [...new Set(value.map(q=>(q as string).trim()))]
}
export function validateRecommendations(value:unknown,sourceUrls:string[]):NaverKeyword[]{
 if(!Array.isArray(value))return []
 const seen=new Set<string>()
 return value.filter((x:any)=>x&&typeof x.query==='string'&&x.query.trim()&&x.query.trim().length<=80&&keywordGroups.includes(x.group)&&typeof x.reason==='string'&&x.reason.trim()&&typeof x.sourceUrl==='string'&&sourceUrls.includes(x.sourceUrl)).map((x:any)=>({query:x.query.trim(),group:x.group,reason:x.reason.slice(0,500),sourceUrl:x.sourceUrl})).filter(x=>{if(seen.has(x.query))return false;seen.add(x.query);return true}).slice(0,24)
}

export type ConsultationScope={ai:boolean;naver:boolean}
export function consultationScope(snapshot:any,concerns:unknown):ConsultationScope{
 const saved=snapshot?.consultationServices
 if(saved&&typeof saved.ai==='boolean'&&typeof saved.naver==='boolean'&&(saved.ai||saved.naver))return {ai:saved.ai,naver:saved.naver}
 const entries=Array.isArray(concerns)?concerns:[]
 const naver=entries.some(x=>typeof x==='string'&&x.includes('네이버')),ai=entries.some(x=>typeof x==='string'&&/ChatGPT|AI|제미나이/i.test(x))
 return {ai:ai||!naver,naver}
}
export function scopeName(scope:ConsultationScope){return scope.ai&&scope.naver?'검색·AI 및 네이버':scope.naver?'네이버 검색':'검색·AI'}

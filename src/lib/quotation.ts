export const quoteStatuses={draft:'초안',sent:'전달',negotiating:'협의 중',accepted:'수락',closed:'종료'}
export type QuoteLine={name:string;kind:'initial'|'monthly'|'extra';quantity:number;price:number}
export type Quotation={number:string;date:string;validUntil:string;customer:string;contact:string;phone:string;email:string;website:string;ai:boolean;naver:boolean;situation:string;priorities:string;purpose:string;websites:number;queries:number;channels:string[];frequency:string;reportFrequency:string;consultation:string;startDate:string;months:number;scope:string;cooperation:string;payment:string;notes:string;vat:boolean;status:keyof typeof quoteStatuses;lines:QuoteLine[]}
export function quoteTotals(q:Quotation){
 const initial=q.lines.filter(x=>x.kind!=='monthly').reduce((s,x)=>s+x.quantity*x.price,0)
 const monthly=q.lines.filter(x=>x.kind==='monthly').reduce((s,x)=>s+x.quantity*x.price,0)
 const total=initial+monthly*q.months, tax=(n:number)=>q.vat?Math.round(n*.1):0
 return {initial,monthly,total,vat:tax(total),grand:total+tax(total),first:initial+monthly+tax(initial+monthly),recurring:monthly+tax(monthly)}
}
export function validateQuotation(value:unknown):value is Quotation{
 if(!value||typeof value!=='object')return false
 const q=value as Quotation
 const strings=['number','date','validUntil','customer','contact','phone','email','website','situation','priorities','purpose','frequency','reportFrequency','consultation','startDate','scope','cooperation','payment','notes'] as const
 if(strings.some(k=>typeof q[k]!=='string'||q[k].length>10000)||!q.customer.trim()||!q.number.trim())return false
 if(typeof q.ai!=='boolean'||typeof q.naver!=='boolean'||(!q.ai&&!q.naver)||typeof q.vat!=='boolean'||!Object.hasOwn(quoteStatuses,q.status))return false
 if(![q.websites,q.queries,q.months].every(n=>Number.isSafeInteger(n)&&n>=1&&n<=1000))return false
 if(!Array.isArray(q.channels)||q.channels.length>20||q.channels.some(x=>typeof x!=='string'||x.length>100))return false
 if(!Array.isArray(q.lines)||!q.lines.length||q.lines.length>30)return false
 return q.lines.every(x=>x&&typeof x.name==='string'&&x.name.trim().length>0&&x.name.length<=200&&['initial','monthly','extra'].includes(x.kind)&&Number.isSafeInteger(x.quantity)&&x.quantity>=1&&x.quantity<=1000&&Number.isSafeInteger(x.price)&&x.price>=0&&x.price<=100000000)
}

export type SearchGoal={service:string;customer:string;situation:string;area:string;channels:string[];examples:string}
export const emptySearchGoal:SearchGoal={service:'',customer:'',situation:'',area:'',channels:[],examples:''}
export function validSearchGoal(g:any){return !!g&&['service','customer','situation','area','examples'].every(k=>typeof g[k]==='string'&&g[k].length<=2000)&&Array.isArray(g.channels)&&g.channels.length>0&&g.channels.length<=2&&new Set(g.channels).size===g.channels.length&&g.channels.every((x:any)=>['AI','Naver'].includes(x))&&!!g.service.trim()&&!!g.situation.trim()}
export function cleanSearchGoal(g:SearchGoal):SearchGoal{return{service:g.service.trim(),customer:g.customer.trim(),situation:g.situation.trim(),area:g.area.trim(),channels:g.channels,examples:g.examples.trim()}}
export const goalStatuses={draft:'목표 초안',active:'진행 중',achieved:'달성',partial:'부분 달성',unmet:'미달성',paused:'보류',stopped:'종료'} as const
export type Goal={id:string;sequence:number;search:SearchGoal;baseline:string;workCriteria:string;resultCriteria:string;reviewDate:string;agreement:string;agreementDate:string;status:keyof typeof goalStatuses;result:string;reviewAgreement:string;reviewAgreementDate:string;workComplete:boolean;knownCause:string;hypothesis:string;responsePlan:string;nextReviewDate:string;decision:'continue'|'adjust'|'stop';history:any[]}
export const MAX_OPEN_GOALS=5
export function openGoals(goals:Goal[]){return goals.filter(g=>!['achieved','stopped'].includes(g.status))}
export type Fact={id:string;goalId:string;label:string;value:string;source:string;reason:string;review:'pending'|'verified';resolvedValue?:string;confirmedAt?:string}
export type Answer={id:string;status:'correct'|'corrected'|'unknown';value:string}
export type Engagement={goals:Goal[];facts:Fact[];request:any;responses:any[];events:any[]}
export const emptyEngagement=():Engagement=>({goals:[],facts:[],request:null,responses:[],events:[]})
const text=(x:any,max=5000)=>typeof x==='string'&&x.length<=max
const date=(x:any)=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&!isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x
export function validGoal(g:any){return !!g&&validSearchGoal(g.search)&&['baseline','workCriteria','resultCriteria','agreement','reviewAgreement','result','knownCause','hypothesis','responsePlan'].every(k=>text(g[k]))&&['reviewDate','agreementDate','reviewAgreementDate','nextReviewDate'].every(k=>g[k]===''||date(g[k]))&&Object.prototype.hasOwnProperty.call(goalStatuses,g.status)&&typeof g.workComplete==='boolean'&&['continue','adjust','stop'].includes(g.decision)}
export function validFacts(f:any,g:Goal[]){return Array.isArray(f)&&f.length<=8&&new Set(f.map((x:any)=>x.id)).size===f.length&&f.every((x:any)=>text(x.id,100)&&!!x.id&&g.some(y=>y.id===x.goalId)&&['label','value','source','reason'].every(k=>text(x[k],2000))&&!!x.label.trim()&&!!x.value.trim()&&!!x.reason.trim())}
export function validAnswers(answers:any,facts:Fact[]){return Array.isArray(answers)&&answers.length===facts.length&&new Set(answers.map((x:any)=>x.id)).size===facts.length&&answers.every((x:any)=>facts.some(f=>f.id===x.id)&&['correct','corrected','unknown'].includes(x.status)&&text(x.value,2000)&&(x.status!=='corrected'||!!x.value.trim()))}
export function applyEngagement(state:Engagement,body:any,now:string,newId:string):Engagement{
 const d:Engagement=JSON.parse(JSON.stringify(state)),event={at:now,action:body.action}
 if(body.action==='goal'){
  if(!validGoal(body.goal))throw Error('목표와 검토 날짜를 확인해 주세요.')
  const old=d.goals.find(g=>g.id===body.goal.id),g={...body.goal,id:old?.id||newId,sequence:old?.sequence||d.goals.length+1,history:old?.history||[]} as Goal
  if(!['achieved','stopped'].includes(g.status)&&openGoals(d.goals.filter(x=>x.id!==g.id)).length>=MAX_OPEN_GOALS)throw Error('미완료 목표는 최대 5개까지 등록할 수 있습니다. 기존 목표를 검토한 뒤 추가해 주세요.')
  g.search=cleanSearchGoal(g.search)
  if(g.status!=='draft'&&(!g.baseline.trim()||!g.workCriteria.trim()||!g.resultCriteria.trim()||!g.reviewDate||!g.agreement.trim()||!g.agreementDate))throw Error('착수 전에 시작 상태·작업 기준·검색 결과 기준·검토일·고객 합의를 기록해 주세요.')
  if(g.status==='achieved'&&!g.workComplete)throw Error('목표 달성 전에 약속한 작업의 완료 여부를 확인해 주세요.')
  if(['partial','unmet','stopped'].includes(g.status)&&(!g.reviewAgreement.trim()||!g.reviewAgreementDate))throw Error('검토 후 고객과 협의한 내용과 확인일을 기록해 주세요.')
  if(g.status==='active'&&d.goals.some(x=>x.id!==g.id&&x.status==='active'))throw Error('진행 중인 목표를 먼저 검토·종료한 뒤 다음 목표를 시작하세요.')
  if(['achieved','partial','unmet'].includes(g.status)&&!g.result.trim())throw Error('달성 판단의 측정 근거와 결과를 기록해 주세요.')
  if(['partial','unmet'].includes(g.status)&&(!g.responsePlan.trim()||!g.nextReviewDate||(!g.knownCause.trim()&&!g.hypothesis.trim())))throw Error('미달성 원인·가설, 대응안과 다음 검토일을 기록해 주세요.')
  if(old)g.history=[...old.history,{at:now,previous:{...old,history:undefined}}]
  d.goals=old?d.goals.map(x=>x.id===old.id?g:x):[...d.goals,g]
 }else if(body.action==='facts'){
  if(!validFacts(body.facts,d.goals))throw Error('목표에 필요한 사실을 8개 이내로 작성하고 확인 이유를 입력해 주세요.')
  d.facts=body.facts.map((x:Fact)=>{const old=d.facts.find(f=>f.id===x.id);const unchanged=old&&['goalId','label','value','source','reason'].every(k=>(old as any)[k]===(x as any)[k]);return{id:x.id,goalId:x.goalId,label:x.label,value:x.value,source:x.source,reason:x.reason,review:unchanged?old.review:'pending',...(unchanged&&old.review==='verified'?{resolvedValue:old.resolvedValue,confirmedAt:old.confirmedAt}:{})}})
 }else if(body.action==='request'){
  if(!d.facts.length)throw Error('고객에게 확인할 사실을 먼저 저장해 주세요.')
  const selected=d.facts.filter(f=>f.review!=='verified');if(!selected.length)throw Error('새로 확인할 미확정 사실이 없습니다.')
  d.request={id:newId,createdAt:now,expiresAt:new Date(Date.parse(now)+30*86400000).toISOString(),facts:selected.map(({id,goalId,label,value,source,reason})=>({id,goalId,label,value,source,reason})),goals:d.goals.filter(g=>selected.some(f=>f.goalId===g.id)).map(g=>({sequence:g.sequence,search:g.search})),answeredAt:null,answers:[]}
 }else if(body.action==='revoke'){d.request=null
 }else if(body.action==='verify'){
  if(!d.request?.answeredAt||body.requestId!==d.request.id||!Array.isArray(body.ids)||!body.ids.length)throw Error('현재 고객 답변을 선택해 주세요.')
  for(const id of body.ids){const f=d.facts.find(f=>f.id===id),requested=d.request.facts.find((f:Fact)=>f.id===id),a=d.request.answers.find((a:Answer)=>a.id===id);if(!f||!requested||!a||a.status==='unknown'||['goalId','label','value','source','reason'].some(k=>(f as any)[k]!==requested[k]))throw Error('미확인 답변 또는 변경된 사실은 확정할 수 없습니다. 다시 확인 요청해 주세요.');f.review='verified';f.resolvedValue=a.status==='corrected'?a.value:requested.value;f.confirmedAt=now}
 }else throw Error('지원하지 않는 작업입니다.')
 d.events=[...d.events,{...event,...(body.action==='verify'?{ids:body.ids}:{}),...(body.action==='request'?{requestId:newId}:{})}];return d
}
export function publicConfirmation(d:Engagement){const r=d.request;if(!r||!Number.isFinite(Date.parse(r.expiresAt))||Date.parse(r.expiresAt)<Date.now())return null;return{id:r.id,expiresAt:r.expiresAt,facts:r.facts.map((f:Fact)=>({id:f.id,label:f.label,value:f.value,reason:f.reason})),goals:r.goals.map((g:any)=>({sequence:g.sequence,search:cleanSearchGoal(g.search)})),submitted:!!r.answeredAt}}
export function goalReport(goals:Goal[]){const pending=openGoals(goals),active=goals.find(g=>g.status==='active');return `검색 목표 관리\n등록한 미완료 목표: ${pending.length}/${MAX_OPEN_GOALS}개\n현재 진행 목표: ${active?`${active.sequence}차 · ${active.search.service}`:'착수 전 또는 검토 중'}\n대기·보완 목표: ${pending.filter(g=>g.status!=='active').map(g=>`${g.sequence}차 · ${g.search.service} (${goalStatuses[g.status]})`).join(', ')||'없음'}\n한 번에 한 목표를 진행하고, 결과 검토와 고객 협의를 거쳐 다음 목표를 시작합니다. 달성·종료된 목표는 아래 이력으로 보존합니다.\n\n`+goals.map(g=>`${g.sequence}차 목표 · ${g.search.service} · ${goalStatuses[g.status]}\n희망 고객: ${g.search.customer||'미기록'}\n희망 지역: ${g.search.area||'미기록'}\n검색 상황: ${g.search.situation}\n채널: ${g.search.channels.join(', ')}\n작업 기준: ${g.workCriteria}\n검색 결과 기준: ${g.resultCriteria}\n검토일: ${g.reviewDate}\n약속한 작업 이행: ${g.workComplete?'완료':'미완료 또는 확인 전'}\n확인 결과: ${g.result||'검토 전'}${['partial','unmet'].includes(g.status)?`\n확인된 원인: ${g.knownCause||'미확인'}\n검증할 가설: ${g.hypothesis||'없음'}\n대응안: ${g.responsePlan}\n다음 검토일: ${g.nextReviewDate}`:''}`).join('\n\n')}

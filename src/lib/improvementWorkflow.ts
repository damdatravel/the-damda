export type NextTask={id:string;title:string;reason:string;action:string;expected:string;remeasure:string;status:'pending'|'approved'|'hold'|'applied'|'reviewed';draft:string;reviewNote?:string;application:string;appliedAt:string|null;measurementIds:number[];outcome:string;updatedAt:string}
export type Workflow={revision:number;tasks:NextTask[]}
export function readWorkflow(observed:any[]):Workflow|null{return observed.find(x=>x?.kind==='improvement-workflow')?.workflow||null}
export function proposals(text:string,source:number):NextTask[]{
 const section=text.split('[우선 개선안]')[1]?.split('[Benchmark별 관찰]')[0]||''
 const seen=new Set<string>()
 return section.split('\n').map(x=>x.trim()).filter(x=>/^\d+\./.test(x)).slice(0,7).flatMap((line,i)=>{
  const p=line.replace(/^\d+\.\s*/,'').split('|').map(x=>x.trim()),key=(p[0]||'').replace(/\s/g,'')
  if(!p[0]||!p[1]||!p[2]||seen.has(key))return [];seen.add(key)
  return [{id:`${source}-${i}`,title:p[0],reason:p[1],action:p[2],expected:p[3]||'작업 전 기대 변화를 검토해 주세요.',remeasure:p[4]||'적용 후 같은 Benchmark·채널·조건으로 측정하고 원본 답변과 출처를 비교합니다.',status:'pending',draft:'',application:'',appliedAt:null,measurementIds:[],outcome:'',updatedAt:new Date().toISOString()} as NextTask]
 })
}
export const workflowStatuses={pending:'검토 대기',approved:'승인 · 작업 준비',hold:'보류',applied:'적용 완료 · 재측정 대기',reviewed:'재측정 검토 완료'}
export function workflowReport(tasks:NextTask[]){return tasks.filter(t=>!['pending','hold'].includes(t.status)).map(t=>`${t.title}\n진행: ${workflowStatuses[t.status]}\n적용 내용: ${t.application||'적용 전'}\n재측정 검토: ${t.outcome||'아직 확인하지 않았습니다.'}\n다음 확인: ${t.remeasure}`).join('\n\n')}
export function measurementOutcome(references:any[],records:any[]){
 return records.map(m=>{const before=references.find(r=>Number(r.question_id)===Number(m.question_id)&&r.channel===m.channel)
  if(!before)return `${m.channel} · 질문 #${m.question_id}: 원본과 같은 질문·채널의 기록인지 확인 필요`
  const verdict=before.is_discovered===null||m.is_discovered===null?'판단 보류':before.is_discovered===m.is_discovered?(m.is_discovered?'발견 유지':'미발견 유지'):m.is_discovered?'신규 발견':'미발견으로 변화'
  return `${m.channel} · 질문 #${m.question_id}: ${verdict} (기준 ${before.created_at} → 재측정 ${m.created_at})${verdict==='미발견 유지'?' · 기존 작업을 반복하기 전에 질문 의도·측정 조건·출처와 원인 가설을 재검토합니다.':''}`
 }).join('\n')
}

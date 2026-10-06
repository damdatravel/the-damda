import type {NextTask} from '../improvementWorkflow'
export const workflowStatuses={pending:'검토 대기',approved:'승인 · 작업 준비',hold:'보류',applied:'적용 완료 · 재측정 대기',reviewed:'재측정 검토 완료'}
export function workflowReport(tasks:NextTask[]){return tasks.filter(t=>!['pending','hold'].includes(t.status)).map(t=>`${t.title}${t.selectionLinks?`\n관련 대화: ${t.selectionLinks.map(x=>`기록 #${x.historyId} · ${x.stepIndex+1}단계 · ${x.criterion}`).join(', ')}`:''}\n진행: ${workflowStatuses[t.status]}\n선택 근거: ${t.reason}${t.assessment?`\n작업 검토: ${t.assessment.reason}`:''}${t.additionalWork?`\n추가 협의 후보: ${t.additionalWork.name} · ${t.additionalWork.quantity}${t.additionalWork.unit} · ${t.additionalWork.channel}\n작업물: ${t.additionalWork.deliverable}\n완료 기준: ${t.additionalWork.completion} · 비용·기존 계약 포함 여부 협의 필요`:''}\n적용 내용: ${t.application||'적용 전'}\n재측정 검토: ${t.outcome||'아직 확인하지 않았습니다.'}\n다음 확인: ${t.remeasure}`).join('\n\n')}
export function measurementOutcome(references:any[],records:any[]){
 return records.map(m=>{const before=references.find(r=>Number(r.question_id)===Number(m.question_id)&&r.channel===m.channel)
  if(!before)return `${m.channel} · 질문 #${m.question_id}: 원본과 같은 질문·채널의 기록인지 확인 필요`
  const verdict=before.is_discovered===null||m.is_discovered===null?'판단 보류':before.is_discovered===m.is_discovered?(m.is_discovered?'발견 유지':'미발견 유지'):m.is_discovered?'신규 발견':'미발견으로 변화'
  return `${m.channel} · 질문 #${m.question_id}: ${verdict} (기준 ${before.created_at} → 재측정 ${m.created_at})${verdict==='미발견 유지'?' · 기존 작업을 반복하기 전에 질문 의도·측정 조건·출처와 원인 가설을 재검토합니다.':''}`
 }).join('\n')
}

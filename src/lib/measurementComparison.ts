export type Measurement={id:number;question_id:number;channel:string;measurement_round:string;is_discovered:boolean|null;created_at:string;result_text?:string;source_urls?:unknown;notes?:string}
export function compareMeasurements(questions:Array<{id:number;question:string}>,measurements:Measurement[]){
 return questions.map(q=>{
  const records=measurements.filter(m=>Number(m.question_id)===Number(q.id))
  const channels=[...new Set(records.map(m=>m.channel))].sort()
  return {questionId:q.id,question:q.question,measurements:channels.map(channel=>{
   const sorted=records.filter(m=>m.channel===channel).sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at)||a.id-b.id)
   const baseline=sorted.find(m=>m.measurement_round==='Day 0')||null
   const latest=sorted[sorted.length-1]||null
   const comparable=!!baseline&&!!latest&&Date.parse(latest.created_at)>Date.parse(baseline.created_at)
   const change=!baseline?'기준 측정 없음':!comparable?'재측정 대기':baseline.is_discovered===null||latest!.is_discovered===null?'판단 보류':baseline.is_discovered===latest!.is_discovered?(latest!.is_discovered?'발견 유지':'미발견 유지'):latest!.is_discovered?'신규 발견':'미발견으로 변화'
   return {channel,baseline,latest,comparable,change}
  })}
 })
}

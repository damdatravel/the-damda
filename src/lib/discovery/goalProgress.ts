import {sameGoalSnapshot} from '../questionReview'
import {cycleMeasurements,measurementCycle} from './measurementCycle'
export function goalSnapshot(e:any){return e?.goalId?{inquiryId:e.inquiryId,goalId:e.goalId,searchGoal:e.searchGoal,criteria:e.criteria}:null}
export function confirmedGoal(e:any){return !!e?.goalId&&e.criteria?.status==='active'&&!!e.criteria.priorityDiscussion?.agreed}
export function validQuestionLinks(ids:any){return Array.isArray(ids)&&ids.length>=1&&ids.length<=5&&new Set(ids).size===ids.length&&ids.every(x=>Number.isSafeInteger(x)&&x>0)}
export function goalEvidence(binding:any,current:any,questions:any[],measurements:any[],journeys:any[],baseDates:string[],now?:string){
 const stale=!binding||!sameGoalSnapshot(binding.goalSnapshot,current)
 const cycle=measurementCycle(baseDates,now)
 if(stale)return {stale,cycle,measurements:[],journeys:[]}
 const matches=(q:any)=>binding.questions?.some((x:any)=>x.id===q.id&&x.question===q.question)
 const ids=new Set(questions.filter(q=>q.is_benchmark&&matches(q)).map(q=>q.id))
 const selected=measurements.filter(m=>ids.has(m.question_id)&&m.created_at>=binding.linkedAt)
 return {stale,cycle,measurements:cycleMeasurements(selected,cycle),journeys:journeys.filter(x=>sameGoalSnapshot(x.journey.goalSnapshot,current)&&x.createdAt>=binding.linkedAt).filter(x=>{const date=new Date(x.createdAt).toLocaleDateString('en-CA',{timeZone:'Asia/Seoul'});return date>=cycle.start&&date<cycle.end})}
}

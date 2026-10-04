import type {ContextVersion} from './discovery/contextVersion'
import type {WorkAssessment,AdditionalWork} from './workPlan'
export type NextTask={id:string;title:string;reason:string;action:string;expected:string;remeasure:string;status:'pending'|'approved'|'hold'|'applied'|'reviewed';draft:string;draftContext?:ContextVersion;reviewNote?:string;assessment?:WorkAssessment;additionalWork?:AdditionalWork|null;naverHistoryIds?:number[];application:string;appliedAt:string|null;measurementIds:number[];outcome:string;updatedAt:string}
export type Workflow={revision:number;tasks:NextTask[]}
export function readWorkflow(observed:any[]):Workflow|null{return observed.find(x=>x?.kind==='improvement-workflow')?.workflow||null}
export {proposals} from './discovery/improvementPlanning'
export {workflowStatuses,workflowReport,measurementOutcome} from './discovery/performanceReporting'

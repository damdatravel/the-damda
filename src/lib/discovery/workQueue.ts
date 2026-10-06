import type {NextTask} from '../improvementWorkflow'
export type QueueBatch={sourceId:number;createdAt:string;tasks:NextTask[]}
export function workQueue<T extends QueueBatch>(batches:T[]){
 const ordered=[...batches].sort((a,b)=>b.sourceId-a.sourceId),latest=ordered[0]?.sourceId
 const all=ordered.flatMap(batch=>batch.tasks.map(task=>({batch,task})))
 const active=all.filter(x=>['approved','applied'].includes(x.task.status))
 const pending=all.filter(x=>x.task.status==='pending'&&x.batch.sourceId===latest)
 const focus=[...active.filter(x=>x.task.status==='approved'),...active.filter(x=>x.task.status==='applied'),...pending].slice(0,5)
 return {all,focus,latest,counts:{pending:all.filter(x=>x.task.status==='pending').length,approved:all.filter(x=>x.task.status==='approved').length,applied:all.filter(x=>x.task.status==='applied').length,hold:all.filter(x=>x.task.status==='hold').length,reviewed:all.filter(x=>x.task.status==='reviewed').length},earlierPending:all.filter(x=>x.task.status==='pending'&&x.batch.sourceId!==latest).length}
}

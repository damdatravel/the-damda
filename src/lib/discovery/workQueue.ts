import {sameTask} from './taskDuplicates'
import type {NextTask} from '../improvementWorkflow'
export type QueueBatch={sourceId:number;createdAt:string;sourceRound?:string;tasks:NextTask[]}
export function workQueue<T extends QueueBatch>(batches:T[]){
 const ordered=[...batches].sort((a,b)=>b.sourceId-a.sourceId),latest=ordered[0]?.sourceId
 const raw=ordered.flatMap(batch=>batch.tasks.map(task=>({batch,task})))
 const all:typeof raw=[]
 const priority=[...raw.filter(x=>x.task.status!=='pending'),...raw.filter(x=>x.task.status==='pending')]
 for(const item of priority){
  const scope=(b:T)=>b.sourceRound==='Naver'?'naver':b.sourceRound==='Selection Journey'?'journey':'ai'
  if(item.task.status==='pending'&&all.some(x=>scope(x.batch)===scope(item.batch)&&sameTask(item.task,x.task)))continue
  all.push(item)
 }
 const duplicateCount=raw.length-all.length
 const active=all.filter(x=>['approved','applied'].includes(x.task.status))
 const pending=all.filter(x=>x.task.status==='pending'&&x.batch.sourceId===latest)
 const focus=[...active.filter(x=>x.task.status==='approved'),...active.filter(x=>x.task.status==='applied'),...pending].slice(0,5)
 return {all,focus,duplicateCount,latest,counts:{pending:all.filter(x=>x.task.status==='pending').length,approved:all.filter(x=>x.task.status==='approved').length,applied:all.filter(x=>x.task.status==='applied').length,hold:all.filter(x=>x.task.status==='hold').length,reviewed:all.filter(x=>x.task.status==='reviewed').length},earlierPending:all.filter(x=>x.task.status==='pending'&&x.batch.sourceId!==latest).length}
}

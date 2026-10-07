import type {NextTask} from '../improvementWorkflow'
const normalize=(s:string)=>s.normalize('NFKC').toLowerCase().replace(/[\s\p{P}]+/gu,'')
// Preserve different targets and work; never remove by title alone.
export function sameTask(a:NextTask,b:NextTask){
 if(a.selectionKey||b.selectionKey)return !!a.selectionKey&&a.selectionKey===b.selectionKey
 return !!a.title&&!!a.action&&normalize(a.title)===normalize(b.title)&&normalize(a.action)===normalize(b.action)&&(b.status!=='reviewed'||normalize(a.reason)===normalize(b.reason))
}

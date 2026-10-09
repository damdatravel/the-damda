export type OrganizationCandidate={key:string;sourceId:number;taskId:string;scope:string;title:string;action:string;reason:string;references:any[]}
export type TaskGroup={title:string;reason:string;relevance:'relevant'|'verify'|'later';priority:number;members:string[]}
export function taskKey(sourceId:number,taskId:string){return `${sourceId}:${taskId}`}
export function validTaskGroups(groups:any,candidates:OrganizationCandidate[]):groups is TaskGroup[]{
 if(!Array.isArray(groups)||!groups.length||groups.length>candidates.length)return false
 const byKey=new Map(candidates.map(x=>[x.key,x])),seen=new Set<string>()
 for(const g of groups){
  if(!g||!['title','reason'].every(k=>typeof g[k]==='string'&&!!g[k].trim()&&g[k].length<=2000)||!['relevant','verify','later'].includes(g.relevance)||!Number.isInteger(g.priority)||g.priority<1||g.priority>3||!Array.isArray(g.members)||!g.members.length)return false
  const scopes=new Set<string>()
  for(const k of g.members){const item=byKey.get(k);if(!item||seen.has(k))return false;seen.add(k);scopes.add(item.scope)}
  if(scopes.size!==1)return false
 }
 return seen.size===candidates.length
}
export function priorityGroups(groups:TaskGroup[]){return [...groups].filter(g=>g.relevance==='relevant').sort((a,b)=>a.priority-b.priority).slice(0,3)}

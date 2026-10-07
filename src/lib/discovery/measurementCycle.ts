// One project anchor, independent of channel additions or completed work.
export const MEASUREMENT_INTERVAL=15
export function seoulDate(iso:string){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))}
export function addDateDays(key:string,days:number){return new Date(Date.parse(key+'T00:00:00Z')+days*86400000).toISOString().slice(0,10)}
export function measurementCycle(dates:string[],now=new Date().toISOString()){
 const today=seoulDate(now),base=dates.filter(x=>Number.isFinite(Date.parse(x))).map(seoulDate).sort()[0]||today
 const elapsed=Math.max(0,Math.round((Date.parse(today+'T00:00:00Z')-Date.parse(base+'T00:00:00Z'))/86400000))
 const index=Math.floor(elapsed/MEASUREMENT_INTERVAL),start=addDateDays(base,index*MEASUREMENT_INTERVAL),end=addDateDays(start,MEASUREMENT_INTERVAL)
 return {base,index,round:index+1,start,end,due:today===start,next:today===start?start:end}
}
export function cycleSchedule(dates:string[],now=new Date().toISOString(),count=12){
 if(!dates.length)return []
 const c=measurementCycle(dates,now),first=Math.max(1,c.index+(c.due?0:1))
 return Array.from({length:count},(_,i)=>{const index=first+i;return {day:index*MEASUREMENT_INTERVAL,round:index+1,date:addDateDays(c.base,index*MEASUREMENT_INTERVAL)}})
}
export function inCycle(date:string,c:{start:string;end:string}){const key=seoulDate(date);return key>=c.start&&key<c.end}
export function cycleMeasurements<T extends {id:number;question_id:number;channel:string;created_at:string}>(records:T[],cycle:{start:string;end:string}){
 const latest=new Map<string,T>()
 for(const row of [...records].filter(x=>inCycle(x.created_at,cycle)).sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)||b.id-a.id)){
  const key=`${row.question_id}:${row.channel}`
  if(!latest.has(key))latest.set(key,row)
 }
 return latest
}

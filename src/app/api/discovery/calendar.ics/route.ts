import {cycleSchedule} from '../../../../lib/discovery/measurementCycle'
import {NextResponse} from 'next/server'
import {createClient} from '@supabase/supabase-js'

export const dynamic='force-dynamic'

function seoulDate(iso:string){
 return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(iso))
}
function addDays(key:string,days:number){
 const [y,m,d]=key.split('-').map(Number)
 const x=new Date(Date.UTC(y,m-1,d+days))
 return `${x.getUTCFullYear()}-${String(x.getUTCMonth()+1).padStart(2,'0')}-${String(x.getUTCDate()).padStart(2,'0')}`
}
function icsDate(key:string){return key.replaceAll('-','')}
function esc(v:string){return v.replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(',','\\,').replaceAll(';','\\;')}

export async function GET(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 if(!url||!key)return new NextResponse('Calendar configuration missing',{status:500})
 const s=createClient(url,key)
 const [p,t]=await Promise.all([
  s.from('discovery_projects').select('id,name').eq('id',1).maybeSingle(),
  s.from('discovery_measurements').select('created_at').eq('project_id',1).order('created_at',{ascending:true}).limit(1)
 ])
 if(p.error||t.error)return new NextResponse('Calendar data unavailable',{status:500})
 const base=t.data?.[0]?.created_at
 if(!base)return new NextResponse('No initial measurement',{status:404})
 const project=p.data?.name||'Discovery Project'
 const baseKey=seoulDate(base)
 const events=cycleSchedule([base]).map(({day,date:start,round})=>{
  const end=addDays(start,1)
  return [
   'BEGIN:VEVENT',
   `UID:discovery-project-1-day${day}@the-damda.co.kr`,
   `DTSTART;VALUE=DATE:${icsDate(start)}`,
   `DTEND;VALUE=DATE:${icsDate(end)}`,
   `SUMMARY:${esc(project)} | ${round}차 검색·AI 정기 측정`,
   `DESCRIPTION:${esc('고정 Benchmark 질문으로 동일 조건 재측정 후 Discovery에 결과를 기록합니다.')}`,
   'STATUS:CONFIRMED',
   'END:VEVENT'
  ].join('\r\n')
 }).join('\r\n')
 const body=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//The Damda//Discovery//KO','CALSCALE:GREGORIAN','METHOD:PUBLISH',`X-WR-CALNAME:${esc('담다 디스커버리 재측정')}`,events,'END:VCALENDAR'].join('\r\n')
 return new NextResponse(body,{headers:{'Content-Type':'text/calendar; charset=utf-8','Content-Disposition':'inline; filename="the-damda-discovery.ics"','Cache-Control':'no-store'}})
}

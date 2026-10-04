import type {NextTask} from '../improvementWorkflow'
export function proposals(text:string,source:number):NextTask[]{
 const naver=!text.includes('[우선 개선안]')&&text.includes('[우선 개선 제안]')
 const section=naver?text.split('[우선 개선 제안]')[1]?.split('[해석 범위]')[0]||'':text.split('[우선 개선안]')[1]?.split('[Benchmark별 관찰]')[0]||''
 const seen=new Set<string>()
 return section.split('\n').map(x=>x.trim()).filter(x=>/^\d+\./.test(x)).slice(0,7).flatMap((line,i)=>{
  const p=line.replace(/^\d+\.\s*/,'').split('|').map(x=>x.trim()),key=(p[0]||'').replace(/\s/g,'')
  if(naver&&p.length===3){const [reason,action,remeasure]=p;p.splice(0,p.length,reason.slice(0,80),reason,action,'추가 근거 확인 후 변화 기준을 정합니다.',remeasure)}
  if(!p[0]||!p[1]||!p[2]||seen.has(key))return [];seen.add(key)
  return [{id:`${source}-${i}`,title:p[0],reason:p[1],action:p[2],expected:p[3]||'작업 전 기대 변화를 검토해 주세요.',remeasure:p[4]||(naver?p[3]:null)||'적용 후 같은 Benchmark·채널·조건으로 측정하고 원본 답변과 출처를 비교합니다.',status:'pending',draft:'',application:'',appliedAt:null,measurementIds:[],outcome:'',updatedAt:new Date().toISOString()} as NextTask]
 })
}

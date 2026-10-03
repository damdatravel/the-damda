export type ContextDimension={id:number;dimension_type:string;dimension_value:string;source?:string;notes?:string}
export const questionContextRules=`질문은 업체의 실제 서비스를 찾거나 이용하는 최종 고객의 관점이다. 업체가 우리에게 요청한 홈페이지 진단·검색 노출 개선·상담 요청은 그 업체 고객의 목적·문제·행동이 아니다. 원문 출처와 문맥을 확인하고, 상담자와 서비스 이용자를 혼동한 재료는 제외한다. 사업 자체가 검색·마케팅인 경우 공개 서비스 자료의 고객 문제는 사용할 수 있다. '자세히 알려주세요'처럼 대상 없는 상담 문구, 광고 슬로건, 캐리어 같은 물건을 사람인 것처럼 해석하지 않는다. 누가 어떤 서비스·상황을 찾고 무엇을 확인하는지 질문 자체로 이해되어야 한다. '되는 상황인지 확인' 같은 포괄적 문장이나 이미 저장된 질문의 어순·동의어만 바꾼 문장은 추천하지 않는다.`
const normalize=(v:string)=>v.normalize('NFKC').toLowerCase().replace(/[\s\p{P}\p{S}]/gu,'')
export function contextIssue(d:ContextDimension,businessTexts:string[]):string|null{
 const value=d.dimension_value.trim()
 if(d.dimension_type==='SERVICE'&&/어디서든|어디로든|책임지는|함께하는|^(?:수거부터|처음부터)/.test(value))return '구체적 서비스명 대신 홍보 문구가 들어 있습니다.'
 if(d.source==='inquiry'){
  const evidence=(d.notes||'').split('근거: ').slice(1).join('근거: ').trim(),v=normalize(value),e=normalize(evidence)
  if(!businessTexts.some(t=>{const n=normalize(t);return v.length>1&&n.includes(v)||e.length>1&&n.includes(e)}))return '상담 요청과 서비스 이용 상황을 구분할 사업 근거가 필요합니다.'
 }
 return null
}
export function partitionDimensions<T extends ContextDimension>(rows:T[],businessTexts:string[]){
 const usable:T[]=[],excluded:Array<{id:number;reason:string}>=[],seen=new Set<string>()
 for(const d of rows){const issue=contextIssue(d,businessTexts),key=d.dimension_type+'|'+normalize(d.dimension_value);if(issue||seen.has(key)){excluded.push({id:d.id,reason:issue||'같은 종류의 재료가 중복됩니다.'});continue}seen.add(key);usable.push(d)}
 return{usable,excluded}
}
export function sameQuestion(a:string,b:string){return normalize(a)===normalize(b)}

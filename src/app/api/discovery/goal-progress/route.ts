import {NextResponse} from 'next/server'
import {cookies} from 'next/headers'
import {createClient} from '@supabase/supabase-js'
import {projectEngagement} from '../../../../lib/engagementStore'
import {goalSnapshot,confirmedGoal,validQuestionLinks,goalEvidence} from '../../../../lib/discovery/goalProgress'
import {sameGoalSnapshot} from '../../../../lib/questionReview'
import {selectionJourneys} from '../../../../lib/discovery/journeyStore'
async function client(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,pub=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,key=process.env.SUPABASE_SERVICE_ROLE_KEY,token=cookies().get('damda_staff_token')?.value;if(!url||!pub||!key||!token)return null;const auth=await createClient(url,pub).auth.getUser(token);return auth.error||!auth.data.user?null:createClient(url,key)}
export async function GET(req:Request){try{
 const s=await client();if(!s)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401});const id=Number(new URL(req.url).searchParams.get('projectId'));if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:'프로젝트를 확인해 주세요.'},{status:400})
 const e=await projectEngagement(s,id),snapshot=goalSnapshot(e)
 const [q,b,m,first,j,p]=await Promise.all([s.from('discovery_questions').select('id,question,is_benchmark').eq('project_id',id).eq('is_benchmark',true).order('id'),s.from('discovery_analysis_history').select('id,observed,created_at').eq('project_id',id).eq('measurement_round','Goal Question Links').order('id',{ascending:false}).limit(1).maybeSingle(),s.from('discovery_measurements').select('id,question_id,channel,created_at,is_discovered,result_text,source_urls,notes').eq('project_id',id).order('id',{ascending:false}).limit(1000),s.from('discovery_measurements').select('created_at').eq('project_id',id).order('created_at').limit(1),selectionJourneys(s,id,100),s.from('discovery_projects').select('name').eq('id',id).single()])
 if(q.error||b.error||m.error||first.error||p.error)throw Error('목표별 측정 자료 조회 실패')
 const binding=b.data?.observed?.[0]||null,result=goalEvidence(binding,snapshot,q.data||[],m.data||[],j,(first.data||[]).map(x=>x.created_at))
 return NextResponse.json({projectName:p.data?.name||'',goal:snapshot,confirmed:confirmedGoal(e),questions:q.data||[],binding,bindingId:b.data?.id||0,...result,measurements:result.measurements instanceof Map?[...result.measurements.values()]:result.measurements},{headers:{'Cache-Control':'no-store'}})
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'조회 실패'},{status:500})}}
export async function POST(req:Request){try{
 const s=await client();if(!s)return NextResponse.json({error:'직원 로그인이 필요합니다.'},{status:401});const body=await req.json(),id=Number(body.projectId);if(!Number.isSafeInteger(id)||id<1||!validQuestionLinks(body.questionIds))return NextResponse.json({error:'측정 질문을 1~5개 선택해 주세요.'},{status:400})
 const e=await projectEngagement(s,id),snapshot=goalSnapshot(e);if(!confirmedGoal(e)||!sameGoalSnapshot(snapshot,body.goalSnapshot))return NextResponse.json({error:'상담에서 합의한 진행 목표를 확인해 주세요. 목표가 변경되었다면 새로 불러오세요.'},{status:409})
 const q=await s.from('discovery_questions').select('id,question,is_benchmark').eq('project_id',id).in('id',body.questionIds);if(q.error||q.data?.length!==body.questionIds.length||q.data.some(x=>!x.is_benchmark))return NextResponse.json({error:'현재 프로젝트의 벤치마크 질문만 연결할 수 있습니다.'},{status:400})
 const previous=await s.from('discovery_analysis_history').select('id,observed').eq('project_id',id).eq('measurement_round','Goal Question Links').order('id',{ascending:false}).limit(1).maybeSingle();if(previous.error)throw Error('연결 이력 조회 실패');if((previous.data?.id||0)!==body.bindingId)return NextResponse.json({error:'다른 연결 변경이 있습니다. 새로 불러오세요.'},{status:409})
 const questions=q.data.map(x=>({id:x.id,question:x.question})).sort((a,b)=>a.id-b.id),old=previous.data?.observed?.[0]
 if(old&&sameGoalSnapshot(old.goalSnapshot,snapshot)&&sameGoalSnapshot(old.questions,questions))return NextResponse.json({ok:true,reused:true})
 const binding={kind:'goal-question-links',goalSnapshot:snapshot,questions,linkedAt:new Date().toISOString()}
 const save=await s.from('discovery_analysis_history').insert({project_id:id,measurement_round:'Goal Question Links',observed:[binding],interpreted:'고객 합의 목표에 발견·추천 측정 질문 연결'});if(save.error)throw Error('목표 질문 연결 저장 실패')
 return NextResponse.json({ok:true})
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'저장 실패'},{status:500})}}

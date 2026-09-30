import {type SupabaseClient} from '@supabase/supabase-js'
export async function transferNaverConsultation(s:SupabaseClient,projectId:number,snapshot:any,inquiryId:number){
 if(!snapshot?.pages?.length)return
 const {consultationServices,naverRecommendations,naverSelectedQueries,...website}=snapshot
 const inserted=await s.from('discovery_analysis_history').insert({project_id:projectId,measurement_round:'Naver Website',observed:[{...website,sourceInquiryId:inquiryId}],interpreted:'계약 전 상담에서 확인한 홈페이지 진단'}).select('id').single()
 if(inserted.error)throw new Error('상담 홈페이지 진단 연결 실패')
 const rows:any[]=[]
 if(Array.isArray(naverRecommendations)&&naverRecommendations.length)rows.push({project_id:projectId,measurement_round:'Naver Keyword Suggestions',observed:[{websiteHistoryId:inserted.data.id,website:website.website,keywords:naverRecommendations,sourceInquiryId:inquiryId}],interpreted:'계약 전 상담의 추천 검색어'})
 if(Array.isArray(naverSelectedQueries)&&naverSelectedQueries.length)rows.push({project_id:projectId,measurement_round:'Naver Keywords',observed:[{queries:naverSelectedQueries,sourceInquiryId:inquiryId}],interpreted:'계약 전 선택한 대표 검색어 · 계약 후 관리 범위 검토 필요'})
 if(rows.length){const {error}=await s.from('discovery_analysis_history').insert(rows);if(error)throw new Error('상담 검색어 연결 실패')}
}

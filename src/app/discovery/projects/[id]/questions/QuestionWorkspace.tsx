'use client'
import {useState} from 'react'
import QuestionGenerator from '../../../questions/QuestionGenerator'
import DimensionSeeder from './DimensionSeeder'
import DimensionReview from './DimensionReview'

type Dimension={id:number;dimension_type:string;dimension_value:string;priority:number;is_active:boolean;source?:string;notes?:string}
export default function QuestionWorkspace({projectId,initialDimensions}:{projectId:number;initialDimensions:Dimension[]}){
 const [dimensions,setDimensions]=useState(initialDimensions)
 return <>
  <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
   <b>AI Source Profile · 프로젝트 전용 질문 재료</b>
   <p className="mt-2">상담 정보와 실제 홈페이지 진단을 근거로 질문 재료를 추출합니다. 이미 생성된 재료가 있어도 추가 추출할 수 있습니다.</p>
   <DimensionSeeder projectId={projectId} onDimensions={setDimensions}/>
  </section>
  {dimensions.length>0&&<DimensionReview projectId={projectId} dimensions={dimensions} onDimensions={setDimensions}/>}
  {dimensions.some(x=>x.is_active)?<QuestionGenerator dimensions={dimensions.filter(x=>x.is_active)} projectId={projectId}/>:<section className="rounded-xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-600">활성 질문 재료가 없습니다. 위에서 AI Source Profile을 추출해 주세요.</section>}
 </>
}

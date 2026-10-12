import {Quotation,quoteTotals} from './quotation'
export function contractText(q:Quotation){
 const d=q.contractDraft!,t=quoteTotals(q),money=(n:number)=>new Intl.NumberFormat('ko-KR').format(n)+'원'
 return ['담다 디스커버리 서비스 계약서',`기준 견적: ${q.number} / 작성일 ${q.date}`,`제공자: 주식회사 더담다 / 대표 김봉근`, `고객: ${q.customer} (${d.customerType==='corporate'?'법인':'개인사업자'}) / 사업자등록번호 ${d.businessNumber}`,`대표자: ${d.representative} / 서명자: ${d.signer} / 직책: ${d.position||'대표자'}`,`서명 권한: ${d.authority==='representative'?'대표자 직접 서명':d.authorityEvidence}`,
 '1. 제공 업무와 관리 범위',q.scope,`홈페이지 ${q.websites}개 / 질문·검색어 ${q.queries}개 / 채널 ${q.channels.join(', ')}`,`측정 ${q.frequency} / 보고 ${q.reportFrequency} / 상담 ${q.consultation}`,`시작 ${q.startDate} / 계약 기간 ${q.months}개월`,
 '2. 비용 및 결제',...q.lines.map(l=>`${l.name} / ${l.kind==='monthly'?'매월':l.kind==='initial'?'초기':'일회성'} / 수량 ${l.quantity} × 단가 ${money(l.price)}`),`기간 합계 ${money(t.grand)} (${q.vat?'부가세 포함':'부가세 미가산'}) / 첫 결제 ${money(t.first)} / 이후 월 ${money(t.recurring)}`,q.payment,
 '3. 고객 협조 및 사실 확인',q.cooperation,
 '4. 콘텐츠 사용과 매체 운영',...(d.publishing?[d.media,d.usage,d.revenue,d.afterEnd]:['더담다 소유 매체 게시·수익화는 이 계약에 포함하지 않습니다. 별도 합의 후 진행합니다.']),
 '5. 종료·정산·자료 인계',d.termination,
 '6. 결과 확인 기준','합의한 질문과 채널로 측정하고 결과 및 개선 작업을 보고합니다. 검색 순위·AI 추천·매출 자체를 보장하지 않습니다. 변경 작업 적용 담당과 검수 기준은 제공 범위에 명시합니다.',
 '7. 전자적 체결 및 서명자 확인','당사자는 이 확정 문서에 전자적으로 동의·서명하는 방식을 선택합니다. 더담다는 직원 승인 기록과 함께 이 문서를 발송하고, 고객은 계약 내용·서명 권한을 확인해 서명합니다. 문자 인증은 수신 번호의 사용 확인이며 명의 본인 확인 또는 법인 계약 권한의 증명이 아닙니다. 서명된 문서와 제출 시각·확인 항목·문서 식별값을 보관합니다.',q.notes?'추가 합의 사항\n'+q.notes:''].filter(Boolean).join('\n\n')
}

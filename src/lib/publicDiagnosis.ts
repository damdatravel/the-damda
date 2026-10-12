export function summarizeDiagnosis(s:any){
 const pages=(s?.pages||[]).filter((p:any)=>!p.error)
 const missing=(key:string)=>pages.filter((p:any)=>!p[key]).length
 const goal=s?.intakeContext?.search_goal
 const company=s?.intakeContext?.company_name||'홈페이지'
 const faq=pages.filter((p:any)=>p.hasFaq).length
 const examples=(key:string)=>pages.filter((p:any)=>!p[key]).slice(0,3).map((p:any)=>p.title||p.url||'확인 페이지').join(' · ')
 const checks=[
  {title:'페이지 제목과 소개',status:missing('title')||missing('description')?'보완 검토':'확인됨',evidence:`확인한 ${pages.length}개 페이지 중 페이지 제목 누락 ${missing('title')}개 · 설명 누락 ${missing('description')}개입니다.`,meaning:'페이지 제목과 소개 문구는 각 페이지가 어떤 서비스를 안내하는지 전달하는 기본 정보입니다.',direction:missing('title')||missing('description')?`설명이 확인되지 않은 페이지(${examples('description')||examples('title')})부터 서비스·대상 고객·특징을 짧고 명확하게 안내하는지 검토하세요.`:'기본 문구가 확인되었습니다. 고객이 알리고 싶은 서비스와 실제 문구가 일치하는지는 본 상담에서 검토합니다.'},
  {title:'본문의 대표 제목',status:missing('h1')?'보완 검토':'확인됨',evidence:`대표 제목을 확인한 페이지 ${pages.length-missing('h1')}개 · 초기 HTML에서 확인하지 못한 페이지 ${missing('h1')}개입니다.`,meaning:'본문의 대표 제목은 방문자가 이 페이지의 핵심 내용을 빠르게 이해하도록 돕습니다.',direction:missing('h1')?`대상 페이지(${examples('h1')})의 화면과 제목 구조를 함께 확인하세요. 초기 HTML에서 찾지 못했다고 화면에도 제목이 없다는 뜻은 아닙니다.`:'대표 제목이 확인되었습니다. 서비스 설명과의 일관성을 다음 단계에서 확인할 수 있습니다.'},
  {title:'페이지 목록 안내',status:s?.sitemapFound?'확인됨':'추가 확인',evidence:s?.sitemapFound?'점검 범위에서 페이지 목록 파일에 포함된 홈페이지 주소를 확인했습니다.':'점검 범위에서 페이지 목록 파일에 포함된 홈페이지 주소를 확인하지 못했습니다.',meaning:'페이지 목록은 검색엔진에 홈페이지의 페이지 주소를 안내하는 데 활용됩니다.',direction:s?.sitemapFound?'주요 서비스 페이지가 목록에 포함되어 있는지와 실제 검색엔진 수집 여부는 별도로 확인해야 합니다.':'목록 파일의 위치·접근 가능 여부를 확인하세요. 이번 결과만으로 검색엔진이 홈페이지를 수집하지 못한다고 판단할 수는 없습니다.'},
  {title:'질문과 답변 안내',status:faq?'표현 확인':'추가 확인',evidence:`질문·답변 관련 표현이 있는 페이지 ${faq}개입니다.`,meaning:'고객이 묻는 이용 조건·진행 방법 등을 이해하기 쉽게 정리하면 서비스 판단에 필요한 정보를 제공할 수 있습니다.',direction:faq?'관련 표현을 확인한 결과이며, 답변의 충분성이나 정확성을 평가한 결과는 아닙니다.':'FAQ 관련 표현을 찾지 못했습니다. 질문·답변이 없다고 단정하지 않고, 서비스 설명에 고객의 주요 궁금증이 해소되는지 확인합니다.'}
 ]
 const priorities=[
  ...(goal?[`고객이 먼저 알리고 싶은 서비스: ${goal.service}`,`검토할 고객 검색 상황: ${goal.situation}`]:[]),
  ...(missing('title')||missing('description')||missing('h1')?['우선 보완 방향 — 기본 안내 정리: 제목·소개·대표 제목이 확인되지 않은 페이지부터 실제 화면과 설정을 대조하세요. 방문자가 각 페이지의 서비스와 특징을 이해할 수 있는지가 첫 검토 대상입니다.']:[]),
  ...(!s?.sitemapFound?['우선 보완 방향 — 페이지 목록 확인: 홈페이지 제작 환경에서 목록 파일의 위치와 접근 상태를 확인하세요. 검색 수집 문제인지 판단하기 전에 실제 설정 확인이 필요합니다.']:[]),
  goal?'본 상담에서 확인할 사항 — 입력하신 검색 상황을 기준으로 서비스 범위·이용 조건·사례·문의 방법이 충분히 설명되는지 검토합니다. 현재 사전진단은 해당 내용의 적합성까지 판정하지 않았습니다.':'본 상담에서 확인할 사항 — 핵심 서비스·이용 조건·문의 방법이 고객의 검색 목적과 맞는지 검토합니다.'
 ]
 const summary=`${company}의 공개 홈페이지 ${pages.length}개 페이지를 확인했습니다. ${missing('title')||missing('description')||missing('h1')?'일부 페이지에서 기본 안내 요소가 확인되지 않아, 실제 화면과 설정을 대조할 필요가 있습니다.':'점검한 페이지에서 제목·소개·대표 제목이 확인되었습니다.'} 이번 결과는 홈페이지의 기본 정보 상태를 확인한 사전 점검입니다.`
 const findings=checks.map(c=>`${c.title} [${c.status}] — ${c.evidence} ${c.meaning} ${c.direction}`)
 const notice='공개 HTML의 초기 점검입니다. JavaScript로 표시되는 내용은 누락될 수 있습니다. 실제 검색 순위·AI 추천 여부는 별도 측정이 필요하며, 노출을 보장하지 않습니다.'
 const pageEvidence=pages.map((p:any)=>({url:p.url||'',title:p.title||'페이지 제목 미확인',description:p.description||'',h1:p.h1||'',hasFaq:!!p.hasFaq}))
 const reportText=[summary,'확인한 내용과 의미',...findings,'우선 보완 방향과 상담 확인 사항',...priorities,'페이지별 확인 근거',...pageEvidence.map((p:any)=>`${p.title}\n${p.url}\n소개: ${p.description||'초기 HTML에서 미확인'}\n대표 제목: ${p.h1||'초기 HTML에서 미확인'}`),notice].join('\n\n')
 return {summary,findings,priorities,notice,checks,pageEvidence,checkedAt:s?.checkedAt||null,reportText}
}

function escapeHtml(value:unknown){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))}
export function diagnosisEmailHtml(d:ReturnType<typeof summarizeDiagnosis>,website:string,company:string,consultationUrl='https://www.the-damda.co.kr/ai-search/consulting'){
 const e=escapeHtml
 const paragraphs=(values:string[])=>values.map(v=>`<p style="margin:12px 0;line-height:1.8">${e(v).replace(/\n/g,'<br>')}</p>`).join('')
 const checks=d.checks.map(c=>`<tr><td style="padding:20px;border-bottom:1px solid #e2e8f0"><h3 style="margin:0 0 10px;font-size:17px">${e(c.title)} <span style="font-size:12px;color:#087a56">${e(c.status)}</span></h3>${paragraphs([c.evidence,c.meaning,c.direction])}</td></tr>`).join('')
 const pages=d.pageEvidence.map((p:any)=>`<div style="padding:14px 0;border-bottom:1px solid #e2e8f0"><strong>${e(p.title)}</strong><p style="overflow-wrap:anywhere;color:#64748b">${e(p.url)}</p>${paragraphs(['페이지 소개: '+(p.description||'초기 HTML에서 미확인'),'대표 제목: '+(p.h1||'초기 HTML에서 미확인')])}</div>`).join('')
 const date=d.checkedAt&&Number.isFinite(Date.parse(d.checkedAt))?new Date(d.checkedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):''
 return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#f1f5f4;color:#17252b;font-family:Arial,'Apple SD Gothic Neo','Malgun Gothic',sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#fff;border:1px solid #dce5e2"><tr><td style="padding:28px;background:#075e45;color:white"><p style="margin:0;font-size:13px;letter-spacing:1px">DAMDA DISCOVERY · 담다 디스커버리</p><h1 style="font-size:24px;line-height:1.5;margin:14px 0">${e(company||'고객')} 홈페이지 사전 진단</h1><p style="margin:0;overflow-wrap:anywhere">${e(website)}</p>${date?`<p style="font-size:12px;margin:10px 0 0">진단 일시 ${e(date)} (한국 시간)</p>`:''}</td></tr><tr><td style="padding:24px"><h2 style="font-size:19px;margin:0">진단 요약</h2>${paragraphs([d.summary])}<p style="font-size:13px;color:#64748b">공개 홈페이지에서 확인한 기본 정보와 상담에서 검토할 방향을 안내합니다.</p></td></tr>${checks}<tr><td style="padding:24px"><h2 style="font-size:19px">우선 보완 방향과 상담 확인 사항</h2>${paragraphs(d.priorities)}</td></tr><tr><td style="padding:24px;background:#f8faf9"><h2 style="font-size:19px">페이지별 확인 근거</h2>${pages}</td></tr><tr><td style="padding:24px"><p style="font-size:12px;color:#64748b;line-height:1.8">${e(d.notice)}</p><p style="margin:24px 0"><a href="${e(consultationUrl)}" style="display:inline-block;padding:14px 24px;background:#087a56;color:#fff;text-decoration:none;font-weight:bold;border-radius:8px">진단 결과를 바탕으로 상담 신청</a></p><p style="font-size:12px;color:#64748b;line-height:1.8">상담 화면에 업체명·홈페이지·검색 목표가 자동 입력됩니다. 연락처는 직접 입력하고 인증해 주세요. 사전 진단 연결은 진단 후 24시간 동안 가능합니다.</p></td></tr><tr><td style="padding:20px 24px;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b">주식회사 더담다 · 담다 디스커버리<br>요청하신 홈페이지 사전 진단 결과를 안내하는 메일입니다.</td></tr></table></td></tr></table></body></html>`
}

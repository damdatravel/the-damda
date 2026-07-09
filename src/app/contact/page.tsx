import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '파트너십 & 투자 문의 | 주식회사 더담다',
  description: 'B2G 지자체 파트너십, B2B 기업 문의, 투자 제안. 주식회사 더담다에 문의하세요.',
}

export default function ContactPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-[#0A0F1E] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Contact</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            함께 합시다.
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            B2G 시범 사업, B2B 파트너십, 투자 제안 모두 환영합니다.<br />
            제안서·소개서 발송 및 미팅 일정 조율도 가능합니다.
          </p>
        </div>
      </section>

      {/* CONTACT OPTIONS */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: '🏛️',
                title: 'B2G 파트너십',
                sub: '지자체 · 공공기관',
                desc: '지자체, 지하철공사, 공항공사, 국립공원 등 공공기관 도입 문의. 시범 사업 제안 및 벤처나라·조달청 등록 진행 예정.',
                cta: '공문 발송 요청',
              },
              {
                icon: '🏢',
                title: 'B2B 파트너십',
                sub: '기업 · 프랜차이즈',
                desc: '대기업, 프랜차이즈 본사, 백화점·쇼핑몰 등 민간 기업 파트너십 및 대량 도입 협의. ESG 보고 데이터 연동 포함.',
                cta: '제안서 요청',
              },
              {
                icon: '📈',
                title: '투자 문의',
                sub: 'Seed Round (3억원)',
                desc: '특허 5건 기반의 기술 스타트업. Seed 투자 유치 중. IR 덱 및 사업계획서 공유 가능. MVP 시제품 시연 가능.',
                cta: 'IR 자료 요청',
              },
            ].map(item => (
              <div key={item.title} className="border border-gray-200 rounded-3xl p-8 hover:border-[#10E096]/50 hover:shadow-lg transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-[#0A0F1E] text-lg mb-1">{item.title}</h3>
                <p className="text-[#10E096] text-sm font-semibold mb-4">{item.sub}</p>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{item.desc}</p>
                <div className="inline-block bg-[#0A0F1E]/5 text-[#0A0F1E] text-sm font-semibold px-4 py-2 rounded-lg">
                  → {item.cta}
                </div>
              </div>
            ))}
          </div>

          {/* DIRECT CONTACT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#0A0F1E] rounded-3xl p-10 text-white">
              <h2 className="text-2xl font-bold mb-8">직접 연락하기</h2>
              <div className="space-y-6">
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">이메일</p>
                  <a
                    href="mailto:ceo@the-damda.co.kr"
                    className="text-[#10E096] font-semibold text-lg hover:text-[#0DC47D] transition-colors"
                  >
                    ceo@the-damda.co.kr
                  </a>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">WhatsApp</p>
                  <a
                    href="https://wa.me/821088231653"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-semibold text-lg hover:text-[#10E096] transition-colors"
                  >
                    +82 10-8823-1653
                  </a>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">주소</p>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    인천광역시 영종구 영종대로162번길 20,<br />
                    305호 (운서동, 스타힐스빌딩)
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">사업자등록번호</p>
                  <p className="text-gray-300">475-81-03874</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F0FDF9] rounded-3xl p-10 border border-green-100">
              <h2 className="text-2xl font-bold text-[#0A0F1E] mb-4">문의 안내</h2>
              <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
                <p>
                  <strong className="text-[#0A0F1E]">응대 시간:</strong><br />
                  평일 09:00 ~ 18:00 (주말·공휴일 제외)
                </p>
                <p>
                  <strong className="text-[#0A0F1E]">응답 소요:</strong><br />
                  이메일 문의는 영업일 기준 1~2일 이내 회신드립니다.
                </p>
                <p>
                  <strong className="text-[#0A0F1E]">제안서·소개서:</strong><br />
                  요청 시 스퀴즈빈 제안서 및 IR 덱을 이메일로 발송해 드립니다.
                </p>
                <p>
                  <strong className="text-[#0A0F1E]">시연 가능:</strong><br />
                  MVP 시제품 시연 미팅을 현장에서 진행할 수 있습니다.
                </p>
              </div>
              <div className="mt-8 p-5 bg-white rounded-2xl border border-green-200">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">관련 사이트</p>
                <a
                  href="/squeeze-bin"
                  className="text-[#0DC47D] font-semibold text-sm hover:underline"
                >
                  스퀴즈빈 소개 페이지 →
                </a>
                <p className="text-gray-400 text-xs mt-1">일회용컵 자원순환 솔루션 · B2G</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY INFO */}
      <section className="py-16 bg-[#F8FAFB] border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h3 className="text-lg font-bold text-[#0A0F1E] mb-6">회사 정보</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            {[
              { label: '회사명', value: '주식회사 더담다' },
              { label: '대표이사', value: '김봉근' },
              { label: '사업자등록번호', value: '475-81-03874' },
              { label: '법인등록번호', value: '120111-0154311' },
              { label: '업태', value: '도매 및 소매업' },
              { label: '종목', value: '전자상거래 소매 중개업' },
              { label: '설립일', value: '2026년' },
              { label: '소재지', value: '인천광역시 영종구' },
            ].map(item => (
              <div key={item.label}>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                <p className="text-[#0A0F1E] font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

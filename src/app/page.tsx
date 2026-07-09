import Link from 'next/link'

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="min-h-screen bg-[#0A0F1E] flex items-center relative overflow-hidden">
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(16,224,150,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,224,150,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10E096]/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-24">
          <div className="max-w-3xl">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-6">
              주식회사 더담다 · The Damda Co., Ltd.
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              사람과 환경을
              <br />
              <span className="text-[#10E096]">잇는 기술.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              스마트 자원순환 시스템과 물류 혁신으로
              더 깨끗하고 효율적인 도시 인프라를 구축합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/squeeze-bin"
                className="bg-[#10E096] text-[#0A0F1E] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#0DC47D] transition-all hover:scale-105"
              >
                스퀴즈빈 알아보기
              </Link>
              <Link
                href="/contact"
                className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-all"
              >
                파트너십 문의
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      {/* INTRO */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-20">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Our Mission</p>
            <h2 className="text-4xl font-extrabold text-[#0A0F1E] mb-6">
              남들이 외면한 문제를,<br />기술로 해결합니다.
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              더담다는 현장에서 발견한 비효율을 혁신 기술로 바꾸는 스마트 솔루션 기업입니다.
              자원순환과 물류 두 영역에서 공공과 민간 모두에 실질적 가치를 제공합니다.
            </p>
          </div>

          {/* Two business cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Squeeze Bin */}
            <div className="group relative bg-[#0A0F1E] rounded-3xl overflow-hidden p-10 text-white">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10E096]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#10E096]/20 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#10E096]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <p className="text-[#10E096] text-sm font-semibold tracking-wider uppercase mb-2">신규 사업</p>
                <h3 className="text-2xl font-bold mb-3">스퀴즈빈</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  세계 최초 액체 자동 분리 기술로 일회용 컵을 처리하는 스마트 자원순환 키오스크.
                  부피 90% 감량, 수거 횟수 80% 절감. 지자체·공공기관 B2G 솔루션.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['특허 5건', 'B2G·B2B', '지자체 타겟', 'ESG 인증'].map(tag => (
                    <span key={tag} className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <Link
                  href="/squeeze-bin"
                  className="inline-flex items-center gap-2 text-[#10E096] font-semibold hover:gap-4 transition-all"
                >
                  자세히 보기
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Damda Travel */}
            <div className="group relative bg-[#F0FDF9] rounded-3xl overflow-hidden p-10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10E096]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#10E096]/20 flex items-center justify-center mb-6">
                  <svg className="w-8 h-8 text-[#0DC47D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-[#0DC47D] text-sm font-semibold tracking-wider uppercase mb-2">운영 중</p>
                <h3 className="text-2xl font-bold text-[#0A0F1E] mb-3">담다트래블</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  인천국제공항 ↔ 서울·경기 주요 호텔 간 캐리어 배송 서비스.
                  수하물 없이 자유롭게 여행하는 경험을 제공합니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['공항 배송', '호텔 픽업', '24시간', '온라인 예약'].map(tag => (
                    <span key={tag} className="text-xs bg-[#10E096]/20 text-[#0A7A5A] px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <a
                  href="https://www.damdatravel.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#0DC47D] font-semibold hover:gap-4 transition-all"
                >
                  서비스 바로가기
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="py-24 bg-[#0A0F1E]">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-16">Why Damda</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '5건', label: '특허 출원 완료', sub: '2026년 기준' },
              { num: '90%', label: '폐기물 부피 감축', sub: '압착·파쇄 기술' },
              { num: '80%', label: '수거 횟수 절감', sub: '운영비 대폭 절감' },
              { num: '12개월', label: '투자 회수 목표', sub: '광고 수익 포함' },
            ].map(item => (
              <div key={item.label}>
                <div className="text-4xl md:text-5xl font-extrabold text-[#10E096] mb-2">{item.num}</div>
                <div className="text-white font-semibold mb-1">{item.label}</div>
                <div className="text-gray-500 text-sm">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARGET */}
      <section className="py-24 bg-[#F8FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Partners</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E]">
              어디에나 필요한 솔루션
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: '🏛️', name: '지자체·지방정부', desc: '수거 행정 예산 절감 & 민원 해결' },
              { icon: '🚇', name: '지하철·공항공사', desc: '유동인구 밀집 구역 스마트 처리' },
              { icon: '🌿', name: '국립공원·공공시설', desc: '친환경 이미지 + 탄소중립 데이터' },
              { icon: '🏢', name: '대기업·프랜차이즈', desc: 'ESG 경영 성과 지표 실측 제공' },
              { icon: '🏪', name: '쇼핑몰·백화점', desc: '광고 수익 창출형 자원 관리' },
              { icon: '🎓', name: '대학·공공기관', desc: '고령자 친화 1인 수거 시스템' },
            ].map(item => (
              <div key={item.name} className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#10E096]/40 hover:shadow-lg transition-all">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-bold text-[#0A0F1E] mb-1">{item.name}</h4>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gradient-to-br from-[#0A0F1E] to-[#0D1A2E]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            함께 도시를<br />
            <span className="text-[#10E096]">바꿔나가실 파트너를</span><br />
            찾고 있습니다.
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            지자체, 공공기관, 민간 기업 파트너십 및 투자 문의를 환영합니다.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#10E096] text-[#0A0F1E] font-bold px-10 py-5 rounded-2xl text-lg hover:bg-[#0DC47D] transition-all hover:scale-105"
          >
            지금 문의하기
          </Link>
        </div>
      </section>
    </>
  )
}

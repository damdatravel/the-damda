import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '스퀴즈빈 — 스마트 자원순환 솔루션 | 주식회사 더담다',
  description: '세계 최초 액체 자동 분리 기술 스퀴즈빈. 일회용 컵 부피 90% 감량, 수거 횟수 80% 절감. 지자체·공공기관·지하철공사·공항공사 B2G 솔루션.',
}

const patents = [
  { no: '10-2026-0006911', title: '액체 잔여물 자동 분리 및 파쇄 기능을 구비한 컵 처리 장치' },
  { no: '10-2026-0008347', title: '잔여 액체 분리 및 컵 부피 감용을 위한 널링 기어형 압착 처리 장치' },
  { no: '10-2026-0010489', title: '지역화폐 플랫폼과 연동된 자원순환 보증금의 즉시 반환 및 시선 추적 기반 멀티미디어 제공 시스템' },
  { no: '10-2026-0014425', title: '진동 배출 유닛을 구비한 자가 세척형 폐기물 수거 장치' },
  { no: '10-2026-0014524', title: '진동 압밀 연동 및 탈취 기능을 구비한 고하중 폐기물 수거용 스마트 라이너' },
]

const models = [
  {
    name: 'Model M',
    sub: 'Metro / Mall — 실내형 (주력)',
    icon: '🚇',
    targets: ['지하철 역사', '쇼핑몰', '오피스 로비', '대형마트'],
    features: ['슬림 디자인 (폭 750~800mm)', '도서관 수준 저소음 (50dB 이하)', '43인치 4K 광고 디스플레이', '실내 인테리어 조화 마감'],
  },
  {
    name: 'Model P',
    sub: 'Pro / Public — 실외형',
    icon: '🌿',
    targets: ['야외 광장', '공원', '번화가', '공공거리'],
    features: ['IP65 방진·방수', '겨울철 열선 히팅 시스템', '태양광 패널 옵션 (Solar)', '내후성 강화 하우징'],
  },
  {
    name: 'Model S',
    sub: 'Shelter — 쉘터형',
    icon: '🚌',
    targets: ['버스 정류장', '좁은 인도', '소형 공간'],
    features: ['버스 쉘터 밀착/매립 구조', '초슬림 스페이스 세이빙', '버스 도착 정보 연동 가능', '공간 점유 최소화'],
  },
]

const bizModels = [
  {
    track: 'Track A',
    title: 'B2G 공공 인프라',
    color: '#10E096',
    targets: '지자체, 공항공사, 지하철공사, 국립공원',
    model: '기기 직접 판매 + 유지보수',
    pitch: '수거 행정 예산 최대 80% 절감. 악취·민원 원천 차단. 탄소중립 실적 데이터 확보.',
  },
  {
    track: 'Track B',
    title: 'B2B 엔터프라이즈',
    color: '#6366F1',
    targets: '프랜차이즈 본사, 대기업, 백화점·몰',
    model: '기기 판매 + 월 데이터 구독(SaaS)',
    pitch: '가맹점 상생 아이템으로 ESG 경영 성과 지표 실측 제공. 가맹점주 노동 강도 절감.',
  },
  {
    track: 'Track C',
    title: 'MRO 소모품 구독',
    color: '#F59E0B',
    targets: '기기 도입 기관·업체 전체',
    model: '전용 스마트 라이너 정기 구독',
    pitch: '특허 전용 라이너로 Lock-in 구조 확립. 월 구독 기반 안정적 반복 매출.',
  },
]

export default function SqueezeBinPage() {
  return (
    <>
      {/* HERO */}
      <section className="min-h-screen bg-[#0A0F1E] flex items-center relative overflow-hidden pt-16">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(16,224,150,0.6) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#10E096]/10 rounded-full blur-3xl -translate-y-1/2" />

        <div className="relative max-w-6xl mx-auto px-6 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-[#10E096]/20 border border-[#10E096]/30 rounded-full px-4 py-2 mb-8">
              <span className="w-2 h-2 bg-[#10E096] rounded-full animate-pulse" />
              <span className="text-[#10E096] text-sm font-semibold">세계 최초 액체 자동 분리 기술 · 특허 5건 출원</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white mb-4 leading-none">
              Squeeze<br />
              <span className="text-[#10E096]">Bin</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-300 font-light mb-4">
              Just Drop It.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed mb-10 max-w-xl">
              음료가 든 컵도 그냥 넣으세요. 액체 자동 분리, 부피 90% 감량.
              도심 공공장소의 일회용 컵 문제를 완벽하게 해결합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-[#10E096] text-[#0A0F1E] font-bold px-8 py-4 rounded-xl hover:bg-[#0DC47D] transition-all hover:scale-105"
              >
                도입 문의하기
              </Link>
              <a
                href="#solution"
                className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition-all"
              >
                기술 살펴보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">The Problem</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E] mb-6">
              지금 이 순간에도 도심 곳곳에서<br />반복되는 문제
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: '💧',
                title: '음료 잔여물 처리 불가',
                desc: '기존 RVM은 깨끗이 세척된 캔·페트병만 처리 가능. 도심 90%의 컵은 음료가 남아 방치됩니다.',
              },
              {
                icon: '🗑️',
                title: '하루 3~4회 수거 필요',
                desc: '압착 없는 컵은 부피가 커서 빠르게 가득 참. 과도한 수거 인력과 유류비로 행정 예산을 낭비합니다.',
              },
              {
                icon: '😤',
                title: '악취·오염 민원 폭증',
                desc: '잔여 음료가 썩으며 악취, 벌레, 오염수 누출 발생. 여름철 민원의 주요 원인이 됩니다.',
              },
              {
                icon: '📊',
                title: 'ESG 실적 데이터 부재',
                desc: '재활용 처리 실적을 수치로 증명할 데이터가 없어 탄소중립 정책 효과를 입증하지 못합니다.',
              },
            ].map(item => (
              <div key={item.title} className="flex gap-5 p-6 bg-gray-50 rounded-2xl">
                <div className="text-4xl flex-shrink-0">{item.icon}</div>
                <div>
                  <h4 className="font-bold text-[#0A0F1E] mb-2">{item.title}</h4>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION */}
      <section id="solution" className="py-24 bg-[#0A0F1E]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Technical Solution</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              3가지 핵심 기술로<br />문제의 근원을 제거합니다
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Liquid-Free',
                sub: '액체 자동 분리',
                desc: '특허받은 널링 기어 압착 & 45도 진동 타공판으로 액체는 하부 탱크로, 고체는 적재함으로 완전 분리. 악취·오염 원천 차단.',
                badge: '특허 2건',
              },
              {
                num: '02',
                title: 'Volume Minimization',
                sub: '부피 90% 감량',
                desc: '비절단 크림핑 기술(Squeeze & Crimp)로 컵을 1/10로 압축. 수거 주기를 1일 3회에서 3일 1회로 단축해 인건비·유류비 연 40% 절감.',
                badge: '수거 80% 절감',
              },
              {
                num: '03',
                title: 'Total Logistics',
                sub: '스마트 수거 시스템',
                desc: '엣지 AI 실시간 관제, 전용 수거 모빌리티 스퀴즈 포터, NFC 리워드 시스템이 연동된 End-to-End 통합 솔루션.',
                badge: '클라우드 비용 Zero',
              },
            ].map(item => (
              <div key={item.num} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-[#10E096]/30 transition-all">
                <div className="text-[#10E096]/40 font-black text-5xl mb-4">{item.num}</div>
                <span className="inline-block bg-[#10E096]/20 text-[#10E096] text-xs font-semibold px-3 py-1 rounded-full mb-4">{item.badge}</span>
                <h3 className="text-white font-bold text-xl mb-1">{item.title}</h3>
                <p className="text-[#10E096] text-sm mb-4">{item.sub}</p>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY NOW */}
      <section className="py-20 bg-[#F0FDF9]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Why Now</p>
            <h2 className="text-3xl font-extrabold text-[#0A0F1E]">지금이 도입 적기인 3가지 이유</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: '📋',
                title: '일회용컵 보증금제',
                desc: '25년 12월 유예 종료. 지자체 수거 시스템 구축이 의무화됩니다.',
              },
              {
                emoji: '💰',
                title: '인건비 상승',
                desc: '최저시급 지속 인상. 인력 의존형 수거 방식의 한계가 극명해지고 있습니다.',
              },
              {
                emoji: '🌱',
                title: 'ESG·탄소중립 의무화',
                desc: 'Scope3 ESG 공시 의무화. 실측 탄소 저감 데이터 확보가 경쟁력입니다.',
              },
            ].map(item => (
              <div key={item.title} className="bg-white rounded-2xl p-7 shadow-sm border border-green-100">
                <div className="text-4xl mb-4">{item.emoji}</div>
                <h4 className="font-bold text-[#0A0F1E] mb-2">{item.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODELS */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Product Lineup</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E]">
              실내부터 야외까지,<br />모든 공간에 맞는 모델
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {models.map(model => (
              <div key={model.name} className="border border-gray-200 rounded-3xl p-8 hover:border-[#10E096]/50 hover:shadow-xl transition-all">
                <div className="text-5xl mb-4">{model.icon}</div>
                <h3 className="text-xl font-black text-[#0A0F1E] mb-1">{model.name}</h3>
                <p className="text-[#10E096] text-sm font-semibold mb-5">{model.sub}</p>

                <div className="mb-5">
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">타겟 설치 장소</p>
                  <div className="flex flex-wrap gap-2">
                    {model.targets.map(t => (
                      <span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{t}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">주요 사양</p>
                  <ul className="space-y-1">
                    {model.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-[#10E096] mt-0.5 flex-shrink-0">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Price */}
          <div className="mt-12 bg-[#0A0F1E] rounded-3xl p-10 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-2">도입 비용 & ROI</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  광고 수익(월 50~100만원)과 수거 비용 절감(연 40%)을 합산하면 약 <strong className="text-[#10E096]">12개월 내</strong> 투자금 전액 회수 가능.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-5">
                  <p className="text-gray-400 text-xs mb-1">스퀴즈빈 (VAT 별도)</p>
                  <p className="text-2xl font-black text-[#10E096]">990만원</p>
                  <p className="text-gray-400 text-xs mt-1">43인치 광고 디스플레이 포함</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-5">
                  <p className="text-gray-400 text-xs mb-1">스퀴즈 포터 (차량 별도)</p>
                  <p className="text-2xl font-black text-white">300만원</p>
                  <p className="text-gray-400 text-xs mt-1">전용 수거 모빌리티</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIZ MODEL */}
      <section className="py-24 bg-[#F8FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Business Model</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E]">
              3중 수익 구조
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bizModels.map(biz => (
              <div key={biz.track} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-5">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: biz.color + '22', color: biz.color }}
                  >{biz.track}</span>
                  <span className="font-bold text-[#0A0F1E]">{biz.title}</span>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">타겟</p>
                    <p className="text-gray-700">{biz.targets}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">공급 모델</p>
                    <p className="text-gray-700">{biz.model}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-gray-600 leading-relaxed">{biz.pitch}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SAFETY */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Safety & Standards</p>
            <h2 className="text-3xl font-extrabold text-[#0A0F1E]">공공 설치 기준을 충족하는 안전 설계</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: 'ISO 13857', desc: '투입구-파쇄날 300mm 안전 거리' },
              { title: 'IP65', desc: '실외형 방진·방수 인증 (예정)' },
              { title: 'KC 인증', desc: '전기용품 안전인증 획득 예정' },
              { title: 'PL 보험', desc: '생산물 배상책임보험 가입' },
            ].map(item => (
              <div key={item.title} className="text-center p-6 border border-gray-200 rounded-2xl">
                <div className="text-[#10E096] font-black text-lg mb-2">{item.title}</div>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PATENTS */}
      <section className="py-24 bg-[#0A0F1E]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">IP Portfolio</p>
            <h2 className="text-3xl font-extrabold text-white">특허 5건 출원 완료</h2>
            <p className="text-gray-400 mt-3">독점적 기술 권리로 후발 주자의 모방을 원천 차단합니다.</p>
          </div>
          <div className="space-y-3">
            {patents.map((p, i) => (
              <div key={p.no} className="flex items-start gap-4 bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-[#10E096]/30 transition-all">
                <span className="text-[#10E096] font-black text-lg w-8 flex-shrink-0">0{i + 1}</span>
                <div>
                  <p className="text-gray-400 text-xs mb-1">출원번호 {p.no}</p>
                  <p className="text-white text-sm">{p.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gradient-to-br from-[#10E096] to-[#0DC47D]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A0F1E] mb-6">
            지금 시범 도입을<br />검토해 보세요.
          </h2>
          <p className="text-[#0A0F1E]/70 text-lg mb-10">
            B2G 시범 사업, B2B 파트너십, 투자 문의 모두 환영합니다.<br />
            빠른 검토 후 제안서를 보내드립니다.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="bg-[#0A0F1E] text-white font-bold px-10 py-5 rounded-2xl text-lg hover:bg-[#111827] transition-all hover:scale-105"
            >
              도입 문의하기
            </Link>
            <a
              href="mailto:ceo@the-damda.co.kr"
              className="border-2 border-[#0A0F1E]/30 text-[#0A0F1E] font-bold px-10 py-5 rounded-2xl text-lg hover:bg-[#0A0F1E]/10 transition-all"
            >
              이메일로 문의
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

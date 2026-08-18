import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI 검색 최적화 대행 | AEO · GEO · SEO 기술 패키지',
  description: '기존 광고 대행사가 하지 못하는 AI 시대의 검색 기술. ChatGPT, Perplexity, 구글 AI에 당신의 브랜드가 최상단에 추천되도록 AEO/GEO 파이프라인을 구축해 드립니다.',
  alternates: { canonical: 'https://the-damda.co.kr/ai-search' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'AI 검색 최적화 기술 인프라 구축 패키지 (AEO / GEO / SEO)',
  provider: {
    '@type': 'Organization',
    name: '주식회사 더담다',
    url: 'https://the-damda.co.kr',
  },
  description: '브랜드·현장의 Q&A 데이터를 AI 크롤러가 가장 좋아하는 기술 구조(Schema Code)로 변환하여 ChatGPT, Perplexity, 구글 AI 추천 답변의 최상단을 선점시키는 B2B 기술 서비스',
  areaServed: 'KR',
  serviceType: 'AEO / GEO / SEO 기술 대행',
}

const targets = [
  {
    icon: '🏢',
    category: '분양 현장',
    sub: '지식산업센터 · 아파트 · 오피스텔',
    desc: '투자자·실수요자가 ChatGPT, Perplexity, 구글 AI에 현장을 검색할 때 최상단 추천을 선점합니다.',
    price: '현장당 1,000만 원',
    type: '일시불 통계약',
    badge: 'B2B',
  },
  {
    icon: '🏥',
    category: '병원',
    sub: '성형외과 · 치과 · 피부과',
    desc: '진료과목별 주요 질문 및 수술 후기 검색 시 AI 추천 1순위에 노출되어 신규 환자를 유입합니다.',
    price: '구축 200~300만 원 + 월 100~150만 원',
    type: '구독형',
    badge: '구독',
  },
  {
    icon: '⚖️',
    category: '전문직',
    sub: '변호사 · 세무사 · 변리사',
    desc: '고단가 수임 사건 관련 전문성 검증 및 법률·세무 AI 질문 답변을 선점하여 수임률을 높입니다.',
    price: '구축 200만 원 + 월 100만 원',
    type: '구독형',
    badge: '구독',
  },
  {
    icon: '🏭',
    category: '기업 · 브랜드',
    sub: '대기업 · FMCG · 신제품 런칭',
    desc: '신제품 런칭, 제품 효능, 브랜드 연관 질문에 대한 AI 추천 1순위를 선점합니다.',
    price: '프로젝트당 1,500만~3,000만 원',
    type: '프로젝트',
    badge: 'Enterprise',
  },
]

export default function AiSearchPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section className="min-h-screen bg-[#0A0F1E] flex items-center relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(16,224,150,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,224,150,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#10E096]/8 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 pt-32 pb-24">
          <div className="max-w-3xl">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-6">
              AI Search Optimization · AEO / GEO / SEO
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              AI가 당신의 브랜드를<br />
              <span className="text-[#10E096]">먼저 추천하게 합니다.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              기존 광고 대행사가 하지 못하는 AI 시대의 검색 기술.<br />
              ChatGPT · Perplexity · 구글 AI 최상단을 선점합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-[#10E096] text-[#0A0F1E] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#0DC47D] transition-all hover:scale-105"
              >
                도입 문의하기
              </Link>
              <a
                href="#targets"
                className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-all"
              >
                패키지 보기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Problem</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E] mb-6">
              당신의 고객은 이미<br />네이버 블로그를 보지 않습니다
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed">
              똑똑한 소비자, 부자, 3040 투자자들은 이제 네이버 블로그 광고를 건너뜁니다.
              그들은 <strong className="text-[#0A0F1E]">ChatGPT, Perplexity, 구글 AI에 직접 물어봅니다.</strong>
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'ChatGPT', desc: '"강남 성형외과 추천해줘" "인천 지식산업센터 투자 괜찮아?"' },
              { icon: '🔍', title: 'Perplexity', desc: '"변호사 수임료 기준이 어떻게 돼?" "피부과 레이저 부작용은?"' },
              { icon: '✨', title: '구글 AI Overview', desc: '"동아제약 박카스 효능" "농심 신라면 레시피"' },
            ].map(item => (
              <div key={item.title} className="bg-[#F8FAFB] rounded-2xl p-6 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-[#0A0F1E] font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed italic">"{item.desc}"</p>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 mt-8 text-sm">
            이 질문들에 당신의 브랜드가 답변으로 노출되고 있습니까?
          </p>
        </div>
      </section>

      {/* SOLUTION */}
      <section className="py-24 bg-[#0A0F1E]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Solution</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              AI 크롤러가 가장 좋아하는<br />기술 구조로 변환합니다
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              주식회사 더담다는 브랜드·현장의 Q&A 데이터를
              AI 크롤러가 최우선으로 학습하는 <span className="text-[#10E096] font-semibold">Schema.org(JSON-LD) 구조화 코드</span>로 변환하여
              AI 추천 답변의 최상단을 선점시킵니다.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: '맞춤형 Q&A 웹사이트 제작',
                desc: '클라이언트 업종·현장에 최적화된 Landing 및 FAQ 페이지를 제작합니다.',
              },
              {
                step: '02',
                title: 'AI 구조화 코드 이식',
                desc: 'Schema.org JSON-LD 및 AEO/GEO 최적화 스크립트를 전체 페이지에 적용합니다.',
              },
              {
                step: '03',
                title: '구글 실시간 파이프라인 연동',
                desc: '구글 서치콘솔 등록 및 Search Indexing API 연동으로 실시간 데이터 파이프라인을 구축합니다.',
              },
            ].map(item => (
              <div key={item.step} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#10E096]/30 transition-all">
                <p className="text-[#10E096] text-sm font-bold tracking-widest mb-4">STEP {item.step}</p>
                <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROOF */}
      <section className="py-24 bg-[#F0FDF9]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Proof</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E] mb-6">
              우리가 먼저 해봤습니다
            </h2>
            <div className="bg-white rounded-3xl p-10 shadow-sm border border-green-100">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[#10E096]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 text-[#0DC47D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.5l1.5-9h15l1.5 9M3 13.5H21M3 13.5l-1.5 6h19.5l-1.5-6M8 13.5V6m4 7.5V6m4 7.5V6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#0A0F1E] mb-2">담다트래블 — 정식 오픈 전 구글 AI 노출 실증</h3>
                  <p className="text-gray-500 leading-relaxed mb-4">
                    자체 서비스인 <strong className="text-[#0A0F1E]">담다트래블(damdatravel.com)</strong>은 정식 오픈 전부터
                    구글 AI 개요(AI Overview)에 노출되어 외국인 유입 및 예약 시도를 기록했습니다.
                    광고비 0원, 순수 기술 구조만으로 달성한 결과입니다.
                  </p>
                  <p className="text-gray-500 leading-relaxed">
                    이 기술을 그대로 클라이언트의 브랜드·현장에 이식해 드립니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TARGETS */}
      <section id="targets" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Packages</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E]">
              업종별 맞춤 패키지
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {targets.map(item => (
              <div key={item.category} className="bg-[#F8FAFB] rounded-3xl p-8 border border-gray-100 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="text-4xl">{item.icon}</div>
                  <span className="text-xs bg-[#10E096]/20 text-[#0A7A5A] font-semibold px-3 py-1 rounded-full">{item.badge}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#0A0F1E] mb-1">{item.category}</h3>
                <p className="text-[#0DC47D] text-sm font-semibold mb-4">{item.sub}</p>
                <p className="text-gray-600 leading-relaxed mb-6">{item.desc}</p>
                <div className="border-t border-gray-200 pt-5">
                  <p className="text-[#0A0F1E] font-bold text-lg">{item.price}</p>
                  <p className="text-gray-400 text-sm mt-1">{item.type}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 text-sm mt-8">
            * 제공 제외: 네이버 블로그/카페, SNS DB 광고, 현수막 등 기존 실행사 영역
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0A0F1E]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Contact</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            AI 시대, 먼저 선점하세요
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            계약금 50% + 오픈 전 잔금 50% 완납 방식으로<br />
            미수금 리스크 없이 진행됩니다.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#10E096] text-[#0A0F1E] font-bold text-lg px-10 py-4 rounded-xl hover:bg-[#0DC47D] transition-colors"
          >
            도입 문의하기
          </Link>
        </div>
      </section>
    </>
  )
}

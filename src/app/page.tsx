import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <>
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
              Damda Inc. · 주식회사 더담다
            </p>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
              일상의 불편함을<br />
              <span className="text-[#10E096]">사업으로 바꿉니다.</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-xl">
              일상의 불편함이 곧 기회이자 가능성이며,
              주식회사 더담다는 사업과 미래로 바꿉니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/contact"
                className="bg-[#10E096] text-[#0A0F1E] font-bold px-8 py-4 rounded-xl text-base hover:bg-[#0DC47D] transition-all hover:scale-105"
              >
                문의하기
              </Link>
              <a
                href="#about"
                className="border border-white/30 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/10 transition-all"
              >
                회사 소개
              </a>
            </div>
          </div>
        </div>

      </section>

      {/* ABOUT */}
      <section id="about" className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">About Us</p>
              <h2 className="text-4xl font-extrabold text-[#0A0F1E] mb-6 leading-tight">
                남들이 외면한 문제를,<br />기술로 해결합니다.
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-6">
                주식회사 더담다(Damda Inc.)는 인천 영종도를 기반으로 설립된 스마트 솔루션 기업입니다.
                물류, 자원순환, 라이프스타일 세 영역에서 현장의 문제를 기술과 서비스로 해결합니다.
              </p>
              <p className="text-gray-500 text-lg leading-relaxed">
                일상 속에서 느낀 불편함을 사업의 시작점으로 삼아,
                실용적이고 지속 가능한 모델로 바꾸는 것. 그것이 주식회사 더담다가 세상을 바라보는 방식입니다.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src="/images/yeongjongdo.jpg"
                  alt="인천 영종도 노을"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: '설립', value: '2026', sub: '' },
                  { label: '사업자', value: '475-81-03874', sub: '' },
                  { label: '운영 서비스', value: '3개', sub: '담다트래블 · 여는날 · 스퀴즈빈' },
                  { label: '대표이사', value: '김봉근', sub: 'The Damda Inc.' },
                ].map(item => (
                  <div key={item.label} className="bg-[#F8FAFB] rounded-2xl p-5">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">{item.label}</p>
                    <p className="text-[#0A0F1E] font-bold text-base">{item.value}</p>
                    <p className="text-gray-400 text-xs mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION */}
      <section className="py-24 bg-[#0A0F1E]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Vision & Mission</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6">
              더 나은 일상을 만드는<br />실용적인 혁신
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔍',
                title: '문제 발견',
                desc: '현장에서 직접 경험한 불편함과 비효율을 사업 기회로 전환합니다.',
              },
              {
                icon: '⚙️',
                title: '기술 해결',
                desc: '기술과 시스템으로 문제의 근본 원인을 제거하는 솔루션을 개발합니다.',
              },
              {
                icon: '🌱',
                title: '지속 성장',
                desc: '공공·민간 파트너십을 통해 사회적 가치와 경제적 가치를 동시에 추구합니다.',
              },
            ].map(item => (
              <div key={item.title} className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#10E096]/30 transition-all">
                <div className="text-4xl mb-5">{item.icon}</div>
                <h3 className="text-white font-bold text-xl mb-3">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="py-28 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Our Services</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0A0F1E]">
              현재 운영 중인 서비스
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 담다트래블 */}
            <div className="group relative bg-[#F0FDF9] border border-green-100 rounded-3xl overflow-hidden p-10 hover:shadow-xl transition-all">
              <div className="absolute top-6 right-6">
                <span className="text-xs bg-[#10E096]/20 text-[#0A7A5A] font-semibold px-3 py-1 rounded-full">운영 중</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#10E096]/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[#0DC47D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.5l1.5-9h15l1.5 9M3 13.5H21M3 13.5l-1.5 6h19.5l-1.5-6M8 13.5V6m4 7.5V6m4 7.5V6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#0A0F1E] mb-2">담다트래블</h3>
              <p className="text-[#0DC47D] text-sm font-semibold mb-4">damdatravel.com</p>
              <p className="text-gray-600 leading-relaxed mb-6">
                인천국제공항 ↔ 서울·경기 주요 호텔 간 캐리어 배송 서비스.
                수하물 없이 공항을 자유롭게, 여행의 첫인상을 바꿉니다.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['공항 픽업', '호텔 배송', '당일 수거', '온라인 예약'].map(tag => (
                  <span key={tag} className="text-xs bg-white text-gray-500 border border-gray-200 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <a
                href="https://www.damdatravel.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#0DC47D] font-semibold group-hover:gap-4 transition-all"
              >
                서비스 바로가기
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            {/* 여는날 */}
            <div className="group relative bg-[#0A0F1E] rounded-3xl overflow-hidden p-10 hover:shadow-xl transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-[#10E096]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-6 right-6">
                <span className="text-xs bg-[#10E096]/20 text-[#10E096] font-semibold px-3 py-1 rounded-full">운영 중</span>
              </div>
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-[#10E096]/20 flex items-center justify-center mb-6">
                  <svg className="w-7 h-7 text-[#10E096]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">여는날</h3>
                <p className="text-[#10E096] text-sm font-semibold mb-4">yeonunnal.com</p>
                <p className="text-gray-300 leading-relaxed mb-6">
                  인천 영종도의 감성 데이트 스팟 & 포토 스튜디오.
                  특별한 날을 더 특별하게, 두 사람만의 순간을 기록합니다.
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {['포토 스튜디오', '데이트 코스', '영종도', '온라인 예약'].map(tag => (
                    <span key={tag} className="text-xs bg-white/10 text-gray-300 px-3 py-1 rounded-full">{tag}</span>
                  ))}
                </div>
                <a
                  href="https://yeonunnal.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#10E096] font-semibold group-hover:gap-4 transition-all"
                >
                  서비스 바로가기
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
            {/* 스퀴즈빈 */}
            <div className="group relative bg-[#F0FDF9] border border-green-100 rounded-3xl overflow-hidden p-10 hover:shadow-xl transition-all">
              <div className="absolute top-6 right-6">
                <span className="text-xs bg-[#10E096]/20 text-[#0A7A5A] font-semibold px-3 py-1 rounded-full">추진 중</span>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#10E096]/20 flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[#0DC47D]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#0A0F1E] mb-2">스퀴즈빈</h3>
              <p className="text-[#0DC47D] text-sm font-semibold mb-4">Squeezebin · B2G 솔루션</p>
              <p className="text-gray-600 leading-relaxed mb-6">
                일회용컵 잔여 액체를 자동 분리·압착하는 스마트 수거 장치.
                컵 부피 90% 감량으로 지자체·공공기관의 자원순환을 혁신합니다.
              </p>
              <div className="flex flex-wrap gap-2 mb-8">
                {['B2G', '지자체', '공공장소', '특허 5건'].map(tag => (
                  <span key={tag} className="text-xs bg-white text-gray-500 border border-gray-200 px-3 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <Link
                href="/squeeze-bin"
                className="inline-flex items-center gap-2 text-[#0DC47D] font-semibold group-hover:gap-4 transition-all"
              >
                서비스 소개
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATION */}
      <section className="py-20 bg-[#F8FAFB]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-3">Location</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">오시는 길</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">주식회사 더담다</h3>
              <table className="w-full text-sm text-gray-600 border-collapse">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-semibold text-gray-900 w-28">주소</td>
                    <td className="py-3">인천광역시 영종구 영종대로162번길 20, 305호<br />(운서동, 스타힐스빌딩)</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-semibold text-gray-900">대표이사</td>
                    <td className="py-3">김봉근</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-semibold text-gray-900">사업자번호</td>
                    <td className="py-3">475-81-03874</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 pr-4 font-semibold text-gray-900">이메일</td>
                    <td className="py-3">
                      <a href="mailto:ceo@the-damda.co.kr" className="text-[#10E096] hover:underline">
                        ceo@the-damda.co.kr
                      </a>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 font-semibold text-gray-900">연락처</td>
                    <td className="py-3">+82 10-8823-1653</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="bg-[#0A0F1E] rounded-2xl p-8 text-white">
              <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">인천 영종도</p>
              <p className="text-2xl font-bold mb-3">인천 영종도 기반 기업</p>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                담다트래블 캐리어 배송, 여는날 웨딩·이벤트,<br />
                스퀴즈빈 자원순환 솔루션을 운영·추진 중입니다.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-[#10E096] text-[#0A0F1E] text-sm font-bold px-6 py-3 rounded-lg hover:bg-[#0DC47D] transition-colors"
              >
                파트너십 문의 →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#0A0F1E]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">Contact</p>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            우리 함께 만들어 갑시다
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            B2G 지자체 파트너십, B2B 협력, 투자 문의 모두 환영합니다.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#10E096] text-[#0A0F1E] font-bold text-lg px-10 py-4 rounded-xl hover:bg-[#0DC47D] transition-colors"
          >
            문의하기
          </Link>
        </div>
      </section>
    </>
  )
}

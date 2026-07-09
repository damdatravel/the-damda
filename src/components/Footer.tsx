import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#0A0F1E] text-gray-400 py-16 border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="text-white font-bold text-xl mb-3">
              THE <span className="text-[#10E096]">DAMDA</span>
            </div>
            <p className="text-sm leading-relaxed">
              스마트 자원순환과 물류 혁신으로<br />
              더 나은 도시 환경을 만듭니다.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">서비스</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="https://www.damdatravel.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">담다트래블 — 공항 캐리어 배송</a></li>
              <li><a href="https://yeonunnal.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">여는날 — 영종도 데이트 스팟</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">문의</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:ceo@the-damda.co.kr" className="hover:text-white transition-colors">
                  ceo@the-damda.co.kr
                </a>
              </li>
              <li>
                <a href="https://wa.me/821088231653" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  WhatsApp +82 10-8823-1653
                </a>
              </li>
              <li><Link href="/contact" className="text-[#10E096] hover:text-[#0DC47D] transition-colors font-medium">파트너십 &amp; 투자 문의 →</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-start gap-4 text-xs">
          <div className="space-y-1">
            <p>주식회사 더담다 | 대표이사 김봉근 | 사업자등록번호 475-81-03874</p>
            <p>인천광역시 영종구 영종대로162번길 20, 305호 (운서동, 스타힐스빌딩)</p>
          </div>
          <p className="text-gray-600">© 2026 Damda Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

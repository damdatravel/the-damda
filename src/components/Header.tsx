'use client'
import Link from 'next/link'
import { useState } from 'react'

const services = [
  { label: '여는날', href: 'https://yeonunnal.com', external: true },
  { label: '담다트래블', href: 'https://www.damdatravel.com', external: true },
  { label: '스퀴즈빈', href: '/squeeze-bin', external: false },
  { label: 'AI 검색 최적화', href: '/ai-search', external: false },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [dropOpen, setDropOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1E]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-tight">
            THE <span className="text-[#10E096]">DAMDA</span>
          </span>
        </Link>

        {/* 데스크탑 네비 */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-white text-sm transition-colors">
            홈
          </Link>

          {/* 사업소개 드롭다운 */}
          <div
            className="relative"
            onMouseEnter={() => setDropOpen(true)}
            onMouseLeave={() => setDropOpen(false)}
          >
            <button className="flex items-center gap-1 text-gray-300 hover:text-white text-sm transition-colors">
              사업소개
              <svg
                className={`w-3 h-3 transition-transform ${dropOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-44 bg-[#0A0F1E] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                {services.map(s =>
                  s.external ? (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {s.label}
                      <svg className="w-3 h-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <Link
                      key={s.label}
                      href={s.href}
                      className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      {s.label}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>

          <Link href="/faq" className="text-gray-300 hover:text-white text-sm transition-colors">
            Q&A
          </Link>
          <Link href="/contact" className="text-gray-300 hover:text-white text-sm transition-colors">
            문의
          </Link>
          <Link
            href="/contact"
            className="bg-[#10E096] text-[#0A0F1E] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#0DC47D] transition-colors"
          >
            문의하기
          </Link>
        </nav>

        {/* 모바일 햄버거 */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
          aria-label="메뉴"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <div className="md:hidden bg-[#0A0F1E] border-t border-white/10 px-6 py-4 space-y-1">
          <Link href="/" className="block text-gray-300 hover:text-white text-sm py-2" onClick={() => setOpen(false)}>홈</Link>

          <div className="py-2">
            <p className="text-[#10E096] text-xs font-semibold tracking-widest uppercase mb-2">사업소개</p>
            {services.map(s =>
              s.external ? (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-400 hover:text-white text-sm py-1.5 pl-3"
                  onClick={() => setOpen(false)}
                >
                  {s.label} ↗
                </a>
              ) : (
                <Link
                  key={s.label}
                  href={s.href}
                  className="block text-gray-400 hover:text-white text-sm py-1.5 pl-3"
                  onClick={() => setOpen(false)}
                >
                  {s.label}
                </Link>
              )
            )}
          </div>

          <Link href="/faq" className="block text-gray-300 hover:text-white text-sm py-2" onClick={() => setOpen(false)}>Q&A</Link>
          <Link href="/contact" className="block text-gray-300 hover:text-white text-sm py-2" onClick={() => setOpen(false)}>문의</Link>
          <Link href="/contact" className="block bg-[#10E096] text-[#0A0F1E] text-sm font-semibold px-4 py-2 rounded-lg text-center mt-2" onClick={() => setOpen(false)}>문의하기</Link>
        </div>
      )}
    </header>
  )
}

'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1E]/90 backdrop-blur-md border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-white font-bold text-xl tracking-tight">
            THE <span className="text-[#10E096]">DAMDA</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-gray-300 hover:text-white text-sm transition-colors">
            홈
          </Link>
          <a href="https://www.damdatravel.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white text-sm transition-colors">
            담다트래블
          </a>
          <a href="https://yeonunnal.com" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white text-sm transition-colors">
            여는날
          </a>
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

      {open && (
        <div className="md:hidden bg-[#0A0F1E] border-t border-white/10 px-6 py-4 space-y-4">
          <Link href="/" className="block text-gray-300 hover:text-white text-sm" onClick={() => setOpen(false)}>홈</Link>
          <a href="https://www.damdatravel.com" target="_blank" rel="noopener noreferrer" className="block text-gray-300 hover:text-white text-sm" onClick={() => setOpen(false)}>담다트래블</a>
          <a href="https://yeonunnal.com" target="_blank" rel="noopener noreferrer" className="block text-gray-300 hover:text-white text-sm" onClick={() => setOpen(false)}>여는날</a>
          <Link href="/contact" className="block text-gray-300 hover:text-white text-sm" onClick={() => setOpen(false)}>문의</Link>
          <Link href="/contact" className="block bg-[#10E096] text-[#0A0F1E] text-sm font-semibold px-4 py-2 rounded-lg text-center" onClick={() => setOpen(false)}>문의하기</Link>
        </div>
      )}
    </header>
  )
}

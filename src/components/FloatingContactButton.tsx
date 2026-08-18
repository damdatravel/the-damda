import Link from 'next/link'

export default function FloatingContactButton() {
  return (
    <Link
      href="/contact"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#10E096] text-[#0A0F1E] text-sm font-bold px-5 py-3 rounded-full shadow-lg hover:bg-[#0DC47D] hover:shadow-xl hover:scale-105 transition-all"
    >
      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      문의하기
    </Link>
  )
}

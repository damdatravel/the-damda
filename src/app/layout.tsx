import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: '주식회사 더담다 | The Damda',
  description: '스마트 자원순환과 물류 혁신으로 더 나은 도시를 만듭니다. 스퀴즈빈 일회용 컵 자동 수거 시스템, 공항 캐리어 배송 서비스.',
  keywords: '더담다, 스퀴즈빈, 일회용컵 수거, 자원순환, 스마트시티, B2G, 지자체, 공공기관',
  openGraph: {
    title: '주식회사 더담다 | The Damda',
    description: '스마트 자원순환과 물류 혁신으로 더 나은 도시를 만듭니다.',
    url: 'https://the-damda.co.kr',
    siteName: '주식회사 더담다',
    locale: 'ko_KR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}

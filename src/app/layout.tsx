import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  metadataBase: new URL('https://the-damda.co.kr'),
  title: {
    default: '주식회사 더담다 | The Damda',
    template: '%s | 주식회사 더담다',
  },
  description: '일상의 불편함을 사업으로 바꾸는 스마트 솔루션 기업. 스퀴즈빈 일회용컵 자원순환 B2G 솔루션, 담다트래블 공항 캐리어 배송, 여는날 야외 웨딩.',
  keywords: ['더담다', '스퀴즈빈', '일회용컵 수거', '자원순환', 'B2G', '지자체', '공공기관', '담다트래블', '공항 캐리어 배송', '여는날', '영종도 웨딩'],
  authors: [{ name: '주식회사 더담다' }],
  creator: '주식회사 더담다',
  publisher: '주식회사 더담다',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: '주식회사 더담다 | The Damda',
    description: '일상의 불편함을 사업으로 바꾸는 스마트 솔루션 기업. 스퀴즈빈 · 담다트래블 · 여는날.',
    url: 'https://the-damda.co.kr',
    siteName: '주식회사 더담다',
    locale: 'ko_KR',
    type: 'website',
    images: [{
      url: '/images/yeongjongdo.jpg',
      width: 1200,
      height: 630,
      alt: '주식회사 더담다 — 인천 영종도',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '주식회사 더담다 | The Damda',
    description: '일상의 불편함을 사업으로 바꾸는 스마트 솔루션 기업.',
    images: ['/images/yeongjongdo.jpg'],
  },
  alternates: {
    canonical: 'https://the-damda.co.kr',
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

import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import FaqClient from './FaqClient'

export const metadata: Metadata = {
  title: '자주 묻는 질문 (FAQ)',
  description: '담다트래블 캐리어 배송, 스퀴즈빈 일회용컵 수거, 서비스 이용 관련 자주 묻는 질문과 답변을 확인하세요.',
  alternates: { canonical: 'https://the-damda.co.kr/faq' },
  openGraph: {
    title: '자주 묻는 질문 (FAQ) | 주식회사 더담다',
    description: '담다트래블 · 스퀴즈빈 서비스 관련 FAQ',
    url: 'https://the-damda.co.kr/faq',
  },
}

export interface QaItem {
  id: string
  category: string
  question_ko: string
  answer_ko: string
  sort_order: number
}

export default async function FaqPage() {
  const { data: items } = await supabase
    .from('qa_contents')
    .select('id, category, question_ko, answer_ko, sort_order')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  const faqList: QaItem[] = items ?? []

  // JSON-LD FAQPage 스키마
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqList.map(item => ({
      '@type': 'Question',
      name: item.question_ko,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer_ko,
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <section className="bg-[#0A0F1E] pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[#10E096] text-sm font-semibold tracking-widest uppercase mb-4">FAQ</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            자주 묻는 질문
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            담다트래블 · 스퀴즈빈 서비스에 대해<br />
            궁금하신 점을 확인해 보세요.
          </p>
        </div>
      </section>

      <FaqClient items={faqList} />

      {/* 추가 문의 CTA */}
      <section className="py-20 bg-[#0A0F1E]">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p className="text-gray-400 mb-4">원하시는 답변을 찾지 못하셨나요?</p>
          <h2 className="text-2xl font-bold text-white mb-8">직접 문의해 주세요</h2>
          <a
            href="/contact"
            className="inline-block bg-[#10E096] text-[#0A0F1E] font-semibold px-8 py-4 rounded-xl hover:bg-[#0DC47D] transition-colors"
          >
            문의하기 →
          </a>
        </div>
      </section>
    </>
  )
}

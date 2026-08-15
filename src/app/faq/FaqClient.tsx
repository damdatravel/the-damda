'use client'

import { useState } from 'react'
import type { QaItem } from './page'

const ALL = '__all__'

export default function FaqClient({ items }: { items: QaItem[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selectedCat, setSelectedCat] = useState(ALL)

  const categories = [ALL, ...Array.from(new Set(items.map(i => i.category).filter(Boolean)))]
  const filtered = selectedCat === ALL ? items : items.filter(i => i.category === selectedCat)

  return (
    <section className="py-16 bg-white">
      <div className="max-w-3xl mx-auto px-6">

        {/* 카테고리 탭 */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCat(cat); setExpanded(null) }}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                  selectedCat === cat
                    ? 'bg-[#0A0F1E] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === ALL ? '전체' : cat}
              </button>
            ))}
          </div>
        )}

        {/* FAQ 목록 */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-20">등록된 FAQ가 없습니다.</p>
        ) : (
          <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
            {filtered.map(item => {
              const isOpen = expanded === item.id
              return (
                <div key={item.id}>
                  <button
                    className="w-full text-left flex items-start gap-4 px-6 py-5 hover:bg-gray-50 transition-colors"
                    onClick={() => setExpanded(isOpen ? null : item.id)}
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#0A0F1E] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                      Q
                    </span>
                    <span className={`flex-1 text-[#0A0F1E] font-semibold leading-relaxed ${isOpen ? '' : 'line-clamp-2'}`}>
                      {item.question_ko}
                    </span>
                    <span className="flex-shrink-0 text-gray-400 text-sm mt-1">
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="flex items-start gap-4 px-6 pb-6 bg-gray-50">
                      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#10E096] text-[#0A0F1E] text-sm font-bold flex items-center justify-center mt-0.5">
                        A
                      </span>
                      <p className="flex-1 text-gray-600 leading-relaxed whitespace-pre-line">
                        {item.answer_ko}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

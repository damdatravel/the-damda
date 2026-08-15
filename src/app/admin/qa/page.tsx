'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PW = 'damda2026!'

type QaItem = {
  id: string
  category: string
  question_ko: string
  answer_ko: string
  is_published: boolean
  sort_order: number
  created_at: string
}

const EMPTY = {
  category: '',
  question_ko: '',
  answer_ko: '',
  is_published: true,
  sort_order: 0,
}

const CATEGORIES = ['배송', '예약', '결제', '서비스', '앱', '기타']

export default function QaAdminPage() {
  const [auth, setAuth]       = useState(false)
  const [pw, setPw]           = useState('')
  const [items, setItems]     = useState<QaItem[]>([])
  const [form, setForm]       = useState(EMPTY)
  const [editId, setEditId]   = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)
  const [msg, setMsg]         = useState('')
  const [filterCat, setFilterCat] = useState('__all__')

  const load = async () => {
    const { data } = await supabase
      .from('qa_contents')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
    if (data) setItems(data)
  }

  useEffect(() => { if (auth) load() }, [auth])

  const save = async () => {
    setSaving(true)
    let error
    if (editId) {
      ;({ error } = await supabase.from('qa_contents').update(form).eq('id', editId))
    } else {
      ;({ error } = await supabase.from('qa_contents').insert(form))
    }
    setSaving(false)
    if (error) { setMsg('❌ ' + error.message); return }
    setMsg(editId ? '✅ 수정 완료' : '✅ 추가 완료')
    setForm(EMPTY); setEditId(null)
    load()
    setTimeout(() => setMsg(''), 3000)
  }

  const del = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return
    await supabase.from('qa_contents').delete().eq('id', id)
    load()
  }

  const startEdit = (item: QaItem) => {
    setEditId(item.id)
    setForm({
      category: item.category,
      question_ko: item.question_ko,
      answer_ko: item.answer_ko,
      is_published: item.is_published,
      sort_order: item.sort_order,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const togglePublish = async (item: QaItem) => {
    await supabase.from('qa_contents').update({ is_published: !item.is_published }).eq('id', item.id)
    load()
  }

  /* ── 로그인 ── */
  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-10 w-full max-w-sm shadow-2xl">
          <h1 className="text-xl font-bold text-[#0A0F1E] mb-6 text-center">Q&A 관리자</h1>
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pw === ADMIN_PW && setAuth(true)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm mb-4 outline-none focus:border-[#10E096]"
          />
          <button
            onClick={() => pw === ADMIN_PW ? setAuth(true) : setMsg('비밀번호 오류')}
            className="w-full bg-[#0A0F1E] text-white font-semibold py-3 rounded-xl hover:bg-[#1a2b4a] transition-colors"
          >
            로그인
          </button>
          {msg && <p className="text-red-500 text-sm text-center mt-3">{msg}</p>}
        </div>
      </div>
    )
  }

  const filtered = filterCat === '__all__' ? items : items.filter(i => i.category === filterCat)

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-6">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#0A0F1E]">Q&A 관리</h1>
          <span className="text-sm text-gray-400">{items.length}개 항목</span>
        </div>

        {/* 입력/수정 폼 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-base font-bold text-[#0A0F1E] mb-4">
            {editId ? '✏️ 수정' : '➕ 새 Q&A 추가'}
          </h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">카테고리</label>
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#10E096]"
              >
                <option value="">-- 선택 --</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">정렬 순서</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#10E096]"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">질문 (한국어)</label>
            <input
              value={form.question_ko}
              onChange={e => setForm(f => ({ ...f, question_ko: e.target.value }))}
              placeholder="자주 묻는 질문을 입력하세요"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#10E096]"
            />
          </div>

          <div className="mb-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">답변 (한국어)</label>
            <textarea
              rows={4}
              value={form.answer_ko}
              onChange={e => setForm(f => ({ ...f, answer_ko: e.target.value }))}
              placeholder="답변을 입력하세요"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#10E096] resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
                className="w-4 h-4 accent-[#10E096]"
              />
              <span className="text-sm text-gray-600">공개</span>
            </label>

            <button
              onClick={save}
              disabled={saving || !form.question_ko || !form.answer_ko}
              className="ml-auto bg-[#0A0F1E] text-white font-semibold px-6 py-2 rounded-xl hover:bg-[#1a2b4a] transition-colors disabled:opacity-40"
            >
              {saving ? '저장 중…' : editId ? '수정 저장' : '추가'}
            </button>
            {editId && (
              <button
                onClick={() => { setEditId(null); setForm(EMPTY) }}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                취소
              </button>
            )}
          </div>
          {msg && <p className="mt-3 text-sm font-semibold text-[#10E096]">{msg}</p>}
        </div>

        {/* 카테고리 필터 */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['__all__', ...CATEGORIES].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filterCat === cat
                  ? 'bg-[#0A0F1E] text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'
              }`}
            >
              {cat === '__all__' ? `전체 (${items.length})` : `${cat} (${items.filter(i => i.category === cat).length})`}
            </button>
          ))}
        </div>

        {/* Q&A 목록 */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center text-gray-400 py-16">등록된 Q&A가 없습니다.</div>
          )}
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-bold ${
                  item.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {item.is_published ? '공개' : '비공개'}
                </span>
                {item.category && (
                  <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-600">
                    {item.category}
                  </span>
                )}
                <span className="text-xs text-gray-300 ml-auto">#{item.sort_order}</span>
              </div>

              <p className="font-semibold text-[#0A0F1E] mt-3 mb-1 text-sm leading-relaxed">
                Q. {item.question_ko}
              </p>
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                A. {item.answer_ko}
              </p>

              <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => startEdit(item)}
                  className="text-xs font-semibold text-[#0A0F1E] hover:text-[#10E096] transition-colors"
                >
                  수정
                </button>
                <button
                  onClick={() => togglePublish(item)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {item.is_published ? '비공개로' : '공개로'}
                </button>
                <button
                  onClick={() => del(item.id)}
                  className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors ml-auto"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

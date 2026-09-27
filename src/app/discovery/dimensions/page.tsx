import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type Dimension = {
  id: number
  dimension_type: string
  dimension_value: string
  subtype: string | null
  priority: number
  is_active: boolean
  source: string
  notes: string | null
}

async function getDimensions() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) return { dimensions: [] as Dimension[], error: 'Supabase 환경변수를 확인해 주세요.' }
  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('discovery_question_dimensions')
    .select('id,dimension_type,dimension_value,subtype,priority,is_active,source,notes')
    .eq('project_id', 1)
    .order('dimension_type')
    .order('priority', { ascending: false })
    .order('id')
  return { dimensions: (data ?? []) as Dimension[], error: error?.message ?? null }
}

const order = ['WHO','FOR_WHOM','WHERE','WHEN','WHAT','SERVICE','PURPOSE','PROBLEM','ACTION','BUDGET','CONDITION','PREFERENCE','URGENCY','METHOD','INFO','DYNAMIC']

export default async function DimensionsPage() {
  const { dimensions, error } = await getDimensions()
  const types = Array.from(new Set(dimensions.map((item) => item.dimension_type))).sort((a,b) => {
    const ai = order.indexOf(a); const bi = order.indexOf(b)
    return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi)
  })

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">Question Ingredients</p>
            <h1 className="text-3xl font-extrabold md:text-4xl">질문 재료</h1>
            <p className="mt-2 text-sm text-gray-500">질문 조합 엔진이 사용할 실제 재료를 확인합니다. 현재는 읽기 전용입니다.</p>
          </div>
          <Link href="/discovery" className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold shadow-sm">← 대시보드</Link>
        </header>

        {error && <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">질문 재료를 불러오지 못했습니다: {error}<br/><span className="text-xs">Supabase Data API에서 discovery_question_dimensions 테이블이 노출되어 있는지도 확인해 주세요.</span></div>}

        <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="전체 재료" value={dimensions.length} />
          <Stat label="활성 재료" value={dimensions.filter(x => x.is_active).length} />
          <Stat label="재료 종류" value={types.length} />
          <Stat label="WHERE 장소" value={dimensions.filter(x => x.dimension_type === 'WHERE').length} />
        </section>

        {!error && dimensions.length === 0 && <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">저장된 질문 재료가 없습니다.</div>}

        <div className="space-y-6">
          {types.map((type) => {
            const items = dimensions.filter((item) => item.dimension_type === type)
            const isWhere = type === 'WHERE'
            return (
              <section key={type} className={`rounded-2xl border bg-white p-5 shadow-sm md:p-6 ${isWhere ? 'border-[#0A9B6C] ring-1 ring-[#0A9B6C]/10' : 'border-gray-200'}`}>
                <div className="mb-4 flex items-center justify-between">
                  <div><h2 className="text-xl font-extrabold">{type}{isWhere && <span className="ml-2 text-sm font-semibold text-[#0A9B6C]">장소</span>}</h2><p className="mt-1 text-xs text-gray-400">{items.length}개 재료</p></div>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <article key={item.id} className={`rounded-xl border p-4 ${item.is_active ? 'border-gray-200 bg-[#FAFBFB]' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                      <div className="flex items-start justify-between gap-3"><p className="font-bold">{item.dimension_value}</p><span className="shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-bold text-gray-500">P{item.priority}</span></div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">{item.subtype && <span className="rounded-full bg-white px-2 py-1">{item.subtype}</span>}<span className="rounded-full bg-white px-2 py-1">{item.source}</span><span className={item.is_active ? 'text-[#087A56]' : ''}>{item.is_active ? '활성' : '비활성'}</span></div>
                    </article>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-gray-300 bg-white p-5 text-sm text-gray-500">
          다음 단계: 이 재료를 3–6개씩 규칙에 따라 조합하고, 자연어 질문으로 만든 뒤 <strong className="text-gray-700">discovery_questions</strong>에 저장합니다.
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><p className="text-sm font-semibold text-gray-500">{label}</p><p className="mt-2 text-3xl font-extrabold">{value}</p></div>
}

'use client'

import { useMemo, useState } from 'react'

type Dimension = {
  id: number
  dimension_type: string
  dimension_value: string
  priority: number
}

type Candidate = {
  question: string
  intent: string
  ingredients: Dimension[]
  combinationKey: string
}

const typeOrder = ['WHO','FOR_WHOM','WHERE','SERVICE','PURPOSE','PROBLEM','ACTION']

function pick(items: Dimension[], type: string, offset: number) {
  const list = items.filter(x => x.dimension_type === type).sort((a,b) => b.priority - a.priority || a.id - b.id)
  return list.length ? list[offset % list.length] : undefined
}

function compact(items: Array<Dimension | undefined>) {
  return items.filter(Boolean) as Dimension[]
}

function keyOf(items: Dimension[]) {
  return items.slice().sort((a,b) => a.dimension_type.localeCompare(b.dimension_type) || a.id-b.id).map(x => `${x.dimension_type}:${x.id}`).join('|')
}

function makeQuestion(items: Dimension[], intent: string) {
  const value = (type: string) => items.find(x => x.dimension_type === type)?.dimension_value
  const who=value('WHO'), target=value('FOR_WHOM'), where=value('WHERE'), service=value('SERVICE'), purpose=value('PURPOSE'), problem=value('PROBLEM'), action=value('ACTION')
  if (problem && service && where && who) return `${where}에서 사업하는 ${who}인데, ${problem} 상황에서 ${service}를 어떻게 시작하면 좋을까요?`
  if (purpose && service && who && target) return `${who}이 ${target}에게 더 잘 발견되어 ${purpose}하려면 ${service}를 어떻게 활용해야 하나요?`
  if (action && service && where && target) return `${where}에서 ${target}을 대상으로 ${service} 관련 ${action}를 하려면 무엇을 확인해야 하나요?`
  if (problem && purpose && service) return `${problem} 문제가 있는데, ${purpose}를 위해 ${service}에서 무엇부터 개선해야 하나요?`
  if (where && service && purpose) return `${where}에서 ${purpose}를 목표로 할 때 ${service}는 어떤 방식으로 진행하나요?`
  return `${items.map(x => x.dimension_value).join(', ')} 조건에서 어떤 방법을 알아보는 것이 좋을까요?`
}

function generate(items: Dimension[], count: number): Candidate[] {
  const templates = [
    ['WHO','WHERE','SERVICE','PROBLEM'],
    ['WHO','FOR_WHOM','SERVICE','PURPOSE'],
    ['WHERE','FOR_WHOM','SERVICE','ACTION'],
    ['SERVICE','PROBLEM','PURPOSE'],
    ['WHO','WHERE','SERVICE','PURPOSE','PROBLEM'],
    ['WHO','FOR_WHOM','WHERE','SERVICE','PURPOSE','ACTION'],
  ]
  const intents = ['문제 해결','목적 달성','업체/서비스 탐색','개선 방법','상황형 탐색','복합 탐색']
  const seen = new Set<string>()
  const out: Candidate[] = []
  for (let round=0; round<20 && out.length<count; round++) {
    templates.forEach((types, ti) => {
      if (out.length >= count) return
      const ingredients = compact(types.map((type, i) => pick(items, type, round+i+ti)))
      if (ingredients.length < 3) return
      const combinationKey = keyOf(ingredients)
      if (seen.has(combinationKey)) return
      seen.add(combinationKey)
      out.push({ question: makeQuestion(ingredients, intents[ti]), intent: intents[ti], ingredients, combinationKey })
    })
  }
  return out
}

export default function QuestionGenerator({ dimensions }: { dimensions: Dimension[] }) {
  const [count, setCount] = useState(12)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const active = useMemo(() => dimensions.filter(x => typeOrder.includes(x.dimension_type)), [dimensions])

  const run = () => {
    const next = generate(active, count)
    setCandidates(next)
    setSelected(new Set())
  }
  const toggle = (key: string) => {
    const next = new Set(selected)
    next.has(key) ? next.delete(key) : next.add(key)
    setSelected(next)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">V0.1 Combination Engine</p><h2 className="mt-1 text-2xl font-extrabold">질문 후보 생성</h2><p className="mt-2 text-sm text-gray-500">현재 29개 재료에서 3–6개를 규칙에 따라 조합합니다. 아직 DB에는 저장하지 않습니다.</p></div>
          <div className="flex items-center gap-2"><label className="text-sm text-gray-500">후보 수</label><select value={count} onChange={e=>setCount(Number(e.target.value))} className="rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold">{[6,12,18,24].map(n=><option key={n}>{n}</option>)}</select><button onClick={run} className="rounded-xl bg-[#0A0F1E] px-5 py-3 text-sm font-bold text-white">질문 생성</button></div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-500"><span className="rounded-full bg-gray-100 px-3 py-1">최소 3개 재료</span><span className="rounded-full bg-gray-100 px-3 py-1">최대 6개 재료</span><span className="rounded-full bg-gray-100 px-3 py-1">동일 조합 중복 제거</span><span className="rounded-full bg-gray-100 px-3 py-1">우선순위 반영</span></div>
      </section>

      {candidates.length > 0 && <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="text-xl font-bold">생성 결과</h2><p className="mt-1 text-sm text-gray-400">{candidates.length}개 후보 · {selected.size}개 선택</p></div><button disabled={selected.size===0} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-400 disabled:opacity-40" title="다음 단계에서 DB 저장 기능을 연결합니다.">선택 질문 저장 (다음 단계)</button></div>
        <div className="space-y-3">{candidates.map((c,i)=><article key={c.combinationKey} onClick={()=>toggle(c.combinationKey)} className={`cursor-pointer rounded-xl border p-4 transition ${selected.has(c.combinationKey)?'border-[#0A9B6C] bg-[#F0FBF7]':'border-gray-200 bg-[#FAFBFB]'}`}><div className="flex gap-3"><div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${selected.has(c.combinationKey)?'border-[#0A9B6C] bg-[#0A9B6C] text-white':'border-gray-300'}`}>{selected.has(c.combinationKey)?'✓':''}</div><div><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-bold text-gray-400">Q{i+1}</span><span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-[#087A56]">{c.intent}</span><span className="text-[10px] text-gray-400">{c.ingredients.length} dimensions</span></div><p className="mt-2 font-bold leading-relaxed">{c.question}</p><div className="mt-3 flex flex-wrap gap-2">{c.ingredients.map(x=><span key={x.id} className="rounded-full bg-white px-2 py-1 text-[10px] text-gray-500"><b>{x.dimension_type}</b> · {x.dimension_value}</span>)}</div></div></div></article>)}</div>
      </section>}
    </div>
  )
}

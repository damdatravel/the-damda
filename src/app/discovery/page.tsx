import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

type DiscoveryProject = {
  id: number
  name: string | null
  website_url: string | null
  industry: string | null
  main_services: string | null
  target_customer: string | null
  service_area: string | null
  description: string | null
  status: string | null
}

async function getProject(): Promise<{ project: DiscoveryProject | null; error: string | null }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) return { project: null, error: 'Supabase 환경변수를 확인해 주세요.' }

  const supabase = createClient(url, key)
  const { data, error } = await supabase
    .from('discovery_projects')
    .select('id,name,website_url,industry,main_services,target_customer,service_area,description,status')
    .order('id', { ascending: true })
    .limit(1)
    .maybeSingle()

  return { project: data, error: error?.message ?? null }
}

export default async function DiscoveryPage() {
  const { project, error } = await getProject()

  const stats = [
    { label: 'Benchmark 질문', value: '0', note: '아직 등록된 질문이 없습니다.' },
    { label: '측정 기록', value: '0', note: 'Day 0 측정 전입니다.' },
    { label: '발견', value: '0', note: '측정 후 집계됩니다.' },
    { label: '검토 대기', value: '0', note: '현재 대기 작업이 없습니다.' },
  ]

  return (
    <div className="min-h-screen bg-[#F4F7F6] text-[#0A0F1E]">
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#0A9B6C]">The Damda Discovery</p>
            <h1 className="text-3xl font-extrabold md:text-4xl">Discovery Dashboard</h1>
            <p className="mt-2 text-sm text-gray-500">검색과 AI에서 더담다가 어떻게 발견되는지 기록하고 변화 과정을 측정합니다.</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm">
            <span className="text-gray-400">Project</span>
            <span className="ml-3 font-bold">{project?.name ?? '프로젝트 불러오는 중'}</span>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            DB 연결 확인 필요: {error}
          </div>
        )}

        {project && (
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0A9B6C]">Live Project Data</p>
                <h2 className="mt-1 text-xl font-bold">{project.name}</h2>
                <p className="mt-2 text-sm text-gray-500">{project.description || '프로젝트 설명이 아직 없습니다.'}</p>
              </div>
              {project.website_url && <span className="text-sm text-gray-500">{project.website_url}</span>}
            </div>
            <div className="mt-4 grid gap-3 text-sm md:grid-cols-4">
              <div><span className="text-gray-400">업종</span><p className="font-semibold">{project.industry || '-'}</p></div>
              <div><span className="text-gray-400">주요 서비스</span><p className="font-semibold">{project.main_services || '-'}</p></div>
              <div><span className="text-gray-400">대상 고객</span><p className="font-semibold">{project.target_customer || '-'}</p></div>
              <div><span className="text-gray-400">서비스 지역</span><p className="font-semibold">{project.service_area || '-'}</p></div>
            </div>
          </section>
        )}

        <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((item) => (
            <article key={item.label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-gray-500">{item.label}</p>
              <p className="my-2 text-4xl font-extrabold">{item.value}</p>
              <p className="text-xs leading-relaxed text-gray-400">{item.note}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div><h2 className="text-xl font-bold">Activity Calendar</h2><p className="mt-1 text-sm text-gray-400">측정과 작업 이력이 날짜별로 쌓입니다.</p></div>
              <span className="rounded-full bg-[#E8FAF3] px-3 py-1 text-xs font-bold text-[#087A56]">Day 0</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400">
              {['일','월','화','수','목','금','토'].map((day) => <div key={day} className="py-2">{day}</div>)}
              {Array.from({ length: 35 }).map((_, index) => <div key={index} className="aspect-square rounded-lg border border-gray-100 bg-[#FAFBFB]" />)}
            </div>
            <div className="mt-5 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-500">아직 기록된 활동이 없습니다. 첫 측정과 작업부터 자동 기록을 시작합니다.</div>
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="text-xl font-bold">채널 현황</h2>
              <div className="mt-5 space-y-3">{['Google','ChatGPT','Gemini'].map((channel) => <div key={channel} className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"><span className="font-semibold">{channel}</span><span className="text-sm text-gray-400">측정 전</span></div>)}</div>
            </section>
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:p-6">
              <h2 className="text-xl font-bold">최근 작업</h2>
              <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-5 text-center"><p className="text-sm font-semibold text-gray-500">작업 기록 0건</p><p className="mt-1 text-xs text-gray-400">사이트 변경과 측정 기록이 여기에 표시됩니다.</p></div>
            </section>
          </div>
        </div>
        <footer className="mt-8 text-center text-xs text-gray-400">Discovery V0.1 · Supabase Connected</footer>
      </div>
    </div>
  )
}

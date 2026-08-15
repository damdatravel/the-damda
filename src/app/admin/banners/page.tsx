'use client';

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

const ADMIN_EMAIL = 'mvstory00@gmail.com';
const ADMIN_PW    = 'damda2026!';   // 간단 잠금 — 실제 배포 전 변경 권장

type Banner = {
  id: string;
  image_url: string | null;
  title_ko: string; title_en: string; title_ja: string; title_zh: string;
  sub_ko: string;   sub_en: string;   sub_ja: string;   sub_zh: string;
  link_url: string | null;
  banner_type: string;
  is_active: boolean;
  sort_order: number;
  starts_at: string | null;
  ends_at: string | null;
};

const EMPTY: Omit<Banner, 'id'> = {
  image_url: null, title_ko: '', title_en: '', title_ja: '', title_zh: '',
  sub_ko: '', sub_en: '', sub_ja: '', sub_zh: '',
  link_url: null, banner_type: 'home', is_active: true, sort_order: 0,
  starts_at: null, ends_at: null,
};

export default function BannerAdminPage() {
  const [auth, setAuth]         = useState(false);
  const [pw, setPw]             = useState('');
  const [banners, setBanners]   = useState<Banner[]>([]);
  const [form, setForm]         = useState<Omit<Banner, 'id'>>(EMPTY);
  const [editId, setEditId]     = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setBanners(data);
  };

  useEffect(() => { if (auth) load(); }, [auth]);

  /* ── 이미지 업로드 (Supabase Storage) ── */
  const uploadImage = async (file: File) => {
    setUploading(true);
    const ext  = file.name.split('.').pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('banners').upload(path, file, { upsert: true });
    if (error) { setMsg('❌ 업로드 실패: ' + error.message); setUploading(false); return; }
    const { data } = supabase.storage.from('banners').getPublicUrl(path);
    setForm(f => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    setMsg('✅ 이미지 업로드 완료');
  };

  /* ── 저장 (신규 / 수정) ── */
  const save = async () => {
    setSaving(true);
    let error;
    if (editId) {
      ({ error } = await supabase.from('banners').update(form).eq('id', editId));
    } else {
      ({ error } = await supabase.from('banners').insert(form));
    }
    setSaving(false);
    if (error) { setMsg('❌ 저장 실패: ' + error.message); return; }
    setMsg(editId ? '✅ 수정 완료' : '✅ 배너 추가 완료');
    setForm(EMPTY); setEditId(null);
    load();
  };

  /* ── 삭제 ── */
  const del = async (id: string) => {
    if (!confirm('삭제하시겠습니까?')) return;
    await supabase.from('banners').delete().eq('id', id);
    load();
  };

  /* ── 활성/비활성 토글 ── */
  const toggle = async (id: string, cur: boolean) => {
    await supabase.from('banners').update({ is_active: !cur }).eq('id', id);
    load();
  };

  /* ── 순서 변경 ── */
  const reorder = async (id: string, dir: 'up' | 'down') => {
    const idx = banners.findIndex(b => b.id === id);
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target < 0 || target >= banners.length) return;
    const a = banners[idx], b2 = banners[target];
    await supabase.from('banners').update({ sort_order: b2.sort_order }).eq('id', a.id);
    await supabase.from('banners').update({ sort_order: a.sort_order }).eq('id', b2.id);
    load();
  };

  /* ── 수정 시작 ── */
  const startEdit = (b: Banner) => {
    setEditId(b.id);
    const { id, ...rest } = b;
    setForm(rest);
    window.scrollTo(0, 0);
  };

  /* ── 로그인 화면 ── */
  if (!auth) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow w-80">
        <h1 className="text-xl font-bold text-center mb-6 text-[#1A2B4A]">🎨 배너 관리자</h1>
        <input
          type="password" placeholder="관리자 비밀번호"
          className="w-full border rounded-lg px-4 py-2 mb-4 text-sm"
          value={pw} onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && pw === ADMIN_PW && setAuth(true)}
        />
        <button
          onClick={() => pw === ADMIN_PW ? setAuth(true) : setMsg('❌ 비밀번호 오류')}
          className="w-full bg-[#1A2B4A] text-white rounded-lg py-2 text-sm font-semibold"
        >로그인</button>
        {msg && <p className="text-red-500 text-xs mt-2 text-center">{msg}</p>}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-[#1A2B4A]">🎨 배너 관리</h1>
        <span className="text-xs text-gray-400">damdatravel 앱 홈 배너</span>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          {msg}
        </div>
      )}

      {/* ── 등록 / 수정 폼 ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="font-bold text-[#1A2B4A] mb-4">{editId ? '✏️ 배너 수정' : '➕ 새 배너 추가'}</h2>

        {/* 이미지 업로드 */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-500 mb-1">배너 이미지</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200 disabled:opacity-50"
            >
              {uploading ? '업로드 중...' : '📁 이미지 선택'}
            </button>
            {form.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image_url} alt="preview" className="h-16 rounded-lg object-cover" />
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={e => e.target.files?.[0] && uploadImage(e.target.files[0])} />
          {form.image_url && (
            <input
              className="mt-2 w-full border rounded px-3 py-1 text-xs text-gray-500"
              value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
              placeholder="또는 이미지 URL 직접 입력"
            />
          )}
        </div>

        {/* 제목 / 부제목 */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          {(['ko', 'en', 'ja', 'zh'] as const).map(lang => (
            <div key={lang}>
              <label className="block text-xs text-gray-400 mb-1">제목 ({lang.toUpperCase()})</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm"
                value={(form as any)[`title_${lang}`]}
                onChange={e => setForm(f => ({ ...f, [`title_${lang}`]: e.target.value }))}
              />
              <input className="w-full border rounded-lg px-3 py-1 text-xs mt-1 text-gray-500"
                placeholder={`부제목 (${lang.toUpperCase()})`}
                value={(form as any)[`sub_${lang}`]}
                onChange={e => setForm(f => ({ ...f, [`sub_${lang}`]: e.target.value }))}
              />
            </div>
          ))}
        </div>

        {/* 링크 / 설정 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">클릭 링크 URL (선택)</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="https://..."
              value={form.link_url ?? ''}
              onChange={e => setForm(f => ({ ...f, link_url: e.target.value || null }))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">게시 시작일 (선택)</label>
            <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.starts_at?.slice(0, 16) ?? ''}
              onChange={e => setForm(f => ({ ...f, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1">게시 종료일 (선택)</label>
            <input type="datetime-local" className="w-full border rounded-lg px-3 py-2 text-sm"
              value={form.ends_at?.slice(0, 16) ?? ''}
              onChange={e => setForm(f => ({ ...f, ends_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={save} disabled={saving}
            className="px-6 py-2 bg-[#1A2B4A] text-white rounded-lg text-sm font-semibold disabled:opacity-50"
          >
            {saving ? '저장 중...' : editId ? '수정 저장' : '배너 추가'}
          </button>
          {editId && (
            <button onClick={() => { setEditId(null); setForm(EMPTY); setMsg(''); }}
              className="px-6 py-2 bg-gray-100 rounded-lg text-sm font-medium">
              취소
            </button>
          )}
        </div>
      </div>

      {/* ── 배너 목록 ── */}
      <div className="space-y-3">
        <h2 className="font-bold text-[#1A2B4A]">📋 배너 목록 ({banners.length}개)</h2>
        {banners.map((b, i) => (
          <div key={b.id} className={`bg-white rounded-2xl border p-4 flex gap-4 items-start ${!b.is_active ? 'opacity-50' : ''}`}>
            {/* 이미지 */}
            <div className="w-28 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {b.image_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={b.image_url} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">이미지 없음</div>
              }
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.is_active ? '활성' : '비활성'}
                </span>
                <span className="text-xs text-gray-400">순서 {b.sort_order}</span>
                {b.link_url && <span className="text-xs text-blue-500">🔗 링크있음</span>}
              </div>
              <p className="font-semibold text-sm text-gray-800 truncate">{b.title_ko}</p>
              <p className="text-xs text-gray-500 truncate">{b.sub_ko}</p>
              {(b.starts_at || b.ends_at) && (
                <p className="text-xs text-gray-400 mt-1">
                  {b.starts_at ? new Date(b.starts_at).toLocaleDateString('ko') : '∞'} ~{' '}
                  {b.ends_at   ? new Date(b.ends_at).toLocaleDateString('ko')   : '∞'}
                </p>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex flex-col gap-1 flex-shrink-0">
              <div className="flex gap-1">
                <button onClick={() => reorder(b.id, 'up')} disabled={i === 0}
                  className="px-2 py-1 text-xs bg-gray-100 rounded disabled:opacity-30">▲</button>
                <button onClick={() => reorder(b.id, 'down')} disabled={i === banners.length - 1}
                  className="px-2 py-1 text-xs bg-gray-100 rounded disabled:opacity-30">▼</button>
              </div>
              <button onClick={() => toggle(b.id, b.is_active)}
                className={`px-3 py-1 text-xs rounded font-medium ${b.is_active ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                {b.is_active ? '비활성화' : '활성화'}
              </button>
              <button onClick={() => startEdit(b)}
                className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded font-medium">수정</button>
              <button onClick={() => del(b.id)}
                className="px-3 py-1 text-xs bg-red-50 text-red-600 rounded font-medium">삭제</button>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            등록된 배너가 없습니다. 위 폼에서 추가해주세요.
          </div>
        )}
      </div>
    </div>
  );
}

'use client'

import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase'

const ADMIN_PW = 'damda2026!'

const STATUS_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  '결제대기': { bg: '#fce7f3', text: '#9d174d', dot: '#9d174d' },
  '접수':     { bg: '#dbeafe', text: '#1d4ed8', dot: '#1d4ed8' },
  '배차완료': { bg: '#e0e7ff', text: '#4338ca', dot: '#4338ca' },
  '수거완료': { bg: '#fef9c3', text: '#a16207', dot: '#a16207' },
  '배송 중':  { bg: '#ffedd5', text: '#c2410c', dot: '#c2410c' },
  '배송완료': { bg: '#dcfce7', text: '#15803d', dot: '#15803d' },
  '취소':     { bg: '#fee2e2', text: '#dc2626', dot: '#dc2626' },
}

type Booking = {
  id: string
  booking_no: string
  guest_name: string
  guest_phone: string
  origin: string
  destination: string
  pickup_date: string
  pickup_time: string
  bag_count: number
  price: number
  status: string
  driver_name?: string
}

type ChatRoom = {
  id: string
  room_type: string
  status: string
  created_at: string
  customer_name?: string
  last_message?: string
  last_message_at?: string
  unread_count: number
}

type ChatMessage = {
  id: string
  sender_type: string
  original_text: string
  created_at: string
  read_at?: string | null
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [tab, setTab] = useState<'calendar' | 'schedule' | 'chat'>('calendar')

  // 예약
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)

  // 채팅
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([])
  const [loadingChat, setLoadingChat] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null)
  const [roomMessages, setRoomMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [sendingChat, setSendingChat] = useState(false)
  const [adminUserId, setAdminUserId] = useState<string | null>(null)

  // 스케줄표 필터
  const [scheduleStatus, setScheduleStatus] = useState<string>('전체')
  const [scheduleSearch, setScheduleSearch] = useState('')

  const now = new Date()
  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const today = now.toISOString().slice(0, 10)

  // 예약 로드
  useEffect(() => {
    if (!auth) return
    setLoadingBookings(true)
    supabase
      .from('bookings')
      .select('*, users!bookings_driver_id_fkey(name)')
      .order('pickup_date', { ascending: true })
      .then(({ data }) => {
        const mapped = (data ?? []).map((b: any) => ({
          ...b,
          driver_name: b.users?.name ?? null,
        }))
        setBookings(mapped)
        setLoadingBookings(false)
      })
  }, [auth])

  // 채팅 로드
  useEffect(() => {
    if (!auth) return
    loadChatRooms()
    // 현재 로그인한 관리자 ID
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setAdminUserId(data.user.id)
    })
  }, [auth])

  const loadChatRooms = async () => {
    setLoadingChat(true)
    const { data: rooms } = await supabase
      .from('chat_rooms')
      .select('*')
      .order('created_at', { ascending: false })

    if (!rooms) { setLoadingChat(false); return }

    const enriched = await Promise.all(rooms.map(async (room: any) => {
      // 마지막 메시지
      const { data: msgs } = await supabase
        .from('chat_messages')
        .select('original_text, created_at, sender_type, read_at')
        .eq('room_id', room.id)
        .order('created_at', { ascending: false })
        .limit(1)

      // 안읽은 고객 메시지 수
      const { count } = await supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('room_id', room.id)
        .eq('sender_type', 'customer')
        .is('read_at', null)

      const lastMsg = msgs?.[0]
      return {
        id: room.id,
        room_type: room.room_type ?? 'admin',
        status: room.status ?? 'active',
        created_at: room.created_at,
        customer_name: room.customer_name ?? null,
        last_message: lastMsg?.original_text ?? '',
        last_message_at: lastMsg?.created_at ?? room.created_at,
        unread_count: count ?? 0,
      } as ChatRoom
    }))

    setChatRooms(enriched.sort((a, b) =>
      new Date(b.last_message_at!).getTime() - new Date(a.last_message_at!).getTime()
    ))
    setLoadingChat(false)
  }

  const openRoom = async (room: ChatRoom) => {
    setSelectedRoom(room)
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true })
    setRoomMessages(data ?? [])

    // 읽음 처리
    await supabase
      .from('chat_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('room_id', room.id)
      .eq('sender_type', 'customer')
      .is('read_at', null)

    setChatRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r))
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedRoom || sendingChat) return
    setSendingChat(true)
    const text = chatInput.trim()
    setChatInput('')
    const { data } = await supabase
      .from('chat_messages')
      .insert({
        room_id: selectedRoom.id,
        sender_type: 'admin',
        sender_id: adminUserId,
        original_text: text,
        sender_lang: 'ko',
      })
      .select('*')
      .single()
    if (data) setRoomMessages(prev => [...prev, data])
    setSendingChat(false)
  }

  // 날짜별 예약
  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {}
    bookings.forEach(b => {
      if (!b.pickup_date) return
      if (!map[b.pickup_date]) map[b.pickup_date] = []
      map[b.pickup_date].push(b)
    })
    return map
  }, [bookings])

  const dayBookings = selectedDate ? (bookingsByDate[selectedDate] ?? []) : []
  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)

  // 스케줄표 필터
  const filteredSchedule = useMemo(() => {
    return bookings.filter(b => {
      const matchStatus = scheduleStatus === '전체' || b.status === scheduleStatus
      const matchSearch = !scheduleSearch ||
        b.guest_name?.includes(scheduleSearch) ||
        b.booking_no?.includes(scheduleSearch) ||
        b.guest_phone?.includes(scheduleSearch)
      return matchStatus && matchSearch
    })
  }, [bookings, scheduleStatus, scheduleSearch])

  // 로그인 화면
  if (!auth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow p-8 w-80">
          <h1 className="text-xl font-bold text-[#1A2B4A] mb-6 text-center">담다 관리자</h1>
          <input
            type="password"
            placeholder="관리자 비밀번호"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pw === ADMIN_PW && setAuth(true)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm mb-4 focus:outline-none focus:ring-2 focus:ring-[#1A2B4A]"
          />
          <button
            onClick={() => pw === ADMIN_PW ? setAuth(true) : alert('비밀번호가 틀렸습니다.')}
            className="w-full bg-[#1A2B4A] text-white py-3 rounded-lg font-bold text-sm"
          >
            로그인
          </button>
        </div>
      </div>
    )
  }

  const monthNames = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월']
  const dayNames = ['일','월','화','수','목','금','토']
  const totalUnread = chatRooms.reduce((s, r) => s + r.unread_count, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-[#1A2B4A] text-white px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">담다 관리자</h1>
        <div className="flex gap-4 text-sm">
          <a href="/admin/qa" className="opacity-70 hover:opacity-100">Q&A 관리</a>
          <a href="/admin/banners" className="opacity-70 hover:opacity-100">배너 관리</a>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-200 px-6 flex gap-0">
        {([
          { key: 'calendar', label: '📅 예약캘린더' },
          { key: 'schedule', label: '📋 스케줄표' },
          { key: 'chat',     label: `💬 채팅관리${totalUnread > 0 ? ` (${totalUnread})` : ''}` },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
              tab === t.key
                ? 'border-[#1A2B4A] text-[#1A2B4A]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── 예약 캘린더 탭 ── */}
      {tab === 'calendar' && (
        <div className="max-w-5xl mx-auto px-4 py-6 flex gap-6 flex-col lg:flex-row">
          {/* 캘린더 */}
          <div className="bg-white rounded-2xl shadow p-4 lg:w-96 flex-shrink-0">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => { if (viewMonth === 0) { setViewYear(y => y-1); setViewMonth(11) } else setViewMonth(m => m-1) }}
                className="p-2 rounded-lg hover:bg-gray-100 text-[#1A2B4A] font-bold text-lg">‹</button>
              <span className="font-bold text-[#1A2B4A]">{viewYear}년 {monthNames[viewMonth]}</span>
              <button onClick={() => { if (viewMonth === 11) { setViewYear(y => y+1); setViewMonth(0) } else setViewMonth(m => m+1) }}
                className="p-2 rounded-lg hover:bg-gray-100 text-[#1A2B4A] font-bold text-lg">›</button>
            </div>
            <div className="grid grid-cols-7 mb-1">
              {dayNames.map(d => <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-1">
              {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dateStr = `${viewYear}-${String(viewMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
                const dayBks = bookingsByDate[dateStr] ?? []
                const isToday = dateStr === today
                const isSelected = dateStr === selectedDate
                const statuses = [...new Set(dayBks.map(b => b.status))]
                return (
                  <button key={day} onClick={() => setSelectedDate(dateStr)}
                    className={`relative flex flex-col items-center rounded-xl py-1 px-0.5 transition
                      ${isSelected ? 'bg-[#1A2B4A] text-white' : isToday ? 'bg-blue-50 text-[#1A2B4A]' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <span className={`text-sm font-semibold ${isSelected ? 'text-white' : isToday ? 'text-[#1A2B4A] font-bold' : ''}`}>{day}</span>
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {statuses.slice(0,3).map(st => (
                        <span key={st} className="w-1.5 h-1.5 rounded-full inline-block"
                          style={{ backgroundColor: isSelected ? '#fff' : (STATUS_COLOR[st]?.dot ?? '#9ca3af') }} />
                      ))}
                    </div>
                    {dayBks.length > 0 && (
                      <span className={`text-[10px] font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-[#1A2B4A]'}`}>{dayBks.length}건</span>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
              {Object.entries(STATUS_COLOR).map(([st, { bg, text }]) => (
                <span key={st} className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: bg, color: text }}>{st}</span>
              ))}
            </div>
          </div>

          {/* 예약 목록 */}
          <div className="flex-1">
            {loadingBookings ? (
              <div className="text-center text-gray-400 py-20">불러오는 중...</div>
            ) : selectedDate ? (
              <>
                <h2 className="text-base font-bold text-[#1A2B4A] mb-3">📅 {selectedDate} 예약 {dayBookings.length}건</h2>
                {dayBookings.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow">이 날 예약이 없습니다.</div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {dayBookings.map(b => {
                      const sc = STATUS_COLOR[b.status] ?? { bg: '#f3f4f6', text: '#374151' }
                      return (
                        <button key={b.id} onClick={() => setSelectedBooking(b)}
                          className="bg-white rounded-xl shadow p-4 text-left hover:shadow-md transition">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-sm text-[#1A2B4A]">{b.booking_no}</span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: sc.bg, color: sc.text }}>{b.status}</span>
                          </div>
                          <p className="text-sm text-gray-600">{b.guest_name} · {b.guest_phone}</p>
                          <p className="text-sm text-gray-500 truncate">{b.origin} → {b.destination}</p>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs text-gray-400">{b.pickup_time}</span>
                            {b.driver_name && <span className="text-xs text-gray-500">🚗 {b.driver_name}</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl p-12 text-center text-gray-400 shadow">
                <p className="text-4xl mb-3">📅</p>
                <p>캘린더에서 날짜를 선택하면<br />예약 목록이 표시됩니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 스케줄표 탭 ── */}
      {tab === 'schedule' && (
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* 필터 */}
          <div className="flex flex-wrap gap-3 mb-4 items-center">
            <input
              type="text"
              placeholder="이름/예약번호/전화번호 검색"
              value={scheduleSearch}
              onChange={e => setScheduleSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B4A] w-56"
            />
            <div className="flex gap-2 flex-wrap">
              {['전체', ...Object.keys(STATUS_COLOR)].map(s => (
                <button key={s} onClick={() => setScheduleStatus(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    scheduleStatus === s
                      ? 'bg-[#1A2B4A] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#1A2B4A]'
                  }`}
                  style={scheduleStatus !== s && STATUS_COLOR[s] ? { backgroundColor: STATUS_COLOR[s].bg, color: STATUS_COLOR[s].text, borderColor: 'transparent' } : {}}>
                  {s}
                </button>
              ))}
            </div>
            <span className="text-sm text-gray-400 ml-auto">{filteredSchedule.length}건</span>
          </div>

          {/* 테이블 */}
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1A2B4A] text-white text-xs">
                    <th className="px-3 py-3 text-left font-semibold">예약번호</th>
                    <th className="px-3 py-3 text-left font-semibold">날짜/시간</th>
                    <th className="px-3 py-3 text-left font-semibold">고객</th>
                    <th className="px-3 py-3 text-left font-semibold">출발지</th>
                    <th className="px-3 py-3 text-left font-semibold">목적지</th>
                    <th className="px-3 py-3 text-center font-semibold">캐리어</th>
                    <th className="px-3 py-3 text-right font-semibold">금액</th>
                    <th className="px-3 py-3 text-center font-semibold">상태</th>
                    <th className="px-3 py-3 text-left font-semibold">기사</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingBookings ? (
                    <tr><td colSpan={9} className="text-center py-10 text-gray-400">불러오는 중...</td></tr>
                  ) : filteredSchedule.length === 0 ? (
                    <tr><td colSpan={9} className="text-center py-10 text-gray-400">예약이 없습니다.</td></tr>
                  ) : filteredSchedule.map((b, idx) => {
                    const sc = STATUS_COLOR[b.status] ?? { bg: '#f3f4f6', text: '#374151' }
                    const isToday = b.pickup_date === today
                    return (
                      <tr key={b.id}
                        onClick={() => setSelectedBooking(b)}
                        className={`border-t border-gray-100 cursor-pointer hover:bg-blue-50 transition ${
                          isToday ? 'bg-yellow-50' : idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}>
                        <td className="px-3 py-2.5 font-mono text-xs text-[#1A2B4A] font-bold">{b.booking_no}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className={`font-semibold ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>{b.pickup_date}</div>
                          <div className="text-gray-400 text-xs">{b.pickup_time}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-gray-800">{b.guest_name}</div>
                          <div className="text-gray-400 text-xs">{b.guest_phone}</div>
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 max-w-[140px] truncate">{b.origin}</td>
                        <td className="px-3 py-2.5 text-gray-600 max-w-[140px] truncate">{b.destination}</td>
                        <td className="px-3 py-2.5 text-center text-gray-700">{b.bag_count}개</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-gray-800">{(b.price ?? 0).toLocaleString()}원</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                            style={{ backgroundColor: sc.bg, color: sc.text }}>{b.status}</span>
                        </td>
                        <td className="px-3 py-2.5 text-gray-600 text-xs">{b.driver_name ?? '-'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── 채팅관리 탭 ── */}
      {tab === 'chat' && (
        <div className="max-w-5xl mx-auto px-4 py-6 flex gap-4 h-[calc(100vh-120px)]">
          {/* 채팅방 목록 */}
          <div className="w-72 flex-shrink-0 bg-white rounded-2xl shadow overflow-y-auto">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <span className="font-bold text-[#1A2B4A] text-sm">채팅방 목록</span>
              <button onClick={loadChatRooms} className="text-xs text-gray-400 hover:text-[#1A2B4A]">새로고침</button>
            </div>
            {loadingChat ? (
              <div className="text-center text-gray-400 py-10 text-sm">불러오는 중...</div>
            ) : chatRooms.length === 0 ? (
              <div className="text-center text-gray-400 py-10 text-sm">채팅방이 없습니다.</div>
            ) : chatRooms.map(room => (
              <button key={room.id} onClick={() => openRoom(room)}
                className={`w-full px-4 py-3 text-left border-b border-gray-50 hover:bg-gray-50 transition ${
                  selectedRoom?.id === room.id ? 'bg-blue-50' : ''
                }`}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-semibold text-gray-500">
                    {room.room_type === 'driver' ? '🚗 기사채팅' : '👤 고객센터'}
                  </span>
                  {room.unread_count > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {room.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-700 font-semibold truncate">
                  {room.customer_name ?? '고객'}
                </p>
                <p className="text-xs text-gray-400 truncate mt-0.5">
                  {room.last_message?.startsWith('[img]') ? '📷 이미지' :
                   room.last_message?.startsWith('[location]') ? '📍 위치' :
                   room.last_message || '메시지 없음'}
                </p>
                <p className="text-[10px] text-gray-300 mt-1">
                  {room.last_message_at ? new Date(room.last_message_at).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                </p>
              </button>
            ))}
          </div>

          {/* 채팅 내용 */}
          <div className="flex-1 bg-white rounded-2xl shadow flex flex-col overflow-hidden">
            {!selectedRoom ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p>채팅방을 선택하세요</p>
                </div>
              </div>
            ) : (
              <>
                {/* 채팅 헤더 */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                  <span className="font-bold text-[#1A2B4A] text-sm">
                    {selectedRoom.room_type === 'driver' ? '🚗' : '👤'} {selectedRoom.customer_name ?? '고객'}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    selectedRoom.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>{selectedRoom.status === 'active' ? '진행중' : '종료'}</span>
                </div>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                  {roomMessages.map(msg => {
                    const isMine = msg.sender_type === 'admin'
                    const text = msg.original_text
                    const displayText = text.startsWith('[img]') ? '📷 이미지' :
                      text.startsWith('[location]') ? '📍 위치 공유' : text
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-1`}>
                        {!isMine && (
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {msg.sender_type === 'driver' ? '🚗' : '👤'}
                          </div>
                        )}
                        {isMine && !msg.read_at && (
                          <span className="text-xs text-yellow-600 font-bold mb-1">1</span>
                        )}
                        <div className={`max-w-[65%] rounded-2xl px-3 py-2 text-sm ${
                          isMine ? 'bg-[#1A2B4A] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                        }`}>
                          <p>{displayText}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 입력창 */}
                <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                    placeholder="메시지 입력..."
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A2B4A]"
                  />
                  <button onClick={sendChatMessage} disabled={!chatInput.trim() || sendingChat}
                    className="bg-[#1A2B4A] text-white px-4 py-2 rounded-xl text-sm font-bold disabled:opacity-40">
                    전송
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 예약 상세 모달 */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-[#1A2B4A]">예약 상세</h3>
              <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            {(() => {
              const b = selectedBooking
              const sc = STATUS_COLOR[b.status] ?? { bg: '#f3f4f6', text: '#374151' }
              return (
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-[#1A2B4A]">{b.booking_no}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: sc.bg, color: sc.text }}>{b.status}</span>
                  </div>
                  <p>👤 {b.guest_name} · {b.guest_phone}</p>
                  <p>📍 {b.origin}</p>
                  <p>🏁 {b.destination}</p>
                  <p>📅 {b.pickup_date} {b.pickup_time}</p>
                  <p>🧳 캐리어 {b.bag_count}개</p>
                  <p>💰 {(b.price ?? 0).toLocaleString()}원</p>
                  {b.driver_name && <p>🚗 배차기사: {b.driver_name}</p>}
                </div>
              )
            })()}
            <button onClick={() => setSelectedBooking(null)}
              className="mt-6 w-full bg-[#1A2B4A] text-white py-3 rounded-xl font-bold text-sm">닫기</button>
          </div>
        </div>
      )}
    </div>
  )
}

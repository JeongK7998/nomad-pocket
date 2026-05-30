'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { IndicatorBar, type ExchangeRateItem } from './IndicatorBar'
import { UserSelectScreen } from './UserSelectScreen'
import { getCurrencies } from '@/lib/api'
import { getProfiles } from '@/lib/api/users'
import { fetchKrwRates } from '@/lib/exchangeRate'
import { supabase } from '@/lib/supabase'
import { getNotificationAck, getNotificationSnooze, setNotificationAck, setNotificationSnooze } from '@/lib/notifications'
import {
  getCurrentUser,
  hasAuthenticatedAccess,
  clearAccessSession,
  setCurrentUser as persistCurrentUser,
  type UserSession,
} from '@/lib/userContext'
import type { Profile, Transaction } from '@/types/database'

const FONT = "font-['Pretendard_Variable',sans-serif]"

function toHHMM(isoOrNull: string | null): string {
  const d = isoOrNull ? new Date(isoOrNull) : new Date()
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [rateItems,   setRateItems]   = useState<ExchangeRateItem[]>([])
  const [lastUpdated, setLastUpdated] = useState<string | undefined>(undefined)
  const [availableUsers, setAvailableUsers] = useState<UserSession[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState<Array<Transaction & { authorName: string; authorColor?: string | null }>>([])
  const [notificationOpen, setNotificationOpen] = useState(false)
  const autoOpenedNotificationUserId = useRef<string | null>(null)

  // 사용자 상태: 'loading' | null(미설정) | UserSession
  const [currentUser, setCurrentUser] = useState<UserSession | null | 'loading'>('loading')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | 'loading'>('loading')

  // 마운트 시 localStorage에서 현재 사용자 로드
  useEffect(() => {
    setCurrentUser(getCurrentUser())
    setIsAuthenticated(hasAuthenticatedAccess())
  }, [])

  const handleUserSelect = useCallback((user: UserSession) => {
    setCurrentUser(user)
    setIsAuthenticated(true)
  }, [])

  useEffect(() => {
    if (!currentUser || currentUser === 'loading' || !isAuthenticated || isAuthenticated === 'loading') return
    getProfiles()
      .then((profiles) => {
        setAvailableUsers(
          profiles.map((profile) => ({
            id: profile.id,
            name: profile.name,
            color: profile.color ?? undefined,
          })),
        )
      })
      .catch(() => setAvailableUsers([]))
  }, [currentUser, isAuthenticated])

  useEffect(() => {
    if (!currentUser || currentUser === 'loading' || !isAuthenticated || isAuthenticated === 'loading') return
    const activeUser = currentUser
    autoOpenedNotificationUserId.current = null

    async function loadNotifications() {
      try {
        const ack = getNotificationAck(activeUser.id)
        const snooze = getNotificationSnooze(activeUser.id)
        const [profilesRes, txRes] = await Promise.all([
          getProfiles(),
          supabase
            .from('transactions')
            .select('*')
            .neq('user_id', activeUser.id)
            .not('user_id', 'is', null)
            .order('created_at', { ascending: false })
            .limit(20),
        ])

        const profiles = profilesRes as Profile[]
        const profileMap = Object.fromEntries(profiles.map((profile) => [profile.id, profile]))
        const rows = ((txRes.data ?? []) as Transaction[])
          .filter((tx) => !ack || tx.created_at > ack)
          .filter((tx) => !snooze || tx.created_at > snooze)
          .map((tx) => ({
            ...tx,
            authorName: profileMap[tx.user_id ?? '']?.name ?? '다른 사용자',
            authorColor: profileMap[tx.user_id ?? '']?.color ?? null,
          }))

        setUnreadNotifications(rows)
        if (rows.length > 0 && autoOpenedNotificationUserId.current !== activeUser.id) {
          setNotificationOpen(true)
          autoOpenedNotificationUserId.current = activeUser.id
        }
      } catch {
        setUnreadNotifications([])
      }
    }

    loadNotifications()
  }, [currentUser, isAuthenticated])

  useEffect(() => {
    if (!currentUser || currentUser === 'loading') return
    async function loadRates() {
      try {
        const currencies   = await getCurrencies(true)
        const foreignCodes = currencies.map((c) => c.code).filter((c) => c !== 'KRW')
        if (foreignCodes.length === 0) return
        const { rates, updatedAt } = await fetchKrwRates(foreignCodes)
        const items = foreignCodes
          .filter((code) => rates[code] !== undefined)
          .map((code) => ({ code, rate: rates[code] }))
        setRateItems(items)
        setLastUpdated(toHHMM(updatedAt))
      } catch { /* 환율 조회 실패 시 무표시 */ }
    }
    loadRates()
  }, [currentUser])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 768) setDrawerOpen(false)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 로딩 중 (hydration 전 blank)
  if (currentUser === 'loading' || isAuthenticated === 'loading') {
    return <div className="bg-[#f4f4f7] w-full h-dvh" />
  }

  // 사용자 미설정 → 사용자 선택 화면
  if (!currentUser || !isAuthenticated) {
    return <UserSelectScreen onSelect={handleUserSelect} />
  }

  function handleCycleUser() {
    if (!currentUser || currentUser === 'loading' || availableUsers.length <= 1) return
    const currentIndex = availableUsers.findIndex((user) => user.id === currentUser.id)
    const nextUser = availableUsers[(currentIndex + 1) % availableUsers.length] ?? availableUsers[0]
    persistCurrentUser(nextUser)
    setCurrentUser(nextUser)
    window.location.reload()
  }

  function handleLogout() {
    clearAccessSession()
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  const currentUserNumber = Math.max(1, availableUsers.findIndex((user) => user.id === currentUser.id) + 1)

  function handleConfirmNotifications() {
    if (!currentUser || currentUser === 'loading') return
    const latestSeen = unreadNotifications[0]?.created_at ?? new Date().toISOString()
    setNotificationAck(currentUser.id, latestSeen)
    setUnreadNotifications([])
    setNotificationOpen(false)
  }

  function handleSnoozeNotifications() {
    if (!currentUser || currentUser === 'loading') return
    const latestSeen = unreadNotifications[0]?.created_at ?? new Date().toISOString()
    setNotificationSnooze(currentUser.id, latestSeen)
    setNotificationOpen(false)
  }

  return (
    <div className="bg-[#f4f4f7] relative w-full h-dvh overflow-hidden">
      <div className="mobile-landscape-guard fixed inset-0 z-[200] hidden items-center justify-center bg-[#f4f4f7] px-[28px] text-center">
        <div className="max-w-[280px]">
          <p className={`${FONT} text-[22px] font-bold text-[#18202a]`}>세로 모드로 사용해 주세요</p>
          <p className={`${FONT} mt-[10px] text-[14px] leading-[1.6] text-[#6c7b8e]`}>
            모바일에서는 가로 모드를 지원하지 않습니다. 기기를 세로로 돌리면 계속 사용할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="tablet-portrait-guard fixed inset-0 z-[200] hidden items-center justify-center bg-[#f4f4f7] px-[28px] text-center">
        <div className="max-w-[320px]">
          <p className={`${FONT} text-[24px] font-bold text-[#18202a]`}>가로 모드로 사용해 주세요</p>
          <p className={`${FONT} mt-[10px] text-[15px] leading-[1.6] text-[#6c7b8e]`}>
            태블릿 버전은 가로 레이아웃에 맞춰 설계되었습니다. 기기를 가로로 돌리면 계속 사용할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="mobile-landscape-blocked tablet-portrait-blocked">
        <Sidebar
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          currentUser={currentUser}
          currentUserNumber={currentUserNumber}
          canCycleUser={availableUsers.length > 1}
          onCycleUser={handleCycleUser}
          onLogout={handleLogout}
        />

        {drawerOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setDrawerOpen(false)}
          />
        )}

        <div className="absolute inset-0 md:left-[256px] flex flex-col overflow-hidden">

          <div className="flex md:hidden h-[52px] flex-shrink-0 items-center justify-between px-[16px] bg-[#f4f4f7] z-20">
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-[36px] h-[36px] flex items-center justify-center rounded-[8px] hover:bg-black/5 active:bg-black/10 transition-colors"
            >
              <Menu size={22} className="text-[#18202a]" />
            </button>
            <span className={`${FONT} font-extrabold text-[16px] text-[#004ea7] tracking-[-0.5px]`}>
              NOMAD_POCKET
            </span>
            <div className="w-[36px]" />
          </div>

          <div className="hidden md:block">
            <IndicatorBar
              rates={rateItems}
              lastUpdated={lastUpdated}
              unreadCount={unreadNotifications.length}
              onOpenNotifications={() => {
                if (unreadNotifications.length > 0) setNotificationOpen(true)
              }}
            />
          </div>

          <div key={pathname} className="flex-1 overflow-hidden">
            {children}
          </div>
        </div>
      </div>

      {notificationOpen && unreadNotifications.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,32,42,0.45)] p-[24px]">
          <div className="w-full max-w-[560px] rounded-[24px] bg-white p-[28px] shadow-[0px_24px_60px_0px_rgba(25,28,30,0.18)]">
            <div className="mb-[18px] flex items-start justify-between gap-[16px]">
              <div>
                <h2 className={`${FONT} text-[18px] font-bold text-[#18202a]`}>최근 다른 사용자 입력 내역</h2>
                <p className={`${FONT} mt-[4px] text-[12px] text-[#6c7b8e]`}>확인하면 알림이 정리됩니다.</p>
              </div>
              <button onClick={handleSnoozeNotifications} className={`${FONT} text-[12px] font-semibold text-[#6c7b8e] hover:text-[#18202a]`}>
                닫기
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto rounded-[16px] border border-[#eef1f6]">
              {unreadNotifications.map((item, index) => (
                <div key={item.id} className={`flex items-center gap-[12px] px-[16px] py-[14px] ${index < unreadNotifications.length - 1 ? 'border-b border-[#eef1f6]' : ''}`}>
                  <div
                    style={{ backgroundColor: item.authorColor ?? '#004ea7' }}
                    className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] text-[12px] font-bold text-white"
                  >
                    {item.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`${FONT} truncate text-[13px] font-semibold text-[#18202a]`}>
                      {item.authorName} · {item.description}
                    </p>
                    <p className={`${FONT} mt-[3px] text-[11px] text-[#6c7b8e]`}>
                      {item.date} · {item.type === 'expense' ? '지출' : '수입'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`${FONT} text-[12px] font-bold ${item.type === 'expense' ? 'text-[#d40000]' : 'text-[#2d7a00]'}`}>
                      ₩{Number(item.amount).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-[18px] flex justify-end gap-[8px]">
              <button onClick={handleSnoozeNotifications} className={`${FONT} rounded-[10px] bg-[#f4f4f7] px-[16px] py-[10px] text-[13px] font-semibold text-[#6c7b8e]`}>
                나중에 보기
              </button>
              <button onClick={handleConfirmNotifications} className={`${FONT} rounded-[10px] bg-[#004ea7] px-[16px] py-[10px] text-[13px] font-semibold text-white`}>
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
